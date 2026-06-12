import os
from flask import Blueprint, request, jsonify, send_file, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from utils.pdf_generator import create_pdf_report
from bson import ObjectId

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

    # ── Ownership check: if the report belongs to a user, verify the requester ──
    report_owner = report_data.get('user_id')
    if report_owner:
        try:
            verify_jwt_in_request(optional=False)
            current_user_id = get_jwt_identity()
            if current_user_id != report_owner:
                return jsonify({"message": "Access denied"}), 403
        except Exception:
            return jsonify({"message": "Authentication required to download this report"}), 401
        
    user_name = "Guest User"
    if report_owner:
        try:
            user = db.users.find_one({"_id": ObjectId(report_owner)})
            if user:
                user_name = user.get('name', 'User')
        except Exception:
            pass  # Invalid ObjectId — keep default "Guest User"

    try:
        pdf_path = create_pdf_report(report_data, user_name)
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"PDF generation error: {e}")
        return jsonify({"message": "Failed to generate PDF"}), 500

    if not pdf_path or not os.path.exists(pdf_path):
        return jsonify({"message": "Failed to generate PDF"}), 500
        
    return send_file(pdf_path, as_attachment=True, download_name=f"Eye_Health_Report_{report_id}.pdf")
