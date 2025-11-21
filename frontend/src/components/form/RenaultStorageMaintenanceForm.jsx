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
    Loader,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { IconCalendar, IconPencil, IconUpload, IconX, IconFile, IconRefresh } from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { Dropzone, MIME_TYPES } from "@mantine/dropzone";
import apiClient from "@/libs/api";
import imageCompression from "browser-image-compression";

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

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const MAX_ACCEPTED_SIZE = 5 * 1024 * 1024;
const COMPRESS_OPTIONS = {
    maxSizeMB: 1.8,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: 'image/jpeg',
}

export function RenaultStorageMaintenanceForm() {
    const [unitModels, setUnitModels] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [approvers, setApprovers] = useState([]);
    const [woNumbers, setWoNumbers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    const processImage = async (file, sectionKey, itemKey) => {
        try {
            if (file.size > MAX_ACCEPTED_SIZE) {
                notifications.show({
                    title: "File Too Large",
                    message: "Maximum file size is 5MB. Please choose a smaller file.",
                    color: "red",
                });
                return null;
            }

            let processedFile = file;

            if (file.size > MAX_FILE_SIZE) {
                notifications.show({
                    title: "Optimizing Image",
                    message: `Compressing ${file.name}...`,
                    color: "blue",
                    autoClose: false,
                    id: `compress-${sectionKey}-${itemKey}`
                });
            
                processedFile = await imageCompression(file, COMPRESS_OPTIONS);

                if (processedFile.size > MAX_FILE_SIZE) {
                    notifications.update({
                        id: `compress-${sectionKey}-${itemKey}`,
                        title: "Compression Failed",
                        message: "Unable to compress below 2MB. Please choose a different image.",
                        color: "red",
                        autoClose: 5000
                    });
                    return null;
                }

                notifications.update({
                    id: `compress-${sectionKey}-${itemKey}`,
                    title: "Image Optimized",
                    message: `Compressed to ${(processedFile.size / 1024 / 1024).toFixed(2)} MB`,
                    color: "green",
                    autoClose: 3000
                });
            }
            return processedFile;

        } catch (error) {
            console.error("Image processing error:", error);
            notifications.show({
                title: "Processing Error",
                message: "Failed to process image. Please try again.",
                color: "red",
            });
            return null;
        }
    };

    const buildChecklistValidation = () => {
        let validationRules = {};
        Object.keys(renaultChecklistItemDefinition).forEach(sectionKey => {
            renaultChecklistItemDefinition[sectionKey].forEach(item => {
                const fieldKey = `checklistItems.${sectionKey}.${item.itemKey}`;
                validationRules[fieldKey] = (itemValue) => {
                    if (!itemValue) {
                        return "This Field is Required!";
                    }

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
        initialValues: (() => {
            const initialRenaultValues = {
                vinNo: "",
                unitModel: null,
                engineTypeNo: "",
                transmissionTypeNo: "",
                hourMeter: "",
                mileage: "",
                repairOrderNo: "",
                dateOfCheck: null,
                technician: null,
                approvalBy: null,
                
                batteryInspection: [
                    { batteryCheck: 'Front Battery', electrolyteLevel: '', voltage: '', statusOnBatteryAnalyzer: '' },
                    { batteryCheck: 'Rear Battery', electrolyteLevel: '', voltage: '', statusOnBatteryAnalyzer: '' },
                ],
                
                faultCodes: [
                    { faultCode: '', status: null },
                    { faultCode: '', status: null },
                    { faultCode: '', status: null },
                    { faultCode: '', status: null },
                    { faultCode: '', status: null },
                ],
                repairNotes: "",
                checklistItems: {}, 
            };
            Object.keys(renaultChecklistItemDefinition).forEach(sectionKey => {
                initialRenaultValues.checklistItems[sectionKey] = {};
                renaultChecklistItemDefinition[sectionKey].forEach(item => {
                    initialRenaultValues.checklistItems[sectionKey][item.itemKey] = { 
                        value: "", 
                        notes: "",
                        image: null 
                    };
                });
            });
            return initialRenaultValues;
        })(),
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
                const [
                    modelRes,
                    woRes,
                    techRes,
                    supervisorRes,
                    techHeadRes,
                ] = await Promise.all([
                    apiClient.get(`/unit-types/${brandId}`),
                    apiClient.get(`/work-orders?brand_id=${brandId}&group_id=${groupId}`),
                    apiClient.get("/users/by-role/Technician"),
                    apiClient.get("/users/by-role/Supervisor"),
                    apiClient.get("/users/by-role/Technical Head")
                ])

                setUnitModels(modelRes.data);
                setWoNumbers(woRes.data.map(wo => ({ value: wo.WONumber, label: wo.WONumber })));
                setTechnicians(techRes.data);
                setApprovers([
                    ...supervisorRes.data,
                    ...techHeadRes.data,
                ]);
                
            } catch (error) {
                console.error("Failed to fetch models:", error);
                notifications.show({
                    title: "Error Loading Data",
                    message: "Failed to load models. Please try again!",
                    color: "red",
                });
            
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const retryUpload = async (sectionKey, itemKey) => {
        const currentFile = form.values.checklistItems[sectionKey]?.[itemKey]?.image;
        if (!currentFile) return;

        setUploading(true);
        try {
            const processedFile = await processImage(currentFile, sectionKey, itemKey);
            if (processedFile) {
                form.setFieldValue(`checklistItems.${sectionKey}.${itemKey}.image`, processedFile);
            }
        } finally {
            setUploading(false);
        }
    };

    // Build payload and FormData immutably (avoid mutating form values)
    const buildPayloadAndFormData = (values) => {
        const builtChecklistItems = {};
        const formData = new FormData();
        const missingItems = [];

        Object.entries(renaultChecklistItemDefinition).forEach(([sectionKey, items]) => {
            builtChecklistItems[sectionKey] = {};

            items.forEach((item) => {
                const itemData = values.checklistItems?.[sectionKey]?.[item.itemKey] ?? { value: "", notes: "", image: null };

                if (!itemData.value) {
                    missingItems.push(`${sectionKey} - ${item.label}`);
                    return;
                }

                if ((itemData.value === "recommended_repair" || itemData.value === "immediately_repair") && !itemData.image) {
                    missingItems.push(`${sectionKey} - ${item.label}`);
                    return;
                }

                builtChecklistItems[sectionKey][item.itemKey] = {
                    value: itemData.value,
                    notes: itemData.notes || "",
                };

                if (itemData.image) {
                    const imageKey = `image-${sectionKey}-${item.itemKey}`;
                    const notesKey = `notes-${sectionKey}-${item.itemKey}`;
                    formData.append(imageKey, itemData.image);
                    formData.append(notesKey, itemData.notes || "");
                }
            });
        });

        return { builtChecklistItems, formData, missingItems };
    };

    const handleSubmit = async (values) => {
        setUploading(true);
        
        try {
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

            const { builtChecklistItems, formData, missingItems } = buildPayloadAndFormData(values);

            if (missingItems.length > 0) {
                notifications.show({
                    title: "Missing Items",
                    message: `Please complete all required fields: ${missingItems.join(', ')}`,
                    color: "red",
                });
                return;
            }

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
                checklistItems: builtChecklistItems,
                batteryInspection: values.batteryInspection,
                faultCodes: values.faultCodes,
                repairNotes: values.repairNotes,
            };

            formData.append('data', JSON.stringify(payload));

            await apiClient.post(`/storage-maintenance/renault/submit`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
            });

            notifications.show({
                title: "Success!",
                message: "Form Submitted Successfully!",
                color: "green",
            });
            form.reset();

        } catch (error) {
            console.error('Error submitting form:', error);
            const errorMessage = error.response?.data?.message || error.message || "Failed to submit checklist";
            notifications.show({
                title: "Submission Error",
                message: `Error: ${errorMessage}`,
                color: "red",
            });
            
        } finally {
            setUploading(false);
        }
    };

    const renderChecklistItem = (label, sectionKey, itemKey) => {
        const itemValue = form.values.checklistItems[sectionKey]?.[itemKey] || { value: '', notes: '', image: null };
        const showConditionalInputs = itemValue.value === 'recommended_repair' || itemValue.value === 'immediately_repair';
        const hasImage = itemValue.image instanceof File;

        return (
            <Grid.Col span={{ base: 12 }} key={`${sectionKey}-${itemKey}`}>
                <Stack gap="xs">
                    <Text size="sm" style={{ color: 'var(--mantine-color-text)', fontWeight: 500 }}>{label}</Text>
                    <Text size="xs" style={{ color: 'var(--mantine-color-gray-6)' }}>Select one option</Text>

                    <Radio.Group
                        value={itemValue.value}
                        onChange={(statusValue) => {
                            form.setFieldValue(`checklistItems.${sectionKey}.${itemKey}.value`, statusValue);
                            if (statusValue === "checked") {
                                form.setFieldValue(`checklistItems.${sectionKey}.${itemKey}.image`, null);
                                form.setFieldValue(`checklistItems.${sectionKey}.${itemKey}.notes`, "");
                            }
                        }}
                        orientation="horizontal"
                        error={form.errors[`checklistItems.${sectionKey}.${itemKey}`]}
                    >
                        <Group mt="xs" justify="space-between" style={{ width: '100%' }}>
                            <Radio value="checked" label={<Text style={{ color: 'var(--mantine-color-text)' }}> Checked, Without Notes </Text>} />
                            <Radio value="recommended_repair" label={<Text style={{ color: 'var(--mantine-color-text)' }}> Repair Recommended </Text>} />
                            <Radio value="immediately_repair" label={<Text style={{ color: 'var(--mantine-color-text)' }}> Repair Immediately </Text>} />
                            <Radio value="not_applicable" label={<Text style={{ color: 'var(--mantine-color-text)' }}> Not Applicable </Text>} />
                        </Group>
                    </Radio.Group>
                    
                    {showConditionalInputs && (
                        <>
                            <Dropzone
                                onDrop={async (files) => {
                                    if (files.length > 0) {
                                        const processedFile = await processImage(files[0], sectionKey, itemKey);
                                        if (processedFile) {
                                            form.setFieldValue(`checklistItems.${sectionKey}.${itemKey}.image`, processedFile);
                                        }
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
                                maxSize={MAX_ACCEPTED_SIZE}
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
                                        <Text size="xs" c="dimmed"> 
                                            {hasImage ? itemValue.image.name : 'Drag and drop an image here or click to select'} 
                                        </Text>
                                        <Text size="xs" c="dimmed"> 
                                            JPG/PNG, max 5MB (will be compressed to ≤2MB)
                                        </Text>
                                        {hasImage && (
                                            <Text size="xs" c="green">
                                                {(itemValue.image.size / 1024 / 1024).toFixed(2)} MB
                                            </Text>
                                        )}
                                    </Stack>
                                </Group>
                            </Dropzone>
                            {hasImage && (
                                <Group justify="flex-end">
                                    <Button
                                        variant="subtle"
                                        size="xs"
                                        onClick={() => retryUpload(sectionKey, itemKey)}
                                        loading={uploading}
                                        leftSection={<IconRefresh size={14} />}
                                    >
                                        Retry Upload
                                    </Button>
                                </Group>
                            )}
                            <TextInput
                                placeholder="Add Image Caption"
                                mt="xs"
                                value={itemValue.notes}
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
                <Title order={3} mb="md" style={{ color: 'var(--mantine-color-text)' }}>{sectionTitle}</Title>
                <Grid gutter="xl">
                    {items.map((item) => (
                        renderChecklistItem(
                            `${item.id}. ${item.label}`,
                            sectionKey,
                            item.itemKey
                        )
                    ))}
                </Grid>
            </Card>
        );
    };

    if (loading) {
        return (
            <Box maw="100%" mx="auto" px="md" ta="center">
                <Title order={1} mt="md" mb="lg" c="var(--mantine-color-text)">Loading Form Data...</Title>
                <Loader size="lg" />
            </Box>
        );
    }

    return (
        <Box maw="100%" mx="auto" px="md">
            <Title
                order={1}
                mt="md"
                mb="lg"
                c="var(--mantine-color-text)"
            > 
                Storage Maintenance List
            </Title>
            <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
                <Card shadow="sm" padding="lg" radius="md" withBorder mb="lg">
                    <Title order={3} mb="md" c="var(--mantine-color-text)"> Unit Information </Title>
                    <Grid gutter="xl">
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            {/* <Select
                                label="WO Number"
                                placeholder="Select WO Number"
                                data={woNumbers}
                                searchable
                                clearable
                                {...form.getInputProps('repairOrderNo')}
                            /> */}
                            <TextInput
                                label="WO Number"
                                placeholder="Input WO Number"
                                {...form.getInputProps("repairOrderNo")}
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
                <Divider my="xl" label={<Text c="var(--mantine-color-text)">Legend</Text>} labelPosition="center" />
                <Group justify="center" gap="xl" mb="lg">
                    <Text c="var(--mantine-color-text)"> 1: Checked, Without Notes </Text>
                    <Text c="var(--mantine-color-text)"> 2: Repair Recommended </Text>
                    <Text c="var(--mantine-color-text)"> 3: Repair Immediately </Text>
                    <Text c="var(--mantine-color-text)"> 0: Not Applicable </Text>
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
                    <Title order={3} mb="md" style={{ color: 'var(--mantine-color-text)' }}> Battery Inspection Data </Title>
                    <Table striped highlightOnHover withTableBorder withColumnBorders>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th style={{ color: 'var(--mantine-color-text)' }}>Battery, Check</Table.Th>
                                <Table.Th style={{ color: 'var(--mantine-color-text)' }}>Electrolyte Level</Table.Th>
                                <Table.Th style={{ color: 'var(--mantine-color-text)' }}>Voltage</Table.Th>
                                <Table.Th style={{ color: 'var(--mantine-color-text)' }}>Status on Battery Analyzer</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {form.values.batteryInspection.map((row, index) => (
                                <Table.Tr key={index}>
                                    <Table.Td style={{ color: 'var(--mantine-color-text)' }}>{row.batteryCheck}</Table.Td>
                                    <Table.Td>
                                        <TextInput
                                            placeholder="Level"
                                            {...form.getInputProps(`batteryInspection.${index}.electrolyteLevel`)}
                                            styles={{ input: { color: 'var(--mantine-color-text)' } }}
                                        />
                                    </Table.Td>
                                    <Table.Td>
                                        <TextInput
                                            placeholder="Voltage"
                                            {...form.getInputProps(`batteryInspection.${index}.voltage`)}
                                            styles={{ input: { color: 'var(--mantine-color-text)' } }}
                                        />
                                    </Table.Td>
                                    <Table.Td>
                                        <TextInput
                                            placeholder="Status"
                                            {...form.getInputProps(`batteryInspection.${index}.statusOnBatteryAnalyzer`)}
                                            styles={{ input: { color: 'var(--mantine-color-text)' } }}
                                        />
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                </Card>

                {/* Fault Codes */}
                <Card shadow="sm" p="xl" withBorder mb="lg">
                    <Title order={3} mb="md" style={{ color: 'var(--mantine-color-text)' }}> Fault Codes </Title>
                    <Table striped highlightOnHover withTableBorder withColumnBorders>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th style={{ color: 'var(--mantine-color-text)' }}>Fault Code</Table.Th>
                                <Table.Th style={{ color: 'var(--mantine-color-text)' }}>Status</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {form.values.faultCodes.map((row, index) => (
                                <Table.Tr key={index}>
                                    <Table.Td>
                                        <TextInput
                                            placeholder="Enter Fault Code"
                                            {...form.getInputProps(`faultCodes.${index}.faultCode`)}
                                            styles={{ input: { color: 'var(--mantine-color-text)' } }}
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
                    <Title order={3} mb="md" style={{ color: 'var(--mantine-color-text)' }}> Repair Notes </Title>
                    <Textarea
                        placeholder="Add notes about repairs or other important information..."
                        minRows={4}
                        {...form.getInputProps('repairNotes')}
                        styles={{ input: { color: 'var(--mantine-color-text)' } }}
                    />
                </Card>

                <Group justify="flex-end" mt="md">
                    <Button
                        type="submit"
                        loading={uploading}
                        disabled={uploading}
                    >
                        {uploading ? 'Submitting...' : 'Submit'}
                    </Button>
                </Group>
            </form>
        </Box>
    );
}

export default RenaultStorageMaintenanceForm;