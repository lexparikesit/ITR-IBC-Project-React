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
    Select,
    Radio,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { IconCalendar } from "@tabler/icons-react";
import { useForm } from '@mantine/form';
import { notifications } from "@mantine/notifications";

// Definisi item checklist untuk Manitou (struktur data sesuai PDF)
const manitouChecklistItemsDefinition = {
    engine: [
        { id: '01', label: 'Air Filter', itemKey: 'airFilter' },
        { id: '02', label: 'Fuel Filter', itemKey: 'fuelFilter' },
        { id: '03', label: 'Fuel Pipes and Filters', itemKey: 'fuelPipeFilters' },
        { id: '04', label: 'Injection / Carburation System', itemKey: 'injectionCarburationSystem' },
        { id: '05', label: 'Radiator and Cooling Systems', itemKey: 'radiatorCoolingSystems' },
        { id: '06', label: 'Belts', itemKey: 'belts' },
        { id: '07', label: 'Hoses', itemKey: 'hosesEngine' },
    ],
    transmission: [
        { id: '01', label: 'Reversing System', itemKey: 'reversingSystem' },
        { id: '02', label: 'Gear Oil Leaks', itemKey: 'gearOilLeaks' },
        { id: '03', label: 'Direction Disconnect Pedal', itemKey: 'directionDisconnectPedal' },
        { id: '04', label: 'Clutch', itemKey: 'clutch' },
    ],
    axleTransferBox: [
        { id: '01', label: 'Operation and Tightness', itemKey: 'operationTightness' },
        { id: '02', label: 'Adjustment of Stops', itemKey: 'adjustmentStops' },
    ],
    hydraulicHydrostaticCircuits: [
        { id: '01', label: 'Oil Tank', itemKey: 'oilTank' },
        { id: '02', label: 'Pumps and Coupling', itemKey: 'pumpsCoupling' },
        { id: '03', label: 'Tightness of Unions', itemKey: 'tightnessOfUnions' },
        { id: '04', label: 'Lifting Rams', itemKey: 'liftingRams' },
        { id: '05', label: 'Tilting Rams', itemKey: 'tiltingRams' },
        { id: '06', label: 'Accessory Rams', itemKey: 'accessoryRams' },
        { id: '07', label: 'Telescope Rams', itemKey: 'telescopeRams' },
        { id: '08', label: 'Compensating Rams', itemKey: 'compensatingRams' },
        { id: '09', label: 'Steering Rams', itemKey: 'steeringRams' },
        { id: '10', label: 'Control Valves', itemKey: 'controlValves' },
        { id: '11', label: 'Counterbalance Valve', itemKey: 'counterBalanceValve' },
    ],
    brakingCircuits: [
        { id: '01', label: 'Service Brake & Parking Brake Operation', itemKey: 'serviceBrakeParkingBrakeOperation' },
        { id: '02', label: 'Brake Fluid Level (if applicable)', itemKey: 'brakeFluidLevel' },
    ],
    lubrication: [
        { id: '01', label: 'Lubrication', itemKey: 'lubrication' },
    ],
    boomMastManiscopicManicess: [
        { id: '01', label: 'Boom & Telescopes', itemKey: 'boomTelescopes' },
        { id: '02', label: 'Wear Pads', itemKey: 'wearPads' },
        { id: '03', label: 'Linkage', itemKey: 'linkage' },
        { id: '04', label: 'Carriage', itemKey: 'carriageBooms' },
        { id: '05', label: 'Forks', itemKey: 'forksBooms' }
    ],
    mastUnit: [
        { id: '01', label: 'Fixed & Movable Mast(s)', itemKey: 'fixedMovableMast' },
        { id: '02', label: 'Carriage', itemKey: 'carriageMast' },
        { id: '03', label: 'Chains', itemKey: 'chains' },
        { id: '04', label: 'Rollers', itemKey: 'rollers' },
        { id: '05', label: 'Forks', itemKey: 'forksMastUnit' },
    ],
    accessories: [
        { id: '01', label: 'Adaptation to Machine', itemKey: 'adaptationToMachine' },
        { id: '02', label: 'Hydraulic Connections', itemKey: 'hydraulicConnections' },
    ],
    cabProtectiveDeviceElectricCircuit: [
        { id: '01', label: 'Seat', itemKey: 'seat' },
        { id: '02', label: 'Control Panel & Radio', itemKey: 'controlPanelRadio' },
        { id: '03', label: 'Horn & Warning Light, Safety Device', itemKey: 'hornWarningLightSafetyDevice' },
        { id: '04', label: 'Heating & Air Conditioning', itemKey: 'heatingAirConditioning' },
        { id: '05', label: 'Windscreen Wiper / Washer', itemKey: 'windscreenWiperWasher' },
        { id: '06', label: 'Horns', itemKey: 'horns' },
        { id: '07', label: 'Backup Alarm', itemKey: 'backupAlarm' },
        { id: '08', label: 'Lighting', itemKey: 'lighting' },
        { id: '09', label: 'Additional Lighting', itemKey: 'additionalLighting' },
        { id: '10', label: 'Rotating Beacon', itemKey: 'rotatingBeacon' },
        { id: '11', label: 'Battery', itemKey: 'battery' },
    ],
    wheels: [
        { id: '01', label: 'Rims', itemKey: 'rims' },
        { id: '02', label: 'Tires & Pressure', itemKey: 'tiresPressure' },
    ],
    // Other items (flat structure in state, not nested)
    otherItems: [
        { id: '01', label: 'Screws and Nuts', itemKey: 'screwsNuts' },
        { id: '02', label: 'Frame and Body', itemKey: 'frameBody' },
        { id: '03', label: 'Name Plate', itemKey: 'namePlate' },
        { id: '04', label: 'General Operation', itemKey: 'generalOperation' },
        { id: '05', label: 'Operator\'s Manual', itemKey: 'operatorsManual' },
        { id: '06', label: 'Instructions for Customer', itemKey: 'instructionsForCustomer' },
    ],
};


export function UnitArrivalInspectionForm() {
    // State to store models fetched from API
    const [modelsData, setModelsData] = useState([]);
    const [technicians, setTechniciansData] = useState([]);
    const [approvers, setApproversData] = useState([]);

    const generateChecklistValidation = () => {
        let validationRules =  {};
        Object.keys(manitouChecklistItemsDefinition).forEach(sectionKey => {
            if (sectionKey === 'otherItems') {
                manitouChecklistItemsDefinition[sectionKey].forEach(item => {
                    validationRules[item.itemKey] = (value) => value ? null : 'Please Select an Option';
                });
            } else {
                manitouChecklistItemsDefinition[sectionKey].forEach(item => {
                    validationRules[`${sectionKey}.${item.itemKey}`] = (value) => value ? null : 'Please Select an Option';
                });
            }
        });
        return validationRules;
    };

    // Initialize useForm with all fields
    const form = useForm({
        initialValues: (() => {
            const initialManitouValues = {
                model: null,
                serialNo: "", // VIN
                hourMeter: "",
                dateOfCheck: null,
                technician: null,
                approver: null,
                generalRemarks: "",
            };

            // Dynamically add checklist items to initial values
            Object.keys(manitouChecklistItemsDefinition).forEach(sectionKey => {
                if (sectionKey === 'otherItems') {
                    manitouChecklistItemsDefinition[sectionKey].forEach(item => {
                        initialManitouValues[item.itemKey] = ""; // Flat structure for otherItems
                    });
                } else {
                    initialManitouValues[sectionKey] = {}; // Nested object for sections
                    manitouChecklistItemsDefinition[sectionKey].forEach(item => {
                        initialManitouValues[sectionKey][item.itemKey] = "";
                    });
                }
            });
            return initialManitouValues;
        })(),

        validate: {
            model: (value) => (value ? null : 'Model is Required!'),
            serialNo: (value) => (value ? null : 'VIN is Required!'),
            hourMeter: (value) => {
                if (!value) return 'Hour Meter is Required!';
                if (isNaN(Number(value))) return 'Hour Meter Must be a Number!';
                if (Number(value) < 0) return 'Hour Meter Cannot be Negative!';
                return null;
            },
            dateOfCheck: (value) => (value ? null : 'Date of Check is Required!'),
            technician: (value) => (value ? null : 'Technician is Required!'),
            approver: (value) => (value ? null : 'Approver is Required!'),
            ...generateChecklistValidation(), //
        }
    });

    // useEffect to fetch models from backend
    useEffect(() => {
        const fetchModels = async () => {
            try {
                // API mstType
                const response = await fetch('http://127.0.0.1:5000/api/unit-types/MA');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                const formattedModels = data
                    .filter(item => item.value !== null && item.value !== undefined && item.label !== null && item.label !== undefined) // Filter berdasarkan 'value' dan 'label'
                    .map(item => ({
                        value: item.value,
                        label: item.label
                    }));
                setModelsData(formattedModels);
            } catch (error) {
                console.error("Failed to fetch models:", error);
                notifications.show({
                    title: "Error Loading Data",
                    message: "Failed to load models. Please try again!",
                    color: "red",
                });
                setModelsData([]);
            }
            // set technician
			// dummy models
			const dummyTechniciansData = [
				{ value: "tech1", label: "John Doe" },
                { value: "tech2", label: "Jane Smith" },
                { value: "tech3", label: "Peter Jones" }
			];
			setTechniciansData(dummyTechniciansData);

            // later with API
            /* try {
                const response = await fetch('http://127.0.0.1:5000/api/technicians');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                const formattedTechnicians = data
                    .filter(item => item.value !== null && item.value !== undefined && item.label !== null && item.label !== undefined)
                    .map(item => ({
                        value: item.value,
                        label: item.label
                    }));
                setTechniciansData(formattedTechnicians);
            } catch (error) {
                console.error("Failed to fetch technicians:", error);
                notifications.show({
                    title: "Error Loading Data",
                    message: "Failed to load technicians. Please try again!",
                    color: "red",
                });
                setTechniciansData([]);
            } */

            // set approval
			// dummy models
			const dummyApproverData = [
				{ value: "app1", label: "Alice Brown" },
                { value: "app2", label: "Bob White" },
                { value: "app3", label: "John Green" }
			];
			setApproversData(dummyApproverData);

            // later with API
            /* try {
                const response = await fetch('http://127.0.0.1:5000/api/approvers');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                const formattedApprovers = data
                    .filter(item => item.value !== null && item.value !== undefined && item.label !== null && item.label !== undefined)
                    .map(item => ({
                        value: item.value,
                        label: item.label
                    }));
                setApproversData(formattedApprovers);
            } catch (error) {
                console.error("Failed to fetch approvers:", error);
                notifications.show({
                    title: "Error Loading Data",
                    message: "Failed to load approvers. Please try again!",
                    color: "red",
                });
                setApproversData([]);
            } */
        };

        fetchModels();
    }, []);

    const checkVinExists = async (vin) => {
		const token = localStorage.getItem('access_token');
		
		if (!token) {
			console.warn("No authentication token found for VIN check.");
			notifications.show({
				title: "Authentication Required",
				message: "Please log in to perform VIN check.",
				color: "red",
			});
			return false; 
		}

		try {
			const response = await fetch(`http://127.0.0.1:5000/api/arrival-check/check-vin/${vin}`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${token}`
				},
			});

			if (!response.ok) {
				const errorText = await response.text();
				notifications.show({
					title: "VIN Check Failed",
					message: `Server error during VIN verification. Please try again.`,
					color: "red",
				});
				return true;
			}
			const data = await response.json();
			return data.exists;
		} catch (error) {
			console.error("Network Error or Failed to Check VIN:", error);
			notifications.show({
				title: "Network Error",
                message: "Failed to verify VIN. Check your internet connection.",
                color: "red",
			});
			return true;
		}
	};

    const handleSubmit = async (values) => {
        console.log('Form Submitted (Frontend Data)', values);

        const token = localStorage.getItem('access_token');
        if (!token) {
            notifications.show({
                title: "Authentication Required",
                message: "Please log in to submit the form.",
                color: "red",
            });
            return;
        }

        if (values.serialNo) {
            const vinExists = await checkVinExists(values.serialNo);
            if (vinExists) {
                notifications.show({
                    title: "Submission Blocked",
                    message: "VIN already exists! Please enter a unique VIN.",
                    color: "red",
                });
                return;
            }
        }

        const payload = {
            brand: 'manitou', // Hardcoded for Manitou
            
            unitInfo: {
                model: values.model,
                serialNo: values.serialNo,
                hourMeter: values.hourMeter,
                dateOfCheck: (values.dateOfCheck instanceof Date && !isNaN(values.dateOfCheck)) 
                            ? values.dateOfCheck.toISOString() 
                            : null,
            },
            technician: values.technician,
            approver: values.approver,
            generalRemarks: values.generalRemarks,
            checklistItems: {}, // Initialize checklistItems object
        };

        // Populate checklistItems from form values
        Object.keys(manitouChecklistItemsDefinition).forEach(sectionKey => {
            if (sectionKey === 'otherItems') {
                manitouChecklistItemsDefinition[sectionKey].forEach(item => {
                    if (item.itemKey === 'namePlate') {
                        payload.checklistItems['namePlate'] = values[item.itemKey];
                    } else if (item.itemKey === 'generalOperation') {
                        payload.checklistItems['general'] = values[item.itemKey];
                    } else {
                        payload.checklistItems[item.itemKey] = values[item.itemKey];
                    }
                });
            } else {
                payload.checklistItems[sectionKey] = values[sectionKey];
            }
        });

        console.log("Payload to Backend: ", payload);

        try {
            const response = await fetch(`http://127.0.0.1:5000/api/arrival-check/manitou/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to submit checklist');
            }

            const result = await response.json();
            notifications.show({
                title: "Success",
                message: result.message || 'Form submitted successfully!',
                color: "green",
            });
            form.reset(); // Reset form after successful submission

        } catch (error) {
            console.error('Error submitting form:', error);
            notifications.show({
                title: "Submission Error",
                message: error.message || "An unexpected error occurred. Please try again.",
                color: "red",
            });
        }
    };

    const renderChecklistItem = (label, formProps, spanValue, key) => {
        return (
            <Grid.Col span={spanValue} key={key}>
                <Stack gap="xs">
                    <Text size="sm" style={{ color: '#000000 !important', fontWeight: 500 }}>{label}</Text>

                    <Radio.Group
                        {...formProps}
                        orientation="horizontal"
                        spacing="xl"
                    >
                        <Group mt="xs">
                            <Radio value="Good" label={<Text style={{ color: '#000000 !important' }}>Good</Text>} />
                            <Radio value="Missing" label={<Text style={{ color: '#000000 !important' }}>Missing</Text>} />
                            <Radio value="Bad" label={<Text style={{ color: '#000000 !important' }}>Bad</Text>} />
                        </Group>
                    </Radio.Group>
                </Stack>
            </Grid.Col>
        );
    };

    // Helper for checklist Render
    const renderChecklistSection = (sectionTitle, sectionKey, items) => {
        return (
            <Card shadow="sm" p="xl" withBorder mb="lg">
                <Title order={3} mb="md" style={{ color: '#000000 !important' }}>{sectionTitle}</Title>
                <Grid gutter="xl">
                    {items.map((item) => ( 
                        renderChecklistItem(
                            `${item.id}. ${item.label}`, 
                            form.getInputProps(`${sectionKey}.${item.itemKey}`),
                            { base: 12, sm: 6 },
                            `${sectionKey}-${item.itemKey}`
                        )
                    ))}
                </Grid>
            </Card>
        );
    };

    // Helper for other's checklist
    const renderOtherItemsSection = (items) => {
        return (
            <Card shadow="sm" p="xl" withBorder mb="lg">
                <Title order={3} mb="md" style={{ color: '#000000 !important' }}> 12. Other Item </Title>
                <Grid gutter="xl">
                    {items.map((item) => ( // Index dihapus
                        renderChecklistItem(
                            `${item.id} ${item.label}`,
                            form.getInputProps(item.itemKey),
                            { base: 12, sm: 6 },
                            `other-${item.itemKey}`
                        )
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
            >
                Unit Arrival Check
            </Title>

            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Card shadow="sm" p="xl" withBorder mb="lg">
                    <Title order={3} mb="md" style={{ color: '#000000 !important' }}> Unit Information </Title>
                    <Grid gutter="xl">
                        <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
                            <Select
                                label={<Text style={{ color: '#000000 !important' }}> Type/ Model </Text>}
                                placeholder="Select Model"
                                data={modelsData}
                                searchable
                                clearable
                                {...form.getInputProps('model')}
                                renderOption={({ option }) => (
                                    <Text c='black'>{option.label}</Text>
                                )}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
                            <TextInput
                                label={<Text style={{ color: '#000000 !important' }}> VIN </Text>}
                                placeholder="Input VIN Number"
                                {...form.getInputProps('serialNo')}
                                styles={{ input: { color: '#000000 !important' } }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
                            <TextInput
                                label={<Text style={{ color: '#000000 !important' }}> Hour Meter </Text>}
                                placeholder="Input Hour Meter"
                                {...form.getInputProps('hourMeter')}
                                styles={{ input: { color: '#000000 !important' } }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
                            <DateInput
                                label={<Text style={{ color: '#000000 !important' }}> Date of Check </Text>}
                                placeholder="Select Date"
                                valueFormat="DD-MM-YYYY"
                                {...form.getInputProps('dateOfCheck')}
                                onChange={(value) => {
                                    console.log("DateInput onChange value:", value);
                                    const parsedDate = value ? new Date(value) : null;
                                    console.log("DateInput onChange value (parsed):", parsedDate);
                                    form.setFieldValue('dateOfCheck', parsedDate);
                                }}
                                rightSection={<IconCalendar size={16} />}
                                styles={{
                                    input: { color: '#000000 !important' },
                                    calendarHeaderControl: { color: '#000000 !important' },
                                    calendarHeader: { color: '#000000 !important' },
                                    weekday: { color: '#000000 !important' },
                                    day: { color: '#000000 !important', fontSize: 'var(--mantine-font-size-sm)', padding: 'var(--mantine-spacing-xs)' },
                                    month: { color: '#000000 !important', fontSize: 'var(--mantine-font-size-sm)' },
                                    year: { color: '#000000 !important', fontSize: 'var(--mantine-font-size-sm)' },
                                    pickerControl: { color: '#000000 !important' },
                                    pickerControlActive: { color: '#000000 !important' },
                                    monthPicker: { color: '#000000 !important' },
                                    yearPicker: { color: '#000000 !important' },
                                    dropdown: {
                                        backgroundColor: 'white',
                                    }
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
                            <Select
                                label={<Text style={{ color: '#000000 !important' }}> Technician </Text>}
                                placeholder="Select Technician"
                                data={technicians}
                                searchable
                                clearable
                                {...form.getInputProps('technician')}
                                renderOption={({ option }) => (
                                    <Text c='black'>{option.label}</Text>
                                )}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
                            <Select
                                label={<Text style={{ color: '#000000 !important' }}> Approval By </Text>}
                                placeholder="Select Approver"
                                data={approvers}
                                searchable
                                clearable
                                {...form.getInputProps('approver')}
                                renderOption={({ option }) => (
                                    <Text c='black'>{option.label}</Text>
                                )}
                            />
                        </Grid.Col>
                    </Grid>
                </Card>

                <Title order={3} mb="md" style={{ color: '#000000 !important' }}> Arrival Checklist </Title>

                {/* Render sections based on manitouChecklistItemsDefinition */}
                {Object.keys(manitouChecklistItemsDefinition).filter(key => key !== 'otherItems').map(sectionKey => (
                    <div key={sectionKey}>
                        {renderChecklistSection(
                            // Map sectionKey to a readable title as per PDF
                            {
                                engine: "01. Engine",
                                transmission: "02. Transmission",
                                axleTransferBox: "03. Axles / Transfer Box",
                                hydraulicHydrostaticCircuits: "04. Hydraulic / Hydrostatic Circuits",
                                brakingCircuits: "05. Braking Circuits",
                                lubrication: "06. Lubrication",
                                boomMastManiscopicManicess: "07. Boom / Mast Maniscopic / Manices",
                                mastUnit: "08. Mast Unit",
                                accessories: "09. Accessories",
                                cabProtectiveDeviceElectricCircuit: "10. Cab / Protective Device / Electric Circuit",
                                wheels: "11. Wheels",
                            }[sectionKey] || sectionKey, // Fallback to sectionKey if not found
                            sectionKey,
                            manitouChecklistItemsDefinition[sectionKey]
                        )}
                    </div>
                ))}

                {/* Render other items section */}
                {renderOtherItemsSection(manitouChecklistItemsDefinition.otherItems)}

                <Divider my="xl" />
                <Title order={3} mb="md" style={{ color: '#000000 !important' }}> General Remarks </Title>
                <Textarea
                    placeholder="Add any general remarks here..."
                    minRows={4}
                    mb="xl"
                    {...form.getInputProps('generalRemarks')}
                />

                <Group justify="flex-end" mt="md">
                    <Button type="submit">Submit</Button>
                </Group>
            </form>
        </Box>
    );
}

export default UnitArrivalInspectionForm;