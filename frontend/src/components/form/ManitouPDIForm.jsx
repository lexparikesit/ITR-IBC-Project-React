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
import { IconCalendar } from "@tabler/icons-react";
import { useForm } from '@mantine/form';
import { notifications } from "@mantine/notifications";

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

// Initialize useForm with all fields
const initializeFormValues = () => {
    const initialValues = {
        // unit type info
        dealerCode: '',
        machineType: '',
        serialNumber: '',
        deliveryDate: null,
        checkingDate: null,
        HourMeter: '',
        inspectorSignature: '',
        approvalBy: '',
        customer: '',
        woNumber: '',
        
        // after unit type
        deliveryRemarks: '',
        generalRemarks: '',
        checklistItems: {},
    };

    Object.keys(manitouPdiChecklistItemDefinition).forEach(sectionKey => {
        initialValues.checklistItems[sectionKey] = {};
        manitouPdiChecklistItemDefinition[sectionKey].forEach(item => {
            initialValues.checklistItems[sectionKey][item.itemKey] = '';
        });
    });

    return initialValues;
};

export function ManitouPDIForm() {
    const [technician, setTechnician] = useState([]);
    const [modelsData, setModelsData] = useState([]);
    const [WoNumber, setWoNumber] = useState([]);
    const [approvers, setApprovers] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [dealerCode, setDealerCode] = useState('');

    const createChecklistValidation = () => {
        const checklistValidation = {};
        Object.keys(manitouPdiChecklistItemDefinition).forEach(sectionKey => {
            manitouPdiChecklistItemDefinition[sectionKey].forEach(item => {
                const fieldKey = `checklistItems.${sectionKey}.${item.itemKey}`;
                checklistValidation[fieldKey] = (value) => (value ? null : "This field is Required!");
            });
        });
        return checklistValidation;
    };

    const form = useForm({
        initialValues: initializeFormValues(),
        validate: {
            dealerCode: (value) => (value ? null : "Dealer Code is Required!"),
            machineType: (value) => (value ? null: "Model Type is Required!"),
            serialNumber: (value) => (value ? null : "Serial Number is Required!"),
            deliveryDate: (value) => (value ? null : "Delivery Date is Required!"),
            checkingDate: (value) => (value ? null : "Checking Date is Required!"),
            HourMeter: (value) => (value ? null : "Hour Meter is Required!"),
            inspectorSignature: (value) => (value ? null : "Inspector Signature is Required!"),
            approvalBy: (value) => (value ? null : "Approval By is Required!"),
            customer: (value) => (value ? null : "Customer is Required!"),
            woNumber: (value) => (value ? null : "WO Number is Required!"),
            ...createChecklistValidation(),
        },
    });

    useEffect(() => {
        const fetchWONumber = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:5000/api/work-orders`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                const formattedWONumbers = data.map(item => ({
                    value: item.WONumber,
                    label: item.WONumber,
                }));
                setWoNumber(formattedWONumbers);
            } catch (error) {
                notifications.show({
                    title: "Error Loading Data",
                    message: "Failed to load Work Orders. Please try again!",
                    color: "red",
                });
                setWoNumber([]);
            }
        };
        
        const fetchCustomers = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:5000/api/customers`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const customersData = await response.json();
                const formattedCustomers = customersData.map(customer => ({
                    value: customer.CustomerID,
                    label: customer.CustomerName
                }));
                setCustomers(formattedCustomers);
            } catch (error) {
                notifications.show({
                    title: "Error Loading Data",
                    message: "Failed to load Customers. Please try again!",
                    color: "red",
                });
                setCustomers([]);
            }
        };

        const fetchModels = async () => {
            try {
                // API mstType
                const response = await fetch('http://127.0.0.1:5000/api/unit-types/MA');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                
                const formattedModels = data
                    .filter(item => item.value !== null && item.value !== undefined && item.label !== null && item.label !== undefined)
                    .map(item => ({
                        value: item.value,
                        label: item.label
                    }));
                setModelsData(formattedModels);
            } catch (error) {
                console.error("Failed to fetch models:", error);
                notifications.show({
                    title: "Error Loading Data",
                    message: "Failed to Load Unit Models. Please Try Again!",
                    color: "red",
                });
            }
        };
        
        const dummyTechnicians = [
            { value: "tech1", label: "John Doe" },
            { value: "tech2", label: "Jane Smith" },
            { value: "tech3", label: "Peter Jones" }
        ];
        setTechnician(dummyTechnicians);

        const dummyApprover = [
            { value: "app1", label: "Alice Brown" },
            { value: "app2", label: "Bob White" },
            { value: "app3", label: "John Green" }
        ];
        setApprovers(dummyApprover);

        setDealerCode([{ value: "30479", label: "30479" }]);

        fetchWONumber();
        fetchCustomers();
        fetchModels();
    }, []);
    
    const handleSubmit = async (values) => {
        console.log("DEBUG FRONTEND: Values before API call:", values);
        console.log("DEBUG FRONTEND: deliveryDate type:", typeof values.deliveryDate, "value:", values.deliveryDate);
        console.log("DEBUG FRONTEND: checkingDate type:", typeof values.checkingDate, "value:", values.checkingDate);

        const token = localStorage.getItem('access_token');

            console.log("DEBUG: Token from localStorage:", token); // --> DEBUG

            if (!token) {
            notifications.show({
                title: "Authentication Error",
                message: "Please log in again. Authentication token is missing.",
                color: "red",
            });
                console.log("Authentication token is missing.");
                return;
            }
    
        console.log("Form Submitted", values);
        
        const payload = {
            brand: 'manitou',
            unitInfo: {
                dealerCode: values.dealerCode,
                customers: values.customer,
                machineType: values.machineType,
                serialNumber: values.serialNumber,
                deliveryDate: values.deliveryDate || null,
                checkingDate: values.checkingDate || null,
                HourMeter: values.HourMeter,
                inspectorSignature: values.inspectorSignature,
                approvalBy: values.approvalBy,
                woNumber: values.woNumber,
            },
            remarksTransport: values.deliveryRemarks,
            generalRemarks: values.generalRemarks,
            checklistItems: values.checklistItems,
        };

        console.log("Payload to Backend: ", payload);

        try {
            const response = await fetch(`http://localhost:5000/api/pre-delivery-inspection/manitou/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to submit Renault Pre-Delivery Inspection");
            }

            const result = await response.json();
            notifications.show({
                title: "Submission Successful!",
                message: result.message || "Form Submitted Successfully.",
                color: "green",
            })
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

    const renderChecklistItem = (label, formProps, key) => {
        return (
            <Grid.Col span={{ base: 12, sm: 6 }} key={key}>
                <Stack gap="xs">
                    <Text size="sm" style={{ color: '#000000 !important', fontWeight: 500 }}>{label}</Text>
                    <Radio.Group
                        {...formProps}
                        orientation="horizontal"
                    >
                        <Group mt="xs">
                            <Radio value="Good" label={<Text style={{ color: '#000000 !important' }}>Good</Text>} />
                            <Radio value="Bad" label={<Text style={{ color: '#000000 !important' }}>Bad</Text>} />
                            <Radio value="Missing" label={<Text style={{ color: '#000000 !important' }}>Missing</Text>} />
                        </Group>
                    </Radio.Group>
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
                            form.getInputProps(`checklistItems.${sectionKey}.${item.itemKey}`),
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
            > Pre Delivery Inspection Form
            </Title>

            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Card shadow="sm" p="xl" withBorder mb="lg">
                    <Title order={3} mb="md" style={{ color: '#000000 !important' }}> Unit Information </Title>
                    <Grid gutter="xl">
                        <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
                            <Select 
                                label={<Text style={{ color: '#000000 !important' }}> Dealer Code </Text>}
                                placeholder="Select Dealer Code"
                                data={dealerCode}
                                searchable
                                clearable
                                {...form.getInputProps('dealerCode')}
                                renderOption={({ option }) => (
                                    <Text c='black'>{option.label}</Text>
                                )}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
                            <Select 
                                label={<Text style={{ color: '#000000 !important' }}> WO Number </Text>}
                                placeholder="Select WO Number"
                                data={WoNumber}
                                searchable
                                clearable
                                {...form.getInputProps('woNumber')}
                                renderOption={({ option }) => (
                                    <Text c='black'>{option.label}</Text>
                                )}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
                            <Select
                                label={<Text style={{ color: '#000000 !important' }}> Type/ Model </Text>}
                                placeholder="Select Model"
                                data={modelsData}
                                searchable
                                clearable
                                {...form.getInputProps('machineType')}
                                renderOption={({ option }) => (
                                    <Text c='black'>{option.label}</Text>
                                )}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
                            <TextInput
                                label={<Text style={{ color: '#000000 !important' }}> Serial Number </Text>}
                                placeholder="Input Serial Number"
                                {...form.getInputProps('serialNumber')}
                                    styles={{ input: { color: '#000000 !important' } }}
                                />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
                            <DateInput
                                label={<Text style={{ color: '#000000 !important' }}> Delivery Date </Text>}
                                placeholder="Select Date"
                                valueFormat="DD-MM-YYYY"
                                {...form.getInputProps('deliveryDate')}
                                rightSection={<IconCalendar size={16} />}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
                            <DateInput
                                label={<Text style={{ color: '#000000 !important' }}> Checking Date </Text>}
                                placeholder="Select Date"
                                valueFormat="DD-MM-YYYY"
                                {...form.getInputProps('checkingDate')}
                                rightSection={<IconCalendar size={16} />}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
                            <TextInput
                                label={<Text style={{ color: '#000000 !important' }}> Hour Meter </Text>}
                                placeholder="Input Hour Meter"
                                {...form.getInputProps('HourMeter')}
                                styles={{ input: { color: '#000000 !important' } }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
                            <Select
                                label={<Text style={{ color: '#000000 !important' }}> Customer </Text>}
                                placeholder="Select Customer"
                                data={customers}
                                searchable
                                clearable
                                {...form.getInputProps('customer')}
                                renderOption={({ option }) => (
                                    <Text c='black'>{option.label}</Text>
                                )}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
                            <Select
                                label={<Text style={{ color: '#000000 !important' }}> Inspector Signature </Text>}
                                placeholder="Select Inspector"
                                data={technician}
                                searchable
                                clearable
                                {...form.getInputProps('inspectorSignature')}
                                renderOption={({ option }) => (
                                    <Text c='black'>{option.label}</Text>
                                )}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
                            <Select
                                label={<Text style={{ color: '#000000 !important' }}> Approval By </Text>}
                                placeholder="Select Approver"
                                data={approvers}
                                searchable
                                clearable
                                {...form.getInputProps('approvalBy')}
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

                {/* Render sections based on manitouPdiChecklistItemDefinition */}
                {renderChecklistSection("01. Levels", "levels", manitouPdiChecklistItemDefinition.levels)}
                {renderChecklistSection("02. Visual Inspection", "visualInspection", manitouPdiChecklistItemDefinition.visualInspection)}
                {renderChecklistSection("03. Operation", "operation", manitouPdiChecklistItemDefinition.operation)}
                {renderChecklistSection("04. Tests", "tests", manitouPdiChecklistItemDefinition.tests)}
                {renderChecklistSection("05. Checking of General Machine Condition", "checkingOfGeneralMachineCondition", manitouPdiChecklistItemDefinition.checkingOfGeneralMachineCondition)}
                {renderChecklistSection("06. Transport/Delivery - Remarks Regarding", "transportationDelivery", manitouPdiChecklistItemDefinition.transportationDelivery)}
            
                <Divider my="xl" />
                <Title order={3} mb="md" style={{ color: '#000000 !important' }}> Possible Remarks on Transport and Delivery  </Title>
                <Textarea
                    placeholder="Add Any Comments Here..."
                    minRows={10}
                    mb="xl"
                    {...form.getInputProps('deliveryRemarks')}
                    styles={{ input: { color: '#000000 !important' } }}
                />

                <Divider my="xl" />
                <Title order={3} mb="md" style={{ color: '#000000 !important' }}> Comments Regarding Technical Problems  </Title>
                <Textarea
                    placeholder="Add Any Comments Here..."
                    minRows={10}
                    mb="xl"
                    {...form.getInputProps('generalRemarks')}
                    styles={{ input: { color: '#000000 !important' } }}
                />
                <Group justify="flex-end" mt="md">
                    <Button type="submit">Submit</Button>
                </Group>
            </form>
        </Box>
    )
}

export default ManitouPDIForm;