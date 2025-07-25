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
    Radio,  
    Table,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { IconCalendar } from "@tabler/icons-react";
import { useForm } from "@mantine/form";

const renaultChecklistItemDefinition = {
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
        { id: '36', label: 'Inspect the State of the Springs, Pads, Anti-roll Bars and Shock Absorbers.', ItemKey: 'springsPadsAntiRollBarsShockAbsorbers' },
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
}

export function RenaultStorageMaintenanceForm() {
    // state to store model fetched from API (if applicable for Renault)
    const [modelData, setModelsData] = useState([]);

    // initiate useForm with all fields
    const form = useForm({
        initialValues: (() => {
            const initialRenaultValues = {
                vinNo: '',
                engineTypeNo: '',
                transmissionTypeNo: '',
                hourMeter: '',
                mileage: '',
                repairOrderNo: '',
                date: null,
                carriedOutBy: '',
                approvedBy: '',

                // checklist items
                ...Object.keys(renaultChecklistItemDefinition).reduce((acc, sectionKey) => {
                    acc[sectionKey] = renaultChecklistItemDefinition[sectionKey].reduce((itemAcc, item) => {
                        return itemAcc;
                    }, {});
                    return acc;
                }, {}),

                // battery inspection
                batteryInspection: [
                    { batteryCheck: 'Front Battery', electrolyteLevel: '', voltage: '', statusOnBatteryAnalyzer: '' },
                    { batteryCheck: 'Rear Battery',electrolyteLevel: '', voltage: '', statusOnBatteryAnalyzer: '' },
                ],

                // fault codes
                faultCodes: [
                    { faultCode: '', status: '' },
                    { faultCode: '', status: '' },
                    { faultCode: '', status: '' },
                    { faultCode: '', status: '' },
                    { faultCode: '', status: '' },
                ],

                // repair notes
                repairNotes: '',
            };
            return initialRenaultValues;
        })(),
    });

    // useEffect to fect models from backend 
    // For now, is commented
    /* useEffect(() => {
        const fetchModels = async () => {
            try {
                const response = await fetch('http://127.0.0.1:5000/api/unit-types/RT');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setUnitModels(data);
            } catch (error) {
                console.error("Error fetching unit models:", error);
                setUnitModels([]);
            }
        };
        fetchModels();
    }, [form.values.brand]); */

    const handleSubmit = async (values) => {
        console.log('Form Submitted (Frontend Data)', values);

        const payload = {
            brand: 'renault',
            unitInfo: {
                vinNo: values.vinNo,
                engineTypeNo: values.engineTypeNo,
                transmissionTypeNo: values.transmissionTypeNo,
                hourMeter: values.hourMeter,
                mileage: values.mileage,
                repairOrderNo: values.repairOrderNo,
                date: (values.date instanceof Date && !isNaN(values.date))
                        ? values.date.toISOString()
                        : null,
                carrieOutBy: values.carriedOutBy,
                approvedBy: values.approvedBy,
            },
            checklistItems: values.checklistItems,
            batteryInspection: values.batteryInspection,
            faultCodes: values.faultCodes,
            repairNotes: values.repairNotes,
        };

        console.log("Payload to backend: ", payload);

        try {
            // API with endpoint backend RT
            const response = await fetch(`http://127.0.0.1:5000/api/storage-maintenance/renault/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to submit Renault Storage Maintenance Checklist");
            }

            const result = await response.json();
            alert(result.message || "Form Submitted Form:", error);
        
        } catch (error) {
            console.log('Error submitting form:', error);
            alert(`Error: ${error.message}`);
        }
    };

    // helper for render item checklist with radio button
    const renderChecklistItem = (label, formProps, key) => {
        return (
            <Grid.Col span={{ base: 12 }} key={key}>
                <Stack gap="xs">
                    <Text size="sm" style={{ color: '#000000 !important', fontWeight: 500 }}>{label}</Text>
                    <Radio.Group
                        {...formProps}
                        orientation="horizontal"
                    >
                        <Group mt="xs" justify="space-between" style={{ width: '100%' }}>
                            <Radio value="Repaired" label={<Text style={{ color: '#000000 !important' }}> Repaired, Without Notes </Text>} />
                            <Radio value="Recommended" label={<Text style={{ color: '#000000 !important' }}> Repair Recommended </Text>} />
                            <Radio value="Immediately" label={<Text style={{ color: '#000000 !important' }}> Repair Immediately </Text>} />
                            <Radio value="N/A" label={<Text style={{ color: '#000000 !important' }}> Not Applicable </Text>} />
                        </Group>
                    </Radio.Group>
                </Stack>
            </Grid.Col>
        );
    };

    // helper for rendering checklist parts
    const renderChecklistSection = (sectionTitle, sectionKey, items) => {
        return (
            <Card shadow="sm" p="xl" withBorder mb="lg">
                <Title order={3} mb="md" style={{ color: '#000000 !important' }}>{sectionTitle}</Title>
                <Grid gutter="xl">
                    {items.map((item) => (
                        renderChecklistItem(
                            `${item.id}. ${item.label}`,
                            form.getInputProps(`checklistItems.${sectionKey}.${item.itemKey}`),
                            `${sectionKey}-${item.itemKey}`
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
            > Storage Maintenance List 
            </Title>

            <form onSubmit={form.onSubmit(handleSubmit)}>
                {/* Header Information */}
                <Card shadow="sm" p="xl" withBorder mb="lg">
                    <Title order={3} mb="md" style={{ color: '#000000 !important' }}> Unit Information </Title>
                    <Grid gutter="xl">
                        <Grid.Col span={{ base: 12, md: 3, lg: 3 }}>
                            <TextInput
                                label={<Text style={{ color: '#000000 !important' }}> VIN </Text>}
                                placeholder="Input VIN Number"
                                {...form.getInputProps('vinNo')}
                                styles={{ input: { color: '#000000 !important' } }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <TextInput
                                label={<Text style={{ color: '#000000 !important' }}> Engine Type/ No. </Text>}
                                placeholder="Input Engine Type/ No."
                                {...form.getInputProps('engineTypeNo')}
                                styles={{ input: { color: '#000000 !important' } }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <TextInput
                                label={<Text style={{ color: '#000000 !important' }}> Transmission Type/ No. </Text>}
                                placeholder="Input Transmission Type/ No."
                                {...form.getInputProps('transmissionTypeNo')}
                                styles={{ input: { color: '#000000 !important' } }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <TextInput
                                label={<Text style={{ color: '#000000 !important' }}> Hour Meter </Text>}
                                placeholder="Input Hour Meter"
                                {...form.getInputProps('hourMeter')}
                                styles={{ input: { color: '#000000 !important' } }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <TextInput
                                label={<Text style={{ color: '#000000 !important' }}> Mileage </Text>}
                                placeholder="Input Mileage"
                                {...form.getInputProps('mileage')}
                                styles={{ input: { color: '#000000 !important' } }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <TextInput
                                label={<Text style={{ color: '#000000 !important' }}> Repair Order/ Work Order No. </Text>}
                                placeholder="Input Repair Order/ Work Order No."
                                {...form.getInputProps('repairOrderNo')}
                                styles={{ input: { color: '#000000 !important' } }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <DateInput
                                label={<Text style={{ color: '#000000 !important' }}> Date </Text>}
                                placeholder="Select Date"
                                valueFormat="DD-MM-YYYY"
                                {...form.getInputProps('date')}
                                onChange={(value) => {
                                    const parsedDate = value instanceof Date && !isNaN(value) ? value: null;
                                    form.setFieldValue('date', parsedDate)
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
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <TextInput
                                label={<Text style={{ color: '#000000 !important' }}> Carried Out By </Text>}
                                placeholder="Input Mechanics Name"
                                {...form.getInputProps('carriedOutBy')}
                                styles={{ input: { color: '#000000 !important' } }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <TextInput
                                label={<Text style={{ color: '#000000 !important' }}> Approved By </Text>}
                                placeholder="Input Name"
                                {...form.getInputProps('approvedBy')}
                                styles={{ input: { color: '#000000 !important' } }}
                            />
                        </Grid.Col>
                    </Grid>
                </Card>
                <Divider my="xl" label={<Text style={{ color: '#000000 !important' }}>Legend</Text>} labelPosition="center" />
                <Group justify="center" gap="xl" mb="lg">
                    <Text style={{ color: '#000000 !important' }}> 1: Repaired, Without Notes </Text>
                    <Text style={{ color: '#000000 !important' }}> 2: Repair Recommended </Text>
                    <Text style={{ color: '#000000 !important' }}> 3: Repair Immediately </Text>
                    <Text style={{ color: '#000000 !important' }}> 4: Not Applicable </Text>
                </Group>
                <Divider my="xl" />

                {/* Checklist Sections */}
                {renderChecklistSection(
                    "Operations to be Carried Out in the Cab",
                    "operationsInCab",
                    renaultChecklistItemDefinition.operationsInCab
                )}
                {renderChecklistSection(
                    "Operations to be Carried Out Around the Vehicle",
                    "operationsAroundVehicle",
                    renaultChecklistItemDefinition.operationsAroundVehicle
                )}
                {renderChecklistSection(
                    "Operations to be Carried out Under the Cab",
                    "operationsUnderCab",
                    renaultChecklistItemDefinition.operationsUnderCab
                )}
                {renderChecklistSection(
                    "Operations to be Carried Out Under the Vehicle",
                    "operationsUnderVehicle",
                    renaultChecklistItemDefinition.operationsUnderVehicle
                )}
                {renderChecklistSection(
                    "Dynamic Test",
                    "dynamicTest",
                    renaultChecklistItemDefinition.dynamicTesting
                )}

                {/* Battery Inspection Data */}
                <Card shadow="sm" p="xl" withBorder mb="lg">
                    <Title order={3} mb="md" style={{ color: '#000000 !important' }}> Battery Inspection Data </Title>
                    <Table striped highlightOnHover withTableBorder withColumnBorders>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th style={{ color: '#000000 !important' }}>Battery, Check</Table.Th>
                                <Table.Th style={{ color: '#000000 !important' }}>Electrolyte Level</Table.Th>
                                <Table.Th style={{ color: '#000000 !important' }}>Voltage</Table.Th>
                                <Table.Th style={{ color: '#000000 !important' }}>Status on Battery Analyzer</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {form.values.batteryInspection.map((row, index) => (
                                <Table.Tr key={index}>
                                    <Table.Td style={{ color: '#000000 !important' }}>{row.batteryCheck}</Table.Td>
                                    <Table.Td>
                                        <TextInput
                                            placeholder="Level"
                                            {...form.getInputProps(`batteryInspection.${index}.electrolyteLevel`)}
                                            styles={{ input: { color: '#000000 !important' } }}
                                        />
                                    </Table.Td>
                                    <Table.Td>
                                        <TextInput
                                            placeholder="Voltage"
                                            {...form.getInputProps(`batteryInspection.${index}.voltage`)}
                                            styles={{ input: { color: '#000000 !important' } }}
                                        />
                                    </Table.Td>
                                    <Table.Td>
                                        <TextInput
                                            placeholder="Status"
                                            {...form.getInputProps(`batteryInspection.${index}.statusOnBatteryAnalyzer`)}
                                            styles={{ input: { color: '#000000 !important' } }}
                                        />
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                </Card>
                
                {/* Fault Codes Status */}
                <Card shadow="sm" p="xl" withBorder mb="lg">
                    <Title order={3} mb="md" style={{ color: '#000000 !important' }}> Fault Codes Status </Title>
                    <Table striped highlightOnHover withTableBorder withColumnBorders>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th style={{ color: '#000000 !important' }}> Fault Codes </Table.Th>
                                <Table.Th style={{ color: '#000000 !important' }}> Status </Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {form.values.faultCodes.map((row, index) => (
                                <Table.Tr key={index}>
                                    <Table.Td>
                                        <TextInput
                                            placeholder="Fault Code"
                                            {...form.getInputProps(`faultCodes.${index}.faultCode`)}
                                            styles={{ input: { color: '#000000 !important' } }}
                                        />
                                    </Table.Td>
                                    <Table.Td>
                                        <TextInput
                                            placeholder="Status"
                                            {...form.getInputProps(`faultCodes.${index}.status`)}
                                            styles={{ input: { color: '#000000 !important' } }}
                                        />
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                </Card>

                {/* Repair Notes */}
                <Card shadow="sm" p="xl" withBorder mb="lg">
                    <Title order={3} mb="md" style={{ color: '#000000 !important' }}> Repair Notes </Title>
                    <Textarea
                        placeholder="Add any repair notes here..."
                        minRows={15} // Increased minRows for larger remarks
                        mb="xl"
                        {...form.getInputProps('repairNotes')}
                        styles={{ input: { color: '#000000 !important' } }}
                    />
                </Card>
                <Group justify="flex-end" mt="md">
                    <Button type="submit">Submit Checklist</Button>
                </Group>
            </form>
        </Box>
    );   
}

export default RenaultStorageMaintenanceForm;