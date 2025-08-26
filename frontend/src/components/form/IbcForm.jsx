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
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { IconCalendar, IconTrash } from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";

const initialHeaderValues = {
    Requestor: "",
    IBC_date: null,
    PO_PJB: "",
    Cust_ID: "",
    Brand_ID: "",
    UnitType: null,
    QTY: null,
    SiteOperation: "",
};

const initialDetailValues = {
    vins: [],
    WO: "",
    AttachmentType: "",
    AttachmentSupplier: "",
    DeliveryAddress: "",
    DeliveryCustPIC: "",
    DeliveryPlan: null,
    Remarks: "",
};

const initialAccessoriesValues = {
    packages: [{ PackagesType: "", PackageDesc: "" }],
    accessories: [{ IBC_Accesories: "", Remarks: "" }],
};

export function MultiStepIbcForm() {
    const [step, setStep] = useState(1);
    const [submittedHeader, setSubmittedHeader] = useState(null);
    const [submittedDetail, setSubmittedDetail] = useState(null);

    const [requestors, setRequestors] = useState([]);
    const [WoNumber, setWoNumber] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [brands, setBrands] = useState([]);
    const [UnitTypes, setUnitTypes] = useState([]);
    const [packageType, setPackageType] = useState([]);
    const [accessoryType, setAccessoryType] = useState([]);

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
            WO: (value) => (value ? null : "WO Number is Required!"),
            DeliveryPlan: (value) => (value ? null : "Delivery Plan is Required!"),
        },
    });

    const accessoriesForm = useForm({
        initialValues: initialAccessoriesValues,
        validate: {},
    });

    useEffect(() => {
        const fetchWONumber = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:5000/api/work-orders`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                const formattedWONumbers = data.map(item => ({
                    value: item.WONumber,
                    label: item.WONumber,
                }));
                setWoNumber(formattedWONumbers);
            } catch (error) {
                notifications.show({
                    title: "Error Loading Data",
                    message: "Failed to load Work Orders. Please try again!",
                    color: "red",
                });
                setWoNumber([]);
            }
        };

        const fetchCustomers = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:5000/api/customers`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                const uniqueCustomersID = new Set();
                const formattedCustomers = data
                    .filter(item => {
                        if (item.CustomerID && !uniqueCustomersID.has(item.CustomerID)) {
                            uniqueCustomersID.add(item.CustomerID);
                            return true;
                        }
                        return false;
                    })
                    .map(item => ({
                        value: item.CustomerID,
                        label: item.CustomerName,
                    }));
                setCustomers(formattedCustomers);
            } catch (error) {
                console.error("Failed to Fetch Customers:", error);
                notifications.show({
                    title: "Error Loading Data",
                    message: "Failed to load Customers. Please try again!",
                    color: "red",
                });
                setCustomers([]);
            }
        };

        const fetchBrands = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:5000/api/unit-types/brands`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                const formattedBrands = data
                    .filter(item => item.value !== null && item.value !== undefined)
                    .map(item => ({
                        value: item.value,
                        label: item.label,
                    }));
                setBrands(formattedBrands);
            } catch (error) {
                console.error("Failed to Fetch Brands:", error);
                notifications.show({
                    title: "Error Loading Data",
                    message: "Failed to load Brands. Please try again!",
                    color: "red",
                });
                setBrands([]);
            }
        };

        const fetchPackageTypes = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:5000/api/mstPackages`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                const formattedPackageTypes = data
                    .map(item => ({
                        value: item.PackagesID,
                        label: item.PackagesType,
                    }));
                setPackageType(formattedPackageTypes);
            } catch (error) {
                console.error("Failed to Fetch Package Types:", error);
                notifications.show({
                    title: "Error Loading Data",
                    message: "Failed to load Package Types. Please try again!",
                    color: "red",
                });
                setPackageType([]);
            }
        };

        const fetchAccessoryTypes = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:5000/api/mstAccesories`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                const formattedAccessoryTypes = data
                    .map(item => ({
                        value: item.AccesoriesID,
                        label: item.AccesoriesName,
                    }));
                setAccessoryType(formattedAccessoryTypes);
            } catch (error) {
                console.error("Failed to Fetch Accessory Types:", error);
                notifications.show({
                    title: "Error Loading Data",
                    message: "Failed to load Accessory Types. Please try again!",
                    color: "red",
                });
                setAccessoryType([]);
            }
        };

        const dummyRequestors = [
            { value: 'john_doe', label: 'John Doe' },
            { value: 'jane_smith', label: 'Jane Smith' },
        ];
        setRequestors(dummyRequestors);

        fetchCustomers();
        fetchBrands();
        fetchPackageTypes();
        fetchAccessoryTypes();
        fetchWONumber();
    }, []);

    useEffect(() => {
        const brandID = headerForm.values.Brand_ID;
        if (brandID) {
            const fetchUnitTypes = async () => {
                try {
                    const response = await fetch(`http://127.0.0.1:5000/api/unit-types/${brandID}`);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const data = await response.json();
                    const formattedUnitTypes = data
                        .filter(item => item.value !== null && item.value !== undefined)
                        .map(item => ({
                            value: item.value,
                            label: item.label,
                        }));
                    setUnitTypes(formattedUnitTypes);
                } catch (error) {
                    console.error("Failed to Fetch Unit Types:", error);
                    notifications.show({
                        title: "Error Loading Data",
                        message: "Failed to load Unit Types. Please try again!",
                        color: "red",
                    });
                    setUnitTypes([]);
                }
            };

            const fetchWONumber = async () => {
                try {
                    const response = await fetch(`http://127.0.0.1:5000/api/work-orders?brandId=${brandID}`);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const data = await response.json();
                    const formattedWONumbers = data.map(item => ({
                        value: item.WONumber,
                        label: item.WONumber,
                    }));
                    setWoNumber(formattedWONumbers);
                } catch (error) {
                    console.error("Failed to Fetch Work Orders:", error);
                    notifications.show({
                        title: "Error Loading Data",
                        message: "Failed to load Work Orders. Please try again!",
                        color: "red",
                    });
                    setWoNumber([]);
                }
            };
            fetchUnitTypes();
            fetchWONumber();
        } else {
            setUnitTypes([]);
            setWoNumber([]);
        }
    }, [headerForm.values.Brand_ID]);

    const handleBrandChange = (brandValues) => {
        headerForm.setFieldValue('Brand_ID', brandValues);
        headerForm.setFieldValue('UnitType', null); 
    }

    const handleHeaderSubmit = (values) => {
        console.log("Nilai IBC_date sebelum konversi:", values.IBC_date);
        
        let ibcDateFormatted = null;
        if (values.IBC_date) {
            try {
                let dateObj;
                if (values.IBC_date instanceof Date) {
                    dateObj = values.IBC_date;
                } else if (typeof values.IBC_date === 'string') {
                    dateObj = new Date(values.IBC_date);
                }
                if (dateObj && !isNaN(dateObj.getTime())) {
                    ibcDateFormatted = dateObj.toISOString().split('T')[0];
                }
            } catch (e) {
                console.error("Error parsing IBC_date:", e, values.IBC_date);
                notifications.show({
                    title: "Input Error",
                    message: "Invalid IBC Date format. Please select a valid date.",
                    color: "red",
                });
                return;
            }
        }

        const formattedHeader = {
            ...values,
            IBC_date: ibcDateFormatted,
        };
        
        setSubmittedHeader(formattedHeader);
        
        const initialVins = Array.from({ length: values.QTY }, (_, index) => ({ VIN: '' }));
        detailForm.setFieldValue('vins', initialVins);
        notifications.show({
            title: "Header Saved",
            message: "Header form has been saved. Please continue to the next step.",
            color: "green",
        });
        setStep(2);
    };

    const handleDetailSubmit = (values) => {
        console.log('Fungsi handleDetailSubmit dipanggil.');
        const isValid = detailForm.validate();
        if (!isValid) {
            notifications.show({
                title: "Validation Error",
                message: "Please fill in all required fields in the detail form.",
                color: "red",
            });
            return;
        }

        const allVinsFilled = values.vins.every(vinObj => vinObj.VIN && vinObj.VIN.trim() !== '');
        if (!allVinsFilled) {
            notifications.show({
                title: "Validation Error",
                message: "All VINs must be filled in.",
                color: "red",
            });
            return;
        }

        let deliveryPlanFormatted = null;
        if (values.DeliveryPlan) {
            try {
                let dateObj;
                if (values.DeliveryPlan instanceof Date) {
                    dateObj = values.DeliveryPlan;
                } else if (typeof values.DeliveryPlan === 'string') {
                    dateObj = new Date(values.DeliveryPlan);
                }
                if (dateObj && !isNaN(dateObj.getTime())) {
                    deliveryPlanFormatted = dateObj.toISOString().split('T')[0];
                }
            } catch (e) {
                console.error("Error parsing DeliveryPlan:", e, values.DeliveryPlan);
                notifications.show({
                    title: "Input Error",
                    message: "Invalid Delivery Plan date format. Please select a valid date.",
                    color: "red",
                });
                return;
            }
        }
        
        if (!deliveryPlanFormatted) {
            notifications.show({
                title: "Validation Error",
                message: "Delivery Plan is required.",
                color: "red",
            });
            return;
        }

        const formattedValues = {
            ...values,
            DeliveryPlan: deliveryPlanFormatted,
        };

        setSubmittedDetail(formattedValues);
        notifications.show({
            title: "Detail Saved",
            message: "Detail form has been saved. Please continue to the next step.",
            color: "green",
        });
        setStep(3);
    };

    const handleFinalSubmit = async () => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                notifications.show({
                    title: "Authentication Error",
                    message: "Please log in again. Authentication token is missing.",
                    color: "red",
                });
                return;
            }

            if (!submittedHeader || !submittedDetail) {
                notifications.show({
                    title: "Error",
                    message: "Please complete the previous steps before final submission.",
                    color: "red",
                });
                return;
            }

            const areAccessoriesValid = accessoriesForm.values.accessories.every(
                (acc) => acc.IBC_Accesories && acc.IBC_Accesories.trim() !== ''
            );
            const arePackagesValid = accessoriesForm.values.packages.every(
                (pkg) => pkg.PackagesType && pkg.PackagesType.trim() !== ''
            );

            if (!areAccessoriesValid || !arePackagesValid) {
                notifications.show({
                    title: "Validation Error",
                    message: "Please ensure all package types and accessory names are filled.",
                    color: "red",
                });
                return;
            }

            const finalPayload = {
                headerForm: submittedHeader,
                detailForm: submittedDetail,
                accessoriesForm: {
                    accessories: accessoriesForm.values.accessories.map(acc => ({
                        AccessoriesName: acc.IBC_Accesories,
                        Remarks: acc.Remarks,
                    }))
                },
                packagesForm: {
                    packages: accessoriesForm.values.packages.map(pkg => ({ 
                        PackagesType: pkg.PackagesType,
                        PackageDesc: pkg.PackageDesc,
                    }))
                }
            };
            
            console.log("Final Payload to Backend: ", finalPayload);

            const response = await fetch("http://127.0.0.1:5000/api/ibc/create-ibc-form", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(finalPayload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

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
            console.error("Failed to submit form:", error);
            notifications.show({
                title: "Submission Failed",
                message: error.message || "An unexpected error occurred. Please try again.",
                color: "red",
            });
        }
    };

    const selectedPackageValues = accessoriesForm.values.packages.map(p => p.PackagesType);
    const packageFields = accessoriesForm.values.packages.map((_, index) => {
        const availablePackageOptions = packageType.filter(option =>
            !selectedPackageValues.includes(option.value) || option.value === accessoriesForm.values.packages[index].PackagesType
        );
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

    const selectedAccessoryValues = accessoriesForm.values.accessories.map(a => a.IBC_Accesories);
    const accessoryFields = accessoriesForm.values.accessories.map((_, index) => {
        const availableAccessoryOptions = accessoryType.filter(option =>
            !selectedAccessoryValues.includes(option.value) || option.value === accessoriesForm.values.accessories[index].IBC_Accesories
        );
        return (
            <Table.Tr key={index}>
                <Table.Td>
                    <Select
                        placeholder="Accessories Name"
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
                        placeholder="Accessories Description"
                        {...accessoriesForm.getInputProps(`accessories.${index}.Remarks`)}
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

    return (
        <Box maw="100%" mx="auto" px="md">
        <Title order={1} mt="md" mb="lg" style={{ color: "#000000" }}> IBC Form </Title>

        <Card shadow="sm" p="xl" withBorder mb="lg">
            <Title order={3} mb="md" style={{ color: "#000000" }}> Header Form </Title>
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
                        valueFormat="DD-MM-YYYY"
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
                        label="Unit Type"
                        placeholder="Select Unit Type"
                        searchable
                        data={UnitTypes}
                        {...headerForm.getInputProps('UnitType')}
                        disabled={step > 1 || !headerForm.values.Brand_ID}
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <TextInput
                        label="PO/ PJB"
                        placeholder="Input Your PO/ PJB"
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
                        placeholder="Input Your Site Operation"
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
                <Title order={3} mb="md" style={{ color: "#000000" }}> Detail Form </Title>
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
                            <Select
                                label="WO Number"
                                placeholder="Select WO Number"
                                searchable
                                clearable
                                data={WoNumber}
                                {...detailForm.getInputProps('WO')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6 }}>
                            <TextInput
                                label="Attachment Type"
                                {...detailForm.getInputProps("AttachmentType")}
                                disabled={step > 2}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6 }}>
                            <TextInput
                                label="Attachment Supplier"
                                {...detailForm.getInputProps("AttachmentSupplier")}
                                disabled={step > 2}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6 }}>
                            <TextInput
                                label="Delivery Address"
                                {...detailForm.getInputProps("DeliveryAddress")}
                                disabled={step > 2}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6 }}>
                            <TextInput
                                label="Delivery Cust PIC"
                                {...detailForm.getInputProps("DeliveryCustPIC")}
                                disabled={step > 2}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6 }}>
                            <DateInput
                                label="Delivery Plan"
                                placeholder="Select Delivery Plan Date"
                                valueFormat="DD-MM-YYYY"
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
                        <Button type="submit">Next Page</Button>
                    </Group>
                    )}
                </form>
            </Card>
        )}

        {step >= 3 && (
            <Card shadow="sm" p="xl" withBorder mb="lg">
                <Title order={3} mb="md" style={{ color: "#000000" }}> Detail Accessories </Title>
                <form onSubmit={accessoriesForm.onSubmit(handleFinalSubmit)}>
                    <Divider
                        my="sm"
                        label={<Text style={{ color: "#000000" }}>Packages</Text>}
                    />
                    <Table striped highlightOnHover withTableBorder>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th style={{ width: "50%", color: "#000000" }}>
                                    Packages Type
                                </Table.Th>
                                <Table.Th style={{ width: "50%", color: "#000000" }}>
                                    Package Desc
                                </Table.Th>
                                <Table.Th></Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>{packageFields}</Table.Tbody>
                    </Table>

                    <Group justify="flex-end" mt="sm" mb="lg">
                        <Button
                            variant="outline"
                            onClick={() => {
                                if (accessoriesForm.values.packages.length < 5) {
                                    accessoriesForm.insertListItem("packages", {
                                        PackagesType: "",
                                        PackageDesc: "",
                                    });
                                } else {
                                    notifications.show({
                                        title: "Maximum Packages Reached",
                                        message: "You can only add a maximum of 5 packages.",
                                        color: "red",
                                    });
                                }
                            }}
                        >
                        Add Item
                        </Button>
                    </Group>

                    <Divider
                        my="sm"
                        label={<Text style={{ color: "#000000" }}>Accessories</Text>}
                    />
                    <Table striped highlightOnHover withTableBorder>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th style={{ width: "50%", color: "#000000" }}>
                                    Accessories
                                </Table.Th>
                                <Table.Th style={{ width: "50%", color: "#000000" }}>
                                    Accessories Desc
                                </Table.Th>
                                <Table.Th></Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>{accessoryFields}</Table.Tbody>
                    </Table>

                    <Group justify="flex-end" mt="sm">
                        <Button
                            variant="outline"
                            onClick={() => {
                                if (accessoriesForm.values.accessories.length < 26) {
                                    accessoriesForm.insertListItem("accessories", {
                                        IBC_Accesories: "",
                                        Remarks: "",
                                    });
                                } else {
                                    notifications.show({
                                        title: "Maximum Accessories Reached",
                                        message: "You can only add a maximum of 26 accessories.",
                                        color: "red",
                                    });
                                }
                            }}
                        >
                        Add Item
                        </Button>
                    </Group>

                    <Group justify="flex-end" mt="md">
                        <Button type="submit">Submit</Button>
                    </Group>
                </form>
            </Card>
        )}
        </Box>
    );
}