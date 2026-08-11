"use client";

/** `useScrollProgress` — a page/section scroll progress MotionValue.
 *
 * Returns the raw progress (0 → 1) plus an optional spring-smoothed copy.
 * `ref` can target a container; when omitted it tracks the whole page.
 */

import { useScroll, useSpring, type MotionValue } from "framer-motion";
import { useRef, type RefObject } from "react";
export interface ScrollProgressOptions {
  /** Target element; scroll progress runs across its full height. */
  target?: RefObject<HTMLElement | null>;
  /** Smooth the value with a spring (recommended for bars/rings). */
  smooth?: boolean;
  /** Spring stiffness when `smooth` is enabled. */
  stiffness?: number;
  /** Spring damping when `smooth` is enabled. */
  damping?: number;
}

export interface ScrollProgressResult {
  /** The container ref to attach when scrolling within an element. */
  ref: RefObject<HTMLElement | null>;
  /** Raw 0→1 progress. */
  progress: MotionValue<number>;
  /** Spring-smoothed 0→1 progress (identical to `progress` when disabled). */
  smoothProgress: MotionValue<number>;
}

export function useScrollProgress({
  target,
  smooth = true,
  stiffness = 90,
  damping = 24,
}: ScrollProgressOptions = {}): ScrollProgressResult {
  const fallbackRef = useRef<HTMLElement>(null);
  const scopeRef = (target ?? fallbackRef) as RefObject<HTMLElement | null>;

  const { scrollYProgress } = useScroll({
    target: scopeRef,
    offset: ["start start", "end end"],
  });

  // Always call the hook (rules-of-hooks); the spring is discarded when the
  // consumer opted out of smoothing.
  const springProgress = useSpring(scrollYProgress, { stiffness, damping });
  const smoothProgress = smooth ? springProgress : scrollYProgress;

  return { ref: scopeRef, progress: scrollYProgress, smoothProgress };
}
