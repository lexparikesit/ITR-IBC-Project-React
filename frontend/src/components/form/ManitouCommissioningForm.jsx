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
    Loader,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { IconCalendar, IconUpload, IconX, IconFile, IconPencil, IconRefresh } from "@tabler/icons-react";
import { useForm } from '@mantine/form';
import { notifications } from "@mantine/notifications";
import { Dropzone, MIME_TYPES } from "@mantine/dropzone";
import { rem } from "@mantine/core";
import apiClient from "@/libs/api";
import imageCompression from "browser-image-compression";

const ManitouCommissioningChecklistForm = {
    engine: [
        { id: '01', label: 'Air Filter', itemKey: 'airFilter' },
        { id: '02', label: 'Fuel Tank', itemKey: 'fuelTank' },
        { id: '03', label: 'Fuel Pipes and Filters', itemKey: 'fuelPipeFilters' },
        { id: '04', label: 'Injection / Carburation System', itemKey: 'injectionCarburationSystem' },
        { id: '05', label: 'Radiator and Cooling Systems', itemKey: 'radiatorCoolingSystems' },
        { id: '06', label: 'Belts', itemKey: 'belts' },
        { id: '07', label: 'Hoses', itemKey: 'hosesEngine' },
    ],
    transmission: [
        { id: '01', label: 'Reversing System', itemKey: 'reversingSystem' },
        { id: '02', label: 'Control of Gears', itemKey: 'controlOfGears' },
        { id: '03', label: 'Transmission Disconnect Pedal', itemKey: 'transmissionDisconnectPedal' },
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
        { id: '01', label: 'Checking of Service Brake & Parking Brake Operation', itemKey: 'serviceBrakeParkingBrakeOperation' },
        { id: '02', label: 'Checking Brake Fluid Level (as per assembly)', itemKey: 'brakeFluidLevel' },
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
        { id: '01', label: 'Fixed & Movable Masts', itemKey: 'fixedMovableMast' },
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
        { id: '04', label: 'Heating / Air Conditioning', itemKey: 'heatingAirConditioning' },
        { id: '05', label: 'Windscreen Wiper / Washer', itemKey: 'windscreenWiperWasher' },
        { id: '06', label: 'Horns', itemKey: 'horns' },
        { id: '07', label: 'Backup Alarm', itemKey: 'backupAlarm' },
        { id: '08', label: 'Head Lighting', itemKey: 'headLighting' },
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
        { id: '03', label: 'Paint', itemKey: 'paint' },
        { id: '04', label: 'General Operation', itemKey: 'generalOperation' },
        { id: '05', label: 'Operator\'s Manual', itemKey: 'operatorsManual' },
        { id: '06', label: 'Instructions for Customer', itemKey: 'instructionsForCustomer' },
    ],
};

const MAX_FILE_SIZE = 2 * 1024 *  1024;
const MAX_ACCEPTED_SIZE = 5 * 1024 * 1024;
const COMPRESS_OPTIONS = {
    maxSizeMB: 1.8,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: 'image/jpeg',
}

export function ManitouCommissioningForm() {
    const [unitModels, setUnitModels] = useState([]);
    const [woNumbers, setWoNumbers] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [approvers, setApprovers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    const processImage  = async (file, sectionKey, itemKey) => {
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

    const generateChecklistValidation = () => {
        const rules = {};
        Object.keys(ManitouCommissioningChecklistForm).forEach((sectionKey) => {
            ManitouCommissioningChecklistForm[sectionKey].forEach((item) => {
                const itemKey = item.itemKey;
                // Require a choice for every item
                rules[`checklistItems.${sectionKey}.${itemKey}.value`] = (v) => (v ? null : 'This field is Required!');
                // Only require image for Bad/Missing
                rules[`checklistItems.${sectionKey}.${itemKey}.image`] = (_img, values) => {
                    const selected = values?.checklistItems?.[sectionKey]?.[itemKey]?.value;
                    const image = values?.checklistItems?.[sectionKey]?.[itemKey]?.image;
                    if (!selected) return null; // Let value rule trigger first
                    if (selected === 'Bad' || selected === 'Missing') {
                        return image ? null : 'Photo is required for Bad/Missing';
                    }
                    return null; // Good does not require image
                };
            });
        });
        return rules;
    };

    const form = useForm({
        initialValues: (() => {
            const initialManitouValues = {
                woNumber: null,
                unitModel: null,
                VIN: "",
                hourMeter: "",
                deliveryDate: null,
                commissioningDate: null,
                customer: null,
                inspectorSignature: null,
                approvalBy: null,
                generalRemarks: "",
            };

            initialManitouValues.checklistItems = {};
            Object.keys(ManitouCommissioningChecklistForm).forEach(sectionKey => {
                initialManitouValues.checklistItems[sectionKey] = {};
                ManitouCommissioningChecklistForm[sectionKey].forEach(item => {
                    initialManitouValues.checklistItems[sectionKey][item.itemKey] = { value: "", image: null, notes: "" };
                });
            });
            return initialManitouValues;
        })(),

        validate: {
            woNumber: (value) => (value ? null : 'WO Number is Required!'),
            unitModel: (value) => (value ? null : 'Unit Model is Required!'),
            VIN: (value) => (value ? null : 'VIN is Required!'),
            hourMeter: (value) => (value ? null : 'Hour Meter is Required!'),
            deliveryDate: (value) => (value ? null : 'Delivery Date is Required!'),
            commissioningDate: (value) => (value ? null : 'Commissioning Date is Required!'),
            customer: (value) => (value ? null : 'Customer is Required!'),
            inspectorSignature: (value) => (value ? null : 'Inspector Signature is Required!'),
            approvalBy: (value) => (value ? null : 'Approval By is Required!'),
            ...generateChecklistValidation(),
        },
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const brandId = "MA"; // 'MA' for Manitou
                const groupId = "COMM"; // 'COMM' for Commissioning
                const [
                    modelRes,
                    woRes,
                    customerRes,
                    techRes,
                    supervisorRes,
                    techHeadRes,
                ] = await Promise.all([
                    apiClient.get(`/unit-types/${brandId}`),
                    apiClient.get(`/work-orders?brand_id=${brandId}&group_id=${groupId}`),
                    apiClient.get("/customers"),
                    apiClient.get("/users/by-role/Technician"),
                    apiClient.get("/users/by-role/Supervisor"),
                    apiClient.get("/users/by-role/Technical Head"),
                ])

                setUnitModels(modelRes.data);
                setWoNumbers(woRes.data.map(wo => ({ value: wo.WONumber, label: wo.WONumber })));
                setCustomers(customerRes.data.map((customer => ({ value: customer.CustomerID, label: customer.CustomerName }))));
                setTechnicians(techRes.data);
                setApprovers([
                    ...supervisorRes.data,
                    ...techHeadRes.data,
                ]);

            } catch (error) {
                console.error("Failed to fetch data:", error);
                notifications.show({
                    title: "Error Loading Data",
                    message: "Failed to load form data. Please try again!",
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
    }

    const handleSubmit = async (values) => {
        console.log("Form values before submission:", values);
        setUploading(true);

        const token = localStorage.getItem('access_token');
        if(!token) {
            notifications.show({
                title: "Authentication Error",
                message: "Please log in again. Authentication token is missing.",
                color: "red",
            });
            return;
        }

        let checklistItemsPayload = {};

        const payload = {
            brand: "Manitou",
            unitInfo: {
                woNumber: values.woNumber,
                unitModel: values.unitModel,
                VIN: values.VIN,
                hourMeter: values.hourMeter,
                deliveryDate: values.deliveryDate,
                commissioningDate: values.commissioningDate,
                customer: values.customer,
                inspectorSignature: values.inspectorSignature,
                approvalBy: values.approvalBy,
            },
            generalRemarks: values.generalRemarks,
            checklistItems: checklistItemsPayload,
        };

        const formData = new FormData();

        let missingPhotos = [];

        Object.keys(ManitouCommissioningChecklistForm).forEach(sectionKey => {
            const items = ManitouCommissioningChecklistForm[sectionKey];
            items.forEach(item => {
                const itemData = values.checklistItems[sectionKey]?.[item.itemKey];
                
                if (itemData && itemData.value) {
                    if (!checklistItemsPayload[sectionKey]) {
                        checklistItemsPayload[sectionKey] = {};
                    }
                    checklistItemsPayload[sectionKey][item.itemKey] = {
                        status: itemData.value,
                        caption: itemData.notes || '',
                    };

                    if (itemData.image) {
                        const imageKey = `image-${sectionKey}-${item.itemKey}`;
                        formData.append(imageKey, itemData.image);
                    }
                }
            });
        });

        Object.keys(ManitouCommissioningChecklistForm).forEach((sectionKey) => {
            const items = ManitouCommissioningChecklistForm[sectionKey];
            items.forEach((item) => {
                const itemData = values.checklistItems?.[sectionKey]?.[item.itemKey] || { value: '', image: null };
                if ((itemData.value === 'Bad' || itemData.value === 'Missing') && !itemData.image) {
                    missingPhotos.push(`${sectionKey} - ${item.label}`);
                }
            });
        });

        if (missingPhotos.length > 0) {
            notifications.show({
                title: "Missing Photos",
                message: `Please upload photos for: ${missingPhotos.join(', ')}`,
                color: "red",
            });
            setUploading(false);
            return;
        }

        console.log("Payload to Backend: ", payload);
        formData.append('data', JSON.stringify(payload));

        try {
            const response = await apiClient.post(`/commissioning/manitou/submit`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

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
        const path = `checklistItems.${sectionKey}.${itemKey}`;
        const itemData = form.values.checklistItems[sectionKey]?.[itemKey];
        const imageError = form.errors[`${path}.image`];

        return (
            <Grid.Col span={{ base: 12, sm: 6, md: 4 }} key={`${sectionKey}-${itemKey}`}>
                <Stack gap="xs">
                    <Text size="sm" c="var(--mantine-color-text)" style={{ fontWeight: 500 }}>{label}</Text>
                    <Text size="xs" style={{ color: 'var(--mantine-color-gray-6)' }}>Select one option</Text>

                    <Radio.Group
                        value={itemData?.value || ''}
                        onChange={(statusValue) => {
                            form.setFieldValue(`${path}.value`, statusValue);
                            const img = form.values.checklistItems[sectionKey]?.[itemKey]?.image;
                            if ((statusValue === 'Bad' || statusValue === 'Missing') && !img) {
                                form.setFieldError(`${path}.image`, 'Photo is required for Bad/Missing');
                            } else {
                                form.clearFieldError(`${path}.image`);
                            }
                        }}
                        orientation="horizontal"
                        error={form.errors[`${path}.value`]}
                        spacing="xl"
                    >
                        <Group mt="xs">
                            <Radio value="Good" label={<Text c="var(--mantine-color-text)">Good</Text>} />
                            <Radio value="Bad" label={<Text c="var(--mantine-color-text)">Bad</Text>} />
                            <Radio value="Missing" label={<Text c="var(--mantine-color-text)">Missing</Text>} />
                        </Group>
                    </Radio.Group>

                    <Dropzone
                        onDrop={async (files) => {
                            if (files.length > 0) {
                                const processedFile = await processImage(files[0], sectionKey, itemKey);
                                if (processedFile) {
                                    form.setFieldValue(`${path}.image`, processedFile);
                                    form.clearFieldError(`${path}.image`);
                                }
                            }
                        }}
                        onReject={(files) => {
                            notifications.show({
                                title: 'File Rejected',
                                message: files[0].errors[0].message,
                                color: 'red',
                            });
                        }}
                        maxFiles={1}
                        maxSize={MAX_ACCEPTED_SIZE}
                        accept={[MIME_TYPES.jpeg, MIME_TYPES.png]}
                        error={imageError}
                    >
                        <Group justify="center" gap="xs" style={{ minHeight: rem(80), pointerEvents: 'none' }}>
                            <Dropzone.Accept>
                                <IconUpload
                                    style={{ width: rem(30), height: rem(30) }}
                                    stroke={1.5}
                                />
                            </Dropzone.Accept>
                            <Dropzone.Reject>
                                <IconX
                                    style={{ width: rem(30), height: rem(30) }}
                                    stroke={1.5}
                                />
                            </Dropzone.Reject>
                            <Dropzone.Idle>
                                <IconFile
                                    style={{ width: rem(30), height: rem(30) }}
                                    stroke={1.5}
                                />
                            </Dropzone.Idle>
                            <Stack align="center" gap={4}>
                                <Text size="xs" c="dimmed"> 
                                    {itemData.image ? itemData.image.name : 'Drag and drop an image here or click to select'} 
                                </Text>
                                <Text size="xs" c="dimmed"> 
                                    JPG/PNG, max 5MB (will be compressed to ≤2MB)
                                </Text>
                                {itemData.image && (
                                    <Text size="xs" c="green">
                                        {(itemData.image.size / 1024 / 1024).toFixed(2)} MB
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

                    {itemData.image && (
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
                        value={itemData?.notes || ''}
                        leftSection={<IconPencil size={20}/>}
                        onChange={(event) => form.setFieldValue(`${path}.notes`, event.target.value)}
                    />
                </Stack>
            </Grid.Col>
        );
    };

    const renderChecklistSection = (sectionTitle, sectionKey, items) => {
        return (
            <Card shadow="sm" p="xl" withBorder mb="lg" key={sectionKey}>
                <Title order={3} mb="md" c="var(--mantine-color-text)">{sectionTitle}</Title>
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
                c="var(--mantine-color-text)"
            > 
                Commissioning Form
            </Title>

            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Card shadow="sm" p="xl" withBorder mb="lg">
                    <Title order={3} mb="md" c="var(--mantine-color-text)"> Unit Information </Title>
                    <Grid gutter="xl">
                        <Grid.Col span={{ base: 12, md: 6, md: 3 }}>
                            <Select 
                                label="WO Number"
                                placeholder="Select WO Number"
                                data={woNumbers}
                                searchable
                                clearable
                                {...form.getInputProps('woNumber')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, md: 3 }}>
                            <Select 
                                label="Customer"
                                placeholder="Select Customer"
                                data={customers}
                                searchable
                                clearable
                                {...form.getInputProps('customer')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, md: 3 }}>
                            <Select 
                                label="Type/ Model"
                                placeholder="Select Model"
                                data={unitModels}
                                searchable
                                clearable
                                {...form.getInputProps('unitModel')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, md: 3 }}>
                            <TextInput
                                label="VIN"
                                placeholder="Input VIN Number"
                                {...form.getInputProps('VIN')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, md: 3 }}>
                            <TextInput
                                label="Hour Meter"
                                placeholder="Input Hour Meter"
                                {...form.getInputProps('hourMeter')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, md: 3 }}>
                            <DateInput
                                label="Delivery Date"
                                placeholder="Select Date"
                                {...form.getInputProps('deliveryDate')}
                                rightSection={<IconCalendar size={16} />}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, md: 3 }}>
                            <DateInput
                                label="Date of Check"
                                placeholder="Select Date"
                                {...form.getInputProps('commissioningDate')}
                                rightSection={<IconCalendar size={16} />}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, md: 3 }}>
                            <Select
                                label="Technician"
                                placeholder="Select Technician"
                                data={technicians}
                                searchable
                                clearable
                                {...form.getInputProps('inspectorSignature')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, md: 3 }}>
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
                        <Text c="var(--mantine-color-text)"> 1: Good </Text>
                        <Text c="var(--mantine-color-text)"> 2: Bad </Text>
                        <Text c="var(--mantine-color-text)"> 0: Missing </Text>
                    </Group>
                <Divider my="xl" />

                {Object.keys(ManitouCommissioningChecklistForm).map(sectionKey  => (
                    <div key={sectionKey}>
                        {renderChecklistSection(
                            {
                                engine: "01. Engine",
                                transmission: "02. Transmission",
                                axleTransferBox: "03. Axle & Transfer Box",
                                hydraulicHydrostaticCircuits: "04. Hydraulic & Hydrostatic Circuits",
                                brakingCircuits: "05. Braking Circuits",
                                lubrication: "06. Lubrication",
                                boomMastManiscopicManicess: "07. Boom, Mast, Maniscopic & Manicess",
                                mastUnit: "08. Mast Unit",
                                accessories: "09. Accessories",
                                cabProtectiveDeviceElectricCircuit: "10. Cab, Protective Device & Electric Circuit",
                                wheels: "11. Wheels",
                                otherItems: "12. Other Items",
                            }[sectionKey],
                            sectionKey,
                            ManitouCommissioningChecklistForm[sectionKey]
                        )}
                    </div>
                ))}

                <Divider my="xl" />
                <Title order={3} mb="md" c="var(--mantine-color-text)"> General Remarks </Title>
                <Textarea
                    placeholder="Add Any Comments Here..."
                    minRows={10}
                    mb="xl"
                    {...form.getInputProps('generalRemarks')}
                />
                
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
    )
}

export default ManitouCommissioningForm;
