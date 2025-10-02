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

export function ManitouCommissioningForm() {
    const [unitModels, setUnitModels] = useState([]);
    const [woNumbers, setWoNumbers] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [approvers, setApprovers] = useState([]);

    const generateChecklistValidation = () => {
        let validationRules = {};
        Object.keys(ManitouCommissioningChecklistForm).forEach(sectionKey => {
            ManitouCommissioningChecklistForm[sectionKey].forEach(item => {
                const itemKey = item.itemKey;
                validationRules[`checklistItems.${sectionKey}.${itemKey}.value`] = (value) => (
                    value ? null : 'This field is Required!'
                );
                validationRules[`checklistItems.${sectionKey}.${itemKey}.image`] = (value) => (
                    value ? null : 'An Image is Required for This Item!'
                );
            });
        });
        return validationRules;
    };

    const form = useForm({
        initialValues: (() => {
            const initialChecklist = {};
            Object.keys(ManitouCommissioningChecklistForm).forEach(sectionKey => {
                initialChecklist[sectionKey] = {};
                ManitouCommissioningChecklistForm[sectionKey].forEach(item => {
                    initialChecklist[sectionKey][item.itemKey] = {
                        value: '',
                        notes: '',
                        image: null,
                    };
                });
            });

            return {
                woNumber: null,
                unitModel: null,
                VIN: '',
                hourMeter: '',
                deliveryDate: null,
                commissioningDate: null,
                customer: null,
                inspectorSignature: null,
                approvalBy: null,
                generalRemarks: '',
                checklistItems: initialChecklist,
            };
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

                // model/ Type MA API
                const modelResponse = await fetch(`http://127.0.0.1:5000/api/unit-types/${brandId}`);
                if (!modelResponse.ok) throw new Error(`HTTP error! status: ${modelResponse.status}`);
                const modelData = await modelResponse.json();
                const formattedModels = modelData
                    .filter(item => item.value !== null && item.value !== undefined && item.label !== null && item.label !== undefined)
                    .map(item => ({
                        value: item.value,
                        label: item.label
                    }));
                setUnitModels(formattedModels);
                console.log("Formatted Unit Models:", formattedModels);
                
                // wo Number API
                const woResponse = await fetch(`http://127.0.0.1:5000/api/work-orders?brand_id=${brandId}&group_id=${groupId}`);
                if (!woResponse.ok) throw new Error(`HTTP error! status: ${woResponse.status}`);
                const woData = await woResponse.json();
                const formattedWoData = woData.map(wo => ({
                    value: wo.WONumber,
                    label: wo.WONumber
                }));
                setWoNumbers(formattedWoData);

                // customers API
                const customerResponse = await fetch(`http://127.0.0.1:5000/api/customers`);
                if (!customerResponse.ok) throw new Error(`HTTP error! status: ${customerResponse.status}`);
                const customerData = await customerResponse.json();
                const formattedCustomers = customerData.map(customer => ({
                    value: customer.CustomerID,
                    label: customer.CustomerName
                }));
                setCustomers(formattedCustomers);

                // dummy Technicians API
                const dummyTechnicians = [
                    { value: "tech1", label: "John Doe" },
                    { value: "tech2", label: "Jane Smith" },
                    { value: "tech3", label: "Peter Jones" }
                ];
                setTechnicians(dummyTechnicians);

                // dummy Approvers API
                const dummyApprover = [
                    { value: "app1", label: "Alice Brown" },
                    { value: "app2", label: "Bob White" },
                    { value: "app3", label: "John Green" }
                ];
                setApprovers(dummyApprover);

            } catch (error) {
                notifications.show({
                    title: "Error Loading Data",
                    message: "Failed to load form data. Please try again!",
                    color: "red",
                });
            }
        };
        fetchData();
    }, []);

    const handleSubmit = async (values) => {
        console.log("Form values before submission:", values);
        const token = localStorage.getItem('access_token');
        if(!token) {
            notifications.show({
                title: "Authentication Error",
                message: "Please log in again. Authentication token is missing.",
                color: "red",
            });
            return;
        }

        const formData = new FormData();
        const checklistItemsPayload = {};

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
                        notes: itemData.notes || '',
                    };

                    if (itemData.image) {
                        const imageKey = `${sectionKey}.${item.itemKey}.image`;
                        formData.append(imageKey, itemData.image);
                    }
                }
            });
        });

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

        formData.append('data', JSON.stringify(payload));

        try {
            const response = await fetch(`http://localhost:5000/api/commissioning/manitou/submit`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to submit Manitou Commissioning Inspection");
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
            notifications.show({
                title: "Submission Error",
                message: `Failed to submit form: ${error.message}`,
                color: "red",
            });
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
                        onChange={(statusValue) => form.setFieldValue(`${path}.value`, statusValue)}
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
                        onDrop={(files) => {
                            if (files.length > 0) {
                                form.setFieldValue(`${path}.image`, files[0]);
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
                        accept={[MIME_TYPES.jpeg, MIME_TYPES.png]}
                        mt="xs"
                        error={imageError}
                        style={{ borderColor: imageError ? 'red' : undefined }}
                    >
                        <Group justify="center" gap="xs" style={{ minHeight: rem(80), pointerEvents: 'none' }}>
                            <Dropzone.Accept>
                                <IconUpload style={{ width: rem(40), height: rem(40), color: 'var(--mantine-color-blue-6)' }} stroke={1.5} />
                            </Dropzone.Accept>
                            <Dropzone.Reject>
                                <IconX style={{ width: rem(40), height: rem(40), color: 'var(--mantine-color-red-6)' }} stroke={1.5} />
                            </Dropzone.Reject>
                            <Dropzone.Idle>
                                <IconFile style={{ width: rem(40), height: rem(40), color: 'var(--mantine-color-dimmed)' }} stroke={1.5} />
                            </Dropzone.Idle>
                            <Stack align="center" gap={4}>
                                <Text size="xs" c="dimmed"> {hasImage ? itemData.image.name : 'Drag and drop an image here or click to select'} </Text>
                                <Text size="xs" c="dimmed"> Accepted formats: JPG, PNG </Text>
                            </Stack>
                        </Group>
                    </Dropzone>
                    {imageError && (
                        <Text size="sm" c="red" mt={5}>
                            {imageError}
                        </Text>
                    )}
                    <TextInput
                        placeholder="Add Image Caption"
                        mt="xs"
                        value={itemData?.notes || ''}
                        leftSection={<IconPencil size={20}/>}
                        onChange={(event) => form.setFieldValue(`${path}.notes`, event.target.value)}
                        error={notesError}
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

    return (
        <Box maw="100%" mx="auto" px="md">
            <Title
                order={1}
                mt="md"
                mb="lg"
                style={{ color: '#000000 !important' }}
            > Commissioning Form
            </Title>

            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Card shadow="sm" p="xl" withBorder mb="lg">
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
                                valueFormat="DD-MM-YYYY"
                                {...form.getInputProps('deliveryDate')}
                                rightSection={<IconCalendar size={16} />}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, md: 3 }}>
                            <DateInput
                                label="Date of Check"
                                placeholder="Select Date"
                                valueFormat="DD-MM-YYYY"
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

                <Divider my="xl" label={<Text style={{ color: '#000000 !important' }}>Legend</Text>} labelPosition="center" />
                    <Group justify="center" gap="xl" mb="lg">
                        <Text style={{ color: '#000000 !important' }}> 1: Good </Text>
                        <Text style={{ color: '#000000 !important' }}> 2: Bad </Text>
                        <Text style={{ color: '#000000 !important' }}> 0: Missing </Text>
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
                <Title order={3} mb="md" style={{ color: '#000000 !important' }}> General Remarks </Title>
                <Textarea
                    placeholder="Add Any Comments Here..."
                    minRows={10}
                    mb="xl"
                    {...form.getInputProps('generalRemarks')}
                />
                <Group justify="flex-end" mt="md">
                    <Button type="submit">Submit</Button>
                </Group>
            </form>
        </Box>
    )
}

export default ManitouCommissioningForm;