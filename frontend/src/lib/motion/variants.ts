/** Animation variant factories shared by the motion primitives. */

import type { Variants } from "framer-motion";

import { easings } from "@constants/design-tokens";

export type BezierEasing = [number, number, number, number];

/**
 * Build a single-direction fade+offset reveal.
 *
 * @param distance   travel distance in px (0 = pure fade)
 * @param duration   seconds
 * @param ease       easing curve
 */
export function fadeUpVariant(
  distance = 24,
  duration = 0.6,
  ease: BezierEasing = easings.decelerate
): Variants {
  return {
    hidden: { opacity: 0, y: distance },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration, ease },
    },
  };
}

/** Scale-in (used for modals, cards, imagery). */
export function scaleInVariant(
  from = 0.96,
  duration = 0.4,
  ease: BezierEasing = easings.emphasize
): Variants {
  return {
    hidden: { opacity: 0, scale: from },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration, ease },
    },
  };
}

/** Slide-in from a direction (for drawers/banners). */
export function slideInVariant(
  direction: "up" | "down" | "left" | "right",
  distance = 40,
  duration = 0.5
): Variants {
  const offset = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance },
  }[direction];

  return {
    hidden: { opacity: 0, ...offset },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { duration, ease: easings.decelerate },
    },
  };
}

/**
 * Stagger container + child for list/grid reveals.
 * Usage: `<motion.div variants={staggerContainer(0.08)}>` with children using
 * `fadeUpVariant()` as their `variants`.
 */
export function staggerContainer(staggerChildren = 0.08, delayChildren = 0.05): Variants {
  return {
    hidden: {},
    visible: {
      transition: { staggerChildren, delayChildren },
    },
  };
}

/** Shared exit variants for `AnimatePresence`. */
export const exitVariants: Variants = {
  exit: {
    opacity: 0,
    transition: { duration: 0.15, ease: easings.accelerate },
  },
};
