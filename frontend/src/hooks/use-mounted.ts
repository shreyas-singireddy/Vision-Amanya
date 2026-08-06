"use client";

/** `useMounted` — true once the component has hydrated on the client.
 *
 * Uses `useSyncExternalStore` so the value flips only after hydration,
 * which gates client-only UI (theme-dependent colours, portals) without
 * a hydration mismatch.
 */

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

export function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}
