"use client";

import React, { useState, useEffect, useMemo } from "react";
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
    ScrollArea,
} from "@mantine/core";
import * as XLSX from "xlsx";
import { IconSearch, IconEye, IconDownload } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useUser } from "@/context/UserContext";
import apiClient from "@/libs/api";

const BRAND_NAME_MAP = {
    MA: "Manitou",
    KA: "Kalmar",
    RT: "Renault Trucks",
    SDLG: "SDLG",
    MTN: "Mantsinen",
}

// Convert to standard Indonesian casing and normalize PT variants
const toTitleCase = (str) => {
    if (!str) return "N/A";

    const ptRegex = /^(pt\.?|p\.?t\.?)$/i;
    const words = String(str).split(' ');
    const formatted = words.map((word) => {
        const clean = word.replace(/[.,;:!?]+$/, '');
        if (ptRegex.test(clean)) {
            // Force standardized "PT" without trailing punctuation
            return 'PT';
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });
    return formatted.join(' ');
};

const formatLocalTime = (isoString) => {
    if (!isoString) return "N/A";

    // Parse without forcing UTC; if the string already includes timezone (Z or +HH:MM),
    // Date will respect it. Otherwise treat it as local/naive and format to Asia/Jakarta.
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;

    return date
        .toLocaleString("id-ID", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
            timeZone: "Asia/Jakarta",
        })
        .replace(/\./g, ":");
};

const formatDateOnly = (isoString) => {
    if (!isoString) return "N/A";

    try {
        return new Date(isoString).toLocaleDateString("id-ID");
    
    } catch {
        return "N/A";
    }
}

const KhoLogData = ({ title, apiUrl }) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
    const [selectedPdfUrl, setSelectedPdfUrl] = useState(null);
    const [selectedVin, setSelectedVin] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [activePage, setActivePage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState("10");
    const [lookupTables, setLookupTables] = useState({ requestors: {} });
    const { user } = useUser();

    const downloadExcel = () => {
        if (!user?.permissions?.includes("download_kho_log")) {
            notifications.show({
                title: "Permission Denied",
                message: "You don't have permission to download this log.",
                color: "red",
            });
            return;
        }

        const excelData = logs.map((log, index) => ({
            No: index + 1,
            "Dealer Code": log.dealerCode || "N/A",
            "Customer": toTitleCase(log.customer),
            "Location": log.location || "N/A",
            "Brand": BRAND_NAME_MAP[log.brand] || log.brand || "N/A",
            "Type/Model": log.typeModel || "N/A",
            "VIN": log.VIN || "N/A",
            "BAST Date": log.bastDate ? formatDateOnly(log.bastDate) : "N/A",
            "Requestor": lookupTables.requestors[log.createdBy] || log.createdBy || "N/A",
            "Created On": formatLocalTime(log.createdOn),
        }));

        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "KHO Data Log");
        XLSX.writeFile(wb, `kho_log_${new Date().toISOString().split("T")[0]}.xlsx`);
    };

    const handleViewPDF = async (khoId, vin) => {
        try {
            const res = await apiClient.get(`/kho-document/${khoId}/pdf`, { timeout: 50000 });
            const { downloadUrl } = res.data;

            if (downloadUrl) {
                setSelectedPdfUrl(downloadUrl);
                setSelectedVin(vin);
                openModal();
            } else {
                throw new Error("No PDF URL");
            }

        } catch (err) {
            notifications.show({
                title: "Error",
                message: `Failed to load PDF: ${err.message}`,
                color: "red",
            });
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                const logsRes = await apiClient.get(apiUrl, { timeout: 50000 });
                const logData = logsRes.data || [];
                
                setLogs(logData);

                const requestorRes = await apiClient.get("/users/by-role/Salesman");
                const requestorMap = {};
                
                requestorRes.data.forEach(user => {
                    requestorMap[user.value] = user.label;
                });
                setLookupTables({ requestors: requestorMap });
            
            } catch (err) {
                setError(err.message);
                notifications.show({
                    title: "Error",
                    message: `Failed to load logs: ${err.message}`,
                    color: "red",
                });

            } finally {
                setLoading(false);
            }
        };

        if (apiUrl) fetchData();
    }, [apiUrl]);

    const filteredLogs = useMemo(() => {
        const query = searchQuery.toLowerCase();
        
        if (!query) return logs;
        
        return logs.filter(log => {
            const customer = log.customer || "";
            const requestor = lookupTables.requestors[log.createdBy] || "";
            return (
                (log.VIN || "").toLowerCase().includes(query) ||
                (log.dealerCode || "").toLowerCase().includes(query) ||
                customer.toLowerCase().includes(query) ||
                requestor.toLowerCase().includes(query) ||
                (BRAND_NAME_MAP[log.brand] || log.brand || "").toLowerCase().includes(query)
            );
        });
    }, [logs, searchQuery, lookupTables]);

    const totalPages = Math.ceil(filteredLogs.length / parseInt(rowsPerPage, 10));
    const start = (activePage - 1) * parseInt(rowsPerPage, 10);
    const paginatedLogs = filteredLogs.slice(start, start + parseInt(rowsPerPage, 10));

    const rows = paginatedLogs.map((log, index) => {
        const globalIndex = start + index + 1;
        const brandName = BRAND_NAME_MAP[log.brand] || log.brand || "N/A";
        const requestorName = lookupTables.requestors[log.createdBy] || log.createdBy || "N/A";
        const customerName = toTitleCase(log.customer);

        return (
            <Table.Tr key={log.khoID || log.VIN || globalIndex}>
                <Table.Td>{globalIndex}</Table.Td>
                <Table.Td>{log.dealerCode || "N/A"}</Table.Td>
                <Table.Td>{customerName}</Table.Td>
                <Table.Td>{log.location || "N/A"}</Table.Td>
                <Table.Td>{brandName}</Table.Td>
                <Table.Td>{log.typeModel || "N/A"}</Table.Td>
                <Table.Td>{log.VIN || "N/A"}</Table.Td>
                <Table.Td>{log.bastDate ? formatDateOnly(log.bastDate) : "N/A"}</Table.Td>
                <Table.Td>{requestorName}</Table.Td>
                <Table.Td>{formatLocalTime(log.createdOn)}</Table.Td>
                <Table.Td>
                    <Button
                        variant="subtle"
                        color="gray"
                        onClick={() => handleViewPDF(log.khoID, log.VIN)}
                        aria-label="View PDF"
                    >
                        <IconEye size={16} />
                    </Button>
                </Table.Td>
            </Table.Tr>
        )
    });

    return (
        <Container size="xl" my="xl">
            <Title order={1} mb="xl" ta="center">{title}</Title>
            
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
                                placeholder="by VIN, Brand, Unit Type, or Customer"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.currentTarget.value);
                                    setActivePage(1);
                                }}
                                w={400}
                            />
                            <Group gap="xs">
                                {user?.permissions?.includes("download_kho_log") && (
                                    <Button
                                        onClick={downloadExcel}
                                        variant="outline"
                                        color="#A91D3A"
                                        size="lg"
                                        p={0}
                                        w={32}
                                        h={32}
                                        style={{
                                            height: "100%",
                                            width: "40px",
                                            paddingTop: "2px",
                                            paddingBottom: "2px",
                                            marginTop: "23px",
                                        }}
                                    >
                                        <IconDownload size={16} />
                                    </Button>
                                )}
                                <Select
                                    label="Show Rows"
                                    data={["10", "20", "30", "50"]}
                                    value={rowsPerPage}
                                    onChange={(val) => {
                                        setRowsPerPage(val);
                                        setActivePage(1);
                                    }}
                                    w={80}
                                />
                            </Group>
                        </Group>
                    </Paper>

                    <Paper shadow="sm" radius="md" p="md">
                        <Table stickyHeader highlightOnHover>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>No.</Table.Th>
                                    <Table.Th>Dealer Code</Table.Th>
                                    <Table.Th>Customer</Table.Th>
                                    <Table.Th>Location</Table.Th>
                                    <Table.Th>Brand</Table.Th>
                                    <Table.Th>Type/Model</Table.Th>
                                    <Table.Th>VIN</Table.Th>
                                    <Table.Th>BAST Date</Table.Th>
                                    <Table.Th>Requestor</Table.Th>
                                    <Table.Th>Created On</Table.Th>
                                    <Table.Th>PDF Review</Table.Th>
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

            <Modal
                opened={modalOpened}
                onClose={() => {
                    closeModal();
                    setSelectedPdfUrl(null);
                    setSelectedVin(null);
                }}
                title={<Box style={{ width: '100%', textAlign: 'center' }}>PDF Document Key Hand Over {selectedVin || 'N/A'}</Box>}
                size="90%"
                centered
                styles={{
                    header: { justifyContent: 'center' },
                    title: { width: '100%', textAlign: 'center' },
                }}
                scrollAreaComponent={ScrollArea.Autosize}
            >
                {selectedPdfUrl ? (
                    <Box
                        style={{
                            width: "100%",
                            height: "80vh",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            overflow: "hidden",
                        }}
                    >
                        <iframe
                            src={selectedPdfUrl}
                            width="100%"
                            height="100%"
                            style={{ border: "none" }}
                            title="KHO Document"
                        />
                    </Box>
                ) : (
                    <Box ta="center" mt="xl">
                        <Loader size="md" />
                        <Text mt="sm">Loading PDF...</Text>
                    </Box>
                )}
            </Modal>
        </Container>
    );
};

export default KhoLogData;
