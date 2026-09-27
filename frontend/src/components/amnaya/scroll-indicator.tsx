"use client";

/**
 * ScrollIndicator — reusable animated scroll cue.
 *
 * A pill (thin rounded border) containing an animated dot that gently bounces
 * to invite the user to scroll. Typically placed at the bottom of a full-height
 * hero section, aligned right alongside project spec metadata.
 *
 * Extracted from ImmersiveHero so any hero or landing section can reuse it.
 *
 * Design rules:
 *   - Default voice: neutral-50 on dark surfaces (inverted=false)
 *   - Light voice: foreground/border on light surfaces (inverted=true)
 *   - Under reduced motion: static (no bouncing dot animation)
 *   - Never visible at widths < sm — use the `hidden sm:flex` utility on the
 *     parent if it should be desktop-only
 *   - The label is always uppercase tracked caps
 */

import { motion } from "framer-motion";
import { forwardRef, type HTMLAttributes } from "react";

import { useReducedMotionPreference } from "@hooks/use-reduced-motion";

import { cn } from "@utils/cn";

export interface ScrollIndicatorProps extends HTMLAttributes<HTMLDivElement> {
  /** Label rendered beside the pill. */
  label?: string;
  /** Light surface voice — uses border + foreground colours instead of white. */
  inverted?: boolean;
  /** Duration of one bounce cycle in seconds. */
  cycleDuration?: number;
}

export const ScrollIndicator = forwardRef<HTMLDivElement, ScrollIndicatorProps>(
  ({ label = "Scroll", inverted = false, cycleDuration = 1.8, className, ...props }, ref) => {
    const reduced = useReducedMotionPreference();

    return (
      <div
        ref={ref}
        className={cn("flex items-center gap-3", className)}
        aria-label={`${label} to explore`}
        {...props}
      >
        {/* Pill housing */}
        <div
          className={cn(
            "relative flex h-9 w-5 items-start justify-center rounded-full border p-1.5",
            inverted ? "border-border" : "border-neutral-50/25"
          )}
          aria-hidden
        >
          {/* Animated dot */}
          {reduced ? (
            /* Static dot under reduced motion */
            <div
              className={cn(
                "h-1.5 w-0.5 rounded-full",
                inverted ? "bg-foreground/40" : "bg-neutral-50/60"
              )}
            />
          ) : (
            <motion.div
              className={cn(
                "h-1.5 w-0.5 rounded-full",
                inverted ? "bg-foreground/40" : "bg-neutral-50/60"
              )}
              animate={{ y: [0, 10, 0], opacity: [1, 0.3, 1] }}
              transition={{
                duration: cycleDuration,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )}
        </div>

        {/* Label */}
        {label ? (
          <span
            className={cn(
              "text-[0.5625rem] font-medium uppercase tracking-[0.25em]",
              inverted ? "text-muted-foreground" : "text-neutral-50/40"
            )}
            aria-hidden
          >
            {label}
          </span>
        ) : null}
      </div>
    );
  }
);
ScrollIndicator.displayName = "ScrollIndicator";
