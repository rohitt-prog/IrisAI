import os
from flask import Blueprint, request, jsonify, send_file, current_app
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
        
    user_name = "Guest User"
    if report_data.get('user_id'):
        user = db.users.find_one({"_id": ObjectId(report_data['user_id'])})
        if user:
            user_name = user.get('name', 'User')

    pdf_path = create_pdf_report(report_data, user_name)
    if not pdf_path or not os.path.exists(pdf_path):
        return jsonify({"message": "Failed to generate PDF"}), 500
        
    return send_file(pdf_path, as_attachment=True, download_name=f"Eye_Health_Report_{report_id}.pdf")
