/**
 * Animation variant factories — the shared vocabulary every motion primitive
 * is built from.
 *
 * All factories return `Variants` shaped as `hidden → visible` (or
 * `rest → hover`) pairs. Components wrap them and decide *when* to play
 * (whileInView, animate, whileHover). Reduced-motion consumers replace these
 * with a static fade via `motionSafeVariants`.
 *
 * Durations/easings come from the design tokens; distances/blur from
 * `tokens.ts`. Keep this file free of layout-only animation — transforms and
 * opacity only.
 */

import type { Variants } from "framer-motion";

import { easings } from "@constants/design-tokens";

export type BezierEasing = [number, number, number, number];

export type MotionDirection = "up" | "down" | "left" | "right";

/* --- Pure fade ------------------------------------------------------------ */

export function fadeVariant(duration = 0.5, ease: BezierEasing = easings.decelerate): Variants {
  return {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration, ease } },
  };
}

export function fadeOutVariant(duration = 0.3, ease: BezierEasing = easings.accelerate): Variants {
  return {
    visible: { opacity: 1 },
    exit: { opacity: 0, transition: { duration, ease } },
  };
}

/* --- Fade + directional offset -------------------------------------------- */

/**
 * Build a single-direction fade+offset reveal.
 *
 * @param distance travel distance in px (0 = pure fade)
 * @param duration seconds
 * @param ease     easing curve
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

export function fadeDownVariant(
  distance = 24,
  duration = 0.6,
  ease: BezierEasing = easings.decelerate
): Variants {
  return {
    hidden: { opacity: 0, y: -distance },
    visible: { opacity: 1, y: 0, transition: { duration, ease } },
  };
}

export function fadeLeftVariant(
  distance = 32,
  duration = 0.6,
  ease: BezierEasing = easings.decelerate
): Variants {
  return {
    hidden: { opacity: 0, x: distance },
    visible: { opacity: 1, x: 0, transition: { duration, ease } },
  };
}

export function fadeRightVariant(
  distance = 32,
  duration = 0.6,
  ease: BezierEasing = easings.decelerate
): Variants {
  return {
    hidden: { opacity: 0, x: -distance },
    visible: { opacity: 1, x: 0, transition: { duration, ease } },
  };
}

/** Directional fade by name — used by the `Fade*` component family. */
export function fadeDirectionVariant(
  direction: MotionDirection = "up",
  distance = 24,
  duration = 0.6,
  ease: BezierEasing = easings.decelerate
): Variants {
  const factory = {
    up: fadeUpVariant,
    down: fadeDownVariant,
    left: fadeLeftVariant,
    right: fadeRightVariant,
  }[direction];
  return factory(distance, duration, ease);
}

/** Delay a `hidden → visible` variant pair without mutating the source.
 *  Returns the input unchanged when `delay <= 0` so tokens can compose. */
export function withDelay(variants: Variants, delay: number): Variants {
  if (delay <= 0) return variants;
  const visible = variants.visible;
  if (!visible || typeof visible !== "object") return variants;
  return {
    ...variants,
    visible: { ...visible, transition: { ...(visible.transition ?? {}), delay } },
  };
}

/* --- Slide (offset travel) ------------------------------------------------ */

/**
 * Slide-in from a direction (for drawers/banners). The element travels the
 * full distance while fading, suited to larger surfaces.
 */
export function slideInVariant(
  direction: MotionDirection,
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

/** Directional slide by name — used by the `Slide*` component family. */
export function slideVariant(
  direction: MotionDirection = "up",
  distance = 40,
  duration = 0.5,
  ease: BezierEasing = easings.decelerate
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
      transition: { duration, ease },
    },
  };
}

/* --- Scale / zoom --------------------------------------------------------- */

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

export function scaleOutVariant(
  to = 0.96,
  duration = 0.25,
  ease: BezierEasing = easings.accelerate
): Variants {
  return {
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: to, transition: { duration, ease } },
  };
}

/** Zoom reveal — scale + optional defocus, for imagery and hero moments. */
export function zoomRevealVariant(
  from = 0.94,
  blur = 0,
  duration = 0.8,
  ease: BezierEasing = easings.outExpo
): Variants {
  return {
    hidden: {
      opacity: 0,
      scale: from,
      filter: blur > 0 ? `blur(${blur}px)` : undefined,
    },
    visible: {
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
      transition: { duration, ease },
    },
  };
}

/** Rotate + scale reveal for architectural/detail accents. */
export function rotateRevealVariant(
  angle = 4,
  duration = 0.7,
  ease: BezierEasing = easings.outExpo
): Variants {
  return {
    hidden: { opacity: 0, rotate: angle, scale: 0.98 },
    visible: {
      opacity: 1,
      rotate: 0,
      scale: 1,
      transition: { duration, ease },
    },
  };
}

/* --- Mask / clip reveals -------------------------------------------------- */

/**
 * Clip-path reveal for imagery — the media is revealed by a travelling mask.
 * `direction` is where the mask starts; combined with a child `scale` this is
 * the classic "luxury image reveal".
 */
export function clipRevealVariant(
  direction: MotionDirection = "up",
  duration = 0.9,
  ease: BezierEasing = easings.outExpo
): Variants {
  const from = {
    up: "inset(100% 0% 0% 0%)",
    down: "inset(0% 0% 100% 0%)",
    left: "inset(0% 100% 0% 0%)",
    right: "inset(0% 0% 0% 100%)",
  }[direction];

  return {
    hidden: { clipPath: from },
    visible: {
      clipPath: "inset(0% 0% 0% 0%)",
      transition: { duration, ease },
    },
  };
}

/* --- Stagger -------------------------------------------------------------- */

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

/* --- Shared exits --------------------------------------------------------- */

export const exitVariants: Variants = {
  exit: {
    opacity: 0,
    transition: { duration: 0.15, ease: easings.accelerate },
  },
};
