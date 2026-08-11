"use client";

/** SpecItem / SpecList — labelled specification rows for residence cards and
 * floor plans (area, bedrooms, baths, balconies, floor, possession). */

import { forwardRef, type HTMLAttributes } from "react";
import { type LucideIcon } from "lucide-react";

import { cn } from "@utils/cn";

export interface SpecItemProps extends HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon;
  label: string;
  value: string;
}

export const SpecItem = forwardRef<HTMLDivElement, SpecItemProps>(
  ({ className, icon: Icon, label, value, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center gap-2.5", className)} {...props}>
      {Icon ? (
        <span
          aria-hidden
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-surface-subtle text-muted-foreground"
        >
          <Icon className="h-4 w-4" strokeWidth={1.75} />
        </span>
      ) : null}
      <div className="min-w-0 leading-tight">
        <p className="truncate text-xs uppercase tracking-label text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  )
);
SpecItem.displayName = "SpecItem";

export interface SpecListProps extends HTMLAttributes<HTMLDivElement> {
  items: Array<Omit<SpecItemProps, "className">>;
}

/** SpecList — evenly spaced row of specs, wrapping on small screens. */
export const SpecList = forwardRef<HTMLDivElement, SpecListProps>(
  ({ className, items, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("grid grid-cols-2 gap-x-md gap-y-lg sm:grid-cols-3 lg:grid-cols-4", className)}
      {...props}
    >
      {items.map((item) => (
        <SpecItem key={item.label} {...item} />
      ))}
    </div>
  )
);
SpecList.displayName = "SpecList";
