import datetime
from flask import Blueprint, jsonify, request, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from pymongo import ReturnDocument

tokens_bp = Blueprint('tokens', __name__)

TOKENS_PER_PURCHASE = 10  # Simulated fixed purchase amount

@tokens_bp.route('/', methods=['GET'])
@jwt_required()
def get_tokens():
    """Return the current token balance for the logged-in user."""
    user_id = get_jwt_identity()
    db = current_app.db
    user = db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        return jsonify({"message": "User not found"}), 404
    return jsonify({"tokens": user.get('tokens', 0)}), 200


@tokens_bp.route('/add', methods=['POST'])
@jwt_required()
def add_tokens():
    """Simulate a token purchase — adds TOKENS_PER_PURCHASE tokens to the user."""
    user_id = get_jwt_identity()
    db = current_app.db

    updated = db.users.find_one_and_update(
        {"_id": ObjectId(user_id)},
        {"$inc": {"tokens": TOKENS_PER_PURCHASE}},
        return_document=ReturnDocument.AFTER
    )
    if not updated:
        return jsonify({"message": "User not found"}), 404

    new_total = updated.get('tokens', 0)

    # Log the top-up
    db.token_logs.insert_one({
        "user_id": user_id,
        "action": "purchase",
        "tokens_added": TOKENS_PER_PURCHASE,
        "tokens_after": new_total,
        "timestamp": datetime.datetime.utcnow()
    })

    return jsonify({
        "message": "Tokens added successfully",
        "tokens": new_total
    }), 200
