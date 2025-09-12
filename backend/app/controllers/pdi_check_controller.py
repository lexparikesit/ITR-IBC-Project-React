from flask import json, jsonify, request, g
from app import db
from app.models.renault_pdi_model import RenaultPDIModel
from app.models.manitou_pdi_model import ManitouPDI
from app.models.sdlg_pdi_model import SdlgPDIModel, SDLGDefectsAndRemarksPDI
from datetime import datetime
from app.controllers.auth_controller import jwt_required
import uuid

# mapping for brand Models
BRAND_MODELS = {
    'renault': RenaultPDIModel,
    'manitou': ManitouPDI,
    'sdlg': SdlgPDIModel,
}

@jwt_required
def submit_pdi_form():

    print("DEBUG (PDI CHECK): Headers received:")
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
        return jsonify({"error": "Invalid Brand"}), 400

    ModelClass = BRAND_MODELS.get(brand.lower())
    new_pdi_entry = ModelClass()

    try:
        new_pdi_entry.createdBy = g.user_name
        new_pdi_entry.createdOn = datetime.utcnow()

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
        
        def converted_manitou_status_to_int(status_str):
            if status_str and isinstance(status_str, str):
                status_lower = status_str.lower()  
                if status_lower == "missing":
                    return 0
                elif status_lower == "good":
                    return 1
                elif status_lower == "bad":
                    return 2
            return None
        
        # logic for Renault
        if brand.lower() == 'renault':
            unit_info = data.get('unitInfo', {})
            checklist_items = data.get('checklistItems', {})
            battery_status = data.get('batteryStatus', {})
            
            # vehicle inspections notes
            vehicle_inspection_notes = data.get('vehicle_innspection', '')

            # Mapping data for unit information
            new_pdi_entry.WO = unit_info.get('WO')
            new_pdi_entry.mileage = unit_info.get('mileage')
            new_pdi_entry.chassisID = unit_info.get('chassisID')
            new_pdi_entry.registrationNo = unit_info.get('registrationNO')
            new_pdi_entry.customer = unit_info.get('customer')
            new_pdi_entry.city = unit_info.get('city')
            new_pdi_entry.model = unit_info.get('model')
            new_pdi_entry.engine = unit_info.get('engine')
            new_pdi_entry.axle = unit_info.get('axle')
            new_pdi_entry.VIN = unit_info.get('VIN')
            new_pdi_entry.technicians = unit_info.get('technician')
            new_pdi_entry.approvalBy = unit_info.get('approvalBy')

            # Parsing date
            date_str = unit_info.get('date')
            if date_str:
                try:
                    new_pdi_entry.Date = datetime.fromisoformat(date_str.replace('Z', ''))
                except ValueError:
                    return jsonify({"message": "Invalid date format"}), 400

            # Mapping checklist items (payload sudah flattened)
            renault_mapping = {
                'lubricationOilAndFluidLevels.chargeBattery': 'lub1',
                'lubricationOilAndFluidLevels.batteryChargeFluidLevel': 'lub2',
                'lubricationOilAndFluidLevels.lubricateLeafSuspensionBushings': 'lub3',
                'lubricationOilAndFluidLevels.fluidLevelsWindscreenHeadlamp': 'lub4',
                'lubricationOilAndFluidLevels.coolantLevel': 'lub5',
                'lubricationOilAndFluidLevels.engineOilLevel': 'lub6',
                'lubricationOilAndFluidLevels.adBlueLevel': 'lub7',
                'lubricationOilAndFluidLevels.replaceBatteryCable': 'lub8',
                'lubricationOilAndFluidLevels.installChocks': 'lub9',
                'lubricationOilAndFluidLevels.activateLubricateFifthWheel': 'lub10',

                'cab.connectDisconnectDiagnosticTool': 'cab1',
                'cab.activateElectricalSystem': 'cab2',
                'cab.connectivityCheck': 'cab3',
                'cab.activateRadio': 'cab4',
                'cab.activateAntiTheftAlarm': 'cab5',
                'cab.checkWarningControlLamps': 'cab6',
                'cab.functionCheckParkingHeater': 'cab7',

                'exterior.attachExhaustTailPipe': 'ext1',
                'exterior.checkCabChassis': 'ext2',
                'exterior.checkWheelNuts': 'ext3',
                'exterior.checkTyrePressure': 'ext4',
                'exterior.installLicensePlate': 'ext5',
                'exterior.installAirDeflector': 'ext6',
                'exterior.removeSpareWheel': 'ext7',

                'underVehicle.removeScrewChargeAirCooler': 'under1',
                'underVehicle.checkLoadSensingValve': 'under2',
                'underVehicle.checkSuperstructure': 'under3',

                'testDrive.checkAfterStart': 'test_drive1',
                'testDrive.checkDuringRoadTest': 'test_drive2',
                'testDrive.checkAfterRoadTest': 'test_drive3',
                
                'finish.removeProtectiveFilm': 'finish1',
                'finish.finish': 'finish2',
                'finish.brakeAdaptation': 'finish3',
            }

            for frontend_path, db_column in renault_mapping.items():
                sections = frontend_path.split('.')
                current_data = checklist_items

                for section in sections[:-1]:
                    current_data = current_data.get(section, {})
                
                item_key = sections[-1]

                status_value = current_data.get(item_key)
                caption_value = current_data.get(f'caption_{item_key}')
                image_value = current_data.get(f'img_{item_key}')

                converted_value = converted_renault_status_to_int(status_value)

                if converted_value is not None and hasattr(new_pdi_entry, db_column):
                    setattr(new_pdi_entry, db_column, converted_value)
                
                caption_db_column = f'caption_{db_column}'

                if caption_value is not None and hasattr(new_pdi_entry, caption_db_column):
                    setattr(new_pdi_entry, caption_db_column, caption_value)
                
                img_db_column = f'img_{db_column}'
                
                if image_value and hasattr(new_pdi_entry, img_db_column):
                    setattr(new_pdi_entry, img_db_column, image_value)

                # Mapping status battery
                if battery_status:
                    new_pdi_entry.batt_inner_front = battery_status.get('batt_inner_front')
                    new_pdi_entry.test_code_batt_inner_front = battery_status.get('test_code_batt_inner_front')
                    new_pdi_entry.batt_outer_rear = battery_status.get('batt_outer_rear')
                    new_pdi_entry.test_code_batt_outer_rear = battery_status.get('test_code_batt_outer_rear')

                # Mapping vehicle inspection
                new_pdi_entry.vehicle_inspection = vehicle_inspection_notes
        
        # logic for Manitou
        elif brand.lower() == 'manitou':
            unit_info = data.get('unitInfo', {})
            checklist_items = data.get('checklistItems', {})
            general_remarks = data.get('generalRemarks', '')
            remarks_transport = data.get('remarksTransport', '')

            # Mapping unit information
            new_pdi_entry.dealerCode = unit_info.get('dealerCode')
            new_pdi_entry.machineType = unit_info.get('machineType')
            new_pdi_entry.VIN = unit_info.get('serialNumber')
            new_pdi_entry.HourMeter = unit_info.get('HourMeter')
            new_pdi_entry.inspectorSignature = unit_info.get('inspectorSignature')
            new_pdi_entry.approver = unit_info.get('approvalBy')
            new_pdi_entry.customer = unit_info.get('customers')
            new_pdi_entry.woNumber = unit_info.get('woNumber')
            
            # Parsing dates
            delivery_date_str = unit_info.get('deliveryDate')
            checking_date_str = unit_info.get('checkingDate')
            
            # delivery date
            if delivery_date_str:
                try:
                    new_pdi_entry.deliveryDate = datetime.strptime(delivery_date_str, '%Y-%m-%d')
                except ValueError:
                    return jsonify({"message": "Invalid delivery date format. Please use YYYY-MM-DD."}), 400
            else:
                new_pdi_entry.deliveryDate = None

            # checking date
            if checking_date_str:
                try:
                    new_pdi_entry.checkingDate = datetime.strptime(checking_date_str, '%Y-%m-%d')
                except ValueError:
                    return jsonify({"message": "Invalid checking date format. Please use YYYY-MM-DD."}), 400
            else:
                new_pdi_entry.checkingDate = None

            # Mapping checklist items
            manitou_mapping = {
                ('levels', 'engineOil'): 'levels1',
                ('levels', 'transmissionOil'): 'levels2',
                ('levels', 'hydraulicOil'): 'levels3',
                ('levels', 'brakeFluid'): 'levels4',
                ('levels', 'coolant'): 'levels5',
                ('levels', 'frontAxleRearAxleTransferBoxOil'): 'levels6',
                ('levels', 'windscreenWasherFluid'): 'levels7',
                ('levels', 'batteryLevel'): 'levels8',
                ('levels', 'heatingSystemTank'): 'levels9',

                ('visualInspection', 'electricConnections'): 'vis_inspection1',
                ('visualInspection', 'hydraulicConnections'): 'vis_inspection2',
                ('visualInspection', 'screwAndNuts'): 'vis_inspection3',
                ('visualInspection', 'lubrication'): 'vis_inspection4',
                ('visualInspection', 'tyresAspect'): 'vis_inspection5',

                ('operation', 'instrumentationIndicatorsHeadlightsRearLights'): 'ops1',
                ('operation', 'windscreenWiperHeatingAirConditioning'): 'ops2',
                ('operation', 'safetyAndEmergencyRecoverySystem'): 'ops3',

                ('tests', 'lifting'): 'test1',
                ('tests', 'tilting'): 'test2',
                ('tests', 'telescopes'): 'test3',
                ('tests', 'accessory'): 'test4',
                ('tests', 'fanOperation'): 'test5',
                ('tests', 'steering'): 'test6',
                ('tests', 'swing'): 'test7',
                ('tests', 'stabiliserAndChassisLevelling'): 'test8',
                ('tests', 'platform'): 'test9',
                ('tests', 'brakeParkingBrake'): 'test10',

                ('general', 'paintFrameCab'): 'general1',
                ('general', 'decals'): 'general2',
                ('general', 'instructionsManual'): 'general3',
                ('general', 'wheelsNutTorque'): 'general4',
                ('general', 'typePressures'): 'general5',

                ('transport', 'transportEquipment'): 'transport1', # Perbaikan disini
                ('transport', 'complianceInstructions'): 'transport2',
                ('transport', 'theDriverServices'): 'transport3',
            }
            
            # iterate through the nested checklist items
            for (section, item), db_column in manitou_mapping.items():
                section_data = checklist_items.get(section, {})
                item_details = section_data.get(item, {})

                if isinstance(item_details, dict):
                    status_value_str = item_details.get('status')
                    caption_value = item_details.get('caption')
                    image_value = item_details.get('image') # Perbaikan disini

                    converted_value = converted_manitou_status_to_int(status_value_str)

                    if converted_value is not None and hasattr(new_pdi_entry, db_column):
                        setattr(new_pdi_entry, db_column, converted_value)

                    caption_db_column = f'caption_{db_column}'

                    if caption_value is not None and hasattr(new_pdi_entry, caption_db_column):
                        setattr(new_pdi_entry, caption_db_column, caption_value)
                    
                    img_db_column = f'img_{db_column}'

                    if image_value is not None and hasattr(new_pdi_entry, img_db_column):
                        setattr(new_pdi_entry, img_db_column, image_value)
            
            # Mapping remarks
            new_pdi_entry.remarksTransport = remarks_transport
            new_pdi_entry.generalRemarks = general_remarks

        # logic for SDLG
        elif brand.lower() == 'sdlg':
            unit_info = data.get('unitInfo', {})
            checklist_items = data.get('checklistItems', {})
            defects_and_remarks = data.get('defectsAndRemarks', [])

            # Mapping unit information from the payload
            new_pdi_entry.woNumber = unit_info.get('woNumber')
            new_pdi_entry.machineModel = unit_info.get('machineModel')
            new_pdi_entry.VIN = unit_info.get('VIN')
            new_pdi_entry.pdiInspector = unit_info.get('pdiInspector')

            # Mapping boolean checklist items (sn1 to sn7)
            for i in range(1, 8):
                sn_key = f'sn{i}'
                status_value = checklist_items.get(sn_key, False) 
                setattr(new_pdi_entry, sn_key, status_value)

            # Mapping signatures
            new_pdi_entry.inspectorSignature = data.get('inspectorSignature')
            new_pdi_entry.supervisorSignature = data.get('supervisorSignature')

            # remarks and defects relationship
            for defect_item in defects_and_remarks:
                defect_entry = SDLGDefectsAndRemarksPDI(
                    description=defect_item.get('description'),
                    remarks=defect_item.get('remarks'),
                )

                new_pdi_entry.defect.append(defect_entry)

        if new_pdi_entry:
            db.session.add(new_pdi_entry)
            db.session.commit()
            return jsonify({
                'message': f'{brand.capitalize()} Checklist submitted successfully!',
                'id': str(new_pdi_entry.pdiID)
            }), 201
        else:
            return jsonify({"error": "No logic found for the specified brand."}), 400

    except Exception as e:
        db.session.rollback()
        
        if "Violation of UNIQUE KEY constraint" in str(e) or "duplicate key" in str(e).lower():
            return jsonify({'message': f'Duplicate VIN found for {brand.capitalize()}. Please check your input.'}), 409
        
        print(f"Error submitting {brand.capitalize()} checklist: {str(e)}")
        return jsonify({'message': f'Error submitting {brand.capitalize()} checklist: {str(e)}'}), 500