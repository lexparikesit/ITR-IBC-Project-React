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

export function ManitouPDIForm() {
    const [unitModels, setUnitModels] = useState([]);
    const [WoNumbers, setWoNumbers] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [approvers, setApprovers] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [dealerCode, setDealerCode] = useState('');

    const generateChecklistValidation = () => {
        let validationRules = {};
        Object.keys(manitouPdiChecklistItemDefinition).forEach(sectionKey => {
            manitouPdiChecklistItemDefinition[sectionKey].forEach(item => {
                const itemKey = item.itemKey;
                validationRules[`checklistItems.${sectionKey}.${itemKey}.value`] = (value) => (
                    value ? null : 'Status is Required!'
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
            Object.keys(manitouPdiChecklistItemDefinition).forEach(sectionKey => {
                initialChecklist[sectionKey] = {};
                manitouPdiChecklistItemDefinition[sectionKey].forEach(item => {
                    initialChecklist[sectionKey][item.itemKey] = {
                        value: '', // Status: Good, Bad, Missing
                        notes: '', // Caption
                        image: null, // Image File
                    };
                });
            });

            return {
                dealerCode: null,
                machineType: null,
                serialNumber: '',
                deliveryDate: null,
                checkingDate: null,
                HourMeter: '',
                inspectorSignature: null,
                approvalBy: null,
                customer: null,
                woNumber: null,
                deliveryRemarks: '',
                generalRemarks: '',
                checklistItems: initialChecklist,
            };
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

                // delaer Code
                setDealerCode([{ value: "30479", label: "30479" }]);

            } catch (error) {
                console.error("Failed to fetch data:", error);
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
        const token = localStorage.getItem('access_token');
        if (!token) {
            notifications.show({
                title: "Authentication Error",
                message: "Please log in again. Authentication token is missing.",
                color: "red",
            });
            return;
        }

        const formData = new FormData();
        const checklistItemsPayload = {};

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

                    if (itemData.image) {
                        const imageKey = `${sectionKey}.${item.itemKey}.image`;
                        formData.append(imageKey, itemData.image);
                    }
                }
            });
        });

        const payload = {
            brand: 'manitou',
            unitInfo: {
                dealerCode: values.dealerCode,
                customers: values.customer,
                machineType: values.machineType,
                serialNumber: values.serialNumber,
                deliveryDate: values.deliveryDate,
                checkingDate: values.checkingDate,
                HourMeter: values.HourMeter,
                inspectorSignature: values.inspectorSignature,
                approvalBy: values.approvalBy,
                woNumber: values.woNumber,
            },
            remarksTransport: values.deliveryRemarks,
            generalRemarks: values.generalRemarks,
            checklistItems: checklistItemsPayload,
        };

        formData.append('data', JSON.stringify(payload));

        try {
            const response = await fetch(`http://localhost:5000/api/pre-delivery-inspection/manitou/submit`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to submit Manitou Pre-Delivery Inspection");
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
            > Pre Delivery Inspection Form
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
                            <Select 
                                label="WO Number"
                                placeholder="Select WO Number"
                                data={WoNumbers}
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
                                {...form.getInputProps('machineType')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, md: 3 }}>
                            <TextInput
                                label="Serial Number"
                                placeholder="Input Serial Number"
                                {...form.getInputProps('serialNumber')}
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
                                label="Checking Date"
                                placeholder="Select Date"
                                valueFormat="DD-MM-YYYY"
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
                                label="Inspector Signature"
                                placeholder="Select Inspector"
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
                    minRows={10}
                    mb="xl"
                    {...form.getInputProps('deliveryRemarks')}
                />

                <Divider my="xl" />
                <Title order={3} mb="md" style={{ color: '#000000 !important' }}> Comments Regarding Technical Problems </Title>
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

export default ManitouPDIForm;