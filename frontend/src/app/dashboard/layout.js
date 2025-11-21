'use client';

import { useState, useEffect } from "react";
import { Burger, Group, ActionIcon, Menu, Text, Avatar, Badge, ScrollArea, Stack, Loader, Button, Paper } from "@mantine/core";
import { IconBell, IconSettings, IconLogout } from "@tabler/icons-react";
import { NavbarNested } from "@/components/navbar/NavbarNested";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext"
import { notifications } from "@mantine/notifications";
import { useNotifications } from "@/context/NotificationsContext";
import classes from "@/components/navbar/NavbarNested.module.css";

export default function DashboardLayout({ children }) {
    const [opened, setOpened] = useState(true);
    const pathname = usePathname(); 
    const router = useRouter();
    const { user, logout, loading } = useUser();
    const { items: notificationItems, unreadCount, loading: notifLoading, markAsRead, markAllAsRead } = useNotifications();

    useEffect(() => {
        if(!loading && !user) {
            notifications.show({
                title: 'Session Expired!',
                message: 'You Need to Login Back!',
                color: 'red',
            });
            router.push('/login');
        }
    }, [loading, user, router])

    // Display loading state if user data is being loaded
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Text size="lg" className="text-gray-600"> Load User Data ... </Text>
            </div>
        );
    }

    // If no user after loading (already redirected in useEffect), do not render content
    if (!user) {
        return null; 
    }

    // dynamic user data from context
    const displayName = user.firstName && user.lastName
        ? `${user.firstName} ${user.lastName}` 
            : user.username || (user.email ? user.email.split('@')[0] : 'User');
        const displayEmail = user.email || "No Email";

    // Static Gravatar URL for the avatar
    const gravatarAvatarUrl = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&s=200";

    // handling user logout
    const handleLogout = () => {
        logout();
        notifications.show({
            title: 'Successfully Logout',
            message: 'You have successfully logged out of your account.',
            color: 'green',
        });
    }

    // handling user settings
    const handleSettings = () => {
        console.log("User Settings Clicked!");
        router.push('/dashboard/settings/users');
    }
    const formatTimestamp = (value) => {
        if (!value) return "-";

        try {
            const normalized = value.endsWith("Z") ? value : `${value}Z`;
            const date = new Date(normalized);
            if (Number.isNaN(date.getTime())) return value;

            return date.toLocaleString("id-ID", {
                timeZone: "Asia/Jakarta",
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch (error) {
            return value;
        }
    };

    const notificationRoutes = {
        arrival: (id) => `/dashboard/arrival-check-log?ref=${id}`,
        storage_maintenance: (id) => `/dashboard/maintenance-list-log?ref=${id}`,
        pre_delivery_inspection: (id) => `/dashboard/pre-delivery-log?ref=${id}`,
        commissioning: (id) => `/dashboard/commissioning-log?ref=${id}`,
        kho_document: (id) => `/dashboard/kho-doc-log?ref=${id}`,
        ibc: (id) => `/dashboard/ibc-log?ref=${id}`,
    };

    const notificationLabels = {
        arrival: "Arrival Check",
        storage_maintenance: "Storage Maintenance",
        pre_delivery_inspection: "Pre-Delivery Inspection",
        commissioning: "Commissioning",
        kho_document: "KHO Document",
        ibc: "IBC Form",
    };

    const formatNotificationSubtitle = (notif) => {
        const payload = notif.payload || {};
        const entityType = (notif.entity_type || "").toLowerCase();
        if (entityType.startsWith("ibc")) {
            const brand = payload.brandLabel || payload.brand || "-";
            const ibcNo = payload.IBC_No || payload.ibc_no || "-";
            return `${brand} • IBC No ${ibcNo}`;
        }
        const brand = payload.brandLabel || payload.brand || "-";
        const woNumber = payload.woNumber || payload.wo_number || "-";
        const model = payload.modelLabel || payload.model || "-";
        const vin = payload.VIN || payload.vin || "-";
        
        return `${brand} • ${woNumber} • Model ${model} • VIN ${vin}`;
    };

    const formatNotificationMeta = (notif) => {
        const payload = notif.payload || {};
        const submitter = payload.submitterName || payload.technicianName;
        const approver = payload.approverName;
        const technician = payload.technicianName;
        const requestor = payload.requestorName;
        const parts = [];
        
        if (submitter) parts.push(`Submitter: ${submitter}`);
        if (approver) parts.push(`Approver: ${approver}`);
        if (requestor) parts.push(`Requestor: ${requestor}`);
        if (technician) parts.push(`Technician: ${technician}`);
        return parts.join(" • ");
    };

    const summarizeMessage = (message) => {
        if (!message) return "-";
        return message.length > 160 ? `${message.slice(0, 160)}…` : message;
    };

    const handleNotificationClick = (notif) => {
        markAsRead(notif.notification_id);
        const builder = notificationRoutes[notif.entity_type];
        if (builder) {
            router.push(builder(notif.entity_id));
        }
    };

    // function to handle dynamics path
    const getDynamicHeaderTitle = (path) => {
        if (path === '/dashboard'){
            return 'Dashboard Overview'
        } else if (path.startsWith('/dashboard/arrival-check/')) {
            const segment = path.split('/').pop()
            const capitalizedSegment = segment.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            return `Arrival Check - ${capitalizedSegment}`
        } else if (path.startsWith('/dashboard/maintenance-list-log')) {
            return `Storage Maintenance View`
        } else if (path.startsWith('/dashboard/maintenance-list')) {
            const segment = path.split('/').pop()
            const capitalizedSegment = segment.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            return `Maintenance List - ${capitalizedSegment}`
        } else if (path.startsWith('/dashboard/ibc')) {
            return "Indotraktor Business Case"
        } else if (path.startsWith('/dashboard/pre-delivery/')) {
            const segment = path.split('/').pop()
            const capitalizedSegment = segment.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            return `Pre-Delivery - ${capitalizedSegment}`
        } else if (path.startsWith('/dashboard/settings/users')) {
            return 'Settings - User Account'
        } else if (path.startsWith('/dashboard/commissioning/')) {
            const segment = path.split('/').pop()
            const capitalizedSegment = segment.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            return `Commissioning - ${capitalizedSegment}`
        } else if (path.startsWith('/dashboard/kho-doc')) {
            return `Key Hand Over Document`
        } else if (path.startsWith('/dashboard/arrival-check-log')) {
            return `Arrival Check View`
        } else if (path.startsWith('/dashboard/commissioning-log')) {
            return `Commissioning Unit View`
        } else if (path.startsWith('/dashboard/pre-delivery-log')) {
            return `Pre-Delivery View`
        } else if (path.startsWith('/dashboard/user-management')) {
            return `User Management & Account Settings`
        }
        // to input another logic below this section

        return 'Dashboard Overview';
    };

    const headerTitle = getDynamicHeaderTitle(pathname);
    const NAVBAR_FULL_WIDTH = 300;
    const dynamicPaddingLeft = opened ? NAVBAR_FULL_WIDTH : 0;
    const HEADER_HEIGHT = 60;

    return (
        <div className="flex min-h-screen">
            {/* Navbar Container*/}
            <div className={classes.navbarContainer} data-opened={opened ? 'true' : 'false'}>
                <NavbarNested />
            </div>
            
            {/* Main Content Area */}
            <div 
                className='flex-1 flex flex-col'
                style={{
                    paddingLeft: `${dynamicPaddingLeft}px`,
                    transition: 'padding-left 0.3s ease-in-out',
                    paddingTOP: `${HEADER_HEIGHT}px`
                }}
            >

                {/* Header */}
                <div className={classes.mainContentHeader}>
                    <Group justify='space-between' style={{ width: '100%' }}>
                        { /* Left Burger and Title */}
                        <Group gap="md">
                            <Burger
                                opened={opened}
                                onClick={() => setOpened((prev) => !prev)}
                                size="sm"
                                aria-label="Toggle navbar"
                            />
                            <Text size='lg' weight={500} style={{ color: 'black' }}> {headerTitle} </Text>
                        </Group>
                        {/* Right User Menu */}
                        <Group gap="md">
                            {/* Notifications */}
                            <Menu shadow="lg" width={360} position="bottom-end">
                                <Menu.Target>
                                    <ActionIcon
                                        variant='subtle'
                                        size="lg"
                                        radius="xl"
                                        color="gray"
                                        aria-label="Notifications"
                                        styles={{ root: { position: "relative" } }}
                                    >
                                        <IconBell size={20} stroke={1.5}/>
                                        {unreadCount > 0 && (
                                            <Badge
                                                color="red"
                                                size="xs"
                                                style={{ position: "absolute", top: 2, right: 2 }}
                                            >
                                                {unreadCount}
                                            </Badge>
                                        )}
                                    </ActionIcon>
                                </Menu.Target>
                                <Menu.Dropdown>
                                    <Menu.Label>Notifications</Menu.Label>
                                    <div style={{ padding: "0 0.5rem" }}>
                                        {notifLoading ? (
                                            <Group justify="center" py="md">
                                                <Loader size="sm" />
                                            </Group>
                                        ) : notificationItems.length === 0 ? (
                                            <Text size="sm" c="dimmed" py="md" ta="center">
                                                No notifications yet.
                                            </Text>
                                        ) : (
                                            <ScrollArea h={260} type="hover">
                                                <Stack gap="sm" py="xs">
                                                    {notificationItems.map((notif) => {
                                                        const metaInfo = formatNotificationMeta(notif);
                                                        return (
                                                        <Paper
                                                            key={notif.notification_id}
                                                            withBorder
                                                            p="xs"
                                                            radius="md"
                                                            shadow={notif.is_read ? "xs" : "sm"}
                                                            style={{ cursor: "pointer" }}
                                                            onClick={() => handleNotificationClick(notif)}
                                                        >
                                                            <Stack gap={4}>
                                                                <Group justify="space-between" align="flex-start">
                                                                    <Text size="xs" c="dimmed" fw={600}>
                                                                        {notificationLabels[notif.entity_type] || "Notification"}
                                                                    </Text>
                                                                    <Text size="xs" c="dimmed">
                                                                        {formatTimestamp(notif.createdon)}
                                                                    </Text>
                                                                </Group>
                                                                <Text size="sm" fw={500} lineClamp={2}>
                                                                    {summarizeMessage(notif.message)}
                                                                </Text>
                                                                {metaInfo && (
                                                                    <Text size="xs" c="dimmed">
                                                                        {metaInfo}
                                                                    </Text>
                                                                )}
                                                                <Text size="xs" c="dimmed" lineClamp={2}>
                                                                    {formatNotificationSubtitle(notif)}
                                                                </Text>
                                                            </Stack>
                                                        </Paper>
                                                    );
                                                    })}
                                                </Stack>
                                            </ScrollArea>
                                        )}
                                    </div>
                                    <Menu.Divider />
                                    <Group justify="space-between" px="sm">
                                        <Text size="xs" c="dimmed">
                                            {unreadCount} unread
                                        </Text>
                                        <Button
                                            size="xs"
                                            variant="subtle"
                                            onClick={markAllAsRead}
                                            disabled={notificationItems.length === 0}
                                        >
                                            Mark all read
                                        </Button>
                                    </Group>
                                </Menu.Dropdown>
                            </Menu>
                            {/* User Button */}
                            <Menu shadow='md' width={200} position='bottom-end'>
                                <Menu.Target>
                                    {/* User Button with Avatar and Name */}
                                    <Group style={{ cursor: 'pointer' }} className="hover:bg-gray-50 p-2 rounded-md transition-colors duration-200">
                                        <Avatar src={gravatarAvatarUrl} radius="xl" alt="User Avatar" />
                                        <div>
                                            <Text fw={700} className="text-gray-800">{displayName}</Text>
                                            <Text size="sm" c="dimmed">{displayEmail}</Text>
                                        </div>
                                    </Group>
                                </Menu.Target>
                                <Menu.Dropdown>
                                    <Menu.Label>Account Settings</Menu.Label>
                                    <Menu.Item
                                        leftSection={<IconSettings size={16} />}
                                        onClick={handleSettings}
                                    > Account Settings
                                    </Menu.Item>
                                    <Menu.Divider />
                                    <Menu.Item
                                            color="red"
                                            leftSection={<IconLogout size={14} />}
                                            onClick={handleLogout}
                                        > Logout
                                        </Menu.Item>
                                </Menu.Dropdown>
                            </Menu>
                        </Group>
                    </Group>
                </div>

                {/* Main Content */}
                <main className={classes.mainContentArea}>
                    {children}
                </main>
            </div>
        </div>
    );
}
