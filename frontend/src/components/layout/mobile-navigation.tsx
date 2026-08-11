"use client";

/** MobileNavigation — the off-canvas menu (right drawer).
 *
 * A full-height panel with the navigation in display type, a primary CTA and
 * contact channels. Closes on route change. Only rendered on small screens.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

import { chromeContact, chromeNavigation } from "@config/chrome";
import { ctaConfig } from "@config/cta";
import { routes } from "@constants/routes";

import { Button } from "@components/ui/button";
import { Drawer, DrawerClose, DrawerContent, DrawerTrigger } from "@components/ui/drawer";
import { IconButton } from "@components/ui/icon-button";

import { cn } from "@utils/cn";

export interface MobileNavigationProps {
  /** Inverted voice for dark surfaces / transparent hero header. */
  inverted?: boolean;
}

export function MobileNavigation({ inverted = false }: MobileNavigationProps) {
  const pathname = usePathname();

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <IconButton
          icon={Menu}
          variant="ghost"
          size="md"
          aria-label="Open menu"
          className={cn(
            "lg:hidden transition-colors duration-fast",
            inverted ? "text-neutral-50 hover:bg-neutral-50/15" : "text-foreground"
          )}
        />
      </DrawerTrigger>
      <DrawerContent side="right" className="flex flex-col bg-surface-subtle">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <Link href={routes.home} className="font-serif text-xl font-medium tracking-display">
            Amnaya
          </Link>
          <DrawerClose asChild>
            <IconButton icon={X} variant="ghost" size="md" aria-label="Close menu" />
          </DrawerClose>
        </div>

        <nav aria-label="Primary" className="flex-1 overflow-y-auto px-6 py-8">
          <ul className="flex flex-col gap-6">
            {chromeNavigation.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(`${item.href}/`));
              return (
                <li key={item.href}>
                  <DrawerClose asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        "font-serif text-3xl font-medium tracking-display transition-colors duration-fast ease-standard focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/15 rounded-sm",
                        isActive ? "text-accent-700" : "text-foreground hover:text-primary-700"
                      )}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {item.label}
                    </Link>
                  </DrawerClose>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-border px-6 py-6">
          <Button asChild variant="accent" size="lg" className="w-full">
            <a href={routes.contact}>{ctaConfig.enquireNow.label}</a>
          </Button>
          <p className="mt-4 text-sm text-muted-foreground">
            {chromeContact.phone}
            <br />
            {chromeContact.email}
          </p>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
