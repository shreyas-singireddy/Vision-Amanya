/**
 * Hover variants — the interaction vocabulary.
 *
 * Rest → hover pairs for cards, buttons, links and imagery. All travel is
 * transform-based (GPU-composited), tuned to the design tokens
 * (`duration-slow` + `ease-out-expo`), and never exceeds the token scale.
 */

import type { Variants } from "framer-motion";

import { easings } from "@constants/design-tokens";

import { motionHover } from "./tokens";

/** Card/button lift — rises with a composed shadow implied by elevation. */
export function hoverLiftVariant(lift = motionHover.lift, duration = 0.45): Variants {
  return {
    rest: { y: 0, scale: 1 },
    hover: {
      y: lift,
      scale: 1.01,
      transition: { duration, ease: easings.outExpo },
    },
  };
}

/** Image zoom (1.00 → zoom) for media cards. */
export function hoverZoomVariant(zoom = motionHover.zoom, duration = 0.9): Variants {
  return {
    rest: { scale: 1 },
    hover: { scale: zoom, transition: { duration, ease: easings.outExpo } },
  };
}

/** Border/shadow emphasis for interactive surfaces. */
export function hoverElevateVariant(duration = 0.45): Variants {
  return {
    rest: {
      boxShadow: "0 1px 2px rgb(25 25 23 / 0.05), 0 12px 32px -16px rgb(13 33 26 / 0.18)",
    },
    hover: {
      boxShadow: "0 24px 48px -16px rgb(13 33 26 / 0.3)",
      transition: { duration, ease: easings.outExpo },
    },
  };
}

/** Gold glow emphasis (accent ring + shadow). */
export function hoverGlowVariant(duration = 0.5): Variants {
  return {
    rest: { boxShadow: "0 0 0 0px rgb(192 142 46 / 0)" },
    hover: {
      boxShadow: "0 0 0 4px rgb(192 142 46 / 0.16), 0 12px 32px -10px rgb(165 115 38 / 0.3)",
      transition: { duration, ease: easings.outExpo },
    },
  };
}

/** Gold underline draw (used by interactive links/buttons). */
export function underlineVariant(duration = 0.4): Variants {
  return {
    rest: { scaleX: 0, opacity: 0 },
    hover: {
      scaleX: 1,
      opacity: 1,
      transformOrigin: "0% 50%",
      transition: { duration, ease: easings.outExpo },
    },
  };
}

/** Icon travel — an arrow/glyph nudges forward on hover. */
export function iconShiftVariant(shift = motionHover.iconShift, duration = 0.35): Variants {
  return {
    rest: { x: 0 },
    hover: { x: shift, transition: { duration, ease: easings.outExpo } },
  };
}
