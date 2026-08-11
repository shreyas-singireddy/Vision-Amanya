"use client";

/** SiteNavigation — the desktop primary navigation.
 *
 * A horizontal row of `NavLink`s (tracked against the active route) with a
 * single primary CTA on the right. `inverted` flips the voice for the
 * transparent-over-hero header state. Item labels/paths are sourced from
 * `@config/site` so navigation stays a single source of truth.
 */

import { chromeNavigation } from "@config/chrome";
import { ctaConfig } from "@config/cta";
import { routes } from "@constants/routes";

import { Button } from "@components/ui/button";
import { NavLink } from "@components/ui/nav-link";

import { cn } from "@utils/cn";

export interface SiteNavigationProps {
  /** Dark-surface voice (transparent header state). */
  inverted?: boolean;
  className?: string;
}

/** Active-state matcher: highlight the section even on detail routes. */
const isSectionActive = (href: string) => (pathname: string) =>
  pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

export function SiteNavigation({ inverted = false, className }: SiteNavigationProps) {
  return (
    <nav aria-label="Primary" className={cn("hidden items-center gap-8 lg:flex", className)}>
      <ul className="flex items-center gap-8">
        {chromeNavigation.map((item) => (
          <li key={item.href}>
            <NavLink href={item.href} inverted={inverted} active={isSectionActive(item.href)}>
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
      <Button
        asChild
        variant="accent"
        size="sm"
        className={cn(inverted && "bg-neutral-50 text-neutral-900 hover:bg-neutral-100")}
      >
        <a href={routes.contact}>{ctaConfig.enquireNow.label}</a>
      </Button>
    </nav>
  );
}
