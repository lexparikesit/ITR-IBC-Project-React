import json
from flask import request, jsonify, g, current_app
from datetime import datetime
from app import db
from app.models.KHO_models import KHODocumentFormModel
from app.utils.gcs_utils import upload_kho_file, generate_signed_url
from app.controllers.auth_controller import jwt_required
from app.controllers.province_controller import get_province_name_by_code
from uuid import UUID

BRAND_FOLDER_MAP = {
    'RT': 'renault',
    'MA': 'manitou',
    'SDLG': 'sdlg',
    'KA': 'kalmar',
    'MTN': 'mantsinen',
}

@jwt_required
def submit_kho_document():
    """Submit KHO form with PDF upload to GCS."""
    
    try:
        if 'pdfDocument' not in request.files:
            return jsonify({"message": "PDF document is required."}), 400

        pdf_file = request.files['pdfDocument']
        
        if not pdf_file or pdf_file.filename == '':
            return jsonify({"message": "No file selected."}), 400

        if not pdf_file.filename.lower().endswith('.pdf'):
            return jsonify({"message": "Only PDF files are allowed."}), 400

        if 'unitInfo' not in request.form:
            return jsonify({"message": "'unitInfo' is required."}), 400

        try:
            unit_info = json.loads(request.form['unitInfo'])
        
        except Exception:
            return jsonify({"message": "'unitInfo' must be valid JSON."}), 400

        required = ['dealerCode', 'customerName', 'location', 'brand', 'typeModel', 'vinNumber', 'bastDate']
        
        for field in required:
            if not unit_info.get(field):
                return jsonify({"message": f"Field '{field}' is required."}), 400

        vin_number = unit_info['vinNumber']
        vin_exists, existing_kho_id = is_vin_registered(vin_number)
        
        if vin_exists:
            return jsonify({
                "message": f"VIN '{vin_number}' has already been registered in the system.",
                "documentID": existing_kho_id
            }), 409

        user_id = str(g.user_id)
        raw_brand = unit_info['brand']
        brand_folder = BRAND_FOLDER_MAP.get(raw_brand, raw_brand.lower())
    
        blob_name = upload_kho_file(
            file=pdf_file,
            brand=brand_folder,
            user_id=user_id,
            async_upload=False
        )

        if not blob_name:
            current_app.logger.error("GCS upload failed")
            return jsonify({"message": "Failed to upload document."}), 500

        try:
            bast_date = datetime.strptime(unit_info['bastDate'], '%Y-%m-%d')
        
        except ValueError:
            return jsonify({"message": "Invalid date format. Use YYYY-MM-DD."}), 400

        # Convert province code to human-readable label (e.g., "64" -> "Kalimantan Timur")
        province_code = unit_info.get('location')
        location_label = get_province_name_by_code(province_code)

        new_doc = KHODocumentFormModel(
            dealerCode=unit_info['dealerCode'],
            customer=unit_info['customerName'],
            location=location_label,
            brand=unit_info['brand'],
            typeModel=unit_info['typeModel'],
            VIN=unit_info['vinNumber'],
            bastDate=bast_date,
            pdfDocumentUrl=blob_name,
            createdBy=g.user_name,
        )

        db.session.add(new_doc)
        db.session.commit()

        return jsonify({
            "message": "KHO document submitted successfully!",
            "documentID": str(new_doc.khoID)
        }), 201

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"KHO submission error: {str(e)}")
        return jsonify({"message": "Internal server error."}), 500

@jwt_required
def get_kho_document_pdf(kho_id):
    """Generate signed URL to download KHO PDF."""
    
    try:
        try:
            kho_uuid = UUID(kho_id)
        except ValueError:
            return jsonify({"message": "Invalid document ID format."}), 400

        doc = KHODocumentFormModel.query.get(kho_uuid)
        
        if not doc:
            return jsonify({"message": "Document not found."}), 404

        if not doc.pdfDocumentUrl:
            return jsonify({"message": "No document attached."}), 404

        signed_url = generate_signed_url(doc.pdfDocumentUrl, expiration_hours=1)
        
        if not signed_url:
            return jsonify({"message": "Failed to generate download link."}), 500

        return jsonify({
            "downloadUrl": signed_url
        }), 200

    except Exception as e:
        current_app.logger.error(f"Error generating KHO PDF URL: {str(e)}")
        return jsonify({"message": "Internal server error."}), 500
    
def is_vin_registered(vin_number):
    """Check if VIN already exists in KHO_unit_form table."""
    
    if not vin_number:
        return False, None
    
    doc = KHODocumentFormModel.query.filter_by(VIN=vin_number.strip()).first()

    if doc:
        return True, str(doc.khoID)
    
    return False, None
