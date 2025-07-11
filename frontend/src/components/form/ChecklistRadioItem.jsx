// src/components/ChecklistRadioItem.jsx (atau sesuaikan path-nya)

"use client";

import React from 'react';
import { Grid, Radio, Stack, Text, Textarea } from '@mantine/core'; // Impor komponen Mantine yang dibutuhkan

const ChecklistRadioItem = ({ label, section, itemKey, currentValue, onChange, remarksValue, onRemarksChange }) => {
    const isBad = currentValue === 'Bad';

    return (
        <Grid.Col span={{ base: 12, md: 6 }}>
            <Stack gap="xs">
                <Text size="sm">{label}</Text>
                <Radio.Group
                    value={currentValue}
                    onChange={(value) => onChange(section, itemKey, value)}
                >
                    <Radio value="Good" label="Good" />
                    <Radio value="Missing" label="Missing" />
                    <Radio value="Bad" label="Bad" />
                </Radio.Group>
                {isBad && (
                    <Textarea
                        placeholder="Tambahkan catatan di sini untuk 'Bad'"
                        value={remarksValue}
                        onChange={(event) => onRemarksChange(section, `${itemKey}Remarks`, event.currentTarget.value)}
                        rows={2}
                    />
                )}
            </Stack>
        </Grid.Col>
    );
};

export default ChecklistRadioItem;