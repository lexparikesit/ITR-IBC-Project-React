"use client";

import React, { useEffect, useState } from 'react';
import {
    TextInput,
    Textarea,
    Button,
    Group,
    Box,
    Checkbox,
    Title,
    Text,
    Table,
    ActionIcon,
    Grid,
    Select,
    Card,
    Loader,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconCalendar } from "@tabler/icons-react";
import { IconPlus, IconTrash } from '@tabler/icons-react';
import apiClient from '@/libs/api';

export default function SDLGStorageMaintenanceForm() {
    const [unitModels, setUnitModels] = useState([]);
    const [woNumbers, setWoNumbers] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [approvers, setApprovers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    
    const form = useForm({
        initialValues: {
            machineModel: null,
            vehicleNumber: "",
            workingHours: "",
            woNumber: null,
            // woNumber: "",
            vehicleArrivalDate: null,
            inspectionDate: null,
            inspector: null,
            approvalBy: null,

            // first part - Inspection
            inspectionItems: {
                item1: false, item2: false, item3: false,
                item4: false, item5: false, item6: false,
                item7: false, item8: false, item9: false,
            },

            // second part - testing
            testingItems: {
                item10: false, item11: false, item12: false,
                item13: false, item14: false, item15: false,
                item16: false, item17: false, item18: false,
                item19: false, item20: false, item21: false,
                item22: false, item23: false,
            },

            // third part - record all observed condition
            observedConditions: [{ sn: 1, description: '', remarks: '' }],

            // supervisor part
            signatureInspectorName: null,
            signatureInspectorDate: null,
            supervisorName: null,
            supervisorDate: null,
        },

        validate: {
            woNumber: (value) => (value ? null: 'WO Number is Required!'),
            machineModel: (value) => (value ? null: 'Machine Model is Required!'),
            vehicleNumber: (value) => (value ? null: 'VIN is Required!'),
            workingHours: (value) => (value ? null: 'Working Hours are Required!'),
            vehicleArrivalDate: (value) => (value ? null: 'Vehicle Arrival Date is Required!'),
            inspectionDate: (value) => (value ? null: 'Inspection Date is Required!'),
            inspector: (value) => (value ? null: 'Technician is Required!'),
            approvalBy: (value) => (value ? null: 'Approval By is Required!'),
            signatureInspectorName: (value) => (value ? null : 'Inspector Signature is required!'),
            signatureInspectorDate: (value) => (value ? null : 'Inspector Signature Date is required!'),
            supervisorName: (value) => (value ? null : 'Supervisor Signature is required!'),
            supervisorDate: (value) => (value ? null : 'Supervisor Signature Date is required!'),
        }
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const brandId = "SDLG"; // 'SDLG' for SDLG
                const groupId = "SM"; // 'SM' for Storage Maintenance
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
                    .filter(item => item.value !== null && item.label !== null)
                    .map(item => ({ value: item.value, label: item.label }));
                setUnitModels(formattedModels);

                setWoNumbers(woRes.data.map(wo => ({ value: wo.WONumber, label: wo.WONumber })));
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

    const inspectionItemsData = [
        "Routine inspection of surface/appearance, extent of paint damage, and rust prevention",
        "Check that all oil levels and coolant levels are correct",
        "Check and adjust tire pressure; Check excavator for track tightness",
        "Check the aging condition of tires and rubber parts",
        "Check the charging indicator light of the battery. If the machine has been stored for more than three months, the battery should be removed and maintained by charging. If the battery cable terminals are loose or corroded. If necessary, clean the battery terminals and apply corrosion remover.",
        "Check the cleanliness of the cab and engine compartment",
        "Check whether the interior, floor mats, and insulation materials in the cab are damp",
        "For equipment with a drive shaft, check the drive shaft. If the machine has been stored for more than six months, it must be re-greased.",
        "Before testing: Remove all corrosion removers and other rust protection, including the plastic cover outside the hydraulic cylinder piston rod.",
    ];

    const testingItemsData = [
        "Start the machine and allow the engine and other components to reach normal operating temperature. During the operation of the machine, check the following items:",
        "A-C (optional) should run for at least 5 minutes, refer to the Operation Manual for inspection.",
        "Check the steering system and braking system.",
        "Operate all hydraulic movements of the machine to ensure hydraulic components are at the stroke end (end of the stroke), with the same operations for the steering system.",
        "Check for fuel, water, and oil leaks; if necessary, inspect and tighten all connections and clamps.",
        "Check whether the dashboard, control lights, and other lights are functioning properly.",
        "The piston rod of the hydraulic cylinder should be in the retracted position, and the exposed part of the rod should be coated with rust inhibitor, such as Teflon or an equivalent.",
        "For equipment with an air storage tank, exhaust the compressed air from the tank.",
        "For the excavator, check if the tracks and chassis are clean.",
        "The fuel tank must be full at all times to prevent moisture condensation.",
        "Spray rust inhibitor where needed and apply lubricant.",
        "Close the door and window of the cab.",
        "If necessary, seal the exhaust pipe of the engine to prevent rainwater from entering the engine.",
        "Turn off the battery switch or cut off the negative cable.",
    ];

    const addObservedConditionRow = () => {
        form.setFieldValue('observedConditions', [
            ...form.values.observedConditions,
            { sn: form.values.observedConditions.length + 1, description: '', remarks: '' }
        ]);
    };

    const removeObservedConditionRow = (index) => {
        form.setFieldValue('observedConditions', form.values.observedConditions.filter((_, i) => i !== index));
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
        setUploading(true);
        try {
            const inspectionPayload = Object.entries(values.inspectionItems).reduce((acc, [key, value]) => {
                const index = key.replace('item', '');
                acc[`inspection${index}`] = value;
                return acc;
            }, {});

            const testingPayload = Object.entries(values.testingItems).reduce((acc, [key, value]) => {
                const index = key.replace('item', '');
                acc[`testing${index}`] = value;
                return acc;
            }, {});

            const payload = {
                brand: 'SDLG',
                model: values.machineModel,
                woNumber: values.woNumber,
                vehicleNumber: values.vehicleNumber,
                workingHours: values.workingHours,
                inspector: values.inspector,
                approvalBy: values.approvalBy,
                vehicleArrival: formatDate(values.vehicleArrivalDate),
                inspectionDate: formatDate(values.inspectionDate),
                ...inspectionPayload,
                ...testingPayload,
                signatureInspector: values.signatureInspectorName,
                signatureInspectorDate: formatDate(values.signatureInspectorDate),
                signatureSupervisor: values.supervisorName,
                signatureSupervisorDate: formatDate(values.supervisorDate),
                observedConditions: values.observedConditions,
            };

            const response = await apiClient.post(`/storage-maintenance/sdlg/submit`, payload);

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

    if (loading) {
        return (
            <Box maw="100%" mx="auto" px="md" ta="center">
                <Title order={1} mt="md" mb="lg" c="var(--mantine-color-text)">Loading Form Data...</Title>
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
                Storage Maintenance
            </Title>
            
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Card shadow="sm" p="xl" withBorder mb="lg">
                    <Title order={3} mb="md"> Unit Information </Title>
                    <Grid gutter="xl">
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <Select
                                label="WO Number"
                                placeholder="Select WO Number"
                                data={woNumbers}
                                searchable
                                clearable
                                {...form.getInputProps('woNumber')}
                            />
                            {/* <TextInput
                                label="WO Number"
                                placeholder="Input WO Number"
                                {...form.getInputProps('woNumber')}
                            /> */}
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <Select
                                label="Type/ Model"
                                placeholder="Select Model"
                                data={unitModels}
                                searchable
                                clearable
                                {...form.getInputProps('machineModel')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <TextInput
                                label="VIN"
                                placeholder="Input VIN Number"
                                {...form.getInputProps('vehicleNumber')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <TextInput
                                label="Working Hours"
                                placeholder="Input Working Hours"
                                {...form.getInputProps('workingHours')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <DateInput
                                label="Vehicle Arrival Date"
                                placeholder="Select Date"
                                {...form.getInputProps('vehicleArrivalDate')}
                                rightSection={<IconCalendar size={16} />}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <DateInput
                                label="Date of Check"
                                placeholder="Select date"
                                {...form.getInputProps('inspectionDate')}
                                rightSection={<IconCalendar size={16} />}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <Select
                                label="Technician"
                                placeholder="Select Technician"
                                clearable
                                searchable
                                data={technicians}
                                {...form.getInputProps('inspector')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <Select
                                label="Approval By"
                                placeholder="Select Approver"
                                clearable
                                searchable
                                data={approvers}
                                {...form.getInputProps('approvalBy')}
                            />
                        </Grid.Col>
                    </Grid>
                    <Text size="xs" c="dimmed" mt="xs">
                        <Text component="span" fw={700}>Important:</Text> 
                        <Text component="span">Please follow the safety instructions in the machine operation and maintenance manual...</Text>
                    </Text>
                    <Box size="xs" c="dimmed" mt="xs">
                        <ul style={{ listStyleType: 'disc', marginLeft: '20px' }}>
                            <li>
                                <Text size="xs" c="dimmed"> Regular maintenance of the machine during storage can prevent quality deterioration and appearance wear. </Text>
                            </li>
                            <li>
                                <Text size="xs" c="dimmed"> If conditions are available, hydraulic-driven attachments should be stored in a dry environment. </Text>
                            </li>
                        </ul>
                    </Box>
                </Card>
                
                <Card shadow="sm" padding="lg" radius="md" withBorder mb="lg">
                    <Title order={4} mb="md">1. Inspection</Title>
                    <Table withRowBorders withColumnBorders>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th style={{ width: '50px' }}>SN</Table.Th>
                                <Table.Th>Inspection Items</Table.Th>
                                <Table.Th style={{ width: '120px', textAlign: 'center' }}>Perform or Not</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {inspectionItemsData.map((item, index) => (
                                <Table.Tr key={`inspection-${index + 1}`}>
                                    <Table.Td>{index + 1}</Table.Td>
                                    <Table.Td>{item}</Table.Td>
                                    <Table.Td>
                                        <Group justify='center'>
                                            <Checkbox
                                                {...form.getInputProps(`inspectionItems.item${index + 1}`, { type: 'checkbox' })}
                                            />
                                        </Group>
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                </Card>

                <Card shadow="sm" padding="lg" radius="md" withBorder mb="lg">
                    <Title order={4} mb="md">2. Testing</Title>
                    <Table withRowBorders withColumnBorders>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th style={{ width: '50px' }}>SN</Table.Th>
                                <Table.Th>Inspection Items</Table.Th>
                                <Table.Th style={{ width: '120px', textAlign: 'center' }}>Perform or not</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {testingItemsData.map((item, index) => (
                                <Table.Tr key={`testing-${index + 10}`}>
                                    <Table.Td>{index + 10}</Table.Td>
                                    <Table.Td>{item}</Table.Td>
                                    <Table.Td>
                                        <Group justify='center'>
                                            <Checkbox
                                                {...form.getInputProps(`testingItems.item${index + 10}`, { type: 'checkbox' })}
                                            />
                                        </Group>
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                </Card>

                <Card shadow="sm" padding="lg" radius="md" withBorder mb="lg">
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
                            {form.values.observedConditions.map((condition, index) => (
                                <Table.Tr key={index}>
                                    <Table.Td>{condition.sn}</Table.Td>
                                    <Table.Td>
                                        <Textarea
                                            placeholder="Description"
                                            autosize
                                            minRows={1}
                                            {...form.getInputProps(`observedConditions.${index}.description`)}
                                        />
                                    </Table.Td>
                                    <Table.Td>
                                        <Textarea
                                            placeholder="Remarks"
                                            autosize
                                            minRows={1}
                                            {...form.getInputProps(`observedConditions.${index}.remarks`)}
                                        />
                                    </Table.Td>
                                    <Table.Td ta="center">
                                        <ActionIcon
                                            color="red"
                                            variant="light"
                                            onClick={() => removeObservedConditionRow(index)}
                                            disabled={form.values.observedConditions.length === 1}
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

                <Card shadow="sm" padding="lg" radius="md" withBorder mb="lg">
                    <Title order={4} mb="md">Signature</Title>
                    <Group grow mb="md">
                        <Select
                            label="Inspector Signature"
                            placeholder="Select Inspector"
                            clearable
                            searchable
                            data={technicians}
                            {...form.getInputProps('signatureInspectorName')}
                        />
                        <DateInput
                            label="Date"
                            placeholder="Select Date"
                            {...form.getInputProps('signatureInspectorDate')}
                            rightSection={<IconCalendar size={16} />}
                        />
                    </Group>
                    <Group grow>
                        <Select
                            label="Supervisor Signature"
                            placeholder="Select Supervisor"
                            clearable
                            searchable
                            data={approvers}
                            {...form.getInputProps('supervisorName')}
                        />
                        <DateInput
                            label="Date"
                            placeholder="Select date"
                            {...form.getInputProps('supervisorDate')}
                            rightSection={<IconCalendar size={16} />}
                        />
                    </Group>
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
};