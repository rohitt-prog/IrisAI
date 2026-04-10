from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import bcrypt
import datetime
from bson import ObjectId

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')

    if not email or not password:
        return jsonify({"message": "Missing email or password"}), 400

    if len(password) < 8:
        return jsonify({"message": "Password must be at least 8 characters long"}), 400

    db = current_app.db
    if db.users.find_one({"email": email}):
        return jsonify({"message": "User already exists"}), 400

    hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    new_user = {
        "name": name,
        "email": email,
        "password": hashed,
        "tokens": 10,
        "created_at": datetime.datetime.utcnow()
    }
    db.users.insert_one(new_user)
    return jsonify({"message": "Signup successful!"}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"message": "Missing email or password"}), 400

    db = current_app.db
    user = db.users.find_one({"email": email})

    if user and bcrypt.checkpw(password.encode('utf-8'), user['password']):
        access_token = create_access_token(identity=str(user['_id']), expires_delta=datetime.timedelta(days=1))
        return jsonify({
            "token": access_token,
            "user": {
                "id": str(user['_id']),
                "name": user.get('name', ''),
                "email": user['email'],
                "tokens": user.get('tokens', 10)
            }
        }), 200

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
