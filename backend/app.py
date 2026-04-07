import os
from flask import Flask
from flask_cors import CORS
from pymongo import MongoClient
import certifi
from dotenv import load_dotenv
from flask_jwt_extended import JWTManager

# Load routes
from routes.auth import auth_bp
from routes.predict import predict_bp
from routes.chat import chat_bp
from routes.report import report_bp
from routes.history import history_bp
from routes.tokens import tokens_bp

load_dotenv()

app = Flask(__name__)
# Enable CORS for frontend on any port/origin
CORS(app)

app.config["MONGO_URI"] = os.getenv("MONGO_URI", "mongodb://localhost:27017/iris_health")
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "super-secret-key-12345")

jwt = JWTManager(app)

# Connect to MongoDB with a short timeout so it fails fast if unreachable
try:
    client = MongoClient(
        app.config["MONGO_URI"],
        tlsCAFile=certifi.where(),
        serverSelectionTimeoutMS=5000,   # fail in 5s, not 30s
        connectTimeoutMS=5000,
    )
    # Trigger an immediate connection check
    client.admin.command('ping')
    db = client.get_default_database()
    print("✅ MongoDB connected successfully.")
except Exception as e:
    print(f"⚠️  MongoDB connection failed: {e}")
    print("   → Set MONGO_URI in backend/.env to a valid MongoDB connection string.")
    print("   → FREE option: https://www.mongodb.com/atlas (create free cluster, get connection string)")
    try:
        client = MongoClient(app.config["MONGO_URI"], serverSelectionTimeoutMS=5000)
        db = client["iris_health"]
    except Exception:
        client = None
        db = None
app.db = db

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(predict_bp, url_prefix='/api/predict')
app.register_blueprint(chat_bp, url_prefix='/api')
app.register_blueprint(report_bp, url_prefix='/api/report')
app.register_blueprint(history_bp, url_prefix='/api/history')
app.register_blueprint(tokens_bp, url_prefix='/api/tokens')

if __name__ == '__main__':
    # Ensure upload folder exists
    os.makedirs('uploads', exist_ok=True)
    app.run(host='0.0.0.0', port=5001, debug=True)
