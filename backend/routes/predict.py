import os
import io
import uuid
import logging
import datetime
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from utils.preprocess import predict_disease
from utils.llm_explainer import explain_disease
from utils.gridfs_helper import save_file as gfs_save
from bson import ObjectId
from pymongo import ReturnDocument
from flask_jwt_extended import get_jwt_identity, jwt_required

logger = logging.getLogger(__name__)

predict_bp = Blueprint('predict', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@predict_bp.route('/', methods=['POST'])
@jwt_required(optional=True)
def predict():
    if 'file' not in request.files:
        return jsonify({"message": "No file part"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"message": "No selected file"}), 400

    # ── Validate file extension ──────────────────────────────────────────────
    filename = secure_filename(file.filename)
    if not allowed_file(filename):
        return jsonify({"message": "File type not allowed. Use PNG, JPG, or JPEG."}), 400

    # ── Validate file size BEFORE saving ────────────────────────────────────
    if request.content_length and request.content_length > current_app.config['MAX_CONTENT_LENGTH']:
        return jsonify({"message": "File too large. Maximum size is 20MB."}), 413

    user_id = get_jwt_identity()
    db = current_app.db

    # ── Token check (logged-in users only) ──────────────────────────────────
    if user_id:
        user = db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            return jsonify({"message": "User not found"}), 404

        current_tokens = user.get('tokens', 0)
        if current_tokens <= 0:
            return jsonify({
                "error": "No tokens left. Please add tokens to continue."
            }), 403

    # ── Read file bytes into memory ──────────────────────────────────────────
    file_bytes = file.read()
    file_ext = filename.rsplit('.', 1)[1].lower()
    unique_id = str(uuid.uuid4())
    safe_filename = f"{unique_id}.{file_ext}"

    # ── Save to a TEMP file on disk just for the AI model prediction ─────────
    # The model needs a real file path to run inference. We delete it right after.
    tmp_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'uploads', 'tmp')
    os.makedirs(tmp_dir, exist_ok=True)
    tmp_filepath = os.path.join(tmp_dir, safe_filename)

    try:
        with open(tmp_filepath, 'wb') as tmp_file:
            tmp_file.write(file_bytes)
    except Exception as e:
        logger.error(f"Temp file save failed: {e}")
        return jsonify({"message": "Failed to process file"}), 500

    # ── Run AI prediction with error handling ────────────────────────────────
    try:
        prediction, confidence, probabilities = predict_disease(tmp_filepath)
        explanation = explain_disease(prediction)
        logger.info(f"Prediction complete for user {user_id}: {prediction} ({confidence:.2%})")

    except Exception as e:
        logger.error(f"Prediction failed for {tmp_filepath}: {e}")
        return jsonify({
            "message": "AI analysis failed. Please try again with a different image.",
            "error": "prediction_error"
        }), 500

    finally:
        # ── Always delete the temp file after prediction ─────────────────────
        try:
            if os.path.exists(tmp_filepath):
                os.remove(tmp_filepath)
        except Exception as cleanup_err:
            logger.warning(f"Failed to cleanup temp file: {cleanup_err}")

    # ── Save image to GridFS (MongoDB) ────────────────────────────────────────
    content_type_map = {'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'png': 'image/png'}
    content_type = content_type_map.get(file_ext, 'image/jpeg')

    try:
        image_gridfs_id = gfs_save(
            db,
            file_data=file_bytes,
            filename=safe_filename,
            content_type=content_type,
            metadata={"user_id": user_id, "type": "scan_image"}
        )
    except Exception as e:
        logger.error(f"GridFS image save failed: {e}")
        return jsonify({"message": "Failed to store image. Please try again."}), 500

    # ── Deduct 1 token & compute warning ────────────────────────────────────
    tokens_left = None
    warning = None
    if user_id:
        result = db.users.find_one_and_update(
            {"_id": ObjectId(user_id)},
            {"$inc": {"tokens": -1}},
            return_document=ReturnDocument.AFTER
        )
        # Guard against the user being deleted between the check and update
        if result is not None:
            tokens_left = result.get('tokens', 0)
            warning = "Low tokens" if tokens_left <= 5 else None

            # ── Token log entry ──────────────────────────────────────────────────
            db.token_logs.insert_one({
                "user_id": user_id,
                "action": "scan",
                "tokens_used": 1,
                "tokens_after": tokens_left,
                "timestamp": datetime.datetime.utcnow()
            })


    # ── Persist scan record in MongoDB ───────────────────────────────────────
    record_id = str(uuid.uuid4())
    report_data = {
        "report_id": record_id,
        "user_id": user_id,
        "date": datetime.datetime.utcnow(),
        "image_gridfs_id": image_gridfs_id,   # GridFS reference (replaces image_path)
        "image_path": None,                    # Kept for backward compat (null for new records)
        "prediction": prediction,
        "confidence": confidence,
        "probabilities": probabilities,
        "explanation": explanation
    }
    db.history.insert_one(report_data)

    # ── Build response ───────────────────────────────────────────────────────
    report_data.pop('_id', None)
    report_data['date'] = report_data['date'].isoformat()
    if tokens_left is not None:
        report_data['tokens_left'] = tokens_left
    if warning:
        report_data['warning'] = warning

    return jsonify(report_data), 200
