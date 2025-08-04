from flask import json, jsonify, request, current_app, g
from app import db
from app.models.renault_checklist_model import RenaultChecklistModel
from app.models.manitou_checklist_model import ManitouChecklistModel
from datetime import datetime, time, date
from app.controllers.auth_controller import jwt_required
import uuid

# mapping brand to model database
BRAND_MODELS = {
    'renault': RenaultChecklistModel,
    'manitou': ManitouChecklistModel,
    # sdlg
}

@jwt_required
def submit_arrival_checklist():

    print("DEBUG (ARRIVAL CHECK): Headers received:")
    print(request.headers)

    data = request.get_json()
    brand = data.get("brand")

    # --- DEBUG: Print data received from frontend ---
    print(f"DEBUG: Data received from frontend: {data}")
    print(f"DEBUG: Brand received: {brand}")
    # --- END DEBUG ---

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
        
        # Logic for Renault
        if brand.lower() == 'renault':
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
            new_checklist_entry.UnitType = unit_info.get('model')
            new_checklist_entry.VIN = unit_info.get('serialNo')
            new_checklist_entry.HourMeter = unit_info.get('hourMeter')
            new_checklist_entry.Technician = data.get('technician')
            new_checklist_entry.approvalBy = data.get('approver')
            new_checklist_entry.arrival_remarks = data.get('generalRemarks')

            date_of_check_val = unit_info.get('dateOfCheck')

            # --- DEBUG: Check Manitou specific values ---
            print(f"DEBUG (Manitou): unitInfo from frontend: {unit_info}")
            print(f"DEBUG (Manitou): dateOfCheck from unitInfo: {date_of_check_val}")
            # --- END DEBUG ---

            if date_of_check_val:
                try:
                    parsed_date = datetime.fromisoformat(date_of_check_val.replace('Z', '+00:00')).date()
                    new_checklist_entry.ArrivalDate = datetime.combine(parsed_date, time(0, 0, 0))
                    print(f"DEBUG (Manitou): Parsed ArrivalDate: {parsed_date}") # DEBUG
                except ValueError as e:
                    print(f"Error parsing date for Manitou: {e}")
                    new_checklist_entry.ArrivalDate = None
            else:
                new_checklist_entry.ArrivalDate = None

            checklist_data = data.get('checklistItems', {})
            print(f"DEBUG (Manitou): checklistItems from frontend: {checklist_data}") # DEBUG

            # Engine
            new_checklist_entry.engine1 = convert_manitou_status_to_tinyint(checklist_data.get('engine', {}).get('airFilter'))
            new_checklist_entry.engine2 = convert_manitou_status_to_tinyint(checklist_data.get('engine', {}).get('fuelFilter'))
            new_checklist_entry.engine3 = convert_manitou_status_to_tinyint(checklist_data.get('engine', {}).get('fuelPipeFilters'))
            new_checklist_entry.engine4 = convert_manitou_status_to_tinyint(checklist_data.get('engine', {}).get('injectionCarburationSystem'))
            new_checklist_entry.engine5 = convert_manitou_status_to_tinyint(checklist_data.get('engine', {}).get('radiatorCoolingSystems'))
            new_checklist_entry.engine6 = convert_manitou_status_to_tinyint(checklist_data.get('engine', {}).get('belts'))
            new_checklist_entry.engine7 = convert_manitou_status_to_tinyint(checklist_data.get('engine', {}).get('hosesEngine'))

            # Transmission
            new_checklist_entry.transmission1 = convert_manitou_status_to_tinyint(checklist_data.get('transmission', {}).get('reversingSystem'))
            new_checklist_entry.transmission2 = convert_manitou_status_to_tinyint(checklist_data.get('transmission', {}).get('gearOilLeaks'))
            new_checklist_entry.transmission3 = convert_manitou_status_to_tinyint(checklist_data.get('transmission', {}).get('directionDisconnectPedal'))
            new_checklist_entry.transmission4 = convert_manitou_status_to_tinyint(checklist_data.get('transmission', {}).get('clutch'))

            # axle
            new_checklist_entry.axle1 = convert_manitou_status_to_tinyint(checklist_data.get('axleTransferBox', {}).get('operationTightness'))
            new_checklist_entry.axle2 = convert_manitou_status_to_tinyint(checklist_data.get('axleTransferBox', {}).get('adjustmentStops'))

            # Hydraulic/Hydrostatic Circuits
            new_checklist_entry.hydraulic1 = convert_manitou_status_to_tinyint(checklist_data.get('hydraulicHydrostaticCircuits', {}).get('oilTank'))
            new_checklist_entry.hydraulic2 = convert_manitou_status_to_tinyint(checklist_data.get('hydraulicHydrostaticCircuits', {}).get('pumpsCoupling'))
            new_checklist_entry.hydraulic3 = convert_manitou_status_to_tinyint(checklist_data.get('hydraulicHydrostaticCircuits', {}).get('tightnessOfUnions'))
            new_checklist_entry.hydraulic4 = convert_manitou_status_to_tinyint(checklist_data.get('hydraulicHydrostaticCircuits', {}).get('liftingRams'))
            new_checklist_entry.hydraulic5 = convert_manitou_status_to_tinyint(checklist_data.get('hydraulicHydrostaticCircuits', {}).get('tiltingRams'))
            new_checklist_entry.hydraulic6 = convert_manitou_status_to_tinyint(checklist_data.get('hydraulicHydrostaticCircuits', {}).get('accessoryRams'))
            new_checklist_entry.hydraulic7 = convert_manitou_status_to_tinyint(checklist_data.get('hydraulicHydrostaticCircuits', {}).get('telescopeRams'))
            new_checklist_entry.hydraulic8 = convert_manitou_status_to_tinyint(checklist_data.get('hydraulicHydrostaticCircuits', {}).get('compensatingRams'))
            new_checklist_entry.hydraulic9 = convert_manitou_status_to_tinyint(checklist_data.get('hydraulicHydrostaticCircuits', {}).get('steeringRams'))
            new_checklist_entry.hydraulic10 = convert_manitou_status_to_tinyint(checklist_data.get('hydraulicHydrostaticCircuits', {}).get('controlValves'))
            new_checklist_entry.hydraulic11 = convert_manitou_status_to_tinyint(checklist_data.get('hydraulicHydrostaticCircuits', {}).get('counterBalanceValve'))

            # Braking Circuits
            new_checklist_entry.brake1 = convert_manitou_status_to_tinyint(checklist_data.get('brakingCircuits', {}).get('serviceBrakeParkingBrakeOperation'))
            new_checklist_entry.brake2 = convert_manitou_status_to_tinyint(checklist_data.get('brakingCircuits', {}).get('brakeFluidLevel'))

            # Lubrication
            new_checklist_entry.lub1 = convert_manitou_status_to_tinyint(checklist_data.get('lubrication', {}).get('lubrication'))

            # Boom/Mast Maniscopic/Manicess
            new_checklist_entry.boom1 = convert_manitou_status_to_tinyint(checklist_data.get('boomMastManiscopicManicess', {}).get('boomTelescopes'))
            new_checklist_entry.boom2 = convert_manitou_status_to_tinyint(checklist_data.get('boomMastManiscopicManicess', {}).get('wearPads'))
            new_checklist_entry.boom3 = convert_manitou_status_to_tinyint(checklist_data.get('boomMastManiscopicManicess', {}).get('linkage'))
            new_checklist_entry.boom4 = convert_manitou_status_to_tinyint(checklist_data.get('boomMastManiscopicManicess', {}).get('carriageBooms'))
            new_checklist_entry.boom5 = convert_manitou_status_to_tinyint(checklist_data.get('boomMastManiscopicManicess', {}).get('forksBooms'))

            # Mast Unit
            new_checklist_entry.mast1 = convert_manitou_status_to_tinyint(checklist_data.get('mastUnit', {}).get('fixedMovableMast'))
            new_checklist_entry.mast2 = convert_manitou_status_to_tinyint(checklist_data.get('mastUnit', {}).get('carriageMast'))
            new_checklist_entry.mast3 = convert_manitou_status_to_tinyint(checklist_data.get('mastUnit', {}).get('chains'))
            new_checklist_entry.mast4 = convert_manitou_status_to_tinyint(checklist_data.get('mastUnit', {}).get('rollers'))
            new_checklist_entry.mast5 = convert_manitou_status_to_tinyint(checklist_data.get('mastUnit', {}).get('forksMastUnit'))

            # Accessories
            new_checklist_entry.acc1 = convert_manitou_status_to_tinyint(checklist_data.get('accessories', {}).get('adaptationToMachine'))
            new_checklist_entry.acc2 = convert_manitou_status_to_tinyint(checklist_data.get('accessories', {}).get('hydraulicConnections'))

            # Cab Protective Device Electric Circuit
            new_checklist_entry.cab1 = convert_manitou_status_to_tinyint(checklist_data.get('cabProtectiveDeviceElectricCircuit', {}).get('seat'))
            new_checklist_entry.cab2 = convert_manitou_status_to_tinyint(checklist_data.get('cabProtectiveDeviceElectricCircuit', {}).get('controlPanelRadio'))
            new_checklist_entry.cab3 = convert_manitou_status_to_tinyint(checklist_data.get('cabProtectiveDeviceElectricCircuit', {}).get('hornWarningLightSafetyDevice'))
            new_checklist_entry.cab4 = convert_manitou_status_to_tinyint(checklist_data.get('cabProtectiveDeviceElectricCircuit', {}).get('heatingAirConditioning'))
            new_checklist_entry.cab5 = convert_manitou_status_to_tinyint(checklist_data.get('cabProtectiveDeviceElectricCircuit', {}).get('windscreenWiperWasher'))
            new_checklist_entry.cab6 = convert_manitou_status_to_tinyint(checklist_data.get('cabProtectiveDeviceElectricCircuit', {}).get('horns'))
            new_checklist_entry.cab7 = convert_manitou_status_to_tinyint(checklist_data.get('cabProtectiveDeviceElectricCircuit', {}).get('backupAlarm'))
            new_checklist_entry.cab8 = convert_manitou_status_to_tinyint(checklist_data.get('cabProtectiveDeviceElectricCircuit', {}).get('lighting'))
            new_checklist_entry.cab9 = convert_manitou_status_to_tinyint(checklist_data.get('cabProtectiveDeviceElectricCircuit', {}).get('additionalLighting'))
            new_checklist_entry.cab10 = convert_manitou_status_to_tinyint(checklist_data.get('cabProtectiveDeviceElectricCircuit', {}).get('rotatingBeacon'))
            new_checklist_entry.cab11 = convert_manitou_status_to_tinyint(checklist_data.get('cabProtectiveDeviceElectricCircuit', {}).get('battery'))

            # Wheels
            new_checklist_entry.wheels1 = convert_manitou_status_to_tinyint(checklist_data.get('wheels', {}).get('rims'))
            new_checklist_entry.wheels2 = convert_manitou_status_to_tinyint(checklist_data.get('wheels', {}).get('tiresPressure'))

            # Other Items (flat in frontend state)
            new_checklist_entry.nuts = convert_manitou_status_to_tinyint(checklist_data.get('screwsNuts'))
            new_checklist_entry.body = convert_manitou_status_to_tinyint(checklist_data.get('frameBody'))
            new_checklist_entry.paint = convert_manitou_status_to_tinyint(checklist_data.get('namePlate'))
            new_checklist_entry.general = convert_manitou_status_to_tinyint(checklist_data.get('general'))
            new_checklist_entry.op_manual = convert_manitou_status_to_tinyint(checklist_data.get('operatorsManual'))
            new_checklist_entry.instruction = convert_manitou_status_to_tinyint(checklist_data.get('instructionsForCustomer'))
            
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