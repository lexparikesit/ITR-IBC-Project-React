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
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { Dropzone, MIME_TYPES } from "@mantine/dropzone";
import { rem } from "@mantine/core";
import apiClient from "@/libs/api";
import imageCompression from "browser-image-compression";

const manitouChecklistItemsDefinition = {
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
        { id: '05', label: 'Operator\'s Manual', itemKey: 'operatorsManual' },
        { id: '06', label: 'Instructions for Customer', itemKey: 'instructionsForCustomer' },
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

export function UnitArrivalInspectionForm() {
    const [unitModels, setUnitModels] = useState([]);
    const [woNumbers, setWoNumbers] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [approvers, setApprovers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    const processImage = async (file, sectionKey, itemKey) => {
        try {
            if (file.size > MAX_ACCEPTED_SIZE) {
                notifications.show({
                    title: "File Too Large",
                    message: "Maximum file size is 10MB. Please choose a smaller file.",
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
        Object.keys(manitouChecklistItemsDefinition).forEach(sectionKey => {
            manitouChecklistItemsDefinition[sectionKey].forEach(item => {
                const key = `${sectionKey}.${item.itemKey}`;
                validationRules[key] = (value) => {
                    if ((value.status === 'Bad' || value.status === 'Missing') && !value.image) {
                        return 'Image is Required for "Bad" or "Missing"!';
                    }
                    if (!value.status) {
                        return 'This Field is Required!';
                    }
                    return null;
                };
            });
        });
        return validationRules;
    };

    const form = useForm({
        initialValues: (() => {
            const initialManitouValues = {
                model: null,
                // woNumber: null,
                woNumber: "",
                serialNo: "",
                hourMeter: "",
                dateOfCheck: null,
                technician: null,
                approver: null,
                generalRemarks: "",
            };

            Object.keys(manitouChecklistItemsDefinition).forEach(sectionKey => {
                initialManitouValues[sectionKey] = {};
                manitouChecklistItemsDefinition[sectionKey].forEach(item => {
                    initialManitouValues[sectionKey][item.itemKey] = { status: "", image: null, caption: "" };
                });
            });
            return initialManitouValues;
        })(),

        validate: {
            woNumber: (value) => (value ? null : 'WO Number is Required!'),
            model: (value) => (value ? null : 'Type/ Model is Required!'),
            serialNo: (value) => (value ? null : 'VIN is Required!'),
            hourMeter: (value) => (value ? null : 'Hour Meter is Required!'),
            dateOfCheck: (value) => (value ? null : 'Date of Check is Required!'),
            technician: (value) => (value ? null : 'Technician is Required!'),
            approver: (value) => (value ? null : 'Approver is Required!'),
            ...generateChecklistValidation(),
        }
    });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const brandId = "MA"; // 'MA' for Manitou
                const groupId = "AI"; // 'AI' for Arrival Inspection
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

                const formattedModels = modelRes.data
                    .filter(item => item.value !== null & item.label !== null)
                    .map(item => ({ value: item.value, label: item.label }));
                setUnitModels(formattedModels);

                const formattedWO = woRes.data.map(wo => ({
                    value: wo.WONumber, 
                    label: wo.WONumber,
                }));
                setWoNumbers(formattedWO);

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

    const checkVinExists = async (vin) => {
        try {
            const response = await apiClient.get(`/arrival-check/check-vin/${vin}`);
            return response.data.exists;
        
        } catch (error) {
            console.error("VIN check failed:", error);
            notifications.show({
                title: "VIN Check Failed",
                message: "Unable to verify VIN. Please try again.",
                color: "red",
            });
            return true;
        }
    };

    const retryUpload = async (sectionKey, itemKey) => {
        const currentFile = form.values[sectionKey]?.[itemKey]?.image;
        if (!currentFile) return;

        setUploading(true);
        
        try {
            const processedFile = await processImage(currentFile, sectionKey, itemKey);
            if (processedFile) {
                form.setFieldValue(`${sectionKey}.${itemKey}.image`, processedFile);
            }
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (values) => {
        console.log('Form Submitted (Frontend Data)', values);

        setUploading(true);

        const token = localStorage.getItem('access_token');
        if (!token) {
            notifications.show({
                title: "Authentication Required",
                message: "Please log in to submit the form.",
                color: "red",
            });
            return;
        }

        if (values.serialNo) {
            const vinExists = await checkVinExists(values.serialNo);
            if (vinExists) {
                notifications.show({
                    title: "Submission Blocked",
                    message: "VIN already exists! Please enter a unique VIN.",
                    color: "red",
                });
                return;
            }
        }
        
        console.log('Form Submitted (Frontend Data)', values);

        const payload = {
            brand: 'manitou',
            unitInfo: {
                woNumber: values.woNumber,
                model: values.model,
                serialNo: values.serialNo,
                hourMeter: values.hourMeter,
                dateOfCheck: values.dateOfCheck,
                technician: values.technician,
                approver: values.approver,
            },
            generalRemarks: values.generalRemarks,
            checklistItems: {},
        };

        const formData = new FormData();

        let missingPhotos = [];
        
        Object.keys(manitouChecklistItemsDefinition).forEach(sectionKey => {
            const items = manitouChecklistItemsDefinition[sectionKey];
            
            items.forEach(item => {
                const itemData = values[sectionKey]?.[item.itemKey] || { status: "", image: null, caption: "" };
                
                if (!payload.checklistItems[sectionKey]) {
                    payload.checklistItems[sectionKey] = {};
                }
                
                payload.checklistItems[sectionKey][item.itemKey] = {
                    status: itemData.status,
                    caption: itemData.caption || ""
                };
                
                if (itemData.image) {
                    const imageKey = `image-${sectionKey}-${item.itemKey}`;
                    formData.append(imageKey, itemData.image);
                }
            });
        });

        Object.keys(manitouChecklistItemsDefinition).forEach(sectionKey => {
            const items = manitouChecklistItemsDefinition[sectionKey];
            
            items.forEach(item => {
                const itemData = values[sectionKey]?.[item.itemKey] || { status: "", image: null, caption: "" };
                
                if ((itemData.status === 'Bad' || itemData.status === 'Missing') && !itemData.image) {
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
            return;
        }

        console.log("Payload JSON to Backend: ", payload);
        formData.append('data', JSON.stringify(payload));
        
        try {
            const response = await apiClient.post(`/arrival-check/manitou/submit`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                timeout: 50000
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

    const renderChecklistItem = (label, formProps, sectionKey, itemKey, key) => {
        const itemData = form.values[sectionKey] ? form.values[sectionKey][itemKey] : form.values[itemKey];
        const showConditionalInputs = itemData && (itemData.status === 'Bad' || itemData.status === 'Missing');
        const dropzoneProps = form.getInputProps(`${formProps}.image`);

        return (
            <Grid.Col span={{ base: 12, sm: 6, md: 4 }} key={key}>
                <Stack gap="xs">
                    <Text size="sm" style={{ color: '#000000 !important', fontWeight: 500 }}>{label}</Text>
                    <Text size="xs" style={{ color: 'var(--mantine-color-gray-6)' }}>Select one option</Text>

                    <Radio.Group
                        {...form.getInputProps(formProps)}
                        value={itemData ? itemData.status : ""}
                        onChange={(value) => {
                        const newStatus = { status: value };
                            if (value === "Good") {
                                form.setFieldValue(formProps, { status: "Good", image: null, caption: "" });
                            } else {
                                form.setFieldValue(formProps, { ...itemData, status: value });
                            }
                        }}
                        orientation="horizontal"
                        spacing="xl"
                    >
                        <Group mt="xs">
                            <Radio value="Good" label={<Text style={{ color: '#000000 !important' }}>Good</Text>} />
                            <Radio value="Bad" label={<Text style={{ color: '#000000 !important' }}>Bad</Text>} />
                            <Radio value="Missing" label={<Text style={{ color: '#000000 !important' }}>Missing</Text>} />
                        </Group>
                    </Radio.Group>
                    
                    {showConditionalInputs && (
                        <>
                            <Dropzone
                                onDrop={async (files) => {
                                    if (files.length > 0) {
                                        const processedFile = await processImage(files[0], sectionKey, itemKey);
                                        if (processedFile) {
                                            form.setFieldValue(`${formProps}.image`, processedFile);
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
                            {...dropzoneProps}
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
                                leftSection={<IconPencil size={18} />}
                                {...form.getInputProps(`${formProps}.caption`)}
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
                    {items.map((item) => ( 
                        renderChecklistItem(
                            `${item.id}. ${item.label}`,
                            `${sectionKey}.${item.itemKey}`,
                            sectionKey,
                            item.itemKey,
                            `${sectionKey}-${item.itemKey}`
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
                Unit Arrival Check
            </Title>

            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Card shadow="sm" padding="lg" radius="md" withBorder mb="lg">
                    <Title order={3} mb="md" style={{ color: '#000000 !important' }}> Unit Information </Title>
                    <Grid gutter="xl">
                        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                            {/* <Select
                                label="WO Number"
                                placeholder="Select WO Number"
                                data={woNumbers}
                                searchable
                                clearable
                                {...form.getInputProps('woNumber')}
                            /> */}
                            <TextInput
								label="WO Number"
								placeholder="Input WO Number"
								{...form.getInputProps("woNumber")}
							/>
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                            <Select
                                label="Type/ Model"
                                placeholder="Select Model"
                                data={unitModels}
                                searchable
                                clearable
                                {...form.getInputProps('model')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                            <TextInput
                                label="VIN"
                                placeholder="Input VIN Number"
                                {...form.getInputProps('serialNo')}
                                styles={{ input: { color: '#000000 !important' } }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                            <TextInput
                                label="Hour Meter"
                                placeholder="Input Hour Meter"
                                {...form.getInputProps('hourMeter')}
                                styles={{ input: { color: '#000000 !important' } }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                            <DateInput
                                label="Date of Check"
                                placeholder="Select Date"
                                {...form.getInputProps('dateOfCheck')}
                                rightSection={<IconCalendar size={16} />}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                            <Select
                                label="Technician"
                                placeholder="Select Technician"
                                data={technicians}
                                searchable
                                clearable
                                {...form.getInputProps('technician')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, md: 3 }}>
                            <Select
                                label="Approval By"
                                placeholder="Select Approver"
                                data={approvers}
                                searchable
                                clearable
                                {...form.getInputProps('approver')}
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

                {Object.keys(manitouChecklistItemsDefinition).map(sectionKey => (
                    <div key={sectionKey}>
                        {renderChecklistSection(
                            {
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
                            }[sectionKey] || sectionKey,
                            sectionKey,
                            manitouChecklistItemsDefinition[sectionKey]
                        )}
                    </div>
                ))}

                <Divider my="xl" />
                <Title order={3} mb="md">General Remarks</Title>
                <Textarea
                    placeholder="Add any general remarks here..."
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
    );
}

export default UnitArrivalInspectionForm;