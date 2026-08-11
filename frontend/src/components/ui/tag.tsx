"use client";

/** Tag — small labelled chip with a leading dot. Used for property tags
 * (e.g. "Furnished", "Pool", "Resale") and feature labels. Purely
 * presentational — use `Badge` for status tones. */

import { Slot } from "@radix-ui/react-slot";
import { forwardRef, type HTMLAttributes } from "react";

import { cn } from "@utils/cn";

type Tone = "neutral" | "primary" | "accent" | "navy";

const toneClasses: Record<Tone, string> = {
  neutral: "border-border bg-surface text-muted-foreground [&>span]:bg-muted-foreground",
  primary:
    "border-primary-200 bg-primary-50 text-primary-800 dark:border-primary-900 dark:bg-primary-950 dark:text-primary-300 [&>span]:bg-primary-600",
  accent:
    "border-accent-200 bg-accent-50 text-accent-800 dark:border-accent-900 dark:bg-accent-950 dark:text-accent-300 [&>span]:bg-accent-600",
  navy: "border-navy-200 bg-navy-50 text-navy-800 dark:border-navy-800 dark:bg-navy-900/40 dark:text-navy-300 [&>span]:bg-navy-600",
};

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  /** Render the tag as the passed child (e.g. `<Link>`). */
  asChild?: boolean;
}

export const Tag = forwardRef<HTMLSpanElement, TagProps>(
  ({ className, tone = "neutral", asChild = false, children, ...props }, ref) => {
    const Component = asChild ? Slot : "span";
    return (
      <Component
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium tracking-normal",
          toneClasses[tone],
          className
        )}
        {...props}
      >
        <span aria-hidden className="h-1.5 w-1.5 rounded-full opacity-80" />
        {children}
      </Component>
    );
  }
);
Tag.displayName = "Tag";
