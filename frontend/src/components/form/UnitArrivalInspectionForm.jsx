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
    FileInput,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { IconCalendar, IconCamera, IconPencil } from "@tabler/icons-react";
import { useForm } from '@mantine/form';
import { notifications } from "@mantine/notifications";

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


export function UnitArrivalInspectionForm() {
    const [unitModels, setUnitModels] = useState([]);
    const [woNumbers, setWoNumbers] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [approvers, setApprovers] = useState([]);

    const generateChecklistValidation = () => {
        let validationRules = {};
        Object.keys(manitouChecklistItemsDefinition).forEach(sectionKey => {
            if (sectionKey === 'otherItems') {
                manitouChecklistItemsDefinition[sectionKey].forEach(item => {
                    const key = item.itemKey;
                    validationRules[key] = (value) => {
                        if ((value.status === 'Bad' || value.status === 'Missing') && !value.image) {
                            return 'Image is Required for Bad/ Missing!';
                        }
                        if (!value.status) {
                            return 'Item is Required!';
                        }
                        return null;
                    };
                });
            } else {
                manitouChecklistItemsDefinition[sectionKey].forEach(item => {
                    const key = `${sectionKey}.${item.itemKey}`;
                    validationRules[key] = (value) => {
                        if ((value.status === 'Bad' || value.status === 'Missing') && !value.image) {
                            return 'Image is Required for Bad/ Missing!';
                        }
                        if (!value.status) {
                            return 'Item is Required!';
                        }
                        return null;
                    };
                });
            }
        });
        return validationRules;
    };

    const form = useForm({
        initialValues: (() => {
            const initialManitouValues = {
                model: null,
                woNumber: null,
                serialNo: "",
                hourMeter: "",
                dateOfCheck: null,
                technician: null,
                approver: null,
                generalRemarks: "",
            };

            Object.keys(manitouChecklistItemsDefinition).forEach(sectionKey => {
                if (sectionKey === 'otherItems') {
                    manitouChecklistItemsDefinition[sectionKey].forEach(item => {
                        initialManitouValues[item.itemKey] = { status: "", image: null, caption: "" };
                    });
                } else {
                    initialManitouValues[sectionKey] = {};
                    manitouChecklistItemsDefinition[sectionKey].forEach(item => {
                        initialManitouValues[sectionKey][item.itemKey] = { status: "", image: null, caption: "" };
                    });
                }
            });
            return initialManitouValues;
        })(),

        validate: {
            woNumber: (value) => (value ? null : 'WO Number is Required!'),
            model: (value) => (value ? null : 'Model is Required!'),
            serialNo: (value) => (value ? null : 'VIN is Required!'),
            hourMeter: (value) => {
                if (!value) return 'Hour Meter is Required!';
                if (isNaN(Number(value))) return 'Hour Meter Must be a Number!';
                if (Number(value) < 0) return 'Hour Meter Cannot be Negative!';
                return null;
            },
            dateOfCheck: (value) => (value ? null : 'Date of Check is Required!'),
            technician: (value) => (value ? null : 'Technician is Required!'),
            approver: (value) => (value ? null : 'Approver is Required!'),
            ...generateChecklistValidation(),
        }
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // model/ type MA API
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
				const woResponse = await fetch(`http://127.0.0.1:5000/api/work-orders`);
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

    const checkVinExists = async (vin) => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            console.warn("No authentication token found for VIN check.");
            notifications.show({
                title: "Authentication Required",
                message: "Please log in to perform VIN check.",
                color: "red",
            });
            return false;
        }

        try {
            const response = await fetch(`http://127.0.0.1:5000/api/arrival-check/check-vin/${vin}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                notifications.show({
                    title: "VIN Check Failed",
                    message: `Server error during VIN verification. Please try again.`,
                    color: "red",
                });
                return true;
            }
            const data = await response.json();
            return data.exists;
        } catch (error) {
            console.error("Network Error or Failed to Check VIN:", error);
            notifications.show({
                title: "Network Error",
                message: "Failed to verify VIN. Check your internet connection.",
                color: "red",
            });
            return true;
        }
    };

    const handleSubmit = async (values) => {
        console.log('Form Submitted (Frontend Data)', values);

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
        
        const payload = {
            brand: 'manitou',
            unitInfo: {
                woNumber: values.woNumber,
                model: values.model,
                serialNo: values.serialNo,
                hourMeter: values.hourMeter,
                dateOfCheck: (values.dateOfCheck instanceof Date && !isNaN(values.dateOfCheck))
                            ? values.dateOfCheck.toISOString()
                            : null,
            },
            technician: values.technician,
            approver: values.approver,
            generalRemarks: values.generalRemarks,
            checklistItems: {},
        };

        const formData = new FormData();
        
        Object.keys(manitouChecklistItemsDefinition).forEach(sectionKey => {
            const items = manitouChecklistItemsDefinition[sectionKey];
            
            items.forEach(item => {
                const formKey = sectionKey === 'otherItems' ? item.itemKey : `${sectionKey}.${item.itemKey}`;
                const itemData = form.values[formKey] || (form.values[sectionKey] ? form.values[sectionKey][item.itemKey] : null);
                
                if (itemData && itemData.status) {
                    if (sectionKey === 'otherItems') {
                        payload.checklistItems[item.itemKey] = { status: itemData.status, caption: itemData.caption || "" };
                    } else {
                        if (!payload.checklistItems[sectionKey]) {
                            payload.checklistItems[sectionKey] = {};
                        }
                        payload.checklistItems[sectionKey][item.itemKey] = { status: itemData.status, caption: itemData.caption || "" };
                    }
                    
                    if (itemData.image) {
                        const imageKey = `image-${sectionKey}-${item.itemKey}`;
                        formData.append(imageKey, itemData.image);
                    }
                }
            });
        });

        console.log("Payload JSON to Backend: ", payload);

        formData.append('data', JSON.stringify(payload));
        
        try {
            const response = await fetch(`http://127.0.0.1:5000/api/arrival-check/manitou/submit`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to submit checklist');
            }

            const result = await response.json();
            notifications.show({
                title: "Success",
                message: result.message || 'Form submitted successfully!',
                color: "green",
            });
            form.reset();
        } catch (error) {
            console.error('Error submitting form:', error);
            notifications.show({
                title: "Submission Error",
                message: error.message || "An unexpected error occurred. Please try again.",
                color: "red",
            });
        }
    };

    const renderChecklistItem = (label, formProps, sectionKey, itemKey, key) => {
        const itemData = form.values[sectionKey] ? form.values[sectionKey][itemKey] : form.values[itemKey];
        const showConditionalInputs = itemData && (itemData.status === 'Bad' || itemData.status === 'Missing');

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
                            <FileInput
                                placeholder="Upload Image"
                                accept="image/png,image/jpeg"
                                mt="xs"
                                leftSection={<IconCamera size={18} />}
                                {...form.getInputProps(`${formProps}.image`)}
                            />
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
                            sectionKey === 'otherItems' ? item.itemKey : `${sectionKey}.${item.itemKey}`,
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
                Unit Arrival Check
            </Title>

            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Card shadow="sm" padding="lg" radius="md" withBorder mb="lg">
                    <Title order={3} mb="md" style={{ color: '#000000 !important' }}> Unit Information </Title>
                    <Grid gutter="xl">
                        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                            <Select
                                label="WO Number"
                                placeholder="Select WO Number"
                                data={woNumbers}
                                searchable
                                clearable
                                {...form.getInputProps('woNumber')}
                                renderOption={({ option }) => (
                                    <Text c='black'>{option.label}</Text>
                                )}
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
                                renderOption={({ option }) => (
                                    <Text c='black'>{option.label}</Text>
                                )}
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
                                valueFormat="DD-MM-YYYY"
                                {...form.getInputProps('dateOfCheck')}
                                onChange={(value) => {
                                    const parsedDate = value ? new Date(value) : null;
                                    form.setFieldValue('dateOfCheck', parsedDate);
                                }}
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
                                renderOption={({ option }) => (
                                    <Text c='black'>{option.label}</Text>
                                )}
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
                                renderOption={({ option }) => (
                                    <Text c='black'>{option.label}</Text>
                                )}
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

                {Object.keys(manitouChecklistItemsDefinition).filter(key => key !== 'otherItems').map(sectionKey => (
                    <div key={sectionKey}>
                        {renderChecklistSection(
                            {
                                engine: "01. Engine",
                                transmission: "02. Transmission",
                                axleTransferBox: "03. Axles / Transfer Box",
                                hydraulicHydrostaticCircuits: "04. Hydraulic / Hydrostatic Circuits",
                                brakingCircuits: "05. Braking Circuits",
                                lubrication: "06. Lubrication",
                                boomMastManiscopicManicess: "07. Boom / Mast Maniscopic / Manices",
                                mastUnit: "08. Mast Unit",
                                accessories: "09. Accessories",
                                cabProtectiveDeviceElectricCircuit: "10. Cab / Protective Device / Electric Circuit",
                                wheels: "11. Wheels",
                            }[sectionKey] || sectionKey,
                            sectionKey,
                            manitouChecklistItemsDefinition[sectionKey]
                        )}
                    </div>
                ))}

                {renderChecklistSection("12. Other Item", "otherItems", manitouChecklistItemsDefinition.otherItems)}

                <Divider my="xl" />
                <Title order={3} mb="md" style={{ color: '#000000 !important' }}> General Remarks </Title>
                <Textarea
                    placeholder="Add any general remarks here..."
                    minRows={4}
                    mb="xl"
                    {...form.getInputProps('generalRemarks')}
                />

                <Group justify="flex-end" mt="md">
                    <Button type="submit">Submit</Button>
                </Group>
            </form>
        </Box>
    );
}

export default UnitArrivalInspectionForm;