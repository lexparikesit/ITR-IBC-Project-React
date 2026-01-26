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
    Grid,
    Checkbox,
} from '@mantine/core';
import * as XLSX from "xlsx";
import { IconSearch, IconEye, IconAlertCircle, IconDownload } from '@tabler/icons-react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from "@mantine/notifications";
import { BRAND_CHECKLIST_MAP, RENAULT_SECTION_ORDER } from '@/config/CommissioningMap';
import { useUser } from "@/context/UserContext";
import apiClient from "@/libs/api";

const EXCLUDED_KEYS = ['remarks', 'notes', 'checklist_items', 'id', 'details', 'major_components', 'generalRemarks'];
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api-ibc.itr-compass.co.id/api';
const formatKeyToLabel = (key) => {
    if (!key) return '';
    if (key === 'woNumber') return 'WO Number';
    if (key === 'customer') return 'Customer';
    if (key === 'hourMeter') return 'Hour Meter';
    if (key === 'deliveryDate') return 'Delivery Date';
    if (key === 'commissioningDate') return 'Commissioning Date';
    if (key === 'inspectorSignature') return 'Signature Technician';
    if (key === 'UnitType') return 'Model';
    if (key === 'typeModel') return 'Model';
    if (key === 'deliveryDate') return 'Delivery Date';
    if (key === 'approvalBy') return 'Approval By';
    if (key === 'jobCardNo') return 'Job Card No';
    if (key === 'dealerCode') return 'Dealer Code';
    if (key === 'technician') return 'Technician';
    if (key === 'FAB_no') return 'FAB No';
    if (key === 'VIN') return 'VIN';
    if (key === 'CAM') return 'CAM';
    if (key === 'contactPerson') return 'Contact Person';
    if (key === 'location') return 'Location';
    if (key === 'reg_fleet_no') return 'Registration Fleet No';
    if (key === 'inspectorSignatureDate') return 'Signature Date (Technician)';
    if (key === 'supervisorSignature') return 'Signature Approver';
    if (key === 'supervisorSignatureDate') return 'Signature Date (Approver)';
    if (key === 'dateOfCheck') return 'Commissioning Date';

    let label = key.replace(/([A-Z])/g, ' $1').trim();

    label = label.charAt(0).toUpperCase() + label.slice(1);

    if (label.includes('By')) label = label.replace('By', 'By');

    return label;
};

const toCapitalCase = (str) => {
    if (!str) return 'N/A';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Remove trailing numeric suffixes from section labels (e.g., "01. Engine" -> "Engine")
const stripSectionIndex = (label) => {
    if (!label) return '';
    const text = String(label).trim();
    return text.replace(/[\s._-]*\(?0*\d+\)?\.?\s*/i, '').trim() || text;
};

const BRAND_ID_MAP = {
    'manitou': 'MA',
    'renault': 'RT',
    'sdlg': 'SDLG',
};
const BRAND_LABEL_MAP = {
    manitou: 'Manitou',
    renault: 'Renault Trucks',
    sdlg: 'SDLG',
};

const getNormalizedLabel = (brand, sectionKey, itemKey) => {
    const brandLower = (brand || '').toLowerCase();
    const map = BRAND_CHECKLIST_MAP[brandLower];

    if (!map || brandLower == 'sdlg') {
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

    if (normalizedBrand === 'sdlg' || normalizedBrand === 'renault') {
        if (isTrue) {
            return { text: 'Yes', color: 'green' };
        } else if (isFalse) {
            return { text: 'No', color: 'red' };
        } else {
            return { text: 'N/A', color: 'gray' };
        }
    } else  {
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
    const base = String(value || 'commissioning_log');
    return base
        .replace(/[^a-z0-9_-]+/gi, '_')
        .replace(/^_+|_+$/g, '')
        .toLowerCase() || 'commissioning_log';
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
        const sdlgRequirements = BRAND_CHECKLIST_MAP.sdlg.requirements || [];
        details.checklist_items.forEach((item, index) => {
            const { text: statusText } = getStatusLabels('sdlg', item.status);
            const requirementText = sdlgRequirements[index] || `Requirement ${index + 1}`;
            rows.push({
                item: requirementText,
                status: statusText,
            });
        });
        return {
            columns: [
                { key: 'item', label: 'Technical Requirement', width: 360 },
                { key: 'status', label: 'Status', width: 120, padLeft: 60 },
            ],
            rows,
        };
    }

    const map = BRAND_CHECKLIST_MAP[brand];
    const sectionKeys = map ? Object.keys(map.sections) : [];
    const sectionRank = (sectionKey) => {
        if (brand === 'renault' && Array.isArray(RENAULT_SECTION_ORDER)) {
            const idx = RENAULT_SECTION_ORDER.indexOf(sectionKey);
            return idx === -1 ? 9999 : idx;
        }
        if (!map) return 9999;
        const idx = sectionKeys.indexOf(sectionKey);
        return idx === -1 ? 9999 : idx;
    };
    const itemRank = (sectionKey, itemKey, normItem) => {
        if (!map || !map.items || !map.items[sectionKey]) return 9999;
        const arr = map.items[sectionKey];
        const normalizedKey = (itemKey || '').toLowerCase();
        let idx = arr.findIndex((i) => String(i.id || '').toLowerCase() === normalizedKey);
        if (idx === -1) {
            idx = arr.findIndex(
                (i) => (i.itemKey || '').toLowerCase() === normalizedKey
            );
        }
        if (idx === -1) {
            idx = arr.findIndex(
                (i) => (i.label || '').toLowerCase() === (normItem || '').toLowerCase()
            );
        }
        return idx === -1 ? 9999 : idx;
    };

    const getRenaultItemLabel = (sectionKey, itemKey) => {
        if (!map || !map.items || !map.items[sectionKey]) return itemKey || 'N/A';
        const normalizedKey = String(itemKey || '').toLowerCase();
        const found = map.items[sectionKey].find((item) =>
            String(item.id || '').toLowerCase() === normalizedKey ||
            String(item.itemKey || '').toLowerCase() === normalizedKey
        );
        return found?.label || itemKey || 'N/A';
    };

    const sorted = details.checklist_items
        .slice()
        .map((item) => {
            const rawItemKey = item.itemName || item.itemKey || item.id || '';
            const statusValue = item.status ?? item.checklist;
            const { section: normSec, item: normItem } = getNormalizedLabel(
                brand,
                item.section,
                rawItemKey
            );
            const itemLabel = brand === 'renault'
                ? getRenaultItemLabel(item.section, rawItemKey)
                : normItem;
            return {
                rawSection: item.section,
                section: stripSectionIndex(normSec),
                isSectionStart: false,
                itemKey: rawItemKey,
                itemLabel: brand === 'renault' ? `${rawItemKey}. ${itemLabel}` : itemLabel,
                status: getStatusLabels(brand, statusValue).text,
                remarks: item.remarks || item.caption || item.notes || '-',
                imageUrl: item.image_url || item.imageUrl || item.image_blob_name,
            };
        })
        .sort((a, b) => {
            const sec = sectionRank(a.rawSection) - sectionRank(b.rawSection);
            if (sec !== 0) return sec;
            return itemRank(a.rawSection, a.itemKey, a.itemLabel) -
                itemRank(b.rawSection, b.itemKey, b.itemLabel);
        });

    let lastSection = '';
    const hasImages = sorted.some(
        (row) => typeof row.imageUrl === 'string' && row.imageUrl.startsWith('https://')
    );

    sorted.forEach((row) => {
        const isSectionStart = row.section !== lastSection;
        const sectionValue = isSectionStart ? row.section : '';
        lastSection = row.section;
        rows.push({
            section: sectionValue,
            isSectionStart,
            item: row.itemLabel,
            status: row.status,
            remarks: row.remarks,
            image: hasImages && typeof row.imageUrl === 'string' ? row.imageUrl : '-',
        });
    });

    const baseColumns = [
        { key: 'section', label: 'Section', width: 120 },
        { key: 'item', label: 'Item', width: 210 },
        { key: 'status', label: 'Status', width: 70 },
        { key: 'remarks', label: 'Remarks', width: 115 },
    ];

    if (hasImages) {
        return {
            columns: [
                { key: 'section', label: 'Section', width: 110 },
                { key: 'item', label: 'Item', width: 140 },
                { key: 'status', label: 'Status', width: 70 },
                { key: 'remarks', label: 'Remarks', width: 95 },
                { key: 'image', label: 'Image', width: 100 },
            ],
            rows,
            sectionGap: brand === 'renault' ? 15 : 0,
        };
    }

    return { columns: baseColumns, rows, sectionGap: brand === 'renault' ? 15 : 0 };
};

const createCommissioningPdf = async ({
    details,
    unitInfoData,
    remarks,
    majorComponents,
    printedBy,
    printedAt,
}) => {
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

    const contentWidth = pageWidth - margin * 2;

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

    const ensureSpaceForSection = (titleGap, minBodyLines = 1) => {
        const needed = titleGap + lineHeight + minBodyLines * lineHeight;
        ensureSpace(needed);
    };

    const drawWrappedLine = (text, x, maxWidth, size = 10, fontToUse = font) => {
        const lines = wrapText(text, fontToUse, size, maxWidth);
        lines.forEach((line) => {
            ensureSpace(lineHeight);
            page.drawText(line, { x, y, size, font: fontToUse, color: rgb(0, 0, 0) });
            y -= lineHeight;
        });
    };

    const drawTable = async (columns, rows, options = {}) => {
        const { afterTitleGap = 0, rowGap = 0, sectionGap = 0 } = options;
        if (afterTitleGap) {
            y -= afterTitleGap;
        }
        if (!columns.length || !rows.length) {
            drawWrappedLine('No data available.', margin, contentWidth, 10);
            return;
        }

        const totalWidth = columns.reduce((acc, col) => acc + col.width, 0) || 1;
        const scale = contentWidth / totalWidth;
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

        drawTableHeader();

        for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
            const row = rows[rowIndex];
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
                        const scale = Math.min(
                            maxWidth / embed.width,
                            maxHeight / embed.height,
                            1
                        );
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
            const sectionBreak = sectionGap && row.isSectionStart && rowIndex > 0 ? sectionGap : 0;
            ensureSpace(rowHeight + lineHeight + rowGap + sectionBreak);
            if (sectionBreak) {
                y -= sectionBreak;
            }
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
            if (rowGap) {
                y -= rowGap;
            }
            if (y < margin + lineHeight * 2) {
                page = pdfDoc.addPage([pageWidth, pageHeight]);
                y = pageHeight - margin;
                drawTableHeader();
            }
        }
    };

    const headerTitle = 'Indo Traktor Form Commissioning';
    const titleSize = 14;
    let headerBlockHeight = titleSize;

    if (logoImage) {
        const logoWidth = 110;
        const logoHeight = (logoImage.height / logoImage.width) * logoWidth;
        const logoX = margin;
        const logoY = y - logoHeight / 2 + titleSize / 2;
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
    y -= 8;

    const infoLines = unitInfoData.map((info) => ({
        label: info.label,
        value: info.value,
    }));

    const half = Math.ceil(infoLines.length / 2);
    const left = infoLines.slice(0, half);
    const right = infoLines.slice(half);
    const columnWidth = contentWidth / 2;
    const rightColumnOffset = 28;
    const labelWidth = 110;
    const valueWidthLeft = Math.max(columnWidth - labelWidth - 4, 40);
    const valueWidthRight = Math.max(columnWidth - rightColumnOffset - labelWidth - 4, 40);
    const totalRows = Math.max(left.length, right.length);

    const shouldWrapValue = (label) => label === 'Transmission Type' || label === 'Customer';

    for (let idx = 0; idx < totalRows; idx += 1) {
        const leftItem = left[idx];
        const rightItem = right[idx];
        const leftLabelLines = leftItem
            ? wrapText(`${leftItem.label}:`, bold, 10, Math.max(labelWidth - 2, 20))
            : [];
        const rightLabelLines = rightItem
            ? wrapText(`${rightItem.label}:`, bold, 10, Math.max(labelWidth - 2, 20))
            : [];
        const leftLines = leftItem
            ? (shouldWrapValue(leftItem.label)
                ? wrapText(String(leftItem.value ?? ''), font, 10, valueWidthLeft)
                : [String(leftItem.value ?? '')])
            : [];
        const rightLines = rightItem
            ? (shouldWrapValue(rightItem.label)
                ? wrapText(String(rightItem.value ?? ''), font, 10, valueWidthRight)
                : [String(rightItem.value ?? '')])
            : [];
        const rowLines = Math.max(
            leftLines.length || 1,
            rightLines.length || 1,
            leftLabelLines.length || 1,
            rightLabelLines.length || 1
        );

        ensureSpace(rowLines * lineHeight);

        if (leftItem) {
            leftLabelLines.forEach((line, lineIdx) => {
                page.drawText(line, {
                    x: margin,
                    y: y - lineIdx * lineHeight,
                    size: 10,
                    font: bold,
                    color: rgb(0, 0, 0),
                });
            });
            leftLines.forEach((line, lineIdx) => {
                page.drawText(line, {
                    x: margin + labelWidth,
                    y: y - lineIdx * lineHeight,
                    size: 10,
                    font,
                    color: rgb(0, 0, 0),
                });
            });
        }

        if (rightItem) {
            rightLabelLines.forEach((line, lineIdx) => {
                page.drawText(line, {
                    x: margin + columnWidth + rightColumnOffset,
                    y: y - lineIdx * lineHeight,
                    size: 10,
                    font: bold,
                    color: rgb(0, 0, 0),
                });
            });
            rightLines.forEach((line, lineIdx) => {
                page.drawText(line, {
                    x: margin + columnWidth + rightColumnOffset + labelWidth,
                    y: y - lineIdx * lineHeight,
                    size: 10,
                    font,
                    color: rgb(0, 0, 0),
                });
            });
        }

        y -= rowLines * lineHeight;
    }

    y -= 6;

    if ((details.brand || '').toLowerCase() === 'renault' && majorComponents && majorComponents.length > 0) {
        drawSectionTitle('Major Components', 26);
        const componentRows = majorComponents.map((comp) => ({
            component: comp.component || '-',
            make: comp.make || '-',
            typeModel: comp.typeModel || '-',
            serialNumber: comp.serialNumber || '-',
            partNumber: comp.partNumber || '-',
            remarks: comp.remarks || '-',
        }));
        await drawTable(
            [
                { key: 'component', label: 'Component', width: 90 },
                { key: 'make', label: 'Make', width: 70 },
                { key: 'typeModel', label: 'Type/Model', width: 90 },
                { key: 'serialNumber', label: 'Serial No', width: 90 },
                { key: 'partNumber', label: 'Part No', width: 80 },
                { key: 'remarks', label: 'Remarks', width: 90 },
            ],
            componentRows,
            { afterTitleGap: 8 }
        );
    }

    const brandLabel = toCapitalCase(details.brand);
    drawSectionTitle(`Checklist Inspection Items (${brandLabel})`, 26);
    y -= 6;

    const { columns, rows, sectionGap: checklistSectionGap } = buildChecklistTable(details);
    await drawTable(columns, rows, { sectionGap: checklistSectionGap });

    ensureSpaceForSection(26, 2);
    drawSectionTitle('General Notes / Remarks', 26);
    drawWrappedLine(remarks || '-', margin, contentWidth, 10);

    const timestamp = printedAt || new Date().toLocaleString('id-ID', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
    const footerText = printedBy
        ? `Printed out by ${printedBy} - ${timestamp}`
        : `Printed out by - ${timestamp}`;
    const footerY = margin - 6;
    if (y < footerY + lineHeight * 2) {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        y = pageHeight - margin;
    }
    page.drawText(footerText, {
        x: margin,
        y: footerY,
        size: 9,
        font,
        color: rgb(0.45, 0.45, 0.45),
    });

    return pdfDoc.save();
};

const LogData = ({ title, apiUrl }) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
    const [selectedLogDetails, setSelectedLogDetails] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
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
        if (!user?.permissions?.includes('download_commissioning_log')) {
            notifications.show({
                title: "Permission Denied",
                message: "You don't have permission to download this log.",
                color: "red",
            });
            return;
        }

        const excelData = logs.map((log, index) => ({
            No: index + 1,
            "WO Number": log.woNumber || 'N/A',
            "Type/Model": lookupTables.models[log.model] || log.model || 'N/A',
            Brand: BRAND_LABEL_MAP[(log.brand || '').toLowerCase()] || log.brand || "N/A",
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
        }))

        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(wb, ws, "Commissioning Log");
        XLSX.writeFile(wb,`commissioning_log_${new Date().toISOString().split("T")[0]}.xlsx`);
    };

    const getUnitInformationData = (details, lookupTables) => {
        if (!details) return [];

        const dataArray = [];
        const keys = Object.keys(details);

        const priorityKeys = [
            'woNumber', 'brand', 'typeModel', 'UnitType', 'VIN', 'hourMeter',
            'dateOfCheck', 'technician', 'approvalBy', 'remarks',
            'technician', 'approvalBy', 'createdBy', 'createdOn',
        ];

        keys.forEach(key => {
            const lowerKey = key.toLowerCase();

            if (EXCLUDED_KEYS.includes(key) || EXCLUDED_KEYS.includes(lowerKey)) {
                return;
            }

            let value = details[key];
            let label = formatKeyToLabel(key);

            if (lowerKey === 'brand') {
                const brandKey = String(value || '').toLowerCase();
                value = BRAND_LABEL_MAP[brandKey] || value || 'N/A';
            } else if (lowerKey === 'model' && lookupTables.models[value]) {
                value = lookupTables.models[value];
            } else if (lowerKey === 'technician' && lookupTables.technicians[value]) {
                value = lookupTables.technicians[value];
            } else if (lowerKey === 'approvalby' && lookupTables.approvers[value]) {
                value = lookupTables.approvers[value];
            } else if (lowerKey === 'inspectorsignature' && lookupTables.technicians[value]) {
                value = lookupTables.technicians[value];
            } else if (lowerKey === 'supervisorsignature' && lookupTables.approvers[value]) {
                value = lookupTables.approvers[value];
            } else if (lowerKey === 'inspectorsignaturedate' || lowerKey === 'supervisorsignaturedate') {
                value = formatDateOnly(value);
            }

            else if (lowerKey === 'customer') {
                const customerCode = details['customer'] || details['Customer'] || '';
                const customerName = lookupTables.customers?.[customerCode];

                if (customerName) {
                    value = toTitleCase(customerName.trim());
                } else {
                    value =  customerCode ? String(customerCode) : 'N/A';
                }
            }

            else if (lowerKey.includes('date') || lowerKey.includes('on')) {
                if (lowerKey === 'dateofcheck' || lowerKey === 'commissioningdate' || lowerKey === 'deliverydate') {
                    value = value ? new Date(value).toLocaleDateString('id-ID') : 'N/A';
                } else {
                    value = formatLocalTime(value);
                }
            }

            else if (lowerKey === 'model' || lowerKey === 'typemodel' || lowerKey === 'unittype') {
                if (lookupTables.models[value]) {
                    value = lookupTables.models[value];
                }
                else {
                    value = value || 'N/A';
                }
            }

            else {
                value = value !== null && value !== undefined && value !== "" ? String(value) : 'N/A';
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

    const fetchLookupData = async (brandId) => {
        let modelLookup = {};
        if (!brandId) return modelLookup;

        try {
            const { data: models = [] } = await apiClient.get(`/unit-types/${brandId}`);
            modelLookup = models.reduce((acc, model) => {
                acc[model.value] = model.label;
                return acc;
            }, {});

        } catch (e) {
            console.error(`[ERROR] Error fetching models for ${brandId}:`, e);
        }
        return modelLookup;
    };

    const fetchCustomerData = async () => {
        try {
            const { data: customers = [] } = await apiClient.get('/customers');

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
    }

const toTitleCase = (str) => {
    if (!str) return 'N/A';

    const ptRegex = /^(pt\.?|p\.?t\.?)$/i;
    const words = String(str).split(' ');
    const formattedWords = words.map((word) => {
        const cleanWord = word.replace(/[.,;:!?]+$/, '');

        if (ptRegex.test(cleanWord)) {
            // Normalize any PT variants and drop trailing punctuation (e.g., "PT.")
            return 'PT';
        }

        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });

    return formattedWords.join(' ');
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
                    logData.map(log => BRAND_ID_MAP[(log.brand || '').toLowerCase()]).filter(id => id) 
                )];

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

    const handleOpenModal = async (commID) => {
        setSelectedLogDetails(null);
        openModal();

        const detailApiUrl = `/commissioning/log/details/${commID}`;
        
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
        const rawCustomerName = lookupTables.customers[log.customer] || '';
        const customerLabel = rawCustomerName ? toTitleCase(rawCustomerName) : '';
        const globalIndex = (activePage - 1) * parseInt(rowsPerPage, 10) + index + 1;
        
        return (
            <Table.Tr key={log.id}>
                <Table.Td>{globalIndex}</Table.Td> 
                <Table.Td>{log.woNumber || 'N/A'}</Table.Td>
                <Table.Td>{modelLabel}</Table.Td> 
                <Table.Td>
                    {log.brand === "manitou"
                        ? "Manitou"
                        : log.brand === "renault"
                            ? "Renault Trucks"
                            : log.brand === "sdlg"
                                ? "SDLG"
                                : log.brand || "N/A"}
                </Table.Td>
                <Table.Td>{log.VIN || 'N/A'}</Table.Td>
                <Table.Td>
                    {log.dateOfCheck 
                        ? new Date(log.dateOfCheck).toLocaleDateString('id-ID') 
                        : 'N/A'}
                </Table.Td>
                <Table.Td>{customerLabel}</Table.Td>
                <Table.Td>{technicianLabel}</Table.Td>
                <Table.Td>{approverLabel}</Table.Td>
                <Table.Td>{log.createdBy || 'N/A'}</Table.Td>
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

    const remarks = selectedLogDetails ?
        (selectedLogDetails.remarks || selectedLogDetails.generalRemarks || 'No general notes or remarks recorded for this Commissioning Inspection.') 
        : 'N/A';
    
    const brand = selectedLogDetails?.brand;
    const checklist_items = selectedLogDetails?.checklist_items;
    const major_components = selectedLogDetails?.major_components;
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
    const canDownload = Boolean(selectedLogDetails && !selectedLogDetails.error);

    const handleDownloadPdf = async () => {
        if (!canDownload) return;

        try {
            const bytes = await createCommissioningPdf({
                details: selectedLogDetails,
                unitInfoData,
                remarks,
                majorComponents: major_components || [],
                printedBy: printedByName,
                printedAt,
            });
            const brandValue = (selectedLogDetails?.brand || '').toLowerCase();
            const brandLabel = BRAND_LABEL_MAP[brandValue] || toCapitalCase(selectedLogDetails?.brand || '');
            const vinValue = selectedLogDetails?.VIN || selectedLogDetails?.vin || '';
            const woNumber = selectedLogDetails?.woNumber || '';
            const fileBase = safeFileName(
                `Commissioning - ${brandLabel || 'brand'} - ${vinValue || woNumber || 'log'}`
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
            console.error('Commissioning PDF error:', error);
            notifications.show({
                title: 'Download Failed',
                message: 'Unable to generate PDF. Please try again.',
                color: 'red',
            });
        }
    };

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
                                    {user?.permissions?.includes("download_commissioning_log") && (
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
                                        <Table.Th>Customer</Table.Th>
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
                    title="Detail Commissioning Log"
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

                        {selectedLogDetails?.brand?.toLowerCase() === 'renault' && selectedLogDetails.major_components && (
                            <Box>
                                <Title
                                    order={4}
                                    mt="md"
                                    mb="sm"
                                    pb="xs"
                                    style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }}
                                >
                                    Major Components
                                </Title>
                                <Table withRowBorders striped highlightOnHover>
                                    <Table.Thead>
                                        <Table.Tr>
                                            <Table.Th>Components</Table.Th>
                                            <Table.Th>Make</Table.Th>
                                            <Table.Th>Type/Model</Table.Th>
                                            <Table.Th>Serial Number</Table.Th>
                                            <Table.Th>Part Number</Table.Th>
                                            <Table.Th>Remarks</Table.Th>
                                        </Table.Tr>
                                    </Table.Thead>
                                    <Table.Tbody>
                                        {selectedLogDetails.major_components.map((comp, index) => (
                                            <Table.Tr key={index}>
                                                <Table.Td>{comp.component || '-'}</Table.Td>
                                                <Table.Td>{comp.make || '-'}</Table.Td>
                                                <Table.Td>{comp.typeModel || '-'}</Table.Td>
                                                <Table.Td>{comp.serialNumber || '-'}</Table.Td>
                                                <Table.Td>{comp.partNumber || '-'}</Table.Td>
                                                <Table.Td>{comp.remarks || '-'}</Table.Td>
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
                                pd="xs"
                                style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }}
                            >
                                Checklist Inspection Items ({toCapitalCase(selectedLogDetails.brand)})  
                            </Title>
                            
                            {selectedLogDetails.checklist_items && selectedLogDetails.checklist_items.length > 0 ? (
                                <>
                                    {selectedLogDetails.brand && selectedLogDetails.brand.toLowerCase() === 'renault' ? (
                                        <Stack gap="lg">
                                            {(() => {
                                                const rawItems = selectedLogDetails.checklist_items || [];
                                                const items = {};
                                                const notes = {};

                                                rawItems.forEach(item => {
                                                    const { section, itemName, checklist, notes: itemNotes } = item;
                                                    if (!items[section]) {
                                                        items[section] = {};
                                                        notes[section] = itemNotes || '';
                                                    }
                                                    items[section][itemName] = checklist;
                                                    if (!notes[section] && itemNotes) {
                                                        notes[section] = itemNotes;
                                                    }
                                                });

                                                return RENAULT_SECTION_ORDER.map((sectionKey) => {
                                                    if (!items[sectionKey]) return null;

                                                    const sectionItems = items[sectionKey] || {};
                                                    const sectionNotes = notes[sectionKey] || '';

                                                    const brandLower = selectedLogDetails.brand.toLowerCase();
                                                    const sectionMap = BRAND_CHECKLIST_MAP[brandLower]?.sections || {};
                                                    const sectionTitle = sectionMap[sectionKey] || sectionKey;

                                                    return (
                                                        <Box key={sectionKey} p="md" radius="md">
                                                            <Title order={5} mb="sm">{sectionTitle}</Title>
                                                            <Grid gutter="xl">
                                                                {Object.keys(sectionItems)
                                                                    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
                                                                    .map((itemId) => {
                                                                    const itemStatus = sectionItems[itemId];
                                                                    const itemLabel = BRAND_CHECKLIST_MAP[brandLower]?.items?.[sectionKey]?.find(item => item.id === itemId)?.label || `Item ${itemId}`;
                                                                    return (
                                                                        <Grid.Col span={{ base: 12, sm: 6 }} key={itemId}>
                                                                            <Checkbox
                                                                                checked={itemStatus}
                                                                                label={`${itemId}. ${itemLabel}`}
                                                                                readOnly
                                                                                styles={{ input: { cursor: 'default' } }}
                                                                            />
                                                                        </Grid.Col>
                                                                    );
                                                                })}
                                                            </Grid>

                                                            {/* Render Notes */}
                                                            {sectionNotes && (
                                                                <Box mt="md">
                                                                    <Text fw={500}>Note:</Text>
                                                                    <Paper withBorder p="sm" mt="xs">
                                                                        <Text>{sectionNotes}</Text>
                                                                    </Paper>
                                                                </Box>
                                                            )}
                                                        </Box>
                                                    );
                                                });
                                            })()}
                                        </Stack>
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
                                                        {selectedLogDetails.checklist_items.map((item, index) => {
                                                            const { text: statusText, color: statusColor } = getStatusLabels('sdlg', item.status);
                                                            const requirementText = BRAND_CHECKLIST_MAP.sdlg.requirements[index] || `Requirement ${index + 1}`;

                                                                return (
                                                                    <Table.Tr key={index}>
                                                                        <Table.Td>{requirementText}</Table.Td>
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
                                                            const brandLower = (brand || '').toLowerCase();
                                                            const map = BRAND_CHECKLIST_MAP[brandLower];
                                                            const sectionOrder = (sectionKey) => {
                                                                if (!map) return 9999;
                                                                const keys = Object.keys(map.sections || {});
                                                                const idx = keys.indexOf(sectionKey);
                                                                return idx === -1 ? 9999 : idx;
                                                            };
                                                            const itemOrder = (sectionKey, itemKey, normItem) => {
                                                                if (!map || !map.items || !map.items[sectionKey]) return 9999;
                                                                const arr = map.items[sectionKey];
                                                                let idx = arr.findIndex(i => (i.itemKey || '').toLowerCase() === (itemKey || '').toLowerCase());
                                                                if (idx === -1) idx = arr.findIndex(i => (i.label || '').toLowerCase() === (normItem || '').toLowerCase());
                                                                return idx === -1 ? 9999 : idx;
                                                            };

                                                            const raw = (selectedLogDetails.checklist_items || []).slice();
                                                            const rows = raw.map((it) => {
                                                                const { section: normSec, item: normItem } = getNormalizedLabel(brand, it.section, it.itemName);
                                                                return {
                                                                    rawSection: it.section,
                                                                    section: normSec,
                                                                    itemKey: it.itemName,
                                                                    itemLabel: normItem,
                                                                    status: it.status,
                                                                    remarks: it.remarks || it.caption || '-',
                                                                    imageUrl: it.image_url,
                                                                };
                                                            });

                                                            rows.sort((a, b) => {
                                                                const sec = sectionOrder(a.rawSection) - sectionOrder(b.rawSection);
                                                                if (sec !== 0) return sec;
                                                                return itemOrder(a.rawSection, a.itemKey, a.itemLabel) - itemOrder(b.rawSection, b.itemKey, b.itemLabel);
                                                            });

                                                            const counts = {};
                                                            rows.forEach(r => { counts[r.section] = (counts[r.section] || 0) + 1; });
                                                            const emitted = {};

                                                            return rows.map((row, idx) => (
                                                                <Table.Tr key={idx}>
                                                                    {!emitted[row.section] && (
                                                                        <Table.Td
                                                                            rowSpan={counts[row.section]}
                                                                            style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: 600 }}
                                                                        >
                                                                            {row.section}
                                                                        </Table.Td>
                                                                    )}
                                                                    {(emitted[row.section] = (emitted[row.section] || 0) + 1) && null}
                                                                    <Table.Td>{row.itemLabel}</Table.Td>
                                                                    <Table.Td>
                                                                        <Text fw={700} c={getStatusLabels(brand, row.status).color}>
                                                                            {getStatusLabels(brand, row.status).text}
                                                                        </Text>
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
                                                                                        e.target.parentElement.innerHTML = '<span style="color: red">Image Failed to Load</span>';
                                                                                    }}
                                                                                />
                                                                            </Box>
                                                                        ) : (
                                                                            '-'
                                                                        )}
                                                                    </Table.Td>
                                                                </Table.Tr>
                                                            ));
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
                    </Stack>
                
                    {/* Render general notes only after details have loaded */}
                    <Box>
                        <Title
                            order={4}
                            mt="md"
                            mb="sm"
                            pb="xs"
                            stye={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }}
                        >
                            General Notes / Remarks
                        </Title>
                        <Paper withBorder p="md" radius="md">
                            <Text style={{ whiteSpace: 'pre-wrap' }}>
                                {remarks}
                            </Text>
                        </Paper>
                    </Box>
                    <Group justify="flex-end" mt="md">
                        <Button leftSection={<IconDownload size={16} />} onClick={handleDownloadPdf} disabled={!canDownload}>
                            Download PDF
                        </Button>
                    </Group>
                    </>
                )}
            </Modal>
        </Container>
    )
};

export default LogData;
