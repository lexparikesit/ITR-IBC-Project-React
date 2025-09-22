import os
import uuid
from flask import json, jsonify, request, g
from app import db
from app.models.manitou_commissioning_form import CommissioningFormModel_MA
from app.models.manitou_commissioning_items import CommissioningChecklistItemModel_MA
from app.models.renault_commissioning_form import CommissioningFormModel_RT, MajorComponent_RT
from app.models.renault_commissioning_items import CommissioningChecklistItemModel_RT
from app.models.sdlg_commissioning_form import CommissioningFormModel_SDLG
from app.models.sdlg_commissioning_items import CommissioningChecklistItemModel_SDLG
from datetime import datetime
from app.controllers.auth_controller import jwt_required
# from google.cloud import Storage

# configuartion of GCS Environment
# GCS_Bucket_Name = os.environ.get('GCS_BUCKET_NAME')
# CDN_BASE_URL = os.environ.get('CDN_BASE_URL', 'https://cdn.example.com')

# initiate GCS Client
# storage_client = storage.Client()

# mapping for each brand Models
BRAND_MODELS = {
    'manitou': CommissioningFormModel_MA,
    'renault': CommissioningFormModel_RT,
    'sdlg': CommissioningFormModel_SDLG,
}

@jwt_required
def submit_commissioning_form(brand):
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

    if not brand or brand.lower() not in BRAND_MODELS:
        return jsonify({"error": "Invalid Brand"}), 400
    
    ModelClass = BRAND_MODELS[brand.lower()]
    commissioning_entry = ModelClass()

    try:
        commissioning_entry.createdby = g.user_name
        commissioning_entry.createdon = datetime.utcnow()

        def converted_manitou_status_to_int(status_str):
            """handles conversion to tinyint - MA"""

            if status_str and isinstance(status_str, str):
                status_lower = status_str.lower()
                if status_lower == "missing":
                    return 0
                elif status_lower == "good":
                    return 1
                elif status_lower == "bad":
                    return 2
            return None
        
        def parse_date(date_string):
            """handle date parsing"""

            formats_to_try = [
                '%Y-%m-%dT%H:%M:%S.%fZ',  # ISO format with milliseconds
                '%Y-%m-%d'                # Simple date format
            ]
            for fmt in formats_to_try:
                try:
                    return datetime.strptime(date_string, fmt)
                except (ValueError, TypeError):
                    continue
            return None

        # for Manitou
        if brand.lower() == 'manitou':
            unit_info = data.get('unitInfo', {})
            general_remarks = data.get('generalRemarks', '')
            checklist_item_payloads = data.get('checklistItems', {})

            # mapping unit information from frontend to form model
            commissioning_entry.brand = brand
            commissioning_entry.woNumber = unit_info.get('woNumber')
            commissioning_entry.customer = unit_info.get('customer')
            commissioning_entry.UnitType = unit_info.get('unitModel')
            commissioning_entry.VIN = unit_info.get('VIN')
            commissioning_entry.hourMeter = unit_info.get('hourMeter')
            commissioning_entry.deliveryDate = parse_date(unit_info.get('deliveryDate'))
            commissioning_entry.commissioningDate = parse_date(unit_info.get('commissioningDate'))
            commissioning_entry.inspectorSignature = unit_info.get('inspectorSignature')
            commissioning_entry.approvalBy = unit_info.get('approvalBy')
            commissioning_entry.remarks = general_remarks

            # session to add the payload
            db.session.add(commissioning_entry)
            db.session.flush()

            for section_key, items in checklist_item_payloads.items():
                if isinstance(items, dict):
                    for item_key, item_details in items.items():
                        if isinstance(item_details, dict):
                            image_url = None # will None as long as GCS/ CDN is commenting

                            new_item = CommissioningChecklistItemModel_MA(
                                commID = commissioning_entry.commID,
                                section = section_key,
                                itemName = item_key,
                                status = converted_manitou_status_to_int(item_details.get('status')),
                                image_url = image_url,
                                caption = item_details.get('notes')
                            )
                            db.session.add(new_item)
            
            # Commit all changes to the database at once
            db.session.commit()

            return jsonify({
                'message': 'Manitou Commissioning Form submitted successfully!',
                'id': str(commissioning_entry.commID)
            }), 201

        # for Renault
        elif brand.lower() == 'renault':
            report_info = data.get('reportInfo', {})
            unit_info = data.get('unitInfo', {})
            customer_info = data.get('customerInfo', {})
            signatures_payload = data.get('signatures', {})
            major_components_payload = data.get('majorComponents', [])
            checklist_payload = data.get('checklist', {})

            # mapping unit information from frontend to form model
            commissioning_entry.jobCardNo = report_info.get('jobCardNo')
            commissioning_entry.woNumber = report_info.get('woNumber')
            commissioning_entry.dealerCode = report_info.get('dealer')
            commissioning_entry.dateOfCheck = parse_date(report_info.get('date'))
            commissioning_entry.brand = brand
            commissioning_entry.typeModel = unit_info.get('vehicleType')
            commissioning_entry.VIN = unit_info.get('VIN')
            commissioning_entry.CAM = unit_info.get('CAM')
            commissioning_entry.FAB_no = unit_info.get('FABNo')
            commissioning_entry.deliveryDate = parse_date(unit_info.get('deliveryDate'))
            commissioning_entry.application = unit_info.get('application')
            commissioning_entry.reg_fleet_no = unit_info.get('regFleetNo')
            commissioning_entry.customer = customer_info.get('companyName')
            commissioning_entry.location = customer_info.get('location')
            commissioning_entry.contactPerson = customer_info.get('contactPerson')
            commissioning_entry.inspectorSignature = signatures_payload.get('inspectorSignature')
            commissioning_entry.inspectorSignatureDate = parse_date(signatures_payload.get('inspectorSignatureDate'))
            commissioning_entry.supervisorSignature = signatures_payload.get('supervisorSignature')
            commissioning_entry.supervisorSignatureDate = parse_date(signatures_payload.get('supervisorSignatureDate'))

            # session to add the payload
            db.session.add(commissioning_entry)
            db.session.flush()

            major_components_list = []
            
            for comp in major_components_payload:
                new_comp = MajorComponent_RT(
                    commID = commissioning_entry.commID,
                    component = comp.get('component'),
                    make = comp.get('make'),
                    type_model = comp.get('typeModel'),
                    serial_number = comp.get('serialNumber'),
                    part_number = comp.get('partNumber'),
                    remarks = comp.get('remarks'),
                )
                major_components_list.append(new_comp)
            
            db.session.bulk_save_objects(major_components_list)

            checklist_items_payload = checklist_payload.get('items', [])
            checklist_notes_payload = checklist_payload.get('notes', {})
            checklist_item_list = []
            
            for item in checklist_items_payload:
                checklist_status = item.get('checklist', False)
                notes = checklist_notes_payload.get(item.get('itemName'))
                
                new_item = CommissioningChecklistItemModel_RT(
                    commID=commissioning_entry.commID,
                    section=item.get('section'),
                    itemName=item.get('itemName'),
                    checklist=checklist_status,
                    notes=notes,
                )
                checklist_item_list.append(new_item)

            db.session.bulk_save_objects(checklist_item_list)

            db.session.commit()

            return jsonify({
                'message': 'Renault Commissioning Form submitted successfully!',
                'id': str(commissioning_entry.commID)
            }), 201

        # for sdlg
        elif brand.lower() == 'sdlg':
            unit_info = data.get('unitInfo', {})
            checklist_payload = data.get('checklistItems', {})
            check_of_docs = checklist_payload.get('checkOfDocuments', {})
            check_complete_machine = checklist_payload.get('checkCompleteMachine', {})

            # mapping unit information from frontend to form model
            commissioning_entry.brand = brand
            commissioning_entry.woNumber = unit_info.get('woNumber')
            commissioning_entry.typeModel = unit_info.get('typeModel')
            commissioning_entry.VIN = unit_info.get('VIN')
            commissioning_entry.dateOfCheck = parse_date(unit_info.get('dateOfCheck'))
            commissioning_entry.customer = unit_info.get('customer')
            commissioning_entry.technician = unit_info.get('technician')
            commissioning_entry.approvalBy = unit_info.get('approvalBy')

            # session to add the payload
            db.session.add(commissioning_entry)
            db.session.flush()

            # Use dynamic loop to assign checklist values
            all_checklist_items = []

            for key, value in check_of_docs.items():
                all_checklist_items.append(CommissioningChecklistItemModel_SDLG(
                    commID = commissioning_entry.commID,
                    section = "checkOfDocuments",
                    itemName = key,
                    status = value,
                ))
            
            for key, value in check_complete_machine.items():
                all_checklist_items.append(CommissioningChecklistItemModel_SDLG(
                    commID = commissioning_entry.commID,
                    section = "checkCompleteMachine",
                    itemName = key,
                    status = value
                ))

            # Add and commit to database
            db.session.bulk_save_objects(all_checklist_items)
            db.session.commit()

            return jsonify({
                'message': 'SDLG Commissioning Form submitted successfully!',
                'id': str(commissioning_entry.commID)
            }), 201

    except Exception as e:
        db.session.rollback()

        if "Violation of UNIQUE KEY constraint" in str(e) or "duplicate key" in str(e).lower():
            return jsonify({'message': f'Duplicate VIN found for {brand.capitalize()}. Please check your input.'}), 409

        print(f"Error submitting form for {brand}: {str(e)}")
        return jsonify({'message': f'Error submitting form: {str(e)}'}), 500