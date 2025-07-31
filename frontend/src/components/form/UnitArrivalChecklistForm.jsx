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
import { notifications } from "@mantine/notifications";

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
			typeModel: (value) => (value ? null : "Type/Model is Required!"),
			vin: (value) => (value ? null : "VIN is Required!"),
			noChassis: (value) => (value ? null : "No. Chassis is Required!"),
			noEngine: (value) => (value ? null : "No. Engine is Required!"),
			dateOfCheck: (value) => (value ? null : "Date of Check is Required!"),
			technician: (value) => (value ? null : "Technician is Required!"),
			approvalBy: (value) => (value ? null : "Approval By is Required!"), 

			// form validation which every radio button must be fulfill
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
        console.log("DEBUG: form.values.dateOfCheck changed:", form.values.dateOfCheck);
        console.log("DEBUG: Is it a Date object?", form.values.dateOfCheck instanceof Date);
        console.log("DEBUG: Is it NaN?", isNaN(form.values.dateOfCheck));
    }, [form.values.dateOfCheck]);

	// effect to load data model from API
	useEffect(() => {
		const fetchDropdownData = async () => {
			// data model units
			try {
				const modelResponse = await fetch("http://127.0.0.1:5000/api/unit-types/RT");
				if (!modelResponse.ok) {
					throw new Error(`HTTP error! status: ${modelResponse.status}`);
				}
				const modelData = await modelResponse.json();
				setUnitModels(modelData);
			} catch (error) {
				console.error("Error fetching unit models:", error);
				notifications.show({
					title: "Error Loading Data",
					message: "Failed to Load Unit Models. Please Try Again!",
					color: "red",
				});
			}

			// set technician
			// dummy models
			const dummyTechnicians = [
				{ value: "tech1", label: "John Doe" },
                { value: "tech2", label: "Jane Smith" },
                { value: "tech3", label: "Peter Jones" }
			];
			setTechnicians(dummyTechnicians);

			// later with API
			/* try {
				const techResponse = await fetch("http://127.0.0.1:5000/api/technicians");
				if (!techResponse.ok) {
					throw new Error(`HTTP error status! ${techResponse.status}`)
				}
				const techData = await techResponse.json();
				setTechnician(techData.map(item => ({ value: item.code, label: item.name })));
			} catch (error) {
				console.error("Error fetching technician:", error);
				notifications.show({
					title: "Error Loading Data",
					message: "Failed to Load Technician Name. Please Try Again!",
					color: "red",
				});
			} */

			// set approval
			// dummy models
			const dummyApprover = [
				{ value: "app1", label: "Alice Brown" },
                { value: "app2", label: "Bob White" },
                { value: "app3", label: "John Green" }
			];
			setApprovers(dummyApprover);

			// later with API
			/* try {
				const appResponse = await fetch("http://127.0.0.1:5000/api/approvers");
				if (!appResponse.ok) {
					throw new Error(`HTTP error status! ${appResponse.status}`)
				}
				const appData = await appResponse.json();
				setApprovers(appData.map(item => ({ value: item.code, label: item.name })));
			} catch (error) {
				console.error("Error fetching approver:", error);
				notifications.show({
					title: "Error Loading Data",
					message: "Failed to Load Approver Name. Please Try Again!",
					color: "red",
				});
			} */
		};

		fetchDropdownData();
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
		console.log("Form Submitted (Frontend Data)", values);

		const brand = "renault";

		const token = localStorage.getItem('access_token');
		if (!token) {
			notifications.show({
				title: "Authentication Required",
				message: "Please log in to submit the form.",
				color: "red",
			});
			return;
		}

		const vinExists = await checkVinExists(values.vin);
		if (vinExists) {
			notifications.show({
				title: "Submission Blocked",
                message: "VIN already Exist! Please enter a unique VIN.",
                color: "red",
			});
			return;
		}

		const formattedValues = { ...values };
		
		if (typeof formattedValues.dateOfCheck === 'string' && formattedValues.dateOfCheck) {
            const dateObj = new Date(formattedValues.dateOfCheck);
				if (!isNaN(dateObj.getTime())) {
					formattedValues.dateOfCheck = dateObj.toISOString();
					console.log("DEBUG Frontend: dateOfCheck successfully converted and sent to backend:", formattedValues.dateOfCheck);
				} else {
					formattedValues.dateOfCheck = null;
					console.log("DEBUG Frontend: dateOfCheck string is invalid, sending null.");
				}
        } else if (formattedValues.dateOfCheck instanceof Date && !isNaN(formattedValues.dateOfCheck.getTime())) {
            formattedValues.dateOfCheck = formattedValues.dateOfCheck.toISOString();
            console.log("DEBUG Frontend: dateOfCheck (Date object) sent to backend:", formattedValues.dateOfCheck);
        }
        else {
            formattedValues.dateOfCheck = null;
            console.log("DEBUG Frontend: dateOfCheck is null or invalid (not string/Date), sending null.");
        }

		try {
			const response = await fetch(`http://127.0.0.1:5000/api/arrival-check/${brand}/submit`, { 
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${token}`
				},
				body: JSON.stringify(formattedValues),
			});
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || "Failed to submit checklist");
			}

			const result = await response.json();
			notifications.show({
				title: "Success!",
				message: result.message ||"Form Submitted Successfully!",
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

	return (
		<Box maw="100%" mx="auto" px="md">
			<Title order={1} mt="md" mb="lg"> Unit Arrival Check </Title>
			<form onSubmit={form.onSubmit(handleSubmit)}>
				<Card shadow="sm" padding="lg" radius="md" withBorder mb="lg">
					<Title order={3} mb="md"> Unit Information </Title>
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
						<Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
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
						<Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
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
					</Grid>
				</Card>

				<Title order={3} mb="md"> Arrival Checklist </Title>
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
					<Button type="submit">Submit</Button>
				</Group>
			</form>
		</Box>
	);
}
