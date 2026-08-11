"use client";

/** `useScrollDirection` — tells the caller whether the user is scrolling up
 * or down. Used by the hide-on-scroll navigation behaviour.
 */

import { useEffect, useState } from "react";

export type ScrollDirection = "up" | "down";

export interface ScrollDirectionOptions {
  /** Distance in px before the direction flips (debounces jitter). */
  threshold?: number;
}

export function useScrollDirection({
  threshold = 10,
}: ScrollDirectionOptions = {}): ScrollDirection {
  const [direction, setDirection] = useState<ScrollDirection>("up");

  useEffect(() => {
    let lastY = window.scrollY;

    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastY;
      if (Math.abs(delta) < threshold) return;
      setDirection(delta > 0 ? "down" : "up");
      lastY = y;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return direction;
}
