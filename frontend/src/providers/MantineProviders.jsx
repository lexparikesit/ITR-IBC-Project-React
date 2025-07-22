"use client";

import { createTheme, MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";

const theme = createTheme({
	fontFamily: "Geist Sans, sans-serif",
	headings: { fontFamily: "Geist Sans, sans-serif" },
})

export function MantineProviders({ children }) {
	return (
		<MantineProvider theme={theme}>
			<ModalsProvider>
				<Notifications />
				{children}
			</ModalsProvider>
		</MantineProvider>
	);
}
