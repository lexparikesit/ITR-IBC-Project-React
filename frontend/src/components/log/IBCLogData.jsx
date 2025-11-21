"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
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
    ActionIcon,
} from '@mantine/core';
import * as XLSX from 'xlsx';
import { IconSearch, IconEye, IconAlertCircle, IconDownload, IconSettings, IconTrash } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useUser } from '@/context/UserContext';
import { DateInput } from '@mantine/dates';

const BRAND_NAME_MAP = {
    'MA': 'Manitou',
    'KA': 'Kalmar',
    'RT': 'Renault Trucks',
    'SDLG': 'SDLG',
    'MTN': 'Mantsinen',
};
const BRAND_OPTIONS = Object.entries(BRAND_NAME_MAP).map(([value, label]) => ({
    value,
    label,
}));

const formatDateForInput = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
};

const createEmptyEditPayload = () => ({
    headerForm: {
        Requestor: '',
        IBC_date: '',
        PO_PJB: '',
        Cust_ID: '',
        Brand_ID: '',
        UnitType: '',
        QTY: 1,
        SiteOperation: '',
    },
    detailForm: {
        AttachmentType: '',
        AttachmentSupplier: '',
        DeliveryAddress: '',
        DeliveryCustPIC: '',
        DeliveryPlan: '',
        Remarks: '',
        vins: [{ VIN: '' }],
    },
    accessoriesForm: {
        accessories: [{ AccessoriesName: '', Remarks: '', qty_acc: 1 }],
    },
    packagesForm: {
        packages: [{ PackagesType: '', PackageDesc: '' }],
    },
});

const mapDetailsToEditPayload = (details) => {
    const payload = createEmptyEditPayload();
    if (!details) return payload;

    payload.headerForm = {
        Requestor: details.Requestor || '',
        IBC_date: formatDateForInput(details.IBC_date),
        PO_PJB: details.PO_PJB || '',
        Cust_ID: details.Cust_ID || '',
        Brand_ID: details.Brand_ID || '',
        UnitType: details.UnitType || '',
        QTY: details.QTY || 1,
        SiteOperation: details.SiteOperation || '',
    };

    const firstTrans = details.ibc_trans?.[0] || {};
    payload.detailForm = {
        AttachmentType: firstTrans.AttachmentType || '',
        AttachmentSupplier: firstTrans.AttachmentSupplier || '',
        DeliveryAddress: firstTrans.DeliveryAddress || '',
        DeliveryCustPIC: firstTrans.DeliveryCustPIC || '',
        DeliveryPlan: formatDateForInput(firstTrans.DeliveryPlan),
        Remarks: firstTrans.Remarks || '',
        vins: details.ibc_trans && details.ibc_trans.length > 0
            ? details.ibc_trans.map((trans) => ({ VIN: trans.VIN || '' }))
            : [{ VIN: '' }],
    };
    payload.headerForm.QTY = payload.detailForm.vins.length;

    payload.accessoriesForm = {
        accessories: details.ibc_accessories && details.ibc_accessories.length > 0
            ? details.ibc_accessories.map((acc) => ({
                AccessoriesName: acc.IBC_Accessories || '',
                Remarks: acc.Remarks || '',
                qty_acc: acc.qty_acc || 1,
            }))
            : [{ AccessoriesName: '', Remarks: '', qty_acc: 1 }],
    };

    payload.packagesForm = {
        packages: details.ibc_packages && details.ibc_packages.length > 0
            ? details.ibc_packages.map((pkg) => ({
                PackagesType: pkg.PackagesType || '',
                PackageDesc: pkg.PackageDesc || '',
            }))
            : [{ PackagesType: '', PackageDesc: '' }],
    };

    return payload;
};

const MAX_UNIT_COUNT = 20;
const MAX_ACCESSORIES_COUNT = 26;
const MAX_PACKAGES_COUNT = 5;
const EXCLUDED_KEYS = [
    'ibc_trans',
    'ibc_packages',
    'ibc_accessories',
    'id',
    'details',
    'modifiedby',
    'modifiedon',
];
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

    let date;
    
    if (typeof isoString === 'string' && !isoString.endsWith('Z') && !isoString.includes('+')) {
        date = new Date(isoString + 'Z');
    } else {
        date = new Date(isoString);
    }

    if (isNaN(date.getTime())) {
        return isoString;
    }

    return date.toLocaleString('id-ID', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: 'Asia/Jakarta'
    }).replace(/\./g, ':');
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
            value = lookupTables.requestors?.[value] || toTitleCase(value) || 'N/A';
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

const fetchRequestorData = async (token) => {
    if (!token) return {};

    const roles = ["Salesman", "Product Head", "Technical Head"];
    const requestorMap = {};

    try {
        const responses = await Promise.all(
            roles.map((role) =>
                fetch(`http://127.0.0.1:5000/api/users/by-role/${encodeURIComponent(role)}`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
            )
        );

        for (const response of responses) {
            if (!response.ok) continue;
            const requestors = await response.json();
            requestors.forEach((user) => {
                const key = user.userid || user.value || user.id;
                if (!key) return;
                const label =
                    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
                    user.label ||
                    user.username ||
                    user.email ||
                    user.name ||
                    key;
                requestorMap[key] = label;
            });
        }

        return requestorMap;
    } catch (error) {
        console.error("[ERROR] Error fetching requestor data:", error);
        return requestorMap;
    }
};

const IBCLogData = ({ title, apiUrl }) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
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
        requestors: {},
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editPayload, setEditPayload] = useState(() => createEmptyEditPayload());
    const [initialEditPayload, setInitialEditPayload] = useState(() => createEmptyEditPayload());
    const [editLoading, setEditLoading] = useState(false);
    const { user } = useUser()
    const isDirty = useMemo(
        () =>
            isEditing &&
            JSON.stringify(editPayload) !== JSON.stringify(initialEditPayload),
        [editPayload, initialEditPayload, isEditing]
    );

    const fetchAllData = useCallback(async () => {
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
            const requestorLookup = await fetchRequestorData(token);

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
                accessories: accessoryLookup,
                requestors: requestorLookup,
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
    }, [apiUrl, token]);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

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

    const requestorOptions = useMemo(
        () => Object.entries(lookupTables.requestors || {}).map(([value, label]) => ({ value, label })),
        [lookupTables.requestors]
    );
    const customerOptions = useMemo(
        () => Object.entries(lookupTables.customers || {}).map(([value, label]) => ({
            value,
            label: toTitleCase(label),
        })),
        [lookupTables.customers]
    );
    const modelOptions = useMemo(
        () => Object.entries(lookupTables.models || {}).map(([value, label]) => ({ value, label })),
        [lookupTables.models]
    );
    const packageOptions = useMemo(
        () => Object.entries(lookupTables.packages || {}).map(([value, label]) => ({ value, label })),
        [lookupTables.packages]
    );
    const accessoryOptions = useMemo(
        () => Object.entries(lookupTables.accessories || {}).map(([value, label]) => ({ value, label })),
        [lookupTables.accessories]
    );
    const start = (activePage - 1) * parseInt(rowsPerPage, 10);
    const end = start + parseInt(rowsPerPage, 10);
    const paginatedLogs = filteredLogs.slice(start, end);

    const handleOpenModal = async (ibcId, mode = 'view') => {
        if (!token) {
            notifications.show({ 
                title: "Error", 
                message: "Token Missing!", 
                color: "red" });
            return;
        }

        setSelectedLogDetails(null);
        if (mode === 'edit') {
            setIsEditing(true);
        } else {
            setIsEditing(false);
            setEditPayload(createEmptyEditPayload());
        }
        openModal();

        try {
            const res = await fetch(`http://127.0.0.1:5000/ibc/log/details/${ibcId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('Failed to fetch detail');

            const details = await res.json();
            setSelectedLogDetails(details);
            if (mode === 'edit') {
                const mapped = mapDetailsToEditPayload(details);
                setEditPayload(mapped);
                setInitialEditPayload(mapped);
            }

        } catch (err) {
            notifications.show({ title: "Error", message: err.message, color: "red" });
            setSelectedLogDetails({ error: err.message });
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditPayload(createEmptyEditPayload());
        setInitialEditPayload(createEmptyEditPayload());
    };

    const handleCloseModal = () => {
        handleCancelEdit();
        setSelectedLogDetails(null);
        closeModal();
    };

    const handleStartEditing = () => {
        if (!selectedLogDetails) return;
            const mapped = mapDetailsToEditPayload(selectedLogDetails);
                setEditPayload(mapped);
                setInitialEditPayload(mapped);
            setIsEditing(true);
        };

    const handleHeaderChange = (field, value) => {
        setEditPayload((prev) => ({
            ...prev,
            headerForm: {
                ...prev.headerForm,
                [field]: value ?? '',
            },
        }));
    };

    const handleDetailChange = (field, value) => {
        setEditPayload((prev) => ({
            ...prev,
            detailForm: {
                ...prev.detailForm,
                [field]: value ?? '',
            },
        }));
    };

    const updateVins = (updater) => {
        setEditPayload((prev) => {
            const nextVins = updater(prev.detailForm.vins);
            return {
                ...prev,
                detailForm: { ...prev.detailForm, vins: nextVins },
                headerForm: { ...prev.headerForm, QTY: nextVins.length },
            };
        });
    };

    const handleVinChange = (index, value) => {
        updateVins((vins) =>
            vins.map((vin, idx) => (idx === index ? { ...vin, VIN: value } : vin))
        );
    };

    const addVinRow = () => {
        if (editPayload.detailForm.vins.length >= MAX_UNIT_COUNT) {
            notifications.show({
                title: "Limit Reached",
                message: `Maximum unit quantity is ${MAX_UNIT_COUNT}. Remove a VIN before adding another.`,
                color: "yellow",
            });
            return;
        }
        updateVins((vins) => [...vins, { VIN: '' }]);
    };

    const removeVinRow = (index) => {
        updateVins((vins) => {
            if (vins.length === 1) return vins;
            return vins.filter((_, idx) => idx !== index);
        });
    };

    const handleAccessoryChange = (index, field, value) => {
        setEditPayload((prev) => {
            const accessories = prev.accessoriesForm.accessories.map((acc, idx) =>
                idx === index ? { ...acc, [field]: value ?? '' } : acc
            );
            return {
                ...prev,
                accessoriesForm: { ...prev.accessoriesForm, accessories },
            };
        });
    };

    const addAccessoryRow = () => {
        if (editPayload.accessoriesForm.accessories.length >= MAX_ACCESSORIES_COUNT) {
            notifications.show({
                title: "Limit Reached",
                message: `You can only add up to ${MAX_ACCESSORIES_COUNT} accessories.`,
                color: "yellow",
            });
            return;
        }

        setEditPayload((prev) => ({
            ...prev,
            accessoriesForm: {
                ...prev.accessoriesForm,
                accessories: [
                    ...prev.accessoriesForm.accessories,
                    { AccessoriesName: '', Remarks: '', qty_acc: 1 },
                ],
            },
        }));
    };

    const removeAccessoryRow = (index) => {
        setEditPayload((prev) => {
            if (prev.accessoriesForm.accessories.length === 1) return prev;
            const next = prev.accessoriesForm.accessories.filter((_, idx) => idx !== index);
            return {
                ...prev,
                accessoriesForm: { ...prev.accessoriesForm, accessories: next },
            };
        });
    };

    const handlePackageChange = (index, field, value) => {
        setEditPayload((prev) => {
            const packages = prev.packagesForm.packages.map((pkg, idx) =>
                idx === index ? { ...pkg, [field]: value ?? '' } : pkg
            );
            return {
                ...prev,
                packagesForm: { ...prev.packagesForm, packages },
            };
        });
    };

    const addPackageRow = () => {
        if (editPayload.packagesForm.packages.length >= MAX_PACKAGES_COUNT) {
            notifications.show({
                title: "Limit Reached",
                message: `You can only add up to ${MAX_PACKAGES_COUNT} packages.`,
                color: "yellow",
            });
            return;
        }

        setEditPayload((prev) => ({
            ...prev,
            packagesForm: {
                ...prev.packagesForm,
                packages: [
                    ...prev.packagesForm.packages,
                    { PackagesType: '', PackageDesc: '' },
                ],
            },
        }));
    };

    const removePackageRow = (index) => {
        setEditPayload((prev) => {
            if (prev.packagesForm.packages.length === 1) return prev;
            const next = prev.packagesForm.packages.filter((_, idx) => idx !== index);
            return {
                ...prev,
                packagesForm: { ...prev.packagesForm, packages: next },
            };
        });
    };

    const validateEditPayload = () => {
        const { headerForm, detailForm, accessoriesForm, packagesForm } = editPayload;

        if (!headerForm.Requestor || !headerForm.IBC_date || !headerForm.PO_PJB || !headerForm.Cust_ID ||
            !headerForm.Brand_ID || !headerForm.UnitType || !headerForm.SiteOperation) {
            return "Please complete all header fields.";
        }

        if (!headerForm.QTY || Number(headerForm.QTY) < 1) {
            return "Quantity must be at least 1.";
        }

        if (!detailForm.AttachmentType || !detailForm.AttachmentSupplier || !detailForm.DeliveryAddress ||
            !detailForm.DeliveryCustPIC || !detailForm.DeliveryPlan) {
            return "Please complete all detail fields.";
        }

        if (!detailForm.vins.length || detailForm.vins.some((vin) => !vin.VIN?.trim())) {
            return "Every VIN entry must be filled.";
        }

        const accessoriesValid = accessoriesForm.accessories.every(
            (acc) => acc.AccessoriesName && Number(acc.qty_acc) > 0
        );
        if (!accessoriesValid) {
            return "Accessories require a name and quantity greater than zero.";
        }

        if (accessoriesForm.accessories.length > MAX_ACCESSORIES_COUNT) {
            return `You can only submit up to ${MAX_ACCESSORIES_COUNT} accessories.`;
        }

        if (detailForm.vins.length > MAX_UNIT_COUNT) {
            return `Maximum unit quantity is ${MAX_UNIT_COUNT}.`;
        }

        const packagesValid = packagesForm.packages.every(
            (pkg) => pkg.PackagesType
        );
        if (!packagesValid) {
            return "Each package entry must include a package type.";
        }

        if (packagesForm.packages.length > MAX_PACKAGES_COUNT) {
            return `You can only submit up to ${MAX_PACKAGES_COUNT} packages.`;
        }

        return null;
    };

    const handleEditSubmit = async (event) => {
        event.preventDefault();
        const validationError = validateEditPayload();
        if (validationError) {
            notifications.show({
                title: "Validation Error",
                message: validationError,
                color: "red",
            });
            return;
        }

        if (!selectedLogDetails?.IBC_ID) {
            notifications.show({
                title: "Update Failed",
                message: "Missing IBC identifier.",
                color: "red",
            });
            return;
        }

        if (!token) {
            notifications.show({
                title: "Update Failed",
                message: "Token Missing!",
                color: "red",
            });
            return;
        }

        setEditLoading(true);

        const payload = {
            headerForm: {
                ...editPayload.headerForm,
                QTY: Number(editPayload.headerForm.QTY),
            },
            detailForm: {
                ...editPayload.detailForm,
                vins: editPayload.detailForm.vins.map((vin) => ({ VIN: vin.VIN.trim() })),
            },
            accessoriesForm: {
                accessories: editPayload.accessoriesForm.accessories.map((acc) => ({
                    AccessoriesName: acc.AccessoriesName,
                    Remarks: acc.Remarks,
                    qty_acc: Number(acc.qty_acc),
                })),
            },
            packagesForm: {
                packages: editPayload.packagesForm.packages.map((pkg) => ({
                    PackagesType: pkg.PackagesType,
                    PackageDesc: pkg.PackageDesc,
                })),
            },
        };

        try {
            const response = await fetch(`http://127.0.0.1:5000/api/ibc/${selectedLogDetails.IBC_ID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(result?.error || 'Failed to update IBC form');
            }

            notifications.show({
                title: "Success",
                message: result?.message || "IBC form updated successfully.",
                color: "green",
            });

            await fetchAllData();
            handleCloseModal();

        } catch (err) {
            notifications.show({
                title: "Update Failed",
                message: err.message,
                color: "red",
            });
        } finally {
            setEditLoading(false);
        }
    };

    const rows = paginatedLogs.map((log,index) => {
        const modelLabel = lookupTables.models[log.UnitType] || log.UnitType || 'N/A';
        const customerName = lookupTables.customers[log.Cust_ID] || log.Cust_ID;
        const brandName = BRAND_NAME_MAP[log.Brand_ID] || log.Brand_ID;
        const requestorName = lookupTables.requestors?.[log.Requestor] || log.Requestor || 'N/A';

        return (
            <Table.Tr key={log.IBC_ID}>
                <Table.Td>{start + index + 1}</Table.Td>
                <Table.Td>{log.IBC_No || 'N/A'}</Table.Td>
                <Table.Td>{requestorName}</Table.Td>
                <Table.Td>{log.PO_PJB || 'N/A'}</Table.Td>
                <Table.Td>{brandName}</Table.Td>
                <Table.Td>{toTitleCase(customerName)}</Table.Td>
                <Table.Td>{modelLabel}</Table.Td>
                <Table.Td>{log.QTY || 'N/A'}</Table.Td>
                <Table.Td>{formatDateOnly(log.IBC_date)}</Table.Td>
                <Table.Td>{log.createdby || 'N/A'}</Table.Td>
                <Table.Td>{formatLocalTime(log.createdon)}</Table.Td>
                <Table.Td>
                    <ActionIcon
                        variant="subtle"
                        color="gray"
                        onClick={() => handleOpenModal(log.IBC_ID)}
                        aria-label="View Detail"
                    >
                        <IconEye size={16} />
                    </ActionIcon>
                </Table.Td>
                <Table.Td>
                    {user?.permissions?.includes('edit_ibc') ? (
                        <ActionIcon
                            variant="light"
                            color="blue"
                            onClick={() => handleOpenModal(log.IBC_ID, 'edit')}
                            aria-label="Edit IBC"
                        >
                            <IconSettings size={16} />
                        </ActionIcon>
                    ) : (
                        <Text c="dimmed">-</Text>
                    )}
                </Table.Td>
            </Table.Tr>
        );
    });

    const unitInfoData = useMemo(() => {
        if (!selectedLogDetails) return [];
        return getUnitInformationData(selectedLogDetails, lookupTables);
    }, [selectedLogDetails, lookupTables]);

    const downloadExcel = () => {
        if (!user?.permissions?.includes('download_ibc_log')) {
            notifications.show({
                title: "Permission Denied",
                message: "You don't have permission to download this log.",
                color: "red",
            });
            return;
        }

        const excelData = logs.map((log, index) => ({
            No: index + 1,
            'IBC No': log.IBC_No || 'N/A',
            Requestor: lookupTables.requestors?.[log.Requestor] || log.Requestor || 'N/A',
            'PO/PJB': log.PO_PJB || 'N/A',
            Brand: log.Brand_ID === 'MA'
                ? 'Manitou'
                : log.Brand_ID === 'KA'
                    ? 'Kalmar'
                    : log.Brand_ID === 'RT'
                        ? 'Renault Trucks'
                        : log.Brand_ID === 'SDLG'
                            ? 'SDLG'
                            : log.Brand_ID === 'MTN'
                                ? 'Mantsinen'
                                : log.Brand_ID || 'N/A',
                Customer: lookupTables.customers?.[log.Cust_ID]
                    ? toTitleCase(lookupTables.customers[log.Cust_ID].trim())
                    : log.Cust_ID || 'N/A',
                'Type/Model': lookupTables.models?.[log.UnitType] || log.UnitType || 'N/A',
                Qty: log.QTY || 'N/A',
                Date: log.IBC_date
                    ? new Date(log.IBC_date).toLocaleDateString('id-ID')
                    : 'N/A',
                'Created By': log.createdby || 'N/A',
                'Created On': formatLocalTime(log.createdon),
                'Modified By': log.modifiedby || 'N/A',
                'Modified On': log.modifiedon ? formatLocalTime(log.modifiedon) : 'N/A',
            }));

        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "IBC Data Log");
        XLSX.writeFile(wb, `ibc_log_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    if (loading) {
        return (
            <Box maw="100%" mx="auto" px="md" ta="center">
                <Title order={1} mt="md" mb="lg">Loading Form Data...</Title>
                <Loader size="lg" />
            </Box>
        );
    }

    return (
        <Container size="xl" my="xl">
            <Title order={1} mb="xl" ta="center">{title}</Title>
                <>
                    <Paper shadow="sm" radius="md" p="md" mb="md">
                        <Group justify="space-between" align="flex-end" mb="md" gap="md">
                            <TextInput
                                label="Search Unit"
                                placeholder="by IBC No, Brand, Customer, Brand/ Product, or Unit Type"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.currentTarget.value);
                                    setActivePage(1);
                                }}
                                w={420}
                            />
                            <Group gap="xs" align="flex-end">
                                {user?.permissions?.includes('download_ibc_log') && (
                                    <Button 
                                        onClick={downloadExcel}
                                        variant="outline"
                                        color="#A91D3A"
                                        size="lg"
                                        p={0}
                                        w={36}
                                        h={36}
                                        style={{
                                            height: '100%',
                                            width: '40px',
                                            paddingTop: '2px',
                                            paddingBottom: '2px',
                                            marginTop: '23px',
                                            paddingBottom: '2px'
                                        }}
                                    >
                                        <IconDownload size={16} />
                                    </Button>
                                )}
                                <Select
                                    label="Show Rows"
                                    data={['10', '20', '30', '50']}
                                    value={String(rowsPerPage)}
                                    onChange={(val) => {
                                        setRowsPerPage(parseInt(val, 10));
                                        setActivePage(1);
                                    }}
                                    w={100}
                                />
                            </Group>
                        </Group>
                    </Paper>

                    <Paper shadow="sm" radius="md" p="md">
                        <Table stickyHeader striped highlightOnHover>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>No.</Table.Th>
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
                                    <Table.Th>View</Table.Th>
                                    <Table.Th>Edit</Table.Th>
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

            <Modal
                opened={modalOpened}
                onClose={handleCloseModal}
                title={isEditing ? "Edit IBC Log" : "Detail IBC Log"}
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
                ) : isEditing ? (
                    <form onSubmit={handleEditSubmit}>
                        <Stack gap="xl">
                            <Box>
                                <Group justify="space-between" align="center" mb="sm">
                                    <Title order={4}>IBC Header</Title>
                                    <Group gap="xs">
                                        <Button
                                            variant="default"
                                            type="button"
                                            onClick={handleCancelEdit}
                                            disabled={editLoading}
                                        >
                                            Cancel
                                        </Button>
                                        <Button type="submit" loading={editLoading} disabled={!isDirty || editLoading}>
                                            Save Changes
                                        </Button>
                                    </Group>
                                </Group>
                                <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
                                    <Select
                                        label="Requestor"
                                        placeholder="Select requestor"
                                        data={requestorOptions}
                                        value={editPayload.headerForm.Requestor || null}
                                        onChange={(value) => handleHeaderChange('Requestor', value || '')}
                                        searchable
                                        required
                                        disabled
                                    />
                                    <TextInput
                                        label="IBC Date"
                                        type="date"
                                        value={editPayload.headerForm.IBC_date || ''}
                                        onChange={(e) => handleHeaderChange('IBC_date', e.currentTarget.value)}
                                        required
                                        disabled
                                    />
                                    <TextInput
                                        label="PO / PJB"
                                        value={editPayload.headerForm.PO_PJB || ''}
                                        onChange={(e) => handleHeaderChange('PO_PJB', e.currentTarget.value)}
                                        required
                                    />
                                    <Select
                                        label="Customer"
                                        placeholder="Select customer"
                                        data={customerOptions}
                                        value={editPayload.headerForm.Cust_ID || null}
                                        onChange={(value) => handleHeaderChange('Cust_ID', value || '')}
                                        searchable
                                        required
                                    />
                                    <Select
                                        label="Brand"
                                        data={BRAND_OPTIONS}
                                        value={editPayload.headerForm.Brand_ID || null}
                                        onChange={(value) => handleHeaderChange('Brand_ID', value || '')}
                                        required
                                        disabled
                                    />
                                    <Select
                                        label="Unit Type"
                                        placeholder="Select unit type"
                                        data={modelOptions}
                                        value={editPayload.headerForm.UnitType || null}
                                        onChange={(value) => handleHeaderChange('UnitType', value || '')}
                                        searchable
                                        required
                                    />
                                    <Stack gap={4}>
                                        <TextInput
                                            label="Quantity"
                                            type="number"
                                            min={1}
                                            value={editPayload.headerForm.QTY}
                                            onChange={(e) => handleHeaderChange('QTY', Number(e.currentTarget.value) || 0)}
                                            required
                                            readOnly
                                        />
                                        <Text c="dimmed" size="xs">
                                            Auto-calculated from VIN count
                                        </Text>
                        </Stack>
                                    <TextInput
                                        label="Site Operation"
                                        value={editPayload.headerForm.SiteOperation || ''}
                                        onChange={(e) => handleHeaderChange('SiteOperation', e.currentTarget.value)}
                                        required
                                    />
                                </SimpleGrid>
                            </Box>

                            <Box>
                                <Title order={4} mb="sm">Detail Information</Title>
                                <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
                                    <TextInput
                                        label="Attachment Type"
                                        value={editPayload.detailForm.AttachmentType || ''}
                                        onChange={(e) => handleDetailChange('AttachmentType', e.currentTarget.value)}
                                        required
                                    />
                                    <TextInput
                                        label="Attachment Supplier"
                                        value={editPayload.detailForm.AttachmentSupplier || ''}
                                        onChange={(e) => handleDetailChange('AttachmentSupplier', e.currentTarget.value)}
                                        required
                                    />
                                    <TextInput
                                        label="Delivery Address"
                                        value={editPayload.detailForm.DeliveryAddress || ''}
                                        onChange={(e) => handleDetailChange('DeliveryAddress', e.currentTarget.value)}
                                        required
                                    />
                                    <TextInput
                                        label="Customer PIC"
                                        value={editPayload.detailForm.DeliveryCustPIC || ''}
                                        onChange={(e) => handleDetailChange('DeliveryCustPIC', e.currentTarget.value)}
                                        required
                                    />
                                    <DateInput
                                        label="Delivery Plan"
                                        value={editPayload.detailForm.DeliveryPlan || ''}
                                        onChange={(e) => handleDetailChange('DeliveryPlan', e.currentTarget.value)}
                                        required
                                    />
                                    <TextInput
                                        label="Remarks"
                                        value={editPayload.detailForm.Remarks || ''}
                                        onChange={(e) => handleDetailChange('Remarks', e.currentTarget.value)}
                                    />
                                </SimpleGrid>

                                <Stack gap="sm" mt="md">
                                    {editPayload.detailForm.vins.map((vin, index) => (
                                        <Group key={`vin-${index}`} align="flex-end">
                                            <TextInput
                                                label={`VIN ${index + 1}`}
                                                value={vin.VIN}
                                                onChange={(e) => handleVinChange(index, e.currentTarget.value)}
                                                required
                                                style={{ flex: 1 }}
                                            />
                                            {editPayload.detailForm.vins.length > 1 && (
                                                <Button
                                                    variant="subtle"
                                                    color="red"
                                                    type="button"
                                                    onClick={() => removeVinRow(index)}
                                                >
                                                    Remove
                                                </Button>
                                            )}
                                        </Group>
                                    ))}
                                    <Button variant="outline" type="button" onClick={addVinRow}>
                                        Add VIN
                                    </Button>
                                </Stack>
                            </Box>

                            <Box>
                                <Title order={4} mb="sm">Accessories</Title>
                                {editPayload.accessoriesForm.accessories.length >= MAX_ACCESSORIES_COUNT && (
                                    <Text c="dimmed" size="sm" ta="center">
                                        Maximum of {MAX_ACCESSORIES_COUNT} accessories reached. Edit or remove existing entries to change selections.
                                    </Text>
                                )}
                                <Stack gap="sm">
                                    {editPayload.accessoriesForm.accessories.map((acc, index) => {
                                        const selectedAccessoryValues = editPayload.accessoriesForm.accessories
                                            .map((item, idx) => (idx === index ? null : item.AccessoriesName))
                                            .filter(Boolean);
                                        const availableAccessoryOptions = accessoryOptions.filter(
                                            (option) =>
                                                option.value === acc.AccessoriesName ||
                                                !selectedAccessoryValues.includes(option.value)
                                        );

                                        return (
                                        <Stack key={`acc-${index}`} gap="xs">
                                            <Text fw={600}>Accessory {index + 1}</Text>
                                        <Group align="flex-end">
                                            <Select
                                                label="Accessory"
                                                data={availableAccessoryOptions}
                                                value={acc.AccessoriesName || null}
                                                onChange={(value) => handleAccessoryChange(index, 'AccessoriesName', value || '')}
                                                searchable
                                                required
                                                style={{ flex: 1 }}
                                            />
                                            <TextInput
                                                label="Remarks"
                                                value={acc.Remarks || ''}
                                                onChange={(e) => handleAccessoryChange(index, 'Remarks', e.currentTarget.value)}
                                                style={{ flex: 1 }}
                                            />
                                            <TextInput
                                                label="Qty"
                                                type="number"
                                                min={1}
                                                value={acc.qty_acc}
                                                onChange={(e) => handleAccessoryChange(index, 'qty_acc', Number(e.currentTarget.value) || 0)}
                                                required
                                                style={{ width: 120 }}
                                            />
                                            {editPayload.accessoriesForm.accessories.length > 1 && (
                                                <ActionIcon
                                                    color="red"
                                                    variant="subtle"
                                                    type="button"
                                                    onClick={() => removeAccessoryRow(index)}
                                                    aria-label={`Remove accessory ${index + 1}`}
                                                >
                                                    <IconTrash size={16} />
                                                </ActionIcon>
                                            )}
                                        </Group>
                                        </Stack>
                                    )})}
                                    <Button variant="outline" type="button" onClick={addAccessoryRow}>
                                        Add Accessory
                                    </Button>
                                </Stack>
                            </Box>

                            <Box>
                                <Title order={4} mb="sm">Packages</Title>
                                {editPayload.packagesForm.packages.length >= MAX_PACKAGES_COUNT && (
                                    <Text c="dimmed" size="sm" ta="center">
                                        Maximum of {MAX_PACKAGES_COUNT} packages reached. Edit or remove existing entries to change selections.
                                    </Text>
                                )}
                                <Stack gap="sm">
                                    {editPayload.packagesForm.packages.map((pkg, index) => {
                                        const selectedPackageValues = editPayload.packagesForm.packages
                                            .map((item, idx) => (idx === index ? null : item.PackagesType))
                                            .filter(Boolean);
                                        const availablePackageOptions = packageOptions.filter(
                                            (option) =>
                                                option.value === pkg.PackagesType ||
                                                !selectedPackageValues.includes(option.value)
                                        );

                                        return (
                                        <Stack key={`pkg-${index}`} gap="xs">
                                            <Text fw={600}>Package {index + 1}</Text>
                                        <Group align="flex-end">
                                            <Select
                                                label="Package Type"
                                                data={availablePackageOptions}
                                                value={pkg.PackagesType || null}
                                                onChange={(value) => handlePackageChange(index, 'PackagesType', value || '')}
                                                searchable
                                                required
                                                style={{ flex: 1 }}
                                            />
                                            <TextInput
                                                label="Description"
                                                value={pkg.PackageDesc || ''}
                                                onChange={(e) => handlePackageChange(index, 'PackageDesc', e.currentTarget.value)}
                                                style={{ flex: 1 }}
                                            />
                                            {editPayload.packagesForm.packages.length > 1 && (
                                                <ActionIcon
                                                    color="red"
                                                    variant="subtle"
                                                    type="button"
                                                    onClick={() => removePackageRow(index)}
                                                    aria-label={`Remove package ${index + 1}`}
                                                >
                                                    <IconTrash size={16} />
                                                </ActionIcon>
                                            )}
                                        </Group>
                                        </Stack>
                                    )})}
                                    <Button variant="outline" type="button" onClick={addPackageRow}>
                                        Add Package
                                    </Button>
                                </Stack>
                            </Box>
                        </Stack>
                    </form>
                ) : (
                    <Stack gap="xl">
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
                                {(selectedLogDetails.modifiedby || selectedLogDetails.modifiedon) && (
                                    <>
                                        <Group gap="sm">
                                            <Text fw={700} w={150}>Modified By:</Text>
                                            <Text>{selectedLogDetails.modifiedby || '-'}</Text>
                                        </Group>
                                        <Group gap="sm">
                                            <Text fw={700} w={150}>Modified On:</Text>
                                            <Text>{selectedLogDetails.modifiedon ? formatLocalTime(selectedLogDetails.modifiedon) : '-'}</Text>
                                        </Group>
                                    </>
                                )}
                            </SimpleGrid>
                        </Box>

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
                                            <Table.Th style={{ width: '120px' }}>Qty</Table.Th>
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
                                                    <Table.Td>{acc.qty_acc ?? '-'}</Table.Td>
                                                </Table.Tr>
                                            );
                                        })}
                                    </Table.Tbody>
                                </Table>
                            ) : (
                                <Text c="dimmed">No accessories information available.</Text>
                            )}
                        </Box>
                        {user?.permissions?.includes('edit_ibc') && (
                            <Group justify="flex-end">
                                <Button color="blue" onClick={handleStartEditing}>
                                    Edit IBC
                                </Button>
                            </Group>
                        )}
                    </Stack>
                )}
            </Modal>
        </Container>
    );
};

export default IBCLogData;
