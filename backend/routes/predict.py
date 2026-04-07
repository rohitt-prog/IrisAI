import os
import uuid
import datetime
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from utils.preprocess import predict_disease
from utils.llm_explainer import explain_disease
from bson import ObjectId
from pymongo import ReturnDocument
from flask_jwt_extended import get_jwt_identity, jwt_required

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
        
    if file and allowed_file(file.filename):
        user_id = get_jwt_identity()
        db = current_app.db

        # ── Token check (logged-in users only) ──────────────────────────
        if user_id:
            user = db.users.find_one({"_id": ObjectId(user_id)})
            if not user:
                return jsonify({"message": "User not found"}), 404

            current_tokens = user.get('tokens', 0)
            if current_tokens <= 0:
                return jsonify({
                    "error": "No tokens left. Please add tokens to continue."
                }), 403

        # ── Save & run inference ─────────────────────────────────────────
        filename = secure_filename(file.filename)
        unique_id = str(uuid.uuid4())
        new_filename = f"{unique_id}_{filename}"
        filepath = os.path.join('uploads', new_filename)
        file.save(filepath)
        
        # Predict using AI model
        prediction, confidence, probabilities = predict_disease(filepath)
        
        # Get LLM Explanation
        explanation = explain_disease(prediction)
        
        # ── Deduct 1 token & compute warning ────────────────────────────
        tokens_left = None
        warning = None
        if user_id:
            result = db.users.find_one_and_update(
                {"_id": ObjectId(user_id)},
                {"$inc": {"tokens": -1}},
                return_document=ReturnDocument.AFTER
            )
            tokens_left = result.get('tokens', 0)
            warning = "Low tokens" if tokens_left <= 5 else None

            # ── Token log entry ──────────────────────────────────────────
            db.token_logs.insert_one({
                "user_id": user_id,
                "action": "scan",
                "tokens_used": 1,
                "tokens_after": tokens_left,
                "timestamp": datetime.datetime.utcnow()
            })

        # ── Persist scan record ──────────────────────────────────────────
        record_id = str(uuid.uuid4())
        report_data = {
            "report_id": record_id,
            "user_id": user_id,
            "date": datetime.datetime.utcnow(),
            "image_path": filepath,
            "prediction": prediction,
            "confidence": confidence,
            "probabilities": probabilities,
            "explanation": explanation
        }
        db.history.insert_one(report_data)
        
        # ── Build response ───────────────────────────────────────────────
        report_data.pop('_id', None)
        report_data['date'] = report_data['date'].isoformat()
        if tokens_left is not None:
            report_data['tokens_left'] = tokens_left
        if warning:
            report_data['warning'] = warning
        
        return jsonify(report_data), 200

    return jsonify({"message": "File type not allowed"}), 400
