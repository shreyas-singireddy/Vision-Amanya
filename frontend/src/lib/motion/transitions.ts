/** Motion transition presets built on the design-token easings/durations. */

import type { Transition } from "framer-motion";

import { durations, easings, springs } from "@constants/design-tokens";

/** Timing for the subtle entrance of individual elements. */
export const transitionFast: Transition = {
  duration: durations.fast / 1000,
  ease: easings.decelerate,
};

/** Default motion timing for most UI transitions. */
export const transitionBase: Transition = {
  duration: durations.base / 1000,
  ease: easings.standard,
};

/** Slower, luxurious timing for hero/content reveals. */
export const transitionSlow: Transition = {
  duration: durations.slow / 1000,
  ease: easings.emphasize,
};

/** Timing for full-page transitions. */
export const transitionPage: Transition = {
  duration: durations.slow / 1000,
  ease: easings.decelerate,
};

/** Timing for modal/dialog entrances. */
export const transitionModal: Transition = {
  duration: durations.base / 1000,
  ease: easings.emphasize,
};

/** Timing for the exit of elements (faster than entrance). */
export const transitionExit: Transition = {
  duration: durations.fast / 1000,
  ease: easings.accelerate,
};

export const transitionSprings = springs;
