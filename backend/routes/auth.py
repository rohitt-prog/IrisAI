import re
import logging
import datetime
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import bcrypt
from bson import ObjectId

logger = logging.getLogger(__name__)

auth_bp = Blueprint('auth', __name__)

# Email validation regex (RFC 5322 simplified)
EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')


def validate_password(password):
    """Validate password strength"""
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    if not any(c.isdigit() for c in password):
        return False, "Password must contain at least one number"
    if not any(c.isalpha() for c in password):
        return False, "Password must contain at least one letter"
    return True, ""


@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    name = data.get('name', '').strip()

    # ── Validate email ───────────────────────────────────────────────────────
    if not email:
        return jsonify({"message": "Email is required"}), 400

    if not EMAIL_REGEX.match(email):
        return jsonify({"message": "Invalid email format"}), 400

    # ── Validate password ────────────────────────────────────────────────────
    if not password:
        return jsonify({"message": "Password is required"}), 400

    is_valid, error_msg = validate_password(password)
    if not is_valid:
        return jsonify({"message": error_msg}), 400

    # ── Validate name (optional but validate if provided) ────────────────────
    if name and (len(name) < 2 or len(name) > 100):
        return jsonify({"message": "Name must be between 2 and 100 characters"}), 400

    # ── Check if user exists ─────────────────────────────────────────────────
    db = current_app.db
    if db.users.find_one({"email": email}):
        return jsonify({"message": "User already exists"}), 400

    # ── Create user ──────────────────────────────────────────────────────────
    hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    new_user = {
        "name": name,
        "email": email,
        "password": hashed,
        "tokens": 10,
        "created_at": datetime.datetime.utcnow()
    }
    db.users.insert_one(new_user)
    logger.info(f"New user registered: {email}")
    return jsonify({"message": "Signup successful!"}), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({"message": "Missing email or password"}), 400

    db = current_app.db
    user = db.users.find_one({"email": email})

    if user and bcrypt.checkpw(password.encode('utf-8'), user['password']):
        access_token = create_access_token(
            identity=str(user['_id']),
            expires_delta=datetime.timedelta(days=1)
        )
        logger.info(f"User logged in: {email}")
        return jsonify({
            "token": access_token,
            "user": {
                "id": str(user['_id']),
                "name": user.get('name', ''),
                "email": user['email'],
                "tokens": user.get('tokens', 10)
            }
        }), 200

    logger.warning(f"Failed login attempt for: {email}")
    return jsonify({"message": "Invalid credentials"}), 401


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_me():
    user_id = get_jwt_identity()
    db = current_app.db
    user = db.users.find_one({"_id": ObjectId(user_id)})
    if user:
        return jsonify({
            "id": str(user['_id']),
            "name": user.get('name', ''),
            "email": user['email'],
            "tokens": user.get('tokens', 10)
        }), 200
    return jsonify({"message": "User not found"}), 404
