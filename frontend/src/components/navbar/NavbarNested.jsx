import {
    IconGauge,
    IconNotes,
    IconTool,
    IconForms,
    IconBox,
    IconFolder,
    IconTruckDelivery,
    IconChecks
} from '@tabler/icons-react';
import { Code, Group, ScrollArea, Text } from '@mantine/core';
import { LinksGroup } from './LinksGroup';
import { Logo } from './Logo';
import { useUser } from '@/context/UserContext';
import classes from './NavbarNested.module.css';

const mockdata = [
    {
        label: 'Dashboard',
        links: [
            { label: 'Dashboard', icon: IconGauge, link: '/dashboard', requiredPermission: 'access_dashboard' }
        ],
    },
    {
        label: 'Form',
        links: [
            { 
                label: 'Arrival Check',
                icon: IconBox,
                links: [
                    { label: 'Manitou', link: '/dashboard/arrival-check/manitou', requiredPermission: ['access_arrival_check', 'approve_arrival_check'] },
                    { label: 'Renault Trucks', link: '/dashboard/arrival-check/renault-trucks', requiredPermission: ['access_arrival_check', 'approve_arrival_check'] },
                    { label: 'SDLG', link: '/dashboard/arrival-check/sdlg', requiredPermission: ['access_arrival_check', 'approve_arrival_check'] },
                ],
            },
            {
                label: 'Maintenance List',
                icon: IconTool,
                links: [
                    { label: 'Manitou', link: '/dashboard/maintenance-list/manitou', requiredPermission: ['access_storage_maintenance', 'approve_storage_maintenance'] },
                    { label: 'Renault Trucks', link: '/dashboard/maintenance-list/renault-trucks', requiredPermission: ['access_storage_maintenance', 'approve_storage_maintenance'] },
                    { label: 'SDLG', link: '/dashboard/maintenance-list/sdlg', requiredPermission: ['access_storage_maintenance', 'approve_storage_maintenance'] },
                ],
            },
            { 
                label: 'Pre-Delivery Inspection',
                icon: IconNotes,
                links: [
                    { label: 'Manitou', link: '/dashboard/pre-delivery/manitou', requiredPermission: ['access_pdi', 'approve_pdi'] },
                    { label: 'Renault Trucks', link: '/dashboard/pre-delivery/renault-trucks', requiredPermission: ['access_pdi', 'approve_pdi'] },
                    { label: 'SDLG', link: '/dashboard/pre-delivery/sdlg', requiredPermission: ['access_pdi', 'approve_pdi'] },
                ],
            },
            { 
                label: 'Commissioning Unit', 
                icon: IconTruckDelivery,
                links: [
                    { label: 'Manitou', link: '/dashboard/commissioning/manitou', requiredPermission: ['access_commissioning', 'approve_commissioning'] },
                    { label: 'Renault Trucks', link: '/dashboard/commissioning/renault-trucks', requiredPermission: ['access_commissioning', 'approve_commissioning'] },
                    { label: 'SDLG', link: '/dashboard/commissioning/sdlg', requiredPermission: ['access_commissioning', 'approve_commissioning'] },
                ],
            },
        ],
    },
    {
        label: 'IBC Form',
        links: [
            { label: 'IBC Form', icon: IconForms, link: '/dashboard/ibc', requiredPermission: ['access_ibc', 'approve_ibc'] }
        ],
    },
    {
        label: 'Delivery Unit',
        links: [
            { label: 'Upload KHO Document', icon: IconChecks, link: '/dashboard/kho-doc', requiredPermission: ['access_kho', 'approve_kho'] }
        ]
    },
    {
        label: 'Log Activity',
        links: [
            { label: 'Arrival Check Log', icon: IconFolder, link: '/dashboard/arrival-check-log', requiredPermission: ['access_arrival_log'] },
            { label: 'Maintenance Log', icon: IconFolder, link: '/dashboard/maintenance-list-log', requiredPermission: ['access_maintenance_log'] },
            { label: 'IBC Form Log', icon: IconFolder, link: '/dashboard/ibc-log', requiredPermission: ['access_ibc_log'] },
            { label: 'Pre-Delivery Log', icon: IconFolder, link: '/dashboard/pre-delivery-log', requiredPermission: ['access_pdi_log'] },
            { label: 'Commissioning Log', icon: IconFolder, link: '/dashboard/commissioning-log', requiredPermission: ['access_commissioning_log'] },
            { label: 'Key Hand Over Log', icon: IconFolder, link: '/dashboard/kho-doc-log', requiredPermission: ['access_kho_log'] },
        ],
    },
    {
        label: 'Account & Settings',
        links: [
            { label: 'Account Settings', icon: IconTool, link: '/dashboard/settings/users' },
            { label: 'User Management', icon: IconTool, link: '/dashboard/user-management', requiredPermission: ['manage_users'] },
        ],
    },
];

export function NavbarNested() {
    const { user, loading } = useUser();
    const userPermissions = user?.permissions || [];

    const hasPermission = (requiredPerm) => {
    if (!requiredPerm) return true;
    if (Array.isArray(requiredPerm)) {
        return requiredPerm.some(perm => userPermissions.includes(perm));
    }
    return userPermissions.includes(requiredPerm);
};

    const filteredMockdata = mockdata
        .map(section => {
            const filteredLinks = section.links.filter(item => {
                if (item.links) {
                    const filteredSubLinks = item.links.filter(sub => hasPermission(sub.requiredPermission));
                    return filteredSubLinks.length > 0;
                }
                return hasPermission(item.requiredPermission);
            }).map(item => {
                if (item.links) {
                    return {
                        ...item,
                        links: item.links.filter(sub => hasPermission(sub.requiredPermission))
                    };
                }
                return item;
            });

            return {
                ...section,
                links: filteredLinks
            };
        })
        .filter(section => section.links.length > 0);

    const links = filteredMockdata.map((section) => (
        <div key={section.label} className={classes.sectionWrapper}>
            <Text className={classes.sectionLabel} size="xs" color="white">
                {section.label}
            </Text>
            {section.links.map((item) => (
                <LinksGroup {...item} key={item.label} />
            ))}
        </div>
    ));

    if (loading) {
        return (
            <nav className={classes.navbar}>
                <div className={classes.header}>
                    <Group justify='space-between' style={{ width: '100%' }}>
                        <Logo style={{ width: 120 }} />
                        <Code fw={700}> V1.0.0 </Code>
                    </Group>
                </div>
                <ScrollArea className={classes.links}>
                    <div className={classes.linksInner}>
                        Loading...
                    </div>
                </ScrollArea>
            </nav>
        );
    }

    return (
        <nav className={classes.navbar}>
            <div className={classes.header}>
                <Group justify='space-between' style={{ width: '100%' }}>
                    <Logo style={{ width: 120 }} />
                    <Code fw={700}> V1.0.0 </Code>
                </Group>
            </div>

            <ScrollArea className={classes.links}>
                <div className={classes.linksInner}>
                    {links}
                </div>
            </ScrollArea>
        </nav>
    );
}