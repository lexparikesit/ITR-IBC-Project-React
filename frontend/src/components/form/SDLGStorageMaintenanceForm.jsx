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
    Paper,
    Divider,
    Table,
    ActionIcon,
    Select,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconTrash } from '@tabler/icons-react';

export default function SDLGStorageMaintenanceForm() {
    const [machineModelsData, setMachineModelsData] = useState([]);
    const [inspectorData, setInspectorData] = useState([]);
    const [supervisorData, setSupervisorData] = useState([]);
    
    const form = useForm({
        initialValues: {
            machineModel: '',
            vehicleNumber: '',
            workingHours: '',
            vehicleArrivalDate: null,
            inspectionDate: null,
            inspector: '',

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
            signatureInspectorName: '',
            signatureInspectorDate: null,
            supervisorName: '',
            supervisorDate: null,
        },

        validate: {
            machineModel: (value) => (value ? null: 'Machine Model is Required!'),
            vehicleNumber: (value) => (value ? null: 'Vehicle Number/ VIN is Required!'),
            workingHours: (value) => (value ? null: 'Working Hours are Required!'),
            vehicleArrivalDate: (value) => (value ? null: 'Vehicle Arrival Date is Required!'),
            inspectionDate: (value) => (value ? null: 'Inspection Date is Required!'),
            inspector: (value) => (value ? null: 'Inspector Name is Required!'),
            signatureInspectorName: (value) => (value ? null : 'Inspector signature is required!'),
            signatureInspectorDate: (value) => (value ? null : 'Inspector signature date is required!'),
            supervisorName: (value, values) => (values.supervisorDate ? (value ? null : 'Supervisor name is required if date is filled') : null),
            supervisorDate: (value, values) => (values.supervisorName ? (value ? null : 'Supervisor date is required if name is filled') : null),
        }
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://127.0.0.1:5000/api/unit-types/SDLG');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                const formattedModels = data
                    .filter(item => item.value !== null && item.value !== undefined && item.label !== null && item.label !== undefined) // Filter berdasarkan 'value' dan 'label'
                    .map(item => ({
                        value: item.value,
                        label: item.label
                    }));
                setMachineModelsData(formattedModels);
            } catch (error) {
                console.error("Failed to fetch machine models:", error);
                notifications.show({
                    title: "Error Loading Data",
                    message: "Failed to load machine models. Please try again!",
                    color: "red",
                });
            }

            // Set dummy data for inspectors
            const dummyInspectorData = [
                { value: "tech1", label: "John Doe" },
                { value: "tech2", label: "Jane Smith" },
                { value: "tech3", label: "Peter Jones" }
            ];
            setInspectorData(dummyInspectorData);

            // Set dummy data for approvers
            const dummySupervisorData = [
                { value: "app1", label: "Alice Brown" },
                { value: "app2", label: "Bob White" },
                { value: "app3", label: "John Green" }
            ];
            setSupervisorData(dummySupervisorData);
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
        const token = localStorage.getItem('access_token');
        console.log("DEBUG: Token from localStorage:", token);
        
        if (!token) {
            notifications.show({
                title: "Authentication Required",
                message: "Please log in again. Authentication token is missing.",
                color: "red",
            });
            return;
        }
        
        console.log("Form submitted with values:", values);

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
            vehicleNumber: values.vehicleNumber,
            workingHour: values.workingHours,
            inspector: values.inspector,

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

        console.log("Payload sent to backend:", payload);

        try {
            const response = await fetch(`http://127.0.0.1:5000/api/storage-maintenance/sdlg/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to submit SDLG Storage Maintenance Checklist");
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
        
    return (
        <Box maw="100%" mx="auto" px="md">
            <Title order={1} ta="left" mt="md" mb="lg">Storage Maintenance List</Title>
            <Paper p="md" shadow="xs">
                <form onSubmit={form.onSubmit(handleSubmit, (validationError, values) => {
                    console.error('Validation Errors:', validationError);
                    notifications.show({
                        title: "Validation Error",
                        message: "Please fill in all required fields!",
                        color: "red",
                    });
                })}>
                    <Box mb="xl">
                        <Title order={4} mb="md"> Vehicle Information </Title>
                        <Group grow mb="md">
                            <Select
                                label="Machine Model"
                                placeholder="Select a Machine Model"
                                data={machineModelsData}
                                searchable
                                clearable
                                {...form.getInputProps('machineModel')}
                            />
                            <TextInput
                                label="Vehicle Number"
                                placeholder="Input Vehicle S/N"
                                {...form.getInputProps('vehicleNumber')}
                            />
                            <TextInput
                                label="Working Hours"
                                placeholder="Input Working Hours"
                                {...form.getInputProps('workingHours')}
                            />
                        </Group>
                        <Group grow>
                            <DateInput
                                label="Vehicle Arrival Date"
                                placeholder="Select Date"
                                valueFormat="DD-MM-YYYY"
                                {...form.getInputProps('vehicleArrivalDate')}
                            />
                            <DateInput
                                label="Inspection Date"
                                placeholder="Select date"
                                valueFormat="DD-MM-YYYY"
                                {...form.getInputProps('inspectionDate')}
                            />
                            <Select
                                label="Inspector Name"
                                placeholder="Select Inspector"
                                clearable
                                searchable
                                data={inspectorData}
                                {...form.getInputProps('inspector')}
                            />
                        </Group>
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
                    </Box>
                    
                    <Divider my="xl" />
                    
                    <Box mb="xl">
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
                    </Box>
                    
                    <Divider my="xl" />

                    <Box mb="xl">
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
                    </Box>
                
                    <Divider my="xl" />

                    <Box mb="xl">
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
                    </Box>

                    <Divider my="xl" />

                    <Box>
                        <Title order={4} mb="md">Signature</Title>
                        <Group grow mb="md">
                            <Select
                                label="Inspector Signature"
                                placeholder="Select Inspector"
                                clearable
                                searchable
                                data={inspectorData}
                                {...form.getInputProps('signatureInspectorName')}
                            />
                            <DateInput
                                label="Date"
                                placeholder="Select Date"
                                valueFormat="DD-MM-YYYY"
                                {...form.getInputProps('signatureInspectorDate')}
                            />
                        </Group>
                        <Group grow>
                            <Select
                                label="Supervisor Signature"
                                placeholder="Select Supervisor"
                                clearable
                                searchable
                                data={supervisorData}
                                {...form.getInputProps('supervisorName')}
                            />
                            <DateInput
                                label="Date"
                                placeholder="Select date"
                                valueFormat="DD-MM-YYYY"
                                {...form.getInputProps('supervisorDate')}
                            />
                        </Group>
                    </Box>
                    <Group justify="flex-end" mt="xl">
                        <Button type="submit">Submit</Button>
                    </Group>
                </form>
            </Paper>
        </Box>
    );
};