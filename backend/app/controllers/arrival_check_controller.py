from flask import json, jsonify, request, current_app, g
from app import db
from app.models.renault_checklist_model import RenaultChecklistModel
from app.models.manitou_checklist_model import ManitouChecklistModel
from app.models.sdlg_checklist_model import SDLGChecklistModels
from datetime import datetime, time
from app.controllers.auth_controller import jwt_required

# mapping brand to model database
BRAND_MODELS = {
    'renault': RenaultChecklistModel,
    'manitou': ManitouChecklistModel,
    'sdlg': SDLGChecklistModels,
}

@jwt_required
def submit_arrival_checklist():

    print("DEBUG (ARRIVAL CHECK): Headers received:")
    print(request.headers)

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

    brand = data.get("brand")

    if not brand or brand.lower() not in BRAND_MODELS:
        return jsonify({"error": "Invalid brand"}), 400
    
    ModelClass = BRAND_MODELS[brand.lower()]
    new_checklist_entry = ModelClass()

    try:
        # set created by and created on (common for all brands)
        new_checklist_entry.createdby = g.user_name
        new_checklist_entry.createdon = datetime.utcnow()

        # helper function to convert frontend status to DB Boolean (RT)
        def convert_renault_status_to_boolean(status):
            
            if status == "checked_without_remarks":
                return True #1
            elif status == "checked_with_remarks":
                return False #0
        
        # helper to convert frontend status to DB SmallInteger (Manitou)
        def convert_manitou_status_to_tinyint(status_str):
            
            if status_str and isinstance(status_str, str):
                status_lower = status_str.lower()
                if status_lower == "missing":
                    return 0
                elif status_lower == "good":
                    return 1
                elif status_lower == "bad":
                    return 2
                
        # helper to convert 'Yes'/'No' to Boolean (SDLG)
        def convert_sdlg_status_to_boolean(status_str):
            if isinstance(status_str, str):
                return status_str.lower() == 'yes'
            return bool(status_str)
        
        # Logic for Renault
        if brand.lower() == 'renault':
            new_checklist_entry.woNumber = data.get("woNumber")
            new_checklist_entry.UnitType = data.get("typeModel")
            new_checklist_entry.VIN = data.get("vin")
            new_checklist_entry.EngineNo = data.get("noEngine")
            new_checklist_entry.chassisNumber = data.get("noChassis")
            new_checklist_entry.technician = data.get("technician")
            new_checklist_entry.approvalBy = data.get("approvalBy") 

            date_of_check_str = data.get("dateOfCheck")

            if date_of_check_str:
                try:
                    new_checklist_entry.arrivalDate = datetime.fromisoformat(date_of_check_str.replace('Z', '+00:00')).date()
                except ValueError as e: 
                    print(f"Error parsing date for Renault: {e}") 
                    return jsonify({"message": f"Invalid 'dateOfCheck' format for Renault. Please use ISO 8601 (YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS.sssZ). Error: {e}", "status": "error"}), 400
            else:
                new_checklist_entry.arrivalDate = None

            section_to_db_prefix = {
                "chassisAndCab": "Cab",
                "axleSpringTyre": "Axle",
                "battery": "Battery",
                "electrical": "Electrical",
                "additionalEquipment": "Equipment",
                "functionalCheck": "Functional",
            }

            for section_key_frontend, db_prefix in section_to_db_prefix.items():
                
                items_ids = []
                
                if section_key_frontend == "chassisAndCab":
                    items_ids = range(1, 9)
                elif section_key_frontend == "axleSpringTyre":
                    items_ids = range(1, 5)
                elif section_key_frontend == "battery":
                    items_ids = range(1, 3)
                elif section_key_frontend == "electrical":
                    items_ids = range(1, 7)
                elif section_key_frontend == "additionalEquipment":
                    items_ids = range(1, 4)
                elif section_key_frontend == "functionalCheck":
                    items_ids = range(1, 5)
                
                for i in items_ids:
                    status_key_frontend = f"{section_key_frontend}_{i}_status"
                    remark_key_frontend = f"{section_key_frontend}_{i}_remarks" 

                    db_status_column = f"{db_prefix}{i}"
                    db_remarks_column = f"{db_prefix}{i}Remark"

                    status_value = convert_renault_status_to_boolean(data.get(status_key_frontend))
                    
                    if hasattr(new_checklist_entry, db_status_column):
                        setattr(new_checklist_entry, db_status_column, status_value)
                    
                    if hasattr(new_checklist_entry, db_remarks_column):
                        setattr(new_checklist_entry, db_remarks_column, data.get(remark_key_frontend))
            
            new_checklist_entry.arrival_remarks = data.get("generalRemarks", "")

        # Logic for Manitou
        elif brand.lower() == 'manitou':
            unit_info = data.get("unitInfo", {})
            new_checklist_entry.woNumber = unit_info.get('woNumber')
            new_checklist_entry.UnitType = unit_info.get('model')
            new_checklist_entry.VIN = unit_info.get('serialNo')
            new_checklist_entry.HourMeter = unit_info.get('hourMeter')
            new_checklist_entry.Technician = data.get('technician')
            new_checklist_entry.approvalBy = data.get('approver')
            new_checklist_entry.arrival_remarks = data.get('generalRemarks')

            date_of_check_val = unit_info.get('dateOfCheck')

            if date_of_check_val:
                try:
                    parsed_date = datetime.fromisoformat(date_of_check_val.replace('Z', '+00:00')).date()
                    new_checklist_entry.ArrivalDate = datetime.combine(parsed_date, time(0, 0, 0))
                except ValueError as e:
                    new_checklist_entry.ArrivalDate = None
            else:
                new_checklist_entry.ArrivalDate = None

            checklist_data = data.get('checklistItems', {})
            
            def get_item_data(section_key, item_key):
                item_obj = checklist_data.get(section_key, {}).get(item_key, {})
                return item_obj.get('status'), item_obj.get('caption'), item_obj.get('image')
            
            FRONTEND_TO_DB_MAPPING = {
                'engine': {
                    'airFilter': 'engine1',
                    'fuelFilter': 'engine2',
                    'fuelPipeFilters': 'engine3',
                    'injectionCarburationSystem': 'engine4',
                    'radiatorCoolingSystems': 'engine5',
                    'belts': 'engine6',
                    'hosesEngine': 'engine7',
                },
                'transmission': {
                    'reversingSystem': 'transmission1',
                    'gearOilLeaks': 'transmission2',
                    'directionDisconnectPedal': 'transmission3',
                    'clutch': 'transmission4',
                },
                'axleTransferBox': {
                    'operationTightness': 'axle1',
                    'adjustmentStops': 'axle2',
                },
                'hydraulicHydrostaticCircuits': {
                    'oilTank': 'hydraulic1',
                    'pumpsCoupling': 'hydraulic2',
                    'tightnessOfUnions': 'hydraulic3',
                    'liftingRams': 'hydraulic4',
                    'tiltingRams': 'hydraulic5',
                    'accessoryRams': 'hydraulic6',
                    'telescopeRams': 'hydraulic7',
                    'compensatingRams': 'hydraulic8',
                    'steeringRams': 'hydraulic9',
                    'controlValves': 'hydraulic10',
                    'counterBalanceValve': 'hydraulic11',
                },
                'brakingCircuits': {
                    'serviceBrakeParkingBrakeOperation': 'brake1',
                    'brakeFluidLevel': 'brake2',
                },
                'lubrication': {
                    'lubrication': 'lub',
                },
                'boomMastManiscopicManicess': {
                    'boomTelescopes': 'boom1',
                    'wearPads': 'boom2',
                    'linkage': 'boom3',
                    'carriageBooms': 'boom4',
                    'forksBooms': 'boom5',
                },
                'mastUnit': {
                    'fixedMovableMast': 'mast1',
                    'carriageMast': 'mast2',
                    'chains': 'mast3',
                    'rollers': 'mast4',
                    'forksMastUnit': 'mast5',
                },
                'accessories': {
                    'adaptationToMachine': 'acc1',
                    'hydraulicConnections': 'acc2',
                },
                'cabProtectiveDeviceElectricCircuit': {
                    'seat': 'cab1',
                    'controlPanelRadio': 'cab2',
                    'hornWarningLightSafetyDevice': 'cab3',
                    'heatingAirConditioning': 'cab4',
                    'windscreenWiperWasher': 'cab5',
                    'horns': 'cab6',
                    'backupAlarm': 'cab7',
                    'lighting': 'cab8',
                    'additionalLighting': 'cab9',
                    'rotatingBeacon': 'cab10',
                    'battery': 'cab11',
                },
                'wheels': {
                    'rims': 'wheels1',
                    'tiresPressure': 'wheels2',
                },
                'otherItems': {
                    'screwsNuts': 'nuts',
                    'frameBody': 'body',
                    'namePlate': 'paint',
                    'generalOperation': 'general',
                    'operatorsManual': 'op_manual',
                    'instructionsForCustomer': 'instruction',
                }
            }

            for section_key, items in FRONTEND_TO_DB_MAPPING.items():
                for item_key, db_column_prefix in items.items():
                    status, caption, image = get_item_data(section_key, item_key)

                    # Set status
                    status_column = db_column_prefix
                    if hasattr(new_checklist_entry, status_column):
                        setattr(new_checklist_entry, status_column, convert_manitou_status_to_tinyint(status))

                    caption_column = f'caption_{db_column_prefix}' if not db_column_prefix.startswith(('nuts', 'body', 'paint', 'general', 'op_manual', 'instruction')) else f'caption_{db_column_prefix}'
                    if hasattr(new_checklist_entry, caption_column):
                        setattr(new_checklist_entry, caption_column, caption)

                    img_column = f'img_{db_column_prefix}' if not db_column_prefix.startswith(('nuts', 'body', 'paint', 'general', 'op_manual', 'instruction')) else f'img_{db_column_prefix}'
                    if hasattr(new_checklist_entry, img_column):
                        setattr(new_checklist_entry, img_column, image)

        # Logic for sdlg
        elif brand.lower() == 'sdlg':
            print("DEBUG: Processing SDLG brand data...")

            # Mapping of unit information
            new_checklist_entry.woNumber = data.get("woNumber")
            new_checklist_entry.distributionName = data.get("distributionName")
            new_checklist_entry.containerNo = data.get("containerNo")
            new_checklist_entry.leadSealingNo = data.get("leadSealingNo")
            new_checklist_entry.VIN = data.get("vin")
            new_checklist_entry.dateOfCheck = data.get("dateOfCheck")
            new_checklist_entry.inspectorSignature = data.get("inspectorSignature")
            new_checklist_entry.approvalBy = data.get("approverSignature")

            new_checklist_entry.unitLanded = datetime.fromisoformat(data.get("unitLanded")) if data.get("unitLanded") else None
            new_checklist_entry.clearanceCustom = convert_sdlg_status_to_boolean(data.get("clearanceCustom"))
            new_checklist_entry.unitStripping = datetime.fromisoformat(data.get("unitStripping")) if data.get("unitStripping") else None

            # Mapping checklist items (sn1 - sn11)
            for i in range(1, 12):
                sn_key = f"sn{i}"
                
                if sn_key in data:
                    setattr(new_checklist_entry, sn_key, data.get(sn_key))
            
            # Mapping remarks
            new_checklist_entry.remarks = data.get("remarks")

        db.session.add(new_checklist_entry)
        db.session.commit()

        # Return appropriate ID based on the model
        return jsonify({
            'message': f'{brand.capitalize()} Checklist submitted successfully!', 
            'id': str(new_checklist_entry.ArrivalID if hasattr(new_checklist_entry, 'ArrivalID') else new_checklist_entry.AC_ID)
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
    if hasattr(ModelClass, 'AC_ID'):
        pk_column = ModelClass.AC_ID
    elif hasattr(ModelClass, 'ArrivalID'):
        pk_column = ModelClass.ArrivalID
    
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

    vin_exists = False
    
    for brand_key, ModelClass in BRAND_MODELS.items():
        if hasattr(ModelClass, 'VIN'):
            if ModelClass.VIN.type.__class__.__name__ == 'UNIQUEIDENTIFIER':
                try:
                    existing_entry = db.session.query(ModelClass).filter(ModelClass.VIN == vin).first()
                except ValueError:
                    existing_entry = None
            else:
                existing_entry = db.session.query(ModelClass).filter(ModelClass.VIN == vin).first()
            
            if existing_entry:
                vin_exists = True
                break
        else:
            print(f"DEBUG: Model {brand_key} does not have a 'VIN' column defined.")
    
    return jsonify({'exists': vin_exists}), 200