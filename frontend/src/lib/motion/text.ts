/**
 * Text animation variants — typography choreography.
 *
 * Each headline primitive (`WordReveal`, `LetterReveal`, `LineReveal`, …)
 * splits its content into masked spans and drives them with these variants.
 * Lines/words use a Y travel with an `overflow-hidden` mask (the classic
 * "cinema caption" reveal); letters stagger through scale + Y.
 */

import type { Variants } from "framer-motion";

import { easings } from "@constants/design-tokens";

import type { BezierEasing } from "./variants";

/** Stagger container for a split headline. */
export function textContainer(staggerChildren = 0.06, delayChildren = 0.05): Variants {
  return {
    hidden: {},
    visible: {
      transition: { staggerChildren, delayChildren },
    },
  };
}

/** Word/line reveal — rise out of a mask while easing to rest. */
export function wordRevealVariant(
  distance = "110%",
  duration = 0.7,
  ease: BezierEasing = easings.outExpo
): Variants {
  return {
    hidden: { y: distance, opacity: 0 },
    visible: {
      y: "0%",
      opacity: 1,
      transition: { duration, ease },
    },
  };
}

/** Letter reveal — a gentle stagger cascade, scaled down first. */
export function letterRevealVariant(
  duration = 0.5,
  ease: BezierEasing = easings.outExpo
): Variants {
  return {
    hidden: { y: "0.6em", opacity: 0, rotate: 6, scale: 0.9 },
    visible: {
      y: 0,
      opacity: 1,
      rotate: 0,
      scale: 1,
      transition: { duration, ease },
    },
  };
}

/** Line reveal — full-height mask that slides away to uncover the text. */
export function lineMaskVariant(duration = 0.9, ease: BezierEasing = easings.outExpo): Variants {
  return {
    hidden: { clipPath: "inset(100% 0% 0% 0%)" },
    visible: {
      clipPath: "inset(0% 0% 0% 0%)",
      transition: { duration, ease },
    },
  };
}

/** Paragraph entrance — long-form copy rises gently into place. */
export function paragraphRevealVariant(
  distance = 24,
  duration = 0.8,
  ease: BezierEasing = easings.decelerate
): Variants {
  return {
    hidden: { opacity: 0, y: distance },
    visible: { opacity: 1, y: 0, transition: { duration, ease } },
  };
}

/** Highlight sweep — a gold marker draws across the text from the left. */
export function highlightSweepVariant(
  duration = 0.8,
  ease: BezierEasing = easings.outExpo
): Variants {
  return {
    hidden: { scaleX: 0 },
    visible: {
      scaleX: 1,
      transformOrigin: "0% 50%",
      transition: { duration, ease },
    },
  };
}

/** Gradient text shine — background position sweeps infinitely across a
 * `text-gradient-gold` element. Consumed via `animate` (not whileInView). */
export function gradientShineVariant(duration = 8): Variants {
  return {
    initial: { backgroundPosition: "200% center" },
    animate: {
      backgroundPosition: "-200% center",
      transition: { duration, repeat: Infinity, ease: "linear" },
    },
  };
}

/** Blank-overline mark that waits, then slides out to reveal the word. */
export function overlineDrawVariant(duration = 0.5): Variants {
  return {
    hidden: { scaleX: 0 },
    visible: {
      scaleX: 1,
      transformOrigin: "0% 50%",
      transition: { duration, ease: easings.outExpo },
    },
  };
}
