"use client";

import React, { useEffect, useState } from 'react';
import {
    TextInput,
    Textarea,
    Button,
    Grid,
    Card,
    Title,
    Box,
    Table,
    Checkbox,
    Group,
    ActionIcon,
    Select,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconCalendar } from "@tabler/icons-react";
import { IconPlus, IconTrash } from '@tabler/icons-react';

const inspectionItemsDefinition = [
    { id: 1, label: "Visual inspection for paint damage and rust protection defects." },
    { id: 2, label: "Check the coolant level in the radiator, check the engine oil level, and check the oil levels in the gearbox, drive axle, and hydraulic system. Check the water level in the front windshield washing system." },
    { id: 3, label: "Remove the anti-fall device of the hydraulic cylinder and clean the rust inhibitor from the piston rod of the hydraulic cylinder." },
    { id: 4, label: "Check the tire pressure, if necessary, adjust the pressure, and check the tightness of the track of the excavator." },
    { id: 5, label: "Start the machine, run it to normal operating temperature, and check whether all system function normally:" },
    { id: 6, label: "Check for fuel, water, and oil leaks; if necessary, inspect and tighten all connections and clamps. Ensure that the routing of all hoses and pipes is reasonable without interference" },
    { id: 7, label: "Turn off the battery switch" },
]

export function SdlgPDIForm() {
    const [unitModels, setUnitModels] = useState([]);
    const [WoNumbers, setWoNumbers] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [approvers, setApprovers] = useState([]);

    const form = useForm({
        initialValues: {
            //woNumber: null,
            woNumber: '',
            machineModel: null,
            vehicleNumber: '',
            preInspectionPersonnel: null,
            approvalBy: null,
            inspectionDate: null,

            inspectionChecklist: inspectionItemsDefinition.reduce((acc, item) => {
                acc[item.id] = false;
                return acc;
            }, {}),

            defects: [{ sn: 1, description: '', remarks: '' }],

            inspectorSignature: null,
            inspectorDate: null,
            supervisorSignature: null,
            supervisorDate: null,
        },

        validate: {
            woNumber: (value) => (value ? null : 'WO Number is Required!'),
            machineModel: (value) => (value ? null : 'Type/ Model is Required!'),
            vehicleNumber: (value) => (value ? null : 'VIN Number is Required!'),
            preInspectionPersonnel: (value) => (value ? null : 'Technician is Required!'),
            approvalBy: (value) => (value ? null: 'Approval By is Required!'),
            inspectionDate: (value) => (value ? null : 'Inspection Date is Required!'),
            inspectorSignature: (value) => (value ? null : 'Inspector signature is Required!'),
            inspectorDate: (value) => (value ? null : 'Inspector date is Required!'),
            supervisorSignature: (value) => (value ? null : 'Supervisor Signature is Required!'),
            supervisorDate: (value) => (value ? null : 'Supervisor Date is Required!'),
        }
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const brandId = "SDLG"; // 'SDLG' for SDLG
                const groupId = "DPDPI"; // 'DPDPI' for PDI
                
                // model/ Type SDLG API
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

    const addObservedConditionRow = () => {
        form.setFieldValue('defects', [
            ...form.values.defects,
            { sn: form.values.defects.length + 1, description: '', remarks: '' }
        ]);
    };

    const removeObservedConditionRow = (index) => {
        form.setFieldValue('defects', form.values.defects.filter((_, i) => i !== index));
    };

    const formatDate = (date) => {
        if (!date) return null;
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const handleSubmit = async (values) => {
        const token = localStorage.getItem('access_token');
        console.log("DEBUG: Token from localStorage:", token);

        if (!token) {
            notifications.show({
                title: "Authentication Error",
                message: "No access token found. Please log in.",
                color: "red",
            });
            return;
        }

        console.log("Form submitted with values:", values);

        const payload = {
            brand: 'SDLG',
            unitInfo: {
                woNumber: values.woNumber,
                machineModel: values.machineModel,
                vehicleNumber: values.vehicleNumber,
                preInspectionPersonnel: values.preInspectionPersonnel,
                approvalBy: values.approvalBy,
                inspectionDate: formatDate(values.inspectionDate),
            },
            checklist: values.inspectionChecklist,
            defects: values.defects,
            signatures: {
                inspector: values.inspectorSignature,
                inspectorDate: formatDate(values.inspectorDate),
                supervisor: values.supervisorSignature,
                supervisorDate: formatDate(values.supervisorDate),
            }
        };

        console.log("Payload sent to backend:", payload);

        try {
            const response = await fetch(`http://127.0.0.1:5000/api/pre-delivery-inspection/sdlg/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to submit PDI Checklist");
            }

            const result = await response.json();
            notifications.show({
                title: "Submission Successful!",
                message: result.message || "Form Submitted Successfully.",
                color: "green",
            });
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

    return (
        <Box maw="100%" mx="auto" px="md" mt="md">
            <Title
                order={1}
                mt="md"
                mb="lg"
                style={{ color: '#000000 !important' }}
            > Pre Delivery Inspection Form
            </Title>

            <form onSubmit={form.onSubmit(handleSubmit)}>
                {/* Header: Unit Information */}
                <Card shadow="sm" p="xl" withBorder mb="lg">
                    <Title order={3} mb="md" style={{ color: '#000000 !important' }}> Unit Information </Title>
                    <Grid gutter="xl">
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
                                placeholder="Select Type/ Model"
                                data={unitModels}
                                searchable
                                clearable
                                {...form.getInputProps('machineModel')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, md: 3 }}>
                            <TextInput
                                label="VIN"
                                placeholder="Input VIN Number"
                                {...form.getInputProps('vehicleNumber')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, md: 3 }}>
                            <DateInput
                                label="Date of Check"
                                placeholder="Select Date"
                                {...form.getInputProps('inspectionDate')}
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
                                {...form.getInputProps('preInspectionPersonnel')}
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

                {/* Part 1: Inspection */}
                <Card shadow="sm" p="lg" withBorder mb="xl">
                    <Title order={4} mb="md">1. Inspection</Title>
                    <Table withRowBorders withColumnBorders>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th style={{ width: '50px' }}>SN</Table.Th>
                                <Table.Th>Inspection Items</Table.Th>
                                <Table.Th style={{ width: '120px', textAlign: 'center' }}>Perform or not</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {inspectionItemsDefinition.map((item, index) => (
                                <Table.Tr key={`inspection-${item.id}`}>
                                    <Table.Td>{item.id}</Table.Td>
                                    <Table.Td>{item.label}</Table.Td>
                                    <Table.Td>
                                        <Group justify='center'>
                                            <Checkbox
                                                {...form.getInputProps(`inspectionChecklist.${item.id}`, { type: 'checkbox' })}
                                            />
                                        </Group>
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                </Card>

                {/* Part 2: Record all observed conditions */}
                <Card shadow="sm" p="lg" withBorder mb="xl">
                    <Title order={4} mb="md">Record all observed conditions and report to the supervisor</Title>
                    <Table withRowBorders withColumnBorders>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th style={{ width: '50px' }}>SN</Table.Th>
                                <Table.Th>Description of defects or failures</Table.Th>
                                <Table.Th>Remarks</Table.Th>
                                <Table.Th style={{ width: '50px' }}>Action</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {form.values.defects.map((condition, index) => (
                                <Table.Tr key={index}>
                                    <Table.Td>{index + 1}</Table.Td>
                                    <Table.Td>
                                        <Textarea
                                            placeholder="Enter the Description of defects or failures"
                                            autosize
                                            minRows={1}
                                            {...form.getInputProps(`defects.${index}.description`)}
                                        />
                                    </Table.Td>
                                    <Table.Td>
                                        <Textarea
                                            placeholder="Enter Remarks of the Description"
                                            autosize
                                            minRows={1}
                                            {...form.getInputProps(`defects.${index}.remarks`)}
                                        />
                                    </Table.Td>
                                    <Table.Td ta="center">
                                        <ActionIcon
                                            color="red"
                                            variant="light"
                                            onClick={() => removeObservedConditionRow(index)}
                                            disabled={form.values.defects.length === 1}
                                        >
                                            <IconTrash size={16} />
                                        </ActionIcon>
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                    <Button
                        leftSection={<IconPlus size={16} />}
                        mt="md"
                        onClick={addObservedConditionRow}
                        variant="light"
                    >
                        Add Row
                    </Button>
                </Card>

                {/* Signature Parts */}
                <Card shadow="sm" p="lg" withBorder mb="xl">
                    <Title order={4} mb="md">Signature</Title>
                    <Grid gutter="xl">
                        <Grid.Col span={{ base: 12, md: 6 }}>
                            <Select
                                label="Inspector Signature"
                                placeholder="Select Inspector"
                                clearable
                                searchable
                                data={approvers}
                                {...form.getInputProps('inspectorSignature')}
                            />
                            <DateInput
                                label="Date"
                                placeholder="Select Date"
                                valueFormat="YYYY-MM-DD"
                                mt="md"
                                {...form.getInputProps('inspectorDate')}
                                rightSection={<IconCalendar size={16} />}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6 }}>
                            <Select
                                label="Supervisor Signature"
                                placeholder="Select Supervisor"
                                clearable
                                searchable
                                data={approvers}
                                {...form.getInputProps('supervisorSignature')}
                            />
                            <DateInput
                                label="Date"
                                placeholder="Select Date"
                                valueFormat="YYYY-MM-DD"
                                mt="md"
                                {...form.getInputProps('supervisorDate')}
                                rightSection={<IconCalendar size={16} />}
                            />
                        </Grid.Col>
                    </Grid>
                </Card>

                <Group justify="flex-end" mt="xl">
                    <Button type="submit">Submit</Button>
                </Group>
            </form>
        </Box>
    )
}