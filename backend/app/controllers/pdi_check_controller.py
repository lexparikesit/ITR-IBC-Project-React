import os
import uuid
from flask import json, jsonify, request, current_app, g
from app import db
from app.models.manitou_pdi_form import PDIFormModel_MA
from app.models.manitou_pdi_items import PDIChecklistItemModel_MA
from app.models.renault_pdi_form import PDIFormModel_RT
from app.models.renault_pdi_items import PDIChecklistItemModel_RT
from app.models.sdlg_pdi_form import PDIFormModel_Sdlg, PDI_sdlg_defect_remarks
from app.models.sdlg_pdi_items import PDIChecklistItemModel_SDLG
from app.controllers.auth_controller import jwt_required
from app.controllers.province_controller import get_province_name_by_code
from app.utils.gcs_utils import upload_pdi_file, get_bucket, get_folder_prefix, upload_blob_with_bucket
from app.service.notifications_utils import (
    build_payload,
    dispatch_notification as dispatch_pdi_notifications,
    emit_notifications,
    format_brand_label,
    resolve_model_label,
    resolve_user_display_name,
    DEFAULT_SUPERVISION_ROLES,
)
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime

# mapping for brand Models
BRAND_MODELS = {
    'manitou': PDIFormModel_MA,
    'renault': PDIFormModel_RT,
    'sdlg': PDIFormModel_Sdlg,
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

@jwt_required
def submit_pdi_form(brand):
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
        current_app.logger.debug(f"PDI upload: Files received: {list(uploaded_files.keys())}")

    else:
        data = request.get_json()
        uploaded_files = {}

    if not brand or brand.lower() not in BRAND_MODELS:
        return jsonify({"error": "Invalid Brand"}), 400

    ModelClass = BRAND_MODELS.get(brand.lower())
    pdi_entry = ModelClass()

    try:
        pdi_entry.createdBy = g.user_name
        pdi_entry.createdOn = datetime.utcnow()
    
        # for Manitou
        if brand.lower() == 'manitou':
            unit_info = data.get('unitInfo', {})
            remarks_transport = data.get('deliveryRemarks', '')
            general_remarks = data.get('generalRemarks', '')
            checklist_item_payloads = data.get('checklistItems', {})

            # mapping unit information from frontend to form model
            pdi_entry.brand = brand
            pdi_entry.dealerCode = unit_info.get('dealerCode')
            pdi_entry.woNumber = unit_info.get('woNumber')
            pdi_entry.customer = unit_info.get('customer')
            pdi_entry.machineType = unit_info.get('machineType')
            pdi_entry.VIN = unit_info.get('serialNumber')
            pdi_entry.deliveryDate = parse_date(unit_info.get('deliveryDate'))
            pdi_entry.checkingDate = parse_date(unit_info.get('checkingDate'))
            pdi_entry.HourMeter = unit_info.get('HourMeter')
            pdi_entry.customer = unit_info.get('customer')
            approver_value = unit_info.get('approvalBy')
            pdi_entry.approver = approver_value
            # expose approvalBy attribute for downstream helpers that expect a unified name
            pdi_entry.approvalBy = approver_value
            pdi_entry.inspectorSignature = unit_info.get('inspectorSignature')
            pdi_entry.generalRemarks = general_remarks
            pdi_entry.remarksTransport = remarks_transport

            # session to add the payload
            db.session.add(pdi_entry)
            db.session.flush()

            missing_photos = []

            # Prepare GCS context and containers
            user_id = str(g.user_id)
            brand_lower = brand.lower()
            bucket = get_bucket()
            folder_prefix = get_folder_prefix('pdi', brand_lower, user_id)

            pending_uploads = {}
            item_records = []  # collect items for bulk insert after uploads

            for section_key, items in checklist_item_payloads.items():
                if isinstance(items, dict):
                    for item_key, item_details in items.items():
                        if isinstance(item_details, dict):
                            status = item_details.get('status')
                            primary_key = f"image-{section_key}-{item_key}"
                            alt_key = f"{section_key}.{item_key}.image"
                            file = uploaded_files.get(primary_key) or uploaded_files.get(alt_key)

                            if status in ['Bad', 'Missing']:
                                if not file or not getattr(file, 'filename', None):
                                    missing_photos.append(f"{section_key} - {item_key}")
                            
                            caption = item_details.get('notes')

                            # Validate and schedule upload if file provided
                            future = None
                            if file and getattr(file, 'filename', None):
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

                                # Defer upload to threadpool
                                pending_key = (section_key, item_key)
                                pending_uploads[pending_key] = file

                            # Record base item; image to be attached after uploads
                            item_records.append({
                                'section': section_key,
                                'itemName': item_key,
                                'status': converted_manitou_status_to_int(item_details.get('status')),
                                'caption': caption,
                                'image_blob_name': None,
                            })

            # If required photos are missing, abort early
            if missing_photos:
                db.session.rollback()
                return jsonify({
                    'message': 'Photos are required for items with "Bad" or "Missing" status',
                    'missing_items': missing_photos
                }), 400

            # Execute uploads in parallel
            if pending_uploads:
                max_workers = min(8, len(pending_uploads))
                future_map = {}
                with ThreadPoolExecutor(max_workers=max_workers) as executor:
                    for key, file in pending_uploads.items():
                        future = executor.submit(upload_blob_with_bucket, file, bucket, folder_prefix)
                        future_map[future] = key

                    # Collect results
                    upload_errors = []
                    results = {}
                    for future in as_completed(future_map):
                        sec_key, item_key = future_map[future]
                        try:
                            blob_name = future.result()
                            if not blob_name:
                                upload_errors.append(f"{sec_key} - {item_key}")
                            else:
                                results[(sec_key, item_key)] = blob_name
                        except Exception as e:
                            current_app.logger.error(f"Async upload failed for {sec_key} - {item_key}: {str(e)}")
                            upload_errors.append(f"{sec_key} - {item_key}")

                if upload_errors:
                    db.session.rollback()
                    return jsonify({
                        'message': 'Failed to upload some photos',
                        'failed_items': upload_errors
                    }), 500

                # Attach uploaded blob names to corresponding records
                for rec in item_records:
                    key = (rec['section'], rec['itemName'])
                    if key in results:
                        rec['image_blob_name'] = results[key]

            # Bulk insert all items
            db.session.add_all([
                PDIChecklistItemModel_MA(
                    pdiID=pdi_entry.pdiID,
                    section=rec['section'],
                    itemName=rec['itemName'],
                    status=rec['status'],
                    image_blob_name=rec['image_blob_name'],
                    caption=rec['caption'],
                ) for rec in item_records
            ])
                            
            payload = build_payload(pdi_entry, ["brand", "woNumber", "machineType", "VIN"])
            brand_label = format_brand_label(pdi_entry.brand)
            payload["brandLabel"] = brand_label
            payload["brand"] = brand_label

            model_value = pdi_entry.machineType
            payload["model"] = resolve_model_label(model_value)
            payload["modelLabel"] = payload["model"]

            technician_ref = (
                unit_info.get("technician")
                or unit_info.get("preInspectionPersonnel")
                or unit_info.get("inspectorSignature")
            )
            payload["technicianName"] = resolve_user_display_name(technician_ref)
            payload["approverName"] = resolve_user_display_name(unit_info.get("approvalBy") or pdi_entry.approver)
            notifications_created = dispatch_pdi_notifications(
                entity_type="pre_delivery_inspection",
                entity_id=pdi_entry.pdiID,
                approval_raw=pdi_entry.approver,
                technician=g.user_name,
                payload=payload,
                notify_roles=DEFAULT_SUPERVISION_ROLES,
                technician_raw=technician_ref,
            )
            try:
                db.session.commit()
            except Exception as e:
                db.session.rollback()
                current_app.logger.error(f"Database commit failed: {str(e)}")
                return jsonify({'message': f'Database error: {str(e)}'}), 500

            emit_notifications(notifications_created)

            return jsonify({
                'message': 'Manitou Pre Delivery Inspection Form submitted successfully!',
                'id': str(pdi_entry.pdiID)
            }), 201

        # for Renault
        elif brand.lower() == 'renault':
            unit_info = data.get('unitInfo', {})
            checklist_item_payloads = data.get('checklistItems', {})
            battery_status_data = data.get('batteryStatus', {})
            vehicle_damage_notes = data.get('vehicle_inspection', {})
            province_code = unit_info.get('province')
            province_label = get_province_name_by_code(province_code)

            # mapping unit information from frontend to form model
            pdi_entry.brand = brand
            pdi_entry.woNumber = unit_info.get('repairOrderNo')
            pdi_entry.VIN = unit_info.get('vinNo')
            pdi_entry.Date = parse_date(unit_info.get('date'))
            pdi_entry.customer = unit_info.get('customer')
            pdi_entry.mileage = unit_info.get('mileageHourMeter')
            pdi_entry.chassisID = unit_info.get('chassisId')
            pdi_entry.registrationNo = unit_info.get('registrationNo')
            pdi_entry.province = province_label
            pdi_entry.model = unit_info.get('model')
            pdi_entry.engine = unit_info.get('engine')
            pdi_entry.technician = unit_info.get('technician')
            pdi_entry.approvalBy = unit_info.get('approvalBy')
            pdi_entry.vehicle_inspection = vehicle_damage_notes

            # session to add the payload
            db.session.add(pdi_entry)
            db.session.flush()

            # Prepare parallel upload context
            missing_photos = []
            user_id = str(g.user_id)
            brand_lower = brand.lower()
            bucket = get_bucket()
            folder_prefix = get_folder_prefix('pdi', brand_lower, user_id)

            pending_uploads = {}
            item_records = []

            for section_key, items in checklist_item_payloads.items():
                if isinstance(items, dict):
                    for item_key, item_details in items.items():
                        if isinstance(item_details, dict):
                            status = item_details.get("value")
                            primary_key = f"image-{section_key}-{item_key}"
                            alt_key = f"{section_key}.{item_key}.image"
                            file = uploaded_files.get(primary_key) or uploaded_files.get(alt_key)

                            # Require photos for specific statuses
                            if status in ["checked", "recommended_repair", "immediately_repair"]:
                                if not file or not getattr(file, 'filename', None):
                                    missing_photos.append(f"{section_key} - {item_key}")

                            caption = item_details.get('notes')

                            # Validate and schedule upload if file present
                            if file and getattr(file, 'filename', None):
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

                                pending_uploads[(section_key, item_key)] = file

                            # Record base data; set image later
                            item_records.append({
                                'section': section_key,
                                'itemName': item_key,
                                'status': converted_renault_status_to_int(status),
                                'caption': caption,
                                'image_blob_name': None,
                                'value': None,
                            })

            # Early exit if required photos are missing
            if missing_photos:
                db.session.rollback()
                return jsonify({
                    'message': 'Photos are required for items with "Checked", "Repair Recommended" or "Repair Immediately" status',
                    'missing_items': missing_photos
                }), 400

            # Execute uploads in parallel
            if pending_uploads:
                max_workers = min(8, len(pending_uploads))
                future_map = {}
                with ThreadPoolExecutor(max_workers=max_workers) as executor:
                    for key, file in pending_uploads.items():
                        future = executor.submit(upload_blob_with_bucket, file, bucket, folder_prefix)
                        future_map[future] = key

                    upload_errors = []
                    results = {}
                    for future in as_completed(future_map):
                        sec_key, item_key = future_map[future]
                        try:
                            blob_name = future.result()
                            if not blob_name:
                                upload_errors.append(f"{sec_key} - {item_key}")
                            else:
                                results[(sec_key, item_key)] = blob_name
                        except Exception as e:
                            current_app.logger.error(f"Async upload failed for {sec_key} - {item_key}: {str(e)}")
                            upload_errors.append(f"{sec_key} - {item_key}")

                if upload_errors:
                    db.session.rollback()
                    return jsonify({
                        'message': 'Failed to upload some photos',
                        'failed_items': upload_errors
                    }), 500

                # Attach results to records
                for rec in item_records:
                    key = (rec['section'], rec['itemName'])
                    if key in results:
                        rec['image_blob_name'] = results[key]

            # Bulk insert checklist items
            db.session.add_all([
                PDIChecklistItemModel_RT(
                    pdiID=pdi_entry.pdiID,
                    section=rec['section'],
                    itemName=rec['itemName'],
                    status=rec['status'],
                    value=rec['value'],
                    image_blob_name=rec['image_blob_name'],
                    caption=rec['caption'],
                ) for rec in item_records
            ])
            
            # Bulk insert battery status rows
            if isinstance(battery_status_data, dict) and battery_status_data:
                db.session.add_all([
                    PDIChecklistItemModel_RT(
                        pdiID=pdi_entry.pdiID,
                        section='battery_status',
                        itemName=key,
                        value=data_value,
                        status=None,
                        image_blob_name=None,
                        caption=None,
                    ) for key, data_value in battery_status_data.items()
                ])
            
            payload = build_payload(pdi_entry, ["brand", "woNumber", "model", "VIN"])
            notifications_created = dispatch_pdi_notifications(
                entity_type="pre_delivery_inspection",
                entity_id=pdi_entry.pdiID,
                approval_raw=pdi_entry.approvalBy,
                technician=g.user_name,
                payload=payload,
                notify_roles=DEFAULT_SUPERVISION_ROLES,
                technician_raw=unit_info.get("technician"),
            )
            try:
                db.session.commit()
            except Exception as e:
                db.session.rollback()
                current_app.logger.error(f"Database commit failed: {str(e)}")
                return jsonify({'message': f'Database error: {str(e)}'}), 500

            emit_notifications(notifications_created)

            return jsonify({
                'message': 'Renault Pre Delivery Inspection Form submitted successfully!',
                'id': str(pdi_entry.pdiID)
            }), 201

        # for sdlg
        elif brand.lower() == 'sdlg':
            SDLG_ITEM_LABELS = {
                1: "Visual inspection for paint damage and rust protection defects.",
                2: "Check the coolant level in the radiator, check the engine oil level, and check the oil levels in the gearbox, drive axle, and hydraulic system. Check the water level in the front windshield washing system.",
                3: "Remove the anti-fall device of the hydraulic cylinder and clean the rust inhibitor from the piston rod of the hydraulic cylinder.",
                4: "Check the tire pressure, if necessary, adjust the pressure, and check the tightness of the track of the excavator.",
                5: "Start the machine, run it to normal operating temperature, and check whether all system function normally:",
                6: "Check for fuel, water, and oil leaks; if necessary, inspect and tighten all connections and clamps. Ensure that the routing of all hoses and pipes is reasonable without interference",
                7: "Turn off the battery switch"
            }

            unit_info = data.get('unitInfo', {})
            signatures = data.get('signatures', {})
            checklist = data.get('checklist', {})
            defects = data.get('defects', {})

            # mapping unit information from frontend to form model
            pdi_entry.brand = brand
            pdi_entry.woNumber = unit_info.get('woNumber')
            pdi_entry.machineModel = unit_info.get('machineModel')
            pdi_entry.VIN = unit_info.get('vehicleNumber')
            pdi_entry.dateOfCheck = parse_date(unit_info.get('inspectionDate'))
            pdi_entry.technician = unit_info.get('preInspectionPersonnel')
            pdi_entry.approvalBy = unit_info.get('approvalBy')
            pdi_entry.technicianSignature = signatures.get('inspector')
            pdi_entry.technicianSignatureDate = parse_date(signatures.get('inspectorDate'))
            pdi_entry.approverSignature = signatures.get('supervisor')
            pdi_entry.approverSignatureDate = parse_date(signatures.get('supervisorDate'))

            db.session.add(pdi_entry)
            db.session.flush()

            for item_id_str, status in checklist.items():
                try:
                    item_id = int(item_id_str)
                    item_label = SDLG_ITEM_LABELS.get(item_id, f"Unknown item ID: {item_id}")
                except (ValueError, TypeError):
                    item_label = f"Invalid item ID: {item_id_str}"
                
                new_item = PDIChecklistItemModel_SDLG(
                    pdiID=pdi_entry.pdiID,
                    itemName=item_label,
                    status=status
                )
                db.session.add(new_item)

            for defect_entry in defects:
                description = defect_entry.get('description')
                remarks = defect_entry.get('remarks')

                if description or remarks:
                    new_defect = PDI_sdlg_defect_remarks(
                        pdiID = pdi_entry.pdiID,
                        description = defect_entry.get('description'),
                        remarks = defect_entry.get('remarks')
                    )
                    db.session.add(new_defect)
            
            payload = build_payload(pdi_entry, ["brand", "woNumber", "model", "VIN"])
            notifications_created = dispatch_pdi_notifications(
                entity_type="pre_delivery_inspection",
                entity_id=pdi_entry.pdiID,
                approval_raw=pdi_entry.approvalBy,
                technician=g.user_name,
                payload=payload,
                notify_roles=DEFAULT_SUPERVISION_ROLES,
                technician_raw=unit_info.get("preInspectionPersonnel"),
            )
            try:
                db.session.commit()
            except Exception as e:
                db.session.rollback()
                current_app.logger.error(f"Database commit failed: {str(e)}")
                return jsonify({'message': f'Database error: {str(e)}'}), 500

            emit_notifications(notifications_created)

            return jsonify({
                'message': 'SDLG Pre Delivery Inspection form submitted successfully!',
                'id': str(pdi_entry.pdiID)
            }), 201

    except Exception as e:
        db.session.rollback()
        
        if "Violation of UNIQUE KEY constraint" in str(e) or "duplicate key" in str(e).lower():
            return jsonify({'message': f'Duplicate VIN found for {brand.capitalize()}. Please check your input.'}), 409
        
        print(f"Error submitting {brand.capitalize()} checklist: {str(e)}")
        return jsonify({'message': f'Error submitting {brand.capitalize()} checklist: {str(e)}'}), 500
