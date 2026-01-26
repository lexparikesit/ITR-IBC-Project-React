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
import * as XLSX from 'xlsx';
import { IconSearch, IconEye, IconAlertCircle, IconDownload, IconPrinter } from '@tabler/icons-react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from "@mantine/notifications";
import { BRAND_CHECKLIST_MAP } from '@/config/ArrivalMap';
import { useUser } from '@/context/UserContext'; 
import apiClient from '@/libs/api';

const EXCLUDED_KEYS = ['remarks', 'notes', 'checklist_items', 'id', 'arrivalId', 'details'];
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api-ibc.itr-compass.co.id/api';
const formatKeyToLabel = (key) => {
    if (!key) return '';
    if (key === 'hourMeter') return 'Hour Meter (HM)'; 
    if (key === 'VIN') return 'VIN';
    if (key === 'woNumber') return 'WO Number';
    if (key === 'arrivalID') return 'Arrival ID';
    
    let label = key.replace(/([A-Z])/g, ' $1').trim();
    
    label = label.charAt(0).toUpperCase() + label.slice(1);
    
    if (label.includes('By')) label = label.replace('By', ' By');
    
    return label;
};

const toCapitalCase = (str) => {
    if (!str) return 'N/A';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Remove trailing numeric indicators like " 01", "_02" from a section label
const stripSectionIndex = (label) => {
    if (!label) return '';
    const text = String(label).trim();
    // Remove patterns like " - 01", "_02", " 3", "(04)" at the end
    return text.replace(/[\s_-]*\(?0*\d+\)?$/i, '').trim();
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
                const matchIndex = itemKey.match(/_(\d+)$/);
                const itemIndex = matchIndex ? parseInt(matchIndex[1], 10) - 1 : -1;
                
                if (itemIndex >= 0 && itemIndex < sectionItems.length) {
                    item = sectionItems[itemIndex];
                }
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
}

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
        if (isTrue) {
            return { text: 'Checked, Without Remarks', color: 'green' };
        } else {
            return { text: 'Checked, With Remarks', color: 'orange' }; 
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
}

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

const formatDateSDLG = (input) => {
    if (!input) return 'N/A';
    if (input instanceof Date) {
        if (isNaN(input.getTime())) return 'N/A';
        return input.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    let date;
    
    if (typeof input === 'string') {
        if (input.includes('T')) {
            date = new Date(input);
        } else {
            date = new Date(input);
        }
    } else {
        return 'N/A';
    }
    
    if (isNaN(date.getTime())) return 'N/A';
    
    return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

const loadLogoImage = async (pdfDoc) => {
    const paths = ['/images/ITR-logo.png', '/ITR-logo.png'];

    for (const path of paths) {
        try {
            const response = await fetch(path);
            if (!response.ok) continue;
            const bytes = new Uint8Array(await response.arrayBuffer());
            return await pdfDoc.embedPng(bytes);
        } catch (error) {
            // Ignore and try next path
        }
    }
    return null;
};

const loadRemoteImage = async (pdfDoc, url, cache) => {
    if (!url || typeof url !== 'string') return null;
    const cached = cache.get(url);
    if (cached !== undefined) return cached;

    try {
        const targetUrl = url.startsWith('http')
            ? `${API_BASE_URL}/media/proxy?url=${encodeURIComponent(url)}`
            : url;
        const response = await fetch(targetUrl, { credentials: 'include' });
        if (!response.ok) {
            cache.set(url, null);
            return null;
        }
        const bytes = new Uint8Array(await response.arrayBuffer());
        const contentType = (response.headers.get('content-type') || '').toLowerCase();
        let image = null;

        if (contentType.includes('png')) {
            image = await pdfDoc.embedPng(bytes);
        } else if (contentType.includes('jpeg') || contentType.includes('jpg')) {
            image = await pdfDoc.embedJpg(bytes);
        } else {
            try {
                image = await pdfDoc.embedPng(bytes);
            } catch (err) {
                image = await pdfDoc.embedJpg(bytes);
            }
        }

        if (!image) {
            cache.set(url, null);
            return null;
        }

        const result = { image, width: image.width, height: image.height };
        cache.set(url, result);
        return result;
    } catch (error) {
        cache.set(url, null);
        return null;
    }
};

const safeFileName = (value) => {
    const base = String(value || 'arrival_check_log');
    return base
        .replace(/[^a-z0-9_-]+/gi, '_')
        .replace(/^_+|_+$/g, '')
        .toLowerCase() || 'arrival_check_log';
};

const wrapText = (text, font, size, maxWidth) => {
    const content = String(text ?? '');
    if (!content) return [''];

    const words = content.split(/\s+/);
    const lines = [];
    let line = '';

    const pushLine = (value) => {
        if (value) lines.push(value);
    };

    words.forEach((word) => {
        const testLine = line ? `${line} ${word}` : word;
        const width = font.widthOfTextAtSize(testLine, size);
        if (width <= maxWidth) {
            line = testLine;
            return;
        }

        if (line) {
            pushLine(line);
            line = '';
        }

        if (font.widthOfTextAtSize(word, size) <= maxWidth) {
            line = word;
        } else {
            let chunk = '';
            for (const ch of word) {
                const testChunk = `${chunk}${ch}`;
                if (font.widthOfTextAtSize(testChunk, size) > maxWidth && chunk) {
                    lines.push(chunk);
                    chunk = ch;
                } else {
                    chunk = testChunk;
                }
            }
            line = chunk;
        }
    });

    pushLine(line);
    return lines.length ? lines : [''];
};

const buildChecklistTable = (details) => {
    if (!details || !details.checklist_items) {
        return { columns: [], rows: [] };
    }

    const brand = (details.brand || '').toLowerCase();
    const rows = [];

    if (brand === 'sdlg') {
        const sdlgMap = BRAND_CHECKLIST_MAP.sdlg;
        const technicalRequirements = sdlgMap ? sdlgMap.technicalRequirements : [];
        details.checklist_items.forEach((item, index) => {
            const itemContent = technicalRequirements[index] || item.itemName || 'N/A';
            const statusText = getStatusLabels('sdlg', item.status).text;
            rows.push({
                no: String(index + 1),
                item: itemContent,
                status: statusText,
            });
        });
        return {
            columns: [
                { key: 'no', label: 'No.', width: 35 },
                { key: 'item', label: 'Technical Requirement', width: 350 },
                { key: 'status', label: 'Status', width: 160, padLeft: 110 },
            ],
            rows,
        };
    }

    const map = BRAND_CHECKLIST_MAP[brand];
    const sectionKeys = map ? Object.keys(map.sections) : [];
    const sorted = details.checklist_items
        .slice()
        .sort((a, b) => {
            if (!map) return 0;
            return sectionKeys.indexOf(a.section) - sectionKeys.indexOf(b.section);
        })
        .map((item) => {
            const { section: normSec, item: normItem } = getNormalizedLabel(brand, item.section, item.itemName);
            return {
                section: stripSectionIndex(normSec),
                itemLabel: normItem,
                status: getStatusLabels(brand, item.status).text,
                remarks: brand === 'manitou' ? (item.caption || '-') : (item.remarks || item.caption || '-'),
                imageUrl: item.image_url,
            };
        });

    let lastSection = '';
    const hasImages = sorted.some((row) => row.imageUrl && row.imageUrl.startsWith('https://'));

    sorted.forEach((row) => {
        const sectionValue = row.section === lastSection ? '' : row.section;
        lastSection = row.section;
        rows.push({
            section: sectionValue,
            item: row.itemLabel,
            status: row.status,
            remarks: row.remarks,
            image: hasImages && brand !== 'renault' ? (row.imageUrl || '-') : undefined,
        });
    });

    const baseColumns = [
        { key: 'section', label: 'Section', width: 120 },
        { key: 'item', label: 'Item', width: 210 },
        { key: 'status', label: 'Status', width: 70 },
        { key: 'remarks', label: 'Remarks', width: 115 },
    ];

    if (brand === 'renault') {
        baseColumns[3].padLeft = 18;
    }

    if (hasImages && brand !== 'renault') {
        baseColumns.length = 0;
        baseColumns.push(
            { key: 'section', label: 'Section', width: 110 },
            { key: 'item', label: 'Item', width: 140 },
            { key: 'status', label: 'Status', width: 70 },
            { key: 'remarks', label: 'Remarks', width: 95 },
            { key: 'image', label: 'Image', width: 100 }
        );
    }

    return { columns: baseColumns, rows };
};

const createArrivalPdf = async ({ details, unitInfoData, remarks, printedBy }) => {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const logoImage = await loadLogoImage(pdfDoc);
    const imageCache = new Map();
    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const margin = 40;
    const lineHeight = 12;
    const sectionGap = 16;
    let page = pdfDoc.addPage([pageWidth, pageHeight]);
    let y = pageHeight - margin;

    const drawCentered = (text, size, yPos) => {
        const textWidth = bold.widthOfTextAtSize(text, size);
        page.drawText(text, {
            x: (pageWidth - textWidth) / 2,
            y: yPos,
            size,
            font: bold,
            color: rgb(0, 0, 0),
        });
    };

    const drawSectionTitle = (text, gap = sectionGap) => {
        y -= gap;
        page.drawText(text, {
            x: margin,
            y,
            size: 12,
            font: bold,
            color: rgb(0, 0, 0),
        });
        y -= lineHeight;
    };

    const ensureSpace = (needed) => {
        if (y - needed >= margin) return;
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        y = pageHeight - margin;
    };

    const drawWrappedLine = (text, x, maxWidth, size = 10, fontToUse = font) => {
        const lines = wrapText(text, fontToUse, size, maxWidth);
        lines.forEach((line) => {
            ensureSpace(lineHeight);
            page.drawText(line, { x, y, size, font: fontToUse, color: rgb(0, 0, 0) });
            y -= lineHeight;
        });
    };

    const headerTitle = 'Indo Traktor Form Arrival Check';
    const titleSize = 14;
    let headerBlockHeight = titleSize;

    if (logoImage) {
        const logoWidth = 110;
        const logoHeight = (logoImage.height / logoImage.width) * logoWidth;
        const logoX = margin;
        const logoY = y - (logoHeight / 2) + (titleSize / 2);
        page.drawImage(logoImage, {
            x: logoX,
            y: logoY,
            width: logoWidth,
            height: logoHeight,
        });
        headerBlockHeight = Math.max(headerBlockHeight, logoHeight);
    }

    drawCentered(headerTitle, titleSize, y);
    const headerGap = Math.max(10, headerBlockHeight - 18);
    y -= headerGap;

    drawSectionTitle('Unit Information', 14);

    const infoLines = unitInfoData.map((info) => ({
        label: info.label,
        value: info.value,
    }));

    const gapAfterTitle = 8;
    y -= gapAfterTitle;

    const half = Math.ceil(infoLines.length / 2);
    const left = infoLines.slice(0, half);
    const right = infoLines.slice(half);
    const columnWidth = (pageWidth - margin * 2) / 2;
    const rightColumnOffset = 28;
    const labelWidth = 110;
    const startY = y;

    left.forEach((item, idx) => {
        const rowY = startY - idx * lineHeight;
        page.drawText(`${item.label}:`, {
            x: margin,
            y: rowY,
            size: 10,
            font: bold,
            color: rgb(0, 0, 0),
        });
        page.drawText(String(item.value ?? ''), {
            x: margin + labelWidth,
            y: rowY,
            size: 10,
            font,
            color: rgb(0, 0, 0),
        });
    });

    right.forEach((item, idx) => {
        const rowY = startY - idx * lineHeight;
        page.drawText(`${item.label}:`, {
            x: margin + columnWidth + rightColumnOffset,
            y: rowY,
            size: 10,
            font: bold,
            color: rgb(0, 0, 0),
        });
        page.drawText(String(item.value ?? ''), {
            x: margin + columnWidth + rightColumnOffset + labelWidth,
            y: rowY,
            size: 10,
            font,
            color: rgb(0, 0, 0),
        });
    });

    y = startY - Math.max(left.length, right.length) * lineHeight - 6;

    drawSectionTitle(`Checklist Inspection Items (${toCapitalCase(details.brand)})`, 26);
    y -= 6;

    const { columns, rows } = buildChecklistTable(details);
    const contentWidth = pageWidth - margin * 2;
    const totalWidth = columns.reduce((acc, col) => acc + col.width, 0);
    const scale = totalWidth > 0 ? contentWidth / totalWidth : 1;
    const scaledColumns = columns.map((col) => ({ ...col, width: col.width * scale }));

    const drawTableHeader = () => {
        ensureSpace(lineHeight * 2);
        let x = margin;
        scaledColumns.forEach((col) => {
            const padLeft = col.padLeft || 0;
            page.drawText(col.label, {
                x: x + padLeft,
                y,
                size: 10,
                font: bold,
                color: rgb(0, 0, 0),
            });
            x += col.width;
        });
        y -= lineHeight;
        page.drawLine({
            start: { x: margin, y },
            end: { x: pageWidth - margin, y },
            thickness: 1,
            color: rgb(0.8, 0.8, 0.8),
        });
        y -= lineHeight;
    };

    if (scaledColumns.length && rows.length) {
        drawTableHeader();
    }

    for (const row of rows) {
        const cellData = [];
        let maxLines = 1;
        let maxImageHeight = 0;

        for (const col of scaledColumns) {
            if (col.key === 'image') {
                const url = row[col.key];
                const embed = await loadRemoteImage(pdfDoc, url, imageCache);
                let drawWidth = 0;
                let drawHeight = 0;
                if (embed) {
                    const maxWidth = Math.max(col.width - 6, 10);
                    const maxHeight = 36;
                    const scale = Math.min(maxWidth / embed.width, maxHeight / embed.height, 1);
                    drawWidth = embed.width * scale;
                    drawHeight = embed.height * scale;
                    maxImageHeight = Math.max(maxImageHeight, drawHeight);
                }
                cellData.push({ type: 'image', embed, drawWidth, drawHeight });
            } else {
                const value = row[col.key] ?? '-';
                const padLeft = col.padLeft || 0;
                const maxWidth = Math.max(col.width - 6 - padLeft, 20);
                const lines = wrapText(value, font, 9, maxWidth);
                maxLines = Math.max(maxLines, lines.length || 1);
                cellData.push({ type: 'text', lines, padLeft });
            }
        }

        const rowHeight = Math.max(maxLines * lineHeight + 2, maxImageHeight + 6);
        ensureSpace(rowHeight + lineHeight);
        let x = margin;

        cellData.forEach((cell, idx) => {
            const col = scaledColumns[idx];
            if (cell.type === 'image') {
                if (cell.embed) {
                    const imageX = x + (col.width - cell.drawWidth) / 2;
                    const imageY = y - cell.drawHeight + 4;
                    page.drawImage(cell.embed.image, {
                        x: imageX,
                        y: imageY,
                        width: cell.drawWidth,
                        height: cell.drawHeight,
                    });
                } else {
                    page.drawText('-', {
                        x,
                        y,
                        size: 9,
                        font,
                        color: rgb(0, 0, 0),
                    });
                }
            } else {
                const padLeft = cell.padLeft || 0;
                cell.lines.forEach((line, lineIdx) => {
                    page.drawText(line, {
                        x: x + padLeft,
                        y: y - lineIdx * lineHeight,
                        size: 9,
                        font,
                        color: rgb(0, 0, 0),
                    });
                });
            }
            x += col.width;
        });

        y -= rowHeight;
        if (y < margin + lineHeight * 2) {
            page = pdfDoc.addPage([pageWidth, pageHeight]);
            y = pageHeight - margin;
            drawTableHeader();
        }
    }

    drawSectionTitle('General Notes / Remarks', 26);
    drawWrappedLine(remarks || '-', margin, contentWidth, 10, font);

    const nowLabel = new Date().toLocaleString('id-ID', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
    const footerText = printedBy
        ? `Printed out by ${printedBy} • ${nowLabel}`
        : `Printed out by - • ${nowLabel}`;
    const footerSize = 9;
    const footerY = margin - 6;
    if (y < footerY + lineHeight * 2) {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        y = pageHeight - margin;
    }
    page.drawText(footerText, {
        x: margin,
        y: footerY,
        size: footerSize,
        font,
        color: rgb(0.45, 0.45, 0.45),
    });

    return pdfDoc.save();
};

const LogData = ({ title, apiUrl }) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
    const [selectedLogDetails, setSelectedLogDetails] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activePage, setActivePage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState('10');
    const [isPrinting, setIsPrinting] = useState(false);
    const [lookupTables, setLookupTables] = useState({
        models: {},
        technicians: {},
        approvers: {}
    });
    const { user } = useUser()
    const printedByName = (() => {
        if (!user) return '';
        const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
        return fullName || user.username || user.email || '';
    })();
    const printedAt = new Date().toLocaleString('id-ID', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
    const canPrint = Boolean(selectedLogDetails && !selectedLogDetails.error);

    const handlePrint = () => {
        if (!canPrint) return;
        window.print();
    };

    useEffect(() => {
        const handleBeforePrint = () => setIsPrinting(true);
        const handleAfterPrint = () => setIsPrinting(false);
        window.addEventListener('beforeprint', handleBeforePrint);
        window.addEventListener('afterprint', handleAfterPrint);
        return () => {
            window.removeEventListener('beforeprint', handleBeforePrint);
            window.removeEventListener('afterprint', handleAfterPrint);
        };
    }, []);

    const handleDownloadPdf = async () => {
        if (!canPrint) return;

        try {
            const bytes = await createArrivalPdf({
                details: selectedLogDetails,
                unitInfoData,
                remarks,
                printedBy: printedByName,
            });
            const brandLabel = toCapitalCase(selectedLogDetails?.brand || '');
            const vinValue = selectedLogDetails?.VIN || selectedLogDetails?.vin || '';
            const fileBase = safeFileName(
                `Arrival Check - ${brandLabel || 'brand'} - ${vinValue || 'vin'}`
            );
            const blob = new Blob([bytes], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${fileBase}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            notifications.show({
                title: 'Download Failed',
                message: 'Unable to generate PDF. Please try again.',
                color: 'red',
            });
        }
    };

    const downloadExcel = () => {
        if (!user?.permissions?.includes('download_arrival_log')) {
            notifications.show({
                title: "Permission Denied",
                message: "You don't have permission to download this log.",
                color: "red",
            });
            return;
        }

        const excelData = logs.map((log, index) => ({
            No: index + 1,
            'WO Number': log.woNumber || 'N/A',
            'Type/Model': lookupTables.models[log.model] || log.model || 'N/A',
            Brand: log.brand === 'manitou' 
                ? 'Manitou' 
                : log.brand === 'renault' 
                    ? 'Renault Trucks' 
                    : log.brand || 'N/A',
            VIN: log.VIN || 'N/A',
            'Date of Check': log.dateOfCheck 
                ? new Date(log.dateOfCheck).toLocaleDateString('id-ID') 
                : 'N/A',
            Technician: lookupTables.technicians[log.technician] || log.technician || 'N/A',
            'Approval By': lookupTables.approvers[log.approvalBy] || log.approvalBy || 'N/A',
            'Created By': log.createdBy || 'N/A',
            'Created On': formatLocalTime(log.createdOn)
        }));

        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = XLSX.utils.book_new();
        
        XLSX.utils.book_append_sheet(wb, ws, "Arrival Check Log");
        XLSX.writeFile(wb, `arrival_check_log_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const getUnitInformationData = (details, lookupTables) => {
        if (!details) return [];

        const dataArray = [];
        const keys = Object.keys(details);
        
        const priorityKeys = [
            'woNumber', 'brand', 'model', 'VIN', 'hourMeter',
            'dateOfCheck', 'technician', 'approvalBy',
            'createdBy', 'createdOn', 'updatedOn'
        ];
        
        keys.forEach(key => {
            const lowerKey = key.toLowerCase();
            console.log(`[DEBUG] key: ${key}, lowerKey: ${lowerKey}`);
            
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
            } else if (key === 'dateOfCheck') {
                value = value ? new Date(value).toLocaleDateString('id-ID') : 'N/A';
            } else if (key === 'unitLanded' || key === 'unitStripping') {
                value = formatDateSDLG(value);
            } else if (key === 'createdOn' || key === 'updatedOn') {
                value = formatLocalTime(value);
            } else {
                value = value !== null && value !== undefined && value !== '' ? String(value) : 'N/A';
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
        
        if (!brandId) return modelLookup;
        
        try {
            const { data: models } = await apiClient.get(`/unit-types/${brandId}`);

            modelLookup = (models || []).reduce((acc, item) => {
                acc[item.value] = item.label; 
                return acc;
            }, {});
        } catch (e) {
            console.error(`[ERROR] Error fetching models for ${brandId}:`, e);
        }
        return modelLookup;
    };

    const fetchUserLookup = async () => {
        try {
            const [techRes, supervisorRes, techHeadRes] = await Promise.all([
                apiClient.get('/users/by-role/Technician'),
                apiClient.get('/users/by-role/Supervisor'),
                apiClient.get('/users/by-role/Technical Head')
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
                    logData.map(log => BRAND_ID_MAP[(log.brand || '').toLowerCase()]).filter(id => id) 
                )];
                
                let allModelLookup = {};
                for (const brandId of uniqueBrandIds) {
                    const modelLookupForBrand = await fetchLookupData(brandId);
                    allModelLookup = { ...allModelLookup, ...modelLookupForBrand }; 
                }

                const { technicians, approvers } = await fetchUserLookup();

                setLookupTables({
                    models: allModelLookup,
                    technicians: technicians,
                    approvers: approvers
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
    }, [apiUrl]);

    const filteredLogs = useMemo(() => {
        const query = searchQuery.toLowerCase();
        
        if (!query) return logs;
        
        return logs.filter(log => {
            const modelLabel = lookupTables.models[log.model] || ''; 
            const technicianLabel = lookupTables.technicians[log.technician] || '';
            const approverLabel = lookupTables.approvers[log.approvalBy] || '';
            
            return (
                (log.VIN || '').toLowerCase().includes(query) ||
                (log.brand || '').toLowerCase().includes(query) ||
                (log.woNumber || '').toLowerCase().includes(query) ||
                modelLabel.toLowerCase().includes(query) ||
                technicianLabel.toLowerCase().includes(query) ||
                approverLabel.toLowerCase().includes(query)
            );
        });
    }, [logs, searchQuery, lookupTables]);

    const totalPages = Math.ceil(filteredLogs.length / parseInt(rowsPerPage, 10));
    const start = (activePage - 1) * parseInt(rowsPerPage, 10);
    const end = start + parseInt(rowsPerPage, 10);
    const paginatedLogs = filteredLogs.slice(start, end);

    const handleOpenModal = async (arrivalId) => {
        setSelectedLogDetails(null);
        openModal();

        const detailApiUrl = `/arrival-check/log/details/${arrivalId}`;

        try {
            const response = await apiClient.get(detailApiUrl);
            const details = response.data;
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

    const rows = paginatedLogs.map((log, index) => {
        const modelLabel = lookupTables.models[log.model] || log.model || 'N/A';
        const technicianLabel = lookupTables.technicians[log.technician] || log.technician || 'N/A';
        const approverLabel = lookupTables.approvers[log.approvalBy] || log.approvalBy || 'N/A';
        const globalIndex = (activePage - 1) * parseInt(rowsPerPage, 10) + index + 1;
        
        return (
            <Table.Tr key={log.id}>
                <Table.Td>{globalIndex}</Table.Td>
                <Table.Td>{log.woNumber || 'N/A'}</Table.Td>
                <Table.Td>{modelLabel}</Table.Td> 
                <Table.Td>
                    {log.brand === 'manitou'
                        ? 'Manitou'
                        : log.brand == 'renault'
                            ? 'Renault Trucks'
                            : log.brand || 'N/A'}
                </Table.Td>
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
        (selectedLogDetails.remarks || selectedLogDetails.notes || 'No general notes or remarks recorded for this arrival check.') 
        : 'N/A';

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
                                placeholder="by WO Number, VIN Number, Brand/ Product, or Unit Type"
                                value={searchQuery}
                                onChange={(event) => {
                                    setSearchQuery(event.currentTarget.value);
                                    setActivePage(1);
                                }}
                                w={400}
                                style={{ alignSelf: 'center' }} 
                            />
                            <Group gap="xs">
                                {user?.permissions?.includes('download_arrival_log') && (
                                    <Button 
                                        onClick={downloadExcel}
                                        variant="outline"
                                        color="#A91D3A"
                                        size="lg"
                                        p={0}
                                        w={32}
                                        h={32}
                                        style={{
                                            height: '100%',
                                            width: '40px',
                                            paddingTop: '2px',
                                            paddingBottom: '2px',
                                            marginTop: '23px'
                                        }}
                                    >
                                        <IconDownload size={16} />
                                    </Button>
                                )}
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
                title="Detail Arrival Check Log"
                size="1350px"
                styles={{ 
                    title: { flexGrow: 1, textAlign: 'center' }
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
                    <>
                        <div className="print-area">
                            {isPrinting && (
                                <div className="print-header print-only">
                                    <img
                                        src="/images/ITR-logo.png"
                                        alt="Indotraktor Utama"
                                        className="print-logo print-header-logo"
                                        onError={(event) => {
                                            event.currentTarget.style.display = 'none';
                                        }}
                                    />
                                    <div className="print-header-title">
                                        <Title order={3} ta="center">
                                            Indo Traktor Form Arrival Check
                                        </Title>
                                    </div>
                                </div>
                            )}
                            {isPrinting && (
                                <Text className="print-footer print-only">
                                    Printed out by {printedByName || '-'} • {printedAt}
                                </Text>
                            )}
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
                                        className="unit-info-grid"
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
                            
                                    {selectedLogDetails.checklist_items && selectedLogDetails.checklist_items.length > 0 ? (
                                        <>
                                            {selectedLogDetails.brand && selectedLogDetails.brand.toLowerCase() === 'sdlg' ? (
                                                <Table withRowBorders={true} highlightOnHover>
                                                    <Table.Thead>
                                                        <Table.Tr>
                                                            <Table.Th style={{ width: '50px' }}>No.</Table.Th>
                                                            <Table.Th style={{ width: '85%' }}>Technical Requirement</Table.Th>
                                                            <Table.Th style={{ width: '15%', textAlign: 'center' }}>Status</Table.Th>
                                                        </Table.Tr>
                                                    </Table.Thead>
                                                    <Table.Tbody>
                                                        {selectedLogDetails.checklist_items
                                                            .map((item, index) => {
                                                                const sdlgMap = BRAND_CHECKLIST_MAP['sdlg'];
                                                                const technicalRequirements = sdlgMap ? sdlgMap.technicalRequirements : [];
                                                                const itemContent = technicalRequirements[index] || item.itemName || 'Technical Requirement Missing';
                                                                const { text: statusText, color: statusColor } = getStatusLabels('sdlg', item.status);
                                                                
                                                                return (
                                                                    <Table.Tr key={index}>
                                                                        <Table.Td>{index + 1}</Table.Td>
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
                                                
                                            ) : selectedLogDetails.brand && selectedLogDetails.brand.toLowerCase() === 'renault' ? (
                                                <Table withRowBorders={true} highlightOnHover>
                                                    <Table.Thead>
                                                        <Table.Tr>
                                                            <Table.Th>Section</Table.Th>
                                                            <Table.Th>Item</Table.Th>
                                                            <Table.Th style={{ width: '100px' }}>Status</Table.Th>
                                                            <Table.Th>Remarks/Caption</Table.Th>
                                                        </Table.Tr>
                                                    </Table.Thead>
                                                    <Table.Tbody>
                                                        {(() => {
                                                            const brand = selectedLogDetails.brand;
                                                            const sorted = selectedLogDetails.checklist_items
                                                                .slice()
                                                                .sort((a, b) => {
                                                                    const map = BRAND_CHECKLIST_MAP[(brand || '').toLowerCase()];
                                                                    if (!map) return 0;
                                                                    const sectionKeys = Object.keys(map.sections);
                                                                    const rankA = sectionKeys.indexOf(a.section);
                                                                    const rankB = sectionKeys.indexOf(b.section);
                                                                    if (rankA !== rankB) return rankA - rankB;
                                                                    return 0;
                                                                })
                                                                .map((item) => {
                                                                    const { section: normSec, item: normItem } = getNormalizedLabel(brand, item.section, item.itemName);
                                                                    return {
                                                                        section: stripSectionIndex(normSec),
                                                                        itemLabel: normItem,
                                                                        status: item.status,
                                                                        remarks: item.remarks || item.caption || '-',
                                                                    };
                                                                });

                                                            const counts = {};
                                                            sorted.forEach(r => { counts[r.section] = (counts[r.section] || 0) + 1; });
                                                            const emitted = {};

                                                            return sorted.map((row, idx) => {
                                                                const { text: statusText, color: statusColor } = getStatusLabels(brand, row.status);
                                                                const firstForSection = !emitted[row.section];
                                                                emitted[row.section] = (emitted[row.section] || 0) + 1;

                                                                return (
                                                                    <Table.Tr key={idx}>
                                                                        {firstForSection && (
                                                                            <Table.Td rowSpan={counts[row.section]} style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: 600 }}>
                                                                                {row.section}
                                                                            </Table.Td>
                                                                        )}
                                                                        <Table.Td>{row.itemLabel}</Table.Td>
                                                                        <Table.Td>
                                                                            <Text fw={700} c={statusColor}>{statusText}</Text>
                                                                        </Table.Td>
                                                                        <Table.Td>{row.remarks}</Table.Td>
                                                                    </Table.Tr>
                                                                );
                                                            });
                                                        })()}
                                                    </Table.Tbody>
                                                </Table>
                                            ) : (
                                                <Table withRowBorders={true} highlightOnHover>
                                                    <Table.Thead>
                                                        <Table.Tr>
                                                            <Table.Th>Section</Table.Th>
                                                            <Table.Th>Item</Table.Th>
                                                            <Table.Th style={{ width: '100px' }}>Status</Table.Th>
                                                            <Table.Th>Remarks/Caption</Table.Th>
                                                            <Table.Th>Image</Table.Th>
                                                        </Table.Tr>
                                                    </Table.Thead>
                                                    <Table.Tbody>
                                                        {(() => {
                                                            const brand = selectedLogDetails.brand;
                                                            const sorted = selectedLogDetails.checklist_items
                                                                .slice()
                                                                .sort((a, b) => {
                                                                    const map = BRAND_CHECKLIST_MAP[(brand || '').toLowerCase()];
                                                                    if (!map) return 0;
                                                                    const sectionKeys = Object.keys(map.sections);
                                                                    const rankA = sectionKeys.indexOf(a.section);
                                                                    const rankB = sectionKeys.indexOf(b.section);
                                                                    if (rankA !== rankB) return rankA - rankB;
                                                                    return 0;
                                                                })
                                                                .map((item) => {
                                                                    const { section: normSec, item: normItem } = getNormalizedLabel(brand, item.section, item.itemName);
                                                                    return {
                                                                        section: stripSectionIndex(normSec),
                                                                        itemLabel: normItem,
                                                                        status: item.status,
                                                                        remarks: brand.toLowerCase() === 'manitou' ? (item.caption || '-') : (item.remarks || '-'),
                                                                        imageUrl: item.image_url,
                                                                    };
                                                                });

                                                            const counts = {};
                                                            sorted.forEach(r => { counts[r.section] = (counts[r.section] || 0) + 1; });
                                                            const emitted = {};

                                                            return sorted.map((row, idx) => {
                                                                const { text: statusText, color: statusColor } = getStatusLabels(brand, row.status);
                                                                const firstForSection = !emitted[row.section];
                                                                emitted[row.section] = (emitted[row.section] || 0) + 1;

                                                                return (
                                                                    <Table.Tr key={idx}>
                                                                        {firstForSection && (
                                                                            <Table.Td rowSpan={counts[row.section]} style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: 600 }}>
                                                                                {row.section}
                                                                            </Table.Td>
                                                                        )}
                                                                        <Table.Td>{row.itemLabel}</Table.Td>
                                                                        <Table.Td>
                                                                            <Text fw={700} c={statusColor}>{statusText}</Text>
                                                                        </Table.Td>
                                                                        <Table.Td>{row.remarks}</Table.Td>
                                                                        <Table.Td>
                                                                            {row.imageUrl && row.imageUrl.startsWith('https://') ? (
                                                                                <Box style={{ width: '100px', height: '100px', overflow: 'hidden' }}>
                                                                                    <img
                                                                                        src={row.imageUrl}
                                                                                        alt="Inspection"
                                                                                        style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
                                                                                        onError={(e) => {
                                                                                            e.target.style.display = 'none';
                                                                                            e.target.parentElement.innerHTML = '<span style=\"color: red\">Image Failed to Load</span>';
                                                                                        }}
                                                                                    />
                                                                                </Box>
                                                                            ) : '-'}
                                                                        </Table.Td>
                                                                    </Table.Tr>
                                                                );
                                                            });
                                                        })()}
                                                    </Table.Tbody>
                                                </Table>
                                            )}
                                        </>
                                    ) : (
                                        <Text c="gray">No detailed checklist items found for this unit.</Text>
                                    )}
                                </Box>
                                
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
                                <Group justify="flex-end" className="no-print">
                                    <Button
                                        leftSection={<IconDownload size={16} />}
                                        variant="filled"
                                        onClick={handleDownloadPdf}
                                        disabled={!canPrint}
                                    >
                                        Download PDF
                                    </Button>
                                </Group>
                            </Stack>
                        </div>
                    </>
                )}
            </Modal>
        </Container>
    );
};

export default LogData;
