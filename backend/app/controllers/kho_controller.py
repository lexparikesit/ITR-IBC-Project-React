import os
import uuid
import json
from flask import request, jsonify, g
from datetime import datetime
from app import db
from app.models.KHO_models import KHODocumentFormModel
from app.controllers.auth_controller import jwt_required

@jwt_required
def submit_kho_document():
    """Handles form submissions for Key Hand Over Unit."""

    try:
        if not request.form or 'unitInfo' not in request.form:
            return jsonify({
                "message" : "Invalid request. Data 'unitInfo' not found."
            }), 400
    
        # get JSON data from form
        unit_info_data_str = request.form['unitInfo']
        unit_info_data = json.loads(unit_info_data_str)

        # get identity user 
        current_user = g.current_user

        # validation of data requirements
        required_fields = ['dealerCode', 'customerName', 'location', 'brand', 'typeModel', 'vinNumber', 'bastDate']

        for field in required_fields:
            if field not in unit_info_data or not unit_info_data[field]:
                return jsonify({
                    "message": f"Field '{field}' is Required!"
                }), 400
            
        # get all data field
        dealer_code = unit_info_data['dealerCode']
        customer_name = unit_info_data['customerName']
        location_data = unit_info_data['location']
        brand_data = unit_info_data['brand']
        type_model = unit_info_data['typeModel']
        vin_number = unit_info_data['vinNumber']
        bast_date = datetime.strptime(unit_info_data['bastDate'], '%Y-%m-%d')

        # dummy pdf url item - later we will configure GCS
        pdf_url = f"https://dummy.url/kho-document-{uuid.uuid4()}.pdf"

        new_document = KHODocumentFormModel(
            dealerCode = dealer_code,
            customer = customer_name,
            location = location_data,
            brand = brand_data,
            typeModel = type_model,
            VIN = vin_number,
            bastDate = bast_date,
            pdfDocumentUrl = pdf_url,
            createdBy = current_user
        )

        # save it to DB Object
        db.session.add(new_document)
        db.session.commit()

        return jsonify({
            "message": "The document has been successfully uploaded and the data has been successfully saved!",
            "documentID": str(new_document.khoID),
            "pdfUrl": pdf_url
        }), 201
    
    except json.JSONDecodeError:
        return jsonify({"message": "The 'unitInfo' payload is not a valid JSON format."}), 400
    
    except KeyError as e:
        return jsonify({"message": f"Bidang yang dibutuhkan tidak ada: {e}"}), 400
    
    except Exception as e:
        db.session.rollback() 
        print(f"Error while Requesting: {e}")
        return jsonify({"message": f"A server error has occurred: {str(e)}"}), 500

