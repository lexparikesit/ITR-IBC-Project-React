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

const manitouPdiChecklistItemDefinition = {
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

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const MAX_ACCEPTED_SIZE = 5 * 1024 * 1024;
const COMPRESS_OPTIONS = {
    maxSizeMB: 1.8,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: 'image/jpeg',
}

export function ManitouPDIForm() {
    const [unitModels, setUnitModels] = useState([]);
    const [WoNumbers, setWoNumbers] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [approvers, setApprovers] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [dealerCode, setDealerCode] = useState([]);
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

    const generateChecklistValidation = () => {
        let validationRules = {};
        Object.keys(manitouPdiChecklistItemDefinition).forEach(sectionKey => {
            manitouPdiChecklistItemDefinition[sectionKey].forEach(item => {
                const itemKey = item.itemKey;
                // Require a status selection
                validationRules[`checklistItems.${sectionKey}.${itemKey}.value`] = (value) => (
                    value ? null : 'This Field is Required!'
                );
                // Do not require image here; enforce conditionally in UI and submit
            });
        });
        return validationRules;
    };

    const form = useForm({
        initialValues: (() => {
            const initialManitouValues = {
                //woNumber: null
                woNumber: "",
                dealerCode: null,
                machineType: null,
                serialNumber: "",
                deliveryDate: null,
                checkingDate: null,
                HourMeter: "",
                inspectorSignature: null,
                approvalBy: null,
                customer: null,
                deliveryRemarks: "",
                generalRemarks: "",
            };

            initialManitouValues.checklistItems = {};
            Object.keys(manitouPdiChecklistItemDefinition).forEach(sectionKey => {
                initialManitouValues.checklistItems[sectionKey] = {};
                manitouPdiChecklistItemDefinition[sectionKey].forEach(item => {
                    initialManitouValues.checklistItems[sectionKey][item.itemKey] = { value: "", image: null, notes: "" };
                });
            });
            return initialManitouValues;
        })(),

        validate: {
            dealerCode: (value) => (value ? null : "Dealer Code is Required!"),
            machineType: (value) => (value ? null : "Model Type is Required!"),
            serialNumber: (value) => (value ? null : "Serial Number is Required!"),
            deliveryDate: (value) => (value ? null : "Delivery Date is Required!"),
            checkingDate: (value) => (value ? null : "Checking Date is Required!"),
            HourMeter: (value) => (value ? null : "Hour Meter is Required!"),
            inspectorSignature: (value) => (value ? null : "Inspector Signature is Required!"),
            approvalBy: (value) => (value ? null : "Approval By is Required!"),
            customer: (value) => (value ? null : "Customer is Required!"),
            woNumber: (value) => (value ? null : "WO Number is Required!"),
            ...generateChecklistValidation(),
        },
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const brandId = "MA"; // 'MA' for Manitou
                const groupId = "DPDPI"; // 'DPDPI' for PDI
                const [
                    modelRes,
                    woRes,
                    techRes,
                    customerRes,
                    supervisorRes,
                    techHeadRes,
                ] = await Promise.all([
                    apiClient.get(`/unit-types/${brandId}`),
                    apiClient.get(`/work-orders?brand_id=${brandId}&group_id=${groupId}`),
                    apiClient.get("/users/by-role/Technician"),
                    apiClient.get("/customers"),
                    apiClient.get("/users/by-role/Supervisor"),
                    apiClient.get("/users/by-role/Technical Head"),
                ])

                setUnitModels(modelRes.data);
                setWoNumbers(woRes.data.map(wo => ({ value: wo.WONumber, label: wo.WONumber })));
                setTechnicians(techRes.data);
                setCustomers(customerRes.data.map((customer => ({ value: customer.CustomerID, label: customer.CustomerName }))));
                setApprovers([
                    ...supervisorRes.data,
                    ...techHeadRes.data,
                ]);
                
                // delaer Code
                setDealerCode([{ value: "30479", label: "30479" }]);

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
        setUploading(true);

        const token = localStorage.getItem('access_token');
        if (!token) {
            notifications.show({
                title: "Authentication Error",
                message: "Please log in again. Authentication token is missing.",
                color: "red",
            });
            setUploading(false);
            return;
        }

        // Build checklist items payload first
        const checklistItemsPayload = {};
        const formData = new FormData();
        let missingPhotos = [];

        Object.keys(manitouPdiChecklistItemDefinition).forEach(sectionKey => {
            const items = manitouPdiChecklistItemDefinition[sectionKey];

            items.forEach(item => {
                const itemData = values.checklistItems[sectionKey]?.[item.itemKey];

                if (itemData && itemData.value) {
                    if (!checklistItemsPayload[sectionKey]) {
                        checklistItemsPayload[sectionKey] = {};
                    }
                    checklistItemsPayload[sectionKey][item.itemKey] = {
                        status: itemData.value,
                        notes: itemData.notes || "",
                    };

                    // Only require image for Bad/Missing statuses, and include if present
                    if (itemData.image) {
                        const imageKey = `image-${sectionKey}-${item.itemKey}`;
                        formData.append(imageKey, itemData.image);
                    } else if (itemData.value === 'Bad' || itemData.value === 'Missing') {
                        // image mandatory only for Bad/Missing per backend
                        missingPhotos.push(`${sectionKey} - ${item.itemKey}`);
                    }
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

        const payload = {
            brand: 'manitou',
            unitInfo: {
                dealerCode: values.dealerCode,
                customer: values.customer,
                machineType: values.machineType,
                serialNumber: values.serialNumber,
                deliveryDate: values.deliveryDate,
                checkingDate: values.checkingDate,
                HourMeter: values.HourMeter,
                inspectorSignature: values.inspectorSignature,
                approvalBy: values.approvalBy,
                woNumber: values.woNumber,
            },
            deliveryRemarks: values.deliveryRemarks,
            generalRemarks: values.generalRemarks,
            checklistItems: checklistItemsPayload,
        };

        console.log("Payload to Backend: ", payload);
        formData.append('data', JSON.stringify(payload));

        try {
            const response = await apiClient.post(`/pre-delivery-inspection/manitou/submit`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
            })

            notifications.show({
                title: "Submission Successful!",
                message: "Form Submitted Successfully.",
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
        const hasImage = itemData?.image instanceof File;
        const imageError = form.errors[`${path}.image`];
        const notesError = form.errors[`${path}.notes`];
    
        return (
            <Grid.Col span={{ base: 12, sm: 6, md: 4 }} key={`${sectionKey}-${itemKey}`}>
                <Stack gap="xs">
                    <Text size="sm" style={{ color: '#000000 !important', fontWeight: 500 }}>{label}</Text>
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
                            <Radio value="Good" label={<Text style={{ color: '#000000 !important' }}>Good</Text>} />
                            <Radio value="Bad" label={<Text style={{ color: '#000000 !important' }}>Bad</Text>} />
                            <Radio value="Missing" label={<Text style={{ color: '#000000 !important' }}>Missing</Text>} />
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
                <Title order={3} mb="md" style={{ color: '#000000 !important' }}>{sectionTitle}</Title>
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
                style={{ color: '#000000 !important' }}
            > 
                Pre Delivery Inspection Form
            </Title>

            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Card shadow="sm" p="xl" withBorder mb="lg">
                    <Title order={3} mb="md" style={{ color: '#000000 !important' }}> Unit Information </Title>
                    <Grid gutter="xl">
                        <Grid.Col span={{ base: 12, md: 6, md: 3 }}>
                            <Select 
                                label="Dealer Code"
                                placeholder="Select Dealer Code"
                                data={dealerCode}
                                searchable
                                clearable
                                {...form.getInputProps('dealerCode')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, md: 3 }}>
                            {/* <Select 
                                label="WO Number"
                                placeholder="Select WO Number"
                                data={WoNumbers}
                                searchable
                                clearable
                                {...form.getInputProps('woNumber')}
                            /> */}
                            <TextInput
                                label="WO Number"
                                placeholder="Input WO Number"
                                {...form.getInputProps('woNumber')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, md: 3 }}>
                            <Select
                                label="Type/ Model"
                                placeholder="Select Model"
                                data={unitModels}
                                searchable
                                clearable
                                {...form.getInputProps('machineType')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, md: 3 }}>
                            <TextInput
                                label="VIN"
                                placeholder="Input VIN Number"
                                {...form.getInputProps('serialNumber')}
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
                                {...form.getInputProps('checkingDate')}
                                rightSection={<IconCalendar size={16} />}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, md: 3 }}>
                            <TextInput
                                label="Hour Meter"
                                placeholder="Input Hour Meter"
                                {...form.getInputProps('HourMeter')}
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
                
                <Divider my="xl" label={<Text style={{ color: '#000000 !important' }}>Legend</Text>} labelPosition="center" />
                    <Group justify="center" gap="xl" mb="lg">
                        <Text style={{ color: '#000000 !important' }}> 1: Good </Text>
                        <Text style={{ color: '#000000 !important' }}> 2: Bad </Text>
                        <Text style={{ color: '#000000 !important' }}> 0: Missing </Text>
                    </Group>
                <Divider my="xl" />

                {Object.keys(manitouPdiChecklistItemDefinition).map(sectionKey => (
                    <div key={sectionKey}>
                        {renderChecklistSection(
                            {
                                levels: "01. Levels",
                                visualInspection: "02. Visual Inspection",
                                operation: "03. Operation",
                                tests: "04. Test",
                                checkingOfGeneralMachineCondition: "05. Checking of General Machine Condition",
                                transportationDelivery: "06. Transport/Delivery - Remarks Regarding",
                            }[sectionKey] || sectionKey,
                            sectionKey,
                            manitouPdiChecklistItemDefinition[sectionKey]
                        )}
                    </div>
                ))}
            
                <Divider my="xl" />
                <Title order={3} mb="md" style={{ color: '#000000 !important' }}> Possible Remarks on Transport and Delivery </Title>
                <Textarea
                    placeholder="Add Any Comments Here..."
                    minRows={4}
                    mb="xl"
                    {...form.getInputProps('deliveryRemarks')}
                />

                <Divider my="xl" />
                <Title order={3} mb="md" style={{ color: '#000000 !important' }}> Comments Regarding Technical Problems </Title>
                <Textarea
                    placeholder="Add Any Comments Here..."
                    minRows={4}
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

export default ManitouPDIForm;
