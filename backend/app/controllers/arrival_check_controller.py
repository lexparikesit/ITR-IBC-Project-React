import os
import uuid
from flask import json, jsonify, request, current_app, g
from app import db
from app.models.manitou_arrival_form import ArrivalFormModel_MA
from app.models.manitou_arrival_items import ArrivalChecklistItemModel_MA
from app.models.renault_arrival_form import ArrivalFormModel_RT
from app.models.renault_arrival_items import ArrivalChecklistItemModel_RT
from app.models.sdlg_arrival_form import ArrivalFormModel_SDLG
from app.models.sdlg_arrival_items import ArrivalChecklistItemModel_SDLG
from datetime import datetime, time
from dateutil.parser import isoparse
from app.controllers.auth_controller import jwt_required
# from google.cloud import Storage

# configuartion of GCS Environment
# GCS_Bucket_Name = os.environ.get('GCS_BUCKET_NAME')
# CDN_BASE_URL = os.environ.get('CDN_BASE_URL', 'https://cdn.example.com')

# initiate GCS Client
# storage_client = storage.Client()

# mapping brand to model database
BRAND_MODELS = {
    'manitou': ArrivalFormModel_MA,
    'renault': ArrivalFormModel_RT,
    'sdlg': ArrivalFormModel_SDLG,
}

def parse_date(date_string):
    """handle date parsing"""
    
    if not date_string or not isinstance(date_string, str):
        return None
    formats_to_try = [
        '%Y-%m-%d',
        '%Y-%m-%dT%H:%M:%S.%fZ',
    ]

    for fmt in formats_to_try:
        try:
            return datetime.strptime(date_string, fmt)
        except (ValueError, TypeError):
            continue
    return None

def convert_manitou_status_to_int(status_str):
    """handles conversion to tinyint - MA"""
    
    if status_str and isinstance(status_str, str):
        status_lower = status_str.lower()
        if status_lower == "missing":
            return 0
        elif status_lower == "good":
            return 1
        elif status_lower == "bad":
            return 2

def convert_renault_status_to_boolean(status):
    """handles conversion to Boolean - RT"""
    
    if status == "checked_without_remarks":
        return 1
    elif status == "checked_with_remarks":
        return 0
    return 0

def convert_sdlg_status_to_int(status_bool):
    """Handles conversion of boolean status to integer for SDLG."""
    
    if isinstance(status_bool, bool):
        return 1 if status_bool else 0
    
    return 0

@jwt_required
def submit_arrival_checklist():
    """Handles form submissions for Commissioning for various brands."""

    if request.content_type and 'multipart/form-data' in request.content_type:
        data_string = request.form.get('data')
        
        if not data_string:
            return jsonify({"error": "Missing 'data' part in form"}), 400
        
        try:
            data = json.loads(data_string)
        except json.JSONDecodeError:
            return jsonify({"error": "Invalid JSON data in 'data' part"}), 400
        
        uploaded_files = request.files
        print(f"DEBUG: Files received: {list(uploaded_files.keys())}")
        
    else:
        data = request.get_json()
        uploaded_files = {}

    brand = data.get("brand")

    if not brand or brand.lower() not in BRAND_MODELS:
        return jsonify({"error": "Invalid brand"}), 400
    
    ModelClass = BRAND_MODELS[brand.lower()]
    arrival_entry = ModelClass()

    try:
        arrival_entry.createdBy = g.user_name
        arrival_entry.createdOn = datetime.utcnow()

        # for Manitou
        if brand.lower() == 'manitou':
            unit_info = data.get('unitInfo', {})
            general_remarks = data.get('generalRemarks', '')
            checklist_payload = data.get('checklistItems', {})

            # mapping unit information from frontend to form model
            arrival_entry.brand = brand
            arrival_entry.woNumber = unit_info.get('woNumber')
            arrival_entry.model = unit_info.get('model')
            arrival_entry.VIN = unit_info.get('serialNo')
            arrival_entry.hourMeter = unit_info.get('hourMeter')
            arrival_entry.dateOfCheck = parse_date(unit_info.get('dateOfCheck'))
            arrival_entry.technician = unit_info.get('technician')
            arrival_entry.approvalBy = unit_info.get('approver')
            arrival_entry.remarks = general_remarks

            # session to add the payload
            db.session.add(arrival_entry)
            db.session.flush()

            for section_key, items in checklist_payload.items():
                if isinstance(items, dict):
                    for item_name, item_details, in items.items():
                        image_url = None # will None as long as GCS/ CDN is commenting

                        new_item = ArrivalChecklistItemModel_MA(
                            arrivalID = arrival_entry.arrivalID,
                            section = section_key,
                            itemName = item_name,
                            status = convert_manitou_status_to_int(item_details.get('status')),
                            image_url = image_url,
                            caption = item_details.get('caption')
                        )
                        db.session.add(new_item)
            
            # Commit all changes to the database at once
            db.session.commit()

            return jsonify({
                'message': 'Manitou Arrival Checklist submitted successfully!',
                'id': str(arrival_entry.arrivalID)
            }), 201

        # for Renault
        elif brand.lower() == 'renault':
            unit_info = data.get('unitInfo', {})
            general_remarks = data.get('remarks', '')
            checklist_payload = data.get('checklistItems', {})

            # mapping unit information from frontend to form model
            arrival_entry.brand = brand
            arrival_entry.woNumber = unit_info.get('woNumber')
            arrival_entry.model = unit_info.get('typeModel')
            arrival_entry.noEngine = unit_info.get('noEngine')
            arrival_entry.noChassis = unit_info.get('chassisNumber')
            arrival_entry.VIN = unit_info.get('VIN')
            arrival_entry.dateOfCheck = parse_date(unit_info.get('dateOfCheck'))
            arrival_entry.technician = unit_info.get('technician')
            arrival_entry.approvalBy = unit_info.get('approvalBy')
            arrival_entry.remarks = general_remarks

            # session to add the payload
            db.session.add(arrival_entry)
            db.session.flush()

            for section_key, items in checklist_payload.items():
                if isinstance(items, dict):
                    for item_name, item_details, in items.items():
                        new_item = ArrivalChecklistItemModel_RT(
                            arrivalID=arrival_entry.arrivalID,
                            section=section_key,
                            itemName=item_name,
                            status=convert_renault_status_to_boolean(item_details.get('status')),
                            remarks=item_details.get('remarks', '')
                        )
                        db.session.add(new_item)
            
            # Commit all changes to the database at once
            db.session.commit()

            return jsonify({
                'message': 'Renault Arrival Checklist submitted successfully!',
                'id': str(arrival_entry.arrivalID)
            }), 201

        # for SDLG
        elif brand.lower() == 'sdlg':
            unit_info = data.get('unitInfo', {})
            importation_info = data.get('importationInfo', {})
            checklist_payload = data.get('checklistItems', [])
            general_remarks = data.get('remarks', '')

            # mapping unit information from frontend to form model
            arrival_entry.brand = brand
            arrival_entry.woNumber = unit_info.get('woNumber')
            arrival_entry.distributionName = unit_info.get('distributionName')
            arrival_entry.containerNo = unit_info.get('containerNo')
            arrival_entry.leadSealingNo = unit_info.get('leadSealingNo')
            arrival_entry.model = unit_info.get('model')
            arrival_entry.VIN = unit_info.get('VIN')
            arrival_entry.dateOfCheck = parse_date(unit_info.get('dateOfCheck'))
            arrival_entry.technician = unit_info.get('technician')
            arrival_entry.approvalBy = unit_info.get('approvalBy')
            arrival_entry.unitLanded = parse_date(importation_info.get('unitLanded'))
            arrival_entry.clearanceCustom = importation_info.get('clearanceCustom', False)
            arrival_entry.unitStripping = parse_date(importation_info.get('unitStripping'))
            arrival_entry.remarks = general_remarks

            # session to add the payload
            db.session.add(arrival_entry)
            db.session.flush()

            for item in checklist_payload:
                new_item = ArrivalChecklistItemModel_SDLG(
                    arrivalID=arrival_entry.arrivalID,
                    ItemName=item.get('ItemName'),
                    status=convert_sdlg_status_to_int(item.get('status')),
                    remarks=item.get('remarks')
                )
                db.session.add(new_item)

            # Commit all changes to the database at once
            db.session.commit()

            return jsonify({
                'message': 'SDLG Arrival Checklist submitted successfully!',
                'id': str(arrival_entry.arrivalID)
            }), 201

    except Exception as e:
        db.session.rollback()

        if "Violation of UNIQUE KEY constraint" in str(e) or "duplicate key" in str(e).lower():
            return jsonify({'message': f'Duplicate VIN or Engine Number found for {brand.capitalize()}. Please check your input.'}), 409
        
        return jsonify({'message': f'Error submitting {brand.capitalize()} checklist: {str(e)}'}), 500

@jwt_required 
def get_all_arrival_checklists_by_brand(brand):
    """ Retrieves all arrival checklists for a given brand. """
    
    if not brand or brand.lower() not in BRAND_MODELS:
        return jsonify({"message": "Invalid or missing Brand"}), 400
    
    ModelClass = BRAND_MODELS[brand.lower()]
    checklists = ModelClass.query.all()

    return jsonify([checklist.to_dict() for checklist in checklists]), 200

@jwt_required
def get_arrival_checklist_by_brand_and_id(brand, item_id): 
    """ Retrieves a single arrival checklist by brand and ID. """
    
    if not brand or brand.lower() not in BRAND_MODELS:
        return jsonify({'message': 'Invalid or missing brand'}), 400

    ModelClass = BRAND_MODELS[brand.lower()]
    
    # Determine primary key column based on the model
    pk_column = None
    
    if hasattr(ModelClass, 'arrivalID'):
        pk_column = ModelClass.arrivalID
    elif hasattr(ModelClass, 'arrivalID'):
        pk_column = ModelClass.arrivalID
    
    if not pk_column:
        return jsonify({'message': 'Primary key column not found for this model'}), 500

    checklist = ModelClass.query.filter(pk_column == item_id).first()
    
    if checklist:
        return jsonify(checklist.to_dict()), 200
    
    return jsonify({'message': 'Checklist not found for this brand and ID'}), 404

def check_vin_existence(vin):
    """Checks if a given VIN already exists in either Renault or Manitou checklists."""

    if not vin:
        return jsonify({"message": "VIN is required"}), 400

    for ModelClass in BRAND_MODELS.values():
        if hasattr(ModelClass, 'VIN'):
            try:
                existing_entry = db.session.query(ModelClass.VIN).filter(ModelClass.VIN == vin).first()
                if existing_entry is not None:
                    return jsonify({'exists': True}), 200
            
            except Exception as e:
                current_app.logger.warning(f"Failed to check VIN for a model: {e}")
                continue

    return jsonify({'exists': False}), 200