"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
    Table,
    Button,
    Modal,
    Title,
    Loader,
    Container,
    Paper,
    Box,
    Group,
    Text,
    TextInput,
    Pagination,
    Select,
    Alert,
    ScrollArea,
    Stack,
    SimpleGrid,
} from '@mantine/core';
import { IconSearch, IconEye, IconAlertCircle } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from "@mantine/notifications";
import { BRAND_CHECKLIST_MAP } from '@/config/PDIMap'; 
import { toDateTimeString } from '@mantine/dates';

const EXCLUDED_KEYS = ['remarks', 'notes', 'checklist_items', 'id', 'pdiId', 'details', 'generalRemarks', 'remarksTransport', 'vehicle_inspection', 'defect_remarks'];
const formatKeyToLabel = (key) => {
    if (!key) return '';
    if (key === 'technicianSignature') return "Signature Technician";
    if (key === 'technicianSignatureDate') return "Signature Date (Technician)";
    if (key === 'approverSignature') return "Signature Approver";
    if (key === 'approverSignatureDate') return "Signature Date (Approver)";
    if (key === 'inspectorSignature') return "Signature Technician";
    if (key === 'customer') return "Customer";
    if (key === 'mileageHourMeter') return "Mileage";
    if (key === 'chassisId') return "Chassis ID";
    if (key === 'registrationNo') return "Registration No";
    if (key === 'hourMeter') return 'Hour Meter (HM)'; 
    if (key === 'VIN') return 'VIN';
    if (key === 'woNumber') return 'WO Number';
    if (key === 'pdiID') return 'PDI ID';
    if (key === 'dateOfCheck') return 'Date of Check';
    if (key === 'generalRemarks') return 'General Remarks';
    if (key === 'engineType') return 'Engine Type';
    if (key === 'transmissionType') return 'Transmission Type';
    if (key === 'vehicleArrivalDate') return 'Vehicle Arrival Date';
    
    let label = key.replace(/([A-Z])/g, ' $1').trim();
    
    label = label.charAt(0).toUpperCase() + label.slice(1);
    
    if (label.includes('By')) label = label.replace('By', ' By');
    
    return label;
};

const toCapitalCase = (str) => {
    if (!str) return 'N/A';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const BRAND_ID_MAP = {
    'manitou': 'MA', 
    'renault': 'RT', 
    'sdlg': 'SDLG', 
};

const getNormalizedLabel = (brand, sectionKey, itemKey) => {
    const brandLower = (brand || '').toLowerCase();
    const map = BRAND_CHECKLIST_MAP[brandLower];

    if (!map || brandLower === 'sdlg') {
        return {
            section: sectionKey || 'N/A',
            item: itemKey || 'N/A'
        };
    }

    const normalizedSection = map.sections[sectionKey] || sectionKey;
    let normalizedItem = itemKey;

    if (sectionKey && itemKey) {
        const sectionItems = map.items[sectionKey];
        
        if (sectionItems && Array.isArray(sectionItems)) {
            const itemKeyLower = (itemKey || '').toLowerCase();
            
            let item;

            item = sectionItems.find(i => (i.itemKey || '').toLowerCase() === itemKeyLower);

            if (!item) {
                const match = itemKey.match(/_(\d+)$/);
                const itemID = match ? match[1].padStart(2, '0') : null;

                if (itemID) {
                    item = sectionItems.find(i => i.id === itemID);
                }
            }
            
            if (!item && brandLower === 'renault') {
                const allRenaultItems = Object.values(map.items).flat();
                item = allRenaultItems.find(i => (i.itemKey || '').toLowerCase() === itemKeyLower);
            }
            
            if (item) {
                normalizedItem = item.label;
            }
        }
    }

    return {
        section: normalizedSection || 'N/A',
        item: normalizedItem || 'N/A',
    }
};

const getStatusLabels = (brand, statusValue) => {
    const normalizedBrand = (brand || '').toLowerCase();
    const isTrue = statusValue === 1 || statusValue === true;
    const isFalse = statusValue === 0 || statusValue === false; 

    if (normalizedBrand === 'sdlg') {
        if (isTrue) {
            return { text: 'Yes', color: 'green' }; 
        } else if (isFalse) {
            return { text: 'No', color: 'red' }; 
        } else {
            return { text: 'N/A', color: 'gray' };
        }
    }
    else if (normalizedBrand === 'renault') {
        if (statusValue === 1) {
            return { text: 'Checked, Without Notes', color: 'green' }
        } else if (statusValue === 2) {
            return { text: 'Repair Recommended', color: 'orange' }
        } else if (statusValue === 3) {
            return { text: 'Repair Immediately', color: 'red' }
        } else if (statusValue === 0) {
            return { text: 'Not Applicable', color: 'gray' }
        } else {
            return { text: 'N/A', color: 'gray' };
        }
    } 
    else {
        if (isTrue) {
            return { text: 'Good', color: 'green' };
        } else if (isFalse) { 
            return { text: 'Bad', color: 'orange' };
        } else { 
            return { text: 'Missing', color: 'gray' };
        }
    }
};

const formatLocalTime = (isoString) => {
    if (!isoString) return 'N/A';

    let finalString = isoString;
    
    if (isoString.includes('T') && !isoString.includes('Z')) {
        finalString = `${isoString}Z`;
    }

    let date = new Date(finalString); 
    
    if (isNaN(date.getTime())) {
        return isoString; 
    }

    const formattedDateTime = date.toLocaleString('id-ID', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false, 
        timeZone: 'Asia/Jakarta' 
    });

    const parts = formattedDateTime.split(', ');

    if (parts.length < 2) return formattedDateTime;

    const datePart = parts[0];
    const timePart = parts[1];
    const correctedTimePart = timePart.replace(/\./g, ':');

    return `${datePart}, ${correctedTimePart}`;
};

const formatDateOnly = (toDateTimeString) => {
    if (!toDateTimeString) return 'N/A';

    try {
        const dateObj = new Date(toDateTimeString);

        if (isNaN(dateObj.getTime())) return 'N/A';

        return dateObj.toLocaleDateString('id-ID');
    } catch (e) {
        return 'N/A';
    }
};

const LogData = ({ title, apiUrl }) => {
    const token = typeof window !== 'undefined' ? 
        localStorage.getItem('access_token') : null; 
    
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
    const [selectedLogDetails, setSelectedLogDetails] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activePage, setActivePage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState('10');
    const [lookupTables, setLookupTables] = useState({
        models: {},
        technicians: {},
        approvers: {},
        customers: {},
    });

    const getUnitInformationData = (details, lookupTables) => {
        if (!details) return [];

        const dataArray = [];
        const keys = Object.keys(details);
        
        const priorityKeys = [
            'woNumber', 'brand', 'model', 'VIN', 'hourMeter',
            'dateOfCheck', 'technician', 'approvalBy', 'remarks',
            'generalRemarks', 'createdBy', 'createdOn', 'updatedOn',
            'engineType', 'transmissionType', 'mileage',
        ];
        
        keys.forEach(key => {
            const lowerKey = key.toLowerCase();
            
            if (EXCLUDED_KEYS.includes(key) || EXCLUDED_KEYS.includes(lowerKey)) {
                return;
            }

            let value = details[key];
            let label = formatKeyToLabel(key);
            
            if (lowerKey === 'model' && lookupTables.models[value]) {
                value = lookupTables.models[value];
            } else if (lowerKey === 'technician' && lookupTables.technicians[value]) {
                value = lookupTables.technicians[value];
            } else if (lowerKey === 'approvalby' && lookupTables.approvers[value]) {
                value = lookupTables.approvers[value];
            } else if (lowerKey === 'techniciansignature' && lookupTables.technicians[value]) {
                value = lookupTables.technicians[value];
            } else if (lowerKey === 'approversignature' && lookupTables.approvers[value]) {
                value = lookupTables.approvers[value];
            } else if (lowerKey === 'approversignaturedate' || lowerKey === 'techniciansignaturedate') {
                value = formatDateOnly(value);
            } 
            
            else if (lowerKey === 'customer') {
                const customerCode = details['customer'] || details['Customer'] || '';
                const customerName = lookupTables.customers?.[customerCode];

                if (customerName) {
                    value = toTitleCase(customerName.trim());
                } else {
                    value = customerCode ? String(customerCode) : 'N/A';
                }
            }
            
            else if (lowerKey.includes('date') || lowerKey.includes('on')) {
                if (lowerKey.includes('check')) {
                    value = value ? new Date(value).toLocaleDateString('id-ID') : 'N/A';
                } else {
                    value = formatLocalTime(value);
                }
            }

            else {
                value = value !== null && value !== undefined && value !== '' ? 
                    String(value) : 'N/A';
            }

            dataArray.push({ key, label, value, priority: priorityKeys.indexOf(key) });
        });
        
        return dataArray.sort((a, b) => {
            if (a.priority === -1 && b.priority !== -1) return 1;
            if (a.priority !== -1 && b.priority === -1) return -1;
            if (a.priority !== -1 && b.priority !== -1) return a.priority - b.priority;
            
            return a.label.localeCompare(b.label);
        });
    };

    const fetchLookupData = async (brandId) => {
        let modelLookup = {};
        if (!brandId || !token) return modelLookup;
        
        const apiUrl = `http://127.0.0.1:5000/api/unit-types/${brandId}`;
        try {
            const modelResponse = await fetch(apiUrl, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (modelResponse.ok) {
                const models = await modelResponse.json();
                modelLookup = models.reduce((acc, item) => {
                    acc[item.value] = item.label; 
                    return acc;
                }, {});
            }

        } catch (e) {
            console.error(`[ERROR] Error fetching models for ${brandId}:`, e);
        }
        return modelLookup;
    };

    const fetchCustomerData = async () => {
        if (!token) return {};

        try {
            const response = await fetch(`http://127.0.0.1:5000/api/customers`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to fetch customer data.');
            const customers = await response.json();

            const customerMap = {};
            customers.forEach(cust => {
                const id = cust.CustomerID;
                const name = cust.CustomerName?.trim();
                
                if (id && name) {
                    customerMap[id] = name;
                }
            });

            return customerMap;

        } catch (e) {
            console.error(`[ERROR] Error fetching customer data:`, e);
            return {};
        }
    }

    const toTitleCase = (str) => {
        if (!str) return 'N/A';

        const words = str.split(' ');

        const formattedWords = words.map(word => {
            if (word.toUpperCase() === 'PT') {
                return 'PT';
            } else {
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            }
        });

        return formattedWords.join(' ');
    }

    useEffect(() => {
        const fetchAllData = async () => {
            if (!token) {
                notifications.show({ 
                    title: "Authentication Error", 
                    message: "Please log in again. Authentication token is missing.", 
                    color: "red" 
                });
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                
                const logsResponse = await fetch(apiUrl, { headers: { 'Authorization': `Bearer ${token}` }});

                if (!logsResponse.ok) {
                    throw new Error('Failed to fetch the Log Data.');
                }
                const logData = await logsResponse.json();
                
                setLogs(logData);
                
                const uniqueBrandIds = [...new Set(
                    logData.map(log => BRAND_ID_MAP[(log.brand || '').toLowerCase()]).filter(id => id) 
                )];
                
                const dummyTechnicians = [{ value: "tech1", label: "John Doe" }, { value: "tech2", label: "Jane Smith" }, { value: "tech3", label: "Peter Jones" }];
                const techLookup = dummyTechnicians.reduce((acc, item) => { acc[item.value] = item.label; return acc; }, {});
                const dummyApprovers = [{ value: "app1", label: "Alice Brown" }, { value: "app2", label: "Bob White" }, { value: "app3", label: "John Green"}];
                const approverLookup = dummyApprovers.reduce((acc, item) => { acc[item.value] = item.label; return acc; }, {});
                const customerLookup = await fetchCustomerData(); 

                let allModelLookup = {};

                for (const brandId of uniqueBrandIds) {
                    const modelLookupForBrand = await fetchLookupData(brandId);
                    allModelLookup = { ...allModelLookup, ...modelLookupForBrand }; 
                }

                setLookupTables({
                    models: allModelLookup,
                    technicians: techLookup,
                    approvers: approverLookup,
                    customers: customerLookup,
                });

            } catch (err) {
                setError(err.message);
                notifications.show({ 
                    title: "Error", 
                    message: `Failed to Fetch the Data: ${err.message}`, 
                    color: "red" 
                });
            
            } finally {
                setLoading(false);
            }
        };

        if (apiUrl) {
            fetchAllData();
        }
    }, [apiUrl, token]);

    const filteredLogs = useMemo(() => {
        const query = searchQuery.toLowerCase();
        
        if (!query) return logs;
        
        return logs.filter(log => {
            const modelLabel = lookupTables.models[log.model] || ''; 
            const technicianLabel = lookupTables.technicians[log.technician] || '';
            const approverLabel = lookupTables.approvers[log.approvalBy] || '';
            const customerLabel = lookupTables.customers[log.customer] || '';
            
            return (
                (log.VIN || '').toLowerCase().includes(query) ||
                (log.brand || '').toLowerCase().includes(query) ||
                (log.woNumber || '').toLowerCase().includes(query) ||
                modelLabel.toLowerCase().includes(query) ||
                technicianLabel.toLowerCase().includes(query) ||
                approverLabel.toLowerCase().includes(query) ||
                customerLabel.toLowerCase().includes(query)
            );
        });
    }, [logs, searchQuery, lookupTables]);

    const totalPages = Math.ceil(filteredLogs.length / parseInt(rowsPerPage, 10));
    const start = (activePage - 1) * parseInt(rowsPerPage, 10);
    const end = start + parseInt(rowsPerPage, 10);
    const paginatedLogs = filteredLogs.slice(start, end);

    const handleOpenModal = async (pdiID) => {
        if (!token) {
            notifications.show({ 
                title: "Error", 
                message: "Token missing.", 
                color: "red" 
            });
            return;
        }

        setSelectedLogDetails(null);
        openModal();

        const detailApiUrl = `http://localhost:5000/pre-delivery/log/details/${pdiID}`;

        try {
            const response = await fetch(detailApiUrl, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch detail log data. Status: ' + response.status);
            }

            const details = await response.json();
            setSelectedLogDetails(details);

        } catch (err) {
            notifications.show({ 
                title: "Error", 
                message: `Failed to load details: ${err.message}`, 
                color: "red" 
            });
            setSelectedLogDetails({ error: err.message });
        }
    }

    const rows = paginatedLogs.map((log) => {
        const modelLabel = lookupTables.models[log.model] || log.model || 'N/A';
        const technicianLabel = lookupTables.technicians[log.technician] || log.technician || 'N/A';
        const approverLabel = lookupTables.approvers[log.approvalBy] || log.approvalBy || 'N/A';
        
        return (
            <Table.Tr key={log.id}> 
                <Table.Td>{log.woNumber || 'N/A'}</Table.Td>
                <Table.Td>{modelLabel}</Table.Td> 
                <Table.Td>{log.brand || 'N/A'}</Table.Td>
                <Table.Td>{log.VIN || 'N/A'}</Table.Td>
                <Table.Td>
                    {log.dateOfCheck 
                        ? new Date(log.dateOfCheck).toLocaleDateString('id-ID') 
                        : 'N/A'}
                </Table.Td>
                <Table.Td>{technicianLabel}</Table.Td>
                <Table.Td>{approverLabel}</Table.Td>
                <Table.Td>{log.createdBy || 'N/A'}</Table.Td>
                <Table.Td>
                    {formatLocalTime(log.createdOn)} 
                </Table.Td>
                <Table.Td>
                    <Button
                        variant="subtle"
                        color="gray"
                        onClick={() => handleOpenModal(log.id)}
                        aria-label="Detail Information"
                    >
                        <IconEye size={16} />
                    </Button>
                </Table.Td>
            </Table.Tr>
        );
    });

    const unitInfoData = useMemo(() => {
        if (!selectedLogDetails) return [];
        return getUnitInformationData(selectedLogDetails, lookupTables);
    }, [selectedLogDetails, lookupTables]);

    const remarks = selectedLogDetails ? 
        (selectedLogDetails.generalRemarks || selectedLogDetails.vehicle_inspection || 'No general notes or remarks recorded for this Pre Delivery Inspection.') 
        : 'N/A';

    const brand = selectedLogDetails?.brand;
    const checklist_items = selectedLogDetails?.checklist_items;
    const defect_remarks = selectedLogDetails?.defect_remarks || [];

    return (
        <Container size="xl" my="xl">
            <Title order={1} mb="xl" ta="center"> {title} </Title>
            
            {!loading && !error && (
                <Text ta="center" c="dimmed" mt="-md" mb="xs">
                    Total Units: {filteredLogs.length}
                </Text>
            )}

            {loading && (
                <Box ta="center">
                    <Loader size="lg" />
                    <Text mt="md">Load Data...</Text>
                </Box>
            )}

            {error && (
                <Text c="red" ta="center">
                    Error Occured: {error}
                </Text>
            )}
            
            {!loading && !error && (
                <>
                    <Paper shadow="sm" radius="md" p="md" mb="md">
                        <Group justify="space-between" align="flex-end" mb="md">
                            <TextInput
                                label="Search Unit"
                                icon={<IconSearch size={14} />}
                                placeholder="by WO Number, VIN Number, Brand/ Product, or Unit Type)"
                                value={searchQuery}
                                onChange={(event) => {
                                    setSearchQuery(event.currentTarget.value);
                                    setActivePage(1);
                                }}
                                w={400}
                                style={{ alignSelf: 'center' }} 
                            />
                            <Select
                                label="Show Rows"
                                placeholder="10"
                                data={['10', '20', '30', '40', '50']}
                                value={rowsPerPage}
                                onChange={(value) => {
                                    setRowsPerPage(value);
                                    setActivePage(1);
                                }}
                                w={80}
                            />
                        </Group>
                    </Paper>

                    <Paper shadow="sm" radius="md" p="md">
                        <Table stickyHeader striped highlightOnHover>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>WO Number</Table.Th>
                                    <Table.Th>Type/Model</Table.Th>
                                    <Table.Th>Brand</Table.Th>
                                    <Table.Th>VIN</Table.Th>
                                    <Table.Th>Date of Check</Table.Th>
                                    <Table.Th>Technician</Table.Th>
                                    <Table.Th>Approval By</Table.Th>
                                    <Table.Th>Created By</Table.Th>
                                    <Table.Th>Created On</Table.Th>
                                    <Table.Th>Action</Table.Th>
                                </Table.Tr>
                                </Table.Thead>
                            <Table.Tbody>{rows}</Table.Tbody>
                        </Table>
                    </Paper>

                    {totalPages > 1 && (
                        <Box mt="md" ta="center">
                            <Pagination
                                total={totalPages}
                                value={activePage}
                                onChange={setActivePage}
                            />
                        </Box>
                    )}
                </>
            )}

            <Modal
                opened={modalOpened}
                onClose={closeModal}
                title="Detail Pre-Delivery Log"
                size="1350px"
                styles={{ 
                    title: { flexGrow: 1, textAlign: 'center' }
                }}
                scrollAreaComponent={ScrollArea.Autosize} 
            >
                {selectedLogDetails === null ? 
                (
                    <Box ta="center">
                        <Loader size="md" />
                        <Text mt="sm">Loading Details...</Text>
                    </Box>
                ) : selectedLogDetails.error ? 
                (
                    <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red">
                        Failed to load details: {selectedLogDetails.error}
                    </Alert>
                ) : (
                    <Stack gap="xl">
                        <Box>
                            <Title 
                                order={4} 
                                mb="sm" 
                                pb="xs"
                                style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }}
                            >
                                Unit Information
                            </Title>
                            <SimpleGrid 
                                cols={{ base: 1, sm: 2, lg: 3 }} 
                                spacing={{ base: 'md', sm: 'xl' }}
                                verticalSpacing="sm"
                            >
                                {unitInfoData.map((data) => (
                                    <Group key={data.key} gap="sm" wrap="nowrap">
                                        <Text fw={700} w={120} style={{ minWidth: '100px' }}>{data.label}:</Text>
                                        <Text>{data.value}</Text>
                                    </Group>
                                ))}
                            </SimpleGrid>
                        </Box>

                        <Box>
                            <Title 
                                order={4} 
                                mt="md"
                                mb="sm" 
                                pb="xs"
                                style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }}
                            >
                                Checklist Inspection Items ({toCapitalCase(selectedLogDetails.brand)})
                            </Title>
                            
                            {selectedLogDetails.checklist_items && selectedLogDetails.checklist_items.length > 0 ? 
                                (
                                    <>
                                        {selectedLogDetails.brand && selectedLogDetails.brand.toLowerCase() === 'renault' ? (
                                            (() => {
                                                const allItems = selectedLogDetails.checklist_items || [];

                                                const BACKEND_BATTERY_SECTION = 'battery_status';
                                                const DISPLAY_BATTERY_TITLE = "Battery Inspection (Renault) - Measurements";

                                                const batteryData = allItems.filter(item => item.section === BACKEND_BATTERY_SECTION);
                                                const batteryMap = {};

                                                batteryData.forEach(item => {
                                                    if (item.itemName.startsWith('batt_')) {
                                                        const batteryKey = item.itemName;
                                                        const batteryLabel = item.value;
                                                        
                                                        batteryMap[batteryKey] = {
                                                            label: batteryLabel,
                                                            testCode: '',
                                                        };
                                                    }
                                                });

                                                batteryData.forEach(item => {
                                                    if (item.itemName.startsWith('test_code_batt_')) {
                                                        const batteryKey = item.itemName.replace('test_code_', '');
                                                        
                                                        if (batteryMap[batteryKey]) {
                                                            batteryMap[batteryKey].testCode = item.value;
                                                        }
                                                    }
                                                });

                                                const mainChecklistData = allItems.filter(item => 
                                                    item.section !== BACKEND_BATTERY_SECTION && item.section
                                                ).slice().sort((a, b) => {
                                                    const brandLower = selectedLogDetails.brand.toLowerCase();
                                                    const map = BRAND_CHECKLIST_MAP[brandLower];

                                                    if (!map) return 0;

                                                    const sectionKeys = Object.keys(map.sections);
                                                    const rankA = sectionKeys.indexOf(a.section);
                                                    const rankB = sectionKeys.indexOf(b.section);
                                                    return rankA - rankB;
                                                });

                                                const structuredBatteryData = Object.keys(batteryMap).map(key => ({
                                                    key,
                                                    label: batteryMap[key].label,
                                                    testCode: batteryMap[key].testCode || '-'
                                                }));

                                                return (
                                                    <Stack gap="xl">
                                                        {/* 1. Main Checklist Inspection Items Section (Tabel Standard) */}
                                                        {mainChecklistData.length > 0 && (
                                                            <Box>
                                                                <Table withRowBorders={true} striped highlightOnHover>
                                                                    <Table.Thead>
                                                                        <Table.Tr>
                                                                            <Table.Th>Section</Table.Th>
                                                                            <Table.Th>Item</Table.Th>
                                                                            <Table.Th style={{ width: '100px' }}>Status</Table.Th>
                                                                            <Table.Th>Remarks/Caption</Table.Th>
                                                                            <Table.Th>Image URL</Table.Th>
                                                                        </Table.Tr>
                                                                    </Table.Thead>
                                                                    <Table.Tbody>
                                                                        {mainChecklistData.map((item, index) => {
                                                                            const brand = selectedLogDetails.brand;
                                                                            const { item: normalizedItem } = getNormalizedLabel(brand, item.section, item.itemName);
                                                                            const { text: statusText, color: statusColor } = getStatusLabels(brand, item.status);

                                                                            return (
                                                                                <Table.Tr key={index}>
                                                                                    <Table.Td>{getNormalizedLabel(brand, item.section, null).section}</Table.Td>
                                                                                    <Table.Td>{normalizedItem}</Table.Td>
                                                                                    <Table.Td>
                                                                                        <Text fw={700} c={statusColor}>{statusText}</Text>
                                                                                    </Table.Td>
                                                                                    <Table.Td>{item.remarks || item.caption || '-'}</Table.Td>
                                                                                    <Table.Td>
                                                                                        {item.image_url == null || item.image_url.trim() === '' ? '-' : (
                                                                                            <a href={item.image_url} target="_blank" rel="noopener noreferrer" style={{color: 'var(--mantine-color-blue-6)'}}>Picture</a>
                                                                                        )}
                                                                                    </Table.Td>
                                                                                </Table.Tr>
                                                                            );
                                                                        })}
                                                                    </Table.Tbody>
                                                                </Table>
                                                            </Box>
                                                        )}

                                                        {/* --- 2. Battery Inspection Section (Full List) --- */}
                                                        {batteryData.length > 0 && (
                                                            <Box>
                                                                <Title order={4} mt="md" mb="sm" pb="xs" style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }}>
                                                                    {DISPLAY_BATTERY_TITLE}
                                                                </Title>
                                                                <>
                                                                    <Table withRowBorders={true} striped highlightOnHover>
                                                                        <Table.Thead>
                                                                            <Table.Tr>
                                                                                <Table.Th style={{ width: '50%' }}>Battery</Table.Th>
                                                                                <Table.Th style={{ width: '50%' }}>Test Code</Table.Th>
                                                                            </Table.Tr>
                                                                        </Table.Thead>
                                                                        <Table.Tbody>
                                                                            {structuredBatteryData.map((data, index) => (
                                                                            <Table.Tr key={index}>
                                                                                <Table.Td>{data.label}</Table.Td>
                                                                                <Table.Td>{data.testCode || '-'}</Table.Td>
                                                                            </Table.Tr>
                                                                        ))}
                                                                        </Table.Tbody>
                                                                    </Table>
                                                                </>
                                                            </Box>
                                                        )}
                                                    </Stack>
                                                    );    
                                                })()
                                                ) : (
                                                    <>
                                                        {selectedLogDetails.brand && selectedLogDetails.brand.toLowerCase() === 'sdlg' ? (
                                                            <Table withRowBorders={true} striped highlightOnHover>
                                                                <Table.Thead>
                                                                    <Table.Tr>
                                                                        <Table.Th style={{ width: '85%' }}>Technical Requirement</Table.Th>
                                                                        <Table.Th style={{ width: '15%', textAlign: 'center' }}>Status</Table.Th>
                                                                    </Table.Tr>
                                                                </Table.Thead>
                                                                <Table.Tbody>
                                                                    {selectedLogDetails.checklist_items
                                                                        .map((item, index) => {
                                                                            const sdlgMap = BRAND_CHECKLIST_MAP['sdlg'];
                                                                            const technicalRequirements = sdlgMap?.technicalRequirements?.mainCheck || [];
                                                                            const { text: statusText, color: statusColor } = getStatusLabels('sdlg', item.status);
                                                                            
                                                                            let itemContent = item.itemName || 'Technical Requirement Missing';

                                                                            if (item.itemKey) {
                                                                                const foundItem = technicalRequirements.find(req => req.itemKey === item.itemKey);
                                                                                if (foundItem) {
                                                                                    itemContent = foundItem.label;
                                                                                }
                                                                            }

                                                                            else if (item.id !== undefined) {
                                                                                const foundItem = technicalRequirements.find(req => req.id === item.id);
                                                                                if (foundItem) {
                                                                                    itemContent = foundItem.label;
                                                                                }
                                                                            }

                                                                            return (
                                                                                <Table.Tr key={index}>
                                                                                    <Table.Td>{itemContent}</Table.Td>
                                                                                    <Table.Td style={{ textAlign: 'center' }}>
                                                                                        <Text fw={700} c={statusColor}>
                                                                                            {statusText}
                                                                                        </Text>
                                                                                    </Table.Td>
                                                                                </Table.Tr>
                                                                            );
                                                                        })}
                                                                </Table.Tbody>
                                                            </Table>
                                                        ) : (
                                                            <Table withRowBorders={true} striped highlightOnHover>
                                                                <Table.Thead>
                                                                    <Table.Tr>
                                                                        <Table.Th>Section</Table.Th>
                                                                        <Table.Th>Item</Table.Th>
                                                                        <Table.Th style={{ width: '100px' }}>Status</Table.Th>
                                                                        <Table.Th>Remarks/Caption</Table.Th>
                                                                        <Table.Th>Image URL</Table.Th>
                                                                    </Table.Tr>
                                                                </Table.Thead>
                                                                <Table.Tbody>
                                                                    {selectedLogDetails.checklist_items
                                                                        .slice()
                                                                        .sort((a, b) => {
                                                                            const brandLower = (selectedLogDetails.brand || '').toLowerCase();
                                                                            const map = BRAND_CHECKLIST_MAP[brandLower];

                                                                            if (!map) return 0;

                                                                            const sectionKeys = Object.keys(map.sections);
                                                                            const rankA = sectionKeys.indexOf(a.section);
                                                                            const rankB = sectionKeys.indexOf(b.section);

                                                                            if (rankA !== rankB) {
                                                                                return rankA - rankB;
                                                                            }

                                                                            return 0;
                                                                        })
                                                                        .map((item, index) => {
                                                                            const brand = selectedLogDetails.brand;
                                                                            const { section: normalizedSection, item: normalizedItem } =getNormalizedLabel(brand, item.section, item.itemName);
                                                                            const { text: statusText, color: statusColor } = getStatusLabels(brand, item.status);

                                                                            return (
                                                                                <Table.Tr key={index}>
                                                                                    <Table.Td>{normalizedSection}</Table.Td>
                                                                                    <Table.Td>{normalizedItem}</Table.Td>
                                                                                    <Table.Td>
                                                                                        <Text fw={700} c={statusColor}>
                                                                                            {statusText}
                                                                                        </Text>
                                                                                    </Table.Td>
                                                                                    <Table.Td>{item.remarks || item.caption || '-'}</Table.Td>
                                                                                    <Table.Td>
                                                                                        {item.image_url ? (
                                                                                            <a href={item.image_url} target="_blank" rel="noopener noreferrer" style={{color: 'var(--mantine-color-blue-6)'}}>Picture</a>
                                                                                        ) : '-'}
                                                                                    </Table.Td>
                                                                                </Table.Tr>
                                                                            );
                                                                        })}
                                                                </Table.Tbody>
                                                            </Table>
                                                        )}
                                                    </>
                                                )}
                                            </>
                                    ) : (
                                        <Text c="gray">No detailed checklist items found for this unit.</Text>
                                    )}
                            </Box>

                        {(brand?.toLowerCase() === 'sdlg' && defect_remarks && defect_remarks.length > 0) && (
                            <Box>
                                <Title
                                    order={4}
                                    mt="md"
                                    mb="sm"
                                    pb="xs"
                                    style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }}
                                >
                                    Defects & Remarks
                                </Title>
                                <Table striped highlightOnHover withTableBorder withColumnBorders>
                                    <Table.Thead>
                                        <Table.Tr>
                                            <Table.Th style={{ width: '50px' }}>#</Table.Th>
                                            <Table.Th style={{ width: '50%' }}>Defect Description</Table.Th>
                                            <Table.Th>Remarks / Corrective Action</Table.Th>
                                        </Table.Tr>
                                    </Table.Thead>
                                    <Table.Tbody>
                                        {defect_remarks.map((defect, index) => (
                                            <Table.Tr key={defect.defectID || index}>
                                                <Table.Td>{index + 1}</Table.Td>
                                                <Table.Td>{defect.description || '-'}</Table.Td>
                                                <Table.Td>{defect.remarks || '-'}</Table.Td>
                                            </Table.Tr>
                                        ))}
                                    </Table.Tbody>
                                </Table>
                            </Box>
                        )}

                        <Box>
                            <Title 
                                order={4} 
                                mt="md"
                                mb="sm" 
                                pb="xs"
                                style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }}
                            >
                                General Notes / Remarks
                            </Title>
                            <Paper withBorder p="md" radius="md">
                                <Text style={{ whiteSpace: 'pre-wrap' }}>
                                    {remarks}
                                </Text>
                            </Paper>
                        </Box>
                    </Stack>
                )}
            </Modal>
        </Container>
    );
};

export default LogData;