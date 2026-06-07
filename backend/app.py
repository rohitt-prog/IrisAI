import os
import logging
import datetime
from flask import Flask, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import certifi
from dotenv import load_dotenv
from flask_jwt_extended import JWTManager
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

# Load routes
from routes.auth import auth_bp
from routes.predict import predict_bp
from routes.chat import chat_bp
from routes.report import report_bp
from routes.history import history_bp
from routes.tokens import tokens_bp
from routes.voice import voice_bp

load_dotenv()

# ── Configure structured logging ────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# Ensure upload folder exists at import time (works with gunicorn, not just __main__)
os.makedirs('uploads', exist_ok=True)

app = Flask(__name__)
# Enable CORS for frontend on any port/origin
CORS(app)

# ── Validate JWT secret at startup ──────────────────────────────────────────
JWT_SECRET = os.getenv("JWT_SECRET_KEY")
if not JWT_SECRET or JWT_SECRET == "super-secret-key-12345":
    raise ValueError(
        "❌ FATAL: JWT_SECRET_KEY must be set in .env file.\n"
        "   Generate a secure key with: python -c \"import secrets; print(secrets.token_hex(32))\""
    )

app.config["MONGO_URI"] = os.getenv("MONGO_URI", "mongodb://localhost:27017/iris_health")
app.config["JWT_SECRET_KEY"] = JWT_SECRET
app.config["MAX_CONTENT_LENGTH"] = 20 * 1024 * 1024  # 20 MB upload limit

jwt = JWTManager(app)

# ── Rate Limiting ────────────────────────────────────────────────────────────
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://",  # Use Redis in production for multi-worker setups
    headers_enabled=True  # Send X-RateLimit headers in responses
)

# ── Connect to MongoDB — fail fast if unavailable ────────────────────────────
try:
    client = MongoClient(
        app.config["MONGO_URI"],
        tlsCAFile=certifi.where(),
        serverSelectionTimeoutMS=5000,
        connectTimeoutMS=5000,
    )
    # Trigger an immediate connection check
    client.admin.command('ping')
    db = client.get_default_database()
    logger.info("✅ MongoDB connected successfully")

except Exception as e:
    logger.error(f"\n{'='*70}")
    logger.error("❌ FATAL ERROR: Cannot connect to MongoDB")
    logger.error(f"{'='*70}")
    logger.error(f"Error: {e}\n")
    logger.error("To fix this:")
    logger.error("  1. Set MONGO_URI in backend/.env")
    logger.error("  2. For local development: mongodb://localhost:27017/iris_health")
    logger.error("  3. For production (FREE): https://www.mongodb.com/atlas")
    logger.error(f"{'='*70}\n")
    exit(1)  # Don't start server without database

app.db = db

# ── Create database indexes for performance ─────────────────────────────────
try:
    # User lookups by email (most common query)
    db.users.create_index("email", unique=True)

    # History queries: users fetch their own history sorted by date
    db.history.create_index([("user_id", 1), ("date", -1)])
    db.history.create_index("report_id", unique=True)

    # Token logs: lookup by user + timestamp
    db.token_logs.create_index([("user_id", 1), ("timestamp", -1)])

    logger.info("✅ Database indexes verified/created")
except Exception as e:
    logger.warning(f"⚠️  Index creation warning (may already exist): {e}")

# ── Validate Gemini API Key (non-fatal warning) ─────────────────────────────
GEMINI_KEY = os.getenv("GEMINI_API_KEY", "")
if not GEMINI_KEY or GEMINI_KEY == "your_gemini_api_key_here":
    logger.warning("\n" + "="*70)
    logger.warning("⚠️  WARNING: GEMINI_API_KEY not properly configured")
    logger.warning("="*70)
    logger.warning("AI-powered explanations and chat will be DISABLED.")
    logger.warning("To enable:")
    logger.warning("  1. Get API key from: https://aistudio.google.com/app/apikey")
    logger.warning("  2. Add to backend/.env: GEMINI_API_KEY=your_actual_key_here")
    logger.warning("="*70 + "\n")

# ── Health Check Endpoint ────────────────────────────────────────────────────
@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for monitoring and load balancers"""

    # Check MongoDB connection
    db_status = "disconnected"
    try:
        if app.db is not None:
            app.db.command('ping')
            db_status = "connected"
    except Exception as e:
        logger.warning(f"Health check: DB ping failed - {e}")

    # Check if ensemble AI models are loaded
    try:
        from utils.preprocess import models as ensemble_models
        loaded = sum(1 for m in ensemble_models if m is not None)
        total  = 3  # DenseNet-121, EfficientNet-B4, ResNet-50
        if loaded == total:
            model_status = f"ensemble loaded ({loaded}/{total})"
        elif loaded > 0:
            model_status = f"partial ensemble ({loaded}/{total})"
        else:
            model_status = "unavailable"
    except Exception:
        model_status = "error"

    # Check Gemini API key
    gemini_key = os.getenv("GEMINI_API_KEY", "")
    gemini_status = "configured" if (gemini_key and gemini_key != "your_gemini_api_key_here") else "missing"

    status = {
        "status": "healthy" if db_status == "connected" else "unhealthy",
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "services": {
            "database": db_status,
            "ai_model": model_status,
            "gemini_api": gemini_status
        }
    }

    http_code = 200 if db_status == "connected" else 503
    return jsonify(status), http_code


# ── Flask CLI cleanup command ────────────────────────────────────────────────
@app.cli.command()
def cleanup():
    """Run file cleanup for old uploads and orphaned reports"""
    from utils.cleanup import cleanup_old_files, cleanup_orphaned_reports

    print("Running file cleanup...")
    cleanup_old_files(days=30)
    cleanup_orphaned_reports()
    print("Cleanup complete!")


# ── Register blueprints ──────────────────────────────────────────────────────
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(predict_bp, url_prefix='/api/predict')
app.register_blueprint(chat_bp, url_prefix='/api')
app.register_blueprint(report_bp, url_prefix='/api/report')
app.register_blueprint(history_bp, url_prefix='/api/history')
app.register_blueprint(tokens_bp, url_prefix='/api/tokens')
app.register_blueprint(voice_bp, url_prefix='/api')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
