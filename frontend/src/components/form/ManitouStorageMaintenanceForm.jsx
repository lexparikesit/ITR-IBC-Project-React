"use client";

import React, { useState, useEffect } from "react";
import {
    TextInput,
    Textarea,
    Button,
    Stack,
    Text,
    Grid,
    Group,
    Card,
    Title,
    Divider,
    Box,
    Select,
    Radio,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { IconCalendar } from "@tabler/icons-react";
import { useForm } from '@mantine/form';

const manitouStorageItemDefinition = {
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

export function ManitouStorageMaintenanceForm() {
    // State to store models fetched from API
    const [modelsData, setModelsData] = useState([]);

    // Initialize useForm with all fields
    const form = useForm({
        initialValues: (() => {
            const initialManitouValues = {
                model: null,
                serialNo: "", // VIN
                hourMeter: "",
                dateOfCheck: null,
                technician: "",
                signature: "",
                remarks: "",
            };

            // Dynamically add checklist items to initial values
            Object.keys(manitouStorageItemDefinition).forEach(sectionKey => {
                initialManitouValues[sectionKey] = {};
                manitouStorageItemDefinition[sectionKey].forEach(item => {
                    initialManitouValues[sectionKey][item.itemKey] = "";
                });
            });
            return initialManitouValues;
        })(),
    });

    // useEffect to fetch models from backend
    /* useEffect(() => {
        const fetchModels = async () => {
            try {
                // API mstType
                const response = await fetch('http://127.0.0.1:5000/api/unit-types/MA');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                
                const formattedModels = data
                    .filter(item => item.value !== null && item.value !== undefined && item.label !== null && item.label !== undefined)
                    .map(item => ({
                        value: item.value,
                        label: item.label
                    }));
                setModelsData(formattedModels);

            } catch (error) {
                console.error("Failed to fetch models:", error);
                setModelsData([]);
            }
        };

        fetchModels();
    }, []); */

    const handleSubmit = async (values) => {
        console.log('Form Submitted (Frontend Data)', values);

        const payload = {
            brand: 'manitou', // Hardcoded for Manitou
            
            unitInfo: {
                model: values.model,
                serialNo: values.serialNo,
                hourMeter: values.hourMeter,
                dateOfCheck: (values.dateOfCheck instanceof Date && !isNaN(values.dateOfCheck)) 
                                ? values.dateOfCheck.toISOString() 
                                : null,
                timeOfCheck: values.timeOfCheck,
                technician: values.technician,
                signature: values.signature,
            },
            remarks: values.remarks, // Renamed from generalRemarks
            checklistItems: values.checklistItems, // Directly use the nested object
        };

        console.log("Payload to Backend: ", payload);
        
        try {
            // Adjust API endpoint if storage maintenance has a different one
            const response = await fetch(`http://127.0.0.1:5000/api/storage-maintenance/manitou/submit`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
        
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to submit storage maintenance checklist');
            }

            const result = await response.json();
            alert(result.message || 'Form Submitted Succesfully!');
            form.reset();
        
        } catch (error) {
            console.error('Error submitting form:', error);
            alert(`Error: ${error.message}`);
        }
    };

    const renderChecklistItem = (label, formProps, key) => {
        return (
            <Grid.Col span={{ base: 12, sm: 6 }} key={key}>
                <Stack gap="xs">
                    <Text size="sm" style={{ color: '#000000 !important', fontWeight: 500 }}>{label}</Text>
                    <Radio.Group
                        {...formProps}
                        orientation="horizontal"
                    >
                        <Group mt="xs">
                            <Radio value="Good" label={<Text style={{ color: '#000000 !important' }}>Good</Text>} />
                            <Radio value="Missing" label={<Text style={{ color: '#000000 !important' }}>Missing</Text>} />
                            <Radio value="Bad" label={<Text style={{ color: '#000000 !important' }}>Missing</Text>} />
                        </Group>
                    </Radio.Group>
                </Stack>
            </Grid.Col>
        );
    };

    // Helper for checklist Render
    const renderChecklistSection = (sectionTitle, sectionKey, items) => {
        return (
            <Card shadow="sm" p="xl" withBorder mb="lg">
                <Title order={3} mb="md" style={{ color: '#000000 !important' }}>{sectionTitle}</Title>
                <Grid gutter="xl">
                    {items.map((item) => ( 
                        renderChecklistItem(
                            `${item.id}. ${item.label}`, 
                            form.getInputProps(`${sectionKey}.${item.itemKey}`),
                            `${sectionKey}-${item.itemKey}`
                        )
                    ))}
                </Grid>
            </Card>
        );
    };

    // Helper for other's checklist
    const renderOtherItemsSection = (items) => {
        return (
            <Card shadow="sm" p="xl" withBorder mb="lg">
                <Title order={3} mb="md" style={{ color: '#000000 !important' }}> Other's </Title>
                <Grid gutter="xl">
                    {items.map((item) => ( // Index dihapus
                        renderChecklistItem(
                            `${item.id} ${item.label}`,
                            form.getInputProps(item.itemKey),
                            { base: 12, sm: 6 },
                            `other-${item.itemKey}`
                        )
                    ))}
                </Grid>
            </Card>
        );
    };

    return (
        <Box maw="100%" mx="auto" px="md">
            <Title
                order={1}
                mt="md"
                mb="lg"
                style={{ color: '#000000 !important' }}
            >
                Storage Maintenance List
            </Title>

            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Card shadow="sm" p="xl" withBorder mb="lg">
                    <Title order={3} mb="md" style={{ color: '#000000 !important' }}> Unit Information </Title>
                    <Grid gutter="xl">
                        <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
                            <Select
                                label={<Text style={{ color: '#000000 !important' }}> Type/ Model </Text>}
                                placeholder="Select Model"
                                data={modelsData}
                                searchable
                                clearable
                                {...form.getInputProps('model')}
                                renderOption={({ option }) => (
                                    <Text c='black'>{option.label}</Text>
                                )}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
                            <TextInput
                                label={<Text style={{ color: '#000000 !important' }}> VIN </Text>}
                                placeholder="Input VIN Number"
                                {...form.getInputProps('serialNo')}
                                styles={{ input: { color: '#000000 !important' } }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
                            <TextInput
                                label={<Text style={{ color: '#000000 !important' }}> Hour Meter </Text>}
                                placeholder="Input Hour Meter"
                                {...form.getInputProps('hourMeter')}
                                styles={{ input: { color: '#000000 !important' } }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
                            <DateInput
                                label={<Text style={{ color: '#000000 !important' }}> Date of Check </Text>}
                                placeholder="Select Date"
                                valueFormat="DD-MM-YYYY"
                                {...form.getInputProps('dateOfCheck')}
                                onChange={(value) => {
                                    console.log("DateInput onChange value:", value);
                                    const parsedDate = value ? new Date(value) : null;
                                    console.log("DateInput onChange value (parsed):", parsedDate);
                                    form.setFieldValue('dateOfCheck', parsedDate);
                                }}
                                rightSection={<IconCalendar size={16} />}
                                styles={{
                                    input: { color: '#000000 !important' },
                                    calendarHeaderControl: { color: '#000000 !important' },
                                    calendarHeader: { color: '#000000 !important' },
                                    weekday: { color: '#000000 !important' },
                                    day: { color: '#000000 !important', fontSize: 'var(--mantine-font-size-sm)', padding: 'var(--mantine-spacing-xs)' },
                                    month: { color: '#000000 !important', fontSize: 'var(--mantine-font-size-sm)' },
                                    year: { color: '#000000 !important', fontSize: 'var(--mantine-font-size-sm)' },
                                    pickerControl: { color: '#000000 !important' },
                                    pickerControlActive: { color: '#000000 !important' },
                                    monthPicker: { color: '#000000 !important' },
                                    yearPicker: { color: '#000000 !important' },
                                    dropdown: {
                                        backgroundColor: 'white',
                                    }
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
                            <TextInput
                                label={<Text style={{ color: '#000000 !important' }}> Technician </Text>}
                                placeholder="Input Technician Name"
                                {...form.getInputProps('technician')}
                                styles={{ input: { color: '#000000 !important' } }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
                            <TextInput
                                label={<Text style={{ color: '#000000 !important' }}> Signature </Text>}
                                placeholder="Input Signature (e.g., Name/ID)"
                                {...form.getInputProps('signature')}
                                styles={{ input: { color: '#000000 !important' } }}
                            />
                        </Grid.Col>
                    </Grid>
                </Card>

                <Title order={3} mb="md" style={{ color: '#000000 !important' }}> Arrival Checklist </Title>

                {/* Render sections based on manitouStorageItemDefinition */}
                {renderChecklistSection("001 Engine", "engine", manitouStorageItemDefinition.engine)}
                {renderChecklistSection("002 Driveline", "driveline", manitouStorageItemDefinition.driveline)}
                {renderChecklistSection("003 Hydraulic / Hydrostatic Circuits", "hydraulicHydrostaticCircuits", manitouStorageItemDefinition.hydraulicHydrostaticCircuits)}
                {renderChecklistSection("004 Braking Circuits", "brakingCircuits", manitouStorageItemDefinition.brakingCircuits)}
                {renderChecklistSection("005 Boom Unit / Maniscopic / Maniaccess", "boomMastManiscopicManicess", manitouStorageItemDefinition.boomMastManiscopicManicess)}
                {renderChecklistSection("006 Mast Unit", "mastUnit", manitouStorageItemDefinition.mastUnit)}
                {renderChecklistSection("007 Accesseories", "accessories", manitouStorageItemDefinition.accessories)}
                {renderChecklistSection("008 Cab / Protective Device / Electric Circuit", "cabProtectiveDeviceElectricCircuit", manitouStorageItemDefinition.cabProtectiveDeviceElectricCircuit)}
                {renderChecklistSection("009 Wheels", "wheels", manitouStorageItemDefinition.wheels)}
                {renderChecklistSection("010 Screw and Nuts", "screwsAndNuts", manitouStorageItemDefinition.screwsAndNuts)}
                {renderChecklistSection("011 Frame and Body", "frameBody", manitouStorageItemDefinition.frameBody)}
                {renderChecklistSection("012 Paint", "paint", manitouStorageItemDefinition.paint)}
                {renderChecklistSection("013 General Operation", "generalOperation", manitouStorageItemDefinition.generalOperation)}
                {renderChecklistSection("014 Operator's Manual", "operatorsManual", manitouStorageItemDefinition.operatorsManual)}
                {renderChecklistSection("015 Instruction For Customer", "instructionsForCustomer", manitouStorageItemDefinition.instructionsForCustomer)}

                <Divider my="xl" />
                <Title order={3} mb="md" style={{ color: '#000000 !important' }}> General Remarks </Title>
                <Textarea
                    placeholder="Add any general remarks here..."
                    minRows={10}
                    mb="xl"
                    {...form.getInputProps('remarks')}
                    styles={{ input: { color: '#000000 !important' } }}
                />

                <Group justify="flex-end" mt="md">
                    <Button type="submit">Submit Checklist</Button>
                </Group>
            </form>
        </Box>
    );
}

export default ManitouStorageMaintenanceForm;