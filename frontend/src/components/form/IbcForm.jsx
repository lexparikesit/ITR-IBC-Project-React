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
    IBC_ID: "",
    IBC_No: "",
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
    IBC_TransID: "",
    IBC_No: "",
    vins: [],
    WO: "",
    AttachmentType: "",
    AttachmentSupplier: "",
    DeliveryAddress: "",
    DeliveryCustPIC: "",
    DeliveryPlan: null,
    Remark: "",
};

const initialAccessoriesValues = {
    packages: [{ PackagesType: "", PackageDesc: "" }],
    accessories: [{ IBC_Accesories: "", Remarks: "" }],
};

export function MultiStepIbcForm() {
    const [step, setStep] = useState(1);
    const [submittedHeader, setSubmittedHeader] = useState(null);
    const [submittedDetail, setSubmittedDetail] = useState(null);

    // dropdown state
    const [requestors, setRequestors] = useState([]);
    const [poPJBs, setPoPJBs] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [brands, setBrands] = useState([]);
    const [UnitTypes, setUnitTypes] = useState([]);

    const [packageType, setPackageType] = useState([]);
    const [accessoryType, setAccessoryType] = useState([]);

    const headerForm = useForm({
        initialValues: initialHeaderValues,
        validate: {
            IBC_No: (value) => (value ? null : "IBC No. is Required!"),
            Requestor: (value) => (value ? null : "Requestor is Required!"),
            IBC_date: (value) => (value ? null : "IBC Date is Required!"),
            PO_PJB: (value) => (value ? null : "PO PJB is Required!"),
            Cust_ID: (value) => (value ? null : 'Customer ID is Required!'),
            Brand_ID: (value) => (value ? null : 'Brand ID is Required!'),
            UnitType: (value) => (value ? null : 'Unit Type is Required!'),
            QTY: (value) => {
                if (!value) return "Quantity is Required!";
                if (value < 1 ) return "Quantity must be least 1!";
                if (value > 20) return "Quantity must be at most 20!";
            },
        },
    });

    const detailForm = useForm({
        initialValues: initialDetailValues,
        validate: {
            WO: (value) => (value ? null : "WO is Required!"),
            DeliveryPlan: (value) => (value ? null : "Delivery Plan is Required!"),
            vins: { VIN: (value) => (value ? null : "VIN is Required!"), },
        },
    });

    const accessoriesForm = useForm({
        initialValues: initialAccessoriesValues,
        validate: {
            packages: {
                PackagesType: (value) => (value ? null : "Package Type is Required!"),
                PackageDesc: (value) =>
                value ? null : "Package Description is Required!",
            },
            accessories: {
                IBC_Accesories: (value) => (value ? null : "Accessories is Required!"),
            },
        },
    });

    useEffect(() => {
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
                console.error("Failed to Fetch Package Types:", error);
                notifications.show({
                    title: "Error Loading Data",
                    message: "Failed to load Package Types. Please try again!",
                    color: "red",
                });
                setAccessoryType([]);
            }
        };

        // dummy for requestor
        const dummyRequestors = [
            { value: 'john_doe', label: 'John Doe' },
            { value: 'jane_smith', label: 'Jane Smith' },
        ];
        setRequestors(dummyRequestors);

        // dummy for PO PJB
        const dummyPoPJBs = [
            { value: 'PO-12345', label: 'PO-12345' },
            { value: 'PO-67890', label: 'PO-67890' },
        ];
        setPoPJBs(dummyPoPJBs);

        fetchCustomers();
        fetchBrands();
        fetchPackageTypes();
        fetchAccessoryTypes();
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
            fetchUnitTypes();
        }
    }, [headerForm.values.Brand_ID]);

    const handleBrandChange = (brandValues) => {
        headerForm.setFieldValue('Brand_ID', brandValues);
        headerForm.setFieldValue('UnitType', null); 
    }

    const handleHeaderSubmit = (values) => {
        console.log('Header form submitted successfully!', values); 
        const initialVins = Array.from({ length: values.QTY }, (_, index) => ({ VIN: '' }));

        detailForm.setFieldValue('vins', initialVins);

        setSubmittedHeader({ ...values, IBC_ID: "TEMP-IBC-001" });
            notifications.show({
                title: "Header Saved",
                message: "Header form has been saved. Please continue to the next step.",
                color: "green",
            });
        setStep(2);
    };

    const handleDetailSubmit = (values) => {
        setSubmittedDetail({ ...values, IBC_TransID: "TEMP-TRANS-001" });
            notifications.show({
                title: "Detail Saved",
                message: "Detail form has been saved. Please continue to the next step.",
                color: "green",
            });
        setStep(3);
    };

    const handleFinalSubmit = (accessoriesValues) => {
        const finalPayload = {
            header: submittedHeader,
            detail: submittedDetail,
            accessories: accessoriesValues,
        };

        console.log("Final Payload to Backend: ", finalPayload);

        notifications.show({
            title: "Success!",
            message: "All forms submitted successfully!",
            color: "blue",
        });

        headerForm.reset();
        detailForm.reset();
        accessoriesForm.reset();
        setSubmittedHeader(null);
        setSubmittedDetail(null);
        setStep(1);
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
            label={`VIN ${index + 1}`}
            placeholder={`Enter VIN for unit ${index + 1}`}
            {...detailForm.getInputProps(`vins.${index}.VIN`)}
            disabled={step > 2}
        />
    </Grid.Col>
    )) : null;

    return (
        <Box maw="100%" mx="auto" px="md">
        <Title order={1} mt="md" mb="lg" style={{ color: "#000000" }}> IBC Form </Title>

        {/* Form Header 1 */}
        <Card shadow="sm" p="xl" withBorder mb="lg">
            <Title order={3} mb="md" style={{ color: "#000000" }}> Header Form </Title>
            <form onSubmit={headerForm.onSubmit(handleHeaderSubmit)}>
            <Grid gutter="xl">
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <TextInput
                        label="IBC Form Number"
                        placeholder="Input Your IBC Form Number"
                        {...headerForm.getInputProps("IBC_No")}
                        disabled={step > 1}
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <Select
                        label="IBC Requestor"
                        placeholder="Select a Requestor"
                        searchable
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
                        label="PO/PJB"
                        placeholder="Select PO PJB"
                        searchable
                        clearable
                        data={poPJBs}
                        {...headerForm.getInputProps("PO_PJB")}
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

        {/* Form Detail 2 */}
        {step >= 2 && (
            <Card shadow="sm" p="xl" withBorder mb="lg">
                <Title order={3} mb="md" style={{ color: "#000000" }}> Detail Form </Title>
                <form onSubmit={detailForm.onSubmit(handleDetailSubmit)}>
                    <Grid gutter="xl">
                        <Grid.Col span={{ base: 12, md: 6 }}>
                            <TextInput
                                label="IBC No"
                                value={submittedHeader.IBC_No}
                                disabled
                            />
                        </Grid.Col>
                        {vinFields}
                        <Grid.Col span={{ base: 12, md: 6 }}>
                            <TextInput
                                label="Work Order"
                                {...detailForm.getInputProps("WO")}
                                disabled={step > 2}
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
                                valueFormat="DD-MM-YYYY"
                                rightSection={<IconCalendar size={16} />}
                                {...detailForm.getInputProps("DeliveryPlan")}
                                disabled={step > 2}
                            />
                        </Grid.Col>
                        <Grid.Col span={12}>
                            <Textarea
                                label="Remarks"
                                {...detailForm.getInputProps("Remark")}
                                disabled={step > 2}
                            />
                        </Grid.Col>
                    </Grid>
                    {step === 2 && (
                    <Group justify="flex-end" mt="md">
                        <Button type="submit">Save Detail</Button>
                    </Group>
                    )}
                </form>
            </Card>
        )}

        {/* Form Detail Accessories 3 */}
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
                            </Table.Tr>
                        </Table.Thead>
                    <Table.Tbody>{accessoryFields}</Table.Tbody>
                    </Table>

                    <Group justify="flex-end" mt="sm">
                        <Button
                            variant="outline"
                            onClick={() =>  {
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