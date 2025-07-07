// src/providers/MantineProviders.jsx
'use client';

import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals'; 
import { Notifications } from '@mantine/notifications'

import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css';

export function MantineProviders({ children }) {
    return (
        <MantineProvider defaultColorScheme="light">
            <ModalsProvider>
                <Notifications />
                {children}
            </ModalsProvider>
        </MantineProvider>
    );
}