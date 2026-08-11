"use client";

/** Reveal — the base scroll-reveal primitive.
 *
 * Fades a block into view with an optional directional offset and delay. It
 * is the foundation of the primitive family (`Fade`, `Slide`, `ScaleIn`,
 * `ScrollReveal` specialise it). Blur-based reveals use `BlurReveal` (from
 * `primitives.tsx`) so the filter is animated, never a static style.
 *
 * Respects `prefers-reduced-motion` via `useReducedMotionPreference`:
 * under reduced motion the block renders statically (no transform, no
 * delay) so content is immediately readable. `as` lets callers render a
 * specific element.
 */

import { motion, type HTMLMotionProps } from "framer-motion";
import { forwardRef, type ElementType } from "react";

import { useReducedMotionPreference } from "@hooks/use-reduced-motion";

import { fadeDirectionVariant, withDelay, type MotionDirection } from "@lib/motion";

export interface RevealProps extends HTMLMotionProps<"div"> {
  /** Travel direction; `"up"` by default (0 distance = pure fade). */
  direction?: MotionDirection;
  /** Travel distance in px; 0 = pure fade. */
  distance?: number;
  /** Animation duration in seconds. */
  duration?: number;
  /** Delay in seconds before the entrance starts. */
  delay?: number;
  /** Play only once (default) or re-run every time the block scrolls in. */
  once?: boolean;
  /** IntersectionObserver margin; default `-80px` (clear the fold). */
  margin?: string;
  /** Render as a different HTML element (e.g. "section", "li"). */
  as?: ElementType;
}

export const Reveal = forwardRef<HTMLDivElement, RevealProps>(
  (
    {
      children,
      direction = "up",
      distance = 24,
      duration = 0.7,
      delay = 0,
      once = true,
      margin = "-80px",
      as = "div",
      ...props
    },
    ref
  ) => {
    const reduced = useReducedMotionPreference();
    const MotionTag = motion.create(as);

    const variants =
      reduced || distance === 0
        ? undefined
        : withDelay(fadeDirectionVariant(direction, distance, duration), delay);

    return (
      <MotionTag
        ref={ref}
        initial={variants ? "hidden" : false}
        whileInView={variants ? "visible" : undefined}
        viewport={variants ? { once, margin } : undefined}
        {...props}
      >
        {children}
      </MotionTag>
    );
  }
);
Reveal.displayName = "Reveal";
