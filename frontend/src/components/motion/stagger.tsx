"use client";

/** Stagger — container that staggers its child reveals.
 *
 * Children should each use a `hidden → visible` variant pair (e.g. the
 * `Reveal` family, `fadeUpVariant()`). Under reduced motion the container
 * renders without animation so all children appear together.
 */

import { motion, type HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";

import { useReducedMotionPreference } from "@hooks/use-reduced-motion";

import { staggerContainer } from "@lib/motion";

export interface StaggerProps extends HTMLMotionProps<"div"> {
  /** Delay between child reveals, in seconds. */
  stagger?: number;
  /** Delay before the first child, in seconds. */
  delayChildren?: number;
}

export const Stagger = forwardRef<HTMLDivElement, StaggerProps>(
  ({ children, stagger = 0.08, delayChildren = 0.05, ...props }, ref) => {
    const reduced = useReducedMotionPreference();
    const active = !reduced;

    return (
      <motion.div
        ref={ref}
        initial={active ? "hidden" : false}
        whileInView={active ? "visible" : undefined}
        viewport={active ? { once: true, margin: "-80px" } : undefined}
        variants={active ? staggerContainer(stagger, delayChildren) : undefined}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
Stagger.displayName = "Stagger";
