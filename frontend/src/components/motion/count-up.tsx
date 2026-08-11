"use client";

/** CountUp — animates a number to its target when it scrolls into view.
 *
 * Built on `useCounter` (framer-motion `animate`). Supports integers and
 * decimals, prefixes/suffixes and locale formatting. Project statistics are
 * passed in by the page — this component never hardcodes Amnaya data.
 * Reduced motion snaps straight to the target value.
 */

import { forwardRef } from "react";

import { useCounter } from "@hooks/use-counter";

import { cn } from "@utils/cn";

export interface CountUpProps {
  /** Target number. */
  to: number;
  /** Start value (default 0). */
  from?: number;
  /** Duration in seconds. */
  duration?: number;
  /** Decimal places (default 0 = integer). */
  decimals?: number;
  /** Prefix, e.g. "₹". */
  prefix?: string;
  /** Suffix, e.g. "acres" or "%". */
  suffix?: string;
  /** Locale for number grouping (default en-IN). */
  locale?: string;
  /** Additional Intl formatting options (overrides `decimals`). */
  formatOptions?: Intl.NumberFormatOptions;
  /** Start immediately instead of waiting for the viewport. */
  immediate?: boolean;
  /** Class applied to the value span. */
  className?: string;
}

export const CountUp = forwardRef<HTMLSpanElement, CountUpProps>(
  (
    {
      to,
      from,
      duration = 1.6,
      decimals = 0,
      prefix = "",
      suffix = "",
      locale = "en-IN",
      formatOptions,
      immediate = false,
      className,
    },
    ref
  ) => {
    const { ref: counterRef, value } = useCounter({
      to,
      from,
      duration,
      integer: decimals === 0,
      locale,
      immediate,
      formatOptions:
        formatOptions ??
        (decimals > 0
          ? { minimumFractionDigits: decimals, maximumFractionDigits: decimals }
          : undefined),
    });

    return (
      <span
        ref={(node) => {
          counterRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        className={cn("numeric", className)}
      >
        {prefix}
        {value}
        {suffix}
      </span>
    );
  }
);
CountUp.displayName = "CountUp";
