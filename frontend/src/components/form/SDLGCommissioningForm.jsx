"use client";

import React, { useEffect, useState } from 'react';
import {
    TextInput,
    Button,
    Group,
    Box,
    Checkbox,
    Title,
    Divider,
    Table,
    Card,
    Grid,
    Select,
    Loader,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconCalendar } from '@tabler/icons-react';
import apiClient from '@/libs/api';

const SDLG_CHECKLIST_ITEMS = [
    // Check of Documents (4 items)
    "Check Documents According to Packing List of Complete Machine",
    "Check That Documents With the Complete Machine are Complete",
    "Check That Tools With the Complete Machine are Complete",
    "Check That the Documents and Tools With the Engine are Complete",

    // Check of the Complete Machine (22 items → total jadi 26)
    "Check That the Equipment of Complete Machine is in Good Condition",
    "Check That Oil Level and Fluid Level of the Complete Machine are Normal",
    "Check Engine Oil Level",
    "Transmission Oil Level",
    "Drive Axle Oil Level",
    "Brake System Oil Level",
    "Coolant Liquid Level",
    "Hydraulic Oil Level",
    "Check That the Hub Nuts are Tight",
    "Check That Connecting Bolts of Drive Shaft are Tight",
    "Check That Bolts in Other Important Positions (such as working mechanism) are Tight",
    "Check That Each Lubrication Point is Greased as Specified.",
    "Check That the Engine Speed is Normal",
    "Check That Readings in Each Gauge are Normal",
    "Check That the Steering System Works Normally",
    "Check That Any Oil, Water or Gas is Leaking",
    "Check That the Working Systems Work Normally",
    "Check That the Traveling Mechanism Works Normally",
    "Check That the Electrical System Works Normally",
    "Check That the Control System Works Normally",
    "Check That the Service Braking System and the Parking Braking System Work Normally",
    "Check That Other Parts Work Normally",
];

export default function SDLGCommissioningForm() {
    const [unitModels, setUnitModels] = useState([]);
    const [woNumbers, setWoNumbers] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [approvers, setApprovers] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    const form = useForm({
        initialValues: {
            machineModel: null,
            vehicleNumber: "",
            woNumber: null,
            inspectionDate: null,
            customer: null,
            inspector: null,
            approvalBy: null,
            checklistItems: SDLG_CHECKLIST_ITEMS.map((_, i) => false),
        },

        validate: {
            woNumber: (value) => (value ? null: 'WO Number is Required!'),
            machineModel: (value) => (value ? null: 'Type/ Model is Required!'),
            customer: (value) => (value ? null: 'Customer is Required!'),
            vehicleNumber: (value) => (value ? null: 'VIN is Required!'),
            inspectionDate: (value) => (value ? null: 'Inspection Date is Required!'),
            inspector: (value) => (value ? null: 'Technician is Required!'),
            approvalBy: (value) => (value ? null: 'Approval By is Required!'),
        }
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const brandId = "SDLG"; // 'SDLG' for SDLG
                const groupId = "COMM"; // 'COMM' for Commissioning
                const [
                    modelRes,
                    woRes,
                    customerRes,
                    techRes,
                    supervisorRes,
                    techHeadRes,
                ] = await Promise.all([
                    apiClient.get(`/unit-types/${brandId}`),
                    apiClient.get(`/work-orders?brand_id=${brandId}&group_id=${groupId}`),
                    apiClient.get("/customers"),
                    apiClient.get("/users/by-role/Technician"),
                    apiClient.get("/users/by-role/Supervisor"),
                    apiClient.get("/users/by-role/Technical Head")
                ])

                setUnitModels(modelRes.data);
                setWoNumbers(woRes.data.map(wo => ({ value: wo.WONumber, label: wo.WONumber })));
                setCustomers(customerRes.data.map((customer => ({ value: customer.CustomerID, label: customer.CustomerName }))));
                setTechnicians(techRes.data);
                setApprovers([
                    ...supervisorRes.data,
                    ...techHeadRes.data,
                ]);
                

            } catch (error) {
                console.error("Failed to fetch data:", error);
                notifications.show({
                    title: "Error Loading Data",
                    message: "Failed to load form data. Please try again!",
                    color: "red",
                });
            
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

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
            const token = localStorage.getItem('access_token');
            if (!token) {
                notifications.show({
                    title: "Authentication Required",
                    message: "Please log in again. Authentication token is missing.",
                    color: "red",
                });
                return;
            } if (!token) {
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
                    typeModel: values.machineModel,
                    VIN: values.vehicleNumber,
                    dateOfCheck: formatDate(values.inspectionDate),
                    customer: values.customer,
                    technician: values.inspector,
                    approvalBy: values.approvalBy,
                },
                checklistItems: values.checklistItems.map((status, index) => ({
                    id: index + 1,
                    status: status ? 1 : 0,
                    itemName: SDLG_CHECKLIST_ITEMS[index],
                })),
            };

            console.log("Payload sent to backend:", payload);

            const response = await apiClient.post(`/commissioning/sdlg/submit`, payload);

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
                <Title order={1} mt="md" mb="lg">Loading Form Data...</Title>
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
                style={{ color: 'var(--mantine-color-text)' }}
            > 
                Commissioning Form
            </Title>

            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Card shadow="sm" p="xl" withBorder mb="lg">
                    <Title order={3} mb="md"> Unit Information </Title>
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
                                placeholder="Select date"
                                {...form.getInputProps('inspectionDate')}
                                rightSection={<IconCalendar size={16} />}
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
                                label="Technician"
                                placeholder="Select Technician"
                                clearable
                                searchable
                                data={technicians}
                                {...form.getInputProps('inspector')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, md: 3 }}>
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
                </Card>

                <Card shadow="sm" padding="lg" radius="md" withBorder mb="lg">
                    <Title order={4} mb="md">SDLG Commissioning Checklist</Title>
                    <Table withRowBorders withColumnBorders>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th style={{ width: '50px' }}>SN</Table.Th>
                                <Table.Th>Inspection Items</Table.Th>
                                <Table.Th style={{ width: '120px', textAlign: 'center' }}>Perform or not</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {SDLG_CHECKLIST_ITEMS.map((item, index) => (
                                <Table.Tr key={index}>
                                    <Table.Td>{index + 1}</Table.Td>
                                    <Table.Td>{item}</Table.Td>
                                    <Table.Td>
                                        <Group justify="center">
                                            <Checkbox
                                                {...form.getInputProps(`checklistItems.${index}`, { type: 'checkbox' })}
                                            />
                                        </Group>
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                </Table>
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
    )
}