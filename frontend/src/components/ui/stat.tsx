"use client";

/** Stat — editorial data point for galleries, listings and hero sections. */

import { forwardRef, type HTMLAttributes } from "react";

import { cn } from "@utils/cn";

export interface StatProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  /** Numeric or short value, e.g. `"120"`, `"2.4"`, `"∞"`. */
  value: string;
  /** Value suffix shown in muted/display style, e.g. `"acres"`. */
  suffix?: string;
  /** Toggle for dark surfaces (hero/ink sections). */
  inverted?: boolean;
  align?: "left" | "center";
}

export const Stat = forwardRef<HTMLDivElement, StatProps>(
  ({ className, label, value, suffix, inverted = false, align = "left", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex flex-col gap-1",
        align === "center" && "items-center text-center",
        className
      )}
      {...props}
    >
      <span
        className={cn(
          "font-serif text-3xl font-medium leading-none tracking-tight sm:text-4xl",
          inverted ? "text-neutral-50" : "text-foreground"
        )}
      >
        {value}
        {suffix ? (
          <span
            className={cn(
              "ml-1 text-lg sm:text-xl",
              inverted ? "text-neutral-50/70" : "text-muted-foreground"
            )}
          >
            {suffix}
          </span>
        ) : null}
      </span>
      <span
        className={cn(
          "text-xs font-medium uppercase tracking-eyebrow",
          inverted ? "text-neutral-50/60" : "text-muted-foreground"
        )}
      >
        {label}
      </span>
    </div>
  )
);
Stat.displayName = "Stat";
