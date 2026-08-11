"use client";

/** Reactive `prefers-reduced-motion` — the app-wide animation switch.
 *
 * Returns `true` when the OS requests reduced motion. Unlike the static
 * `prefersReducedMotion()` helper, this stays in sync while the app runs, so
 * components can update their choreography live.
 */

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

let mql: MediaQueryList | null = null;

function getMql(): MediaQueryList | null {
  if (typeof window === "undefined") return null;
  mql ??= window.matchMedia(QUERY);
  return mql;
}

function subscribe(callback: () => void): () => void {
  const media = getMql();
  if (!media) return () => undefined;
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function getSnapshot(): boolean {
  return getMql()?.matches ?? false;
}

export function useReducedMotionPreference(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
