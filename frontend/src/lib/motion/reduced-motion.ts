/** Respect for `prefers-reduced-motion` — the app-wide animation switch. */

export interface ReducedMotionState {
  /** True when the OS requests reduced motion. */
  reduced: boolean;
}

/** Read the OS-level reduced-motion preference synchronously (browser only). */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Subscribe to changes in the reduced-motion preference. Returns unsubscribe. */
export function onReducedMotionChange(listener: (reduced: boolean) => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  const handle = (event: MediaQueryListEvent) => listener(event.matches);
  media.addEventListener("change", handle);
  return () => media.removeEventListener("change", handle);
}

/**
 * Neutralize motion values when the OS asks for reduced motion.
 * Pass the returned value as a `reduced` flag into motion primitives; they
 * disable transform/opacity animation when true.
 */
export function motionSafeVariants<T extends Record<string, unknown>>(variants: T): T {
  if (prefersReducedMotion()) {
    return Object.fromEntries(Object.entries(variants).map(([key]) => [key, { opacity: 1 }])) as T;
  }
  return variants;
}
