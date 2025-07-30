"use client";

import React from 'react';
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
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconTrash } from '@tabler/icons-react';

export default function SDLGStorageMaintenanceForm() {
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
            },

            // third part - record all observed condition
            observedConditions: [{ sn: 1, description: '', remarks: '' }],

            // supervisor parts
            inspectorSignature: '',
            inspectorDate: null,
            supervisorName: '',
            supervisorSignature: '',
            supervisorDate: null,
        },

        validate: {
            machineModel: (value) => (value ? null: 'Machine Model is Required!'),
            vehicleNumber: (value) => (value ? null: 'Vehicle Number/ VIN is Required!'),
            workingHours: (value) => (value ? null: 'Working Hours are Required!'),
            vehicleArrivalDate: (value) => (value ? null: 'Vehicle Arrival Date is Required!'),
            inspectionDate: (value) => (value ? null: 'Inspection Date is Required!'),
            inspector: (value) => (value ? null: 'Inspector Name is Required!'),
            supervisorName: (value, values) => (values.supervisorDate ? (value ? null : 'Supervisor name is required if date is filled') : null),
            supervisorDate: (value, values) => (values.supervisorName ? (value ? null : 'Supervisor date is required if name is filled') : null),
        }
    });

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

    const handleSubmit = (values) => {
        console.log("Form submitted with values:", values);
        notifications.show({
            title: 'Form Submitted Successfully',
            message: 'Inspection and maintenance data has been successfully sent.',
            color: 'green',
        });

        // api connection later
    };

    return (
        <Box maw="100%" mx="auto" px="md">
            <Title order={1} ta="left" mt="md" mb="lg">
                Storage Maintenance List
            </Title>
            <Paper p="md" shadow="xs">
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <Box mb="xl">
                        <Title order={4} mb="md"> Vehicle Information </Title>
                        <Group grow mb="md">
                            <TextInput
                                label="Machine Model"
                                placeholder="Enter Machine Model"
                                {...form.getInputProps('machineModel')}
                                onChange={(event) => {
                                    form.setFieldValue('machineModel', event.currentTarget.value);
                                    
                                }}
                            />
                            <TextInput
                                label="Vehicle Number"
                                placeholder="Enter vehicle number"
                                {...form.getInputProps('vehicleNumber')}
                                onChange={(event) => {
                                    form.setFieldValue('vehicleNumber', event.currentTarget.value);
                                }}
                            />
                            <TextInput
                                label="Working Hours"
                                placeholder="Enter working hours"
                                {...form.getInputProps('workingHours')}
                                onChange={(event) => {
                                    form.setFieldValue('workingHours', event.currentTarget.value);
                                }}
                            />
                        </Group>
                        <Group grow>
                            <DateInput
                                label="Vehicle Arrival Date"
                                placeholder="Select date"
                                valueFormat="DD/MM/YYYY"
                                {...form.getInputProps('vehicleArrivalDate')}
                                onChange={(value) => {
                                    form.setFieldValue('vehicleArrivalDate', value);
                                }}
                            />
                            <DateInput
                                label="Inspection Date"
                                placeholder="Select date"
                                valueFormat="DD/MM/YYYY"
                                {...form.getInputProps('inspectionDate')}
                                onChange={(value) => {
                                    form.setFieldValue('inspectionDate', value);
                                }}
                            />
                            <TextInput
                                label="Inspector"
                                placeholder="Inspector name"
                                {...form.getInputProps('inspector')}
                                onChange={(event) => {
                                    form.setFieldValue('inspector', event.currentTarget.value);
                                }}
                            />
                        </Group>
                        <Text size="xs" c="dimmed" mt="md">
                            <Text component="span" fw={700}>Important:</Text> Please follow the safety instructions in the machine operation and maintenance manual. This inspection form is applicable for the maintenance of stock vehicles. For vehicles that have been in stock for more than 3 months, inspections should be conducted monthly according to this form.
                        </Text>
                        <Text size="xs" c="dimmed" mt="xs">
                            <ul style={{ listStyleType: 'disc', marginLeft: '20px' }}>
                                <li>Regular maintenance of the machine during storage can prevent quality deterioration and appearance wear.</li>
                                <li>If conditions are available, hydraulic-driven attachments should be stored in a dry environment.</li>
                            </ul>
                        </Text>
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
                                                    onChange={(event) => {
                                                        form.setFieldValue(`inspectionItems.item${index + 1}`, event.currentTarget.checked);
                                                    }}
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
                                                    onChange={(event) => {
                                                        form.setFieldValue(`testingItems.item${index + 10}`, event.currentTarget.checked);
                                                    }}
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
                                                onChange={(event) => {
                                                    form.setFieldValue(`observedConditions.${index}.description`, event.currentTarget.value);
                                                }}
                                            />
                                        </Table.Td>
                                        <Table.Td>
                                            <Textarea
                                                placeholder="Remarks"
                                                autosize
                                                minRows={1}
                                                {...form.getInputProps(`observedConditions.${index}.remarks`)}
                                                onChange={(event) => {
                                                    form.setFieldValue(`observedConditions.${index}.remarks`, event.currentTarget.value);
                                                }}
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
                            <TextInput
                                label="Inspector"
                                placeholder="Inspector Name"
                                {...form.getInputProps('inspectorSignature')}
                                onChange={(event) => {
                                    form.setFieldValue('inspectorSignature', event.currentTarget.value);
                                }}
                            />
                            <DateInput
                                label="Date"
                                placeholder="Select date"
                                valueFormat="DD/MM/YYYY"
                                {...form.getInputProps('inspectorDate')}
                                onChange={(value) => {
                                    form.setFieldValue('inspectorDate', value);
                                }}
                            />
                        </Group>
                        <Group grow>
                            <TextInput
                                label="Supervisor"
                                placeholder="Supervisor Name"
                                {...form.getInputProps('supervisorName')}
                                onChange={(event) => {
                                    form.setFieldValue('supervisorName', event.currentTarget.value);
                                }}
                            />
                            <DateInput
                                label="Date"
                                placeholder="Select date"
                                valueFormat="DD/MM/YYYY"
                                {...form.getInputProps('supervisorDate')}
                                onChange={(value) => {
                                    form.setFieldValue('supervisorDate', value);
                                }}
                            />
                        </Group>
                    </Box>
                    <Group justify="flex-end" mt="xl">
                        <Button type="submit">
                            Submit Form
                        </Button>
                    </Group>
                </form>
            </Paper>
        </Box>
    );
}