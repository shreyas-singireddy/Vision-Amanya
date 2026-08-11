"use client";

/** `useCounter` — count up to a target when the element scrolls into view.
 *
 * Returns a ref to attach to a wrapper plus a formatted string. Options allow
 * duration, easing, locale formatting and whether to start immediately (hero
 * stats) vs. on view (section stats). Set `disabled` (reduced motion) to snap
 * straight to the target.
 */

import { animate, useInView } from "framer-motion";
import { useEffect, useRef, useState, type RefObject } from "react";

export interface CounterOptions {
  /** Target number to reach. */
  to: number;
  /** Animate from this value. */
  from?: number;
  /** Duration in seconds. */
  duration?: number;
  /** Rounds to integers when true (default). */
  integer?: boolean;
  /** Locale for formatting (e.g. "en-IN" for lakh/crore grouping). */
  locale?: string;
  /** Additional formatting options (prefix/suffix go on the component). */
  formatOptions?: Intl.NumberFormatOptions;
  /** Start immediately instead of waiting for the viewport. */
  immediate?: boolean;
  /** Disable animation (reduced motion) — snaps to the target. */
  disabled?: boolean;
}

export interface CounterResult {
  /** Attach to the wrapper that triggers the count on view. */
  ref: RefObject<HTMLSpanElement | null>;
  /** The current formatted value. */
  value: string;
}

export function useCounter({
  to,
  from = 0,
  duration = 1.6,
  integer = true,
  locale = "en-IN",
  formatOptions,
  immediate = false,
  disabled = false,
}: CounterOptions): CounterResult {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const started = immediate || inView;

  const [display, setDisplay] = useState(() => formatCounter(disabled ? to : from));

  function formatCounter(value: number): string {
    const v = integer ? Math.round(value) : value;
    return new Intl.NumberFormat(locale, formatOptions).format(v);
  }

  useEffect(() => {
    if (disabled || !started) return;

    const controls = animate(from, to, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setDisplay(formatCounter(latest)),
    });

    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, to, duration, disabled, from]);

  return { ref, value: display };
}
