"use client";

/** Badge — compact status/label chip with soft and outline treatments. */

import { Slot } from "@radix-ui/react-slot";
import { forwardRef, type HTMLAttributes } from "react";

import { cn } from "@utils/cn";

type Tone = "neutral" | "primary" | "accent" | "success" | "warning" | "error" | "info";

type Variant = "soft" | "solid" | "outline";

const toneClasses: Record<Variant, Record<Tone, string>> = {
  soft: {
    neutral: "bg-muted text-muted-foreground",
    primary: "bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200",
    accent: "bg-accent-100 text-accent-800 dark:bg-accent-900 dark:text-accent-200",
    success: "bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200",
    warning: "bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-200",
    error: "bg-error-100 text-error-800 dark:bg-error-900 dark:text-error-200",
    info: "bg-info-100 text-info-800 dark:bg-info-900 dark:text-info-200",
  },
  solid: {
    neutral: "bg-neutral-700 text-neutral-50",
    primary: "bg-primary-600 text-white",
    accent: "bg-accent-500 text-accent-950",
    success: "bg-success-600 text-white",
    warning: "bg-warning-600 text-white",
    error: "bg-error-600 text-white",
    info: "bg-info-600 text-white",
  },
  outline: {
    neutral: "border border-border text-muted-foreground",
    primary:
      "border border-primary-300 text-primary-700 dark:border-primary-700 dark:text-primary-300",
    accent: "border border-accent-300 text-accent-700 dark:border-accent-700 dark:text-accent-300",
    success: "border border-success-500/40 text-success-700 dark:text-success-400",
    warning: "border border-warning-500/40 text-warning-700 dark:text-warning-400",
    error: "border border-error-500/40 text-error-700 dark:text-error-400",
    info: "border border-info-500/40 text-info-700 dark:text-info-400",
  },
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  variant?: Variant;
  /** Render the badge as the passed child (e.g. `<Link>`). */
  asChild?: boolean;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, tone = "neutral", variant = "soft", asChild = false, ...props }, ref) => {
    const Component = asChild ? Slot : "span";
    return (
      <Component
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium tracking-normal",
          toneClasses[variant][tone],
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";
