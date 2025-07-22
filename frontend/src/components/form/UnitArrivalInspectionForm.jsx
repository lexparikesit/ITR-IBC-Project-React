"use client";

import React, { useState, useEffect } from "react";
import {
    TextInput,
    Textarea, 
    Button,
    Text,
    Grid,
    Group,
    Card,
    Title,
    Divider,
    Box,
    Select,
    Popover,
} from "@mantine/core";
import { DateInput, DatePicker } from "@mantine/dates";
import { TimeInput } from "@mantine/dates";
import { IconClock, IconCalendar } from "@tabler/icons-react";
import ChecklistRadioItem from "./ChecklistRadioItem";

const UnitArrivalInspectionForm = () => {

    // dummy data for model/ type and technician (will be replaced then by API)
    const dummyModels = [
        { value: 'M20-4', label: 'M20-4' },
        { value: 'MLT 737-130 PS+', label: 'MLT 737-130 PS+' },
        { value: 'MT 625 H', label: 'MT 625 H' },
        { value: 'MRT 2550 Privilege Plus', label: 'MRT 2550 Privilege Plus' },
    ]

    const dummyTechnician = [
        { value: 'john_doe', label: 'John Doe' },
        { value: 'jane_smith', label: 'Jane Smith' },
        { value: 'peter_jones', label: 'Peter Jones' },
    ]

    const [unitInfo, setUnitInfo] = useState({
        model: null,
        serialNo: "",
        hourMeter: "",
        dateOfCheck: null,
        timeOfCheck: "",
        technician: "null",
    });

    // state for controlling DatePickerOpened
    const [datePickerOpened, setDatePickerOpened] = useState(false);

    const [checklistItems, setChecklistItems] = useState({
        engine: {
            airFilter: "",
            fuelFilter: "",
            fuelPipeFilters: "",
            injectionCarburationSystem: "",
            radiatorCoolingSystems: "",
            belts: "",
            hosesEngine: "",
        },

        transmission: {
            reversingSystem: "",
            gearOilLeaks: "",
            directionDisconnectPedal: "",
            clutch: "",
        },

        hydraulicHydrostaticCircuits: {
            oilTank: "",
            pumpsCoupling: "",
            tightnessOfUnions: "",
            fillingLevel: "",
            hosesHydraulic: "",
            accessoryParts: "",
            telescopeRams: "",
            tiltLiftRams: "",
            steeringControlValves: "",
            controlValves: "",
        },

        brakingCircuits: {
            serviceBrakeParkingBrakeOperation: "",
            brakeFluidLevel: "",
        },

        lubrication: {
            lubrication: "",
        },

        boomMastManiscopicManicess: {
            boomTelescopes: "",
            wearPads: "",
            linkage: "",
            forks: "",
        },

        mastUnitCheckboxes: {
            fixedMovableMast: "",
            carriage: "",
            chains: "",
            rollers: "",
            forksMastUnit: "",
        },

        accessoriesCheckboxes: {
            adaptationToMachine: "",
            hydraulicConnections: "",
        },

        cabProtectiveDeviceElectricCircuit: {
            seat: "",
            controlPanelRadio: "",
            hornWarningLightSafetyDevice: "",
            heatingAirConditioning: "",
            windscreenWiperWasher: "",
            horns: "",
            backupAlarm: "",
            lighting: "",
            additionalLighting: "",
            rotatingBeacon: "",
            battery: "",
        },

        wheels: {
            rims: "",
            tiresPressure: "",
        },
        
        // single Item checklist that are not nested in an object
        screwsNuts: "",
        frameBody: "",
        paint: "",
        operatorsManual: "",
        instructionsForCustomer: "",
    });

    const [generalRemarks, setGeneralRemarks] = useState("");

    const handleUnitInfoChange = (e) => {
        const { name, value } = e.target;
        setUnitInfo((prev) => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (value) => {
        setUnitInfo((prev) => ({ ...prev, dateOfCheck: value }));
        setDatePickerOpened(false);
    };

    const handleTimeChange = (value) => {
        setUnitInfo((prev) => ({ ...prev, timeOfCheck: value }));
    };

    // Handler of radio status (Good/Missing/Bad)
    const handleChecklistItemStatusChange = (section, itemKey, value) => {
        setChecklistItems((prev) => {
            // check if the section is nested object or single item
            if (typeof prev[section] === 'object' && prev[section] !== null && prev[section].hasOwnProperty(itemKey)) {
                return {
                    ...prev,
                    [section]: {
                        ...prev[section],
                        [itemKey]: value, // directly update status
                    },
                };
            } else {
                // for single item which directly in root checklistItems
                return {
                    ...prev,
                    [itemKey]: value, // directly update status
                };
            }
        });
    };

    // Dummy data to get a technician name (later will using API)
    useEffect(() => {
        // const fetchTechnician = async () => {
        //     const response = await fetch('/api/get-current-user-lastname');
        //     const data = await response.json();

        //     if (data && data.lastName) {
        //         setUnitInfo(prev => ({ ...prev, technician: data.lastName }));
        //     }
        // };
        // fetchTechnician();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Unit Information: ", unitInfo);
        console.log("Item Checklist: ", checklistItems);
        console.log("Remarks: ", generalRemarks);
        
        alert("Form Submitted!");
        // here we send the data to the server or handle it as needed
    };

    const renderChecklistSection = (sectionTitle, sectionKey, items) => {
        return (
            <Card shadow="sm" p="xl" withBorder mb="lg">
                <Title order={3} mb="md" style={{ color: '#000000 !important' }}> {sectionTitle} </Title>
                <Grid gutter="xl">
                    {items.map((item, index) => (
                        <ChecklistRadioItem
                            key={index} // use index as key if there is no stable unique id
                            label={<Text style={{ color: '#000000 !important' }}>{`${item.id}. ${item.label}`}</Text>}
                            section={sectionKey}
                            itemKey={item.itemKey} // Using existing itemKey in state structure
                            currentStatus={checklistItems[sectionKey][item.itemKey] || ""} // Only status
                            onStatusChange={handleChecklistItemStatusChange}
                            span={{ base: 12, sm: 6 }}
                        />
                    ))}
                </Grid>
            </Card>
        );
    };

    const engineItems = [
        { id: '01', label: 'Air Filter', itemKey: 'airFilter' },
        { id: '02', label: 'Fuel Filter', itemKey: 'fuelFilter' },
        { id: '03', label: 'Fuel Pipe Filters', itemKey: 'fuelPipeFilters' },
        { id: '04', label: 'Injection Carburation System', itemKey: 'injectionCarburationSystem' },
        { id: '05', label: 'Radiator Cooling Systems', itemKey: 'radiatorCoolingSystems' },
        { id: '06', label: 'Belts', itemKey: 'belts' },
        { id: '07', label: 'Hoses Engine', itemKey: 'hosesEngine' },
    ];

    const transmissionItems = [
        { id: '01', label: 'Reversing System', itemKey: 'reversingSystem' },
        { id: '02', label: 'Gear Oil Leaks', itemKey: 'gearOilLeaks' },
        { id: '03', label: 'Direction Disconnect Pedal', itemKey: 'directionDisconnectPedal' },
        { id: '04', label: 'Clutch', itemKey: 'clutch' },
    ];

    const hydraulicHydrostaticCircuitsItems = [
        { id: '01', label: 'Oil Tank', itemKey: 'oilTank' },
        { id: '02', label: 'Pump and Coupling', itemKey: 'pumpsCoupling' },
        { id: '03', label: 'Tightness of Unions', itemKey: 'tightnessOfUnions' },
        { id: '04', label: 'Filling Level', itemKey: 'fillingLevel' },
        { id: '05', label: 'Hoses (e.g.)', itemKey: 'hosesHydraulic' },
        { id: '06', label: 'Accessory Parts', itemKey: 'accessoryParts' },
        { id: '07', label: 'Telescope Rams', itemKey: 'telescopeRams' },
        { id: '08', label: 'Tilt Lift Rams', itemKey: 'tiltLiftRams' },
        { id: '09', label: 'Steering Control Valves', itemKey: 'steeringControlValves' },
        { id: '10', label: 'Control Valves', itemKey: 'controlValves' },
    ];

    const brakingCircuitsItems = [
        { id: '01', label: 'Checking of Service Brake and Parking Brake Operation', itemKey: 'serviceBrakeParkingBrakeOperation' },
        { id: '02', label: 'Checking of Brake Fluid Level (as Per Assembly)', itemKey: 'brakeFluidLevel' },
    ];

    const lubricationItems = [
        { id: '01', label: 'Lubrication', itemKey: 'lubrication' },
    ];

    const boomMastManiscopicManicessItems = [
        { id: '01', label: 'Boom and Telescopes', itemKey: 'boomTelescopes' },
        { id: '02', label: 'Wear Pads', itemKey: 'wearPads' },
        { id: '03', label: 'Linkage', itemKey: 'linkage' },
        { id: '04', label: 'Forks', itemKey: 'forks' },
    ];

    const mastUnitItems = [
        { id: '01', label: 'Fixed and Movable Mast', itemKey: 'fixedMovableMast' },
        { id: '02', label: 'Carriage', itemKey: 'carriage' },
        { id: '03', label: 'Chains', itemKey: 'chains' },
        { id: '04', label: 'Rollers', itemKey: 'rollers' },
        { id: '05', label: 'Forks', itemKey: 'forksMastUnit' },
    ];

    const accessoriesItems = [
        { id: '01', label: 'Adaptation to Machine', itemKey: 'adaptationToMachine' },
        { id: '02', label: 'Hydraulic Connections', itemKey: 'hydraulicConnections' },
    ];

    const cabProtectiveDeviceElectricCircuitItems = [
        { id: '01', label: 'Seat', itemKey: 'seat' },
        { id: '02', label: 'Control Panel and Radio', itemKey: 'controlPanelRadio' },
        { id: '03', label: 'Horn and Warning Lights, Safety Devices', itemKey: 'hornWarningLightSafetyDevice' },
        { id: '04', label: 'Heater/ Air Conditioning', itemKey: 'heatingAirConditioning' },
        { id: '05', label: 'Windscreen Wiper/ Washer', itemKey: 'windscreenWiperWasher' },
        { id: '06', label: 'Horns', itemKey: 'horns' },
        { id: '07', label: 'Backup Alarm', itemKey: 'backupAlarm' },
        { id: '08', label: 'Head Lighting', itemKey: 'lighting' },
        { id: '09', label: 'Additional Lighting', itemKey: 'additionalLighting' },
        { id: '10', label: 'Rotating Beacon', itemKey: 'rotatingBeacon' },
        { id: '11', label: 'Battery', itemKey: 'battery' },
    ];

    const wheelsItems = [
        { id: '01', label: 'Rims', itemKey: 'rims' },
        { id: '02', label: 'Tires / Pressure', itemKey: 'tiresPressure' },
    ];

    // single item 
    const otherItems = [
        { id: '015', label: 'Secrews and Nuts', itemKey: 'screwsNuts', section: 'screwsNuts' },
        { id: '016', label: 'Frame and Body', itemKey: 'frameBody', section: 'frameBody' },
        { id: '017', label: 'Paint', itemKey: 'paint', section: 'paint' },
        { id: '018', label: 'Operators Manual', itemKey: 'operatorsManual', section: 'operatorsManual' },
        { id: '019', label: 'Instructions for Customer', itemKey: 'instructionsForCustomer', section: 'instructionsForCustomer' },
    ];


    return (
        // Box as outer wrapper to adjust width and placement
        <Box maw="100%" mx="auto" px="md">
            {/* Main Title, left align */}
            <Title order={1} mt="md" mb="lg" c="black"> Unit Arrival Check Inspection </Title>
            <form onSubmit={handleSubmit}>
                {/* Informasi Unit dalam Card */}
                <Card shadow="sm" p="xl" withBorder mb="lg">
                    <Title order={3} mb="lg" c="black"> Unit Information </Title>
                    <Grid gutter="xl">
                        <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
                            <Select
                                label={<Text style={{ color: '#000000 !important' }}> Type/ Model </Text>}
                                name="model"
                                placeholder="Select Model"
                                data={dummyModels}
                                value={unitInfo.model}
                                onChange={(value) => handleSelectChange('model', value)}
                                searchable
                                clearable
                                //custome render option
                                renderOption={({ option, checked }) => (
                                    <Text c="black">{option.label}</Text>
                                )}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
                            <TextInput
                                label={<Text style={{ color: '#000000 !important' }}> VIN Number </Text>}
                                name="serialNo"
                                placeholder="Input VIN Number"
                                value={unitInfo.serialNo}
                                onChange={handleUnitInfoChange}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
                            <TextInput
                                label={<Text style={{ color: '#000000 !important' }}> Hour Meter </Text>}
                                name="hourMeter"
                                placeholder="Input Hour Meter"
                                value={unitInfo.hourMeter}
                                onChange={handleUnitInfoChange}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
                            <Popover
                                opened={datePickerOpened}
                                onChange={setDatePickerOpened}
                                position="bottom-start"
                                shadow="md"
                                trapFocus
                                withArrow
                                zIndex={1000}
                            >
                                <Popover.Target>
                                    <TextInput
                                        label={<Text style={{ color: '#000000 !important' }}> Date of Check </Text>}
                                        placeholder="Select date"
                                        value={unitInfo.dateOfCheck ? unitInfo.dateOfCheck.toLocaleDateString('id-ID', { year: 'numeric', month: '2-digit', day: '2-digit' }) : ''}
                                        readOnly
                                        onClick={() => setDatePickerOpened(true)}
                                        rightSection={<IconCalendar size={16} style={{ cursor: 'pointer' }} onClick={() => setDatePickerOpened(true)} />}
                                        styles={{ input: { color: '#000000 !important' } }}
                                    />
                                </Popover.Target>
                                <Popover.Dropdown>
                                    <DatePicker
                                        value={unitInfo.dateOfCheck}
                                        onChange={handleDateChange}
                                        styles={{
                                            calendarHeaderControl: {
                                                color: '#000000 !important',
                                            },
                                            calendarHeader: {
                                                color: '#000000 !important',
                                            },
                                            weekday: {
                                                color: '#000000 !important',
                                            },
                                            day: {
                                                color: '#000000 !important',
                                                fontSize: 'var(--mantine-font-size-sm)',
                                                padding: 'var(--mantine-spacing-xs)',
                                            },
                                            month: {
                                                color: '#000000 !important',
                                                fontSize: 'var(--mantine-font-size-sm)',
                                            },
                                            year: {
                                                color: '#000000 !important',
                                                fontSize: 'var(--mantine-font-size-sm)',
                                            },
                                            pickerControl: {
                                                color: '#000000 !important',
                                            },
                                            pickerControlActive: {
                                                color: '#000000 !important',
                                            },
                                            monthPicker: {
                                                color: '#000000 !important',
                                            },
                                            yearPicker: {
                                                color: '#000000 !important',
                                            },
                                        }}
                                    />
                                </Popover.Dropdown>
                            </Popover>
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
                            <TimeInput
                                label={<Text style={{ color: '#000000 !important' }}> Time of Check </Text>}
                                placeholder="Select Time"
                                value={unitInfo.timeOfCheck}
                                onChange={handleTimeChange}
                                rightSection={<IconClock size={16} />}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
                            <Select
                                label={<Text style={{ color: '#000000 !important' }}> Technician </Text>}
                                name="technician"
                                placeholder="Select Technician"
                                data={dummyTechnician}
                                value={unitInfo.technician}
                                onChange={(value) => handleSelectChange('technician', value)}
                                searchable
                                clearable
                                //custome render option
                                renderOption={({ option, checked }) => (
                                    <Text c="black">{option.label}</Text>
                                )}
                            />
                        </Grid.Col>
                    </Grid>
                </Card>

                {/* Checklist */}
                <Title order={3} mb="md" c="black"> Item Checklist </Title>

                {renderChecklistSection("001 - Engine", "engine", engineItems)}
                {renderChecklistSection("002 - Transmission", "transmission", transmissionItems)}
                {renderChecklistSection("003 - Hydraulic/ Hydrostatic Circuits", "hydraulicHydrostaticCircuits", hydraulicHydrostaticCircuitsItems)}
                {renderChecklistSection("004 - Braking Circuits", "brakingCircuits", brakingCircuitsItems)}
                {renderChecklistSection("005 - Lubrication", "lubrication", lubricationItems)}
                {renderChecklistSection("006 - Boom/ Mast Maniscopic/ Manicess", "boomMastManiscopicManicess", boomMastManiscopicManicessItems)}
                {renderChecklistSection("007 - Unit Mast", "mastUnitCheckboxes", mastUnitItems)}
                {renderChecklistSection("008 - Accessories", "accessoriesCheckboxes", accessoriesItems)}
                {renderChecklistSection("009 - Cabin, Protective Devices/ Electrical Circuits", "cabProtectiveDeviceElectricCircuit", cabProtectiveDeviceElectricCircuitItems)}
                {renderChecklistSection("010 - Wheels", "wheels", wheelsItems)}

                {/* Other Items (outside numbered categories) */}
                <Card shadow="sm" p="xl" withBorder mb="lg">
                    <Title order={3} mb="md" style={{ color: '#000000 !important' }}> Other Items </Title>
                    <Grid gutter="xl">
                        {otherItems.map((item, index) => (
                            <ChecklistRadioItem
                                key={index}
                                label={<Text style={{ color: '#000000 !important' }}>{`${item.id} ${item.label}`}</Text>}
                                section={item.section} 
                                itemKey={item.itemKey} 
                                currentStatus={checklistItems[item.itemKey] || ""}
                                onStatusChange={(section, itemKey, value) => {
                                    setChecklistItems(prev => ({
                                        ...prev,
                                        [item.itemKey]: value
                                    }));
                                }}
                                span={{ base: 12, sm: 6 }}
                            />
                        ))}
                    </Grid>
                </Card>


                <Divider my="xl" />
                {/* Remarks */}
                <Title order={3} mb="md" c="black"> Remarks </Title>
                <Textarea
                    placeholder="Remarks"
                    value={generalRemarks}
                    onChange={(e) => setGeneralRemarks(e.currentTarget.value)}
                    minRows={4}
                    mb="xl"
                />

                <Group justify="flex-end" mt="md">
                    <Button type="submit"> Submit Checklist </Button>
                </Group>
            </form>
        </Box>
    );
};

export default UnitArrivalInspectionForm;