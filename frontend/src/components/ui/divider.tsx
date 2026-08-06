"use client";

/** Divider — horizontal rule, optionally labelled or styled as a hairlined
 * separator. `inset` leaves a gap at each edge for editorial compositions. */

import { forwardRef, type HTMLAttributes } from "react";

import { cn } from "@utils/cn";

export interface DividerProps extends HTMLAttributes<HTMLDivElement> {
  label?: string;
  /** Emit a soft, vertically-centered gold tick before a label. */
  ornament?: boolean;
  inset?: boolean;
}

export const Divider = forwardRef<HTMLDivElement, DividerProps>(
  ({ className, label, ornament = false, inset = false, ...props }, ref) => {
    const rail = "h-px bg-border";
    if (!label) {
      return (
        <div
          ref={ref}
          role="separator"
          className={cn(rail, inset && "mx-6", className)}
          {...props}
        />
      );
    }
    return (
      <div
        ref={ref}
        role="separator"
        className={cn(
          "flex w-full items-center gap-3 text-xs font-medium uppercase tracking-eyebrow text-muted-foreground",
          className
        )}
        {...props}
      >
        <span className={cn(rail, "flex-1", inset && "ml-6")} />
        {ornament ? <span aria-hidden className="h-1 w-1 rotate-45 bg-accent-400" /> : null}
        <span className="whitespace-nowrap">{label}</span>
        <span className={cn(rail, "flex-1", inset && "mr-6")} />
      </div>
    );
  }
);
Divider.displayName = "Divider";
