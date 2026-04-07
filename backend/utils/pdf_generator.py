import os
import qrcode
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from reportlab.lib import colors
import textwrap

def create_pdf_report(data, user_name):
    reports_dir = os.path.join('uploads', 'reports')
    os.makedirs(reports_dir, exist_ok=True)
    
    report_id = data.get('report_id')
    pdf_path = os.path.join(reports_dir, f"{report_id}.pdf")
    
    c = canvas.Canvas(pdf_path, pagesize=letter)
    width, height = letter
    
    # Header
    c.setFillColor(colors.HexColor('#040d1a')) # Deep dark blue from the theme
    c.rect(0, height - 80, width, 80, fill=True, stroke=False)
    
    c.setFillColor(colors.HexColor('#00aaff')) # Neon blue highlight
    c.setFont("Helvetica-Bold", 32)
    c.drawString(40, height - 48, "IRISAI")
    
    c.setFillColor(colors.white)
    c.setFont("Helvetica", 12)
    c.drawString(40, height - 68, "Eye Health Analysis Report")
    
    # Patient Details Box
    c.setFillColor(colors.HexColor('#f8fafc'))
    c.setStrokeColor(colors.HexColor('#e2e8f0'))
    c.roundRect(40, height - 160, width - 80, 60, 6, fill=True, stroke=True)
    
    c.setFillColor(colors.HexColor('#334155'))
    c.setFont("Helvetica-Bold", 10)
    c.drawString(55, height - 120, "PATIENT DETAILS")
    c.setFont("Helvetica", 10)
    c.drawString(55, height - 135, f"Name: {user_name}")
    
    c.setFont("Helvetica-Bold", 10)
    c.drawString(300, height - 120, "REPORT INFO")
    c.setFont("Helvetica", 10)
    c.drawString(300, height - 135, f"Report ID: {report_id}")
    date_str = data.get('date').isoformat() if hasattr(data.get('date'), 'isoformat') else str(data.get('date'))
    if len(date_str) > 16: date_str = date_str[:16].replace('T', ' ')
    c.drawString(300, height - 150, f"Date: {date_str}")
    
    # Subtitles
    c.setFillColor(colors.HexColor('#0f172a'))
    c.setFont("Helvetica-Bold", 12)
    c.drawString(40, height - 200, "SCANNED IMAGE")
    c.drawString(300, height - 200, "ANALYSIS RESULT")
    
    # Image
    c.setStrokeColor(colors.HexColor('#cbd5e1'))
    c.rect(40, height - 370, 230, 155, fill=False, stroke=True)
    img_path = data.get('image_path')
    if img_path and os.path.exists(img_path):
        c.drawImage(img_path, 45, height - 365, width=220, height=145, preserveAspectRatio=True)
    else:
        c.setFillColor(colors.HexColor('#94a3b8'))
        c.setFont("Helvetica-Oblique", 10)
        c.drawString(100, height - 290, "Image not available")
        
    # Prediction Box
    prediction = data.get('prediction', 'Unknown')
    confidence = data.get('confidence', '0%')
    is_normal = 'normal' in prediction.lower()
    
    bg_color = '#dcfce7' if is_normal else '#fee2e2'
    text_color = '#166534' if is_normal else '#991b1b'
    
    c.setFillColor(colors.HexColor(bg_color))
    c.roundRect(300, height - 250, width - 340, 40, 5, fill=True, stroke=False)
    
    c.setFillColor(colors.HexColor(text_color))
    c.setFont("Helvetica-Bold", 14)
    c.drawString(310, height - 230, f"Diagnosis: {prediction}")
    c.setFont("Helvetica", 10)
    c.drawString(310, height - 245, f"Confidence: {confidence}")
    
    # Probabilities
    c.setFillColor(colors.HexColor('#475569'))
    c.setFont("Helvetica-Bold", 10)
    c.drawString(300, height - 280, "Class Probabilities:")
    
    y = height - 295
    probs = data.get('probabilities', {})
    c.setFont("Helvetica", 9)
    for k, v in probs.items():
        c.drawString(300, y, f"{k}:")
        c.drawRightString(width - 40, y, f"{v}")
        
        # Progress bar representing probability
        try:
            val = float(str(v).replace('%', '').strip())
        except ValueError:
            val = 0
            
        bar_w = 90
        c.setFillColor(colors.HexColor('#e2e8f0'))
        c.rect(width - 140, y - 1, bar_w, 6, fill=True, stroke=False)
        c.setFillColor(colors.HexColor('#3b82f6'))
        c.rect(width - 140, y - 1, bar_w * (val / 100.0), 6, fill=True, stroke=False)
        c.setFillColor(colors.HexColor('#475569'))
        
        y -= 14
        if y < height - 370:
            break
            
    # Explanation
    y_text_start = height - 400
    c.setFillColor(colors.HexColor('#0f172a'))
    c.setFont("Helvetica-Bold", 12)
    c.drawString(40, y_text_start, "DETAILED EXPLANATION")
    
    c.setFillColor(colors.HexColor('#334155'))
    c.setFont("Helvetica", 10)
    explanation = data.get('explanation', 'No explanation provided.')
    lines = []
    for paragraph in explanation.split('\n'):
        lines.extend(textwrap.wrap(paragraph, width=105))
        
    y_text = y_text_start - 20
    for line in lines:
        if y_text < 180:  # Page break logic
            c.showPage()
            y_text = height - 50
            c.setFont("Helvetica", 10)
            c.setFillColor(colors.HexColor('#334155'))
        c.drawString(40, y_text, line)
        y_text -= 14
        
    # Footer Section (Line separator)
    c.setStrokeColor(colors.HexColor('#e2e8f0'))
    c.line(40, 160, width - 40, 160)
    
    # QR Code
    qr_data = f"Report ID: {report_id}\nPrediction: {prediction}\nDate: {date_str}"
    qr = qrcode.QRCode(box_size=3, border=1)
    qr.add_data(qr_data)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="black", back_color="white")
    qr_path = os.path.join(reports_dir, f"qr_{report_id}.png")
    qr_img.save(qr_path)
    c.drawImage(qr_path, width - 110, 60, width=70, height=70)
    
    # Disclaimer
    c.setFillColor(colors.HexColor('#b91c1c'))
    c.setFont("Helvetica-Bold", 9)
    c.drawString(40, 130, "MEDICAL DISCLAIMER:")
    c.setFont("Helvetica", 9)
    c.setFillColor(colors.HexColor('#475569'))
    c.drawString(40, 115, "IRISAI is designed for preliminary screening purposes only. It is not a substitute for professional")
    c.drawString(40, 100, "medical diagnosis. Always consult a licensed ophthalmologist for proper evaluation and treatment.")
    
    # Footer string
    c.setFont("Helvetica", 8)
    c.setFillColor(colors.HexColor('#94a3b8'))
    c.drawString(40, 50, "Generated by IRISAI Eye Health System")
    c.drawRightString(width - 40, 50, f"Report ID: {report_id}")
    
    c.save()
    return pdf_path
