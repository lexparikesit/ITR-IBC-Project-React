import { Geist, Geist_Mono } from "next/font/google";
import { MantineProviders } from "@/providers/MantineProviders";
import { NotificationsProvider } from "@/context/NotificationsContext";

import "./globals.css";
import "@mantine/core/styles.css";
import '@mantine/dates/styles.css';
import "@mantine/notifications/styles.css";

import { UserProvider } from '@/context/UserContext'; 
import { Notifications } from "@mantine/notifications";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata = {
    title: "Indotraktor IBC Portal",
    description: "PT Indotraktor Utama",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" >
            <body className={`${geistSans.variable} ${geistMono.variable}`}>
                <MantineProviders>
                    <Notifications />
                    <UserProvider>
                        <NotificationsProvider>
                            {children}
                        </NotificationsProvider>
                    </UserProvider>
                </MantineProviders>
            </body>
        </html>
    );
}
