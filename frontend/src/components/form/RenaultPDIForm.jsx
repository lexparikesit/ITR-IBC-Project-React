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

const renaultPdiChecklistItemDefinition = {
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

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const MAX_ACCEPTED_SIZE = 5 * 1024 * 1024;
const COMPRESS_OPTIONS = {
    maxSizeMB: 1.8,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: 'image/jpeg',
}

export function RenaultPDIForm() {
    const [unitModels, setUnitModels] = useState([]);
    const [WoNumbers, setWoNumbers] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [approvers, setApprovers] = useState([]);
    const [provinces, setProvinces] = useState([]);
    const [engines, setEngines] = useState([]);
    const [customers, setCustomers] = useState([]);
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
        const rules = {};
        Object.keys(renaultPdiChecklistItemDefinition).forEach((sectionKey) => {
            renaultPdiChecklistItemDefinition[sectionKey].forEach((item) => {
                rules[`checklistItems.${sectionKey}.${item.itemKey}.value`] = (v) =>
                    v ? null : 'This Field is Required!';
                rules[`checklistItems.${sectionKey}.${item.itemKey}.image`] = (_img, values) => {
                    const selected = values?.checklistItems?.[sectionKey]?.[item.itemKey]?.value;
                    const image = values?.checklistItems?.[sectionKey]?.[item.itemKey]?.image;

                    if (!selected) return null; // let value rule fire first
                    if (selected === 'not_applicable') return null; // NA does not require image
                    return image ? null : 'An Image is Required for This Item!';
                };
            });
        });
        return rules;
    };

    const form = useForm({
        initialValues: (() => {
            const initialRenaultPdiValues = {
                date: "",
                vinNo: "",
                repairOrderNo: "",
                mileageHourMeter: "",
                chassisId: "",
                registrationNo: "",
                customer: null,
                province: null,
                model: null,
                engine: null,
                technician: null,
                approvalBy: null,

                batteryStatus: [
                    { battery: 'Inner/ Front Battery', testCode: '' },
                    { battery: 'Outer/ Rear Battery', testCode: '' },
                ],

                vehicleDamageNotes: "",
                checklistItems: {},
            };
            Object.keys(renaultPdiChecklistItemDefinition).forEach(sectionKey => {
                initialRenaultPdiValues.checklistItems[sectionKey] = {};
                renaultPdiChecklistItemDefinition[sectionKey].forEach(item => {
                    initialRenaultPdiValues.checklistItems[sectionKey][item.itemKey] = {
                        value: "",
                        notes: "",
                        image: null
                    };
                });
            });
            return initialRenaultPdiValues;
        })(),
        validate: {
            repairOrderNo: (value) => (value ? null : "WO Number is Required!"),
            vinNo: (value) => (value ? null: "VIN Number is Required!"),
            mileageHourMeter: (value) => (value ? null: "Mileage is Required!"),
            chassisId: (value) => (value ? null : "Chassis ID is Required!"),
            registrationNo: (value) => (value ? null : "Registration No is Required!"),
            customer: (value) => (value ? null : "Customer is Required!"),
            province: (value) => (value ? null : "City is Required!"),
            model: (value) => (value ? null : "Type/Model is Required!"),
            engine: (value) => (value ? null : "Engine is Required!"),
            date: (value) => (value ? null : "Date is Required!"),
            technician: (value) => (value ? null: "Technician is Required!"),
            approvalBy: (value) => (value ? null: "Approval By is Required!"),
            ...buildChecklistValidation(),
        },
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const brandId = "RT"; // 'RT' for Renault
                const groupId = "DPDPI"; // 'DPDPI' for PDI
                const [
                    modelRes,
                    woRes,
                    techRes,
                    customerRes,
                    provinceRes,
                    supervisorRes,
                    techHeadRes,
                ] = await Promise.all([
                    apiClient.get(`/unit-types/${brandId}`),
                    apiClient.get(`/work-orders?brand_id=${brandId}&group_id=${groupId}`),
                    apiClient.get("/users/by-role/Technician"),
                    apiClient.get("/customers"),
                    apiClient.get("/provinces"),
                    apiClient.get("/users/by-role/Supervisor"),
                    apiClient.get("/users/by-role/Technical Head")
                ])
                
                setUnitModels(modelRes.data);
                setWoNumbers(woRes.data.map(wo => ({ value: wo.WONumber, label: wo.WONumber })));
                setTechnicians(techRes.data);
                setCustomers(customerRes.data.map((customer => ({ value: customer.CustomerID, label: customer.CustomerName }))));
                setApprovers([
                    ...supervisorRes.data,
                    ...techHeadRes.data,
                ]);

                const provinceObject = provinceRes.data;

                if (typeof provinceObject === 'object' && provinceObject !== null) {
                    const provinceArray = Object.keys(provinceObject).map((code) => ({
                        value: code,
                        label: provinceObject[code],
                    }));
                    setProvinces(provinceArray);
                } else {
                    console.log("Invalid provinces response:", provinceObject);
                    setProvinces([]);
                };

                // engine Types
                const engineData = [
                    { value: "DXI 11", label: "DXI 11" },
                    { value: "DXI 13", label: "DXI 13" },
                ];
                setEngines(engineData);
                
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
                setUploading(false);
                return;
            }

            // Ensure client-side validation passes before building payload
            const validation = form.validate();
            if (validation.hasErrors) {
                notifications.show({
                    title: "Missing or Invalid Fields",
                    message: "Please fix the highlighted fields before submitting.",
                    color: "red",
                });
                setUploading(false);
                return;
            }

            const checklistPayload = {};
            const formData = new FormData();

            const {
                cab,
                exterior,
                lubricationOilAndFluidLevels,
                testDrive,
                underVehicle,
                finish,
            } = values.checklistItems;
        
            const processChecklistItems = (section, sectionKey) => {
                checklistPayload[sectionKey] = {}; 
                Object.entries(section).forEach(([itemKey, itemValue]) => {
                    checklistPayload[sectionKey][itemKey] = {
                        value: itemValue.value,
                        notes: itemValue.notes,
                    };
                    
                    if (itemValue.image) {
                        formData.append(`${sectionKey}.${itemKey}.image`, itemValue.image);
                    }
                });
            };
        
            processChecklistItems(cab, 'cab');
            processChecklistItems(exterior, 'exterior');
            processChecklistItems(lubricationOilAndFluidLevels, 'lubricationOilAndFluidLevels');
            processChecklistItems(testDrive, 'testDrive');
            processChecklistItems(underVehicle, 'underVehicle');
            processChecklistItems(finish, 'finish');

            const payload = {
                brand: 'renault',
                unitInfo: {
                    repairOrderNo: values.repairOrderNo,
                    mileageHourMeter: values.mileageHourMeter,
                    chassisId: values.chassisId,
                    registrationNo: values.registrationNo,
                    vinNo: values.vinNo,
                    date: values.date,
                    customer: values.customer,
                    province: values.province,
                    model: values.model,
                    engine: values.engine,
                    technician: values.technician,
                    approvalBy: values.approvalBy,
                },
                checklistItems: checklistPayload,
                batteryStatus: {
                    batt_inner_front: values.batteryStatus[0].battery,
                    test_code_batt_inner_front: values.batteryStatus[0].testCode,
                    batt_outer_rear: values.batteryStatus[1].battery,
                    test_code_batt_outer_rear: values.batteryStatus[1].testCode,
                },
                vehicle_inspection: values.vehicleDamageNotes,
            };

            formData.append('data', JSON.stringify(payload));
            console.log("Payload to be sent:", payload);

            await apiClient.post(`/pre-delivery-inspection/renault/submit`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                timeout: 50000
            })

            notifications.show({
                title: "Success!",
                message: "Form Submitted Successfully!",
                color: "green",
            })
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
        const itemData = form.getInputProps(`checklistItems.${sectionKey}.${itemKey}`);
        const currentImage = itemData?.value?.image;
        const hasImage = currentImage instanceof File;
        const imageError = form.errors[`checklistItems.${sectionKey}.${itemKey}.image`];
        const notesError = form.errors[`checklistItems.${sectionKey}.${itemKey}.notes`];

        return (
            <Grid.Col span={{ base: 12 }} key={itemKey}>
                <Stack gap="xs">
                    {/* Text label */}
                    <Text size="sm" style={{ color: '#000000 !important', fontWeight: 500 }}>{label}</Text>
                    <Text size="xs" style={{ color: 'var(--mantine-color-gray-6)' }}>Select one option</Text>

                    {/* Radio of Button Group */}
                    <Radio.Group
                        value={itemData?.value?.value}
                        onChange={(statusValue) => form.setFieldValue(`checklistItems.${sectionKey}.${itemKey}.value`, statusValue)}
                        orientation="horizontal"
                        error={form.errors[`checklistItems.${sectionKey}.${itemKey}.value`]}
                    >
                        <Group mt="xs" justify="space-between" style={{ width: '100%' }}>
                            <Radio value="checked" label={<Text style={{ color: '#000000 !important' }}> Checked, Without Notes </Text>} />
                            <Radio value="recommended_repair" label={<Text style={{ color: '#000000 !important' }}> Repair Recommended </Text>} />
                            <Radio value="immediately_repair" label={<Text style={{ color: '#000000 !important' }}> Repair Immediately </Text>} />
                            <Radio value="not_applicable" label={<Text style={{ color: '#000000 !important' }}> Not Applicable </Text>} />
                        </Group>
                    </Radio.Group>
                    
                    {/* Dropzone of images */}
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
                        error={imageError}
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
                                    {hasImage ? currentImage.name : 'Drag and drop an image here or click to select'} 
                                </Text>
                                <Text size="xs" c="dimmed"> 
                                    JPG/PNG, max 5MB (will be compressed to ≤2MB)
                                </Text>
                                {hasImage && (
                                    <Text size="xs" c="green">
                                        {(currentImage.size / 1024 / 1024).toFixed(2)} MB
                                    </Text>
                                )}
                            </Stack>
                        </Group>
                    </Dropzone>
                    {imageError && (
                        <Text size="sm" c="red" mt={5}>
                            {imageError}
                        </Text>
                    )}
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
                        value={itemData?.value?.notes}
                        leftSection={<IconPencil size={20}/>}
                        onChange={(event) => form.setFieldValue(`checklistItems.${sectionKey}.${itemKey}.notes`, event.target.value)}
                        error={notesError}
                    />
                </Stack>
            </Grid.Col>
        );
    };

    const renderChecklistSection = (sectionTitle, sectionKey, items) => {
        return (
            <Card shadow="sm" p="xl" withBorder mb="lg">
                <Title order={3} mb="md" style={{ color: '#000000 !important' }}>{sectionTitle}</Title>
                <Grid gutter="xl">
                    {items.map((item) => (
                        <React.Fragment key={item.itemKey}>
                            {renderChecklistItem(
                                `${item.id}. ${item.label}`,
                                sectionKey,
                                item.itemKey
                            )}
                        </React.Fragment>
                    ))}
                </Grid>
            </Card>
        );
    };

    if (loading) {
        return (
            <Box maw="100%" mx="auto" px="md" ta="center">
                <Title order={1} mt="md" mb="lg">Loading Form Data...</Title>
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
                style={{ color: '#000000 !important' }}
            > 
                Pre Delivery Inspection Form
            </Title>

            <form onSubmit={form.onSubmit(handleSubmit)}>
                {/* Header Information */}
                <Card shadow="sm" p="xl" withBorder mb="lg">
                    <Title order={3} mb="md" style={{ color: '#000000 !important' }}> Unit Information </Title>
                    <Grid gutter="xl">
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            {/* <Select
                                label="WO Number"
                                placeholder="Select WO Number"
                                searchable
                                clearable
                                data={WoNumbers}
                                {...form.getInputProps('repairOrderNo')}
                            /> */}
                            <TextInput
                                label="WO Number"
                                placeholder="Input WO Number"
                                {...form.getInputProps('repairOrderNo')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <TextInput
                                label="VIN"
                                placeholder="Input VIN Number"
                                {...form.getInputProps('vinNo')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <DateInput
                                label="Date of Check"
                                placeholder="Select Date"
                                {...form.getInputProps('date')}
                                rightSection={<IconCalendar size={16} />}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <Select
                                label="Customer Name"
                                placeholder="Select Customer Name"
                                searchable
                                clearable
                                data={customers}
                                {...form.getInputProps('customer')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <TextInput
                                label="Mileage/ Hour Meter"
                                placeholder="Input Mileage/ Hour Meter"
                                {...form.getInputProps('mileageHourMeter')}
                                styles={{ input: { color: '#000000 !important' } }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <TextInput
                                label="Chassis ID"
                                placeholder="Input Chassis ID"
                                {...form.getInputProps('chassisId')}
                                styles={{ input: { color: '#000000 !important' } }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <TextInput
                                label="Registration Number"
                                placeholder="Input Registration Number"
                                {...form.getInputProps('registrationNo')}
                                styles={{ input: { color: '#000000 !important' } }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <Select
                                label="Location"
                                placeholder="Select Location (by Provinces)"
                                searchable
                                clearable
                                data={provinces}
                                {...form.getInputProps('province')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <Select
                                label="Type/ Model"
                                placeholder="Select a Type/ Model"
                                data={unitModels}
                                searchable
                                clearable
                                {...form.getInputProps("model")}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <Select
                                label="Engine"
                                placeholder="Select Engine Type"
                                data={engines}
                                searchable
                                clearable
                                {...form.getInputProps('engine')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <Select
                                label="Technician"
                                placeholder="Select Technician"
                                data={technicians}
                                searchable
                                clearable
                                {...form.getInputProps("technician")}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <Select
                                label="Approval By"
                                placeholder="Select Approver"
                                data={approvers}
                                searchable
                                clearable
                                {...form.getInputProps("approvalBy")}
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
                    "Lubrication, Oil and Fluid Levels",
                    "lubricationOilAndFluidLevels",
                    renaultPdiChecklistItemDefinition.lubricationOilAndFluidLevels
                )}
                {renderChecklistSection(
                    "Cab",
                    "cab",
                    renaultPdiChecklistItemDefinition.cab
                )}
                {renderChecklistSection(
                    "Exterior",
                    "exterior",
                    renaultPdiChecklistItemDefinition.exterior
                )}
                {renderChecklistSection(
                    "Under Vehicle",
                    "underVehicle",
                    renaultPdiChecklistItemDefinition.underVehicle
                )}
                {renderChecklistSection(
                    "Test Drive",
                    "testDrive",
                    renaultPdiChecklistItemDefinition.testDrive
                )}
                {renderChecklistSection(
                    "Finish",
                    "finish",
                    renaultPdiChecklistItemDefinition.finish
                )}

                {/* Battery Status */}
                <Card shadow="sm" p="xl" withBorder mb="lg">
                    <Title order={3} mb="md" style={{ color: '#000000 !important' }}> Battery Status </Title>
                    <Table striped highlightOnHover withTableBorder withColumnBorders>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th style={{ color: '#000000 !important' }}>Battery</Table.Th>
                                <Table.Th style={{ color: '#000000 !important' }}>Test code</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {form.values.batteryStatus.map((row, index) => (
                                <Table.Tr key={index}>
                                    <Table.Td style={{ color: '#000000 !important' }}>{row.battery}</Table.Td>
                                    <Table.Td>
                                        <TextInput
                                            placeholder="Input Test Code"
                                            {...form.getInputProps(`batteryStatus.${index}.testCode`)}
                                        />
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                </Card>

                {/* Vehicle Inspection Notes */}
                <Card shadow="sm" p="xl" withBorder mb="lg">
                    <Title order={3} mb="md" style={{ color: '#000000 !important' }}> Vehicle Inspection </Title>
                    <Text size="sm" mb="md" style={{ color: '#000000 !important' }}> Note any damage </Text>
                    <Textarea
                        placeholder="Add any vehicle damage notes here..."
                        minRows={4}
                        mb="xl"
                        {...form.getInputProps('vehicleDamageNotes')}
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

export default RenaultPDIForm;
