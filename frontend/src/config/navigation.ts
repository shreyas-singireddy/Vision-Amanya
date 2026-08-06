/** Navigation configuration.
 *
 * Declarative nav model consumed by future header/footer/sidebar components.
 * This file defines *where* navigation lives so page builders never hardcode
 * link lists. Keep every href a typed route.
 */

import type { Route } from "next";

export type NavItem = {
  label: string;
  href: Route;
  /** RBAC role codes allowed to see the item; empty = public. */
  roles?: string[];
  /** Render the item only while the user is authenticated. */
  requiresAuth?: boolean;
  /** Render the item only while the user is a guest. */
  guestOnly?: boolean;
  /** Children for dropdown/mega-menu navigation. */
  children?: NavItem[];
};

export interface NavigationConfig {
  /** Items shown in the main public header. */
  main: NavItem[];
  /** Items shown once authenticated (dashboard, favourites, …). */
  authenticated: NavItem[];
  /** Footer link groups keyed by column heading. */
  footer: Array<{ heading: string; links: NavItem[] }>;
}

export const navigationConfig: NavigationConfig = {
  main: [
    { label: "Home", href: "/" },
    { label: "The Project", href: "/project" },
    { label: "Residences", href: "/properties" },
    { label: "Gallery", href: "/gallery" },
    { label: "Contact", href: "/contact" },
  ],
  authenticated: [
    { label: "Dashboard", href: "/dashboard", requiresAuth: true },
    { label: "Saved Homes", href: "/favourites", requiresAuth: true },
    { label: "Enquiries", href: "/enquiries", requiresAuth: true },
  ],
  footer: [
    {
      heading: "Explore",
      links: [
        { label: "Home", href: "/" },
        { label: "The Project", href: "/project" },
        { label: "Residences", href: "/properties" },
      ],
    },
    {
      heading: "Company",
      links: [
        { label: "About", href: "/about" },
        { label: "Contact", href: "/contact" },
        { label: "Privacy", href: "/privacy" },
        { label: "Terms", href: "/terms" },
      ],
    },
  ],
};
