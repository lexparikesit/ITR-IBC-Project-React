"use client";

import { Group, Avatar, Text, UnstyledButton } from "@mantine/core";

export function UserButton({ user }) {
	const avatarUrl =
		user?.avatar ||
		"https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&s=200";

	return (
		<UnstyledButton className="p-2 rounded-md hover:bg-gray-100 flex items-center">
			<Avatar src={avatarUrl} alt={user?.username} radius="xl" size="md" />
			<Group
				style={{
					flexDirection: "column",
					gap: 0, 
					marginLeft: "var(--mantine-spacing-xs)",
				}}
			>
				<Text size="sm" fw={500} c="black">
					{user?.username || "Guest"}
				</Text>{" "}
				<Text size="xs" c="dimmed">
					{user?.email || "guest@example.com"}
				</Text>
			</Group>
		</UnstyledButton>
	);
}
