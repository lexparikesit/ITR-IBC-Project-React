// NavbarNested.jsx
import {
    IconGauge,
    IconNotes,
    IconTool,
    IconForms,
    IconBox,
    IconFolder,
    IconTruckDelivery,
    IconChecks
} from '@tabler/icons-react';

import { Code, Group, ScrollArea, Text } from '@mantine/core';
import { LinksGroup } from './LinksGroup';
import { Logo } from './Logo';
import classes from './NavbarNested.module.css';

const mockdata = [
    {
        label: 'Dashboard',
        links: [
            { label: 'Dashboard', icon: IconGauge, link: '/dashboard' }
        ],
    },
    {
        label: 'Form',
        links: [
            { 
                label: 'Arrival Check',
                icon: IconBox,
                links: [
                    { label: 'Manitou', link: '/dashboard/arrival-check/manitou' },
                    { label: 'Renault Trucks', link: '/dashboard/arrival-check/renault-trucks' },
                    { label: 'SDLG', link: '/dashboard/arrival-check/sdlg' },
                ],
            },
            {
                label: 'Maintenance List',
                icon: IconTool,
                links: [
                    { label: 'Manitou', link: '/dashboard/maintenance-list/manitou' },
                    { label: 'Renault Trucks', link: '/dashboard/maintenance-list/renault-trucks' },
                    { label: 'SDLG', link: '/dashboard/maintenance-list/sdlg' },
                ],
            },
            { 
                label: 'Pre-Delivery Inspection',
                icon: IconNotes,
                links: [
                    { label: 'Manitou', link: '/dashboard/pre-delivery/manitou' },
                    { label: 'Renault Trucks', link: '/dashboard/pre-delivery/renault-trucks' },
                    { label: 'SDLG', link: '/dashboard/pre-delivery/sdlg' },
                ],
            },
            { 
                label: 'Commissioning Unit', 
                icon: IconTruckDelivery,
                links: [
                    { label: 'Manitou', link: '/dashboard/commissioning/manitou' },
                    { label: 'Renault Trucks', link: '/dashboard/commissioning/renault-trucks' },
                    { label: 'SDLG', link: '/dashboard/commissioning/sdlg' },
                ],
            },
        ],
    },
    {
        label: 'IBC Form',
        links: [
            { label: 'IBC Form', icon: IconForms, link: '/dashboard/ibc' }
        ],
    },
    {
        label: 'Delivery Unit',
        links: [
            { label: 'Upload KHO Document', icon: IconChecks, link: '/dashboard/ibc' }
        ]
    },
    {
        label: 'Log Activity',
        links: [
            { label: 'Arrival Check Log', icon: IconFolder, link: '/dashboard/logs/arrival-check' },
            { label: 'Maintenance Log', icon: IconFolder, link: '/dashboard/logs/maintenance' },
            { label: 'Pre-Delivery Log', icon: IconFolder, link: '/dashboard/logs/pre-delivery' },
            { label: 'Delivery Unit Log', icon: IconFolder, link: '/dashboard/logs/delivery-unit' },
        ],
    },
    {
        label: 'Account & Settings',
        links: [
            { label: 'Account Settings', icon: IconTool, link: '/dashboard/settings/users' },
            { label: 'User Management', icon: IconTool, link: '/dashboard/settings/user-management' },
        ],
    },
];

export function NavbarNested() {
    console.log("✅ NavbarNested component rendered");

    const links = mockdata.map((section) => (
        <div key={section.label} className={classes.sectionWrapper}> 
        <Text className={classes.sectionLabel} size="xs" color="white">
            {section.label}
        </Text>
        {section.links.map((item) => (
            <LinksGroup {...item} key={item.label} />
        ))}
    </div>
    ));

    return (
        <nav className={classes.navbar}>
            <div className={classes.header}>
                <Group justify='space-between' style={{ width: '100%' }}>
                    <Logo style={{ width: 120 }} />
                    <Code fw={700}> V1.0.0 </Code>
                </Group>
            </div>

            <ScrollArea className={classes.links}>
                <div className={classes.linksInner}>
                    {links}
                </div>
            </ScrollArea>
        </nav>
    );
}