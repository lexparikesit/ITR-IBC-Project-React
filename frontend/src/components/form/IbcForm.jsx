"use client";

import React, { useEffect, useState } from "react";
import {
    TextInput,
    Textarea,
    Button,
    NumberInput,
    Text,
    Grid,
    Group,
    Card,
    Title,
    Divider,
    Box,
    Table,
    Select,
    ActionIcon,
    Loader,
    Center,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { IconCalendar, IconTrash } from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import apiClient from '@/libs/api';

const initialHeaderValues = {
    Requestor: null,
    IBC_date: null,
    PO_PJB: "",
    Cust_ID: null,
    Brand_ID: null,
    UnitType: null,
    QTY: null,
    SiteOperation: "",
};

const initialDetailValues = {
    vins: [],
    AttachmentType: "",
    AttachmentSupplier: "",
    DeliveryAddress: "",
    DeliveryCustPIC: "",
    DeliveryPlan: null,
    Remarks: "",
};

const initialAccessoriesValues = {
    packages: [{ PackagesType: "", PackageDesc: "" }],
    accessories: [{ IBC_Accesories: "", Remarks: "", qty_acc: 1 }],
};

export function MultiStepIbcForm() {
    const [step, setStep] = useState(1);
    const [submittedHeader, setSubmittedHeader] = useState(null);
    const [submittedDetail, setSubmittedDetail] = useState(null);
    const [requestors, setRequestors] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [brands, setBrands] = useState([]);
    const [UnitModels, setUnitModels] = useState([]);
    const [packageTypes, setPackageTypes] = useState([]);
    const [accessoryTypes, setAccessoryTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingNext, setLoadingNext] = useState(false);

    const headerForm = useForm({
        initialValues: initialHeaderValues,
        validate: {
            Requestor: (value) => (value ? null : "Requestor is Required!"),
            IBC_date: (value) => (value ? null : "IBC Date is Required!"),
            PO_PJB: (value) => (value ? null : "PO PJB is Required!"),
            Cust_ID: (value) => (value ? null : 'Customer ID is Required!'),
            Brand_ID: (value) => (value ? null : 'Brand ID is Required!'),
            UnitType: (value) => (value ? null : 'Unit Type is Required!'),
            QTY: (value) => {
                if (!value) return "Quantity is Required!";
                if (value < 1 ) return "Quantity must be at least 1!";
                if (value > 20) return "Quantity must be at most 20!";
            },
            SiteOperation: (value) => (value ? null : "Site Operation is Required!"),
        },
    });

    const detailForm = useForm({
        initialValues: initialDetailValues,
        validate: {
            DeliveryPlan: (value) => (value ? null : "Delivery Plan is Required!"),
        },
    });

    const accessoriesForm = useForm({
        initialValues: initialAccessoriesValues,
        validate: {},
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [
                    customerRes,
                    brandRes,
                    packageRes,
                    accessoryRes,
                    salesmanRes,
                    technicalHeadRes,
                ] = await Promise.all([
                    apiClient.get("/customers"),
                    apiClient.get("/unit-types/brands"),
                    apiClient.get("/mstPackages"),
                    apiClient.get("/mstAccesories"),
                    apiClient.get("/users/by-role/Salesman"),
                    apiClient.get("/users/by-role/Product Head")
                ])

                const uniqueCustomerID = new Set();
                const formattedCustomers = customerRes.data
                    .filter(item => {
                        if (item.CustomerID && !uniqueCustomerID.has(item.CustomerID)) {
                            uniqueCustomerID.add(item.CustomerID);
                            return true;
                        }
                        return false
                    })
                    .map(item => ({value: item.CustomerID, label: item.CustomerName }));
                setCustomers(formattedCustomers);

                const formattedBrands = brandRes.data
                    .filter(item => item.value != null)
                    .map(item => ({ value: item.value, label: item.label }));
                setBrands(formattedBrands);

                const formattedPackages = packageRes.data.map(item => ({
                    value: item.PackagesID,
                    label: item.PackagesType,
                }));
                setPackageTypes(formattedPackages);

                const formattedAccessories = accessoryRes.data.map(item => ({
                    value: item.AccesoriesID,
                    label: item.AccesoriesName,
                }));
                setAccessoryTypes(formattedAccessories);
                setRequestors([
                    ...salesmanRes.data, 
                    ...technicalHeadRes.data
                ]);

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
        const brandID = headerForm.values.Brand_ID;
        if (brandID) {
            const fetchModel = async () => {
                try {
                    const brandres = await apiClient.get(`/unit-types/${brandID}`);
                    const formattedModels = brandres.data
                        .filter(item => item.value != null)    
                        .map(item => ({ value: item.value, label: item.label }));
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
    }, [headerForm.values.Brand_ID]);

    const handleBrandChange = (brandValues) => {
        headerForm.setFieldValue('Brand_ID', brandValues);
        headerForm.setFieldValue('UnitType', null); 
    }

    const handleHeaderSubmit = async (values) => {
        setLoadingNext(true);

        try {
            let ibcDateFormatted = null;
            
            if (values.IBC_date) {
                const dateObj = new Date(values.IBC_date);
                    if (isNaN(dateObj.getTime())) throw new Error("Invalid IBC date");
                    ibcDateFormatted = dateObj.toISOString().split('T')[0];
            }

            const formattedHeader = { ...values, IBC_date: ibcDateFormatted };
            setSubmittedHeader(formattedHeader);

            const initialVins = Array.from({ length: values.QTY }, (_, i) => ({ VIN: '' }));
            detailForm.setFieldValue('vins', initialVins);

            notifications.show({
                title: "Header Saved",
                message: "Header form has been saved. Please continue to the next step.",
                color: "green",
            });

            setStep(2);

        } catch (error) {
            notifications.show({
                title: "Input Error",
                message: error.message || "Invalid IBC Date format.",
                color: "red",
            });

        } finally {
            setLoadingNext(false);
        }
    };

    const handleDetailSubmit = async (values) => {
        setLoadingNext(true);

        try {
            const result = detailForm.validate(); 
                if (result.hasErrors) {
                    throw new Error("Validation failed");
                }

            const allVinsFilled = values.vins.every(vinObj => vinObj.VIN?.trim());
                if (!allVinsFilled) {
                    throw new Error("All VINs must be filled in.");
                }
            
            const dateObj = new Date(values.DeliveryPlan);
                if (isNaN(dateObj.getTime())) {
                    throw new Error("Invalid Delivery Plan date");
                }

            const deliveryPlanFormatted = dateObj.toISOString().split('T')[0];
            const formattedValues = { ...values, DeliveryPlan: deliveryPlanFormatted };
            setSubmittedDetail(formattedValues);

            notifications.show({
                title: "Detail Saved",
                message: "Detail form has been saved. Please continue to the next step.",
                color: "green",
            });
            setStep(3);

        } catch (error) {
            notifications.show({
                title: "Validation Error",
                message: error.message || "Please fix the form errors.",
                color: "red",
            });

        } finally {
            setLoadingNext(false);
        }
    };

    const handleFinalSubmit = async () => {
        setLoadingNext(true);

        try {
            const areAccessoriesValid = accessoriesForm.values.accessories.every(
                acc => acc.IBC_Accesories?.trim() && Number(acc.qty_acc) > 0
            );

            const arePackagesValid = accessoriesForm.values.packages.every(
                pkg => pkg.PackagesType?.trim()
            );

            if (!areAccessoriesValid || !arePackagesValid) {
                throw new Error("Please ensure all package types and accessory names are filled.");
            }

            const finalPayload = {
                headerForm: submittedHeader,
                detailForm: submittedDetail,
                accessoriesForm: {
                    accessories: accessoriesForm.values.accessories.map(acc => ({
                        AccessoriesName: acc.IBC_Accesories,
                        Remarks: acc.Remarks,
                        qty_acc: Number(acc.qty_acc),
                    }))
                },
                packagesForm: {
                    packages: accessoriesForm.values.packages.map(pkg => ({
                        PackagesType: pkg.PackagesType,
                        PackageDesc: pkg.PackageDesc,
                    }))
                }
            };

            const response = await apiClient.post("/ibc/create-ibc-form", finalPayload);
            const result = response.data;

            notifications.show({
                title: "Success!",
                message: `IBC Form submitted successfully! IBC Number: ${result.IBC_No}`,
                color: "green",
            });

            headerForm.reset();
            detailForm.reset();
            accessoriesForm.reset();
            setSubmittedHeader(null);
            setSubmittedDetail(null);
            setStep(1);
        
        } catch (error) {
            console.error("Submission error:", error);
            const message = error.response?.data?.error || error.message || "An unexpected error occurred.";
            notifications.show({
                title: "Submission Failed",
                message: message,
                color: "red",
            });

        } finally {
            setLoadingNext(false);
        }
    };

    const packageLimit = packageTypes.length;
    const selectedPackageValues = accessoriesForm.values.packages.map(p => p.PackagesType);
    const packageFields = accessoriesForm.values.packages.map((_, index) => {
    const availablePackageOptions = packageTypes.filter(option => !selectedPackageValues.includes(option.value) || option.value === accessoriesForm.values.packages[index].PackagesType);
        return (
            <Table.Tr key={index}>
                <Table.Td>
                    <Select
                        placeholder="Select Package Type"
                        data={availablePackageOptions}
                        searchable
                        clearable
                        {...accessoriesForm.getInputProps(`packages.${index}.PackagesType`)}
                    />
                </Table.Td>
                <Table.Td>
                    <TextInput
                        placeholder="Package Description"
                        {...accessoriesForm.getInputProps(`packages.${index}.PackageDesc`)}
                    />
                </Table.Td>
                <Table.Td>
                    <ActionIcon
                        color="red"
                        variant="light"
                        onClick={() => accessoriesForm.removeListItem('packages', index)}
                    >
                        <IconTrash size={16} />
                    </ActionIcon>
                </Table.Td>
            </Table.Tr>
        );
    });

    const accessoriesLimit = accessoryTypes.length;
    const selectedAccessoryValues = accessoriesForm.values.accessories.map(a => a.IBC_Accesories);
    const accessoryFields = accessoriesForm.values.accessories.map((_, index) => {
    const availableAccessoryOptions = accessoryTypes.filter(option => !selectedAccessoryValues.includes(option.value) || option.value === accessoriesForm.values.accessories[index].IBC_Accesories);
        return (
            <Table.Tr key={index}>
                <Table.Td>
                    <Select
                        placeholder="Select Accessory Name"
                        data={availableAccessoryOptions}
                        searchable
                        clearable
                        {...accessoriesForm.getInputProps(
                            `accessories.${index}.IBC_Accesories`
                        )}
                    />
                </Table.Td>
                <Table.Td>
                    <TextInput
                        placeholder="Accessory Description"
                        {...accessoriesForm.getInputProps(`accessories.${index}.Remarks`)}
                    />
                </Table.Td>
                <Table.Td>
                    <NumberInput
                        placeholder="Qty"
                        min={1}
                        max={999}
                        hideControls
                        {...accessoriesForm.getInputProps(`accessories.${index}.qty_acc`)}
                    />
                </Table.Td>
                <Table.Td>
                        <ActionIcon
                            color="red"
                            variant="light"
                            onClick={() => accessoriesForm.removeListItem('accessories', index)}
                        >
                            <IconTrash size={16} />
                        </ActionIcon>
                </Table.Td>
            </Table.Tr>
        );
    });

    const vinFields = submittedHeader?.QTY > 0 ? Array.from({ length: submittedHeader.QTY }, (_, index) => (
        <Grid.Col key={index} span={{ base: 12, md: 6 }}>
            <TextInput
                label={`VIN Unit ${index + 1}`}
                placeholder={`Enter VIN for unit ${index + 1}`}
                    {...detailForm.getInputProps(`vins.${index}.VIN`, {
                        validate: (value) => value ? null : `VIN ${index + 1} is Required!`,
                    })}
                disabled={step > 2}
            />
        </Grid.Col>
    )) : null;

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
        <Title order={1} mt="md" mb="lg" c="var(--mantine-color-text)"> Indotraktor Business Case Form </Title>

        <Card shadow="sm" p="xl" withBorder mb="lg">
            <Title order={3} mb="md" c="var(--mantine-color-text)"> Header Form </Title>
            <form onSubmit={headerForm.onSubmit(handleHeaderSubmit)}>
            <Grid gutter="xl">
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <Select
                        label="IBC Requestor"
                        placeholder="Select a Requestor"
                        searchable
                        clearable
                        data={requestors}
                        {...headerForm.getInputProps("Requestor")}
                        disabled={step > 1}
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <DateInput
                        label="IBC Date"
                        placeholder="Select IBC Date"
                        rightSection={<IconCalendar size={16} />}
                        {...headerForm.getInputProps("IBC_date")}
                        disabled={step > 1}
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <Select
                        label="Customer Name"
                        placeholder="Select Customer Name"
                        searchable
                        clearable
                        data={customers}
                        {...headerForm.getInputProps('Cust_ID')}
                        disabled={step > 1}
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <TextInput
                        label="Customer ID"
                        placeholder="Customer ID Will Appear Here"
                        value={headerForm.values.Cust_ID || ''}
                        disabled
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <Select
                        label="Brand"
                        placeholder="Select Brand"
                        clearable
                        data={brands}
                        onChange={handleBrandChange}
                        value={headerForm.values.Brand_ID}
                        disabled={step > 1}
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <Select
                        label="Unit Type/ Model"
                        placeholder="Select Unit Type"
                        searchable
                        data={UnitModels}
                        {...headerForm.getInputProps('UnitType')}
                        disabled={step > 1 || !headerForm.values.Brand_ID}
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <TextInput
                        label="PO/ PJB No"
                        placeholder="Input PO/ PJB No"
                        {...headerForm.getInputProps("PO_PJB")}
                        disabled={step > 1}
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <NumberInput
                        label="Unit Quantity"
                        placeholder="Max Unit Quantities are 20"
                        min={1}
                        max={20}
                        {...headerForm.getInputProps('QTY')}
                        disabled={step > 1}
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <TextInput
                        label="Site Operation"
                        placeholder="Input Site Operation"
                        {...headerForm.getInputProps("SiteOperation")}
                        disabled={step > 1}
                    />
                </Grid.Col>
            </Grid>
            {step === 1 && (
                <Group justify="flex-end" mt="md">
                    <Button type="submit">Next Page</Button>
                </Group>
            )}
            </form>
        </Card>

        {step >= 2 && (
            <Card shadow="sm" p="xl" withBorder mb="lg">
                <Title order={3} mb="md" c="var(--mantine-color-text)"> Detail Form </Title>
                <form onSubmit={detailForm.onSubmit(handleDetailSubmit)}>
                    <Grid gutter="xl">
                        <Grid.Col span={{ base: 12, md: 6 }}>
                            <TextInput
                                label="IBC No"
                                value={submittedHeader?.IBC_No || "Auto-Generated after submission"}
                                disabled
                            />
                        </Grid.Col>
                        {vinFields}
                        <Grid.Col span={{ base: 12, md: 6 }}>
                            <TextInput
                                label="Attachment Type"
                                placeholder="Attachment Type"
                                {...detailForm.getInputProps("AttachmentType")}
                                disabled={step > 2}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6 }}>
                            <TextInput
                                label="Attachment Supplier"
                                placeholder="Attachment Supplier Name"
                                {...detailForm.getInputProps("AttachmentSupplier")}
                                disabled={step > 2}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6 }}>
                            <TextInput
                                label="Delivery Address"
                                placeholder="Input Delivery Address"
                                {...detailForm.getInputProps("DeliveryAddress")}
                                disabled={step > 2}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6 }}>
                            <TextInput
                                label="Delivery Customer PIC"
                                placeholder="Input Delivery Customer PIC (Name - Phone Number)"
                                {...detailForm.getInputProps("DeliveryCustPIC")}
                                disabled={step > 2}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6 }}>
                            <DateInput
                                label="Delivery Plan"
                                placeholder="Select Delivery Plan Date"
                                rightSection={<IconCalendar size={16} />}
                                {...detailForm.getInputProps("DeliveryPlan")}
                                disabled={step > 2}
                            />
                        </Grid.Col>
                        <Grid.Col span={12}>
                            <Textarea
                                label="Remarks"
                                {...detailForm.getInputProps("Remarks")}
                                disabled={step > 2}
                            />
                        </Grid.Col>
                    </Grid>
                    {step === 2 && (
                    <Group justify="flex-end" mt="md">
                        <Button type="submit">
                            Next Page
                        </Button>
                    </Group>
                    )}
                </form>
            </Card>
        )}

        {step >= 3 && (
            <Card shadow="sm" p="xl" withBorder mb="lg">
                <Title order={3} mb="md" c="var(--mantine-color-text)"> Detail Accessories </Title>
                <form onSubmit={accessoriesForm.onSubmit(handleFinalSubmit)}>
                    <Divider
                        my="sm"
                        label={<Text style={{ color: "#000000" }}>Packages</Text>}
                    />
                    <Table striped highlightOnHover withTableBorder>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th style={{ width: "50%", color: "var(--mantine-color-text)" }}>Packages Type</Table.Th>
                                <Table.Th style={{ width: "50%", color: "var(--mantine-color-text)" }}>Package Description</Table.Th>
                                <Table.Th></Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>{packageFields}</Table.Tbody>
                    </Table>

                    <Group justify="flex-end" mt="sm" mb="lg">
                        <Button
                            variant="outline"
                            onClick={() => {
                                if (accessoriesForm.values.packages.length +1 <= packageLimit) {
                                    accessoriesForm.insertListItem("packages", {
                                        PackagesType: "",
                                        PackageDesc: "",
                                    });
                                } else {
                                    notifications.show({
                                        title: "Maximum Packages Reached",
                                        message: `You can only add a maximum of ${packageLimit} packages.`,
                                        color: "red",
                                    });
                                }
                            }}
                        >
                            Add Item
                        </Button>
                    </Group>

                    <Divider my="sm" label={<Text style={{ color: "var(--mantine-color-text)" }}>Accessories</Text>} />
                    <Table striped highlightOnHover withTableBorder>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th style={{ width: "45%", color: "var(--mantine-color-text)" }}>Accessories</Table.Th>
                                <Table.Th style={{ width: "45%", color: "var(--mantine-color-text)" }}>Accessories Description</Table.Th>
                                <Table.Th style={{ width: "15%", color: "var(--mantine-color-text)" }}>Quantity</Table.Th>
                                <Table.Th></Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>{accessoryFields}</Table.Tbody>
                    </Table>

                    <Group justify="flex-end" mt="sm">
                        <Button
                            variant="outline"
                            onClick={() => {
                                if (accessoriesForm.values.accessories.length +1 <= accessoriesLimit) {
                                    accessoriesForm.insertListItem("accessories", {
                                        IBC_Accesories: "",
                                        Remarks: "",
                                        qty_acc: 1,
                                    });
                                } else {
                                    notifications.show({
                                        title: "Maximum Accessories Reached",
                                        message: `You can only add a maximum of ${accessoriesLimit} accessories.`,
                                        color: "red",
                                    });
                                }
                            }}
                        >
                            Add Item
                        </Button>
                    </Group>

                    <Group justify="flex-end" mt="md">
                        <Button
                            type="submit"
                            loading={loadingNext}
                            disabled={loadingNext}
                        >
                            {loadingNext ? 'Submitting...' : 'Submit'}
                        </Button>
                    </Group>
                </form>
            </Card>
        )}
        </Box>
    );
}