"use client";

import { useState, useEffect } from "react";
import {
	Box,
	Title,
	Text,
	TextInput,
	Textarea,
	Grid,
	Card,
	Button,
	Group,
	Divider,
	Stack,
	Radio,
	Select,
	Loader,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { IconCalendar } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import apiClient from "@/libs/api";

const CHECKLIST_DATA_RENAULT = {
	chassisAndCab: [
		{ id: "1", label: "Check Cabin and Surround Condition" },
		{ id: "2", label: "Check Front and Rear Towing Condition" },
		{ id: "3", label: "Check VIN and Engine Number" },
		{ id: "4", label: "Check Front Windscreen and Window Glass Condition" },
		{ id: "5", label: "Check ID and Rear View Mirror, Front View Mirror" },
		{ id: "6", label: "Check All Lamps Condition" },
		{ id: "7", label: "Check the L/R & RR Footstep, Mudguard, and Front Grille" },
		{ id: "8", label: "Check the Wiper, Sunroof, and Unit Logo (Emblem)" },
	],
	axleSpringTyre: [
		{ id: "1", label: "Check All Tires Condition, Including Spare Tyre" },
		{ id: "2", label: "Check All Axle (Front, Middle, and Rear)" },
		{ id: "3", label: "Check All Front and Rear Spring Condition" },
		{ id: "4", label: "Check All Tires Condition, Including Spare Tyre" },
	],
	battery: [
		{ id: "1", label: "Check Battery Condition Using Battery Analyzer" },
		{ id: "2", label: "Check Battery Electrolyte and the Voltage" },
	],
	electrical: [
		{ id: "1", label: "Check All Lighting Condition (Headlamp, Tail Lamp, Strobe)" },
		{ id: "2", label: "Check Stop Lamp, Reverse Lamp, and Alarm Function" },
		{ id: "3", label: "Check Strobe Lamp, Headlamp, and Tail Lamp Function" },
		{ id: "4", label: "Check All Gauges, Pilot Lamp, and Display Function" },
		{ id: "5", label: "Check Electrical Power and Horn" },
		{ id: "6", label: "Check Headlamp Protection" },
	],
	additionalEquipment: [
		{ id: "1", label: "Check Safety Belt, Tools Kit, Operator Manual, Hyd. Jack" },
		{ id: "2", label: "Check the Key, Fuel Tank Condition" },
		{ id: "3", label: "Check Tachograph and Radio" },
	],
	functionalCheck: [
		{ id: "1", label: "Engine Running Test" },
		{ id: "2", label: "Test Braking System, Front, Rear, and Parking Brake" },
		{ id: "3", label: "Test Steering Function" },
		{ id: "4", label: "Test Display Function and Error Code" },
	],
};

const ChecklistRadioItem = ({
	label,
	statusFormProps,
	remarksFormProps,
	showRemarks,
	span,
}) => {
	return (
		<Grid.Col span={span}>
			<Stack gap="xs">
				<Text size="sm">{label}</Text>
				<Radio.Group
					description="Select one option"
					{...statusFormProps}
					orientation="horizontal"
				>
					<Group mt="xs" spacing="md">
						<Radio value="checked_with_remarks" label="Checked, With Remarks" />
						<Radio value="checked_without_remarks" label="Checked, Without Remarks" />
					</Group>
				</Radio.Group>

				{showRemarks && (
					<Textarea
						placeholder="Enter Remarks Here"
						rows={2}
						autosize
						minRows={2}
						maxRows={4}
						{...remarksFormProps}
					/>
				)}
			</Stack>
		</Grid.Col>
	);
};

export function UnitArrivalChecklistForm() {
	const [unitModels, setUnitModels] = useState([]);
	const [technicians, setTechnicians] = useState([]);
	const [approvers, setApprovers] = useState([]);
	const [woNumbers, setWoNumbers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [uploading, setUploading] = useState(false);
	const currentChecklistData = CHECKLIST_DATA_RENAULT;

	const form = useForm({
		initialValues: (() => {
			const initial = {
				woNumber: null,
				// woNumber: "",
				typeModel: null,
				vin: "",
				noChassis: "",
				noEngine: "",
				dateOfCheck: null,
				technician: null,
				approvalBy: null,
				generalRemarks: "",
			};

			Object.keys(CHECKLIST_DATA_RENAULT).forEach((sectionKey) => {
				CHECKLIST_DATA_RENAULT[sectionKey].forEach((item) => {
					const fieldNamePrefix = `${sectionKey}_${item.id}`;
					initial[`${fieldNamePrefix}_status`] = "";
					initial[`${fieldNamePrefix}_remarks`] = "";
				});
			});
			return initial;
		})(),
		validate: {
			typeModel: (value) => (value ? null : "Type/ Model is Required!"),
			woNumber: (value) => (value ? null : "WO Number is Required!"),
			vin: (value) => (value ? null : "VIN is Required!"),
			noChassis: (value) => (value ? null : "Chassis Number is Required!"),
			noEngine: (value) => (value ? null : "Engine Number is Required!"),
			dateOfCheck: (value) => (value ? null : "Date of Check is Required!"),
			technician: (value) => (value ? null : "Technician is Required!"),
			approvalBy: (value) => (value ? null : "Approval By is Required!"), 

			...Object.keys(CHECKLIST_DATA_RENAULT).reduce((acc, sectionKey) => {
				CHECKLIST_DATA_RENAULT[sectionKey].forEach((item) => {
					const statusFieldName = `${sectionKey}_${item.id}_status`;
					acc[statusFieldName] = (value) =>
						value ? null : "This Field is Required!"
				});
				return acc;
			}, {}),
		},
	});

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true)
			try {
				const brandId = "RT"; // 'RT' for Renault Trucks
                const groupId = "AI"; // 'AI' for Arrival Inspection
				const [
					modelRes,
					woRes,
					techRes,
					supervisorRes,
					techHeadRes,
				] = await Promise.all([
					apiClient.get(`/unit-types/${brandId}`),
					apiClient.get(`/work-orders?brand_id=${brandId}&group_id=${groupId}`),
					apiClient.get("/users/by-role/Technician"),
					apiClient.get("/users/by-role/Supervisor"),
					apiClient.get("/users/by-role/Technical Head")
				])

				setUnitModels(modelRes.data);
				setWoNumbers(woRes.data.map(wo => ({ value: wo.WONumber, label: wo.WONumber })));
				setTechnicians(techRes.data);
				setApprovers([...supervisorRes.data, ...techHeadRes.data]);

			} catch (error) {
				console.error("Error fetching data:", error);
				notifications.show({
					title: "Error Loading Data",
					message: `Failed to load data: ${error.message}. Please try again.`,
					color: "red",
				});
			
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, []);

	const checkVinExists = async (vin) => {
		try {
			const response = await apiClient.get(`/arrival-check/check-vin/${vin}`);
			const data = response.data;
			return data.exists;
		
		} catch (error) {
			notifications.show({
				title: "VIN Check Failed",
				message: "Unable to verify VIN. Please try again.",
				color: "red",
			});
			return true;
		}
	};

	const handleSubmit = async (values) => {
		console.log("Form Submitted (Frontend Data)", values);
		setUploading(true);

		const vinExists = await checkVinExists(values.vin);
		if (vinExists) {
			notifications.show({
				title: "Submission Blocked",
                message: "VIN already Exist! Please enter a unique VIN.",
                color: "red",
			});
			return;
		}

		const payload = {
			brand: 'renault',
			unitInfo: {
				woNumber: values.woNumber,
				typeModel: values.typeModel, 
				VIN: values.vin,
				noEngine: values.noEngine,
				chassisNumber: values.noChassis,
				dateOfCheck: values.dateOfCheck,
				technician: values.technician,
				approvalBy: values.approvalBy,
			},
			remarks: values.generalRemarks,
			checklistItems: {},
		};

		Object.keys(CHECKLIST_DATA_RENAULT).forEach((sectionKey) => {
			payload.checklistItems[sectionKey] = {};
			CHECKLIST_DATA_RENAULT[sectionKey].forEach((item) => {
				const statusFieldName = `${sectionKey}_${item.id}_status`;
				const remarksFieldName = `${sectionKey}_${item.id}_remarks`;
				
				payload.checklistItems[sectionKey][`RT_${sectionKey}_${item.id}`] = {
					status: values[statusFieldName],
					remarks: values[remarksFieldName] || "",
				};
			});
		});

		try {
			const response = await apiClient.post("/arrival-check/renault/submit", payload);
			notifications.show({
				title: "Success!",
				message: "Form Submitted Successfully!",
				color: "green",
			})
			form.reset();
			
		} catch (error) {
			console.error("Error submitting form:", error);
			notifications.show({
				title: "Submission Error",
                message: `Error: ${error.message}`,
                color: "red",
			});
		
		} finally {
			setUploading(false);
		}
	};

	const renderChecklistSection = (sectionTitle, sectionKey, items) => {
		return (
			<Card shadow="sm" padding="lg" radius="md" withBorder mb="lg">
				<Title order={3} mb="md"> {sectionTitle} </Title>
				<Grid gutter="xl">
					{items.map((item) => {
						const statusFieldName = `${sectionKey}_${item.id}_status`;
						const remarksFieldName = `${sectionKey}_${item.id}_remarks`;

						return (
							<ChecklistRadioItem
								key={item.id}
								label={`${item.id}. ${item.label}`}
								statusFormProps={form.getInputProps(statusFieldName)}
								remarksFormProps={form.getInputProps(remarksFieldName)}
								showRemarks={
									form.values[statusFieldName] === "checked_with_remarks"
								}
								span={{ base: 12, sm: 6, md: 3 }}
							/>
						);
					})}
				</Grid>
			</Card>
		);
	};

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
			<Title order={1} mt="md" mb="lg" c="var(--mantine-color-text)"> Unit Arrival Check </Title>
			<form onSubmit={form.onSubmit(handleSubmit)}>
				<Card shadow="sm" padding="lg" radius="md" withBorder mb="lg">
					<Title order={3} mb="md" c="var(--mantine-color-text)"> Unit Information </Title>
					<Grid gutter="md">
						<Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
							<Select
								label="WO Number"
								placeholder="Select WO Number"
								data={woNumbers}
								searchable
								{...form.getInputProps("woNumber")}
							/>
							{/* <TextInput
								label="WO Number"
								placeholder="Input WO Number"
								{...form.getInputProps("woNumber")}
							/> */}
						</Grid.Col>
						<Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
							<Select
								label="Type/ Model"
								placeholder="Select Model"
								data={unitModels}
								searchable
								clearable
								{...form.getInputProps("typeModel")}
							/>
						</Grid.Col>
						<Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
							<TextInput
								label="No. Chassis"
								placeholder="Input Chassis Number"
								{...form.getInputProps("noChassis")}
							/>
						</Grid.Col>
						<Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
							<TextInput
								label="No. Engine"
								placeholder="Input Engine Number"
								{...form.getInputProps("noEngine")}
							/>
						</Grid.Col>
						<Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
							<TextInput
								label="VIN"
								placeholder="Input VIN Number"
								{...form.getInputProps("vin")}
							/>
						</Grid.Col>
						<Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
							<DateInput
								label="Date of Check"
								placeholder="Select Date"
								{...form.getInputProps("dateOfCheck")}
								rightSection={<IconCalendar size={16} />}
							/>
						</Grid.Col>
						<Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
							<Select
                                label="Technician"
                                placeholder="Select Technician"
                                data={technicians}
                                searchable
                                clearable
                                {...form.getInputProps("technician")}
                            />
						</Grid.Col>
						<Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
							<Select
                                label="Approval By"
                                placeholder="Select Approver"
                                data={approvers}
                                searchable
                                clearable
                                {...form.getInputProps("approvalBy")}
                            />
						</Grid.Col>
					</Grid>
				</Card>

				<Divider my="xl" label={<Text style={{ color: 'var(--mantine-color-text) !important' }}>Legend</Text>} labelPosition="center" />
					<Group justify="center" gap="xl" mb="lg">
						<Text style={{ color: 'var(--mantine-color-text) !important' }}> 1: Check Without Remarks </Text>
						<Text style={{ color: 'var(--mantine-color-text) !important' }}> 0: Check With Remarks </Text>
					</Group>
				<Divider my="xl" />

				{Object.keys(currentChecklistData).map((sectionKey) => {
					const sectionTitleMap = {
						chassisAndCab: "Chassis & Cab",
						axleSpringTyre: "Axle, Spring, and Tyre",
						battery: "Battery",
						electrical: "Electrical Check",
						additionalEquipment: "Additional Equipment Check",
						functionalCheck: "Functional Check",
					};
					const displayTitle = sectionTitleMap[sectionKey] || sectionKey;
					const items = currentChecklistData[sectionKey];

					return (
						<div key={sectionKey}>
							{renderChecklistSection(displayTitle, sectionKey, items)}
						</div>
					);
				})}

				<Card shadow="sm" padding="lg" radius="md" withBorder mb="lg">
					<Title order={3} mb="md">General Remarks</Title>
					<Textarea
						placeholder="Add any general remarks here..."
						autosize
						minRows={4}
						{...form.getInputProps("generalRemarks")}
					/>
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
