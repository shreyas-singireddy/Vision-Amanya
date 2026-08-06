"use client";

/** `useMediaQuery` — SSR-safe media-query hook with hydration guard. */

import { useSyncExternalStore } from "react";

import { breakpoints, type BreakpointToken } from "@constants/design-tokens";

const QUERY_CACHE = new Map<string, MediaQueryList>();

function queryFor(breakpoint: BreakpointToken): string {
  return `(min-width: ${breakpoints[breakpoint]}px)`;
}

function subscribe(query: string) {
  return (callback: () => void) => {
    const mql = QUERY_CACHE.get(query) ?? window.matchMedia(query);
    QUERY_CACHE.set(query, mql);
    mql.addEventListener("change", callback);
    return () => mql.removeEventListener("change", callback);
  };
}

function getSnapshot(query: string) {
  const mql = QUERY_CACHE.get(query) ?? window.matchMedia(query);
  QUERY_CACHE.set(query, mql);
  return mql.matches;
}

export function useMediaQuery(breakpoint: BreakpointToken): boolean {
  const query = queryFor(breakpoint);

  return useSyncExternalStore(
    subscribe(query),
    () => getSnapshot(query),
    () => false
  );
}

/** Shorthand helpers for the common breakpoints. */
export const useIsDesktop = () => useMediaQuery("lg");
export const useIsTablet = () => useMediaQuery("md");
