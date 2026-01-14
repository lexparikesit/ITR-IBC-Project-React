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
    Alert,
    ScrollArea,
    Stack,
    SimpleGrid,
} from "@mantine/core";
import * as XLSX from "xlsx";
import { IconSearch, IconEye, IconAlertCircle, IconDownload } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { BRAND_CHECKLIST_MAP } from "@/config/PDIMap";
import { useUser } from "@/context/UserContext";
import apiClient from "@/libs/api";

const EXCLUDED_KEYS = ["remarks", "notes", "checklist_items", "id", "pdiId", "details", "generalRemarks", "remarksTransport", "vehicle_inspection", "defect_remarks"];
const formatKeyToLabel = (key) => {
    if (!key) return "";
    if (key === "technicianSignature") return "Signature Technician";
    if (key === "technicianSignatureDate") return "Signature Date (Technician)";
    if (key === "approverSignature") return "Signature Approver";
    if (key === "approverSignatureDate") return "Signature Date (Approver)";
    if (key === "inspectorSignature") return "Signature Technician";
    if (key === "customer") return "Customer";
    if (key === "mileageHourMeter") return "Mileage";
    if (key === "chassisId") return "Chassis ID";
    if (key === "registrationNo") return "Registration No";
    if (key === "hourMeter") return "Hour Meter (HM)";
    if (key === "VIN") return "VIN";
    if (key === "woNumber") return "WO Number";
    if (key === "pdiID") return "PDI ID";
    if (key === "dateOfCheck") return "Date of Check";
    if (key === "generalRemarks") return "General Remarks";
    if (key === "engineType") return "Engine Type";
    if (key === "transmissionType") return "Transmission Type";
    if (key === "vehicleArrivalDate") return "Vehicle Arrival Date";

    let label = key.replace(/([A-Z])/g, " $1").trim();

    label = label.charAt(0).toUpperCase() + label.slice(1);

    if (label.includes("By")) label = label.replace("By", " By");

    return label;
};

const toCapitalCase = (str) => {
    if (!str) return "N/A";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Remove trailing numeric suffixes from section labels (e.g., "01. Engine" -> "Engine")
const stripSectionIndex = (label) => {
    if (!label) return "";
    const text = String(label).trim();
    return text.replace(/[\s._-]*\(?0*\d+\)?\.?\s*/i, "").trim() || text;
};

const BRAND_ID_MAP = {
    manitou: "MA",
    renault: "RT",
    sdlg: "SDLG",
};

const getNormalizedLabel = (brand, sectionKey, itemKey) => {
    const brandLower = (brand || "").toLowerCase();
    const map = BRAND_CHECKLIST_MAP[brandLower];

    if (!map || brandLower === "sdlg") {
        return {
            section: sectionKey || "N/A",
            item: itemKey || "N/A",
        };
    }

    const normalizedSection = map.sections[sectionKey] || sectionKey;
    let normalizedItem = itemKey;

    if (sectionKey && itemKey) {
        const sectionItems = map.items[sectionKey];

        if (sectionItems && Array.isArray(sectionItems)) {
            const itemKeyLower = (itemKey || "").toLowerCase();

            let item;

            item = sectionItems.find(
                (i) => (i.itemKey || "").toLowerCase() === itemKeyLower
            );

            if (!item) {
                const match = itemKey.match(/_(\d+)$/);
                const itemID = match ? match[1].padStart(2, "0") : null;

                if (itemID) {
                    item = sectionItems.find((i) => i.id === itemID);
                }
            }

            if (!item && brandLower === "renault") {
                const allRenaultItems = Object.values(map.items).flat();
                item = allRenaultItems.find(
                    (i) => (i.itemKey || "").toLowerCase() === itemKeyLower
                );
            }

            if (item) {
                normalizedItem = item.label;
            }
        }
    }

    return {
        section: normalizedSection || "N/A",
        item: normalizedItem || "N/A",
    };
};

const getStatusLabels = (brand, statusValue) => {
    const normalizedBrand = (brand || "").toLowerCase();
    const isTrue = statusValue === 1 || statusValue === true;
    const isFalse = statusValue === 0 || statusValue === false;

    if (normalizedBrand === "sdlg") {
        if (isTrue) {
            return { text: "Yes", color: "green" };
        } else if (isFalse) {
            return { text: "No", color: "red" };
        } else {
            return { text: "N/A", color: "gray" };
        }
    } else if (normalizedBrand === "renault") {
        if (statusValue === 1) {
            return { text: "Checked, Without Notes", color: "green" };
        } else if (statusValue === 2) {
            return { text: "Repair Recommended", color: "orange" };
        } else if (statusValue === 3) {
            return { text: "Repair Immediately", color: "red" };
        } else if (statusValue === 0) {
            return { text: "Not Applicable", color: "gray" };
        } else {
            return { text: "N/A", color: "gray" };
        }
    } else {
        if (isTrue) {
            return { text: "Good", color: "green" };
        } else if (isFalse) {
            return { text: "Bad", color: "orange" };
        } else {
            return { text: "Missing", color: "gray" };
        }
    }
};

const formatLocalTime = (isoString) => {
    if (!isoString) return "N/A";

    let finalString = isoString;

    if (isoString.includes("T") && !isoString.includes("Z")) {
        finalString = `${isoString}Z`;
    }

    let date = new Date(finalString);

    if (isNaN(date.getTime())) {
        return isoString;
    }

    const formattedDateTime = date.toLocaleString("id-ID", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZone: "Asia/Jakarta",
    });

    const parts = formattedDateTime.split(", ");

    if (parts.length < 2) return formattedDateTime;

    const datePart = parts[0];
    const timePart = parts[1];
    const correctedTimePart = timePart.replace(/\./g, ":");

    return `${datePart}, ${correctedTimePart}`;
};

const formatDateOnly = (toDateTimeString) => {
    if (!toDateTimeString) return "N/A";

    try {
        const dateObj = new Date(toDateTimeString);

        if (isNaN(dateObj.getTime())) return "N/A";

        return dateObj.toLocaleDateString("id-ID");
    
    } catch (e) {
        return "N/A";
    }
};

const LogData = ({ title, apiUrl }) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
    const [selectedLogDetails, setSelectedLogDetails] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [activePage, setActivePage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState("10");
    const [lookupTables, setLookupTables] = useState({
        models: {},
        technicians: {},
        approvers: {},
        customers: {},
    });
    const { user } = useUser();

    const downloadExcel = () => {
        if (!user?.permissions?.includes("download_pdi_log")) {
            notifications.show({
                title: "Permission Denied",
                message: "You don't have permission to download this log.",
                color: "red",
            });
            return;
        }

        const excelData = logs.map((log, index) => ({
            No: index + 1,
            "WO Number": log.woNumber || "N/A",
            "Type/Model": lookupTables.models[log.model] || log.model || "N/A",
            Brand:
                log.brand === "manitou"
                    ? "Manitou"
                    : log.brand === "renault"
                        ? "Renault Trucks"
                        : log.brand === "sdlg"
                            ? "SDLG"
                            : log.brand || "N/A",
            VIN: log.VIN || "N/A",
            "Date of Check": log.dateOfCheck
                ? new Date(log.dateOfCheck).toLocaleDateString("id-ID")
                : "N/A",
            Technician:
                lookupTables.technicians[log.technician] || log.technician || "N/A",
            "Approval By":
                lookupTables.approvers[log.approvalBy] || log.approvalBy || "N/A",
            "Created By": log.createdBy || "N/A",
            "Created On": formatLocalTime(log.createdOn),
        }));

        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(wb, ws, "PDI Data Log");
        XLSX.writeFile(wb,`pdi_log_${new Date().toISOString().split("T")[0]}.xlsx`);
    };

    const getUnitInformationData = (details, lookupTables) => {
        if (!details) return [];

        const dataArray = [];
        const keys = Object.keys(details);

        const priorityKeys = [
            "woNumber", "brand", "model", "VIN", "hourMeter", "dateOfCheck",
            "technician", "approvalBy", "remarks", "generalRemarks", "createdBy",
            "createdOn", "updatedOn", "engineType", "transmissionType", "mileage",
        ];

        keys.forEach((key) => {
            const lowerKey = key.toLowerCase();

            if (EXCLUDED_KEYS.includes(key) || EXCLUDED_KEYS.includes(lowerKey)) {
                return;
            }

            let value = details[key];
            let label = formatKeyToLabel(key);

            if (lowerKey === "model" && lookupTables.models[value]) {
                value = lookupTables.models[value];
            } else if (lowerKey === "technician" && lookupTables.technicians[value]) {
                value = lookupTables.technicians[value];
            } else if (lowerKey === "approvalby" && lookupTables.approvers[value]) {
                value = lookupTables.approvers[value];
            } else if (lowerKey === "techniciansignature" && lookupTables.technicians[value]) {
                value = lookupTables.technicians[value];
            } else if (lowerKey === "approversignature" && lookupTables.approvers[value]) {
                value = lookupTables.approvers[value];
            } else if (lowerKey === "approversignaturedate" || lowerKey === "techniciansignaturedate") {
                value = formatDateOnly(value);
            } 
            
            else if (lowerKey === "customer") {
                const customerCode = details["customer"] || details["Customer"] || "";
                const customerName = lookupTables.customers?.[customerCode];

                if (customerName) {
                    value = toTitleCase(customerName.trim());
                } else {
                    value = customerCode ? String(customerCode) : "N/A";
                }
            } 
            
            else if (lowerKey.includes("date") || lowerKey.includes("on")) {
                if (lowerKey.includes("check")) {
                    value = value ? new Date(value).toLocaleDateString("id-ID") : "N/A";
                } else {
                    value = formatLocalTime(value);
                }
            } else {
                value = value !== null && value !== undefined && value !== "" ? String(value) : "N/A";
            }

            dataArray.push({ key,label, value, priority: priorityKeys.indexOf(key) });
        });

        return dataArray.sort((a, b) => {
            if (a.priority === -1 && b.priority !== -1) return 1;
            if (a.priority !== -1 && b.priority === -1) return -1;
            if (a.priority !== -1 && b.priority !== -1)
                return a.priority - b.priority;

            return a.label.localeCompare(b.label);
        });
    };

    const fetchLookupData = async (brandId) => {
        let modelLookup = {};
        if (!brandId) return modelLookup;

        try {
            const { data: models = [] } = await apiClient.get(`/unit-types/${brandId}`);
            modelLookup = models.reduce((acc, item) => {
                acc[item.value] = item.label;
                return acc;
            }, {});

        } catch (e) {
            console.error(`[ERROR] Error fetching models for ${brandId}:`, e);
        }
        return modelLookup;
    };

    const fetchCustomerData = async () => {
        try {
            const { data: customers = [] } = await apiClient.get("/customers");

            const customerMap = {};
            customers.forEach((cust) => {
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
    };

    const toTitleCase = (str) => {
        if (!str) return "N/A";

        const ptRegex = /^(pt\.?|p\.?t\.?)$/i;
        const words = str.split(" ");
        const formattedWords = words.map((word) => {
            const cleanWord = word.replace(/[.,;:!?]+$/, "");

            if (ptRegex.test(cleanWord)) {
                const punctuation = word.match(/[.,;:!?]+$/)
                    ? word.match(/[.,;:!?]+$/)[0]
                    : "";
                return "PT" + punctuation;
            } else {
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            }
        });

        return formattedWords.join(" ");
    };

    const fetchUserLookup = async () => {

        try {
            const [techRes, supervisorRes, techHeadRes] = await Promise.all([
                apiClient.get('/users/by-role/Technician'),
                apiClient.get('/users/by-role/Supervisor'),
                apiClient.get('/users/by-role/Technical Head'),
            ]);

            const techData = techRes.data || [];
            const supervisorData = supervisorRes.data || [];
            const techHeadData = techHeadRes.data || [];
            const allApprovers = [...supervisorData, ...techHeadData];
            const techLookup = techData.reduce((acc, user) => {
                acc[user.value] = user.label;
                return acc;
            }, {});
            const approverLookup = allApprovers.reduce((acc, user) => {
                acc[user.value] = user.label;
                return acc;
            }, {});

            return { technicians: techLookup, approvers: approverLookup };

        } catch (error) {
            console.error("Error fetching user lookup data:", error);
            return { technicians: {}, approvers: {} };
        }
    };

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setLoading(true);

                const logsResponse = await apiClient.get(apiUrl);
                const logData = logsResponse.data;

                setLogs(logData);

                const uniqueBrandIds = [...new Set(
                    logData.map((log) => BRAND_ID_MAP[(log.brand || "").toLowerCase()]).filter((id) => id)
                    ),
                ];

                let allModelLookup = {};

                for (const brandId of uniqueBrandIds) {
                    const modelLookupForBrand = await fetchLookupData(brandId);
                    allModelLookup = { ...allModelLookup, ...modelLookupForBrand };
                }

                const customerLookup = await fetchCustomerData();
                const { technicians, approvers } = await fetchUserLookup();

                setLookupTables({
                    models: allModelLookup,
                    technicians: technicians,
                    approvers: approvers,
                    customers: customerLookup,
                });

            } catch (err) {
                setError(err.message);
                notifications.show({
                    title: "Error",
                    message: `Failed to Fetch the Data: ${err.message}`,
                    color: "red",
                });

            } finally {
                setLoading(false);
            }
        };

        if (apiUrl) {
            fetchAllData();
        }
    }, [apiUrl]);

    const filteredLogs = useMemo(() => {
        const query = searchQuery.toLowerCase();

        if (!query) return logs;

        return logs.filter((log) => {
            const modelLabel = lookupTables.models[log.model] || "";
            const technicianLabel = lookupTables.technicians[log.technician] || "";
            const approverLabel = lookupTables.approvers[log.approvalBy] || "";
            const customerLabel = lookupTables.customers[log.customer] || "";

            return (
                (log.VIN || "").toLowerCase().includes(query) ||
                (log.brand || "").toLowerCase().includes(query) ||
                (log.woNumber || "").toLowerCase().includes(query) ||
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
        setSelectedLogDetails(null);
        openModal();

        const detailApiUrl = `/pre-delivery/log/details/${pdiID}`;

        try {
            const response = await apiClient.get(detailApiUrl);
            const details = response.data;
            setSelectedLogDetails(details);

        } catch (err) {
            notifications.show({
                title: "Error",
                message: `Failed to load details: ${err.message}`,
                color: "red",
            });
            setSelectedLogDetails({ error: err.message });
        }
    };

    const rows = paginatedLogs.map((log, index) => {
        const modelLabel = lookupTables.models[log.model] || log.model || "N/A";
        const technicianLabel = lookupTables.technicians[log.technician] || log.technician || "N/A";
        const approverLabel = lookupTables.approvers[log.approvalBy] || log.approvalBy || "N/A";
        const globalIndex = (activePage - 1) * parseInt(rowsPerPage, 10) + index + 1;

        return (
            <Table.Tr key={log.id}>
                <Table.Td>{globalIndex}</Table.Td>
                <Table.Td>{log.woNumber || "N/A"}</Table.Td>
                <Table.Td>{modelLabel}</Table.Td>
                <Table.Td>
                    {log.brand === "manitou"
                        ? "Manitou"
                        : log.brand == "renault"
                            ? "Renault Trucks"
                            : log.brand == "sdlg"
                                ? "SDLG"
                                : log.brand || "N/A"}
                </Table.Td>
                <Table.Td>{log.VIN || "N/A"}</Table.Td>
                <Table.Td>
                    {log.dateOfCheck
                        ? new Date(log.dateOfCheck).toLocaleDateString("id-ID")
                        : "N/A"}
                </Table.Td>
                <Table.Td>{technicianLabel}</Table.Td>
                <Table.Td>{approverLabel}</Table.Td>
                <Table.Td>{log.createdBy || "N/A"}</Table.Td>
                <Table.Td>{formatLocalTime(log.createdOn)}</Table.Td>
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

    const remarks = selectedLogDetails
        ? selectedLogDetails.generalRemarks ||
        selectedLogDetails.vehicle_inspection ||
        "No general notes or remarks recorded for this Pre Delivery Inspection."
        : "N/A";

    const brand = selectedLogDetails?.brand;
    const checklist_items = selectedLogDetails?.checklist_items;
    const defect_remarks = selectedLogDetails?.defect_remarks || [];

    return (
        <Container size="xl" my="xl">
            <Title order={1} mb="xl" ta="center"> {" "} {title}{" "} </Title>
                
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
                                    placeholder="by WO Number, VIN Number, Brand/ Product, or Unit Type"
                                    value={searchQuery}
                                    onChange={(event) => {
                                        setSearchQuery(event.currentTarget.value);
                                        setActivePage(1);
                                    }}
                                    w={400}
                                    style={{ alignSelf: "center" }}
                                />
                                <Group gap="xs">
                                    {user?.permissions?.includes("download_pdi_log") && (
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
                                        placeholder="10"
                                        data={["10", "20", "30", "40", "50"]}
                                        value={rowsPerPage}
                                        onChange={(value) => {
                                            setRowsPerPage(value);
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
                    title: { flexGrow: 1, textAlign: "center" },
                }}
                scrollAreaComponent={ScrollArea.Autosize}
            >
                {selectedLogDetails === null ? (
                    <Box ta="center">
                        <Loader size="md" />
                        <Text mt="sm">Loading Details...</Text>
                    </Box>
                ) : selectedLogDetails.error ? (
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
                                style={{
                                    borderBottom: "1px solid var(--mantine-color-gray-2)",
                                }}
                            >
                                Unit Information
                            </Title>
                            <SimpleGrid
                                cols={{ base: 1, sm: 2, lg: 3 }}
                                spacing={{ base: "md", sm: "xl" }}
                                verticalSpacing="sm"
                            >
                                {unitInfoData.map((data) => (
                                    <Group key={data.key} gap="sm" wrap="nowrap">
                                        <Text fw={700} w={120} style={{ minWidth: "100px" }}> {data.label}: </Text>
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
                                style={{ borderBottom: "1px solid var(--mantine-color-gray-2)", }}
                            >
                                Checklist Inspection Items (
                                {toCapitalCase(selectedLogDetails.brand)})
                            </Title>

                            {selectedLogDetails.checklist_items &&
                                selectedLogDetails.checklist_items.length > 0 ? (
                                <>
                                    {selectedLogDetails.brand &&
                                        selectedLogDetails.brand.toLowerCase() === "renault" ? (
                                        (() => {
                                            const allItems = selectedLogDetails.checklist_items || [];

                                            const BACKEND_BATTERY_SECTION_PDI = "battery_status";
                                            const BACKEND_BATTERY_SECTION_SM = "battery_inspection";
                                            const DISPLAY_BATTERY_TITLE = "Battery Inspection (Renault) - Measurements";
                                            const smBatteryItems = allItems.filter((item) => item.section === BACKEND_BATTERY_SECTION_SM);
                                            const pdiBatteryItems = allItems.filter((item) => item.section === BACKEND_BATTERY_SECTION_PDI);

                                            const mainChecklistData = allItems
                                                .filter(
                                                    (item) =>
                                                        item.section !== BACKEND_BATTERY_SECTION_PDI &&
                                                        item.section !== BACKEND_BATTERY_SECTION_SM &&
                                                        item.section
                                                )
                                                .slice()
                                                .sort((a, b) => {
                                                    const brandLower = selectedLogDetails.brand.toLowerCase();
                                                    const map = BRAND_CHECKLIST_MAP[brandLower];

                                                    if (!map) return 0;

                                                    const sectionKeys = Object.keys(map.sections);
                                                    const rankA = sectionKeys.indexOf(a.section);
                                                    const rankB = sectionKeys.indexOf(b.section);
                                                    return rankA - rankB;
                                                });

                                            let structuredBatteryData = [];
                                            if (pdiBatteryItems.length > 0) {
                                                const batteryMap = {};
                                                pdiBatteryItems.forEach((item) => {
                                                    if ((item.itemName || "").startsWith("batt_")) {
                                                        batteryMap[item.itemName] = {
                                                            label: item.value,
                                                            testCode: "",
                                                        };
                                                    }
                                                });
                                                pdiBatteryItems.forEach((item) => {
                                                    if ((item.itemName || "").startsWith("test_code_batt_")) {
                                                        const key = item.itemName.replace("test_code_", "");
                                                            if (batteryMap[key])
                                                                batteryMap[key].testCode = item.value;
                                                        }
                                                    });
                                                
                                                structuredBatteryData = Object.keys(batteryMap).map(
                                                    (key) => ({ label: batteryMap[key].label, testCode: batteryMap[key].testCode || "-", })
                                                );
                                            }

                                            return (
                                                <Stack gap="xl">
                                                    {mainChecklistData.length > 0 && (
                                                        <Box>
                                                            <Table withRowBorders={true} highlightOnHover>
                                                                <Table.Thead>
                                                                    <Table.Tr>
                                                                        <Table.Th>Section</Table.Th>
                                                                        <Table.Th>Item</Table.Th>
                                                                        <Table.Th style={{ width: "100px" }}> Status </Table.Th>
                                                                        <Table.Th>Remarks/Caption</Table.Th>
                                                                        <Table.Th>Image</Table.Th>
                                                                    </Table.Tr>
                                                                </Table.Thead>
                                                                <Table.Tbody>
                                                                    {(() => {
                                                                        const brand = selectedLogDetails.brand;
                                                                        const rows = mainChecklistData.map((it) => {
                                                                            const { section: normSec, item: normItem, } = getNormalizedLabel( brand, it.section, it.itemName);
                                                                            return {
                                                                                section: stripSectionIndex(normSec),
                                                                                itemLabel: normItem,
                                                                                status: it.status,
                                                                                remarks: it.remarks || it.caption || "-",
                                                                                imageUrl: it.image_url,
                                                                            };
                                                                        });
                                                                        const counts = {};
                                                                            rows.forEach((r) => {counts[r.section] = (counts[r.section] || 0) + 1;
                                                                        });
                                                                        const emitted = {};
                                                                        return rows.map((row, idx) => (
                                                                            <Table.Tr key={idx}>
                                                                                {!emitted[row.section] && (
                                                                                    <Table.Td
                                                                                        rowSpan={counts[row.section]}
                                                                                        style={{
                                                                                            textAlign: "center",
                                                                                            verticalAlign: "middle",
                                                                                            fontWeight: 600,
                                                                                        }}
                                                                                    >
                                                                                        {row.section}
                                                                                    </Table.Td>
                                                                                )}
                                                                                {(emitted[row.section] = (emitted[row.section] || 0) + 1) && null}
                                                                                <Table.Td>{row.itemLabel}</Table.Td>
                                                                                <Table.Td>
                                                                                    <Text
                                                                                        fw={700}
                                                                                        c={getStatusLabels(brand, row.status).color}
                                                                                    >
                                                                                        {getStatusLabels(brand, row.status).text}
                                                                                    </Text>
                                                                                </Table.Td>
                                                                                <Table.Td>{row.remarks}</Table.Td>
                                                                                <Table.Td>
                                                                                    {row.imageUrl && row.imageUrl.startsWith("https://") ? (
                                                                                        <Box
                                                                                            style={{
                                                                                                width: "100px",
                                                                                                height: "100px",
                                                                                                overflow: "hidden",
                                                                                            }}
                                                                                        >
                                                                                            <img
                                                                                                src={row.imageUrl}
                                                                                                alt="Inspection"
                                                                                                style={{
                                                                                                    width: "100%",
                                                                                                    height: "auto",
                                                                                                    objectFit: "cover",
                                                                                                }}
                                                                                                onError={(e) => {
                                                                                                    e.target.style.display ="none";
                                                                                                    e.target.parentElement.innerHTML = '<span style="color: red">Image Failed to Load</span>';
                                                                                                }}
                                                                                            />
                                                                                        </Box>
                                                                                    ) : (
                                                                                        "-"
                                                                                    )}
                                                                                </Table.Td>
                                                                            </Table.Tr>
                                                                        ));
                                                                    })()}
                                                                </Table.Tbody>
                                                            </Table>
                                                        </Box>
                                                    )}

                                                    {structuredBatteryData.length > 0 && (
                                                        <Box>
                                                            <Title
                                                                order={4}
                                                                mt="md"
                                                                mb="sm"
                                                                pb="xs"
                                                                style={{
                                                                    borderBottom:"1px solid var(--mantine-color-gray-2)",
                                                                }}
                                                            >
                                                                {DISPLAY_BATTERY_TITLE}
                                                            </Title>
                                                            <Table withRowBorders={true} highlightOnHover>
                                                                <Table.Thead>
                                                                    <Table.Tr>
                                                                        <Table.Th>Battery</Table.Th>
                                                                        <Table.Th>Test Code</Table.Th>
                                                                    </Table.Tr>
                                                                </Table.Thead>
                                                                <Table.Tbody>
                                                                    {structuredBatteryData.map((row, index) => (
                                                                        <Table.Tr key={index}>
                                                                            <Table.Td>{row.label}</Table.Td>
                                                                            <Table.Td>{row.testCode}</Table.Td>
                                                                        </Table.Tr>
                                                                    ))}
                                                                </Table.Tbody>
                                                            </Table>
                                                        </Box>
                                                    )}
                                                </Stack>
                                            );
                                        })()
                                    ) : (
                                        <>
                                            {selectedLogDetails.brand &&
                                                selectedLogDetails.brand.toLowerCase() === "sdlg" ? (
                                                <Table withRowBorders={true} highlightOnHover>
                                                    <Table.Thead>
                                                        <Table.Tr>
                                                            <Table.Th style={{ width: "50px" }}>No.</Table.Th>
                                                            <Table.Th style={{ width: "85%" }}>Technical Requirement</Table.Th>
                                                            <Table.Th style={{ width: "15%", textAlign: "center" }}>Status</Table.Th>
                                                        </Table.Tr>
                                                    </Table.Thead>
                                                    <Table.Tbody>
                                                        {selectedLogDetails.checklist_items.map(
                                                            (item, index) => {
                                                                const sdlgMap = BRAND_CHECKLIST_MAP["sdlg"];
                                                                const technicalRequirements = sdlgMap?.technicalRequirements?.mainCheck || [];
                                                                const { text: statusText, color: statusColor } = getStatusLabels("sdlg", item.status);

                                                                let itemContent = item.itemName || "Technical Requirement Missing";

                                                                if (item.itemKey) {
                                                                    const foundItem = technicalRequirements.find(
                                                                        (req) => req.itemKey === item.itemKey
                                                                    );
                                                                    if (foundItem) {
                                                                        itemContent = foundItem.label;
                                                                    }
                                                                } else if (item.id !== undefined) {
                                                                    const foundItem = technicalRequirements.find(
                                                                        (req) => req.id === item.id
                                                                    );
                                                                    if (foundItem) {
                                                                        itemContent = foundItem.label;
                                                                    }
                                                                }

                                                                return (
                                                                    <Table.Tr key={index}>
                                                                        <Table.Td>{index + 1}</Table.Td>
                                                                        <Table.Td>{itemContent}</Table.Td>
                                                                        <Table.Td style={{ textAlign: "center" }}>
                                                                            <Text fw={700} c={statusColor}>{statusText}</Text>
                                                                        </Table.Td>
                                                                    </Table.Tr>
                                                                );
                                                            }
                                                        )}
                                                    </Table.Tbody>
                                                </Table>
                                            ) : (
                                                <Table withRowBorders={true} highlightOnHover>
                                                    <Table.Thead>
                                                        <Table.Tr>
                                                            <Table.Th>Section</Table.Th>
                                                            <Table.Th>Item</Table.Th>
                                                            <Table.Th style={{ width: "100px" }}>Status</Table.Th>
                                                            <Table.Th>Remarks/Caption</Table.Th>
                                                            <Table.Th>Image URL</Table.Th>
                                                        </Table.Tr>
                                                    </Table.Thead>
                                                    <Table.Tbody>
                                                        {(() => {
                                                            const brand = selectedLogDetails.brand;
                                                            const sorted = selectedLogDetails.checklist_items
                                                                .slice()
                                                                .sort((a, b) => {
                                                                    const map = BRAND_CHECKLIST_MAP[(brand || "").toLowerCase()];
                                                                    if (!map) return 0;
                                                                        const sectionKeys = Object.keys(map.sections);
                                                                        const rankA = sectionKeys.indexOf(a.section);
                                                                        const rankB = sectionKeys.indexOf(b.section);
                                                                    
                                                                    if (rankA !== rankB) return rankA - rankB;
                                                                    return 0;
                                                                })
                                                                .map((it) => {
                                                                    const { section: normSec, item: normItem } =
                                                                        getNormalizedLabel(brand, it.section, it.itemName);
                                                                    
                                                                    return {
                                                                        section: normSec,
                                                                        itemLabel: normItem,
                                                                        status: it.status,
                                                                        remarks: it.remarks || it.caption || it.notes || "-",
                                                                        imageUrl: it.image_url || it.imageUrl || it.image_blob_name,
                                                                    };
                                                                });

                                                            const counts = {};
                                                            sorted.forEach((r) => { 
                                                                counts[r.section] = (counts[r.section] || 0) + 1; 
                                                            });
                                                            const emitted = {};

                                                            return sorted.map((row, idx) => {
                                                                const { text: statusText, color: statusColor } = getStatusLabels(brand, row.status);
                                                                const firstForSection = !emitted[row.section];
                                                                emitted[row.section] = (emitted[row.section] || 0) + 1;

                                                                return (
                                                                    <Table.Tr key={idx}>
                                                                        {firstForSection && (
                                                                            <Table.Td
                                                                                rowSpan={counts[row.section]}
                                                                                style={{
                                                                                    textAlign: "center",
                                                                                    verticalAlign: "middle",
                                                                                    fontWeight: 600,
                                                                                }}
                                                                            >
                                                                                {row.section}
                                                                            </Table.Td>
                                                                        )}
                                                                        <Table.Td>{row.itemLabel}</Table.Td>
                                                                        <Table.Td>
                                                                            <Text fw={700} c={statusColor}>
                                                                                {statusText}
                                                                                </Text>
                                                                        </Table.Td>
                                                                        <Table.Td>{row.remarks}</Table.Td>
                                                                        <Table.Td>
                                                                            {row.imageUrl && String(row.imageUrl).startsWith("https://") ? (
                                                                                <Box
                                                                                    style={{
                                                                                        width: "100px",
                                                                                        height: "100px",
                                                                                        overflow: "hidden",
                                                                                    }}
                                                                                >
                                                                                    <img
                                                                                        src={row.imageUrl}
                                                                                        alt="Inspection"
                                                                                        style={{
                                                                                            width: "100%",
                                                                                            height: "auto",
                                                                                            objectFit: "cover",
                                                                                        }}
                                                                                        onError={(e) => {
                                                                                            e.target.style.display = "none";
                                                                                            e.target.parentElement.innerHTML = '<span style="color: red">Image Failed to Load</span>';
                                                                                        }}
                                                                                    />
                                                                                </Box>
                                                                            ) : (
                                                                                "-"
                                                                            )}
                                                                        </Table.Td>
                                                                    </Table.Tr>
                                                                );
                                                            });
                                                        })()}
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

                        {brand?.toLowerCase() === "sdlg" &&
                            defect_remarks &&
                            defect_remarks.length > 0 && (
                                <Box>
                                    <Title
                                        order={4}
                                        mt="md"
                                        mb="sm"
                                        pb="xs"
                                        style={{
                                            borderBottom: "1px solid var(--mantine-color-gray-2)",
                                        }}
                                    >
                                        Defects & Remarks
                                    </Title>
                                    <Table
                                        striped
                                        highlightOnHover
                                        withTableBorder
                                        withColumnBorders
                                    >
                                        <Table.Thead>
                                            <Table.Tr>
                                                <Table.Th style={{ width: "50px" }}>No.</Table.Th>
                                                <Table.Th style={{ width: "50%" }}>Defect Description</Table.Th>
                                                <Table.Th>Remarks / Corrective Action</Table.Th>
                                            </Table.Tr>
                                        </Table.Thead>
                                        <Table.Tbody>
                                            {defect_remarks.map((defect, index) => (
                                                <Table.Tr key={defect.defectID || index}>
                                                    <Table.Td>{index + 1}</Table.Td>
                                                    <Table.Td>{defect.description || "-"}</Table.Td>
                                                    <Table.Td>{defect.remarks || "-"}</Table.Td>
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
                                style={{
                                    borderBottom: "1px solid var(--mantine-color-gray-2)",
                                }}
                            >
                                General Notes / Remarks
                            </Title>
                            <Paper withBorder p="md" radius="md">
                                <Text style={{ whiteSpace: "pre-wrap" }}>{remarks}</Text>
                            </Paper>
                        </Box>
                    </Stack>
                )}
            </Modal>
        </Container>
    );
};

export default LogData;
