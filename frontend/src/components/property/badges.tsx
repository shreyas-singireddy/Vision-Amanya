"use client";

/** PropertyBadge — availability/status chip for listings and towers.
 * The small square is a "quality mark" signalling sale status at a glance. */

import { forwardRef } from "react";

import { cn } from "@utils/cn";

type Status = "available" | "sold-out" | "phase-open" | "launching";

const config: Record<Status, { label: string; cls: string }> = {
  available: {
    label: "Available",
    cls: "bg-success-600 text-white",
  },
  "sold-out": {
    label: "Sold out",
    cls: "bg-neutral-700 text-neutral-100",
  },
  "phase-open": {
    label: "Phase 2 open",
    cls: "bg-primary-600 text-white",
  },
  launching: {
    label: "Launching",
    cls: "bg-accent-600 text-accent-950",
  },
};

export interface PropertyBadgeProps {
  status?: Status;
  className?: string;
}

export const PropertyBadge = forwardRef<HTMLSpanElement, PropertyBadgeProps>(
  ({ status = "available", className }, ref) => {
    const { label, cls } = config[status];
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold tracking-normal",
          cls,
          className
        )}
      >
        <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-white/80" />
        {label}
      </span>
    );
  }
);
PropertyBadge.displayName = "PropertyBadge";
