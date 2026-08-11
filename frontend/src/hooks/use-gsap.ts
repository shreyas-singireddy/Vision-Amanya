"use client";

/** `useGsap` — cinematic choreography hook backed by the lazy GSAP loader.
 *
 * GSAP + ScrollTrigger are only downloaded the first time this hook runs, and
 * the effect is skipped entirely under reduced motion (pass `enabled` to opt
 * in/out per component). Everything created inside the callback is reverted on
 * cleanup via `gsap.context`.
 *
 * Usage:
 *   useGsap((gsap) => {
 *     gsap.to(".stagger", { y: 0, stagger: 0.1 });
 *   }, [deps]);
 */

import { useEffect } from "react";

import { loadGsap, type GsapInstance } from "@lib/motion";

import { useReducedMotionPreference } from "./use-reduced-motion";

export interface UseGsapOptions {
  /** Disable the choreography entirely (default respects reduced motion). */
  enabled?: boolean;
}

export function useGsap(
  callback: (gsap: GsapInstance) => void | (() => void),
  deps: ReadonlyArray<unknown>,
  { enabled = true }: UseGsapOptions = {}
): void {
  const reduced = useReducedMotionPreference();
  const active = enabled && !reduced;

  useEffect(() => {
    if (!active) return;

    let cancelled = false;
    let dispose: (() => void) | undefined;

    loadGsap()
      .then((gsap) => {
        if (cancelled) return;

        const ctx = gsap.context(() => {
          const result = callback(gsap);
          if (typeof result === "function") dispose = result;
        });

        const previous = dispose;
        dispose = () => {
          previous?.();
          ctx.revert();
        };
      })
      .catch((error: unknown) => {
        if (process.env.NODE_ENV !== "production") {
          console.error("useGsap failed to load the cinematic engine", error);
        }
      });

    return () => {
      cancelled = true;
      dispose?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, active]);
}
