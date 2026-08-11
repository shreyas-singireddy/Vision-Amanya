/**
 * GSAP loader — keeps the cinematic engine out of the initial bundle.
 *
 * GSAP + ScrollTrigger are downloaded lazily on first use (pinned sections,
 * horizontal scroll), so pages that only use Framer Motion never pay for them.
 * All cinematic features must go through `loadGsap()` or the `useGsap` hook —
 * never a static `import "gsap"`.
 *
 * The loader respects the design rule that GSAP is reserved for cinematic
 * scroll choreography that Framer Motion cannot express cleanly.
 */

import type * as GsapNamespace from "gsap";

export type GsapInstance = typeof GsapNamespace.gsap;

let gsapPromise: Promise<GsapInstance> | null = null;

/** Load (once) and return the configured GSAP instance with ScrollTrigger. */
export function loadGsap(): Promise<GsapInstance> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("GSAP is a client-only engine."));
  }

  gsapPromise ??= Promise.all([
    import("gsap").then((mod) => mod.gsap),
    import("gsap/ScrollTrigger").then((mod) => mod.ScrollTrigger),
  ]).then(([gsap, ScrollTrigger]) => {
    gsap.registerPlugin(ScrollTrigger);
    return gsap;
  });

  return gsapPromise;
}

/** True when the cinematic bundle has already been fetched. */
export function isGsapLoaded(): boolean {
  return gsapPromise !== null;
}
