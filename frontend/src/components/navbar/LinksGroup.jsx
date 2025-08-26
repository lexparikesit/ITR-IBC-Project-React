'use client';

import {
  Group,
  Box,
  Collapse,
  ThemeIcon,
  NavLink as MantineNavLink,
  Text,
} from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import classes from "./NavbarNested.module.css";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function LinksGroup({ label, icon: Icon, initiallyOpened, links, link }) {
  const pathname = usePathname();
  const hasLinks = Array.isArray(links) && links.length > 0;
  const [opened, { toggle }] = useDisclosure(initiallyOpened || false);

  const items = (links || []).map((submenuLink) => (
      <MantineNavLink
        href={submenuLink.link}
        key={submenuLink.label}
        label={submenuLink.label}
        component={Link}
        className={classes.submenuItem}
        active={pathname === submenuLink.link}
      />
  ));

  if (hasLinks) {
    return (
      <>
        <MantineNavLink
          component="div"
          className={classes.linksGroupItem}
          label={label}
          leftSection={Icon && (
            <ThemeIcon variant="light" size={24} className={classes.linksGroupIcon}>
              <Icon size={18} />
            </ThemeIcon>
          )}
          rightSection={
            <IconChevronRight
              size={14}
              className={classes.linksGroupItemChevron}
              style={{
                transform: opened ? "rotate(90deg)" : "none",
                transition: "transform 200ms ease",
              }}
            />
          }
          onClick={toggle}
        />
        <Collapse in={opened}>
          <div className={classes.submenu}>{items}</div>
        </Collapse>
      </>
    );
  }

  if (link) {
    return (
      <MantineNavLink
        href={link}
        label={label}
        leftSection={Icon && (
          <ThemeIcon variant="light" size={24} className={classes.linksGroupIcon}>
            <Icon size={18} />
          </ThemeIcon>
        )}
        component={Link}
        className={classes.linksGroupItem}
        active={pathname === link}
      />
    );
  }

  return null;
}