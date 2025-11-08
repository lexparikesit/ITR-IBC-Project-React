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
    Loader,
    Alert,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Dropzone, MIME_TYPES } from "@mantine/dropzone";
import { useForm } from '@mantine/form';
import { rem } from "@mantine/core";
import { IconUpload, IconFile, IconX, IconCalendar, IconRefresh } from "@tabler/icons-react";
import { DateInput } from "@mantine/dates";
import { PDFDocument } from 'pdf-lib';
import apiClient from '@/libs/api';

const MAX_FILE_SIZE = 2 * 1024 * 1024;

export function KHODocumentUploadForm() {
    const [brands, setBrands] = useState([]);
    const [unitModels, setUnitModels] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [provinces, setProvinces] = useState([]); 
    const [dealerCode, setDealerCode] = useState('');
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [retryMode, setRetryMode] = useState(false);

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
                const [
                    brandRes,
                    customerRes,
                    provinceRes
                ] = await Promise.all([
                    apiClient.get('/unit-types/brands'),
                    apiClient.get('/customers'),
                    apiClient.get('/provinces')
                ]);
                setBrands(brandRes.data.map(item => ({ value: item.value, label: item.label })));
                setCustomers(customerRes.data.map(item => ({ value: item.CustomerID, label: item.CustomerName })));
                
                const provinceObject = provinceRes.data;

                if (typeof provinceObject === 'object' && provinceObject !== null) {
                    const provinceArray = Object.keys(provinceObject).map((code) => ({
                        value: code,
                        label: provinceObject[code],
                    }));
                    setProvinces(provinceArray);
                } else {
                    console.log("Invalid provinces response:", provinceObject);
                    setProvinces([]);
                };

                // delaer Code
                setDealerCode([{ value: "30479-ITR", label: "30479 - PT. Indo Traktor Utama" }]);

            } catch (error) {
                console.error("Failed to fetch initial data:", error);
                notifications.show({
                    title: "Error Loading Data",
                    message: "Failed to load initial data. Please try again!",
                    color: "red",
                });

            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const selectedBrand = form.values.brand;
        
        if (selectedBrand) {
            const fetchModel = async () => {
                try {
                    const res = await apiClient.get(`/unit-types/${selectedBrand}`);
                    setUnitModels(res.data.map(item => ({ value: item.value, label: item.label })));
                
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

    const compressPDF = async (file) => {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            const compressedPdfBytes = await pdfDoc.save({
                useObjectStreams: false,
                addDefaultPage: false,
                compress: true,
            });

            const blob = new Blob([compressedPdfBytes], { type: 'application/pdf' });
            const compressedFile = new File([blob], file.name, { type: 'application/pdf' });

            if (compressedFile.size <= MAX_FILE_SIZE) {
                return compressedFile;
            
            } else {
                notifications.show({
                    title: "Compression Warning",
                    message: "File is still larger than 2MB after compression. Uploading anyway.",
                    color: "yellow",
                });
                return compressedFile;
            }

        } catch (err) {
            console.error("PDF compression failed:", err);
            notifications.show({
                title: "Compression Failed",
                message: "Could not compress PDF. Please use a smaller file.",
                color: "red",
            });
            return file
        }
    };

    const handleDrop = async (files) => {
        if (files.length === 0) return;

        const file = files[0];

        if (file.size > MAX_FILE_SIZE) {
            notifications.show({
                title: "File Too Large",
                message: `File size exceeds 2MB. Compressing...`,
                color: "yellow",
            });
            const compressed = await compressPDF(file);
            form.setFieldValue('pdfDocument', compressed);
        } else {
            form.setFieldValue('pdfDocument', file);
        }
    };

    const handleReject = (files) => {
        notifications.show({
            title: 'File Rejected',
            message: files[0].errors[0].message,
            color: 'red',
        });
    };

    const handleSubmit = async (values) => {
        if (retryMode) {
            setRetryMode(false);
        }

        const formData = new FormData();
        const unitInfoPayload = {
            dealerCode: values.dealerCode,
            customerName: values.customerName,
            location: values.location,
            brand: values.brand,
            typeModel: values.typeModel,
            vinNumber: values.vinNumber,
            bastDate: values.bastDate ? new Date(values.bastDate).toISOString().split('T')[0] : null,
        };

        formData.append('unitInfo', JSON.stringify(unitInfoPayload));
        
        if (values.pdfDocument) {
            formData.append('pdfDocument', values.pdfDocument);
        }

        setUploading(true);
        
        try {
            await apiClient.post('/kho-document/submit', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            notifications.show({
                title: "Submission Successful!",
                message: "Form submitted successfully.",
                color: "green",
            });
            form.reset();

        } catch (error) {
            console.error('Submission error:', error);
            setRetryMode(true);
            notifications.show({
                title: "Submission Failed",
                message: error.response?.data?.message || "An error occurred during submission.",
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
                style={{ color: '#000000 !important' }}
            > 
                Key Hand Over Document Upload
            </Title>

            {retryMode && (
                <Alert
                    color="red"
                    title="Upload Failed"
                    mb="md"
                    withCloseButton
                    onClose={() => setRetryMode(false)}
                >
                    <Group justify="space-between" align="center">
                        <Text size="sm">Please check your connection and try again.</Text>
                        <Button
                            leftSection={<IconRefresh size={16} />}
                            onClick={() => form.onSubmit(handleSubmit)()}
                            size="xs"
                            variant="light"
                        >
                            Retry
                        </Button>
                    </Group>
                </Alert>
            )}

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
                        maxSize={MAX_FILE_SIZE}
                        accept={[MIME_TYPES.pdf]}
                        error={form.errors.pdfDocument}
                        disabled={uploading}
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
                                    {form.values.pdfDocument
                                        ? form.values.pdfDocument.name
                                        : 'Drag and drop PDF here or click to select'}
                                </Text>
                                <Text size="xs" c="dimmed">Accepted format: PDF (Max 2MB)</Text>
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
}

export default KHODocumentUploadForm;