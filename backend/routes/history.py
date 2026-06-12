import os
import logging
from flask import Blueprint, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity

logger = logging.getLogger(__name__)

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

    record = db.history.find_one({
        "report_id": report_id,
        "user_id": user_id
    })

    if not record:
        return jsonify({"message": "Record not found or access denied"}), 404

    # Delete the record from DB
    db.history.delete_one({"_id": record["_id"]})

    # Delete associated files (original image, pdf report, and qr code)
    image_path = record.get('image_path')
    if image_path:
        # Resolve relative paths against the backend root (same logic as pdf_generator)
        if not os.path.isabs(image_path):
            backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            image_path = os.path.join(backend_dir, image_path)
        if os.path.exists(image_path):
            try:
                os.remove(image_path)
            except Exception as e:
                logger.warning(f"Failed to delete image file: {e}")

    backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    reports_dir = os.path.join(backend_dir, 'uploads', 'reports')
    pdf_path = os.path.join(reports_dir, f"{report_id}.pdf")
    qr_path = os.path.join(reports_dir, f"qr_{report_id}.png")

    for path in [pdf_path, qr_path]:
        if os.path.exists(path):
            try:
                os.remove(path)
            except Exception as e:
                logger.warning(f"Failed to delete report file: {e}")

    return jsonify({"message": "Record deleted successfully"}), 200
