"use client";

/**
 * HorizontalLine — animated architectural divider.
 *
 * A thin horizontal rule that draws itself in via a clip-path reveal, moving
 * left-to-right (default) or right-to-left as the element enters the viewport.
 * Used between major sections, beneath section headings, and as a structural
 * accent in editorial layouts.
 *
 * Design rules:
 *   - Colour defaults to `border` (light: #e4e1d8, dark: #2e2d28)
 *   - Inverted variant uses `neutral-50/25` for dark surfaces
 *   - Width is always 100% of its container — control width via parent
 *   - Under reduced motion the line is shown immediately, no animation
 *   - Do NOT apply this to decorative contexts — it implies structural rhythm
 */

import { motion } from "framer-motion";
import { forwardRef, type HTMLAttributes } from "react";

import { useReducedMotionPreference } from "@hooks/use-reduced-motion";

import { cn } from "@utils/cn";

export interface HorizontalLineProps extends HTMLAttributes<HTMLDivElement> {
  /** Draw direction: the mask travels left → right or right → left. */
  direction?: "ltr" | "rtl";
  /** Duration in seconds. */
  duration?: number;
  /** Delay before the reveal starts. */
  delay?: number;
  /** Inverted voice for dark surfaces. */
  inverted?: boolean;
  /** Extra thin (0.5px) for very delicate structural accents. */
  thin?: boolean;
  /** Trigger threshold — how far in view before animating. */
  margin?: string;
}

export const HorizontalLine = forwardRef<HTMLDivElement, HorizontalLineProps>(
  (
    {
      direction = "ltr",
      duration = 0.9,
      delay = 0,
      inverted = false,
      thin = false,
      margin = "-60px",
      className,
      ...props
    },
    ref
  ) => {
    const reduced = useReducedMotionPreference();

    const initial = direction === "ltr" ? "inset(0% 100% 0% 0%)" : "inset(0% 0% 0% 100%)";

    return (
      <div ref={ref} className={cn("w-full overflow-hidden", className)} {...props}>
        <motion.div
          className={cn(
            "w-full",
            thin ? "h-px" : "h-px",
            inverted ? "bg-neutral-50/20" : "bg-border"
          )}
          initial={reduced ? false : { clipPath: initial }}
          whileInView={reduced ? undefined : { clipPath: "inset(0% 0% 0% 0%)" }}
          viewport={reduced ? undefined : { once: true, margin }}
          transition={reduced ? undefined : { duration, ease: [0.16, 1, 0.3, 1], delay }}
        />
      </div>
    );
  }
);
HorizontalLine.displayName = "HorizontalLine";
