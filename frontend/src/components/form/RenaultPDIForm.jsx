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
    rem,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { IconCalendar, IconPencil, IconUpload, IconX, IconFile } from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { Dropzone, MIME_TYPES } from "@mantine/dropzone";

const renaultPdiChecklistItemDefinition = {
    lubricationOilAndFluidLevels: [
        { id: '1', label: 'Charge Battery', itemKey: 'chargeBattery' },
        { id: '2', label: 'Check Battery Charge and Fluid Level', itemKey: 'batteryChargeFluidLevel' },
        { id: '3', label: 'Lubricate Leaf Suspension Bushings', itemKey: 'lubricateLeafSuspensionBushings' },
        { id: '4', label: 'Check Fluid Levels in Windscreen and Headlamp Washer Reservoirs', itemKey: 'fluidLevelsWindscreenHeadlamp' },
        { id: '5', label: 'Check Coolant Level', itemKey: 'coolantLevel' },
        { id: '6', label: 'Check Engine Oil Level', itemKey: 'engineOilLevel' },
        { id: '7', label: 'Check AdBlue Level', itemKey: 'adBlueLevel' },
        { id: '8', label: 'Replace Battery Cable', itemKey: 'replaceBatteryCable' },
        { id: '9', label: 'Install Chocks', itemKey: 'installChocks' },
        { id: '10', label: 'Activate and Lubricate Fifth Wheel', itemKey: 'activateLubricateFifthWheel' },
    ],
    cab: [
        { id: '11', label: 'Connect-Disconnect Diagnostic tool', itemKey: 'connectDisconnectDiagnosticTool' },
        { id: '12', label: 'Activate Vehicle Electrical System', itemKey: 'activateElectricalSystem' },
        { id: '13', label: 'Connectivity, Check', itemKey: 'connectivityCheck' },
        { id: '14', label: 'Activate Radio', itemKey: 'activateRadio' },
        { id: '15', label: 'Activate Anti-theft Alarm', itemKey: 'activateAntiTheftAlarm' },
        { id: '16', label: 'Check Warning and Control Lamps', itemKey: 'checkWarningControlLamps' },
        { id: '17', label: 'Function Check of Parking Heater', itemKey: 'functionCheckParkingHeater' },
    ],
    exterior: [
        { id: '18', label: 'Attach Exhaust Tail Pipe', itemKey: 'attachExhaustTailPipe' },
        { id: '19', label: 'Check Cab and Chassis', itemKey: 'checkCabChassis' },
        { id: '20', label: 'Check Tightening of Wheel Nuts and Attachment of Protecting Rings', itemKey: 'checkWheelNuts' },
        { id: '21', label: 'Check Tyre Pressure', itemKey: 'checkTyrePressure' },
        { id: '22', label: 'Install License Plate', itemKey: 'installLicensePlate' },
        { id: '23', label: 'Install Air Deflector', itemKey: 'installAirDeflector' },
        { id: '24', label: 'Remove Spare Wheel', itemKey: 'removeSpareWheel' },
    ],
    underVehicle: [
        { id: '25', label: 'Remove Screw in Charge Air Cooler (only on markets where there is a risk of freezing)', itemKey: 'removeScrewChargeAirCooler' },
        { id: '26', label: 'Check Load Sensing Valve Setting', itemKey: 'checkLoadSensingValve' },
        { id: '27', label: 'Check Superstructure', itemKey: 'checkSuperstructure' },
    ],
    testDrive: [
        { id: '28', label: 'Check After Start', itemKey: 'checkAfterStart' },
        { id: '29', label: 'Check During Road Test', itemKey: 'checkDuringRoadTest' },
        { id: '30', label: 'Check After Road Test', itemKey: 'checkAfterRoadTest' },
    ],
    finish: [
        { id: '31', label: 'Remove Protective Film', itemKey: 'removeProtectiveFilm' },
        { id: '32', label: 'Finish', itemKey: 'finish' },
        { id: '33', label: 'Brake Adaptation, Information to Customer', itemKey: 'brakeAdaptation' },
    ],
};

const initialChecklistValues = Object.keys(renaultPdiChecklistItemDefinition).reduce((acc, sectionKey) => {
    acc[sectionKey] = renaultPdiChecklistItemDefinition[sectionKey].reduce((itemAcc, item) => {
        itemAcc[item.itemKey] = {
            value: '',
            notes: '',
            image: null,
        };
        return itemAcc;
    }, {});
    return acc;
}, {});

const initialRenaultPdiValues = {
    date: null,
    repairOrderNo: null,
    mileageHourMeter: '',
    chassisId: '',
    registrationNo: '',
    vinNo: '',
    customer: '',
    city: '',
    model: null,
    engine: '',
    axle: '',

    // property for technician
    technician: null,
    approvalBy: null,

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
    const [unitModels, setUnitModels] = useState([]);
    const [customers, setCustomers] = useState('');
    const [WoNumbers, setWoNumbers] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [approvers, setApprovers] = useState([]);

    const buildChecklistValidation = () => {
        const checklistValidation = {};
        Object.keys(renaultPdiChecklistItemDefinition).forEach(sectionKey => {
            renaultPdiChecklistItemDefinition[sectionKey].forEach(item => {
                checklistValidation[`checklistItems.${sectionKey}.${item.itemKey}.value`] = (value) => (
                    value ? null : "This Field is Required!"
                );
                checklistValidation[`checklistItems.${sectionKey}.${item.itemKey}.image`] = (value) => (
                    value ? null : "An Image is Required for This Item!"
                );
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
        const fetchData = async () => {
            try {
                const brandId = "RT"; // 'RT' for Renault
                const groupId = "DPDPI"; // 'DPDPI' for PDI

                // model/ Type RT API
                const modelResponse = await fetch(`http://127.0.0.1:5000/api/unit-types/RT`);
                if (!modelResponse.ok) throw new Error(`HTTP error! status: ${modelResponse.status}`);
                const modelData = await modelResponse.json();
                setUnitModels(modelData);

                // wo Number API
                const woResponse = await fetch(`http://127.0.0.1:5000/api/work-orders?brand_id=${brandId}&group_id=${groupId}`);
                if (!woResponse.ok) throw new Error(`HTTP error! status: ${woResponse.status}`);
                const woData = await woResponse.json();
                const formattedWoData = woData.map(wo => ({ 
                    value: wo.WONumber, 
                    label: wo.WONumber 
                }));
                setWoNumbers(formattedWoData);

                // customers API
                const customerResponse = await fetch(`http://127.0.0.1:5000/api/customers`);
                if (!customerResponse.ok) throw new Error(`HTTP error! status: ${customerResponse.status}`);
                const customerData = await customerResponse.json();
                const formattedCustomers = customerData.map(customer => ({
                    value: customer.CustomerID,
                    label: customer.CustomerName
                }));
                setCustomers(formattedCustomers);

                 // dummy Technicians API
                const dummyTechniciansData = [
                    { value: "tech1", label: "John Doe" },
                    { value: "tech2", label: "Jane Smith" },
                    { value: "tech3", label: "Peter Jones" }
                ];
                setTechnicians(dummyTechniciansData);

                // dummy Approvers API
                const dummyApproverData = [
                    { value: "app1", label: "Alice Brown" },
                    { value: "app2", label: "Bob White" },
                    { value: "app3", label: "John Green" }
                ];
                setApprovers(dummyApproverData);
                
            } catch (error) {
                console.error("Failed to fetch models:", error);
                notifications.show({
                    title: "Error Loading Data",
                    message: "Failed to load models. Please try again!",
                    color: "red",
                });
            }
        };
        fetchData();
    }, []);

    const handleSubmit = async (values) => {
        const token = localStorage.getItem('access_token');

        if (!token) {
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
        const formData = new FormData();

        const {
            cab,
            exterior,
            lubricationOilAndFluidLevels,
            testDrive,
            underVehicle,
            finish,
        } = values.checklistItems;
        
        const processChecklistItems = (section, sectionKey) => {
            Object.entries(section).forEach(([itemKey, itemValue]) => {
                checklistPayload[`${sectionKey}.${itemKey}.value`] = itemValue.value;
                checklistPayload[`${sectionKey}.${itemKey}.notes`] = itemValue.notes;
                if (itemValue.image) {
                    formData.append(`${sectionKey}.${itemKey}.image`, itemValue.image);
                }
            });
        };
        
        processChecklistItems(cab, 'cab');
        processChecklistItems(exterior, 'exterior');
        processChecklistItems(lubricationOilAndFluidLevels, 'lubricationOilAndFluidLevels');
        processChecklistItems(testDrive, 'testDrive');
        processChecklistItems(underVehicle, 'underVehicle');
        processChecklistItems(finish, 'finish');

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

        formData.append('json_payload', JSON.stringify(payload));
        console.log("Payload to backend: ", payload)

        try {
            const response = await fetch(`http://localhost:5000/api/pre-delivery-inspection/renault/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
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
    
    const renderChecklistItem = (label, sectionKey, itemKey) => {
        const itemData = form.getInputProps(`checklistItems.${sectionKey}.${itemKey}`);
        const hasImage = itemData.value.image instanceof File;
        const imageError = form.errors[`checklistItems.${sectionKey}.${itemKey}.image`];
        const notesError = form.errors[`checklistItems.${sectionKey}.${itemKey}.notes`];

        return (
            <Grid.Col span={{ base: 12 }} key={itemKey}>
                <Stack gap="xs">
                    {/* Text label */}
                    <Text size="sm" style={{ color: '#000000 !important', fontWeight: 500 }}>{label}</Text>
                    <Text size="xs" style={{ color: 'var(--mantine-color-gray-6)' }}>Select one option</Text>

                    {/* Radio of Button Group */}
                    <Radio.Group
                        value={itemData.value.value}
                        onChange={(statusValue) => form.setFieldValue(`checklistItems.${sectionKey}.${itemKey}.value`, statusValue)}
                        orientation="horizontal"
                        error={form.errors[`checklistItems.${sectionKey}.${itemKey}`]}
                    >
                        <Group mt="xs" justify="space-between" style={{ width: '100%' }}>
                            <Radio value="repaired" label={<Text style={{ color: '#000000 !important' }}> Repaired, Without Notes </Text>} />
                            <Radio value="recommended_repair" label={<Text style={{ color: '#000000 !important' }}> Repair Recommended </Text>} />
                            <Radio value="immediately_repair" label={<Text style={{ color: '#000000 !important' }}> Repair Immediately </Text>} />
                            <Radio value="not_applicable" label={<Text style={{ color: '#000000 !important' }}> Not Applicable </Text>} />
                        </Group>
                    </Radio.Group>
                    
                    {/* Dropzone of images */}
                    <Dropzone
                        onDrop={(files) => {
                            if (files.length > 0) {
                                form.setFieldValue(`checklistItems.${sectionKey}.${itemKey}.image`, files[0]);
                            }
                        }}
                        onReject={(files) => {
                            notifications.show({
                                title: 'File Rejected',
                                message: `${files[0].errors[0].message}`,
                                color: 'red',
                            });
                        }}
                        maxFiles={1}
                        accept={[MIME_TYPES.jpeg, MIME_TYPES.png]}
                        mt="xs"
                        error={imageError}
                        style={{ borderColor: imageError ? 'red' : undefined }}
                    >
                        <Group justify="center" gap="xs" style={{ minHeight: rem(80), pointerEvents: 'none' }}>
                            <Dropzone.Accept>
                                <IconUpload style={{ width: rem(40), height: rem(40), color: 'var(--mantine-color-blue-6)' }} stroke={1.5} />
                            </Dropzone.Accept>
                            <Dropzone.Reject>
                                <IconX style={{ width: rem(40), height: rem(40), color: 'var(--mantine-color-red-6)' }} stroke={1.5} />
                            </Dropzone.Reject>
                            <Dropzone.Idle>
                                {hasImage ? (
                                    <IconFile style={{ width: rem(40), height: rem(40), color: 'var(--mantine-color-dimmed)' }} stroke={1.5} />
                                ) : (
                                    <IconFile style={{ width: rem(40), height: rem(40), color: 'var(--mantine-color-dimmed)' }} stroke={1.5} />
                                )}
                            </Dropzone.Idle>
                            <Stack align="center" gap={4}>
                                <Text size="xs" c="dimmed"> {hasImage ? itemData.value.image.name : 'Drag and drop an image here or click to select'} </Text>
                                <Text size="xs" c="dimmed"> Accepted formats: JPG, PNG </Text>
                            </Stack>
                        </Group>
                    </Dropzone>
                    {imageError && (
                        <Text size="sm" c="red" mt={5}>
                            {imageError}
                        </Text>
                    )}
                    
                    <TextInput
                        placeholder="Add Image Caption"
                        mt="xs"
                        value={itemData.value.notes}
                        leftSection={<IconPencil size={20}/>}
                        onChange={(event) => form.setFieldValue(`checklistItems.${sectionKey}.${itemKey}.notes`, event.target.value)}
                        error={notesError}
                    />
                </Stack>
            </Grid.Col>
        );
    };

    const renderChecklistSection = (sectionTitle, sectionKey, items) => {
        return (
            <Card shadow="sm" p="xl" withBorder mb="lg">
                <Title order={3} mb="md" style={{ color: '#000000 !important' }}>{sectionTitle}</Title>
                <Grid gutter="xl">
                    {items.map((item) => (
                        <React.Fragment key={item.itemKey}>
                            {renderChecklistItem(
                                `${item.id}. ${item.label}`,
                                sectionKey,
                                item.itemKey
                            )}
                        </React.Fragment>
                    ))}
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
                    <Title order={3} mb="md" style={{ color: '#000000 !important' }}> Unit Information </Title>
                    <Grid gutter="xl">
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <Select
                                label="WO Number"
                                placeholder="Select WO Number"
                                searchable
                                clearable
                                data={WoNumbers}
                                {...form.getInputProps('repairOrderNo')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <DateInput
                                label="Date"
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
                            <TextInput
                                label="Mileage/ Hour Meter"
                                placeholder="Input Mileage/ Hour Meter"
                                {...form.getInputProps('mileageHourMeter')}
                                styles={{ input: { color: '#000000 !important' } }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <TextInput
                                label="Chassis ID"
                                placeholder="Input Chassis ID"
                                {...form.getInputProps('chassisId')}
                                styles={{ input: { color: '#000000 !important' } }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <TextInput
                                label="Registration Number"
                                placeholder="Input Registration Number"
                                {...form.getInputProps('registrationNo')}
                                styles={{ input: { color: '#000000 !important' } }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <TextInput
                                label="City"
                                placeholder="Input City"
                                {...form.getInputProps('city')}
                                styles={{ input: { color: '#000000 !important' } }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <Select
                                label="Type/ Model"
                                placeholder="Select a Type/ Model"
                                data={unitModels}
                                searchable
                                clearable
                                {...form.getInputProps("model")}
                                renderOption={({ option }) => <Text>{option.label}</Text>}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <TextInput
                                label="Engine"
                                placeholder="Input Engine Number"
                                {...form.getInputProps('engine')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <TextInput
                                label="Axle"
                                placeholder="Input Axle Number"
                                {...form.getInputProps('axle')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <Select
                                label="Technician"
                                placeholder="Select Technician"
                                data={technicians}
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
                                data={approvers}
                                searchable
                                clearable
                                {...form.getInputProps("approvalBy")}
                                renderOption={({ option }) => <Text>{option.label}</Text>}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <TextInput
                                label="VIN"
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
                    "Lubrication, Oil and Fluid Levels",
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
                    "Under Vehicle",
                    "underVehicle",
                    renaultPdiChecklistItemDefinition.underVehicle
                )}
                {renderChecklistSection(
                    "Test Drive",
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