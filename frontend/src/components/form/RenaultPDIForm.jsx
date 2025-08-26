"use client";

import React, { useState, useEffect } from "react";
import {
    TextInput,
    Textarea,
    Button,
    Stack,
    Text,
    Grid,
    Group,
    Card,
    Title,
    Divider,
    Box,
    Radio,  
    Table,
    Select,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { IconCalendar } from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";

const renaultPdiChecklistItemDefinition = {
    lubricationOilAndFluidLevels: [
        { id: '1', label: 'Charge battery', itemKey: 'chargeBattery' },
        { id: '2', label: 'Check battery charge and fluid level', itemKey: 'batteryChargeFluidLevel' },
        { id: '3', label: 'Lubricate leaf suspension bushings', itemKey: 'lubricateLeafSuspensionBushings' },
        { id: '4', label: 'Check fluid levels in windscreen and headlamp washer reservoirs', itemKey: 'fluidLevelsWindscreenHeadlamp' },
        { id: '5', label: 'Check coolant level', itemKey: 'coolantLevel' },
        { id: '6', label: 'Check engine oil level', itemKey: 'engineOilLevel' },
        { id: '7', label: 'Check AdBlue level', itemKey: 'adBlueLevel' },
        { id: '8', label: 'Replace battery cable', itemKey: 'replaceBatteryCable' },
        { id: '9', label: 'Install chocks', itemKey: 'installChocks' },
        { id: '10', label: 'Activate and lubricate fifth wheel', itemKey: 'activateLubricateFifthWheel' },
    ],
    cab: [
        { id: '11', label: 'Connect-disconnect diagnostic tool', itemKey: 'connectDisconnectDiagnosticTool' },
        { id: '12', label: 'Activate vehicle electrical system', itemKey: 'activateElectricalSystem' },
        { id: '13', label: 'Connectivity, check', itemKey: 'connectivityCheck' },
        { id: '14', label: 'Activate radio', itemKey: 'activateRadio' },
        { id: '15', label: 'Activate anti-theft alarm', itemKey: 'activateAntiTheftAlarm' },
        { id: '16', label: 'Check warning and control lamps', itemKey: 'checkWarningControlLamps' },
        { id: '17', label: 'Function check of parking heater', itemKey: 'functionCheckParkingHeater' },
    ],
    exterior: [
        { id: '18', label: 'Attach exhaust tail pipe', itemKey: 'attachExhaustTailPipe' },
        { id: '19', label: 'Check cab and chassis', itemKey: 'checkCabChassis' },
        { id: '20', label: 'Check tightening of wheel nuts and attachment of protecting rings', itemKey: 'checkWheelNuts' },
        { id: '21', label: 'Check tyre pressure', itemKey: 'checkTyrePressure' },
        { id: '22', label: 'Install license plate', itemKey: 'installLicensePlate' },
        { id: '23', label: 'Install air deflector', itemKey: 'installAirDeflector' },
        { id: '24', label: 'Remove spare wheel', itemKey: 'removeSpareWheel' },
    ],
    underVehicle: [
        { id: '25', label: 'Remove screw in charge air cooler. Only on markets where there is a risk of freezing', itemKey: 'removeScrewChargeAirCooler' },
        { id: '26', label: 'Check load sensing valve setting', itemKey: 'checkLoadSensingValve' },
        { id: '27', label: 'Check superstructure', itemKey: 'checkSuperstructure' },
    ],
    testDrive: [
        { id: '28', label: 'Check after start', itemKey: 'checkAfterStart' },
        { id: '29', label: 'Check during road test', itemKey: 'checkDuringRoadTest' },
        { id: '30', label: 'Check after road test', itemKey: 'checkAfterRoadTest' },
    ],
    finish: [
        { id: '31', label: 'Remove protective film', itemKey: 'removeProtectiveFilm' },
        { id: '32', label: 'Finish', itemKey: 'finish' },
        { id: '33', label: 'Brake adaptation, information to customer', itemKey: 'brakeAdaptation' },
    ],
};

const initialChecklistValues = Object.keys(renaultPdiChecklistItemDefinition).reduce((acc, sectionKey) => {
    acc[sectionKey] = renaultPdiChecklistItemDefinition[sectionKey].reduce((itemAcc, item) => {
        itemAcc[item.itemKey] = '';
        return itemAcc;
    }, {});
    return acc;
}, {});

const initialRenaultPdiValues = {
    date: null,
    repairOrderNo: '',
    mileageHourMeter: '',
    chassisId: '',
    registrationNo: '',
    vinNo: '',
    customer: '',
    city: '',
    model: '',
    engine: '',
    axle: '',

    // property for technician
    technician: '',
    approvalBy: '',

    // checklist items
    checklistItems: initialChecklistValues,

    // battery inspection
    batteryStatus: [
        { battery: 'Inner / Front Battery', testCode: '' },
        { battery: 'Outer/ Rear Battery', testCode: '' },
    ],

    // vehicle damage notes
    vehicleDamageNotes: '',
};

export function RenaultPDIForm() {
    const [technician, setTechnician] = useState([]);
    const [approval, setApproval] = useState([]);
    const [WoNumber, setWoNumber] = useState([]);
    const [customers, setCustomers] = useState('');
    const [unitModels, setUnitModels] = useState([]);

    const buildChecklistValidation = () => {
        const checklistValidation = {};
        Object.keys(renaultPdiChecklistItemDefinition).forEach(sectionKey => {
            renaultPdiChecklistItemDefinition[sectionKey].forEach(item => {
                const fieldKey = `checklistItems.${sectionKey}.${item.itemKey}`;
                checklistValidation[fieldKey] = (value) => (value ? null :  "This Field is Required!");
            });
        });
        return checklistValidation;
    };

    const form = useForm({
        initialValues: initialRenaultPdiValues,
        validate: {
            repairOrderNo: (value) => (value ? null : "WO Number is Required!"),
            mileageHourMeter: (value) => (value ? null: "Mileage is Required!"),
            chassisId: (value) => (value ? null : "Chassis ID is Required!"),
            registrationNo: (value) => (value ? null : "Registration No is Required!"),
            customer: (value) => (value ? null : "Customer is Required!"),
            city: (value) => (value ? null : "City is Required!"),
            model: (value) => (value ? null : "Type/Model is Required!"),
            engine: (value) => (value ? null : "Engine is Required!"),
            axle: (value) => (value ? null : "Axle is Required!"),
            date: (value) => (value ? null : "Date is Required!"),
            technician: (value) => (value ? null: "Technician is Required!"),
            approvalBy: (value) => (value ? null: "Approval By is Required!"),
            ...buildChecklistValidation(),
        },
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
                const customersData = await response.json();
                const formattedCustomers = customersData.map(customer => ({
                    value: customer.CustomerID,
                    label: customer.CustomerName
                }));
                setCustomers(formattedCustomers);
            } catch (error) {
                notifications.show({
                    title: "Error Loading Data",
                    message: "Failed to load Customers. Please try again!",
                    color: "red",
                });
                setCustomers([]);
            }
        };

        const fetchUnitTypes = async () => {
            try {
                const modelResponse = await fetch("http://127.0.0.1:5000/api/unit-types/RT");
				if (!modelResponse.ok) {
					throw new Error(`HTTP error! status: ${modelResponse.status}`);
				}
				const modelData = await modelResponse.json();
				setUnitModels(modelData);
            } catch (error) {
                notifications.show({
                    title: "Error Loading Data",
                    message: "Failed to load Unit Models. Please try again!",
                    color: "red",
                });
                setUnitModels([]);
            }
        };

        const dummyTechnicians = [
            { value: "tech1", label: "John Doe" },
            { value: "tech2", label: "Jane Smith" },
            { value: "tech3", label: "Peter Jones" }
        ];
        setTechnician(dummyTechnicians);

        const dummyApprover = [
            { value: "app1", label: "Alice Brown" },
            { value: "app2", label: "Bob White" },
            { value: "app3", label: "John Green" }
        ];
        setApproval(dummyApprover);

        fetchWONumber();
        fetchCustomers();
        fetchUnitTypes();
    }, []);

    const handleSubmit = async (values) => {
        const token = localStorage.getItem('access_token');
        
        console.log("DEBUG: Token from localStorage:", token); // --> DEBUG

        if(!token) {
            notifications.show({
                title: "Authentication Error",
                message: "Please log in again. Authentication token is missing.",
                color: "red",
            });
            console.log("Authentication token is missing.");
            return;
        }
        
        console.log("Form Submitted with Values:", values);

        const checklistPayload = {};

        const {
            cab,
            exterior,
            lubricationOilAndFluidLevels,
            testDrive,
            underVehicle,
            finish,
        } = values.checklistItems;
        
        Object.entries(cab).forEach(([key, value]) => {
            checklistPayload[`cab.${key}`] = value;
        });

        Object.entries(exterior).forEach(([key, value]) => {
            checklistPayload[`exterior.${key}`] = value;
        });

        Object.entries(lubricationOilAndFluidLevels).forEach(([key, value]) => {
            checklistPayload[`lubricationOilAndFluidLevels.${key}`] = value;
        });

        Object.entries(testDrive).forEach(([key, value]) => {
            checklistPayload[`testDrive.${key}`] = value;
        });

        Object.entries(underVehicle).forEach(([key, value]) => {
            checklistPayload[`underVehicle.${key}`] = value;
        });

        Object.entries(finish).forEach(([key, value]) => {
            checklistPayload[`finish.${key}`] = value;
        });

        const payload = {
            brand: 'renault',
            unitInfo: {
                WO: values.repairOrderNo,
                mileage: values.mileageHourMeter,
                chassisID: values.chassisId,
                registrationNO: values.registrationNo,
                VIN: values.vinNo,
                date: (values.date instanceof Date && !isNaN(values.date))
                        ? values.date.toISOString()
                        : null,
                customer: values.customer,
                city: values.city,
                model: values.model,
                engine: values.engine,
                axle: values.axle,
                technician: values.technician,
                approvalBy: values.approvalBy,
            },
            checklistItems: checklistPayload,
            batteryStatus: {
                batt_inner_front: values.batteryStatus[0].battery,
                test_code_batt_inner_front: values.batteryStatus[0].testCode,
                batt_outer_rear: values.batteryStatus[1].battery,
                test_code_batt_outer_rear: values.batteryStatus[1].testCode,
            },
            vehicle_innspection: values.vehicleDamageNotes,
        };

        console.log("Payload to backend: ", payload)

        try {
            const response = await fetch(`http://localhost:5000/api/pre-delivery-inspection/renault/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to submit Renault Pre-Delivery Inspection");
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

    const renderChecklistItem = (label, formProps, key) => {
        return (
            <Grid.Col span={{ base: 12 }} key={key}>
                <Stack gap="xs">
                    <Text size="sm" style={{ color: '#000000 !important', fontWeight: 500 }}>{label}</Text>
                    <Radio.Group
                        {...formProps}
                        orientation="horizontal"
                    >
                        <Group mt="xs" justify="space-between" style={{ width: '100%' }}>
                                <Radio value="repaired" label={<Text style={{ color: '#000000 !important' }}> Repaired, Without Notes </Text>} />
                                <Radio value="recommended_repair" label={<Text style={{ color: '#000000 !important' }}> Repair Recommended </Text>} />
                                <Radio value="immediately_repair" label={<Text style={{ color: '#000000 !important' }}> Repair Immediately </Text>} />
                                <Radio value="not_applicable" label={<Text style={{ color: '#000000 !important' }}> Not Applicable </Text>} />
                        </Group>
                    </Radio.Group>
                </Stack>
            </Grid.Col>
        );
    };

    const renderChecklistSection = (sectionTitle, sectionKey, items) => {
        return (
            <Card shadow="sm" p="xl" withBorder mb="lg">
                <Title order={3} mb="md" style={{ color: '#000000 !important' }}>{sectionTitle}</Title>
                <Grid gutter="xl">
                    {items.map((item) => {
                        const fieldName = `checklistItems.${sectionKey}.${item.itemKey}`;
                        console.log('Rendering field:', fieldName);
                        return renderChecklistItem(
                            `${item.id}. ${item.label}`,
                                form.getInputProps(`checklistItems.${sectionKey}.${item.itemKey}`),
                            `${sectionKey}-${item.itemKey}`,
                        );
                    })}
                </Grid>
            </Card>
        );
    };

    return (
        <Box maw="100%" mx="auto" px="md">
            <Title 
                order={1}
                mt="md"
                mb="lg"
                style={{ color: '#000000 !important' }}
            > Pre Delivery Inspection Form
            </Title>

            <form onSubmit={form.onSubmit(handleSubmit)}>
                {/* Header Information */}
                <Card shadow="sm" p="xl" withBorder mb="lg">
                    <Title order={3} mb="md" style={{ color: '#000000 !important' }}> Required Information </Title>
                    <Grid gutter="xl">
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <DateInput
                                label={<Text style={{ color: '#000000 !important' }}> Date </Text>}
                                placeholder="Select Date"
                                valueFormat="DD-MM-YYYY"
                                {...form.getInputProps('date')}
                                rightSection={<IconCalendar size={16} />}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <Select
                                label="Customer Name"
                                placeholder="Select Customer Name"
                                searchable
                                clearable
                                data={customers}
                                {...form.getInputProps('customer')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <Select
                                label="WO Number"
                                placeholder="Select WO Number"
                                searchable
                                clearable
                                data={WoNumber}
                                {...form.getInputProps('repairOrderNo')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <TextInput
                                label={<Text style={{ color: '#000000 !important' }}> Mileage/ Hour Meter </Text>}
                                placeholder="Input Mileage/ Hour Meter"
                                {...form.getInputProps('mileageHourMeter')}
                                styles={{ input: { color: '#000000 !important' } }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <TextInput
                                label={<Text style={{ color: '#000000 !important' }}> Chassis ID </Text>}
                                placeholder="Input Chassis ID"
                                {...form.getInputProps('chassisId')}
                                styles={{ input: { color: '#000000 !important' } }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <TextInput
                                label={<Text style={{ color: '#000000 !important' }}> Registration No </Text>}
                                placeholder="Input Registration Number"
                                {...form.getInputProps('registrationNo')}
                                styles={{ input: { color: '#000000 !important' } }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <TextInput
                                label={<Text style={{ color: '#000000 !important' }}> City </Text>}
                                placeholder="Input City"
                                {...form.getInputProps('city')}
                                styles={{ input: { color: '#000000 !important' } }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <Select
                                label="Type/Model"
                                placeholder="Select a Type/Model"
                                data={unitModels}
                                searchable
                                clearable
                                {...form.getInputProps("model")}
                                renderOption={({ option }) => <Text>{option.label}</Text>}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <TextInput
                                label={<Text style={{ color: '#000000 !important' }}> Engine </Text>}
                                placeholder="Input Engine No"
                                {...form.getInputProps('engine')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <TextInput
                                label={<Text style={{ color: '#000000 !important' }}> Axle </Text>}
                                placeholder="Input Axle"
                                {...form.getInputProps('axle')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <Select
                                label="Technician"
                                placeholder="Select Technician"
                                data={technician}
                                searchable
                                clearable
                                {...form.getInputProps("technician")}
                                renderOption={({ option }) => <Text>{option.label}</Text>}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <Select
                                label="Approval By"
                                placeholder="Select Approver"
                                data={approval}
                                searchable
                                clearable
                                {...form.getInputProps("approvalBy")}
                                renderOption={({ option }) => <Text>{option.label}</Text>}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <TextInput
                                label={<Text style={{ color: '#000000 !important' }}> VIN </Text>}
                                placeholder="Input VIN Number"
                                {...form.getInputProps('vinNo')}
                            />
                        </Grid.Col>
                    </Grid>
                </Card>
                <Divider my="xl" label={<Text style={{ color: '#000000 !important' }}>Legend</Text>} labelPosition="center" />
                    <Group justify="center" gap="xl" mb="lg">
                        <Text style={{ color: '#000000 !important' }}> 1: Repaired, Without Notes </Text>
                        <Text style={{ color: '#000000 !important' }}> 2: Repair Recommended </Text>
                        <Text style={{ color: '#000000 !important' }}> 3: Repair Immediately </Text>
                        <Text style={{ color: '#000000 !important' }}> 0: Not Applicable </Text>
                    </Group>
                <Divider my="xl" />

                {/* Checklist Sections */}
                {renderChecklistSection(
                    "Lubrication, oil and fluid levels",
                    "lubricationOilAndFluidLevels",
                    renaultPdiChecklistItemDefinition.lubricationOilAndFluidLevels
                )}
                {renderChecklistSection(
                    "Cab",
                    "cab",
                    renaultPdiChecklistItemDefinition.cab
                )}
                {renderChecklistSection(
                    "Exterior",
                    "exterior",
                    renaultPdiChecklistItemDefinition.exterior
                )}
                {renderChecklistSection(
                    "Under vehicle",
                    "underVehicle",
                    renaultPdiChecklistItemDefinition.underVehicle
                )}
                {renderChecklistSection(
                    "Test drive",
                    "testDrive",
                    renaultPdiChecklistItemDefinition.testDrive
                )}
                {renderChecklistSection(
                    "Finish",
                    "finish",
                    renaultPdiChecklistItemDefinition.finish
                )}

                {/* Battery Status */}
                <Card shadow="sm" p="xl" withBorder mb="lg">
                    <Title order={3} mb="md" style={{ color: '#000000 !important' }}> Battery Status </Title>
                    <Table striped highlightOnHover withTableBorder withColumnBorders>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th style={{ color: '#000000 !important' }}>Battery</Table.Th>
                                <Table.Th style={{ color: '#000000 !important' }}>Test code</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {form.values.batteryStatus.map((row, index) => (
                                <Table.Tr key={index}>
                                    <Table.Td style={{ color: '#000000 !important' }}>{row.battery}</Table.Td>
                                    <Table.Td>
                                        <TextInput
                                            placeholder="Input Test Code"
                                            {...form.getInputProps(`batteryStatus.${index}.testCode`)}
                                        />
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                </Card>

                {/* Vehicle Inspection Notes */}
                <Card shadow="sm" p="xl" withBorder mb="lg">
                    <Title order={3} mb="md" style={{ color: '#000000 !important' }}> Vehicle Inspection </Title>
                    <Text size="sm" mb="md" style={{ color: '#000000 !important' }}> Note any damage </Text>
                    <Textarea
                        placeholder="Add any vehicle damage notes here..."
                        minRows={10}
                        mb="xl"
                        {...form.getInputProps('vehicleDamageNotes')}
                    />
                </Card>
                <Group justify="flex-end" mt="md">
                    <Button type="submit">Submit</Button>
                </Group>
            </form>
        </Box>
    );
}

export default RenaultPDIForm;