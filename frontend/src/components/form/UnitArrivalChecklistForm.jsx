'use client';

import { useState } from "react";
import {
    Box,
    Title,
    Text,
    TextInput,
    Textarea,
    Grid,
    Card,
    Button,
    Group,
    Stack,
    Radio,
    Select,
} from '@mantine/core';
import { useForm } from '@mantine/form';

export function UnitArrivalChecklistForm() {
    
    // Dummy for Type/Model
    const dummyModels = [
        { value: 'range-t', label: 'Range T' },
        { value: 'c-range', label: 'C Series' },
        { value: 'k-series', label: 'K Series' },
        { value: 'premium', label: 'Premium' }
    ]

    const checklistData = {
        chassisAndCab: [
            { id: '1', label: 'Check Cabin and Surround Condition' },
            { id: '2', label: 'Check Front and Rear Towing Condition' },
            { id: '3', label: 'Check VIN and Engine Number' },
            { id: '4', label: 'Check Front Windscreen and Window Glass Condition' },
            { id: '5', label: 'Check ID and Rear View Mirror, Front View Mirror' },
            { id: '6', label: 'Check All Lamps Condition' },
            { id: '7', label: 'Check the L/R & RR Footstep, Mudguard, and Front Grille' },
            { id: '8', label: 'Check the Wiper, Sunroof, and Unit Logo (Emblem)' },
        ],
        axleSpringTyre: [
            { id: '1', label: 'Check All Tires Condition, Including Spare Tyre' },
            { id: '2', label: 'Check All Axle (Front, Middle, and Rear)' },
            { id: '3', label: 'Check All Front and Rear Spring Condition' },
            { id: '4', label: 'Check All Tires Condition, Including Spare Tyre' },
        ],
        battery: [
            { id: '1', label: 'Check Battery Condition Using Battery Analyzer' },
            { id: '2', label: 'Check Battery Electrolyte and the Voltage' },
        ],
        electrical: [
            { id: '1', label: 'Check All Lighting Condition (Headlamp, Tail Lamp, Strobe)' },
            { id: '2', label: 'Check Stop Lamp, Reverse Lamp, and Alarm Function' },
            { id: '3', label: 'Check Strobe Lamp, Headlamp, and Tail Lamp Function' },
            { id: '4', label: 'Check All Gauges, Pilot Lamp, and Display Function' },
            { id: '5', label: 'Check Electrical Power and Horn' },
            { id: '6', label: 'Check Headlamp Protection' },
        ],
        additionalEquipment: [
            { id: '1', label: 'Check Safety Belt, Tools Kit, Operator Manual, Hyd. Jack' },
            { id: '2', label: 'Check the Key, Fuel Tank Condition' },
            { id: '3', label: 'Check Tachograph and Radio' },
        ],
        functionalCheck: [
            { id: '1', label: 'Engine Running Test' },
            { id: '2', label: 'Test Braking System, Front, Rear, and Parking Brake' },
            { id: '3', label: 'Test Steering Function' },
            { id: '4', label: 'Test Display Function and Error Code' },
        ],
    };

    const form  = useForm({
        initialValues: (() => {
            const initial = {
                brand: '',
                typeModel: null,
                vin: '',
                noChassis: '',
                noEngine: '',
            };
            Object.keys(checklistData).forEach(sectionKey => {
                checklistData[sectionKey].forEach(item => {
                    // default status as string
                    initial[`${sectionKey}_${item.id}_status`] = '';
                    initial[`${sectionKey}_${item.id}_remarks`] = '';
                });
            });
            return initial;
        })(),
    });

    const handleSubmit = (values) => {
        console.log('Form Submitted:', values);
        alert('Form Submitted!');
    };

    const  renderChecklistSection =  (sectionTitle, items, columns=4, rows=2) => {
        const sectionKeyClean = sectionTitle.toLowerCase().replace(/\s|\&/g, '');

        return (
            <Card shadow="sm" padding="lg" radius="md" withBorder mb="lg">
                <Title order={3} mb="md">{sectionTitle}</Title>
                <Grid gutter="xl">
                    {items.map((items, index) => {
                        const statusFieldName = `${sectionKeyClean}_${items.id}_status`;
                        const remarksFieldName = `${sectionKeyClean}_${items.id}_remarks`;

                        return (
                            <Grid.Col span={{ base: 12, sm: 6, md: 3 }} key={items.id}>
                                <Stack gap="xs">
                                    <Text size="sm" weight={500}>{`${index + 1}. ${items.label}`}</Text>

                                    {/* Radio.Group for Status */}
                                    <Radio.Group
                                        description="Select one option"
                                        {...form.getInputProps(statusFieldName)}>
                                        <Group mt="xs">
                                            <Radio value="checked_with_remarks" label="Checked, With Remarks" />
                                            <Radio value="checked_without_remarks" label="Checked, Without Remarks" />
                                        </Group>
                                    </Radio.Group>

                                    {/* Textarea for Remarks, will be seen if "Checked, With Remarks" is choosen */}
                                    {form.values[statusFieldName] === 'checked_with_remarks' && (
                                        <Textarea
                                            placeholder="Enter remarks here"
                                            rows={rows}
                                            autosize
                                            minRows={rows}
                                            maxRows={4}
                                            {...form.getInputProps(remarksFieldName)}
                                        />
                                    )}
                                </Stack>
                            </Grid.Col>
                        );
                    })}
                </Grid>
            </Card>
        );
    };

    return (
        <Box maw="100%" mx="auto" px="md">
            <Title order={1} mt="md" mb="lg" c="black">Unit Arrival Check List</Title>
            <form onSubmit={form.onSubmit(handleSubmit)}>
            <Card shadow="sm" padding="lg" radius="md" withBorder mb="lg">
                <Title order={3} mb="md" c="black">Unit Information</Title>
                <Grid gutter="xl">
                    <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                        <Select
                            label="Type/ Model"
                            placeholder="Select a Model"
                            data={dummyModels}
                            searchable
                            clearable
                            {...form.getInputProps('typeModel')}
                            //custome render option
                            renderOption={({ option, checked }) => (
                                <Text c="black">{option.label}</Text>
                            )}
                        />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                        <TextInput
                            label="No. Chassis"
                            placeholder="Input a Chassis Number"
                            {...form.getInputProps('noChassis')}
                        />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                        <TextInput
                            label="No. Engine"
                            placeholder="Input a Engine Number"
                            {...form.getInputProps('noEngine')}
                        />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                        <TextInput
                            label="VIN"
                            placeholder="Input a VIN Number"
                            {...form.getInputProps('vin')}
                        />
                    </Grid.Col>
                </Grid>
            </Card>
                    {renderChecklistSection('Chassis & Cab', checklistData.chassisAndCab)}
                    {renderChecklistSection('Axle, Spring, and Tyre', checklistData.axleSpringTyre, 4, 1)}
                    {renderChecklistSection('Battery', checklistData.battery, 2, 1)}
                    {renderChecklistSection('Electrical Check', checklistData.electrical, 3, 1)}
                    {renderChecklistSection('Additional Equipment Check', checklistData.additionalEquipment, 3, 1)}
                    {renderChecklistSection('Functional Check', checklistData.functionalCheck, 2, 1)}
                <Group justify="flex-end" mt="md">
                    <Button type="submit">Submit Checklist</Button>
                </Group>
            </form>
        </Box>
    );
};