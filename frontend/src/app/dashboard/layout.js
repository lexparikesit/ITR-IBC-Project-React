'use client';

import { useState } from 'react';
import { Burger, Group, Code } from '@mantine/core';
import { NavbarNested } from "@/components/navbar/NavbarNested";
import classes from '@/components/navbar/NavbarNested.module.css';  

export default function DashboardLayout({ children }) {
    const [opened, setOpened] = useState(false);


    return (
    <div className="flex min-h-screen">
        {/* Navbar Container*/}
        <div className={classes.navbarContainer} data-opened={opened ? 'true' : 'false'}>
            <NavbarNested />
        </div>
        
        {/* Main Content Area */}
        <div className='flex-1 flex flex-col'>
            {/* Header */}
            <div className={classes.mainContentHeader}>
                <Group justify='space-between' style={{ width: '100%' }}>
                <Burger
                    opened={opened}
                    onClick={() => setOpened((prev) => !prev)}
                    size="sm"
                    aria-label="Toggle navbar"
                />
                <div> Dashboard Overview </div>
                </Group>
            </div>

            {/* Main Content */}
            <main className="{classes.mainContentArea}">
                {children}
            </main>
        </div>
    </div>
    );
}
