from flask import Blueprint, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity

history_bp = Blueprint('history', __name__)

@history_bp.route('/', methods=['GET'])
@jwt_required()
def get_history():
    user_id = get_jwt_identity()
    db = current_app.db
    records = list(db.history.find({"user_id": user_id}).sort("date", -1))
    
    for r in records:
        r.pop('_id', None)
        if hasattr(r.get('date'), 'isoformat'):
            r['date'] = r['date'].isoformat()
        else:
            r['date'] = str(r['date'])
            
    return jsonify(records), 200


@history_bp.route('/<report_id>', methods=['DELETE'])
@jwt_required()
def delete_record(report_id):
    """Delete a single history record — only the owner can delete it."""
    user_id = get_jwt_identity()
    db = current_app.db

    result = db.history.delete_one({
        "report_id": report_id,
        "user_id": user_id          # ensures users can't delete others' records
    })

    if result.deleted_count == 0:
        return jsonify({"message": "Record not found or access denied"}), 404

    return jsonify({"message": "Record deleted successfully"}), 200
