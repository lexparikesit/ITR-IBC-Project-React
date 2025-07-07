'use client';

import {
    IconGauge,
    IconNotes,
    IconTool
} from '@tabler/icons-react';

import { Code, Group, ScrollArea } from '@mantine/core';
import { LinksGroup } from './LinksGroup';
import { UserButton } from './UserButton';
import { Logo } from './Logo';
import classes from './NavbarNested.module.css';

const mockdata = [
    { label: 'Dashboard', icon: IconGauge },
    {
        label: 'Arrival Check',
        icon: IconNotes,
        links: [
            { label: 'Manitou', link: '/' },
            { label: 'Renault Trucks', link: '/' },
            { label: 'SDLG', link: '/' },
        ],
    },
    {
        label: 'Storage Maintenance List',
        icon: IconNotes,
        links: [
            { label: 'Manitou', link: '/' },
            { label: 'Renault Trucks', link: '/' },
            { label: 'SDLG', link: '/' },
        ],
    },
    { 
        label: 'Pre-Delivery Inspection', 
        icon: IconTool,
        links: [
            { label: 'Manitou', link: '/' },
            { label: 'Renault Trucks', link: '/' },
            { label: 'SDLG', link: '/' },
        ],
    },
    { 
        label: 'IBC Form', 
        icon: IconTool,
    },
    {
        label: 'Settings',
        icon: IconTool,
    },
    {
        label: 'Log Out',
        icon: IconTool,
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
        
            <div className={classes.footer}>
                <UserButton />
            </div>

        </nav>
    )
}