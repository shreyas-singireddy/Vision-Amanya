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
}

export function Breadcrumbs({ items, className, ...props }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center", className)} {...props}>
      <ol className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <Fragment key={`${item.label}-${index}`}>
              <li className="flex items-center gap-2">
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className="transition-colors duration-fast ease-standard hover:text-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/15 rounded-sm"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    aria-current={isLast ? "page" : undefined}
                    className={cn(isLast && "text-foreground")}
                  >
                    {item.label}
                  </span>
                )}
              </li>
              {!isLast ? (
                <li aria-hidden className="text-muted-foreground/60">
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
