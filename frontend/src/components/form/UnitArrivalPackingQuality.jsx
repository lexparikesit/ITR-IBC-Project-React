"use client";

import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Card, 
    Group,
    Grid,
    rem,
    Text,
    TextInput,
    Textarea,
    Title,
    useMantineTheme,
    Select,
    Flex,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { IconCalendar } from "@tabler/icons-react";
import { IconCircleCheck, IconCircleDashed } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

export function ArrivingPackingQuality() {
    const theme = useMantineTheme();
    const [unitModels, setUnitModels] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [approvers, setApprovers] = useState([]);
    const [woNumbers, setWoNumbers] = useState([]);
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const brandId = "SDLG"; // 'SDLG' for SDLG
                const groupId = "AI"; // 'AI' for Arrival Inspection
                
                // model/ Type SDLG API
                const modelResponse = await fetch(`http://127.0.0.1:5000/api/unit-types/${brandId}`);
                if (!modelResponse.ok) throw new Error(`HTTP error! status: ${modelResponse.status}`);
                const modelData = await modelResponse.json();
                const formattedModels = modelData
                    .filter(item => item.value !== null && item.value !== undefined && item.label !== null && item.label !== undefined)
                    .map(item => ({
                        value: item.value,
                        label: item.label
                    }));
                setUnitModels(formattedModels);

                // wo Number API
				const woResponse = await fetch(`http://127.0.0.1:5000/api/work-orders?brand_id=${brandId}&group_id=${groupId}`);
				if (!woResponse.ok) throw new Error(`HTTP error! status: ${woResponse.status}`);
				const woData = await woResponse.json();
				const formattedWoData = woData.map(wo => ({ 
					value: wo.WONumber, 
					label: wo.WONumber 
				}));
				setWoNumbers(formattedWoData);

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

    const form = useForm({
        initialValues: {
            // unit info
            woNumber: null,
            model: null,
            distributionName: '',
            containerNo: '',
            leadSealingNo: '',
            vin: '',
            dateOfCheck: '',
            inspectorSignature: null,
            approverSignature: null,

            // importation
            unitLanded: null,
            clearanceCustom: null,
            unitStripping: null,

            // S/N Checklist
            sn1: false,
            sn2: false,
            sn3: false,
            sn4: false,
            sn5: false,
            sn6: false,
            sn7: false,
            sn8: false,
            sn9: false,
            sn10: false,
            sn11: false,

            remarks: '',
        },
        validate: {
            woNumber: (value) => (value ? null : 'WO Number is Required!'),
            model: (value) => (value ? null : 'Type/ Model is Required!'),
            distributionName: (value) => (value ? null : 'Distribution Name is Required!'),
            containerNo: (value) => (value ? null : 'Container Number is Required!'),
            leadSealingNo: (value) => (value ? null : 'Lead Sealing Number is Required!'),
            vin: (value) => (value ? null : 'VIN is Required!'),
            dateOfCheck: (value) => (value ? null : "Date of Check is Required!"),
            inspectorSignature: (value) => (value ? null : 'Inpsector Signature is Required!'),
            approvers: (value) => (value ? null : 'Approver is Required!'),
            unitLanded: (value) => (value ? null : 'Unit Landed Date is Required!'),
            unitStripping: (value) => (value ? null : 'Unit Stripping Date is Required!'),
            clearanceCustom: (value) => (value ? null : 'Celarance & Custom is Required!'),
            approverSignature: (value) => (value ? null : 'Approver Signature is Required!'),
        }
    });

    const technicalRequirements = [
        "Disassembled spare parts have been protected, packed, or fixed as required. There is no mistake in assembly, no corrosion or damage.",
        "No scratch or corrosion on the loader appearance, no abscission on the paint.",
        "No leakage in the machine or the disassembled pipes, which have been fixed well. No greasy dirt on the ground of the container.",
        "For wheel loader and road machinery, check if the disassembled axle and brake pipelines are fixed properly, brake joints are well-packed.",
        "No scratch on the surface of the disassembled cabin, no damage on the internal or cover. No greasy dirt, handprint(footprint), the parts and components of the cabin table-board have been put in order and fixed.",
        "For wheel loader and road machinery, check if the quantity of bolts and nuts are correct when the rim, front/rear axle and drive shaft are disassembled. For excavator, check if the bolts and pins are correct when the cab, arm and bucket are disassembled.",
        "Check if the bolts are put back to the same position when the component is removed, check if the appearance is clean and undamaged, and check if the transportation support is in good condition (if any).",
        "All the parts have been fixed properly after the entire wheel loader settled in the container. No breakage or looseness in the binding rope.",
        "Spare parts or documents have been placed properly in the container. No parts or documents damaged or lost.",
        "The container is in good condition, without damaging the container wall or floor, no oil leakage was found.",
        "[Unit Assembly]: Unit has already assembled befor arrival check done",
    ];

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
        const token = localStorage.getItem('access_token');
        
        if (!token) {
            notifications.show({
                title: "Authentication Required",
                message: "Please log in again. Authentication token is missing.",
                color: "red",
            });
            return;
        }

        if (values.vin) {
            const vinExists = await checkVinExists(values.vin);
            if (vinExists) {
                notifications.show({
                    title: "Submission Blocked",
                    message: "VIN already exists! Please enter a unique VIN.",
                    color: "red",
                });
                return;
            }
        }
        
        console.log("Form submitted with values:", values);

        const checklistItems = technicalRequirements.map((req, index) => {
        const snKey = `sn${index + 1}`;
        return {
                ItemName: req,
                status: values[snKey],
                remarks: null
            };
        });

        const payload = {
            brand: 'SDLG',
            unitInfo: {
                woNumber: values.woNumber,
                model: values.model,
                distributionName: values.distributionName,
                containerNo: values.containerNo,
                leadSealingNo: values.leadSealingNo,
                VIN: values.vin,
                dateOfCheck: values.dateOfCheck ? new Date(values.dateOfCheck).toISOString() : null,
                technician: values.inspectorSignature,
                approvalBy: values.approverSignature,
            },
            importationInfo: {
                unitLanded: values.unitLanded ? new Date(values.unitLanded).toISOString() : null,
                clearanceCustom: values.clearanceCustom === 'Yes',
                unitStripping: values.unitStripping ? new Date(values.unitStripping).toISOString() : null,
            },
            checklistItems: checklistItems,
            remarks: values.remarks,
        };

        try {
            const response = await fetch('http://127.0.0.1:5000/api/arrival-check/sdlg/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to submit SDLG Arrival Check");
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
                    <Title order={3} mb="md"> Unit Information </Title>
                    <Grid gutter="xl">
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <Select
                                label="WO Number"
                                placeholder="Select WO Number"
                                clearable
                                searchable
                                data={woNumbers}
                                {...form.getInputProps('woNumber')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <TextInput
                                label='Distribution Name'
                                placeholder='Input Distribution Name'
                                {...form.getInputProps('distributionName')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <TextInput
                                label='Container No.'
                                placeholder='Input Container No.'
                                {...form.getInputProps('containerNo')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <TextInput
                                label='Lead Sealing No.'
                                placeholder='Input Lead Sealing No.'
                                {...form.getInputProps('leadSealingNo')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <Select
                                label="Type/ Model"
                                placeholder="Select Model"
                                clearable
                                searchable
                                data={unitModels}
                                {...form.getInputProps('model')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <TextInput
                                label='VIN'
                                placeholder='Input VIN Number'
                                {...form.getInputProps('vin')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <DateInput
                                label="Date of Check"
                                placeholder="Select Date"
                                valueFormat="DD-MM-YYYY"
                                {...form.getInputProps('dateOfCheck')}
                                rightSection={<IconCalendar size={16} />}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <DateInput
                                label="Unit Landed Date"
                                placeholder="Select Unit Landed Date"
                                valueFormat="DD-MM-YYYY"
                                {...form.getInputProps('unitLanded')}
                                rightSection={<IconCalendar size={16} />}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <Select
                                label="Clearance & Custom"
                                placeholder="Select status"
                                data={['Yes', 'No']}
                                {...form.getInputProps('clearanceCustom')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <DateInput
                                label="Unit Stripping Date"
                                placeholder="Select Unit Stripping Date"
                                valueFormat="DD-MM-YYYY"
                                {...form.getInputProps('unitStripping')}
                                rightSection={<IconCalendar size={16} />}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <Select
                                label="Technician"
                                placeholder="Select Technician"
                                clearable
                                searchable
                                data={technicians}
                                {...form.getInputProps('inspectorSignature')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                            <Select
                                label="Approval By"
                                placeholder="Select Approver"
                                clearable
                                searchable
                                data={approvers}
                                {...form.getInputProps('approverSignature')}
                            />
                        </Grid.Col>
                    </Grid>
                    
                    <Title order={4} mt="xl" mb="md"> Check and Technical Requirements and Assembly Unit </Title>
                    <Box>
                        {technicalRequirements.map((req, index) => (
                        <Grid 
                            key={index} 
                            align="flex-start"
                            gutter="xs" 
                            mb="sm" 
                            p="xs" 
                            sx={(theme) => ({
                                border: `1px solid ${theme.colors.gray[3]}`,
                                borderRadius: theme.radius.md,
                            })} 
                        >
                            <Grid.Col span={{ base: 12, sm: 8 }}>
                                <Group spacing="xs">
                                    <Flex align="flex-start" gap="xs">
                                        <Box style={{ width: rem(18), height: rem(18) }}>
                                            {form.values[`sn${index + 1}`] === true ? (
                                                <IconCircleCheck style={{ width: rem(18), height: rem(18) }} color={theme.colors.teal[6]} />
                                            ) : (
                                                <IconCircleDashed style={{ width: rem(18), height: rem(18) }} color={theme.colors.orange[6]} />
                                            )}
                                        </Box>
                                        <Text> {req} </Text>
                                    </Flex>
                                </Group>
                            </Grid.Col>

                            <Grid.Col span={{ base: 12, sm: 4 }}>
                                <Group spacing="xs" justify="flex-end">
                                    <Button
                                        variant={form.values[`sn${index + 1}`] === true ? 'filled' : 'outline'}
                                        onClick={() => form.setFieldValue(`sn${index + 1}`, true)}
                                        size="xs"
                                    > YES 
                                    </Button>
                                    <Button
                                        variant={form.values[`sn${index + 1}`] === false ? 'filled' : 'outline'}
                                        onClick={() => form.setFieldValue(`sn${index + 1}`, false)}
                                        color="red"
                                        size="xs"
                                    > NO 
                                    </Button>
                                </Group>
                            </Grid.Col>
                        </Grid>
                        ))}
                    </Box>
                
                    <Title order={3} mb="md" style={{ color: '#000000 !important' }}> Remarks </Title>
                    <Textarea
                        mb="xl"
                        placeholder="Describe any other issue or remark..."
                        minRows={10}
                        {...form.getInputProps('remarks')}
                    />
                    <Group justify="flex-end">
                        <Button type="submit">Submit</Button>
                    </Group>
                </Card>
            </form>
        </Box>
    );
};

export default ArrivingPackingQuality;