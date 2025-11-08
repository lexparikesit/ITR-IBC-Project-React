// Manitou Section
const MANITOU_SECTION_MAP = {
    levels: "Levels",
    visualInspection: "Visual Inspection",
    operation: "Operation",
    tests: "Test",
    checkingOfGeneralMachineCondition: "Checking of General Machine Condition",
    transportationDelivery: "Transport/ Delivery - Remarks Regarding",
};

// Manitou Item
const MANITOU_ITEM_MAP = {
    levels: [
        { id: '01', label: 'Engine Oil', itemKey: 'engineOil' },
        { id: '02', label: 'Transmission Oil', itemKey: 'transmissionOil' },
        { id: '03', label: 'Hydraulic Oil', itemKey: 'hydraulicOil' },
        { id: '04', label: 'Brake Fluid', itemKey: 'brakeFluid' },
        { id: '05', label: 'Coolant', itemKey: 'coolant' },
        { id: '06', label: 'Front Axle - Rear Axle - Transfer Box Oil', itemKey: 'frontAxleRearAxleTransferBoxOil' },
        { id: '07', label: 'Windscreen Washer Fluid', itemKey: 'windscreenWasherFluid' },
        { id: '08', label: 'Battery Level', itemKey: 'batteryLevel' },
        { id: '09', label: 'Heating System Tank', itemKey: 'heatingSystemTank' },
    ],
    visualInspection: [
        { id: '11', label: 'Of All Electric Connections', itemKey: 'electricConnections' },
        { id: '12', label: 'Of All Hydraulic Connections', itemKey: 'hydraulicConnections' },
        { id: '13', label: 'Of All Screw and Nuts', itemKey: 'screwAndNuts' },
        { id: '14', label: 'Lubrication', itemKey: 'lubrication' },
        { id: '15', label: 'Tyres (Aspect)', itemKey: 'tyresAspect' },
    ],
    operation: [
        { id: '16', label: 'Instrumentation, Indicators, Headlights, Rear Lights', itemKey: 'instrumentationIndicatorsHeadlightsRearLights' },
        { id: '17', label: 'Windscreen Wiper, Heating, Air Conditioning', itemKey: 'windscreenWiperHeatingAirConditioning' },
        { id: '18', label: 'Safety and Emergency Recovery System', itemKey: 'safetyAndEmergencyRecoverySystem' },
    ],
    tests: [
        { id: '19', label: 'Lifting', itemKey: 'lifting' },
        { id: '20', label: 'Tilting', itemKey: 'tilting' },
        { id: '21', label: 'Telescopes', itemKey: 'telescopes' },
        { id: '22', label: 'Accessory (ies)', itemKey: 'accessory' },
        { id: '23', label: 'Fan Operation', itemKey: 'fanOperation' },
        { id: '24', label: 'Steering: 2 Wheels, 4 Wheels, Crab', itemKey: 'steering' },
        { id: '25', label: 'Swing', itemKey: 'swing' },
        { id: '26', label: 'Stabiliser and Chassis Levelling/ Rear Axle Locking', itemKey: 'stabiliserAndChassisLevelling' },
        { id: '27', label: 'Platform', itemKey: 'platform' },
        { id: '28', label: 'Brake/ Parking Brake', itemKey: 'brakeParkingBrake' },
    ],
    checkingOfGeneralMachineCondition: [
        { id: '29', label: 'Paint/ Frame/ Cab', itemKey: 'paintFrameCab' },
        { id: '30', label: 'Decals', itemKey: 'decals' },
        { id: '31', label: 'Instructions Manual', itemKey: 'instructionsManual' },
        { id: '32', label: 'Wheels nut Torque', itemKey: 'wheelsNutTorque' },
        { id: '33', label: 'Type Pressures', itemKey: 'typePressures' },
    ],
    transportationDelivery: [
        { id: '34', label: 'Transport Equipment', itemKey: 'transportEquipment' },
        { id: '35', label: 'Compliance with Instructions/ Time Schedules', itemKey: 'complianceInstructions' },
        { id: '36', label: 'The Driver Services', itemKey: 'theDriverServices' },
    ],
};

// Renault Section
const RENAULT_SECTION_MAP = {
    lubricationOilAndFluidLevels: "Lubrication, Oil and Fluid Levels",
    cab: "Cab",
    exterior: "Exterior",
    underVehicle: "Under Vehicle",
    testDrive: "Test Drive",
    finish: "Finish",
};

// Renault Item
const RENAULT_ITEM_MAP = {
    lubricationOilAndFluidLevels: [
        { id: '1', label: 'Charge Battery', itemKey: 'chargeBattery' },
        { id: '2', label: 'Check Battery Charge and Fluid Level', itemKey: 'batteryChargeFluidLevel' },
        { id: '3', label: 'Lubricate Leaf Suspension Bushings', itemKey: 'lubricateLeafSuspensionBushings' },
        { id: '4', label: 'Check Fluid Levels in Windscreen and Headlamp Washer Reservoirs', itemKey: 'fluidLevelsWindscreenHeadlamp' },
        { id: '5', label: 'Check Coolant Level', itemKey: 'coolantLevel' },
        { id: '6', label: 'Check Engine Oil Level', itemKey: 'engineOilLevel' },
        { id: '7', label: 'Check AdBlue Level', itemKey: 'adBlueLevel' },
        { id: '8', label: 'Replace Battery Cable', itemKey: 'replaceBatteryCable' },
        { id: '9', label: 'Install Chocks', itemKey: 'installChocks' },
        { id: '10', label: 'Activate and Lubricate Fifth Wheel', itemKey: 'activateLubricateFifthWheel' },
    ],
    cab: [
        { id: '11', label: 'Connect-Disconnect Diagnostic tool', itemKey: 'connectDisconnectDiagnosticTool' },
        { id: '12', label: 'Activate Vehicle Electrical System', itemKey: 'activateElectricalSystem' },
        { id: '13', label: 'Connectivity, Check', itemKey: 'connectivityCheck' },
        { id: '14', label: 'Activate Radio', itemKey: 'activateRadio' },
        { id: '15', label: 'Activate Anti-theft Alarm', itemKey: 'activateAntiTheftAlarm' },
        { id: '16', label: 'Check Warning and Control Lamps', itemKey: 'checkWarningControlLamps' },
        { id: '17', label: 'Function Check of Parking Heater', itemKey: 'functionCheckParkingHeater' },
    ],
    exterior: [
        { id: '18', label: 'Attach Exhaust Tail Pipe', itemKey: 'attachExhaustTailPipe' },
        { id: '19', label: 'Check Cab and Chassis', itemKey: 'checkCabChassis' },
        { id: '20', label: 'Check Tightening of Wheel Nuts and Attachment of Protecting Rings', itemKey: 'checkWheelNuts' },
        { id: '21', label: 'Check Tyre Pressure', itemKey: 'checkTyrePressure' },
        { id: '22', label: 'Install License Plate', itemKey: 'installLicensePlate' },
        { id: '23', label: 'Install Air Deflector', itemKey: 'installAirDeflector' },
        { id: '24', label: 'Remove Spare Wheel', itemKey: 'removeSpareWheel' },
    ],
    underVehicle: [
        { id: '25', label: 'Remove Screw in Charge Air Cooler (only on markets where there is a risk of freezing)', itemKey: 'removeScrewChargeAirCooler' },
        { id: '26', label: 'Check Load Sensing Valve Setting', itemKey: 'checkLoadSensingValve' },
        { id: '27', label: 'Check Superstructure', itemKey: 'checkSuperstructure' },
    ],
    testDrive: [
        { id: '28', label: 'Check After Start', itemKey: 'checkAfterStart' },
        { id: '29', label: 'Check During Road Test', itemKey: 'checkDuringRoadTest' },
        { id: '30', label: 'Check After Road Test', itemKey: 'checkAfterRoadTest' },
    ],
    finish: [
        { id: '31', label: 'Remove Protective Film', itemKey: 'removeProtectiveFilm' },
        { id: '32', label: 'Finish', itemKey: 'finish' },
        { id: '33', label: 'Brake Adaptation, Information to Customer', itemKey: 'brakeAdaptation' },
    ],
};

const SDLG_REQUIREMENTS = {
    mainCheck: [ 
        { id: 1, label: "Visual inspection for paint damage and rust protection defects.", itemKey: 'visualInspectionPaintDamage' },
        { id: 2, label: "Check the coolant level in the radiator, check the engine oil level, and check the oil levels in the gearbox, drive axle, and hydraulic system. Check the water level in the front windshield washing system.", itemKey: 'fluidLevelsCheck' },
        { id: 3, label: "Remove the anti-fall device of the hydraulic cylinder and clean the rust inhibitor from the piston rod of the hydraulic cylinder.", itemKey: 'hydraulicCylinderClean' },
        { id: 4, label: "Check the tire pressure, if necessary, adjust the pressure, and check the tightness of the track of the excavator.", itemKey: 'tirePressureTrack' },
        { id: 5, label: "Start the machine, run it to normal operating temperature, and check whether all system function normally:", itemKey: 'systemFunctionCheck' },
        { id: 6, label: "Check for fuel, water, and oil leaks; if necessary, inspect and tighten all connections and clamps. Ensure that the routing of all hoses and pipes is reasonable without interference", itemKey: 'leakTightnessCheck' },
        { id: 7, label: "Turn off the battery switch", itemKey: 'batterySwitchOff' },
    ],
};

export const BRAND_CHECKLIST_MAP = {
    // Brand Manitou
    manitou: {
        sections: MANITOU_SECTION_MAP,
        items: MANITOU_ITEM_MAP,
    },

    // Brand Renault
    renault: {
        sections: RENAULT_SECTION_MAP,
        items: RENAULT_ITEM_MAP,
    },

    // Brand SDLG
    sdlg: {
        technicalRequirements: SDLG_REQUIREMENTS,
    },
};