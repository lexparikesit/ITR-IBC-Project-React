'use client';

import { useState } from 'react';
import { Burger } from '@mantine/core';
import { NavbarNested } from "@/components/navbar/NavbarNested";

export default function DashboardLayout({ children }) {
    const [opened, setOpened] = useState(false);


    return (
    <div className="flex">
        {/* Navbar */}
        <div className={`transition-all duration-300 ${opened ? 'w-64' : 'w-0 overflow-hidden'}`}>
            <NavbarNested />
        </div>

    <div className="flex-1">
        {/* Header / Topbar */}
        <Burger
            opened={opened}
            onClick={() => setOpened((prev) => !prev)}
            size="sm"
            aria-label="Toggle navbar"
        />

        {/* Main Content */}
        <main className="p-4">{children}</main>
        </div>
    </div>
    );

}
