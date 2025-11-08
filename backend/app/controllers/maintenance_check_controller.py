import os
import uuid
from flask import json, jsonify, request, current_app, g
from app import db
from app.models.manitou_maintenance_form import StorageMaintenanceFormModel_MA
from app.models.manitou_maintenance_items import StorageMaintenanceChecklistItemModel_MA
from app.models.renault_maintenance_form import StorageMaintenanceFormModel_RT
from app.models.renault_maintenance_items import StorageMaintenanceChecklistItemModel_RT
from app.models.sdlg_maintenance_form import StorageMaintenanceFormModel_SDLG
from app.models.sdlg_maintenance_items import StorageMaintenanceChecklistItemModel_SDLG
from app.models.sdlg_maintenance_form import Maintenance_sdlg_defect_remarks
from app.controllers.auth_controller import jwt_required
from app.utils.gcs_utils import upload_storage_maintenance_file
from datetime import datetime, time, date

# mapping for brand Models
BRAND_MODELS = {
    'manitou': StorageMaintenanceFormModel_MA,
    'renault': StorageMaintenanceFormModel_RT,
    'sdlg': StorageMaintenanceFormModel_SDLG,
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

def converted_renault_status_to_int(status):
    """handles conversion to tinyint - RT"""

    if status and isinstance(status, str):
        status_lower = status.lower()
        if status_lower == "checked":
            return 1
        elif status_lower == "recommended_repair":
            return 2
        elif status_lower == "immediately_repair":
            return 3
        elif status_lower == "not_applicable":
            return 0
    return None

def convert_fault_code_status_to_int(status_str):
    """Converts fault code status string to an integer value."""
    
    status_str = status_str.lower() if status_str else 'inactive'
    
    if status_str == 'active':
        return 1
    else:
        return 0

@jwt_required
def submit_maintenance_checklist():
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
        return jsonify({"error": "Invalid Brand"}), 400
    
    ModelClass = BRAND_MODELS[brand.lower()]
    storage_maintenance_entry = ModelClass()

    try:
        storage_maintenance_entry.createdBy = g.user_name
        storage_maintenance_entry.createdOn = datetime.utcnow()
        
        # for Manitou
        if brand.lower() == 'manitou':
            unit_info = data.get('unitInfo', {})
            remarks = data.get('remarks')
            checklist_item_payloads = data.get('checklistItems', {})

            # mapping unit information from frontend to form model
            storage_maintenance_entry.brand = brand
            storage_maintenance_entry.woNumber = unit_info.get('woNumber')
            storage_maintenance_entry.model = unit_info.get('model')
            storage_maintenance_entry.VIN = unit_info.get('serialNo')
            storage_maintenance_entry.hourMeter = unit_info.get('hourMeter')
            storage_maintenance_entry.dateOfCheck = parse_date(unit_info.get('dateOfCheck'))
            storage_maintenance_entry.technician = unit_info.get('technician')
            storage_maintenance_entry.approvalBy = unit_info.get('approvalBy')
            storage_maintenance_entry.remarks = remarks

            # session to add the payload
            db.session.add(storage_maintenance_entry)
            db.session.flush()

            missing_photos = []

            for section_key, items in checklist_item_payloads.items():
                if isinstance(items, dict):
                    for item_key, item_details in items.items():
                        if isinstance(item_details, dict):
                            status = item_details.get('status')
                            file_key = f"image-{section_key}-{item_key}"

                            if status in ['Bad', 'Missing']:
                                if file_key not in uploaded_files or not uploaded_files[file_key].filename:
                                    missing_photos.append(f"{section_key} - {item_key}")
                            
                            image_url = None
                            caption = item_details.get('caption')

                            if file_key in uploaded_files and uploaded_files[file_key].filename:
                                file = uploaded_files[file_key]
                                file.seek(0, 2)
                                file_size = file.tell()
                                file.seek(0)

                                if file_size > 2 * 1024 * 1024:
                                    db.session.rollback()
                                    return jsonify({
                                        'message': f'File {section_key} - {item_key} exceeds 2MB limit'
                                    }), 400
                                
                                allowed_types = {'image/jpeg', 'image/png', 'image/jpg'}

                                if file.content_type not in allowed_types:
                                    db.session.rollback()
                                    return jsonify({
                                        'message': f'Invalid file type for {section_key} - {item_key}. Only JPG/PNG allowed.'
                                    }), 400
                                
                                try:
                                    image_url = upload_storage_maintenance_file(
                                        file=file,
                                        brand=brand.lower(),
                                        user_id=str(g.user_id),
                                    )

                                    if not image_url:
                                        db.session.rollback()
                                        current_app.logger.error(f"Blob name is None for {section_key} - {item_key}")
                                        return jsonify({
                                            'message': f'Failed to upload photo for {section_key} - {item_key}'
                                        }), 500
                                    
                                    current_app.logger.debug(f"Public URL generated: {image_url}")
                                
                                except Exception as e:
                                    db.session.rollback()
                                    current_app.logger.error(f"Upload error for {section_key} - {item_key}: {str(e)}")
                                    return jsonify({
                                        'message': f'Upload failed for {section_key} - {item_key}'
                                    }), 500
                        
                            new_item = StorageMaintenanceChecklistItemModel_MA(
                                smID = storage_maintenance_entry.smID,
                                section = section_key,
                                itemName = item_key,
                                status = converted_manitou_status_to_int(status),
                                image_blob_name = image_url,
                                caption = caption
                            )
                            db.session.add(new_item)
                
            if missing_photos:
                db.session.rollback()
                return jsonify({
                    'message': 'Photos are required for items with "Bad" or "Missing" status',
                    'missing_items': missing_photos
                }), 400

            db.session.commit()
            return jsonify({
                'message': 'Manitou Storage Maintenance Checklist submitted successfully!',
                'id': str(storage_maintenance_entry.smID)
            }), 201        

        # for Renault
        elif brand.lower() == 'renault':
            unit_info = data.get('unitInfo', {})
            remarks = data.get('repairNotes')
            checklist_item_payloads = data.get('checklistItems', {}) 
            battery_data = data.get('batteryInspection', {})
            fault_codes = data.get('faultCodes', {})

            # mapping unit information from frontend to form model
            storage_maintenance_entry.brand = brand
            storage_maintenance_entry.woNumber = unit_info.get('repairOrderNo')
            storage_maintenance_entry.model = unit_info.get('unitModel')
            storage_maintenance_entry.VIN = unit_info.get('vinNo')
            storage_maintenance_entry.engineType = unit_info.get('engineTypeNo')
            storage_maintenance_entry.transmissionType = unit_info.get('transmissionTypeNo')
            storage_maintenance_entry.hourMeter = unit_info.get('hourMeter')
            storage_maintenance_entry.mileage = unit_info.get('mileage')
            storage_maintenance_entry.dateOfCheck = parse_date(unit_info.get('dateOfCheck'))
            storage_maintenance_entry.technician = unit_info.get('technician')
            storage_maintenance_entry.approvalBy = unit_info.get('approvalBy')
            storage_maintenance_entry.generalRemarks = remarks

            # session to add the payload
            db.session.add(storage_maintenance_entry)
            db.session.flush()

            missing_photos = []

            def save_items(section, item_name, status=None, value=None, code=None, caption=None, image_url=None):
                """handles generic Data"""
                
                new_item = StorageMaintenanceChecklistItemModel_RT(
                    smID = storage_maintenance_entry.smID,
                    section = section,
                    itemName = item_name,
                    status = status,
                    value = value,
                    code = code,
                    caption = caption,
                    image_blob_name = image_url
                )
                db.session.add(new_item)
            
            def get_safe_value(val):
                return str(val) if val is not None else None
            
            if isinstance(checklist_item_payloads, dict):
                for section_key, items in checklist_item_payloads.items():
                    if isinstance(items, dict):
                        for item_key, item_details in items.items():
                            if isinstance(item_details, dict):
                                status_string = item_details.get('value')
                                file_key = f"image-{section_key}-{item_key}"
                                
                                if status_string in ['recommended_repair', 'immediately_repair']:
                                    if file_key not in uploaded_files or not uploaded_files[file_key].filename:
                                        missing_photos.append(f"{section_key} - {item_key}")
                                
                                image_url = None
                                caption = item_details.get('notes')
                                
                                if file_key in uploaded_files and uploaded_files[file_key].filename:
                                    file = uploaded_files[file_key]
                                    file.seek(0, 2)
                                    file_size = file.tell()
                                    file.seek(0)
                                    
                                    if file_size > 2 * 1024 * 1024:
                                        db.session.rollback()
                                        return jsonify({
                                            'message': f'File {section_key} - {item_key} exceeds 2MB limit'
                                        }), 400
                                    
                                    allowed_types = {'image/jpeg', 'image/png', 'image/jpg'}
                                    if file.content_type not in allowed_types:
                                        db.session.rollback()
                                        return jsonify({
                                            'message': f'Invalid file type for {section_key} - {item_key}. Only JPG/PNG allowed.'
                                        }), 400
                                    
                                    try:
                                        image_url = upload_storage_maintenance_file(
                                            file=file,
                                            brand=brand.lower(),
                                            user_id=str(g.user_id),
                                        )
                                        
                                        if not image_url:
                                            db.session.rollback()
                                            current_app.logger.error(f"Blob name is None for {section_key} - {item_key}")
                                            return jsonify({
                                                'message': f'Failed to upload photo for {section_key} - {item_key}'
                                            }), 500

                                        current_app.logger.debug(f"Public URL generated: {image_url}")
                                        
                                    except Exception as e:
                                        db.session.rollback()
                                        current_app.logger.error(f"Upload error for {section_key} - {item_key}: {str(e)}")
                                        return jsonify({
                                            'message': f'Upload failed for {section_key} - {item_key}'
                                        }), 500

                                save_items(
                                    section=section_key,
                                    item_name=item_key,
                                    status=converted_renault_status_to_int(status_string),
                                    value=None,
                                    code=None,
                                    caption=caption,
                                    image_url=image_url
                                )

            if isinstance(battery_data, list) and len(battery_data) >= 2:
                default_status = 1 
                front_battery = battery_data[0]
                
                save_items(
                    section = 'battery_inspection',
                    item_name = 'front_battery_level',
                    status = default_status, 
                    value = get_safe_value(front_battery.get('electrolyteLevel')),
                    caption = front_battery.get('statusOnBatteryAnalyzer'),
                    code = None
                )
                save_items(
                    section='battery_inspection',
                    item_name='front_battery_voltage',
                    status = default_status, 
                    value=get_safe_value(front_battery.get('voltage')),
                    caption = front_battery.get('statusOnBatteryAnalyzer'),
                    code = None
                )
                
                rear_battery = battery_data[1]
                
                save_items(
                    section='battery_inspection',
                    item_name='rear_battery_level',
                    status = default_status, 
                    value=get_safe_value(rear_battery.get('electrolyteLevel')),
                    caption = rear_battery.get('statusOnBatteryAnalyzer'),
                    code = None
                )
                save_items(
                    section='battery_inspection',
                    item_name='rear_battery_voltage',
                    status = default_status, 
                    value=get_safe_value(rear_battery.get('voltage')),
                    caption = rear_battery.get('statusOnBatteryAnalyzer'),
                    code = None
                )
            
            if fault_codes and isinstance(fault_codes, list):
                for i, code_item in enumerate(fault_codes):
                    if isinstance(code_item, dict):
                        fault_code_status_int = convert_fault_code_status_to_int(code_item.get('status'))
                        
                        save_items(
                            section='fault_codes',
                            item_name=f'fault_code_{i+1}',
                            status=fault_code_status_int,
                            value=None,
                            code=code_item.get('faultCode'),
                            caption=code_item.get('status')
                        )

            if missing_photos:
                db.session.rollback()
                return jsonify({
                    'message': 'Photos are required for items with "Repair Recommended" or "Repair Immediately" status',
                    'missing_items': missing_photos
                }), 400

            db.session.commit()
            return jsonify({
                'message': 'Renault Storage Maintenance Checklist submitted successfully!',
                'id': str(storage_maintenance_entry.smID)
            }), 201

        # for sdlg
        elif brand.lower() == 'sdlg':
            unit_info = data

            storage_maintenance_entry.brand = unit_info.get('brand')
            storage_maintenance_entry.woNumber = unit_info.get('woNumber')
            storage_maintenance_entry.model = unit_info.get('model')
            storage_maintenance_entry.VIN = unit_info.get('vehicleNumber')
            storage_maintenance_entry.hourMeter = unit_info.get('workingHours')
            storage_maintenance_entry.vehicleArrivalDate = parse_date(unit_info.get('vehicleArrival'))
            storage_maintenance_entry.dateOfCheck = parse_date(unit_info.get('inspectionDate'))
            storage_maintenance_entry.technician = unit_info.get('inspector')
            storage_maintenance_entry.approvalBy = unit_info.get('approvalBy')
            storage_maintenance_entry.signatureTechnician = unit_info.get('signatureInspector')
            storage_maintenance_entry.signatureTechnicianDate = parse_date(unit_info.get('signatureInspectorDate'))
            storage_maintenance_entry.signatureApprover = unit_info.get('signatureSupervisor')
            storage_maintenance_entry.signatureApproverDate = parse_date(unit_info.get('signatureSupervisorDate'))           

            # session to add the payload
            db.session.add(storage_maintenance_entry)
            db.session.flush()

            # checklist keys
            checklist_keys = [
                'inspection1', 'inspection2', 'inspection3', 'inspection4', 'inspection5',
                'inspection6', 'inspection7', 'inspection8', 'inspection9',
                'testing10', 'testing11', 'testing12', 'testing13', 'testing14',
                'testing15', 'testing16', 'testing17', 'testing18', 'testing19',
                'testing20', 'testing21', 'testing22', 'testing23', 'testing24'
            ]

            # get checklist items
            for item_name in checklist_keys:
                status_value = unit_info.get(item_name)
                
                if status_value is not None:
                    if item_name.startswith('inspection'):
                        item_section = 'Inspection'
                    elif item_name.startswith('testing'):
                        item_section = 'Testing'
                    
                    new_item = StorageMaintenanceChecklistItemModel_SDLG(
                        smID = storage_maintenance_entry.smID,
                        section = item_section,
                        itemName = item_name,
                        status = status_value
                    )
                    db.session.add(new_item)
            
            # get defacts and remarks
            defects = data.get('observedConditions', [])

            for defect_entry in defects:
                new_defect = Maintenance_sdlg_defect_remarks(
                    smID = storage_maintenance_entry.smID,
                    description = defect_entry.get('description'),
                    remarks = defect_entry.get('remarks')
                )
                db.session.add(new_defect)

            db.session.commit()

            return jsonify({
                'message': 'SDLG Storage Maintenance Checklist submitted successfully!',
                'id': str(storage_maintenance_entry.smID)
            }), 201
        
    except Exception as e:
        db.session.rollback()
        
        if "Violation of UNIQUE KEY constraint" in str(e) or "duplicate key" in str(e).lower():
            return jsonify({'message': f'Duplicate VIN found for {brand.capitalize()}. Please check your input.'}), 409
        
        current_app.logger.error(f"Submission error: {str(e)}", exc_info=True)
        
        print(f"Error submitting {brand.capitalize()} checklist: {str(e)}")
        return jsonify({'message': f'Error submitting {brand.capitalize()} checklist: {str(e)}'}), 500
    
@jwt_required 
def get_all_maintenance_checklists_by_brand(brand):
    """ Retrieves all maintenance checklists for a given brand. """
    
    if not brand or brand.lower() not in BRAND_MODELS:
        return jsonify({"message": "Invalid or missing Brand"}), 400
    
    ModelClass = BRAND_MODELS[brand.lower()]
    checklists = ModelClass.query.all()

    return jsonify([checklist.to_dict() for checklist in checklists]), 200

@jwt_required
def get_maintenance_checklist_by_brand_and_id(brand, item_id): 
    """ Retrieves a single maintenance checklist by brand and ID. """
    
    if not brand or brand.lower() not in BRAND_MODELS:
        return jsonify({'message': 'Invalid or missing brand'}), 400

    ModelClass = BRAND_MODELS[brand.lower()]
    
    pk_column = None
    
    if hasattr(ModelClass, 'smID'):
        pk_column = ModelClass.smID
    elif hasattr(ModelClass, 'ArrivalID'):
        pk_column = ModelClass.ArrivalID
    
    if not pk_column:
        return jsonify({'message': 'Primary key column not found for this model'}), 500

    checklist = ModelClass.query.filter(pk_column == item_id).first()
    
    if checklist:
        return jsonify(checklist.to_dict()), 200
    
    return jsonify({'message': 'Checklist not found for this brand and ID'}), 404