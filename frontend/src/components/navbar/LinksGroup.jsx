'use client';

import { Group, Box, Collapse, ThemeIcon, UnstyledButton } from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import classes from './NavbarNested.module.css';

export function LinksGroup({ label, icon: Icon, initiallyOpened, links }) {
    const [opened, { toggle }] = useDisclosure(initiallyOpened || false);

    const items = (links || []).map((link) => (
        <a href={link.link} key={link.label} className="block px-6 py-1 text-sm text-gray-700 hover:bg-gray-100">
            {link.label}
        </a>
    ));

    return (
        <>
        <UnstyledButton onClick={toggle} className="w-full px-4 py-2 text-left hover:bg-gray-100">
        <Group justify="space-between">
            <Group>
                <ThemeIcon variant="light" size={24}>
                    <Icon size={18} />
                </ThemeIcon>
                <Box>{label}</Box>
            </Group>
            {links ? <IconChevronRight size={14} style={{ transform: opened ? 'rotate(90deg)' : 'none' }} /> : null}
        </Group>
        </UnstyledButton>
        {links && <Collapse in={opened}>{items}</Collapse>}
        </>
    );
}