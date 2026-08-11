"use client";

/** `useParallax` — scroll-linked vertical travel for an element.
 *
 * Given an optional target ref (defaults to the element you attach `ref` to),
 * returns a `y` MotionValue that travels `speed * 100` px across the element's
 * scroll range. Positive speed drifts down; negative drifts up. Always clamp
 * values when consuming to avoid layout gaps (see `Parallax` component).
 */

import { useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef, type RefObject } from "react";

import { motionParallax, type MotionParallax } from "@lib/motion";

type ScrollOffsetOption = NonNullable<Parameters<typeof useScroll>[0]>["offset"];

export interface ParallaxOptions {
  /** Element to measure the scroll range against. */
  target?: RefObject<HTMLElement | null>;
  /** Travel strength — see `motionParallax`. */
  strength?: MotionParallax;
  /** Direct px travel (overrides `strength`). */
  distance?: number;
  /** Clamp the value to `±distance` (avoids revealing element edges). */
  clamp?: boolean;
  /** Offset window: `["start end", "end start"]` by default. */
  offset?: ScrollOffsetOption;
}

export interface ParallaxResult {
  /** Ref to attach to the animated element when no target is passed. */
  ref: RefObject<HTMLElement | null>;
  /** The computed Y MotionValue. */
  y: MotionValue<number>;
}

export function useParallax({
  target,
  strength = "default",
  distance,
  clamp = true,
  offset = ["start end", "end start"],
}: ParallaxOptions = {}): ParallaxResult {
  const fallbackRef = useRef<HTMLElement>(null);
  const scopeRef = (target ?? fallbackRef) as RefObject<HTMLElement | null>;

  const { scrollYProgress } = useScroll({
    target: scopeRef,
    offset,
  });

  const travel = distance ?? motionParallax[strength];

  const y = useTransform(scrollYProgress, [0, 1], [travel, -travel], {
    clamp,
  });

  return { ref: scopeRef, y };
}
