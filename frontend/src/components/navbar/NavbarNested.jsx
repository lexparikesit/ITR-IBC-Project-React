'use client';

import {
    IconGauge,
    IconNotes,
    IconTool,
    IconForms,
    IconLogout
} from '@tabler/icons-react';

import { Code, Group, ScrollArea } from '@mantine/core';
import { LinksGroup } from './LinksGroup';
import { UserButton } from './UserButton';
import { Logo } from './Logo';
import classes from './NavbarNested.module.css';

const mockdata = [
    {   
        label: 'Dashboard', 
        icon: IconGauge, 
        link: '/dashboard'
    },
    {
        label: 'Arrival Check',
        icon: IconNotes,
        links: [
            { label: 'Manitou', link: '/dashboard/arrival-check/manitou' },
            { label: 'Renault Trucks', link: '/dashboard/arrival-check/renault-trucks' },
            { label: 'SDLG', link: '/dashboard/arrival-check/sdlg' },
        ],
    },
    {
        label: 'Maintenance List',
        icon: IconNotes,
        links: [
            { label: 'Manitou', link: '/dashboard/maintenance-list/manitou' },
            { label: 'Renault Trucks', link: '/dashboard/maintenance-list/renault-trucks' },
            { label: 'SDLG', link: '/dashboard/maintenance-list/sdlg' },
        ],
    },
    { 
        label: 'IBC Form', 
        icon: IconForms,
    },
    { 
        label: 'Pre-Delivery Inspection', 
        icon: IconNotes,
        links: [
            { label: 'Manitou', link: '/' },
            { label: 'Renault Trucks', link: '/' },
            { label: 'SDLG', link: '/' },
        ],
    },
    { 
        label: 'Delivery Unit', 
        icon: IconNotes,
        links: [
            { label: 'Kalmar', link: '/' },
            { label: 'Manitou', link: '/' },
            { label: 'Mantsinen', link: '/' },
            { label: 'Renault Trucks', link: '/' },
            { label: 'SDLG', link: '/' },
        ],
    },
    {
        label: 'Settings',
        icon: IconTool,
    },
    {
        label: 'Log Out',
        icon: IconLogout,
    },
];

export function NavbarNested() {
    console.log("✅ NavbarNested component rendered");
    
    const links = mockdata.map((item) => <LinksGroup {...item} key={item.label} />);

    return (
        <nav className={classes.navbar}>
            <div className={classes.header}>
                <Group justify='space-between' style={{ width: '100%' }}>
                    <Logo style={{ width:120 }} />
                    <Code fw={700}> V1.0.0 </Code>
                </Group>
            </div>
        
            <ScrollArea className={classes.links}>
                <div className={classes.linksInner}>{links}</div>
            </ScrollArea>
        </nav>
    )
}