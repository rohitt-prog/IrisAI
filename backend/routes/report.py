import io
import os
import logging
from flask import Blueprint, request, jsonify, send_file, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from utils.pdf_generator import create_pdf_report_bytes
from utils.gridfs_helper import get_file_bytes
from bson import ObjectId

logger = logging.getLogger(__name__)

report_bp = Blueprint('report', __name__)


@report_bp.route('/download-report', methods=['GET'])
def download_report():
    report_id = request.args.get('id')
    if not report_id:
        return jsonify({"message": "Report ID required"}), 400

    db = current_app.db
    report_data = db.history.find_one({"report_id": report_id})
    if not report_data:
        return jsonify({"message": "Report not found"}), 404

    # ── Ownership check ───────────────────────────────────────────────────────
    report_owner = report_data.get('user_id')
    if report_owner:
        try:
            verify_jwt_in_request(optional=False)
            current_user_id = get_jwt_identity()
            if current_user_id != report_owner:
                return jsonify({"message": "Access denied"}), 403
        except Exception:
            return jsonify({"message": "Authentication required to download this report"}), 401

    # ── Resolve patient name ──────────────────────────────────────────────────
    user_name = "Guest User"
    if report_owner:
        try:
            user = db.users.find_one({"_id": ObjectId(report_owner)})
            if user:
                user_name = user.get('name', 'User')
        except Exception:
            pass

    # ── Fetch eye image bytes from GridFS ─────────────────────────────────────
    image_bytes = None
    image_gridfs_id = report_data.get('image_gridfs_id')

    if image_gridfs_id:
        # New record: image is stored in GridFS
        image_bytes = get_file_bytes(db, image_gridfs_id)
        if image_bytes is None:
            logger.warning(f"GridFS image not found for report {report_id} (id={image_gridfs_id})")
    else:
        # Legacy record: image may be on disk (image_path field)
        img_path = report_data.get('image_path')
        if img_path:
            if not os.path.isabs(img_path):
                backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
                img_path = os.path.join(backend_dir, img_path)
            if os.path.exists(img_path):
                with open(img_path, 'rb') as img_file:
                    image_bytes = img_file.read()

    # ── Generate PDF entirely in memory ──────────────────────────────────────
    try:
        pdf_bytes = create_pdf_report_bytes(report_data, user_name, image_bytes=image_bytes)
    except Exception as e:
        logger.error(f"PDF generation error for report {report_id}: {e}")
        return jsonify({"message": "Failed to generate PDF"}), 500

    if not pdf_bytes:
        return jsonify({"message": "Failed to generate PDF"}), 500

    # ── Stream PDF directly from memory — no disk write ───────────────────────
    pdf_stream = io.BytesIO(pdf_bytes)
    pdf_stream.seek(0)

    return send_file(
        pdf_stream,
        mimetype='application/pdf',
        as_attachment=True,
        download_name=f"Eye_Health_Report_{report_id}.pdf"
    )
