"use client";

/** Reveal — fade/rise-in wrapper for scroll reveals.
 *
 * Respects `prefers-reduced-motion` (falls back to a static fade) via the
 * shared reduced-motion helpers. `as` lets callers render a specific element.
 */

import { motion, type HTMLMotionProps } from "framer-motion";
import { forwardRef, type ElementType } from "react";

import { fadeUpVariant } from "@lib/motion";

export interface RevealProps extends HTMLMotionProps<"div"> {
  /** Travel distance in px; 0 = pure fade. */
  distance?: number;
  /** Animation duration in seconds. */
  duration?: number;
  /** Render as a different HTML element (e.g. "section", "li"). */
  as?: ElementType;
}

export const Reveal = forwardRef<HTMLDivElement, RevealProps>(
  ({ children, distance = 24, duration = 0.6, as = "div", ...props }, ref) => {
    const MotionTag = motion.create(as);
    return (
      <MotionTag
        ref={ref}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={fadeUpVariant(distance, duration)}
        {...props}
      >
        {children}
      </MotionTag>
    );
  }
);
Reveal.displayName = "Reveal";
