'use client';

import { useState } from 'react';
import { Burger, Group, Code, ActionIcon, Menu, Text } from '@mantine/core';
import { IconBell, IconSettings, IconLogout, IconWorldSearch } from '@tabler/icons-react';
import { NavbarNested } from "@/components/navbar/NavbarNested";
import { UserButton } from '@/components/navbar/UserButton';
import { usePathname } from 'next/navigation';
import classes from '@/components/navbar/NavbarNested.module.css';

export default function DashboardLayout({ children }) {
    
    const [opened, setOpened] = useState(true);
    const pathname = usePathname(); 

    // example user data
    const currentUser = {
        username: 'John Doe',
        email: 'john.doe@example.com',
        avatar: 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&s=200'
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

    // function to handle dynamics path
    const getDynamicHeaderTitle = (path) => {
        if (path === '/dashboard'){
            return 'Dashboard Overview'
        } else if (path.startsWith('/dashboard/arrival-check/')) {
            const segment = path.split('/').pop() // get last segment
            const capitalizedSegment = segment.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            return `Arrival Check - ${capitalizedSegment}`
        } else if (path.startsWith('/dashboard/maintenance-list')) {
            const segment = path.split('/').pop()
            const capitalizedSegment = segment.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            return `Maintenance List - ${capitalizedSegment}`
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
            <div 
                className={classes.mainContentHeader}
                /* style={{
                    paddingLeft: `${dynamicPaddingLeft}px`,
                    transition: 'padding-left 0.3s ease-in-out'
                }} */
            >
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
            <main 
                className={classes.mainContentArea}
                /* style={{
                    paddingLeft: `${dynamicPaddingLeft}px`,
                    transition: 'padding-left 0.3s ease-in-out'
                }} */
            >
                {children}
            </main>
        </div>
    </div>
    );
}
