"use client";

import React, { useState, useEffect } from "react";
import {
    TextInput,
    Button,
    Stack,
    Text,
    Grid,
    Group,
    Card,
    Title,
    Box,
    Select,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Dropzone, MIME_TYPES } from "@mantine/dropzone";
import { useForm } from '@mantine/form';
import { rem } from "@mantine/core";
import { IconUpload, IconFile, IconX, IconCalendar } from "@tabler/icons-react";
import { DateInput } from "@mantine/dates";

export function KHODocumentUploadForm() {
    const [brands, setBrands] = useState([]);
    const [unitModels, setUnitModels] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [provinces, setProvinces] = useState([]); 
    const [dealerCode, setDealerCode] = useState('');

    const form = useForm({
        initialValues: {
            dealerCode: null,
            customerName: null,
            location: null,
            brand: null,
            typeModel: null,
            vinNumber: '',
            bastDate: null,
            pdfDocument: null,
        },
        validate: {
            dealerCode: (value) => (value ? null : "Dealer Code is Required!"),
            customerName: (value) => (value ? null : "Customer Name is Required!"),
            location: (value) => (value ? null : "Location is Required!"),
            brand: (value) => (value ? null : "Brand is Required!"),
            typeModel: (value) => (value ? null : "Type/Model is Required!"),
            vinNumber: (value) => (value ? null : "VIN Number is Required!"),
            bastDate: (value) => (value ? null : "BAST Date is Required!"),
            pdfDocument: (value) => (value ? null : "PDF Document is Required!"),
        },
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch data for brands
                const brandResponse = await fetch(`http://127.0.0.1:5000/api/unit-types/brands`);
                if (!brandResponse.ok) throw new Error(`HTTP error! status: ${brandResponse.status}`);
                const brandData = await brandResponse.json();
                const formattedBrands = brandData.map(item => ({ value: item.value, label: item.label }));
                setBrands(formattedBrands);

                // Fetch data for customers
                const customerResponse = await fetch(`http://127.0.0.1:5000/api/customers`);
                if (!customerResponse.ok) throw new Error(`HTTP error! status: ${customerResponse.status}`);
                const customerData = await customerResponse.json();
                const formattedCustomers = customerData.map(item => ({ value: item.CustomerID, label: item.CustomerName }));
                setCustomers(formattedCustomers);

                // Fetch data for provinces
                const provincesResponse = await fetch("http://127.0.0.1:5000/api/provinces");
                if (!provincesResponse.ok) throw new Error(`HTTP error! status: ${provincesResponse.status}`);
                const provincesData = await provincesResponse.json();
                setProvinces(provincesData);

                // delaer Code
                setDealerCode([{ value: "30479-ITR", label: "30479 - PT. Indo Traktor Utama" }]);

            } catch (error) {
                console.error("Failed to fetch initial data:", error);
                notifications.show({
                    title: "Error Loading Data",
                    message: "Failed to load initial data. Please try again!",
                    color: "red",
                });
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const selectedBrand = form.values.brand;
        if (selectedBrand) {
            const fetchModel = async () => {
                try {
                    const modelResponse = await fetch(`http://127.0.0.1:5000/api/unit-types/${selectedBrand}`);
                    if (!modelResponse.ok) throw new Error(`HTTP error! status: ${modelResponse.status}`);
                    const modelData = await modelResponse.json();
                    const formattedModels = modelData.map(item => ({ value: item.value, label: item.label }));
                    setUnitModels(formattedModels);
                } catch (error) {
                    console.error("Failed to Fetch Unit Types:", error);
                    notifications.show({
                        title: "Error Loading Data",
                        message: "Failed to load Unit Types. Please try again!",
                        color: "red",
                    });
                    setUnitModels([]);
                }
            };
            fetchModel();
        } else {
            setUnitModels([]);
        }
    }, [form.values.brand]);

    const handleBrandChange = (brandValue) => {
        form.setFieldValue('brand', brandValue);
        form.setFieldValue('typeModel', null); 
    };

    const handleSubmit = async (values) => {
        const token = localStorage.getItem("access_token");
        
        if (!token) {
            notifications.show({
                title: "Authentication Error",
                message: "Please log in again. Authentication token is missing.",
                color: "red",
            });
            console.log("Authentication token is missing.");
            return;
        }

        const formData = new FormData()

        const unitInfoPayload = {
            dealerCode: values.dealerCode,
            customerName: values.customerName,
            location: values.location,
            brand: values.brand,
            typeModel: values.typeModel,
            vinNumber: values.vinNumber,
            bastDate: values.bastDate,
        };
    
        formData.append('unitInfo', JSON.stringify(unitInfoPayload));

        if (values.pdfDocument) {
            formData.append('pdfDocument', values.pdfDocument);
        }

        try {
            const response = await fetch(`http://127.0.0.1:5000/api/kho-document/submit`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to submit form");
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

    const handleDrop = (files) => {
        if (files.length > 0) {
            form.setFieldValue('pdfDocument', files[0]);
        }
    };

    const handleReject = (files) => {
        notifications.show({
            title: 'File Rejected',
            message: files[0].errors[0].message,
            color: 'red',
        });
    };

    return (
        <Box maw="100%" mx="auto" px="md">
            <Title
                order={1}
                mt="md"
                mb="lg"
                style={{ color: '#000000 !important' }}
            > Key Hand Over Document Upload
            </Title>

            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Card shadow="sm" p="xl" withBorder mb="lg">
                    <Title order={3} mb="md"> Unit Information </Title>
                    <Grid gutter="xl">
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <Select
                                label="Dealer"
                                placeholder="Select Dealer"
                                data={dealerCode}
                                searchable
                                {...form.getInputProps('dealerCode')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <Select
                                label="Customer Name"
                                placeholder="Select Customer"
                                data={customers}
                                searchable
                                clearable
                                {...form.getInputProps('customerName')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <Select
                                label="Location"
                                placeholder="Select Location (by Province)"
                                data={provinces}
                                searchable
                                clearable
                                {...form.getInputProps('location')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <Select
                                label="Brand"
                                placeholder="Select Brand"
                                clearable
                                data={brands}
                                onChange={handleBrandChange}
                                value={form.values.brand}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <Select
                                label="Type/ Model"
                                placeholder="Select Model"
                                searchable
                                data={unitModels}
                                {...form.getInputProps('typeModel')}
                                disabled={!form.values.brand}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <TextInput
                                label="VIN"
                                placeholder="Input VIN Number"
                                {...form.getInputProps('vinNumber')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <DateInput
                                label="BAST Date"
                                placeholder="Select Date"
                                leftSection={<IconCalendar size={18} />}
                                {...form.getInputProps('bastDate')}
                            />
                        </Grid.Col>
                    </Grid>
                </Card>

                <Card shadow="sm" p="xl" withBorder mb="lg">
                    <Title order={3} mb="md"> Upload Document </Title>
                    <Dropzone
                        onDrop={handleDrop}
                        onReject={handleReject}
                        maxFiles={1}
                        accept={[MIME_TYPES.pdf]}
                        error={form.errors.pdfDocument}
                        style={{ borderColor: form.errors.pdfDocument ? 'red' : undefined }}
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
                                <Text size="xs" c="dimmed">
                                    {form.values.pdfDocument ? form.values.pdfDocument.name : 'Drag and drop PDF here or click to select'}
                                </Text>
                                <Text size="xs" c="dimmed">Accepted format: PDF</Text>
                            </Stack>
                        </Group>
                    </Dropzone>
                    {form.errors.pdfDocument && (
                        <Text size="sm" c="red" mt={5}>
                            {form.errors.pdfDocument}
                        </Text>
                    )}
                </Card>

                <Group justify="flex-end" mt="md">
                    <Button type="submit">Submit</Button>
                </Group>
            </form>
        </Box>
    );
}

export default KHODocumentUploadForm;