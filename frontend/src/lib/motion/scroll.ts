/**
 * Scroll variants — named reveals for the scroll library.
 *
 * These back the `ScrollReveal` component and its directional variants
 * (`FadeOnScroll`, `RevealOnScroll`, `SlideOnScroll`, `ScaleOnScroll`). They
 * are `whileInView`-shaped pairs; scroll-driven *transform* effects (parallax)
 * belong to `hooks/use-parallax.ts`.
 */

import type { Variants } from "framer-motion";

import { easings } from "@constants/design-tokens";

import type { MotionDirection } from "./variants";

/** Fade only — the most conservative on-scroll reveal. */
export function scrollFadeVariant(duration = 0.6): Variants {
  return {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration, ease: easings.decelerate } },
  };
}

/** Fade + travel — the workhorse reveal. `distance=0` degenerates to a fade. */
export function scrollRevealVariant(
  direction: MotionDirection = "up",
  distance = 32,
  duration = 0.7
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
      transition: { duration, ease: easings.outExpo },
    },
  };
}

/** Slide (no opacity fade) — used where the mask/metaphor carries meaning. */
export function scrollSlideVariant(
  direction: MotionDirection = "up",
  distance = 48,
  duration = 0.6
): Variants {
  const offset = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance },
  }[direction];

  return {
    hidden: { ...offset },
    visible: {
      x: 0,
      y: 0,
      transition: { duration, ease: easings.decelerate },
    },
  };
}

/** Scale-based reveal for imagery and grids. */
export function scrollScaleVariant(from = 0.96, duration = 0.7): Variants {
  return {
    hidden: { opacity: 0, scale: from },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration, ease: easings.outExpo },
    },
  };
}

/** Stagger container for scroll-revealed grids. */
export function scrollStaggerVariant(staggerChildren = 0.08, delayChildren = 0.05): Variants {
  return {
    hidden: {},
    visible: {
      transition: { staggerChildren, delayChildren },
    },
  };
}
