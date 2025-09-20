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
import { IconCalendar, IconUpload, IconX, IconFile, IconPencil } from "@tabler/icons-react";
import { useForm } from '@mantine/form';
import { notifications } from "@mantine/notifications";
import { Dropzone, MIME_TYPES } from "@mantine/dropzone";
import { rem } from "@mantine/core";

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
    const [unitModels, setUnitModels] = useState([]);
    const [woNumbers, setWoNumbers] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [approvers, setApprovers] = useState([]);

    const generateChecklistValidation = () => {
        let validationRules = {};
        Object.keys(manitouStorageItemDefinition).forEach(sectionKey => {
            manitouStorageItemDefinition[sectionKey].forEach(item => {
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
                woNumber: null,
                hourMeter: "",
                dateOfCheck: null,
                technician: null,
                approvalBy: null,
                remarks: "",
            };

            Object.keys(manitouStorageItemDefinition).forEach(sectionKey => {
                initialManitouValues[sectionKey] = {};
                manitouStorageItemDefinition[sectionKey].forEach(item => {
                    initialManitouValues[sectionKey][item.itemKey] = { status: "", image: null, caption: "" };
                });
            }); 
            return initialManitouValues;
        })(),

        validate: {
            woNumber: (value) => (value ? null: "WO Number is Required!"),
            model: (value) => (value ? null : "Model Type is Required!"),
            serialNo: (value) => (value ? null : "VIN is Required!"),
            hourMeter: (value) => (value ? null : "Hour Meter is Required!"),
            dateOfCheck: (value) => (value ? null : "Date of Check is Required!"),
            technician: (value) => (value ? null : "Technician is Required!"),
            approvalBy: (value) => (value ? null: "Approval By is Required!"),
            ...generateChecklistValidation(),
        }
    });
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const brandId = "MA"; // 'MA' for Manitou
                const groupId = "SM"; // 'SM' for Storage Maintenance

                // model/ Type MA API
                const modelResponse = await fetch('http://127.0.0.1:5000/api/unit-types/MA');
                if (!modelResponse.ok) throw new Error(`HTTP error! status: ${modelResponse.status}`);
                const modelData = await modelResponse.json();
                const formattedModels = modelData
                    .filter(item => item.value !== null && item.value !== undefined && item.label !== null && item.label !== undefined)
                    .map(item => ({
                        value: item.value,
                        label: item.label
                    }));
                setUnitModels(formattedModels);

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
        console.log('Form Submitted (Frontend Data)', values);

        const token = localStorage.getItem('access_token');
        if (!token) {
            notifications.show({
                title: "Authentication Error",
                message: "Please log in again. Authentication token is missing.",
                color: "red",
            });
            return;
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
                timeOfCheck: values.timeOfCheck,
                technician: values.technician,
                approvalBy: values.approvalBy,
            },
            remarks: values.remarks,
            checklistItems: {},
        };

        const formData = new FormData();

        Object.keys(manitouStorageItemDefinition).forEach(sectionKey => {
            const items = manitouStorageItemDefinition[sectionKey];
            
            items.forEach(item => {
                const itemData = values[sectionKey]?.[item.itemKey];
                
                if (itemData && itemData.status) {
                    if (!payload.checklistItems[sectionKey]) {
                        payload.checklistItems[sectionKey] = {};
                    }
                    
                    payload.checklistItems[sectionKey][item.itemKey] = { status: itemData.status, caption: itemData.caption || "" };
                    
                    if (itemData.image) {
                        const imageKey = `image-${sectionKey}-${item.itemKey}`;
                        formData.append(imageKey, itemData.image);
                    }
                }
            });
        });

        console.log("Payload to Backend: ", payload);

        formData.append('data', JSON.stringify(payload));
        
        try {
            const response = await fetch(`http://127.0.0.1:5000/api/storage-maintenance/manitou/submit`, {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
            });
        
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to submit storage maintenance checklist');
            }

            const result = await response.json();
            notifications.show({
                title: "Submission Successful!",
                message: result.message || "Form Submitted Successfully.",
                color: "green",
            })
            form.reset();
        
        } catch (error) {
            console.error('Error submitting form:', error);
            console.log('Error submitting form:', error);
            notifications.show({
                title: "Submission Error",
                message: `Failed to submit form: ${error.message}`,
                color: "red",
            });
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
                                onDrop={(files) => {
                                    if (files.length > 0) {
                                        form.setFieldValue(`${formProps}.image`, files[0]);
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
                                        <Text size="xs" c="dimmed"> {itemData.image ? itemData.image.name : 'Drag and drop an image here or click to select'} </Text>
                                        <Text size="xs" c="dimmed"> Accepted formats: JPG, PNG </Text>
                                    </Stack>
                                </Group>
                            </Dropzone>
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
                <Card shadow="sm" padding="lg" radius="md" withBorder mb="lg">
                    <Title order={3} mb="md" style={{ color: '#000000 !important' }}> Unit Information </Title>
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
                                label="Type/ Model"
                                placeholder="Select Model"
                                data={unitModels}
                                searchable
                                clearable
                                {...form.getInputProps('model')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, md: 3 }}>
                            <TextInput
                                label="VIN"
                                placeholder="Input VIN Number"
                                {...form.getInputProps('serialNo')}
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
                                label="Date of Check"
                                placeholder="Select Date"
                                valueFormat="DD-MM-YYYY"
                                {...form.getInputProps('dateOfCheck')}
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

                {Object.keys(manitouStorageItemDefinition).map(sectionKey => (
                    <div key={sectionKey}>
                        {renderChecklistSection(
                            {
                                engine: "01. Engine",
                                driveline: "02. Driveline",
                                hydraulicHydrostaticCircuits: "03. Hydraulic/ Hydrostatic Circuits",
                                brakingCircuits: "04. Braking Circuits",
                                boomMastManiscopicManicess: "05. Boom Unit/ Maniscopic/ Maniaccess",
                                mastUnit: "06. Mast Unit",
                                accessories:"07. Accesseories",
                                cabProtectiveDeviceElectricCircuit: "08. Cab/ Protective Device/ Electric Circuit",
                                wheels: "09. Wheels",
                                screwsAndNuts: "10. Screw and Nuts",
                                frameBody: "11. Frame and Body",
                                paint: "12. Paint",
                                generalOperation: "13. General Operation",
                                operatorsManual: "14. Operator's Manual",
                                instructionsForCustomer: "15. Instruction For Customer",
                            }[sectionKey] || sectionKey,
                            sectionKey,
                            manitouStorageItemDefinition[sectionKey]
                        )}
                    </div>
                ))}

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
                    <Button type="submit">Submit</Button>
                </Group>
            </form>
        </Box>
    );
}

export default ManitouStorageMaintenanceForm;