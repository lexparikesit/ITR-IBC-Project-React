"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
    Container,
    Title,
    Paper,
    Group,
    Text,
    Grid,
    Table,
    Loader,
    Box,
    Alert,
    Card,
} from '@mantine/core';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LabelList,
} from "recharts";
import { IconTruck, IconDatabase, IconFileCheck, IconPackages, IconAlertCircle, IconKey, IconChartLine, IconChartBar, IconChartPie } from '@tabler/icons-react';
import { notifications } from "@mantine/notifications";
import { useUser } from "@/context/UserContext";
import apiClient from "@/libs/api";

// Mapping stage ke label & icon
const STAGE_CONFIG = {
    arrival: { label: "Arrival Check", icon: IconTruck, color: "blue" },
    maintenance: { label: "Maintenance List", icon: IconDatabase, color: "violet" },
    pdi: { label: "Pre Delivery", icon: IconFileCheck, color: "green" },
    commissioning: { label: "Commissioning", icon: IconPackages, color: "orange" },
    ibc: { label: "IBC", icon: IconAlertCircle, color: "yellow" },
};

// Brand mapping
const BRAND_NAME_MAP = {
    MA: "Manitou",
    KA: "Kalmar",
    RT: "Renault Trucks",
    SDLG: "SDLG",
    MTN: "Mantsinen",
};

// Normalize brand names to canonical labels for charts
const normalizeBrand = (unit) => {
    // IBC uses Brand_ID on the header; other stages use `brand`
    const stage = unit?.stage;
    const rawFromStage = stage === 'ibc' ? (unit?.Brand_ID ?? unit?.brand) : unit?.brand;

    if (!rawFromStage || rawFromStage === 'undefined' || rawFromStage === 'null' || rawFromStage === '') {
        return 'Unknown';
    }

    const key = String(rawFromStage).trim().toLowerCase();
    const CANONICAL = {
        'ma': 'Manitou',
        'manitou': 'Manitou',
        'rt': 'Renault Trucks',
        'renault': 'Renault Trucks',
        'renault trucks': 'Renault Trucks',
        'sdlg': 'SDLG',
        'ka': 'Kalmar',
        'kalmar': 'Kalmar',
    };

    return CANONICAL[key] || (BRAND_NAME_MAP[rawFromStage] || rawFromStage);
};

// Format waktu
const formatLocalTime = (isoString) => {
    if (!isoString) return "N/A";
    let date = new Date(isoString.endsWith("Z") ? isoString : isoString + "Z");
    if (isNaN(date.getTime())) return isoString;
    return date.toLocaleString("id-ID", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZone: "Asia/Jakarta",
    }).replace(/\./g, ":");
};

const formatDateOnly = (isoString) => {
    if (!isoString) return "N/A";
    try {
        return new Date(isoString).toLocaleDateString("id-ID");
    } catch {
        return "N/A";
    }
};

export default function DashboardOverview() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [allUnits, setAllUnits] = useState([]);
    const [upcomingIbc, setUpcomingIbc] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStage, setSelectedStage] = useState("all");
    const [ibcPopularity, setIbcPopularity] = useState({ accessories: [], packages: [] });
    const [customerMap, setCustomerMap] = useState({});
    const [unitTypeMap, setUnitTypeMap] = useState({});
    const fetchedBrandIdsRef = useRef(new Set());
    const { user } = useUser();

    // Fetch all data
    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setLoading(true);

                // Use absolute URLs to hit non-/api log routes without changing global baseURL
                const endpoints = [
                    { url: 'http://localhost:5000/arrival-check/log/all', stage: 'arrival' },
                    { url: 'http://localhost:5000/storage-maintenance/log/all', stage: 'maintenance' },
                    { url: 'http://localhost:5000/pre-delivery/log/all', stage: 'pdi' },
                    { url: 'http://localhost:5000/commissioning/log/all', stage: 'commissioning' },
                    { url: 'http://localhost:5000/ibc/log/all', stage: 'ibc' },
                ];

                const requests = endpoints.map(ep => 
                    apiClient.get(ep.url).then(res => (res.data || []).map(item => ({ ...item, stage: ep.stage}))
                    ).catch(err => {
                        console.warn(`Failed to fetch ${ep.stage}:`, err);
                        return [];
                    })
                );

                const results = await Promise.all(requests);
                const combined = results.flat();
                const unitWithStatus = combined.map(unit => ({
                    ...unit,
                    status: unit.stage === "ibc" ? "submitted" : "completed"
                }));

                setAllUnits(unitWithStatus);
            
            } catch (err) {
                setError(err.message);
                notifications.show({
                    title: "Error",
                    message: "Failed to load dashboard data",
                    color: "red"
                });    
            
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    useEffect(() => {
        const loadCustomers = async () => {
            try {
                const response = await apiClient.get("/customers");
                const seen = new Set();
                const map = {};
                (response.data || []).forEach((cust) => {
                    const id = cust?.CustomerID;
                    if (!id || seen.has(id)) return;
                    seen.add(id);
                    map[id] = cust?.CustomerName?.trim() || id;
                });
                setCustomerMap(map);
            } catch (err) {
                console.warn("Failed to fetch customer lookup", err);
            }
        };
        loadCustomers();
    }, []);

    // Helper: extract a JS Date for a unit (used for throughput/aging)
    const getUnitDate = (unit) => {
        const stage = unit?.stage;
        const candidates = [
            unit?.createdOn,
            unit?.dateOfCheck,
            unit?.createdon,
            unit?.IBC_date,
        ];
        for (const c of candidates) {
            if (c) {
                const d = new Date(String(c).endsWith("Z") ? c : `${c}`);
                if (!isNaN(d.getTime())) return d;
            }
        }
        return null;
    };

    const fetchUnitTypesForBrands = useCallback(async (brandIds = []) => {
        const pendingIds = brandIds.filter(
            (id) => id && !fetchedBrandIdsRef.current.has(id)
        );
        if (!pendingIds.length) return;

        try {
            const responses = await Promise.all(
                pendingIds.map((brandId) =>
                    apiClient
                        .get(`/unit-types/${brandId}`)
                        .then((res) => ({ brandId, data: res.data || [] }))
                        .catch(() => ({ brandId, data: [] }))
                )
            );

            const newMap = {};
            responses.forEach(({ brandId, data }) => {
                data.forEach((item) => {
                    if (!item?.value) return;
                    newMap[item.value] = item.label || item.value;
                });
                fetchedBrandIdsRef.current.add(brandId);
            });

            if (Object.keys(newMap).length) {
                setUnitTypeMap((prev) => ({ ...prev, ...newMap }));
            }
        } catch (err) {
            console.warn("Failed to fetch unit type lookup", err);
        }
    }, []);

    // Fetch IBC detail to get DeliveryPlan, then compute upcoming deliveries (next 7 days)
    useEffect(() => {
        const loadUpcomingIbc = async () => {
            const ibcHeaders = allUnits.filter((u) => u.stage === 'ibc' && u.IBC_ID);
            if (ibcHeaders.length === 0) {
                setUpcomingIbc([]);
                return;
            }
            try {
                const limited = ibcHeaders.slice(0, 20); // avoid over-fetching
                const detailPromises = limited.map((h) =>
                    apiClient
                        .get(`http://localhost:5000/ibc/log/details/${h.IBC_ID}`)
                        .then((res) => res.data)
                        .catch(() => null)
                );
                const details = (await Promise.all(detailPromises)).filter(Boolean);
                const brandIds = Array.from(
                    new Set(details.map((d) => d?.Brand_ID).filter(Boolean))
                );
                await fetchUnitTypesForBrands(brandIds);
                const now = new Date();
                const in7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                const rowsByIbc = new Map();
                details.forEach((d) => {
                    const trans = Array.isArray(d?.ibc_trans) ? d.ibc_trans : [];
                    const upcomingTrans = trans
                        .map((t) => {
                            const dt = t?.DeliveryPlan ? new Date(t.DeliveryPlan) : null;
                            if (!dt || dt < now || dt > in7) return null;
                            return { ...t, plan: dt };
                        })
                        .filter(Boolean);

                    if (!upcomingTrans.length) return;

                    const ibcKey = d?.IBC_No || d?.IBC_ID;
                    if (!ibcKey) return;
                    const earliestPlan = upcomingTrans.reduce(
                        (min, item) => (item.plan < min ? item.plan : min),
                        upcomingTrans[0].plan
                    );
                    const qty = Number(d?.QTY) || upcomingTrans.length || 1;

                    rowsByIbc.set(ibcKey, {
                        ibcNo: d?.IBC_No || d?.IBC_ID || '-',
                        brand: normalizeBrand({ stage: 'ibc', Brand_ID: d?.Brand_ID }),
                        customer: d?.Cust_ID,
                        poPjb: d?.PO_PJB,
                        unitType: d?.UnitType,
                        siteOperation: d?.SiteOperation,
                        qty,
                        plan: earliestPlan,
                        requestor: d?.Requestor,
                    });
                });
                const groupedRows = Array.from(rowsByIbc.values()).sort(
                    (a, b) => a.plan - b.plan
                );
                setUpcomingIbc(groupedRows.slice(0, 10));
            } catch (e) {
                // fail silently to keep dashboard robust
                setUpcomingIbc([]);
            }
        };
        loadUpcomingIbc();
    }, [allUnits, fetchUnitTypesForBrands]);

    // Compute IBC Packages & Accessories popularity (top 10 from latest 50 IBC headers)
    useEffect(() => {
        const computePopularity = async () => {
            const ibcHeaders = allUnits.filter((u) => u.stage === 'ibc' && u.IBC_ID);
            if (ibcHeaders.length === 0) {
                setIbcPopularity({ accessories: [], packages: [] });
                return;
            }
            try {
                // Load masters to resolve IDs -> labels
                const [accMaster, pkgMaster] = await Promise.all([
                    apiClient.get('/mstAccesories').then(r => r.data).catch(() => []),
                    apiClient.get('/mstPackages').then(r => r.data).catch(() => []),
                ]);
                const accMap = {};
                accMaster.forEach((a) => {
                    const id = String(a?.AccesoriesID || '').toLowerCase();
                    const name = a?.AccesoriesName || '';
                    if (id && name) accMap[id] = name;
                });
                const pkgMap = {};
                pkgMaster.forEach((p) => {
                    const id = String(p?.PackagesID || '').toLowerCase();
                    const name = p?.PackagesType || '';
                    if (id && name) pkgMap[id] = name;
                });

                const sorted = [...ibcHeaders].sort((a, b) => {
                    const da = new Date(a.createdon || a.createdOn || 0).getTime();
                    const db = new Date(b.createdon || b.createdOn || 0).getTime();
                    return db - da;
                });
                const limited = sorted.slice(0, 50);
                const detailPromises = limited.map((h) =>
                    apiClient
                        .get(`http://localhost:5000/ibc/log/details/${h.IBC_ID}`)
                        .then((res) => res.data)
                        .catch(() => null)
                );
                const details = (await Promise.all(detailPromises)).filter(Boolean);

                const accCounts = {};
                const pkgCounts = {};
                const uuidLike = (val) => {
                    if (!val) return false;
                    const s = String(val);
                    return /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/.test(s);
                };

                details.forEach((d) => {
                    const acc = Array.isArray(d?.ibc_accessories) ? d.ibc_accessories : [];
                    const pkgs = Array.isArray(d?.ibc_packages) ? d.ibc_packages : [];
                    acc.forEach((a) => {
                        // IBC_Accessories may be a UUID (reference to master) or a literal name
                        const raw = a?.IBC_Accessories || a?.Accessory || a?.name;
                        if (!raw) return;
                        const key = String(raw).toLowerCase();
                        const resolved = accMap[key] || accMap[raw] || raw; // try resolve via master
                        const qty = Number(a?.qty_acc);
                        const amount = Number.isFinite(qty) && qty > 0 ? qty : 1;
                        accCounts[resolved] = (accCounts[resolved] || 0) + amount;
                    });
                    pkgs.forEach((p) => {
                        // Prefer Package Type label; if it's a UUID, resolve via master map.
                        let candidate = p?.PackagesType;
                        if (uuidLike(candidate)) {
                            const key = String(candidate).toLowerCase();
                            candidate = pkgMap[key] || candidate;
                        }
                        if (!candidate) {
                            const rawId = p?.IBC_PackagesID || p?.PackagesID || (typeof p === 'string' ? p : '');
                            const key = rawId ? String(rawId).toLowerCase() : '';
                            candidate = key && pkgMap[key] ? pkgMap[key] : undefined;
                        }
                        // Last resort: fallback to description if nothing else
                        if (!candidate) candidate = p?.PackageDesc;

                        if (candidate) pkgCounts[candidate] = (pkgCounts[candidate] || 0) + 1;
                    });
                });

                const accTop = Object.entries(accCounts)
                    .filter(([name]) => !!String(name).trim())
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 10)
                    .map(([name, value]) => ({ name, value }));
                const pkgTop = Object.entries(pkgCounts)
                    .filter(([name]) => {
                        const s = String(name).trim();
                        return s && !uuidLike(s);
                    })
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 10)
                    .map(([name, value]) => ({ name, value }));

                setIbcPopularity({ accessories: accTop, packages: pkgTop });
            } catch (e) {
                setIbcPopularity({ accessories: [], packages: [] });
            }
        };
        computePopularity();
    }, [allUnits]);

    // Filter data
    const filteredUnits = useMemo(() => {
        return allUnits.filter(unit => {
            const matchesSearch = !searchQuery ||
                unit.VIN?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                unit.woNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                unit.model?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStage = selectedStage === "all" || unit.stage === selectedStage;
            return matchesSearch && matchesStage;
        });
    }, [allUnits, searchQuery, selectedStage]);

    // Hitung summary per tahapan
    const stageSummary = useMemo(() => {
        const counts = {};
        allUnits.forEach(unit => {
            counts[unit.stage] = (counts[unit.stage] || 0) + 1;
        });
        return counts;
    }, [allUnits]);

    // Hitung total unit & status
    const totalUnits = allUnits.length;
    const completedUnits = allUnits.filter(unit => unit.status === "completed").length;
    const pendingUnits = allUnits.filter(u => u.status === 'submitted').length;

    // Data untuk Bar Chart: jumlah unit per brand
    const brandData = useMemo(() => {
        const brandCounts = {};
        allUnits.forEach(unit => {
            const label = normalizeBrand(unit);
            if (label === 'Unknown') return; // skip unknown brands from chart
            brandCounts[label] = (brandCounts[label] || 0) + 1;
        });

        return Object.entries(brandCounts).map(([label, count]) => ({
            name: label,
            value: count,
        }));
    }, [allUnits]);

    // Data untuk Bar Chart: jumlah unit per tahapan (fixed order + complete naming)
    const stageData = useMemo(() => ([
        { key: 'arrival', name: 'Arrival Check', value: stageSummary.arrival || 0 },
        { key: 'maintenance', name: 'Maintenance List', value: stageSummary.maintenance || 0 },
        { key: 'pdi', name: 'Pre Delivery', value: stageSummary.pdi || 0 },
        { key: 'ibc', name: 'IBC', value: stageSummary.ibc || 0 },
        { key: 'commissioning', name: 'Commissioning', value: stageSummary.commissioning || 0 },
    ]), [stageSummary]);

    // Weekly Throughput (last 7 days), stacked by stage
    const weeklyThroughput = useMemo(() => {
        const days = [];
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setHours(0, 0, 0, 0);
            d.setDate(today.getDate() - i);
            days.push(d);
        }
        const data = days.map((d) => ({
            name: d.toLocaleDateString('id-ID', { month: '2-digit', day: '2-digit' }),
            arrival: 0,
            maintenance: 0,
            pdi: 0,
            ibc: 0,
            commissioning: 0,
        }));
        const findBucket = (dt) => {
            if (!dt) return -1;
            const dayStart = new Date(dt);
            dayStart.setHours(0, 0, 0, 0);
            return days.findIndex((d) => d.getTime() === dayStart.getTime());
        };
        allUnits.forEach((u) => {
            const dt = getUnitDate(u);
            const idx = findBucket(dt);
            if (idx >= 0 && data[idx][u.stage] !== undefined) {
                data[idx][u.stage] += 1;
            }
        });
        return data;
    }, [allUnits]);

    if (loading) {
        return (
            <Container size="xl" my="xl">
                <Title order={1} mb="xl" ta="center">Vehicle Process Dashboard</Title>
                <Box ta="center" mt="xl">
                    <Loader size="lg" />
                    <Text mt="md">Loading dashboard data...</Text>
                </Box>
            </Container>
        );
    }

    if (error) {
        return (
            <Container size="xl" my="xl">
                <Title order={1} mb="xl" ta="center">Vehicle Process Dashboard</Title>
                <Alert color="red" title="Error">
                    {error}
                </Alert>
            </Container>
        );
    }

    return (
        <Container size="xl" my="xl">
            <Title order={1} mb="xl" ta="center" c="var(--mantine-color-text)">Vehicle Process Dashboard</Title>

            {/* Summary Cards */}
            <Grid mb="xl">
                {/* Baris Atas: 4 Card */}
                <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
                    <Card shadow="sm" p="md" radius="md" h={120}>
                        <Group justify="space-between" align="center" h="100%">
                            <div>
                                <Text size="sm" c="dimmed">Arrival Check</Text>
                                <Text size="xl" fw={700} c="var(--mantine-color-text)">
                                    {stageSummary.arrival || 0}
                                </Text>
                            </div>
                            <IconTruck size={32} color="var(--mantine-color-blue-6)" />
                        </Group>
                    </Card>
                </Grid.Col>

                <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
                    <Card shadow="sm" p="md" radius="md" h={120}>
                        <Group justify="space-between" align="center" h="100%">
                            <div>
                                <Text size="sm" c="dimmed">Storage Maintenance</Text>
                                <Text size="xl" fw={700} c="var(--mantine-color-text)">
                                    {stageSummary.maintenance || 0}
                                </Text>
                            </div>
                            <IconDatabase size={32} color="var(--mantine-color-violet-6)" />
                        </Group>
                    </Card>
                </Grid.Col>

                <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
                    <Card shadow="sm" p="md" radius="md" h={120}>
                        <Group justify="space-between" align="center" h="100%">
                            <div>
                                <Text size="sm" c="dimmed">Pre-Delivery</Text>
                                <Text size="xl" fw={700} c="var(--mantine-color-text)">
                                    {stageSummary.pdi || 0}
                                </Text>
                            </div>
                            <IconFileCheck size={32} color="var(--mantine-color-green-6)" />
                        </Group>
                    </Card>
                </Grid.Col>

                <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
                    <Card shadow="sm" p="md" radius="md" h={120}>
                        <Group justify="space-between" align="center" h="100%">
                            <div>
                                <Text size="sm" c="dimmed">Commissioning</Text>
                                <Text size="xl" fw={700} c="var(--mantine-color-text)">
                                    {stageSummary.commissioning || 0}
                                </Text>
                            </div>
                            <IconPackages size={32} color="var(--mantine-color-orange-6)" />
                        </Group>
                    </Card>
                </Grid.Col>

                {/* Baris Bawah: IBC di Tengah */}
                <Grid.Col span={{ base: 12, sm: 6, lg: 3 }} offset={{ lg: 4.5 }} >
                    <Card shadow="sm" p="md" radius="md" h={120}>
                        <Group justify="space-between" align="center" h="100%">
                            <div>
                                <Text size="sm" c="dimmed">IBC</Text>
                                <Text size="xl" fw={700} c="var(--mantine-color-text)">
                                    {stageSummary.ibc || 0}
                                </Text>
                            </div>
                            <IconAlertCircle size={32} color="var(--mantine-color-yellow-6)" />
                        </Group>
                    </Card>
                </Grid.Col>
            </Grid>

            {/* Bar Chart: Units by Brand */}
            <Grid mb="xl">
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <Paper p="md" withBorder>
                        <Title order={3} mb="md" c="var(--mantine-color-text)">Units by Brand</Title>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={brandData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="value" fill="#3498DB">
                                    <LabelList dataKey="value" position="top" />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <Paper p="md" withBorder>
                        <Title order={3} mb="md" c="var(--mantine-color-text)">Units by Stage</Title>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={stageData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="value" fill="#3498DB">
                                    <LabelList dataKey="value" position="top" />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid.Col>
                {/* removed Status Distribution and Top Brands as requested */}
            </Grid>

            {/* Weekly Throughput */}
            <Grid mb="xl">
                <Grid.Col span={{ base: 12 }}>
                    <Paper p="md" withBorder>
                        <Title order={3} mb="md" c="var(--mantine-color-text)">Weekly Throughput</Title>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={weeklyThroughput} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Legend />
                                <Bar stackId="a" dataKey="arrival" name="Arrival" fill="#3498DB" />
                                <Bar stackId="a" dataKey="maintenance" name="Maintenance" fill="#8E44AD" />
                                <Bar stackId="a" dataKey="pdi" name="Pre Delivery" fill="#27AE60" />
                                <Bar stackId="a" dataKey="commissioning" name="Commissioning" fill="#E67E22" />
                                <Bar stackId="a" dataKey="ibc" name="IBC" fill="#F1C40F" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid.Col>
            </Grid>

            {/* Upcoming IBC Deliveries - full width, more columns */}
            <Grid mb="xl">
                <Grid.Col span={{ base: 12 }}>
                    <Paper p="md" withBorder>
                        <Title order={3} mb="md" c="var(--mantine-color-text)">Upcoming IBC Deliveries (7 days)</Title>
                        <Table highlightOnHover>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th style={{ width: 60 }}>No.</Table.Th>
                                    <Table.Th>Plan Date</Table.Th>
                                    <Table.Th>IBC No</Table.Th>
                                    <Table.Th>Brand</Table.Th>
                                    <Table.Th>Customer</Table.Th>
                                    <Table.Th>PO/PJB</Table.Th>
                                    <Table.Th>Type/Model</Table.Th>
                                    <Table.Th>Site Operation</Table.Th>
                                    <Table.Th>Qty</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {upcomingIbc.length === 0 ? (
                                    <Table.Tr>
                                        <Table.Td colSpan={9}>
                                            <Text c="dimmed">No upcoming deliveries in the next 7 days.</Text>
                                        </Table.Td>
                                    </Table.Tr>
                                ) : (
                                    upcomingIbc.map((r, i) => (
                                        <Table.Tr key={`${r.ibcNo}-${i}`}>
                                            <Table.Td>{i + 1}</Table.Td>
                                            <Table.Td>{formatDateOnly(r.plan)}</Table.Td>
                                            <Table.Td>{r.ibcNo}</Table.Td>
                                            <Table.Td>{r.brand}</Table.Td>
                                            <Table.Td>{customerMap[r.customer] || r.customer || '-'}</Table.Td>
                                            <Table.Td>{r.poPjb || '-'}</Table.Td>
                                            <Table.Td>{unitTypeMap[r.unitType] || r.unitType || '-'}</Table.Td>
                                            <Table.Td>{r.siteOperation || '-'}</Table.Td>
                                            <Table.Td>{r.qty}</Table.Td>
                                        </Table.Tr>
                                    ))
                                )}
                            </Table.Tbody>
                        </Table>
                    </Paper>
                </Grid.Col>
            </Grid>

            {/* IBC Popular Accessories & Packages (as tables, sorted desc) */}
            <Grid mb="xl">
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <Paper p="md" withBorder style={{ display: 'flex', flexDirection: 'column', height: 300 }}>
                        <Title order={3} mb="md" c="var(--mantine-color-text)">Popular IBC Accessories</Title>
                        <Box style={{ flex: 1, overflowY: 'auto' }}>
                            <Table highlightOnHover>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>Accessory</Table.Th>
                                        <Table.Th ta="right">Count</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {(ibcPopularity.accessories || [])
                                        .sort((a, b) => b.value - a.value)
                                        .map((row, idx) => (
                                            <Table.Tr key={`acc-${idx}`}>
                                                <Table.Td>{row.name}</Table.Td>
                                                <Table.Td ta="right">{row.value}</Table.Td>
                                            </Table.Tr>
                                        ))}
                                </Table.Tbody>
                            </Table>
                        </Box>
                    </Paper>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <Paper p="md" withBorder style={{ display: 'flex', flexDirection: 'column', height: 300 }}>
                        <Title order={3} mb="md" c="var(--mantine-color-text)">Popular IBC Packages</Title>
                        <Box style={{ flex: 1, overflowY: 'auto' }}>
                            <Table highlightOnHover>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>Package Name</Table.Th>
                                        <Table.Th ta="right">Count</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {(ibcPopularity.packages || [])
                                        .sort((a, b) => b.value - a.value)
                                        .map((row, idx) => (
                                            <Table.Tr key={`pkg-${idx}`}>
                                                <Table.Td>{row.name}</Table.Td>
                                                <Table.Td ta="right">{row.value}</Table.Td>
                                            </Table.Tr>
                                        ))}
                                </Table.Tbody>
                            </Table>
                        </Box>
                    </Paper>
                </Grid.Col>
            </Grid>
        </Container>
    );
}

function IconCheck({ size = 24, color = "currentColor" }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
        </svg>
    );
}

function IconLayers({ size = 24, color = "currentColor" }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5M2 12l10 5 10-5" />
            <path d="M2 17l10 5 10-5M12 12L2 7v10" />
        </svg>
    );
}
