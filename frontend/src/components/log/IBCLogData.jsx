"use client";

import React, { useState, useMemo, useEffect } from 'react';
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

const BRAND_NAME_MAP = {
    'MA': 'Manitou',
    'KA': 'Kalmar',
    'RT': 'Renault Trucks',
    'SDLG': 'SDLG',
    'MTN': 'Mantsinen',
};

const EXCLUDED_KEYS = ['ibc_trans', 'ibc_packages', 'ibc_accessories', 'id', 'details'];
const formatKeyToLabel = (key) => {
    const labelMap = {
        IBC_No: 'IBC No',
        Brand_ID: 'Brand',
        Cust_ID: 'Customer',
        Requestor: 'Requestor',
        IBC_date: 'IBC Date',
        PO_PJB: 'PO / PJB',
        QTY: 'Quantity',
        SiteOperation: 'Site Operation',
        UnitType: 'Type/Model',
        createdby: 'Created By',
        createdon: 'Created On',
    };
    return labelMap[key] || key.replace(/([A-Z])/g, ' $1').trim();
};

const formatDateOnly = (isoString) => {
    if (!isoString) return 'N/A';
    
    try {
        const date = new Date(isoString);
        return date.toLocaleDateString('id-ID');

    } catch {
        return 'N/A';
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

const toTitleCase = (str) => {
    if (!str) return 'N/A';
    
    const words = str.replace(/_/g, ' ').split(' ');
    const formattedWords = words.map(word => {
        const cleanWord = word.replace(/[.,;:!?]+$/, '');
        const ptRegex = /^(pt\.?|p\.?t\.?)$/i;
        
        if (ptRegex.test(cleanWord)) {
            const punctuation = word.match(/[.,;:!?]+$/) ? word.match(/[.,;:!?]+$/)[0] : '';
            return 'PT' + punctuation;
        } else {
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }
    });
    return formattedWords.join(' ');
};

const getUnitInformationData = (details, lookupTables) => {
    if (!details) return [];
    const dataArray = [];
    const keys = Object.keys(details);
    const priorityKeys = [
        'IBC_No', 'Brand_ID', 'Cust_ID', 'Requestor', 'IBC_date',
        'PO_PJB', 'QTY', 'SiteOperation', 'UnitType', 'createdby', 'createdon'
    ];

    keys.forEach(key => {
        const lowerKey = key.toLowerCase();
        if (EXCLUDED_KEYS.includes(key) || EXCLUDED_KEYS.includes(lowerKey)) {
            return;
        }

        let value = details[key];
        let label = formatKeyToLabel(key);

        // Mapping Customer
        if (lowerKey === 'cust_id') {
            const customerName = lookupTables.customers?.[value];
            if (customerName) {
                value = toTitleCase(customerName.trim());
            } else {
                value = value ? String(value) : 'N/A';
            }
        }

        // Mapping Type/Model (UnitType)
        else if (lowerKey === 'unittype') {
            if (lookupTables.models[value]) {
                value = lookupTables.models[value];
            } else {
                value = value || 'N/A';
            }
        }

        // Mapping Brand
        else if (lowerKey === 'brand_id') {
            value = BRAND_NAME_MAP[value] || value;
        }

        // Format Requestor
        else if (lowerKey === 'requestor') {
            value = toTitleCase(value);
        }

        // Format Date
        else if (lowerKey.includes('date') || lowerKey.includes('on')) {
            if (lowerKey === 'ibc_date') {
                value = formatDateOnly(value);
            } else {
                value = formatLocalTime(value);
            }
        }

        else {
            value = value !== null && value !== undefined && value !== '' ?
                String(value) : 'N/A';
        }

        dataArray.push({ label, value, key, priority: priorityKeys.indexOf(key) });
    });

    return dataArray.sort((a, b) => {
        if (a.priority === -1 && b.priority !== -1) return 1;
        if (a.priority !== -1 && b.priority === -1) return -1;
        if (a.priority !== -1 && b.priority !== -1) return a.priority - b.priority;
        return a.label.localeCompare(b.label);
    });
};

const fetchCustomerData = async (token) => {
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

    } catch (error) {
        console.error('[ERROR] Error fetching customer data:', error);
        return {};
    }
};

const fetchLookupData = async (brandId, token) => {
    let modelLookup = {};
    
    if (!brandId || !token) return modelLookup;
    
    const apiUrl = `http://127.0.0.1:5000/api/unit-types/${brandId}`;
    
    try {
        const modelResponse = await fetch(apiUrl, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (modelResponse.ok) {
            const models = await modelResponse.json();
            modelLookup = models.reduce((acc, model) => {
                acc[model.value] = model.label;
                return acc;
            }, {});
        }

    } catch (e) {
        console.error(`[ERROR] Error fetching models for ${brandId}:`, e);
    }
    return modelLookup;
};

const fetchPackageData = async (token) => {
    if (!token) return {};
    
    try {
        const response = await fetch(`http://127.0.0.1:5000/api/mstPackages`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Failed to fetch package data.');
        
        const packages = await response.json();
        const packageMap = {};
        
        packages.forEach(pkg => {
            packageMap[pkg.PackagesID] = pkg.PackagesType;
        });
        return packageMap;

    } catch (error) {
        console.error('[ERROR] Error fetching package data:', error);
        return {};
    }
};

const fetchAccessoryData = async (token) => {
    if (!token) return {};
    
    try {
        const response = await fetch(`http://127.0.0.1:5000/api/mstAccesories`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to fetch accessory data.');
        
        const accessories = await response.json();
        const accessoryMap = {};
        
        accessories.forEach(acc => {
            accessoryMap[acc.AccesoriesID] = acc.AccesoriesName; // UUID → Label
        });
        return accessoryMap;

    } catch (error) {
        console.error('[ERROR] Error fetching accessory data:', error);
        return {};
    }
};

const IBCLogData = ({ title, apiUrl }) => {
    const token = typeof window !== 'undefined' ?
        localStorage.getItem('access_token') : null;

    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
    const [selectedLogDetails, setSelectedLogDetails] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activePage, setActivePage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [lookupTables, setLookupTables] = useState({
        models: {},
        customers: {},
        packages: {},
        accessories: {},
    });

    // Fetch semua data
    useEffect(() => {
        const fetchAllData = async () => {
            if (!token || !apiUrl) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                
                const res = await fetch(apiUrl, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!res.ok) throw new Error('Failed to fetch IBC logs');

                const data = await res.json();
                setLogs(data);

                const customerLookup = await fetchCustomerData(token);
                const packageLookup = await fetchPackageData(token);
                const accessoryLookup = await fetchAccessoryData(token);

                const uniqueBrands = [...new Set(data.map(log => log.Brand_ID).filter(Boolean))];
                let allModelLookup = {};
                
                for (const brand of uniqueBrands) {
                    const modelLookup = await fetchLookupData(brand, token);
                    allModelLookup = { ...allModelLookup, ...modelLookup };
                }

                setLookupTables({
                    models: allModelLookup,
                    customers: customerLookup,
                    packages: packageLookup,
                    accessories: accessoryLookup
                });

            } catch (err) {
                setError(err.message);
                notifications.show({
                    title: "Error",
                    message: err.message,
                    color: "red"
                });
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, [apiUrl, token]);

    // Filter logs
    const filteredLogs = useMemo(() => {
        const query = searchQuery.toLowerCase();
        if (!query) return logs;
        return logs.filter(log => {
            const modelLabel = lookupTables.models[log.UnitType] || '';
            const customerLabel = lookupTables.customers[log.Cust_ID] || '';
            const brandName = BRAND_NAME_MAP[log.Brand_ID] || log.Brand_ID;
            return (
                (log.IBC_No || '').toLowerCase().includes(query) ||
                brandName.toLowerCase().includes(query) ||
                customerLabel.toLowerCase().includes(query) ||
                modelLabel.toLowerCase().includes(query)
            );
        });
    }, [logs, searchQuery, lookupTables]);

    const totalPages = Math.ceil(filteredLogs.length / parseInt(rowsPerPage, 10));
    const start = (activePage - 1) * parseInt(rowsPerPage, 10);
    const end = start + parseInt(rowsPerPage, 10);
    const paginatedLogs = filteredLogs.slice(start, end);

    const handleOpenModal = async (ibcId) => {
        if (!token) {
            notifications.show({ 
                title: "Error", 
                message: "Token Missing!", 
                color: "red" });
            return;
        }

        setSelectedLogDetails(null);
        openModal();

        try {
            const res = await fetch(`http://127.0.0.1:5000/ibc/log/details/${ibcId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('Failed to fetch detail');

            const details = await res.json();
            setSelectedLogDetails(details);

        } catch (err) {
            notifications.show({ title: "Error", message: err.message, color: "red" });
            setSelectedLogDetails({ error: err.message });
        }
    };

    const rows = paginatedLogs.map((log) => {
        const modelLabel = lookupTables.models[log.UnitType] || log.UnitType || 'N/A';
        const customerName = lookupTables.customers[log.Cust_ID] || log.Cust_ID;
        const brandName = BRAND_NAME_MAP[log.Brand_ID] || log.Brand_ID;

        return (
            <Table.Tr key={log.IBC_ID}>
                <Table.Td>{log.IBC_No || 'N/A'}</Table.Td>
                <Table.Td>{toTitleCase(log.Requestor)}</Table.Td>
                <Table.Td>{log.PO_PJB || 'N/A'}</Table.Td>
                <Table.Td>{brandName}</Table.Td>
                <Table.Td>{toTitleCase(customerName)}</Table.Td>
                <Table.Td>{modelLabel}</Table.Td>
                <Table.Td>{log.QTY || 'N/A'}</Table.Td>
                <Table.Td>{formatDateOnly(log.IBC_date)}</Table.Td>
                <Table.Td>{log.createdby || 'N/A'}</Table.Td>
                <Table.Td>{formatLocalTime(log.createdon)}</Table.Td>
                <Table.Td>
                    <Button
                        variant="subtle"
                        color="gray"
                        onClick={() => handleOpenModal(log.IBC_ID)}
                        aria-label="View Detail"
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

    return (
        <Container size="xl" my="xl">
            <Title order={1} mb="xl" ta="center">{title}</Title>
            {!loading && !error && (
                <Text ta="center" c="dimmed" mt="-md" mb="xs">
                    Total IBC: {filteredLogs.length}
                </Text>
            )}

            {loading && (
                <Box ta="center">
                    <Loader size="lg" />
                    <Text mt="md">Loading Data...</Text>
                </Box>
            )}

            {error && (
                <Text c="red" ta="center">Error: {error}</Text>
            )}

            {!loading && !error && (
                <>
                    <Paper shadow="sm" radius="md" p="md" mb="md">
                        <Group justify="space-between" align="flex-end" mb="md">
                            <TextInput
                                label="Search Unit"
                                placeholder="by IBC No, Brand, Customer, Brand/ Product, or Unit Type"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.currentTarget.value);
                                    setActivePage(1);
                                }}
                                w={400}
                            />
                            <Select
                                label="Show Rows"
                                data={['10', '20', '30', '50']}
                                value={String(rowsPerPage)}
                                onChange={(val) => {
                                    setRowsPerPage(parseInt(val, 10));
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
                                    <Table.Th>IBC No</Table.Th>
                                    <Table.Th>Requestor</Table.Th>
                                    <Table.Th>PO/PJB</Table.Th>
                                    <Table.Th>Brand</Table.Th>
                                    <Table.Th>Customer</Table.Th>
                                    <Table.Th>Type/Model</Table.Th>
                                    <Table.Th>Qty</Table.Th>
                                    <Table.Th>Date</Table.Th>
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
                            <Pagination total={totalPages} value={activePage} onChange={setActivePage} />
                        </Box>
                    )}
                </>
            )}

            {/* Modal Detail */}
            <Modal
                opened={modalOpened}
                onClose={closeModal}
                title="Detail IBC Log"
                size="1350px"
                styles={{ 
                    title: { flexGrow: 1, textAlign: 'center' }
                }}
                scrollAreaComponent={ScrollArea.Autosize}
            >
                {selectedLogDetails === null ? (
                    <Box ta="center">
                        <Loader size="md" />
                        <Text mt="sm">Loading...</Text>
                    </Box>
                ) : selectedLogDetails.error ? (
                    <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red">
                        {selectedLogDetails.error}
                    </Alert>
                ) : (
                    <Stack gap="xl">
                        {/* Header Info */}
                        <Box>
                            <Title order={4} mb="sm" pb="xs" style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }}>
                                IBC Header Information
                            </Title>
                            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
                                {unitInfoData.map((item) => {
                                    if (item.key === 'IBC_ID') return null;
                                    return (
                                        <Group key={item.key} gap="sm">
                                            <Text fw={700} w={150}>{item.label}:</Text>
                                            <Text>{item.value}</Text>
                                        </Group>
                                    );
                                })}
                            </SimpleGrid>
                        </Box>

                        {/* Unit / Trans Detail */}
                        <Box>
                            <Title order={4} mb="sm" pb="xs" style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }}>
                                Unit Information - {selectedLogDetails.ibc_trans?.length || 0} Units
                            </Title>
                            {selectedLogDetails.ibc_trans && selectedLogDetails.ibc_trans.length > 0 ? (
                                <Table striped highlightOnHover withRowBorders>
                                    <Table.Thead>
                                        <Table.Tr>
                                            <Table.Th style={{ width: '60px' }}>No.</Table.Th>
                                            <Table.Th>VIN</Table.Th>
                                            <Table.Th>Attachment Type</Table.Th>
                                            <Table.Th>Supplier</Table.Th>
                                            <Table.Th>Delivery Address</Table.Th>
                                            <Table.Th>PIC</Table.Th>
                                            <Table.Th>Delivery Plan</Table.Th>
                                            <Table.Th>Remarks</Table.Th>
                                        </Table.Tr>
                                    </Table.Thead>
                                    <Table.Tbody>
                                        {selectedLogDetails.ibc_trans.map((unit, idx) => (
                                            <Table.Tr key={unit.IBC_TransID || idx}>
                                                <Table.Td style={{ width: '60px' }}>{idx + 1}</Table.Td>
                                                <Table.Td>{unit.VIN || '-'}</Table.Td>
                                                <Table.Td>{unit.AttachmentType || '-'}</Table.Td>
                                                <Table.Td>{unit.AttachmentSupplier || '-'}</Table.Td>
                                                <Table.Td>{unit.DeliveryAddress || '-'}</Table.Td>
                                                <Table.Td>{unit.DeliveryCustPIC || '-'}</Table.Td>
                                                <Table.Td>{formatDateOnly(unit.DeliveryPlan)}</Table.Td>
                                                <Table.Td>{unit.Remarks || '-'}</Table.Td>
                                            </Table.Tr>
                                        ))}
                                    </Table.Tbody>
                                </Table>
                            ) : (
                                <Text c="dimmed">No unit information available.</Text>
                            )}
                        </Box>

                        {/* Packages */}
                        <Box>
                            <Title order={4} mb="sm" pb="xs" style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }}>
                                Packages Includes - {selectedLogDetails.ibc_packages?.length || 0} Packages
                            </Title>
                            {selectedLogDetails.ibc_packages && selectedLogDetails.ibc_packages.length > 0 ? (
                                <Table striped highlightOnHover withRowBorders>
                                    <Table.Thead>
                                        <Table.Tr>
                                            <Table.Th style={{ width: '60px' }}>No.</Table.Th>
                                            <Table.Th>Package Type</Table.Th>
                                            <Table.Th style={{ width: '700px' }}>Package Description</Table.Th>
                                        </Table.Tr>
                                    </Table.Thead>
                                    <Table.Tbody>
                                        {selectedLogDetails.ibc_packages.map((pkg, idx) => {
                                            const packageLabel = lookupTables.packages[pkg.PackagesType] || pkg.PackagesType || '-';
                                            return (
                                                <Table.Tr key={pkg.IBC_PackagesID || idx}>
                                                    <Table.Td style={{ width: '60px' }}>{idx + 1}</Table.Td>
                                                    <Table.Td>{packageLabel}</Table.Td>
                                                    <Table.Td style={{ width: '300px' }}>{pkg.PackageDesc || '-'}</Table.Td>
                                                </Table.Tr>
                                            );
                                        })}
                                    </Table.Tbody>
                                </Table>
                            ) : (
                                <Text c="dimmed">No package information available.</Text>
                            )}
                        </Box>

                        {/* Accessories */}
                        <Box>
                            <Title order={4} mb="sm" pb="xs" style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }}>
                                Accessories Includes - {selectedLogDetails.ibc_accessories?.length || 0} Accessories
                            </Title>
                            {selectedLogDetails.ibc_accessories && selectedLogDetails.ibc_accessories.length > 0 ? (
                                <Table striped highlightOnHover withRowBorders>
                                    <Table.Thead>
                                        <Table.Tr>
                                            <Table.Th style={{ width: '60px' }}>No.</Table.Th>
                                            <Table.Th>Accessory</Table.Th>
                                            <Table.Th style={{ width: '700px' }}>Accessory Description</Table.Th>
                                        </Table.Tr>
                                    </Table.Thead>
                                    <Table.Tbody>
                                        {selectedLogDetails.ibc_accessories.map((acc, idx) => {
                                            const accessoryLabel = lookupTables.accessories[acc.IBC_Accessories] || acc.IBC_Accessories || '-';
                                            return (
                                                <Table.Tr key={acc.IBC_AccessoriesID || idx}>
                                                    <Table.Td style={{ width: '60px' }}>{idx + 1}</Table.Td>
                                                    <Table.Td>{accessoryLabel}</Table.Td>
                                                    <Table.Td style={{ width: '300px' }}>{acc.Remarks || '-'}</Table.Td>
                                                </Table.Tr>
                                            );
                                        })}
                                    </Table.Tbody>
                                </Table>
                            ) : (
                                <Text c="dimmed">No accessories information available.</Text>
                            )}
                        </Box>
                    </Stack>
                )}
            </Modal>
        </Container>
    );
};

export default IBCLogData;