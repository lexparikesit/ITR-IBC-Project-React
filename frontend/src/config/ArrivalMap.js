// Manitou Section
const MANITOU_SECTION_MAP = {
    engine: "01. Engine",
    transmission: "02. Transmission",
    axleTransferBox: "03. Axles/ Transfer Box",
    hydraulicHydrostaticCircuits: "04. Hydraulic/ Hydrostatic Circuits",
    brakingCircuits: "05. Braking Circuits",
    lubrication: "06. Lubrication",
    boomMastManiscopicManicess: "07. Boom/ Mast Maniscopic/ Manices",
    mastUnit: "08. Mast Unit",
    accessories: "09. Accessories",
    cabProtectiveDeviceElectricCircuit: "10. Cab/ Protective Device/ Electric Circuit",
    wheels: "11. Wheels",
    otherItems: "12. Other Items",
};

// Manitou Item
const MANITOU_ITEM_MAP = {
    engine: [
        { id: '01', label: 'Air Filter', itemKey: 'airFilter' },
        { id: '02', label: 'Fuel Filter', itemKey: 'fuelFilter' },
        { id: '03', label: 'Fuel Pipes and Filters', itemKey: 'fuelPipeFilters' },
        { id: '04', label: 'Injection / Carburation System', itemKey: 'injectionCarburationSystem' },
        { id: '05', label: 'Radiator and Cooling Systems', itemKey: 'radiatorCoolingSystems' },
        { id: '06', label: 'Belts', itemKey: 'belts' },
        { id: '07', label: 'Hoses', itemKey: 'hosesEngine' },
    ],
    transmission: [
        { id: '01', label: 'Reversing System', itemKey: 'reversingSystem' },
        { id: '02', label: 'Gear Oil Leaks', itemKey: 'gearOilLeaks' },
        { id: '03', label: 'Direction Disconnect Pedal', itemKey: 'directionDisconnectPedal' },
        { id: '04', label: 'Clutch', itemKey: 'clutch' },
    ],
    axleTransferBox: [
        { id: '01', label: 'Operation and Tightness', itemKey: 'operationTightness' },
        { id: '02', label: 'Adjustment of Stops', itemKey: 'adjustmentStops' },
    ],
    hydraulicHydrostaticCircuits: [
        { id: '01', label: 'Oil Tank', itemKey: 'oilTank' },
        { id: '02', label: 'Pumps and Coupling', itemKey: 'pumpsCoupling' },
        { id: '03', label: 'Tightness of Unions', itemKey: 'tightnessOfUnions' },
        { id: '04', label: 'Lifting Rams', itemKey: 'liftingRams' },
        { id: '05', label: 'Tilting Rams', itemKey: 'tiltingRams' },
        { id: '06', label: 'Accessory Rams', itemKey: 'accessoryRams' },
        { id: '07', label: 'Telescope Rams', itemKey: 'telescopeRams' },
        { id: '08', label: 'Compensating Rams', itemKey: 'compensatingRams' },
        { id: '09', label: 'Steering Rams', itemKey: 'steeringRams' },
        { id: '10', label: 'Control Valves', itemKey: 'controlValves' },
        { id: '11', label: 'Counterbalance Valve', itemKey: 'counterBalanceValve' },
    ],
    brakingCircuits: [
        { id: '01', label: 'Service Brake & Parking Brake Operation', itemKey: 'serviceBrakeParkingBrakeOperation' },
        { id: '02', label: 'Brake Fluid Level (if applicable)', itemKey: 'brakeFluidLevel' },
    ],
    lubrication: [
        { id: '01', label: 'Lubrication', itemKey: 'lubrication' },
    ],
    boomMastManiscopicManicess: [
        { id: '01', label: 'Boom & Telescopes', itemKey: 'boomTelescopes' },
        { id: '02', label: 'Wear Pads', itemKey: 'wearPads' },
        { id: '03', label: 'Linkage', itemKey: 'linkage' },
        { id: '04', label: 'Carriage', itemKey: 'carriageBooms' },
        { id: '05', label: 'Forks', itemKey: 'forksBooms' }
    ],
    mastUnit: [
        { id: '01', label: 'Fixed & Movable Mast(s)', itemKey: 'fixedMovableMast' },
        { id: '02', label: 'Carriage', itemKey: 'carriageMast' },
        { id: '03', label: 'Chains', itemKey: 'chains' },
        { id: '04', label: 'Rollers', itemKey: 'rollers' },
        { id: '05', label: 'Forks', itemKey: 'forksMastUnit' },
    ],
    accessories: [
        { id: '01', label: 'Adaptation to Machine', itemKey: 'adaptationToMachine' },
        { id: '02', label: 'Hydraulic Connections', itemKey: 'hydraulicConnections' },
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
        { id: '11', label: 'Battery', itemKey: 'battery' },
    ],
    wheels: [
        { id: '01', label: 'Rims', itemKey: 'rims' },
        { id: '02', label: 'Tires & Pressure', itemKey: 'tiresPressure' },
    ],
    otherItems: [
        { id: '01', label: 'Screws and Nuts', itemKey: 'screwsNuts' },
        { id: '02', label: 'Frame and Body', itemKey: 'frameBody' },
        { id: '03', label: 'Name Plate', itemKey: 'namePlate' },
        { id: '04', label: 'General Operation', itemKey: 'generalOperation' },
        { id: '05', label: "Operator's Manual", itemKey: 'operatorsManual' },
        { id: '06', label: 'Instructions for Customer', itemKey: 'instructionsForCustomer' },
    ],
};

// Renault Section
const RENAULT_SECTION_MAP = {
    chassisAndCab: "01. Chassis & Cab",
    axleSpringTyre: "02. Axle, Spring, and Tyre",
    battery: "03. Battery",
    electrical: "04. Electrical Check",
    additionalEquipment: "05. Additional Equipment Check",
    functionalCheck: "06. Functional Check",
};

// Renault Items
const RENAULT_ITEM_MAP = {
    chassisAndCab: [
        { id: "01", label: "Check Cabin and Surround Condition", itemKey: "cabinSurround" },
        { id: "02", label: "Check Front and Rear Towing Condition", itemKey: "towingCondition" },
        { id: "03", label: "Check VIN and Engine Number", itemKey: "vinEngineNumber" },
        { id: "04", label: "Check Front Windscreen and Window Glass Condition", itemKey: "windscreenGlass" },
        { id: "05", label: "Check ID and Rear View Mirror, Front View Mirror", itemKey: "mirrors" },
        { id: "06", label: "Check All Lamps Condition", itemKey: "allLamps" },
        { id: "07", label: "Check the L/R & RR Footstep, Mudguard, and Front Grille", itemKey: "footstepMudguardGrille" },
        { id: "08", label: "Check the Wiper, Sunroof, and Unit Logo (Emblem)", itemKey: "wiperSunroofLogo" },
    ],
    axleSpringTyre: [
        { id: "01", label: "Check All Tires Condition, Including Spare Tyre", itemKey: "allTiresCondition" },
        { id: "02", label: "Check All Axle (Front, Middle, and Rear)", itemKey: "allAxle" },
        { id: "03", label: "Check All Front and Rear Spring Condition", itemKey: "allSpringCondition" },
        { id: "04", label: "Check All Tires Condition, Including Spare Tyre (Duplicate)", itemKey: "allTiresCondition2" }, // Diberi key berbeda karena duplicate
    ],
    battery: [
        { id: "01", label: "Check Battery Condition Using Battery Analyzer", itemKey: "batteryAnalyzer" },
        { id: "02", label: "Check Battery Electrolyte and the Voltage", itemKey: "batteryElectrolyteVoltage" },
    ],
    electrical: [
        { id: "01", label: "Check All Lighting Condition (Headlamp, Tail Lamp, Strobe)", itemKey: "allLighting" },
        { id: "02", label: "Check Stop Lamp, Reverse Lamp, and Alarm Function", itemKey: "stopReverseAlarm" },
        { id: "03", label: "Check Strobe Lamp, Headlamp, and Tail Lamp Function", itemKey: "strobeHeadTailLamp" },
        { id: "04", label: "Check All Gauges, Pilot Lamp, and Display Function", itemKey: "gaugesPilotDisplay" },
        { id: "05", label: "Check Electrical Power and Horn", itemKey: "powerHorn" },
        { id: "06", label: "Check Headlamp Protection", itemKey: "headlampProtection" },
    ],
    additionalEquipment: [
        { id: "01", label: "Check Safety Belt, Tools Kit, Operator Manual, Hyd. Jack", itemKey: "safetyBeltTools" },
        { id: "02", label: "Check the Key, Fuel Tank Condition", itemKey: "keyFuelTank" },
        { id: "03", label: "Check Tachograph and Radio", itemKey: "tachographRadio" },
    ],
    functionalCheck: [
        { id: "01", label: "Engine Running Test", itemKey: "engineRunningTest" },
        { id: "02", label: "Test Braking System, Front, Rear, and Parking Brake", itemKey: "brakingSystemTest" },
        { id: "03", label: "Test Steering Function", itemKey: "steeringFunctionTest" },
        { id: "04", label: "Test Display Function and Error Code", itemKey: "displayErrorCodeTest" },
    ],
};

// SDLG Items
const SDLG_REQUIREMENTS = [
    "Disassembled spare parts have been protected, packed, or fixed as required. There is no mistake in assembly, no corrosion or damage.",
    "No scratch or corrosion on the loader appearance, no abscission on the paint.",
    "No leakage in the machine or the disassembled pipes, which have been fixed well. No greasy dirt on the ground of the container.",
    "For wheel loader and road machinery, check if the disassembled axle and brake pipelines are fixed properly, brake joints are well-packed.",
    "No scratch on the surface of the disassembled cabin, no damage on the internal or cover. No greasy dirt, handprint(footprint), the parts and components of the cabin table-board have been put in order and fixed.",
    "For wheel loader and road machinery, check if the quantity of bolts and nuts are correct when the rim, front/rear axle and drive shaft are disassembled. For excavator, check if the bolts and pins are correct when the cab, arm and bucket are disassembled.",
    "Check if the bolts are put back to the same position when the component is removed, check if the appearance is clean and undamaged, and check if the transportation support is in good condition (if any).",
    "All the parts have been fixed properly after the entire wheel loader settled in the container. No breakage or looseness in the binding rope.",
    "Spare parts or documents have been placed properly in the container. No parts or documents damaged or lost.",
    "The container is in good condition, without damaging the container wall or floor, no oil leakage was found.",
    "[Unit Assembly]: Unit has already assembled befor arrival check done",
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