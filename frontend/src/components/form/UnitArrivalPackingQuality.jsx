"use client";

import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Card, 
    Flex,
    Group,
    Grid,
    rem,
    Text,
    TextInput,
    Textarea,
    Title,
    useMantineTheme,
    Select,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { IconCircleCheck, IconCircleDashed } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

export function ArrivingPackingQuality() {
    const theme = useMantineTheme();
    const [inspectorOptions, setInspectorOptions] = useState([]);
    
    useEffect(() => {
        const fetchModels = async () => {
            // set technician
            // dummy models
            const dummyInspector = [
                { value: "tech1", label: "John Doe" },
                { value: "tech2", label: "Jane Smith" },
                { value: "tech3", label: "Peter Jones" }
            ];
            setInspectorOptions(dummyInspector);

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
        };

        fetchModels();
    }, []);

    const form = useForm({
        initialValues: {
            distributionName: '',
            containerNo: '',
            leadSealingNo: '',
            vin: '',
            dateOfCheck: '',
            inspectorSignature: '',

            // importation
            unitLanded: null,
            clearanceCustom: '',
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
            distributionName: (value) => (value ? null : 'Distribution Name is Required!'),
            containerNo: (value) => (value ? null : 'Container Number is Required!'),
            leadSealingNo: (value) => (value ? null : 'Lead Sealing Number is Required!'),
            vin: (value) => (value ? null : 'Machine S/N is Required!'),
            dateOfCheck: (value) => (value ? null : "Date of Check is Required!"),
            inspectorSignature: (value) => (value ? null : 'Inpsector Signature is Required!'),
            unitLanded: (value) => (value ? null : 'Unit Landed Date is Required!'),
            unitStripping: (value) => (value ? null : 'Unit Stripping Date is Required!'),
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
        console.log("DEBUG FRONTEND: Nilai form saat ini:", values);
        const token = localStorage.getItem('access_token');
        console.log("DEBUG: Token from localStorage:", token);
        
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
                    message: "VIN already exists! Please enter a unique Machine S/N.",
                    color: "red",
                });
                return;
            }
        }
        
        console.log("Form submitted with values:", values);

        const payload = {
            ...values,
            brand: 'SDLG',
            unitLanded: values.unitLanded ? new Date(values.unitLanded).toISOString() : null,
            unitStripping: values.unitStripping ? new Date(values.unitStripping).toISOString() : null,
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
            form.setFieldValue('inspectorSignature', '');
            form.setFieldValue('clearanceCustom', '');

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
            <Card shadow="sm" padding="lg" radius="md" withBorder>
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    {/* Section: Top Info */}
                    <Title order={3} mb="md" style={{ color: '#000000 !important' }}> Unit Information </Title>
                    <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" wrap="wrap" gap="md">
                        <Box style={{ flex: 1, minWidth: '300px' }}>
                            <TextInput
                                label='Distribution Name'
                                placeholder='Input Distribution Name'
                                {...form.getInputProps('distributionName')}
                            />
                            <TextInput
                                mt="md"
                                label='Container No.'
                                placeholder='Input Container No.'
                                {...form.getInputProps('containerNo')}
                            />
                            <TextInput
                                mt="md"
                                label='Lead Sealing No.'
                                placeholder='Input Lead Sealing No.'
                                {...form.getInputProps('leadSealingNo')}
                            />
                            <TextInput
                                mt="md"
                                label='Machine S/N'
                                placeholder='Input Machine Serial Number/ VIN'
                                {...form.getInputProps('vin')}
                            />
                            <DateInput
                                mt="md"
                                label="Arrival Date"
                                placeholder="Select Arrival Date"
                                valueFormat="DD-MM-YYYY"
                                {...form.getInputProps('dateOfCheck')}
                            />
                            <Select
                                mt="md"
                                label="Inspector Signature"
                                placeholder="Select Inspector Signature"
                                clearable
                                searchable
                                data={inspectorOptions}
                                {...form.getInputProps('inspectorSignature')}
                            />
                        </Box>
                    </Flex>

                    {/* New Section: Before Technical Requirements */}
                    <Title order={4} mt="xl" mb="md"> Arrival Information </Title>
                    <Flex gap="lg" wrap="wrap" direction={{ base: 'column', md: 'row' }}>
                        <Box style={{ flex: 1, minWidth: '300px' }}>
                            <DateInput
                                label="Unit Landed Date"
                                placeholder="Select Unit Landed Date"
                                valueFormat="DD-MM-YYYY"
                                {...form.getInputProps('unitLanded')}
                            />
                        </Box>
                        <Box style={{ flex: 1, minWidth: '300px' }}>
                            <Select
                                label="Clearance & Custom"
                                placeholder="Select status"
                                data={['Yes', 'No']}
                                {...form.getInputProps('clearanceCustom')}
                            />
                        </Box>
                        <Box style={{ flex: 1, minWidth: '300px' }}>
                            <DateInput
                                label="Unit Stripping Date"
                                placeholder="Select Unit Stripping Date"
                                valueFormat="DD-MM-YYYY"
                                {...form.getInputProps('unitStripping')}
                            />
                        </Box>
                    </Flex>

                    {/* Section: Check and Technical Requirements */}
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
                                            {/* circle icon */}
                                            {form.values[`sn${index + 1}`] === true ? (
                                                <IconCircleCheck style={{ width: rem(18), height: rem(18) }} color={theme.colors.teal[6]} />
                                            ) : (
                                                <IconCircleDashed style={{ width: rem(18), height: rem(18) }} color={theme.colors.orange[6]} />
                                            )}
                                        </Box>
                                        {/* description text */}
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

                    {/* Other Issues */}
                    <Title order={4} mt="xl" mb="md"> Remarks </Title>
                    <Textarea
                        mt="md"
                        placeholder="Describe any other issue or remark..."
                        minRows={4}
                        {...form.getInputProps('remarks')}
                    />

                    <Group justify="flex-end" mt="md">
                        <Button type="submit">Submit</Button>
                    </Group>
                </form>
            </Card>
        </Box>
    );
};

export default ArrivingPackingQuality;