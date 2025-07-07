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
} from '@mantine/core';
import { useForm } from '@mantine/form';

export function UnitArrivalChecklistForm() {
    
    const checklistData = {
        chassisAndCab: [
            { id: '1', label: 'Check cabin and surround condition' },
            { id: '2', label: 'Check front and rear towing condition' },
            { id: '3', label: 'Check VIN and Engine Number' },
            { id: '4', label: 'Check front windscreen and window glass condition' },
            { id: '5', label: 'Check ID and rear view mirror, front view mirror' },
            { id: '6', label: 'Check all lamps condition' },
            { id: '7', label: 'Check the L/R & RR Footstep, mudguard, and front Grille' },
            { id: '8', label: 'Check the wiper, sun roof, and Unit Logo (emblem)' },
        ],
        axleSpringTyre: [
            { id: '1', label: 'Check all tires condition, including spare tyre' },
            { id: '2', label: 'Check all Axle (front, middle, and rear)' },
            { id: '3', label: 'Check all front and rear spring condition' },
            { id: '4', label: 'Check all tires condition, including spare tyre' },
        ],
        battery: [
            { id: '1', label: 'Check Battery Condition using Battery analyzer' },
            { id: '2', label: 'Check battery electrolyte and the Voltage' },
        ],
        electrical: [
            { id: '1', label: 'Check all Lighting condition (headlamp, tail lamp, strobe)' },
            { id: '2', label: 'Check stop lamp, reverse lamp, and alarm function' },
            { id: '3', label: 'Check strobe lamp, headlamp, and tail lamp function' },
            { id: '4', label: 'Check all gauges, pilot lamp, and display function' },
            { id: '5', label: 'Check Electrical Power and Horn' },
            { id: '6', label: 'Check headlamp protection' },
        ],
        additionalEquipment: [
            { id: '1', label: 'Check Safety Belt, Tools Kit, Operator Manual, Hyd. Jack' },
            { id: '2', label: 'Check the key, Fuel tank condition' },
            { id: '3', 'label': 'Check Tachograph and Radio' },
        ],
        functionalCheck: [
            { id: '1', label: 'Engine running test' },
            { id: '2', label: 'Test braking system, front, rear, and Parking brake' },
            { id: '3', label: 'Test steering function' },
            { id: '4', label: 'Test Display function and error code' },
        ],
    };

    const form  = useForm({
        initialValues: (() => {
            const initial = {};
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
            <Title order={1} my="lg">Unit Arrival Check List</Title>

            <form onSubmit={form.onSubmit(handleSubmit)}>
                {renderChecklistSection('Chassis & Cab', checklistData.chassisAndCab)}
                {renderChecklistSection('Axle, Spring, and Tyre', checklistData.axleSpringTyre, 4, 1)}
                {renderChecklistSection('Battery', checklistData.battery, 2, 1)}
                {renderChecklistSection('Electrical Check', checklistData.electrical, 3, 1)}
                {renderChecklistSection('Additional Equipment Check', checklistData.additionalEquipment, 3, 1)}
                {renderChecklistSection('Functional Check', checklistData.functionalCheck, 2, 1)}
            </form>

            <Group justify="flex-end" mt="md">
                <Button type="submit">Submit Checklist</Button>
            </Group>
        </Box>
    );
};