"use client";

/** SmoothScrollProvider — mounts Lenis at the app root.
 *
 * This component isolates the Lenis side-effect so RootProvider stays clean.
 * It also exposes the Lenis instance via context for advanced consumers.
 */

import { createContext, useContext, type PropsWithChildren, type ReactNode } from "react";

import { useReducedMotionPreference } from "@hooks/use-reduced-motion";
import { useSmoothScroll } from "@hooks/use-smooth-scroll";

interface SmoothScrollContextValue {
  /** Whether smooth scrolling is currently active. */
  isActive: boolean;
}

const SmoothScrollContext = createContext<SmoothScrollContextValue | null>(null);

/** Access the smooth scroll context (returns null if not wrapped). */
export function useSmoothScrollContext(): SmoothScrollContextValue | null {
  return useContext(SmoothScrollContext);
}

interface SmoothScrollProviderProps extends PropsWithChildren {
  /** Override the default options. */
  options?: Parameters<typeof useSmoothScroll>[0];
}

/** Provider that mounts Lenis once at the root. */
export function SmoothScrollProvider({
  children,
  options = {},
}: SmoothScrollProviderProps): ReactNode {
  // Derived (not stateful) so reduced-motion changes propagate without an effect.
  const reduced = useReducedMotionPreference();
  const isActive = (options.enabled ?? true) && !reduced;

  // Mount Lenis via the hook (the hook skips itself under reduced motion).
  useSmoothScroll(options);

  return (
    <SmoothScrollContext.Provider value={{ isActive }}>{children}</SmoothScrollContext.Provider>
  );
}
