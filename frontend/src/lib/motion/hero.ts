/**
 * Hero variants — the luxury entrance sequence.
 *
 * The hero is a layered system: background settles, overlay fades, then the
 * content items (eyebrow → headline → sub → CTAs) rise in a staggered,
 * deliberate order. Layers respond to pointer movement via
 * `components/motion/hero-reveal.tsx` (`HeroDepth`).
 */

import type { Variants } from "framer-motion";

import { easings } from "@constants/design-tokens";

import { motionDistance, motionScale, motionBlur } from "./tokens";
import type { MotionPresetName } from "./presets";
import { motionPresets } from "./presets";

/** Container that sequences the hero children. */
export function heroContainerVariant(staggerChildren = 0.14, delayChildren = 0.25): Variants {
  return {
    hidden: {},
    visible: {
      transition: { staggerChildren, delayChildren },
    },
  };
}

/** A single hero content item — rises, sharpens, settles. */
export function heroItemVariant(preset: MotionPresetName = "luxury", delay = 0): Variants {
  const p = motionPresets[preset];
  return {
    hidden: {
      opacity: 0,
      y: motionDistance[p.distance],
      scale: motionScale[p.scale],
      filter: p.blur === "none" ? undefined : `blur(${motionBlur[p.blur]}px)`,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: { duration: p.duration, ease: easings[p.ease], delay },
    },
  };
}

/** Background layer — gentle Ken Burns settle on first paint. */
export function heroBackgroundVariant(duration = 2.2): Variants {
  return {
    hidden: { scale: 1.12 },
    visible: {
      scale: 1,
      transition: { duration, ease: easings.outExpo },
    },
  };
}

/** Overlay fade-in above the background, below the content. */
export function heroOverlayVariant(duration = 1.4, delay = 0.1): Variants {
  return {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration, ease: easings.decelerate, delay } },
  };
}

/** Eyebrow rule — a gold hairline draws across before the type arrives. */
export function heroRuleVariant(duration = 0.9, delay = 0): Variants {
  return {
    hidden: { scaleX: 0 },
    visible: {
      scaleX: 1,
      transformOrigin: "0% 50%",
      transition: { duration, ease: easings.outExpo, delay },
    },
  };
}
