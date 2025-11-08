import json
from flask import request, jsonify, g, current_app
from datetime import datetime
from app import db
from app.models.KHO_models import KHODocumentFormModel
from app.utils.gcs_utils import upload_kho_file, generate_signed_url
from app.controllers.auth_controller import jwt_required
from uuid import UUID

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

        current_user = g.current_user
        
        if not current_user:
            return jsonify({"message": "User not authenticated."}), 500

        created_by_value = getattr(current_user, 'username', None) or str(getattr(current_user, 'id', 'unknown'))

        blob_name = upload_kho_file(
            file=pdf_file,
            brand=unit_info['brand'],
            user_id=created_by_value,
            async_upload=False
        )

        if not blob_name:
            current_app.logger.error("GCS upload failed")
            return jsonify({"message": "Failed to upload document."}), 500

        try:
            bast_date = datetime.strptime(unit_info['bastDate'], '%Y-%m-%d')
        
        except ValueError:
            return jsonify({"message": "Invalid date format. Use YYYY-MM-DD."}), 400

        new_doc = KHODocumentFormModel(
            dealerCode=unit_info['dealerCode'],
            customer=unit_info['customerName'],
            location=unit_info['location'],
            brand=unit_info['brand'],
            typeModel=unit_info['typeModel'],
            VIN=unit_info['vinNumber'],
            bastDate=bast_date,
            pdfDocumentUrl=blob_name,
            createdBy=created_by_value
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