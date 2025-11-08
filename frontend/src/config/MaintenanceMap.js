// Manitou Section
const MANITOU_SECTION_MAP = {
    engine: "Engine",
    driveline: "Driveline",
    hydraulicHydrostaticCircuits: "Hydraulic/ Hydrostatic Circuits",
    brakingCircuits: "Braking Circuits",
    boomMastManiscopicManicess: "Boom Unit/ Maniscopic/ Maniaccess",
    mastUnit: "Mast Unit",
    accessories:"Accesseories",
    cabProtectiveDeviceElectricCircuit: "Cab/ Protective Device/ Electric Circuit",
    wheels: "Wheels",
    screwsAndNuts: "Screw and Nuts",
    frameBody: "Frame and Body",
    paint: "Paint",
    generalOperation: "General Operation",
    operatorsManual: "Operator's Manual",
    instructionsForCustomer: "Instruction For Customer",
};

// Manitou Item
const MANITOU_ITEM_MAP = {
    engine: [
        { id: '01', label: 'Check Oil Level', itemKey: 'oilLevel' },
        { id: '02', label: 'Fuel Pipes and Filters', itemKey: 'fuelPipeFilters' },
        { id: '03', label: 'Radiator and Cooling Systems', itemKey: 'radiatorCoolingSystems' },
        { id: '04', label: 'Run Engine for 15 Minutes 1t 1200 rpm', itemKey: 'runAt15Minutes' },
        { id: '05', label: 'Belts', itemKey: 'belts' },
        { id: '06', label: 'Hoses', itemKey: 'hosesEngine' },
        { id: '07', label: 'Battery', itemKey: 'Battery' },
    ],
    driveline: [
        { id: '01', label: 'Drive Machine Fr/Rv for 50 Metres', itemKey: 'driveMachineFrRv' },
        { id: '02', label: 'Control of Gears', itemKey: 'controlGears' },
        { id: '03', label: 'Tranmission Fluid', itemKey: 'transFluid' },
        { id: '04', label: 'Lubricate Pivot', itemKey: 'lubricatePivot' },
    ],
    hydraulicHydrostaticCircuits: [
        { id: '01', label: 'Oil Tank', itemKey: 'oilTank' },
        { id: '02', label: 'Check All Cylinder Rod Against Corrosion', itemKey: 'checkCylinderRod' },
        { id: '03', label: 'Test All Hydraulic Movements at Full Operation', itemKey: 'testAllHydraulic' },
        { id: '04', label: 'Lubricate Unprotected Cylinder', itemKey: 'lubricateCylinder' },
        { id: '05', label: 'Use Crab and Articulated Steering', itemKey: 'useCrabArticulated' },
    ],
    brakingCircuits: [
        { id: '01', label: 'Checking of Service Brake & Parking Brake Operation', itemKey: 'checkServiceParkingBrake' },
        { id: '02', label: 'Checking of Brake Fluid Level (as per assembly)', itemKey: 'checkBrakeFluidLevel' },
    ],
    boomMastManiscopicManicess: [
        { id: '01', label: 'Boom & Telescopes', itemKey: 'boomTelescopes' },
        { id: '02', label: 'Lubricate Pins and Pivots', itemKey: 'lubricatePinsPivots' },
        { id: '03', label: 'Lubricate Circlips on Pins', itemKey: 'lubricateCirclipsPin' },
    ],
    mastUnit: [
        { id: '01', label: 'Fixed & Movable Mast(s)', itemKey: 'fixedMovableMast' },
        { id: '02', label: 'Carriage', itemKey: 'carriageMast' },
        { id: '03', label: 'Lubricate Chains', itemKey: 'lubricateChain' },
        { id: '04', label: 'Lubricate Roller', itemKey: 'lubricateRoller' },
    ],
    accessories: [
        { id: '01', label: 'Adaptation to Machine', itemKey: 'adaptationToMachine' },
        { id: '02', label: 'Hydraulic Connections', itemKey: 'hydraulicConnections' },
        { id: '03', label: 'Function Test', itemKey: 'functionTest' },
    ],
    cabProtectiveDeviceElectricCircuit: [
        { id: '01', label: 'Seat', itemKey: 'seat' },
        { id: '02', label: 'Control Panel & Radio', itemKey: 'controlPanelRadio' },
        { id: '03', label: 'Horn & Warning Light, Safety Device', itemKey: 'hornWarningLightSafetyDevice' },
        { id: '04', label: 'Heating & Air Conditioning', itemKey: 'heatingAirConditioning' },
        { id: '05', label: 'Windscreen Wiper / Washer', itemKey: 'windscreenWiperWasher' },
        { id: '06', label: 'Horns', itemKey: 'horns' },
        { id: '07', label: 'Backup Alarm', itemKey: 'backupAlarm' },
        { id: '08', label: 'Lighting', itemKey: 'lighting' },
        { id: '09', label: 'Additional Lighting', itemKey: 'additionalLighting' },
        { id: '10', label: 'Rotating Beacon', itemKey: 'rotatingBeacon' },
    ],
    wheels: [
        { id: '01', label: 'Rims', itemKey: 'rims' },
        { id: '02', label: 'Tires & Pressure', itemKey: 'tiresPressure' },
    ],
    screwsAndNuts: [
        { id: '01', label: 'Screws and Nuts', itemKey: 'screwsAndNuts' },
    ],
    frameBody: [
        { id: '01', label: 'Lubricate Strain Gauge Area', itemKey: 'lubricateStrainGauge' },
        { id: '02', label: 'Lubricate Pivots', itemKey: 'lubricatePivots' },
    ],
    paint: [
        { id: '01', label: 'Paint', itemKey: 'paint' },
    ],
    generalOperation: [
        { id: '01', label: 'General Operation', itemKey: 'generalOperation' },
    ],
    operatorsManual: [
        { id: '01', label: 'Operator\'s Manual', itemKey: 'operatorsManual' },
    ],
    instructionsForCustomer: [
        { id: '01', label: 'Instructions for Customer', itemKey: 'instructionsForCustomer' },
    ],
};

// Renault section
const RENAULT_SECTION_MAP = {
    operationsInCab: "Operations to be Carried Out in the Cab",
    operationsAroundVehicle: "Operations to be Carried Out Around the Vehicle",
    operationsUnderCab: "Operations to be Carried out Under the Cab",
    operationsUnderVehicle: "Operations to be Carried Out Under the Vehicle",
    dynamicTesting: "Dynamic Test",
};

// Renault Item
const RENAULT_ITEM_MAP = {
    operationsInCab: [
        { id: '1', label: 'Make Sure the Door Lock and the Remote Control* are Working Properly.', itemKey: 'doorLocksRemoteControl' },
        { id: '2', label: 'Make Sure the Parking Brake is Working Properly (Whilst Trying to Slowly Move Forward with the Brake Applied).', itemKey: 'parkingBrake' },
        { id: '3', label: 'Inspect the Elements of Vision (Windscreen, Windows, Rear View Mirrors and Front View Mirror).', itemKey: 'elementsOfVision' },
        { id: '4', label: 'Make Sure All the Safety Elements are Working Properly: Horn, Windscreen Wipers (Intermittent Operation), Windscreen Washer, Headlamp Washer and Seat Belt(s).', itemKey: 'safetyElements' },
        { id: '5', label: 'Make Sure the Dashboard Instrumentation is Working Properly (Control Levers, Selectors, Dome Lights) and Cancel Any Stored Fault Codes.', itemKey: 'dashboardInstrumentation' },
        { id: '6', label: 'Make Sure the Air Conditioning and (or) Heating System is Working Properly *.', itemKey: 'airConditioningHeating' },
    ],
    operationsAroundVehicle: [
        { id: '7', label: 'Inspect the General Condition of the Cab (Doors, Rear View Mirrors, Fairings and Deflectors).', itemKey: 'cabGeneralCondition' },
        { id: '8', label: 'Inspect the General Condition of the Windscreen Wiper Blades, Their Rods and the Windscreen.', itemKey: 'windscreenWiperBlades' },
        { id: '9', label: 'Check the Level of the Windscreen Washer Liquid, Top-up if Necessary.', itemKey: 'windscreenWasherLiquid' },
        { id: '10', label: 'Check the Level of the Coolant, Top-up if Necessary.', itemKey: 'coolantLevel' },
        { id: '11', label: 'Check the Level of the Clutch Fluid, Top-up if Necessary *.', itemKey: 'clutchFluidLevel' },
        { id: '12', label: 'Check the Level of the Engine Oil, Top-up if Necessary.', itemKey: 'engineOilLevel' },
        { id: '13', label: 'Inspect the Radiators\' Insect Net.', itemKey: 'radiatorsInsectNet' },
        { id: '14', label: 'Inspect the Cab\'s Front Rotation Points.', itemKey: 'cabFrontRotationPoints' },
        { id: '15', label: 'Inspect the General Condition of the Front Steps, Anti-projection Protections, Mud Flaps, Lateral Aprons.', itemKey: 'frontStepsCondition' },
        { id: '16', label: 'Check the Water Content in Fuel Pre-filter.', itemKey: 'fuelPreFilterWaterContent' },
        { id: '17', label: 'Check the Front and Rear Lights and Signaling (Reversing Lights, Brake Lights, Side Lights, Direction Lights).', itemKey: 'lightsSignaling' },
        { id: '18', label: 'Check the Leak Tightness of the Front and Rear Wheel Hub Reductions (Oil and (or) Grease) *.', itemKey: 'wheelHubReductionsLeakTightness' },
        { id: '19', label: 'Check the Oil Level of The Wheel Hub Reductions, Top-up if Necessary *.', itemKey: 'wheelHubReductionsOilLevel' },
        { id: '20', label: 'Inspect the Tire Pressure (Including the Spare Wheel).', itemKey: 'tirePressure' },
        { id: '21', label: 'Inspect the Fixing of the Accumulator Batteries, Control the Electrolyte Levels (approx. 18-22 mm Above the Cell Plates) and Make Sure the Main Switch is Working Properly.', itemKey: 'accumulatorBatteriesFixing' },
        { id: '22', label: 'Check the Battery Using Battery Analyzer and Print the Report (if the Value Below 12,55 Volt, the Battery Must be Charged)', itemKey: 'batteryAnalyzerCheck' },
        { id: '23', label: 'Check the Fuel Tank Breather Tubes.', itemKey: 'fuelTankBreatherTubes' },
        { id: '24', label: 'Check the Fifth Wheel or Towing Hook and Make Sure They are Working Properly *.', itemKey: 'fifthWheelTowingHook' },
    ],
    operationsUnderCab: [
        { id: '25', label: 'Inspect the Fixing of the Cab and Make Sure the Cab\'s Unlocking System is Working Properly (Apply Grease if Necessary).', itemKey: 'cabFixingUnlockingSystem' },
        { id: '26', label: 'Inspect the General Condition and the Fixing of the Wiring Bundle, Connections and Leak-tight Seal of the Engine Coolant Circuit *.', itemKey: 'wiringBundleEngineCoolantCircuit' },
        { id: '27', label: 'Make Sure the Engine is Leak-tight (Oil, Coolant, Fuel, Exhaust Circuit).', itemKey: 'engineLeakTightness' },
        { id: '28', label: 'Make Sure There are Sound-proofing Screens and That They are Properly Positioned *.', itemKey: 'soundProofingScreens' },
        { id: '29', label: 'Check the State of the Steering Components (Steering Box, Hose, Pump, Universal Joints, etc.).', itemKey: 'steeringComponentsState' },
        { id: '30', label: 'Change the Engine Oil Filter Cartridge Every Week 52nd of Storage.', itemKey: 'engineOilFilterChange' },
        { id: '31', label: 'Change the Engine Oil Every Week 52nd of Storage.', itemKey: 'engineOilChange' },
    ],
    operationsUnderVehicle: [
        { id: '32', label: 'Apply Grease on the Chassis, See the Grease Points on the Chart.', itemKey: 'chassisGrease' },
        { id: '33', label: 'Make Sure the Drive Axle(s) are Leak-tight and Control the Breather Tube(s).', itemKey: 'driveAxleLeakTightness' },
        { id: '34', label: 'Check the Drive Axle Oil Level; Top-up if Necessary.', itemKey: 'driveAxleOilLevel' },
        { id: '35', label: 'Check Inspect the State of the Braking System (Fixing of the Brake Cylinders, Brake Pads, Disks, Calipers, Levers, Piping, Hoses, Valves, Connection of the Brake Lining Wear Sensors etc).', itemKey: 'brakingSystemState' },
        { id: '36', label: 'Inspect the State of the Springs, Pads, Anti-roll Bars and Shock Absorbers.', itemKey: 'springsPadsAntiRollBarsShockAbsorbers' },
        { id: '37', label: 'Inspect the General Condition and the Mountings on the Wiring Bundles on the Chassis (Electrical, Pneumatic, Hydraulic, Fuel Supply Piping, etc).', itemKey: 'wiringBundlesChassis' },
        { id: '38', label: 'Check (via Purges) the Presence of Water or Oil in the Compressed Air Tanks.', itemKey: 'compressedAirTanksWaterOil' },
        { id: '39', label: 'Make Sure the Transfer Box is Leak-tight (Oil, Air) *.', itemKey: 'transferBoxLeakTightness' },
        { id: '40', label: 'Check the Transfer Box Oil Level; Top-up if Necessary *.', itemKey: 'transferBoxOilLevel' },
        { id: '41', label: 'Make Sure the Fuel Tank(s) are Leak-tight.', itemKey: 'fuelTanksLeakTightness' },
        { id: '42', label: 'Inspect the General Condition and the Fixing of the Exhaust Line.', itemKey: 'exhaustLineCondition' },
        { id: '43', label: 'Make Sure the PTO is Leak-tight (Oil, Air) *.', itemKey: 'ptoLeakTightness' },
        { id: '44', label: 'Make Sure the Gearbox is Leak-tight (Oil, Water, Air), That There are Sound-proofing Screens and That They are Properly Positioned *.', itemKey: 'gearboxLeakTightness' },
        { id: '45', label: 'Check the Gearbox Oil Level; Top-up if Necessary.', itemKey: 'gearboxOilLevel' },
        { id: '46', label: 'Check the Steering Components (Pivot, Ball Joints, Unit, Piping, Hoses etc).', itemKey: 'steeringComponents' },
        { id: '47', label: 'Make sure the Engine is Leak-tight (Oil, Coolant, Fuel, Exhaust Circuit).', itemKey: 'engineLeakTightness2' },
    ],
    dynamicTesting: [
        { id: '48', label: 'Start the Engine in Order to Control the Noise and (or) Smoke Fumes, Test the Engine Performance.', itemKey: 'engineNoiseSmokePerformance' },
        { id: '49', label: 'Test the Gearbox and the Clutch Operation.', itemKey: 'gearboxClutchOperation' },
        { id: '50', label: 'Make Sure the Steering System is Working Properly.', itemKey: 'steeringSystemOperation' },
        { id: '51', label: 'Test the Braking Reactions and the Direction-holding, and Braking Adaptation if Equipped the Trailer.', itemKey: 'brakingReactionsDirectionHolding' },
        { id: '52', label: 'Do the Road Test At Least 15 Minutes and Check All Function, PTO, Diff. Lock, Exhaust Brake, etc.', itemKey: 'roadTestFunctions' },
    ],
};

const SDLG_REQUIREMENTS = [
    "Routine inspection of surface/appearance, extent of paint damage, and rust prevention",
    "Check that all oil levels and coolant levels are correct",
    "Check and adjust tire pressure; Check excavator for track tightness",
    "Check the aging condition of tires and rubber parts",
    "Check the charging indicator light of the battery. If the machine has been stored for more than three months, the battery should be removed and maintained by charging. If the battery cable terminals are loose or corroded. If necessary, clean the battery terminals and apply corrosion remover.",
    "Check the cleanliness of the cab and engine compartment",
    "Check whether the interior, floor mats, and insulation materials in the cab are damp",
    "For equipment with a drive shaft, check the drive shaft. If the machine has been stored for more than six months, it must be re-greased.",
    "Before testing: Remove all corrosion removers and other rust protection, including the plastic cover outside the hydraulic cylinder piston rod.",
    "Start the machine and allow the engine and other components to reach normal operating temperature. During the operation of the machine, check the following items:",
        
    "A-C (optional) should run for at least 5 minutes, refer to the Operation Manual for inspection.",
    "Check the steering system and braking system.",
    "Operate all hydraulic movements of the machine to ensure hydraulic components are at the stroke end (end of the stroke), with the same operations for the steering system.",
    "Check for fuel, water, and oil leaks; if necessary, inspect and tighten all connections and clamps.",
    "Check whether the dashboard, control lights, and other lights are functioning properly.",
    "The piston rod of the hydraulic cylinder should be in the retracted position, and the exposed part of the rod should be coated with rust inhibitor, such as Teflon or an equivalent.",
    "For equipment with an air storage tank, exhaust the compressed air from the tank.",
    "For the excavator, check if the tracks and chassis are clean.",
    "The fuel tank must be full at all times to prevent moisture condensation.",
    "Spray rust inhibitor where needed and apply lubricant.",
    "Close the door and window of the cab.",
    "If necessary, seal the exhaust pipe of the engine to prevent rainwater from entering the engine.",
    "Turn off the battery switch or cut off the negative cable.",
]

export const BRAND_CHECKLIST_MAP = {
    // Brand Manitou
    manitou: {
        sections: MANITOU_SECTION_MAP,
        items: MANITOU_ITEM_MAP,
    },
    
    // Brand Renault Trucks
    renault: {
        sections: RENAULT_SECTION_MAP,
        items: RENAULT_ITEM_MAP,
    },

    // Brand SDLG
    sdlg : {
        technicalRequirements: SDLG_REQUIREMENTS,
    }
};