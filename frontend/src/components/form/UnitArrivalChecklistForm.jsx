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
	Stack,
	Radio,
	Select,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { IconCalendar } from "@tabler/icons-react";

const CHECKLIST_DATA_RENAULT = {
	chassisAndCab: [
		{ id: "1", label: "Check Cabin and Surround Condition" },
		{ id: "2", label: "Check Front and Rear Towing Condition" },
		{ id: "3", label: "Check VIN and Engine Number" },
		{ id: "4", label: "Check Front Windscreen and Window Glass Condition" },
		{ id: "5", label: "Check ID and Rear View Mirror, Front View Mirror" },
		{ id: "6", label: "Check All Lamps Condition" },
		{
			id: "7",
			label: "Check the L/R & RR Footstep, Mudguard, and Front Grille",
		},
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
		{
			id: "1",
			label: "Check All Lighting Condition (Headlamp, Tail Lamp, Strobe)",
		},
		{ id: "2", label: "Check Stop Lamp, Reverse Lamp, and Alarm Function" },
		{ id: "3", label: "Check Strobe Lamp, Headlamp, and Tail Lamp Function" },
		{ id: "4", label: "Check All Gauges, Pilot Lamp, and Display Function" },
		{ id: "5", label: "Check Electrical Power and Horn" },
		{ id: "6", label: "Check Headlamp Protection" },
	],
	additionalEquipment: [
		{
			id: "1",
			label: "Check Safety Belt, Tools Kit, Operator Manual, Hyd. Jack",
		},
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
						<Radio
							value="checked_without_remarks"
							label="Checked, Without Remarks"
						/>
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
	// state for saving data model from API
	const [unitModels, setUnitModels] = useState([]);

	//const selectedBrand = 'renault';
	const currentChecklistData = CHECKLIST_DATA_RENAULT;

	const form = useForm({
		initialValues: (() => {
			const initial = {
				brand: "renault",
				typeModel: null,
				vin: "",
				noChassis: "",
				noEngine: "",
				dateOfCheck: null,
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
			typeModel: (value) => (value ? null : "Type/Model is required"),
			vin: (value) => (value ? null : "VIN is required"),
			noChassis: (value) => (value ? null : "No. Chassis is required"),
			noEngine: (value) => (value ? null : "No. Engine is required"),
			dateOfCheck: (value) => (value ? null : "Date of Check is required"),
		},
	});

	// effect to load data model from API
	useEffect(() => {
		const fetchUnitModels = async () => {
			try {
				const response = await fetch("http://127.0.0.1:5000/api/unit-types/RT");
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				const data = await response.json();
				setUnitModels(data);
			} catch (error) {
				console.error("Error fetching unit models:", error);
				setUnitModels([]);
			}
		};

		fetchUnitModels();
	}, [form.values.brand]);

	const handleSubmit = async (values) => {
		console.log("Form Submitted (Frontend Data)", values);

		const brand = "renault";

		const formattedValues = { ...values };

		if (
			formattedValues.dateOfCheck instanceof Date &&
			!isNaN(formattedValues.dateOfCheck)
		) {
			const day = String(formattedValues.dateOfCheck.getDate()).padStart(
				2,
				"0"
			);
			const month = String(formattedValues.dateOfCheck.getMonth() + 1).padStart(
				2,
				"0"
			);
			const year = formattedValues.dateOfCheck.getFullYear();
			formattedValues.dateOfCheck = `${day}-${month}-${year}`;
		} else {
			formattedValues.dateOfCheck = null;
		}

		try {
			const response = await fetch(
				"http://127.0.0.1:5000/api/arrival-check/renault/submit",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(values),
				}
			);

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || "Failed to submit checklist");
			}

			const result = await response.json();
			alert(result.message || "Form submitted successfully");
			form.reset();
		} catch (error) {
			console.error("Error submitting form:", error);
			alert(`Error: ${error.message}`);
		}
	};

	const renderChecklistSection = (sectionTitle, sectionKey, items) => {
		return (
			<Card shadow="sm" padding="lg" radius="md" withBorder mb="lg">
				<Title order={3} mb="md">
					{sectionTitle}
				</Title>
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

	return (
		<Box maw="100%" mx="auto" px="md">
			<Title order={1} mt="md" mb="lg">
				Unit Arrival Check
			</Title>
			<form onSubmit={form.onSubmit(handleSubmit)}>
				<Card shadow="sm" padding="lg" radius="md" withBorder mb="lg">
					<Title order={3} mb="md">
						Unit Information
					</Title>
					<Grid gutter="md">
						<Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
							<Select
								label="Type/Model"
								placeholder="Select a Model"
								data={unitModels}
								searchable
								clearable
								{...form.getInputProps("typeModel")}
								renderOption={({ option }) => <Text>{option.label}</Text>}
							/>
						</Grid.Col>
						<Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
							<TextInput
								label="No. Chassis"
								placeholder="Input a Chassis Number"
								{...form.getInputProps("noChassis")}
							/>
						</Grid.Col>
						<Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
							<TextInput
								label="No. Engine"
								placeholder="Input a Engine Number"
								{...form.getInputProps("noEngine")}
							/>
						</Grid.Col>
						<Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
							<TextInput
								label="VIN"
								placeholder="Input a VIN Number"
								{...form.getInputProps("vin")}
							/>
						</Grid.Col>
						<Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
							<DateInput
								label="Date of Check"
								placeholder="Select Date"
								{...form.getInputProps("dateOfCheck")}
								valueFormat="DD/MM/YYYY"
								rightSection={<IconCalendar size={16} />}
							/>
						</Grid.Col>
					</Grid>
				</Card>

				<Title order={3} mb="md">
					Arrival Checklist
				</Title>
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
					<Title order={3} mb="md">
						General Remarks
					</Title>
					<Textarea
						placeholder="Add any general remarks here..."
						autosize
						minRows={3}
						{...form.getInputProps("generalRemarks")}
					/>
				</Card>

				<Group justify="flex-end" mt="md">
					<Button type="submit">Submit Checklist</Button>
				</Group>
			</form>
		</Box>
	);
}
