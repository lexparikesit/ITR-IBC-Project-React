"use client";

import {
	Group,
	Box,
	Collapse,
	ThemeIcon,
	UnstyledButton,
	Text,
} from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import classes from "./NavbarNested.module.css";
import Link from "next/link";

export function LinksGroup({ label, icon: Icon, initiallyOpened, links }) {
	const [opened, { toggle }] = useDisclosure(initiallyOpened || false);
	const hasLinks = Array.isArray(links) && links.length > 0;
	const items = (links || []).map((link) => (
		<Link href={link.link} key={link.label} className={classes.submenuItem}>
			{link.label}
		</Link>
	));

	return (
		<>
			<UnstyledButton onClick={toggle} className={classes.linksGroupItem}>
				<Group justify="space-between" style={{ width: "100%" }}>
					<Group gap="md">
						<ThemeIcon
							variant="light"
							size={24}
							className={classes.linksGroupIcon}
						>
							<Icon size={18} />
						</ThemeIcon>
						<Text size="sm" className={classes.linksGroupItemLabel}>
							{label}
						</Text>
					</Group>
					{hasLinks && (
						<IconChevronRight
							size={14}
							className={classes.linksGroupItemChevron} // <-- Terapkan kelas di sini
							style={{
								transform: opened ? "rotate(90deg)" : "none", // Rotasi 90 derajat untuk membuka
								transition: "transform 200ms ease",
							}}
						/>
					)}
				</Group>
			</UnstyledButton>
			{hasLinks && (
				<Collapse in={opened}>
					<div className={classes.submenu}>{items}</div>
				</Collapse>
			)}
		</>
	);
}
