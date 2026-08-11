"use client";

/** `useSmoothScroll` — Lenis-powered inertial scrolling for the whole page.
 *
 * One instance should live at the app root (a `<SmoothScroll>` provider).
 * It plays nicely with Framer Motion `useScroll` and GSAP ScrollTrigger.
 * Skipped entirely under reduced motion, where native scrolling is preserved.
 */

import Lenis from "lenis";
import { useEffect } from "react";

import { useReducedMotionPreference } from "./use-reduced-motion";

import { durations } from "@constants/design-tokens";

type LenisOptions = NonNullable<ConstructorParameters<typeof Lenis>[0]>;

export interface UseSmoothScrollOptions extends Omit<LenisOptions, "autoRaf" | "anchors"> {
  /** Skip smooth scrolling (reduced motion is always skipped). */
  enabled?: boolean;
  /** Attach to a scroll container instead of the window. */
  wrapper?: HTMLElement | Window;
}

/** Default Lenis duration aligned with `duration-slow` (400ms = 0.4s). */
const DEFAULT_LENIS_DURATION = durations.slow / 1000;

/** Default Lenis easing aligned with `ease-decelerate`. */
const DEFAULT_LENIS_EASING = (t: number) => 1 - Math.pow(1 - t, 3); // cubic-bezier(0, 0, 0.2, 1) approximation

export function useSmoothScroll({
  enabled = true,
  duration = DEFAULT_LENIS_DURATION,
  easing,
  ...lenisOptions
}: UseSmoothScrollOptions = {}): void {
  const reduced = useReducedMotionPreference();
  const active = enabled && !reduced;

  useEffect(() => {
    if (!active) return;

    const lenis = new Lenis({
      ...lenisOptions,
      duration,
      autoRaf: true,
      anchors: true,
      easing: easing ?? DEFAULT_LENIS_EASING,
    });

    // Lenis scrolls the window natively and emits native scroll events, so
    // Framer Motion `useScroll` and GSAP ScrollTrigger stay in sync without
    // any global override. A monkey-patched `window.scrollTo` would break
    // scroll restoration and hash navigation — deliberately not installed.

    return () => {
      lenis.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, duration]);
}
