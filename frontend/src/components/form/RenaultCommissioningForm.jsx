"use client";

import React, { useState, useEffect } from "react";
import {
    Box,
    Card,
    Grid,
    Group,
    Title,
    Text,
    TextInput,
    Textarea,
    Table,
    Checkbox,
    Button,
    Stack,
    TableThead,
    TableTr,
    TableTh,
    TableTbody,
    TableTd,
    Select,
    Loader,
} from "@mantine/core";
import { useForm } from '@mantine/form';
import { DateInput } from "@mantine/dates";
import { IconCalendar } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import apiClient from "@/libs/api";

const renaultCommissioningItem = {
    vehiclePhysicalCondition: [
        { id: '001', label: 'Remove & Clean the Protecting Plastic on Window Glass Bottom Side (Right & Left Door Panel)' },
        { id: '002', label: 'Check the Vehicle General View of Paint Condition (Probably Any Scratching During Transportation)' },
        { id: '003', label: 'Check the Cab Condition' },
        { id: '004', label: 'Check the Windscreen Condition' },
        { id: '005', label: 'Check the Windscreen Glass Condition' },
        { id: '006', label: 'Check the Rear View Mirror Condition' },
        { id: '007', label: 'Check the Head Light lens Condition' },
        { id: '008', label: 'Check the Side Light lens Condition' },
        { id: '009', label: 'Remove & Take away all the Paper-sheet labels (Ex-Factory Works Labeling)' },
    ],
    bodyCarresoryAssembledCondition: [
        { id: '010', label: 'Remove & Clean the Protecting Plastic on Window Glass Bottom Side (Right & Left Door Panel)' },
        { id: '011', label: 'Check, There\'s No Any Parts of Body Carresory on Touching Condition with Moving Component Parts of RENAULT Assembly' },
        { id: '012', label: 'Check Attachment Body with Chassis (Bolts & Nuts)' },
    ],
    vehicleEquipmentAvailability: [
        { id: '013', label: 'Spare Starting Key' },
        { id: '014', label: 'Spare Door Panel Key' },
        { id: '015', label: 'Hydraulic Jack and Bar Handle' },
        { id: '016', label: 'Wheel Nut Wrench' },
        { id: '017', label: 'Safety Triangle' },
        { id: '018', label: 'Tyre Inflate Flexible Hose' },
        { id: '019', label: 'Drivers Manual Hand Book' },
        { id: '020', label: 'Spare Wheel' },
        { id: '021', label: 'Tools Kit + Bag' },
    ],
    checkLevels: [
        { id: '022', label: 'Engine Oil Level' },
        { id: '023', label: 'Engine Coolant Level' },
        { id: '024', label: 'Clutch Hydraulic Oil Level' },
        { id: '025', label: 'Gearbox Oil Level' },
        { id: '026', label: 'Transfer Box Oil Level' },
        { id: '027', label: 'Steering Hydraulic Oil Level' },
        { id: '028', label: 'Front Drive Axle + Hub Reduction Oil Level' },
        { id: '029', label: 'Middle Drive Axle + Hub Reduction Oil Level' },
        { id: '030', label: 'Rear Drive Axle + Hub Reduction Oil Level' },
        { id: '031', label: 'Rear Suspension Boogie-Pivot Oil Level' },
        { id: '032', label: 'Cab Tilting Hydraulic Oil Level' },
        { id: '033', label: 'Battery Electrolyte Level' },
        { id: '034', label: 'Windscreen Washer Tank Water Level' },
    ],
    majorUnitForLeaks: [
        { id: '035', label: 'Engine: Oil' },
        { id: '036', label: 'Engine: Coolant' },
        { id: '037', label: 'Engine: Fuel' },
        { id: '038', label: 'Clutch Hydraulic Oil' },
        { id: '039', label: 'Transmission Gearbox/ PTO/ Oil-Cooler/ Oil-Coolant' },
        { id: '040', label: 'Transferbox Oil/ Oil-Cooler/ Oil-Coolant' },
        { id: '041', label: 'Power Steering Hydraulic Oil' },
        { id: '042', label: 'Front Drive Axle & Hub Reduction Oil' },
        { id: '043', label: 'Middle Axle & Hub Reduction Oil' },
        { id: '044', label: 'Rear Axle & Hub Reduction Oil' },
        { id: '045', label: 'Brake Air System' },
        { id: '046', label: 'Cab Tilting Hydraulic Oil' },
    ],
    generalChecking: [
        { id: '047', label: 'Front & Rear Suspension Spring Leaf Condition' },
        { id: '048', label: 'Front Shock Absorber Condition and Attachment' },
        { id: '049', label: 'Front Anti-Roll Bar Condition and Attachment' },
        { id: '050', label: 'Torque Rod Condtion and Attachment' },
        { id: '051', label: 'Condition and Tension of All Drive Belts' },
        { id: '052', label: 'Fuel Piping Condition and Attachment' },
        { id: '053', label: 'Water Piping Condition and Attachment' },
        { id: '054', label: 'Radiator Mounting Condition and Attachment' },
        { id: '055', label: 'Air Intake Piping Condition and Attachment' },
        { id: '056', label: 'Front & Rear Engine Mounting Condition and Attachment' },
        { id: '057', label: 'Clutch Hydraulic Circuit Condition and Attachment' },
        { id: '058', label: 'Clutch Wear Indicator/ Clutch Fork Position' },
        { id: '059', label: 'Transmission Gearbox belt housing: Bolt Tightness' },
        { id: '060', label: 'Clutch Pedal Correct Adjustment (Free Play)' },
        { id: '061', label: 'Transmission Gearbox Mounting' },
        { id: '062', label: 'Transferbox Mounting' },
        { id: '063', label: 'Steering Piping Condition and Attachment' },
        { id: '064', label: 'Tyre Condition and Inflate Air Pressure' },
        { id: '065', label: 'Wheel Nut Tightness' },
        { id: '066', label: 'Position of Control Arm & Operating Clearanceof Automatic Brake Slack Adjuster' },
        { id: '067', label: 'Brake Pedal Correct Adjustment (Free Play)' },
        { id: '068', label: 'Braking Circuit & Air-System for Leaks' },
        { id: '069', label: 'Condition of Front Brake Cylinder for Leaks' },
        { id: '070', label: 'Condition of Middle Brake Cylinder for Leaks' },
        { id: '071', label: 'Condition of Rear Brake Cylinder for Leaks' },
        { id: '072', label: 'Grease All Point' },
        { id: '073', label: 'Drain the Fuel Prefilter Sediment Bowl' },
        { id: '074', label: 'Clean and Apply Grease on Batteries Terminal' },
        { id: '075', label: 'Cab Tilting Device Correct Condition and Leaks' },
        { id: '076', label: 'Setting of Headlights' },
        { id: '077', label: 'Correct Operation of Air Filter Clogged Indicator Warning Light by Closing Method Through the Engine Air Intake' },
        { id: '078', label: 'Check Head Light Operation' },
        { id: '079', label: 'Check Signal Lighting Operation' },
        { id: '080', label: 'Check Stop and Reversing Light' },
        { id: '081', label: 'Check Horn Operation' },
        { id: '082', label: 'Check the Working Operation of Power Window' },
        { id: '083', label: 'Check the Working Operation of Driver-Seat Adjustment' },
        { id: '085', label: 'Correct Operation of Engine Exhaust Brake' },
    ],
    roadTest: [
        { id: '086', label: 'Check the Working Operation of Inter-Axle Differential Lock' },
        { id: '087', label: 'Check the Working Operation of Inter-Wheel Differential Lock' },
        { id: '088', label: 'Check the Working Operation of "LOW SPEED" range of Transferbox' },
        { id: '089', label: 'Check the Working Operation of Power Take Off (PTO)' },
        { id: '090', label: 'Check the FUSE BOX equipment, the FUSE Element must be Complete Condition' },
    ],
}

const majorComponents = [
    { component: 'Engine Assembly', make: '', typeModel: '', serialNumber: '', partNumber: '', remarks: '' },
    { component: 'Fuel Injection', make: '', typeModel: '', serialNumber: '', partNumber: '', remarks: '' },
    { component: 'Turbocharger', make: '', typeModel: '', serialNumber: '', partNumber: '', remarks: '' },
    { component: 'Steering Box', make: '', typeModel: '', serialNumber: '', partNumber: '', remarks: '' },
    { component: 'Transmission', make: '', typeModel: '', serialNumber: '', partNumber: '', remarks: '' },
    { component: 'Transfer Case', make: '', typeModel: '', serialNumber: '', partNumber: '', remarks: '' },
    { component: 'Front Axle Head', make: '', typeModel: '', serialNumber: '', partNumber: '', remarks: '' },
    { component: 'Second Front Axle Head (Only for 8x8)', make: '', typeModel: '', serialNumber: '', partNumber: '', remarks: '' },
    { component: 'Middle Axle Head', make: '', typeModel: '', serialNumber: '', partNumber: '', remarks: '' },
    { component: 'Rear Axle Head', make: '', typeModel: '', serialNumber: '', partNumber: '', remarks: '' },
    { component: 'Body Assembly', make: '', typeModel: '', serialNumber: '', partNumber: '', remarks: '' },
    { component: 'Power Take Off', make: '', typeModel: '', serialNumber: '', partNumber: '', remarks: '' },
    { component: 'Hydraulic Pump', make: '', typeModel: '', serialNumber: '', partNumber: '', remarks: '' },
    { component: 'Tipping Cylinder', make: '', typeModel: '', serialNumber: '', partNumber: '', remarks: '' },
    { component: 'Fifth Wheel', make: '', typeModel: '', serialNumber: '', partNumber: '', remarks: '' },
];

export function RenaultCommissioningForm() {
    const [unitModels, setUnitModels] = useState([]);
    const [woNumbers, setWoNumbers] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [approvers, setApprovers] = useState([]);
    const [provinces, setProvinces] = useState([]);
    const [dealerCode, setDealerCode] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    const form = useForm({
        initialValues: (() => {
            const initialChecklist = {};
            const initialNotes = {};
            Object.keys(renaultCommissioningItem).forEach(sectionKey => {
                initialChecklist[sectionKey] = {};
                initialNotes[sectionKey] = '';
                renaultCommissioningItem[sectionKey].forEach(item => {
                    initialChecklist[sectionKey][item.id] = false;
                });
            });

            return {
                jobCardNo: '',
                date: null,
                dealer: null,
                woNumber: null,
                technician: null,
                approvalBy: null,

                VIN: '',
                CAM: '',
                FABNo: '',
                vehicleType: null,
                deliveryDate: null,

                companyName: null,
                location: null,
                contactPerson: '',
                application: '',
                regFleetNo: '',
                majorComponents: majorComponents.map(comp => ({ ...comp })),
                checklistItems: initialChecklist,
                checklistNotes: initialNotes,

                inspectorSignature: null,
                inspectorSignatureDate: null,
                supervisorSignature: null,
                supervisorSignatureDate: null,
            };
        })(),

        validate: {
            jobCardNo: (value) => (value ? null : "Job Card Number is Required!"),
            date: (value) => (value ? null : "Date is Required!"),
            dealer: (value) => (value ? null : "Dealer is Required!"),
            woNumber: (value) => (value ? null : "WO Number is Required!"),
            technician: (value) => (value ? null : "Technician is Required!"),
            approvalBy: (value) => (value ? null : "Approval By is Required!"),
            VIN: (value) => (value ? null : "VIN Number is Required!"),
            CAM: (value) => (value ? null : "CAM Data is Required!"),
            FABNo: (value) => (value ? null : "FAB Number is Required!"),
            vehicleType: (value) => (value ? null : "Vehicle Type is Required!"),
            deliveryDate: (value) => (value ? null : "Delivery Date is Required!"),
            companyName: (value) => (value ? null : "Company Name is Required!"),
            location: (value) => (value ? null : "Location Name is Required!"),
            contactPerson: (value) => (value ? null : "Contact Person is Required!"),
            application: (value) => (value ? null : "Application is Required!"),
            regFleetNo: (value) => (value ? null : "Reg/ Fleet No is Required!"),
            inspectorSignature: (value) => (value ? null : "Inspector Signature is Required!"),
            inspectorSignatureDate: (value) => (value ? null : "Inspector Signature Date is Required!"),
            supervisorSignature: (value) => (value ? null : "Supervisor Signature is Required!"),
            supervisorSignatureDate: (value) => (value ? null : "Supervisor Signature Date is Required!"),
        },
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const brandId = "RT"; // 'RT' for Renault
                const groupId = "COMM"; // 'COMM' for Commissioning
                const [
                    modelRes,
                    woRes,
                    customerRes,
                    provinceRes,
                    techRes,
                    supervisorRes,
                    techHeadRes,
                ] = await Promise.all([
                    apiClient.get(`/unit-types/${brandId}`),
                    apiClient.get(`/work-orders?brand_id=${brandId}&group_id=${groupId}`),
                    apiClient.get("/customers"),
                    apiClient.get("/provinces"),
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
                console.error("Failed to fetch models:", error);
                notifications.show({
                    title: "Error Loading Data",
                    message: "Failed to load models. Please try again!",
                    color: "red",
                });
            
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSubmit = async (values) => {
        setUploading(true);

        try {
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

            const payload = {
                brand: 'renault',
                reportInfo: {
                    jobCardNo: values.jobCardNo,
                    date: values.date,
                    dealer: values.dealer,
                    woNumber: values.woNumber,
                    technician: values.technician,
                    approvalBy: values.approvalBy,
                },
                unitInfo: {
                    VIN: values.VIN,
                    CAM: values.CAM,
                    FABNo: values.FABNo,
                    vehicleType: values.vehicleType,
                    deliveryDate: values.deliveryDate,
                    application: values.application,
                    regFleetNo: values.regFleetNo,
                },
                customerInfo: {
                    companyName: values.companyName,
                    location: values.location,
                    contactPerson: values.contactPerson,
                },
                majorComponents: values.majorComponents,
                checklist: {
                    items: values.checklistItems,
                    notes: values.checklistNotes,
                },
                signatures: {
                    inspectorSignature: values.inspectorSignature,
                    inspectorSignatureDate: values.inspectorSignatureDate,
                    supervisorSignature: values.supervisorSignature,
                    supervisorSignatureDate: values.supervisorSignatureDate,
                }
            };

            console.log("handleSubmit payload:", payload);

            await apiClient.post(`/commissioning/renault/submit`, payload, {
            });

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

    const renderChecklistSection = (sectionTitle, sectionKey, items) => {
        return (
            <Card shadow="sm" p="lg" radius="md" withBorder mb="lg" key={sectionKey}>
                <Title order={4} mb="md">{sectionTitle}</Title>
                <Grid gutter="xl">
                    {items.map((item) => (
                        <Grid.Col span={{ base: 12, sm: 6, md: 6 }} key={item.id}>
                            <Checkbox
                                label={`${item.id}. ${item.label}`}
                                {...form.getInputProps(`checklistItems.${sectionKey}.${item.id}`, { type: 'checkbox' })}
                            />
                        </Grid.Col>
                    ))}
                </Grid>
                <Stack mt="md">
                    <Text fw={500}>Note:</Text>
                    <Textarea
                        placeholder="Add notes for this section..."
                        {...form.getInputProps(`checklistNotes.${sectionKey}`)}
                        minRows={3}
                    />
                </Stack>
            </Card>
        );
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
                c="var(--mantine-color-text)"
            > 
                Commissioning Form
            </Title>

            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Card shadow="sm" p="xl" withBorder mb="lg">
            <Title order={3} mb="md" c="var(--mantine-color-text)"> Report Information </Title>
                    <Grid>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <TextInput
                                label="Job Card Number"
                                placeholder="Input Job Card Number"
                                {...form.getInputProps('jobCardNo')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <Select
                                label="WO Number"
                                placeholder="Select WO Number"
                                data={woNumbers}
                                searchable
                                {...form.getInputProps('woNumber')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <Select
                                label="Dealer"
                                placeholder="Select Dealer"
                                data={dealerCode}
                                searchable
                                {...form.getInputProps('dealer')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <DateInput
                                label="Date of Check"
                                placeholder="Select Date"
                                leftSection={<IconCalendar size={18} />}
                                {...form.getInputProps('date')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <Select
                                label="Technician"
                                placeholder="Select Technician"
                                data={technicians}
                                searchable
                                {...form.getInputProps('technician')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <Select
                                label="Approval By"
                                placeholder="Select Approver"
                                data={approvers}
                                searchable
                                {...form.getInputProps('approvalBy')}
                            />
                        </Grid.Col>
                    </Grid>
                </Card>

                <Card shadow="sm" p="xl" withBorder mb="lg">
                    <Title order={3} mb="md" c="var(--mantine-color-text)"> Vehicle Details </Title>
                    <Grid>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <Select
                                label="Type/ Model"
                                placeholder="Select Type/ Model"
                                data={unitModels}
                                searchable
                                {...form.getInputProps('vehicleType')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <TextInput label="VIN" placeholder="Input VIN Number" {...form.getInputProps('VIN')} />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <TextInput label="CAM" placeholder="Input CAM" {...form.getInputProps('CAM')} />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <TextInput label="FAB Number" placeholder="Input FAB Number" {...form.getInputProps('FABNo')} />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <DateInput
                                label="Delivery Date"
                                placeholder="Select Delivery Date"
                                leftSection={<IconCalendar size={18} />}
                                {...form.getInputProps('deliveryDate')}
                            />
                        </Grid.Col>
                    </Grid>
                </Card>

                <Card shadow="sm" p="xl" withBorder mb="lg">
                    <Title order={3} mb="md" c="var(--mantine-color-text)"> Customer Details </Title>
                    <Grid>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <Select
                                label="Customer"
                                placeholder="Select Customer"
                                data={customers}
                                searchable
                                clearable
                                {...form.getInputProps('companyName')}
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
                            <TextInput label="Contact Person" placeholder="Input Contact Person" {...form.getInputProps('contactPerson')} />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <TextInput label="Application" placeholder="Input Application" {...form.getInputProps('application')} />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <TextInput label="Registration/ Fleet No" placeholder="Input Registration/ Fleet Number" {...form.getInputProps('regFleetNo')} />
                        </Grid.Col>
                    </Grid>
                </Card>

                <Card shadow="sm" p="xl" withBorder mb="lg">
                    <Title order={3} mb="md" c="var(--mantine-color-text)"> Major Components </Title>
                    <Table striped withRowBorders={false}>
                        <TableThead>
                            <TableTr>
                                <TableTh> Component </TableTh>
                                <TableTh> Make </TableTh>
                                <TableTh> Type/ Model </TableTh>
                                <TableTh> Serial Number </TableTh>
                                <TableTh> Part Number </TableTh>
                                <TableTh> Remarks </TableTh>
                            </TableTr>
                        </TableThead>
                        <TableTbody>
                            {form.values.majorComponents.map((item, index) => (
                                <TableTr key={index}>
                                    <TableTd>{item.component}</TableTd>
                                    <TableTd>
                                        <TextInput
                                            placeholder="Make"
                                            {...form.getInputProps(`majorComponents.${index}.make`)}
                                        />
                                    </TableTd>
                                    <TableTd>
                                        <TextInput
                                            placeholder="Type/ Model"
                                            {...form.getInputProps(`majorComponents.${index}.typeModel`)}
                                        />
                                    </TableTd>
                                    <TableTd>
                                        <TextInput
                                            placeholder="Serial Number"
                                            {...form.getInputProps(`majorComponents.${index}.serialNumber`)}
                                        />
                                    </TableTd>
                                    <TableTd>
                                        <TextInput
                                            placeholder="Part Number"
                                            {...form.getInputProps(`majorComponents.${index}.partNumber`)}
                                        />
                                    </TableTd>
                                    <TableTd>
                                        <TextInput
                                            placeholder="Remarks"
                                            {...form.getInputProps(`majorComponents.${index}.remarks`)}
                                        />
                                    </TableTd>
                                </TableTr>
                            ))}
                        </TableTbody>
                    </Table>
                </Card>

                <Card shadow="sm" p="xl" withBorder mb="lg">
                    <Title order={3} mb="md" c="var(--mantine-color-text)"> Inspection Test </Title>
                    {Object.keys(renaultCommissioningItem).map(sectionKey => (
                        <div key={sectionKey}>
                            {renderChecklistSection(
                                {
                                    vehiclePhysicalCondition: 'I. Vehicle Physical Condition',
                                    bodyCarresoryAssembledCondition: 'II. Body Carresory Assembled Condition',
                                    vehicleEquipmentAvailability: 'III. Vehicle Equipment Availability',
                                    checkLevels: 'IV. Check Levels',
                                    majorUnitForLeaks: 'V. Major Unit For Leaks',
                                    generalChecking: 'VI. General Checking',
                                    roadTest: 'VII. Road Test',
                                }[sectionKey],
                                sectionKey,
                                renaultCommissioningItem[sectionKey]
                            )}
                        </div>
                    ))}
                </Card>

                <Card shadow="sm" p="xl" withBorder mb="lg">
                    <Title order={3} mb="md" c="var(--mantine-color-text)"> Signature </Title>
                    <Grid gutter="xl">
                        <Grid.Col span={{ base: 12, md: 6 }}>
                            <Select
                                label="Inspector Signature"
                                placeholder="Select Inspector"
                                clearable
                                searchable
                                data={technicians}
                                {...form.getInputProps('inspectorSignature')}
                            />
                            <DateInput
                                label="Date"
                                placeholder="Select Date"
                                mt="md"
                                {...form.getInputProps('inspectorSignatureDate')}
                                rightSection={<IconCalendar size={16} />}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6 }}>
                            <Select
                                label="Supervisor Signature"
                                placeholder="Select Supervisor"
                                clearable
                                searchable
                                data={approvers}
                                {...form.getInputProps('supervisorSignature')}
                            />
                            <DateInput
                                label="Date"
                                placeholder="Select Date"
                                mt="md"
                                {...form.getInputProps('supervisorSignatureDate')}
                                rightSection={<IconCalendar size={16} />}
                            />
                        </Grid.Col>
                    </Grid>
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
