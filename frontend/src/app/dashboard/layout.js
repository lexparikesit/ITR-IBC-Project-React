'use client';

import { NavbarNested } from "@/components/navbar/NavbarNested";

// import { NavbarNested } from '@/components/navbar/NavbarNested';

export default function DashboardLayout({ children }) {
    console.log('✅ layout rendered');

    return (
        <div className="flex">
            <NavbarNested />
            <main className="flex-1">{children}</main>
        </div>
    );
}
