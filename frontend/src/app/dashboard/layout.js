'use client';

import { useState, useEffect } from "react";
import { Burger, Group, ActionIcon, Menu, Text, Avatar } from "@mantine/core";
import { IconBell, IconSettings, IconLogout } from "@tabler/icons-react";
import { NavbarNested } from "@/components/navbar/NavbarNested";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext"
import { notifications } from "@mantine/notifications";
import classes from "@/components/navbar/NavbarNested.module.css";

export default function DashboardLayout({ children }) {
    const [opened, setOpened] = useState(true);
    const pathname = usePathname(); 
    const router = useRouter();
    const { user, logout, loading } = useUser();

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

    const handleNotificationsClick = () => {
        console.log("Notifications Clicked!");
    }

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
                            {/* Notifications Icon */}
                            <ActionIcon
                                variant='subtle'
                                size="lg"
                                radius="xl"
                                color="gray"
                                onClick={handleNotificationsClick}
                                aria-label="Notifications"
                            >
                                <IconBell size={20} stroke={1.5}/>
                            </ActionIcon>
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
