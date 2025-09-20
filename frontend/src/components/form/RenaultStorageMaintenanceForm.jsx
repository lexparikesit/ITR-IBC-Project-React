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
    Select,
    rem,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { IconCalendar, IconPencil, IconUpload, IconX, IconFile } from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { Dropzone, MIME_TYPES } from "@mantine/dropzone";

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

const initialChecklistValues = Object.keys(renaultChecklistItemDefinition).reduce((acc, sectionKey) => {
    acc[sectionKey] = renaultChecklistItemDefinition[sectionKey].reduce((itemAcc, item) => {
        itemAcc[item.itemKey] = {
            value: '',
            notes: '',
            image: null,
        };
        return itemAcc;
    }, {});
    return acc;
}, {});

const initialRenaultValues = {
    vinNo: '',
    unitModel: null,
    engineTypeNo: '',
    transmissionTypeNo: '',
    hourMeter: '',
    mileage: '',
    repairOrderNo: null,
    dateOfCheck: null,
    technician: null,
    approvalBy: null,

    checklistItems: initialChecklistValues,

    batteryInspection: [
        { batteryCheck: 'Front Battery', electrolyteLevel: '', voltage: '', statusOnBatteryAnalyzer: '' },
        { batteryCheck: 'Rear Battery', electrolyteLevel: '', voltage: '', statusOnBatteryAnalyzer: '' },
    ],

    faultCodes: [
        { faultCode: '', status: '' },
        { faultCode: '', status: '' },
        { faultCode: '', status: '' },
        { faultCode: '', status: '' },
        { faultCode: '', status: '' },
    ],

    repairNotes: '',
};

export function RenaultStorageMaintenanceForm() {
    const [unitModels, setUnitModels] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [approvers, setApprovers] = useState([]);
    const [woNumbers, setWoNumbers] = useState([]);

    const buildChecklistValidation = () => {
        let validationRules = {};
        Object.keys(renaultChecklistItemDefinition).forEach(sectionKey => {
            renaultChecklistItemDefinition[sectionKey].forEach(item => {
                const fieldKey = `checklistItems.${sectionKey}.${item.itemKey}`;
                validationRules[fieldKey] = (itemValue) => {
                    const status = itemValue.value;
                    const image = itemValue.image;

                    if (!status) {
                        return "This Field is Required!";
                    }

                    if ((status === "recommended_repair" || status === "immediately_repair") && !image) {
                        return 'Image is Required for "Repair Recommended" or "Repair Immediately"!';
                    }
                    return null;
                };
            });
        });
        return validationRules;
    };

    const form = useForm({
        initialValues: initialRenaultValues,
        validate: {
            vinNo: (value) => (value ? null : "VIN is Required!"),
            unitModel: (value) => (value ? null: "Type/ Model is Required!"),
            engineTypeNo: (value) => (value ? null : "Engine Type/ Number is Required!"),
            transmissionTypeNo: (value) => (value ? null : "Transmission Type/ Number is Required!"),
            hourMeter: (value) => (value ? null : "Hour Meter is Required!"),
            mileage: (value) => (value ? null : "Mileage is Required!"),
            dateOfCheck: (value) => (value ? null : "Date is Required!"),
            technician: (value) => (value ? null : "Technician is Required!"),
            approvalBy: (value) => (value ? null : "Approval By is Required!"),
            repairOrderNo: (value) => (value ? null : "WO Number is Required!"),
            ...buildChecklistValidation(),
        },
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const brandId = "RT"; // 'RT' for Renault
                const groupId = "SM"; // 'SM' for Storage Maintenance

                // model/ type RT API
				const modelResponse = await fetch(`http://127.0.0.1:5000/api/unit-types/RT`);
				if (!modelResponse.ok) throw new Error(`HTTP error! status: ${modelResponse.status}`);
				const modelData = await modelResponse.json();
				setUnitModels(modelData);

                // wo Number API
                const woResponse = await fetch(`http://127.0.0.1:5000/api/work-orders?brand_id=${brandId}&group_id=${groupId}`);
                if (!woResponse.ok) throw new Error(`HTTP error! status: ${woResponse.status}`);
                const woData = await woResponse.json();
                const formattedWoData = woData.map(wo => ({
                    value: wo.WONumber,
                    label: wo.WONumber
                }));
                setWoNumbers(formattedWoData);

                // dummy Technicians API
                const dummyTechniciansData = [
                    { value: "tech1", label: "John Doe" },
                    { value: "tech2", label: "Jane Smith" },
                    { value: "tech3", label: "Peter Jones" }
                ];
                setTechnicians(dummyTechniciansData);

                // dummy Approvers API
                const dummyApproverData = [
                    { value: "app1", label: "Alice Brown" },
                    { value: "app2", label: "Bob White" },
                    { value: "app3", label: "John Green" }
                ];
                setApprovers(dummyApproverData);

            } catch (error) {
                console.error("Failed to fetch models:", error);
                notifications.show({
                    title: "Error Loading Data",
                    message: "Failed to load models. Please try again!",
                    color: "red",
                });
            }
        };
        fetchData();
    }, []);

    const handleSubmit = async (values) => {
        const token = localStorage.getItem('access_token');

        if (!token) {
            notifications.show({
                title: "Authentication Error",
                message: "Please log in again. Authentication token is missing.",
                color: "red",
            });
            console.log("Authentication token is missing.");
            return;
        }

        console.log('Form Submitted (Frontend Data)', values);

        const payload = {
            brand: 'renault',
            unitInfo: {
                vinNo: values.vinNo,
                unitModel: values.unitModel,
                engineTypeNo: values.engineTypeNo,
                transmissionTypeNo: values.transmissionTypeNo,
                hourMeter: values.hourMeter,
                mileage: values.mileage,
                repairOrderNo: values.repairOrderNo,
                dateOfCheck: values.dateOfCheck,
                technician: values.technician,
                approvalBy: values.approvalBy,
            },
            checklistItems: values.checklistItems,
            batteryInspection: values.batteryInspection,
            faultCodes: values.faultCodes,
            repairNotes: values.repairNotes,
        };

        console.log("Payload to backend: ", payload);

        try {
            const response = await fetch(`http://127.0.0.1:5000/api/storage-maintenance/renault/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to submit Renault Storage Maintenance Checklist");
            }

            const result = await response.json();
            notifications.show({
                title: "Submission Successful!",
                message: result.message || "Form Submitted Successfully.",
                color: "green",
            });
            form.reset();

        } catch (error) {
            console.log('Error submitting form:', error);
            notifications.show({
                title: "Submission Error",
                message: `Failed to submit form: ${error.message}`,
                color: "red",
            });
        }
    };

    const renderChecklistItem = (label, sectionKey, itemKey) => {
        const itemData = form.getInputProps(`checklistItems.${sectionKey}.${itemKey}`);
        const showConditionalInputs = itemData.value.value === 'recommended_repair' || itemData.value.value === 'immediately_repair';
        const hasImage = itemData.value.image instanceof File;

        return (
            <Grid.Col span={{ base: 12 }} key={itemKey}>
                <Stack gap="xs">
                    <Text size="sm" style={{ color: '#000000 !important', fontWeight: 500 }}>{label}</Text>
                    <Text size="xs" style={{ color: 'var(--mantine-color-gray-6)' }}>Select one option</Text>

                    <Radio.Group
                        value={itemData.value.value}
                        onChange={(statusValue) => form.setFieldValue(`checklistItems.${sectionKey}.${itemKey}.value`, statusValue)}
                        orientation="horizontal"
                        error={form.errors[`checklistItems.${sectionKey}.${itemKey}`]}
                    >
                        <Group mt="xs" justify="space-between" style={{ width: '100%' }}>
                            <Radio value="checked" label={<Text style={{ color: '#000000 !important' }}> Checked, Without Notes </Text>} />
                            <Radio value="recommended_repair" label={<Text style={{ color: '#000000 !important' }}> Repair Recommended </Text>} />
                            <Radio value="immediately_repair" label={<Text style={{ color: '#000000 !important' }}> Repair Immediately </Text>} />
                            <Radio value="not_applicable" label={<Text style={{ color: '#000000 !important' }}> Not Applicable </Text>} />
                        </Group>
                    </Radio.Group>
                    
                    {showConditionalInputs && (
                        <>
                            <Dropzone
                                onDrop={(files) => {
                                    if (files.length > 0) {
                                        form.setFieldValue(`checklistItems.${sectionKey}.${itemKey}.image`, files[0]);
                                    }
                                }}
                                onReject={(files) => {
                                    notifications.show({
                                        title: 'File Rejected',
                                        message: `${files[0].errors[0].message}`,
                                        color: 'red',
                                    });
                                }}
                                maxFiles={1}
                                accept={[MIME_TYPES.jpeg, MIME_TYPES.png]}
                                mt="xs"
                                error={form.errors[`checklistItems.${sectionKey}.${itemKey}`]}
                            >
                                <Group justify="center" gap="xs" style={{ minHeight: rem(80), pointerEvents: 'none' }}>
                                    <Dropzone.Accept>
                                        <IconUpload style={{ width: rem(40), height: rem(40), color: 'var(--mantine-color-blue-6)' }} stroke={1.5} />
                                    </Dropzone.Accept>
                                    <Dropzone.Reject>
                                        <IconX style={{ width: rem(40), height: rem(40), color: 'var(--mantine-color-red-6)' }} stroke={1.5} />
                                    </Dropzone.Reject>
                                    <Dropzone.Idle>
                                        {hasImage ? (
                                            <IconFile style={{ width: rem(40), height: rem(40), color: 'var(--mantine-color-dimmed)' }} stroke={1.5} />
                                        ) : (
                                            <IconFile style={{ width: rem(40), height: rem(40), color: 'var(--mantine-color-dimmed)' }} stroke={1.5} />
                                        )}
                                    </Dropzone.Idle>
                                    <Stack align="center" gap={4}>
                                        <Text size="xs" c="dimmed"> {hasImage ? itemData.value.image.name : 'Drag and drop an image here or click to select'} </Text>
                                        <Text size="xs" c="dimmed"> Accepted formats: JPG, PNG </Text>
                                    </Stack>
                                </Group>
                            </Dropzone>
                            
                            <TextInput
                                placeholder="Add Image Caption"
                                mt="xs"
                                value={itemData.value.notes}
                                leftSection={<IconPencil size={20}/>}
                                onChange={(event) => form.setFieldValue(`checklistItems.${sectionKey}.${itemKey}.notes`, event.target.value)}
                            />
                        </>
                    )}
                </Stack>
            </Grid.Col>
        );
    };

    const renderChecklistSection = (sectionTitle, sectionKey, items) => {
        return (
            <Card shadow="sm" p="xl" withBorder mb="lg">
                <Title order={3} mb="md" style={{ color: '#000000 !important' }}>{sectionTitle}</Title>
                <Grid gutter="xl">
                    {items.map((item) => {
                        const fieldName = `checklistItems.${sectionKey}.${item.itemKey}`;
                        console.log('Rendering field:', fieldName);
                        return renderChecklistItem(
                            `${item.id}. ${item.label}`,
                            sectionKey,
                            item.itemKey
                        );
                    })}
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
                <Card shadow="sm" padding="lg" radius="md" withBorder mb="lg">
                    <Title order={3} mb="md" style={{ color: '#000000 !important' }}> Unit Information </Title>
                    <Grid gutter="xl">
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <Select
                                label="WO Number"
                                placeholder="Select WO Number"
                                data={woNumbers}
                                searchable
                                clearable
                                {...form.getInputProps('repairOrderNo')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <Select
                                label="Type/ Model"
                                placeholder="Select Model"
                                data={unitModels}
                                searchable
                                clearable
                                {...form.getInputProps('unitModel')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 3, lg: 3 }}>
                            <TextInput
                                label="VIN"
                                placeholder="Input VIN Number"
                                {...form.getInputProps('vinNo')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <TextInput
                                label="Engine Type/ No."
                                placeholder="Input Engine Type/ Number"
                                {...form.getInputProps('engineTypeNo')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <TextInput
                                label="Transmission Type/ No."
                                placeholder="Input Transmission Type/ Number"
                                {...form.getInputProps('transmissionTypeNo')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <TextInput
                                label="Hour Meter"
                                placeholder="Input Hour Meter"
                                {...form.getInputProps('hourMeter')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <TextInput
                                label="Mileage"
                                placeholder="Input Mileage"
                                {...form.getInputProps('mileage')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <DateInput
                                label="Date of Check"
                                placeholder="Select Date"
                                valueFormat="DD-MM-YYYY"
                                {...form.getInputProps('dateOfCheck')}
                                rightSection={<IconCalendar size={16} />}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <Select
                                label="Technician"
                                placeholder="Select Technician"
                                data={technicians}
                                searchable
                                clearable
                                {...form.getInputProps('technician')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <Select
                                label="Approval By"
                                placeholder="Select Approver"
                                data={approvers}
                                searchable
                                clearable
                                {...form.getInputProps('approvalBy')}
                            />
                        </Grid.Col>
                    </Grid>
                </Card>
                <Divider my="xl" label={<Text style={{ color: '#000000 !important' }}>Legend</Text>} labelPosition="center" />
                <Group justify="center" gap="xl" mb="lg">
                    <Text style={{ color: '#000000 !important' }}> 1: Checked, Without Notes </Text>
                    <Text style={{ color: '#000000 !important' }}> 2: Repair Recommended </Text>
                    <Text style={{ color: '#000000 !important' }}> 3: Repair Immediately </Text>
                    <Text style={{ color: '#000000 !important' }}> 0: Not Applicable </Text>
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
                    "dynamicTesting",
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

                {/* Fault Codes */}
                <Card shadow="sm" p="xl" withBorder mb="lg">
                    <Title order={3} mb="md" style={{ color: '#000000 !important' }}> Fault Codes </Title>
                    <Table striped highlightOnHover withTableBorder withColumnBorders>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th style={{ color: '#000000 !important' }}>Fault Code</Table.Th>
                                <Table.Th style={{ color: '#000000 !important' }}>Status</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {form.values.faultCodes.map((row, index) => (
                                <Table.Tr key={index}>
                                    <Table.Td>
                                        <TextInput
                                            placeholder="Enter Fault Code"
                                            {...form.getInputProps(`faultCodes.${index}.faultCode`)}
                                            styles={{ input: { color: '#000000 !important' } }}
                                        />
                                    </Table.Td>
                                    <Table.Td>
                                        <Select
                                            placeholder="Select Status"
                                            data={[
                                                { value: 'active', label: 'Active' },
                                                { value: 'inactive', label: 'Inactive' },
                                            ]}
                                            {...form.getInputProps(`faultCodes.${index}.status`)}
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
                        placeholder="Add notes about repairs or other important information..."
                        minRows={4}
                        {...form.getInputProps('repairNotes')}
                        styles={{ input: { color: '#000000 !important' } }}
                    />
                </Card>

                <Group justify="flex-end" mt="md">
                    <Button type="submit"> Submit </Button>
                </Group>
            </form>
        </Box>
    );
}

export default RenaultStorageMaintenanceForm;