from flask import json, jsonify, request, current_app, g
from app import db
from app.models.renault_maintenance_model import RenaultMaintenanceModel
from app.models.manitou_maintenance_model import ManitouMaintenanceModel
# from app.models.sdlg_maintenance_model import SDLGMaintenanceModel
from datetime import datetime, time, date
from app.controllers.auth_controller import jwt_required
import uuid

# mapping for brand Models
BRAND_MODELS = {
    'renault': RenaultMaintenanceModel,
    'manitou': ManitouMaintenanceModel
    # sdlg
}

@jwt_required
def submit_maintenance_checklist():

    print("DEBUG (ARRIVAL CHECK): Headers received:")
    print(request.headers)

    data = request.get_json()
    brand = data.get("brand")

    print(f"DEBUG: Data received from frontend: {data}")
    print(f"DEBUG: Brand received from frontend: {brand}")

    if not brand or brand.lower() not in BRAND_MODELS:
        return jsonify({"error": "Invalid Brand"}), 400
    
    ModelClass = BRAND_MODELS[brand.lower()]
    new_checklist_entry = ModelClass()

    try:
        new_checklist_entry.createdby = g.user_name
        new_checklist_entry.createdon = datetime.utcnow()

        def converted_renault_status_to_int(status):

            if status and isinstance(status, str):
                status_lower = status.lower()
                if status_lower == "repaired":
                    return 1
                elif status_lower == "recommended_repair":
                    return 2
                elif status_lower == "immediately_repair":
                    return 3
                elif status_lower == "not_applicable":
                    return 0
            return None
        
        def converted_manitou_status_to_tinyint(status_str):
            
            if status_str and isinstance(status_str, str):
                status_lower = status_str.lower()
                if status_lower == "missing":
                    return 0
                elif status_lower == "good":
                    return 1
                elif status_lower == "bad":
                    return 2
            return None

        if brand.lower() == 'renault':
            unit_info = data.get('unitInfo', {})
            checklist_items = data.get('checklistItems', {})
            battery_inspection = data.get('batteryInspection', [])
            fault_codes = data.get('faultCodes', [])
            repair_notes = data.get('repairNotes')
    
            # mapping data for unit information
            new_checklist_entry.VIN = unit_info.get("vinNo")
            new_checklist_entry.engineType = unit_info.get("engineTypeNo")
            new_checklist_entry.transmissionType = unit_info.get("transmissionTypeNo")
            new_checklist_entry.hourMeter = unit_info.get("hourMeter")
            new_checklist_entry.mileage = unit_info.get("mileage")
            new_checklist_entry.woNumber = unit_info.get("repairOrderNo")
            new_checklist_entry.technician = unit_info.get("technician")
            new_checklist_entry.approvalBy = unit_info.get("approvalBy")

            # parsing date
            date_str = unit_info.get('dateOfCheck')
            
            if date_str:
                try:
                    new_checklist_entry.dateOfCheck = datetime.fromisoformat(date_str.replace('Z', ''))
                except ValueError:
                    return jsonify({"message": "Invalid date format"}), 400
            
            # mapping checklist (ops1 - ops52)
            renault_mapping = {
                # Operations in Cab (ops1 - ops6)
                'operationsInCab.doorLocksRemoteControl': 'ops1',
                'operationsInCab.parkingBrake': 'ops2',
                'operationsInCab.elementsOfVision': 'ops3',
                'operationsInCab.safetyElements': 'ops4',
                'operationsInCab.dashboardInstrumentation': 'ops5',
                'operationsInCab.airConditioningHeating': 'ops6',

                # Operations Around Vehicle (ops7 - ops24)
                'operationsAroundVehicle.cabGeneralCondition': 'ops7',
                'operationsAroundVehicle.windscreenWiperBlades': 'ops8',
                'operationsAroundVehicle.windscreenWasherLiquid': 'ops9',
                'operationsAroundVehicle.coolantLevel': 'ops10',
                'operationsAroundVehicle.clutchFluidLevel': 'ops11',
                'operationsAroundVehicle.engineOilLevel': 'ops12',
                'operationsAroundVehicle.radiatorsInsectNet': 'ops13',
                'operationsAroundVehicle.cabFrontRotationPoints': 'ops14',
                'operationsAroundVehicle.frontStepsCondition': 'ops15',
                'operationsAroundVehicle.fuelPreFilterWaterContent': 'ops16',
                'operationsAroundVehicle.lightsSignaling': 'ops17',
                'operationsAroundVehicle.wheelHubReductionsLeakTightness': 'ops18',
                'operationsAroundVehicle.wheelHubReductionsOilLevel': 'ops19',
                'operationsAroundVehicle.tirePressure': 'ops20',
                'operationsAroundVehicle.accumulatorBatteriesFixing': 'ops21',
                'operationsAroundVehicle.batteryAnalyzerCheck': 'ops22',
                'operationsAroundVehicle.fuelTankBreatherTubes': 'ops23',
                'operationsAroundVehicle.fifthWheelTowingHook': 'ops24',

                # Operations under cab (ops25 - ops31)
                'operationsUnderCab.cabFixingUnlockingSystem': 'ops25',
                'operationsUnderCab.wiringBundleEngineCoolantCircuit': 'ops26',
                'operationsUnderCab.engineLeakTightness': 'ops27',
                'operationsUnderCab.soundProofingScreens': 'ops28',
                'operationsUnderCab.steeringComponentsState': 'ops29',
                'operationsUnderCab.engineOilFilterChange': 'ops30',
                'operationsUnderCab.engineOilChange': 'ops31',

                # operations under vehicle (ops32 - ops47)
                'operationsUnderVehicle.chassisGrease': 'ops32',
                'operationsUnderVehicle.driveAxleLeakTightness': 'ops33',
                'operationsUnderVehicle.driveAxleOilLevel': 'ops34',
                'operationsUnderVehicle.brakingSystemState': 'ops35',
                'operationsUnderVehicle.springsPadsAntiRollBarsShockAbsorbers': 'ops36',
                'operationsUnderVehicle.wiringBundlesChassis': 'ops37',
                'operationsUnderVehicle.compressedAirTanksWaterOil': 'ops38',
                'operationsUnderVehicle.transferBoxLeakTightness': 'ops39',
                'operationsUnderVehicle.transferBoxOilLevel': 'ops40',
                'operationsUnderVehicle.fuelTanksLeakTightness': 'ops41',
                'operationsUnderVehicle.exhaustLineCondition': 'ops42',
                'operationsUnderVehicle.ptoLeakTightness': 'ops43',
                'operationsUnderVehicle.gearboxLeakTightness': 'ops44',
                'operationsUnderVehicle.gearboxOilLevel': 'ops45',
                'operationsUnderVehicle.steeringComponents': 'ops46',
                'operationsUnderVehicle.engineLeakTightness2': 'ops47',

                # dynamic Testing (ops 48 - ops 52)
                'dynamicTesting.engineNoiseSmokePerformance': 'ops48',
                'dynamicTesting.gearboxClutchOperation': 'ops49',
                'dynamicTesting.steeringSystemOperation': 'ops50',
                'dynamicTesting.brakingReactionsDirectionHolding': 'ops51',
                'dynamicTesting.roadTestFunctions': 'ops52',
            }

            # loop through checklist_mapping for fulfill ops column
            for frontend_path, db_column in renault_mapping.items():
                section, item_key = frontend_path.split('.')
                status_value = checklist_items.get(section, {}).get(item_key)
                
                converted_value = converted_renault_status_to_int(status_value)
                
                if converted_value is not None and hasattr(new_checklist_entry, db_column):
                    setattr(new_checklist_entry, db_column, converted_value)

            # mapping battery
            if len(battery_inspection) > 0:
                new_checklist_entry.FRBattery_electrolyte_level = battery_inspection[0].get('electrolyteLevel')
                new_checklist_entry.FRBattery_statusOn = battery_inspection[0].get('statusOnBatteryAnalyzer')
            
                voltage_str = battery_inspection[0].get('voltage')
                
                if voltage_str is not None:
                    new_checklist_entry.FRBattery_voltage = int(voltage_str)
            
            if len(battery_inspection) > 1:
                new_checklist_entry.RRBattery_electrolyte_level = battery_inspection[1].get('electrolyteLevel')
                new_checklist_entry.RRBattery_statusOn = battery_inspection[1].get('statusOnBatteryAnalyzer')

                voltage_str = battery_inspection[1].get('voltage')
                
                if voltage_str is not None:
                    new_checklist_entry.RRBattery_voltage = int(voltage_str)

            # mapping Fault Codes
            for i, fault in enumerate(fault_codes):
                if i < 5:
                    setattr(new_checklist_entry, f'FaultCode{i+1}', fault.get('faultCode'))
                    setattr(new_checklist_entry, f'status{i+1}', fault.get('status'))
            
            # Mapping Repair Notes
            new_checklist_entry.generalRemarks = repair_notes

        elif brand.lower() == 'manitou':
            unit_info = data.get("unitInfo", {})
            new_checklist_entry.model = unit_info.get('model')
            new_checklist_entry.VIN = unit_info.get('serialNo')
            new_checklist_entry.HM = unit_info.get('hourMeter')
            new_checklist_entry.technician = unit_info.get('technician')
            new_checklist_entry.approvalBy = unit_info.get('approvalBy')
            new_checklist_entry.remarks = data.get('remarks')

            date_of_check_val = unit_info.get('dateOfCheck')
            
            if date_of_check_val:
                try:
                    parsed_date = datetime.fromisoformat(date_of_check_val.replace('Z', '+00:00')).date()
                    new_checklist_entry.dateOfCheck = datetime.combine(parsed_date, time(0, 0, 0))
                except ValueError as e:
                    print(f"Error parsing date for Manitou: {e}")
                    new_checklist_entry.dateOfCheck = None
            else:
                new_checklist_entry.dateOfCheck = None

            checklist_data = data.get('checklistItems', {})

            manitou_mapping = {
                ('engine', 'oilLevel'): 'engine1',
                ('engine', 'fuelPipeFilters'): 'engine2',
                ('engine', 'radiatorCoolingSystems'): 'engine3',
                ('engine', 'runAt15Minutes'): 'engine4',
                ('engine', 'belts'): 'engine5',
                ('engine', 'hosesEngine'): 'engine6',
                ('engine', 'Battery'): 'engine7',

                ('driveline', 'driveMachineFrRv'): 'driveline1',
                ('driveline', 'controlGears'): 'driveline2',
                ('driveline', 'transFluid'): 'driveline3',
                ('driveline', 'lubricatePivot'): 'driveline4',

                ('hydraulicHydrostaticCircuits', 'oilTank'): 'hydraulic1',
                ('hydraulicHydrostaticCircuits', 'checkCylinderRod'): 'hydraulic2',
                ('hydraulicHydrostaticCircuits', 'testAllHydraulic'): 'hydraulic3',
                ('hydraulicHydrostaticCircuits', 'lubricateCylinder'): 'hydraulic4',
                ('hydraulicHydrostaticCircuits', 'useCrabArticulated'): 'hydraulic5',

                ('brakingCircuits', 'checkServiceParkingBrake'): 'braking1',
                ('brakingCircuits', 'checkBrakeFluidLevel'): 'braking2',

                ('boomMastManiscopicManicess', 'boomTelescopes'): 'boom1',
                ('boomMastManiscopicManicess', 'lubricatePinsPivots'): 'boom2',
                ('boomMastManiscopicManicess', 'lubricateCirclipsPin'): 'boom3',

                ('mastUnit', 'fixedMovableMast'): 'mast1',
                ('mastUnit', 'carriageMast'): 'mast2',
                ('mastUnit', 'lubricateChain'): 'mast3',
                ('mastUnit', 'lubricateRoller'): 'mast4',

                ('accessories', 'adaptationToMachine'): 'acc1',
                ('accessories', 'hydraulicConnections'): 'acc2',
                ('accessories', 'functionTest'): 'acc3',

                ('cabProtectiveDeviceElectricCircuit', 'seat'): 'cab1',
                ('cabProtectiveDeviceElectricCircuit', 'controlPanelRadio'): 'cab2',
                ('cabProtectiveDeviceElectricCircuit', 'hornWarningLightSafetyDevice'): 'cab3',
                ('cabProtectiveDeviceElectricCircuit', 'heatingAirConditioning'): 'cab4',
                ('cabProtectiveDeviceElectricCircuit', 'windscreenWiperWasher'): 'cab5',
                ('cabProtectiveDeviceElectricCircuit', 'horns'): 'cab6',
                ('cabProtectiveDeviceElectricCircuit', 'backupAlarm'): 'cab7',
                ('cabProtectiveDeviceElectricCircuit', 'lighting'): 'cab8',
                ('cabProtectiveDeviceElectricCircuit', 'additionalLighting'): 'cab9',
                ('cabProtectiveDeviceElectricCircuit', 'rotatingBeacon'): 'cab10',

                ('wheels', 'rims'): 'wheels1',
                ('wheels', 'tiresPressure'): 'wheels2',
                ('screwsAndNuts', 'screwsAndNuts'): 'screw',
                ('frameBody', 'lubricateStrainGauge'): 'frame1',
                ('frameBody', 'lubricatePivots'): 'frame2',
                ('paint', 'paint'): 'paint',

                ('generalOperation', 'generalOperation'): 'general',
                ('operatorsManual', 'operatorsManual'): 'operator',
                ('instructionsForCustomer', 'instructionsForCustomer'): 'instruction',
            }
            
            for (section, item), db_column in manitou_mapping.items():
                if section:
                    status_value_str = checklist_data.get(section, {}).get(item)
                    converted_value = converted_manitou_status_to_tinyint(status_value_str)
                else:
                    status_value_str = checklist_data.get(item)
                    converted_value = converted_manitou_status_to_tinyint(status_value_str)

                if converted_value is not None and hasattr(new_checklist_entry, db_column):
                    setattr(new_checklist_entry, db_column, converted_value)
                elif not hasattr(new_checklist_entry, db_column):
                    print(f"WARNING: DB column '{db_column}' not found in model.")
            
        elif brand.lower() == 'sdlg':
            # Logic for SDLG (Placeholder)
            # ...
            pass
        
        db.session.add(new_checklist_entry)
        db.session.commit()

        return jsonify({
            'message': f'{brand.capitalize()} Checklist submitted successfully!', 
            'id': str(new_checklist_entry.storageID)
        }), 201
    
    except Exception as e:
        db.session.rollback()
        
        if "Violation of UNIQUE KEY constraint" in str(e) or "duplicate key" in str(e).lower():
            return jsonify({'message': f'Duplicate VIN found for {brand.capitalize()}. Please check your input.'}), 409
        
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
    
    if hasattr(ModelClass, 'storageID'):
        pk_column = ModelClass.storageID
    elif hasattr(ModelClass, 'ArrivalID'):
        pk_column = ModelClass.ArrivalID
    
    if not pk_column:
        return jsonify({'message': 'Primary key column not found for this model'}), 500

    checklist = ModelClass.query.filter(pk_column == item_id).first()
    
    if checklist:
        return jsonify(checklist.to_dict()), 200
    
    return jsonify({'message': 'Checklist not found for this brand and ID'}), 404