'use client';

import { useState } from 'react';
import { Burger, Group, Code, ActionIcon, Menu, Text, Anchor, useRandomClassName } from '@mantine/core';
import { IconBell, IconSettings, IconLogout } from '@tabler/icons-react';
import { NavbarNested } from "@/components/navbar/NavbarNested";
import { UserButton } from '@/components/navbar/UserButton';
import classes from '@/components/navbar/NavbarNested.module.css';

export default function DashboardLayout({ children }) {
    
    const [opened, setOpened] = useState(false);

    // example user data
    const currentUser = {
        username: 'John Doe',
        email: 'john.doe@example.com',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fbc?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=250&q=80'
    }

    // handling user logout
    const handleLogout = () => {
        console.log("User Logged Out!");
        
    }

    // handling user settings
    const handleSettings = () => {
        console.log("User Settings Clicked!");
    }

    const handleNotificationsClick = () => {
        console.log("Notifications Clicked!");
    }

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
                    { /* Left Burger and Title */}
                    <Group gap="md">
                        <Burger
                            opened={opened}
                            onClick={() => setOpened((prev) => !prev)}
                            size="sm"
                            aria-label="Toggle navbar"
                        />
                        <Text size='lg' weight={500} style={{ color: 'black' }}> Dashboard Overview </Text>
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
                                <UserButton user={currentUser}></UserButton>
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
