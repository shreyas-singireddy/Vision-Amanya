/**
 * Motion presets — named choreographies that bundle tokens into a single
 * configurable recipe.
 *
 * A preset defines the "feel" of an animation without dictating its shape:
 * duration, easing, travel distance, scale origin, blur and stagger. Use them
 * via `presetVariant(name)` or `useMotionPreset(name)` inside components. When
 * in doubt, default to `"luxury"` on marketing surfaces and `"fast"` for
 * utility UI.
 */

import type { Variants } from "framer-motion";

import { easings, type EasingToken } from "@constants/design-tokens";

import {
  motionBlur,
  motionDistance,
  motionRotate,
  motionScale,
  type MotionBlur,
  type MotionDistance,
  type MotionRotate,
  type MotionScale,
} from "./tokens";

export type MotionPresetName =
  "luxury" | "elegant" | "minimal" | "corporate" | "fast" | "premium" | "cinematic" | "editorial";

export interface MotionPreset {
  /** Total entrance duration in seconds. */
  duration: number;
  /** Easing curve token. */
  ease: EasingToken;
  /** Vertical travel distance token. */
  distance: MotionDistance;
  /** Scale origin token. */
  scale: MotionScale;
  /** Blur radius token. */
  blur: MotionBlur;
  /** Rotation token (deg). */
  rotate: MotionRotate;
  /** Per-child stagger delay in seconds (for containers). */
  stagger: number;
  /** Base delay in seconds before the entrance starts. */
  delay: number;
}

/** The eight named choreographies. Values are derived from the tokens. */
export const motionPresets: Record<MotionPresetName, MotionPreset> = {
  /** Flagship hero/cinematic moments — slow, composed, deliberate. */
  luxury: {
    duration: 1.1,
    ease: "outExpo",
    distance: "lg",
    scale: "subtle",
    blur: "md",
    rotate: "subtle",
    stagger: 0.16,
    delay: 0.1,
  },
  /** Refined editorial entrances for section-level reveals. */
  elegant: {
    duration: 0.9,
    ease: "outExpo",
    distance: "md",
    scale: "subtle",
    blur: "sm",
    rotate: "subtle",
    stagger: 0.12,
    delay: 0.05,
  },
  /** Barely-there motion for quiet, high-frequency surfaces. */
  minimal: {
    duration: 0.6,
    ease: "decelerate",
    distance: "sm",
    scale: "from",
    blur: "none",
    rotate: "subtle",
    stagger: 0.08,
    delay: 0,
  },
  /** Brisk, professional timing for functional UI. */
  corporate: {
    duration: 0.5,
    ease: "standard",
    distance: "xs",
    scale: "subtle",
    blur: "none",
    rotate: "subtle",
    stagger: 0.06,
    delay: 0,
  },
  /** Micro-interactions and high-fidelity feedback. */
  fast: {
    duration: 0.3,
    ease: "standard",
    distance: "xs",
    scale: "subtle",
    blur: "none",
    rotate: "subtle",
    stagger: 0.04,
    delay: 0,
  },
  /** Slightly heavier than elegant — rich, tactile surfaces. */
  premium: {
    duration: 0.8,
    ease: "emphasize",
    distance: "md",
    scale: "from",
    blur: "sm",
    rotate: "subtle",
    stagger: 0.1,
    delay: 0.04,
  },
  /** Long-form filmic reveals — wide travel, generous timing. */
  cinematic: {
    duration: 1.4,
    ease: "outExpo",
    distance: "2xl",
    scale: "strong",
    blur: "lg",
    rotate: "sm",
    stagger: 0.18,
    delay: 0.2,
  },
  /** Magazine-like reveals for galleries and long-copy sections. */
  editorial: {
    duration: 1.0,
    ease: "outExpo",
    distance: "xl",
    scale: "from",
    blur: "md",
    rotate: "subtle",
    stagger: 0.14,
    delay: 0.08,
  },
};

/** Resolve a preset name to a full `MotionPreset`. */
export function getMotionPreset(name: MotionPresetName): MotionPreset {
  return motionPresets[name];
}

/** Convenience — the default preset used across marketing surfaces. */
export const defaultMotionPreset: MotionPreset = motionPresets.luxury;

/**
 * Build a `hidden → visible` variant pair from a preset.
 *
 * The hidden state stacks opacity + a vertical offset + optional scale/blur.
 * Reduced-motion callers should replace this with a static fade (see
 * `src/components/motion/primitives.tsx`).
 */
export function presetVariant(name: MotionPresetName = "luxury"): Variants {
  const preset = motionPresets[name];
  const ease = easings[preset.ease];
  const offset = motionDistance[preset.distance];

  return {
    hidden: {
      opacity: 0,
      y: offset,
      scale: motionScale[preset.scale],
      rotate: motionRotate[preset.rotate],
      filter: preset.blur === "none" ? undefined : `blur(${motionBlur[preset.blur]}px)`,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      rotate: 0,
      filter: "blur(0px)",
      transition: {
        duration: preset.duration,
        ease,
        delay: preset.delay,
      },
    },
  };
}

/** Stagger container built from a preset's rhythm. */
export function presetContainer(name: MotionPresetName = "luxury"): Variants {
  const preset = motionPresets[name];
  return {
    hidden: {},
    visible: {
      transition: { staggerChildren: preset.stagger, delayChildren: preset.delay },
    },
  };
}
