"use client";

/** Breadcrumbs — editorial trail with gold chevrons. */

import Link from "next/link";
import type { Route } from "next";
import { ChevronRight } from "lucide-react";
import { Fragment, type HTMLAttributes } from "react";

import { cn } from "@utils/cn";

export interface Crumb {
  label: string;
  href?: Route;
}

export interface BreadcrumbsProps extends HTMLAttributes<HTMLElement> {
  items: Crumb[];
  /** Invert for dark surfaces (hero overlays). */
  inverted?: boolean;
}

export function Breadcrumbs({ items, inverted = false, className, ...props }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center", className)} {...props}>
      <ol
        className={cn(
          "flex flex-wrap items-center gap-2 text-sm",
          inverted ? "text-neutral-50/70" : "text-muted-foreground"
        )}
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <Fragment key={`${item.label}-${index}`}>
              <li className="flex items-center gap-2">
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className={cn(
                      "transition-colors duration-fast ease-standard focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/15 rounded-sm",
                      inverted ? "hover:text-neutral-50" : "hover:text-foreground"
                    )}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    aria-current={isLast ? "page" : undefined}
                    className={cn(isLast && (inverted ? "text-neutral-50" : "text-foreground"))}
                  >
                    {item.label}
                  </span>
                )}
              </li>
              {!isLast ? (
                <li
                  aria-hidden
                  className={cn(inverted ? "text-neutral-50/40" : "text-muted-foreground/60")}
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </li>
              ) : null}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
