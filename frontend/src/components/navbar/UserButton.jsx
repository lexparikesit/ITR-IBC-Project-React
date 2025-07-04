'use client';

import { Group, Avatar, Text, UnstyledButton } from '@mantine/core';

export function UserButton({ user, onLogout }) {
    return (
        <UnstyledButton className="flex items-center p-2 hover:bg-gray-100">
            <Avatar radius="xl" />
            <Group direction="column" spacing={0} ml="xs">
                <Text size="sm" weight={500}>{user?.username}</Text>
                <Text size="xs" color="dimmed">{user?.email}</Text>
            </Group>
        </UnstyledButton>
    );
}