"use client";

/**
 * MagneticButton — a CTA that gently follows the cursor.
 *
 * Wraps the `useMagnetic` hook and the `Button` component into a single
 * composable unit. The element is attracted toward the pointer within the
 * configured radius and springs back on leave.
 *
 * Design rules:
 *   - Only for PRIMARY marketing CTAs: "Explore Amnaya", "View Residences",
 *     "Schedule a Visit". Never for utility buttons or form controls.
 *   - Disabled on touch devices (pointer: coarse) automatically.
 *   - Disabled under `prefers-reduced-motion`.
 *   - Maximum translation is bounded by the `useMagnetic` radius (28px default).
 *   - Do NOT stack multiple magnetic buttons within close proximity.
 *
 * The component renders a `motion.div` wrapper so the magnetic spring travel
 * is isolated from the Button's internal transitions.
 */

import { motion } from "framer-motion";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

import { useReducedMotionPreference } from "@hooks/use-reduced-motion";
import { useIsDesktop } from "@hooks/use-media-query";
import { useMagnetic } from "@hooks/use-magnetic";

import { cn } from "@utils/cn";

export interface MagneticButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Attraction radius in px (default: 28). */
  radius?: number;
  /** Spring stiffness — higher = snappier. */
  stiffness?: number;
  /** Spring damping — higher = less oscillation. */
  damping?: number;
  children?: ReactNode;
}

export const MagneticButton = forwardRef<HTMLButtonElement, MagneticButtonProps>(
  (
    { radius, stiffness = 120, damping = 16, className, children, disabled, ...props },
    forwardedRef
  ) => {
    const reduced = useReducedMotionPreference();
    const isDesktop = useIsDesktop();
    const active = isDesktop && !reduced && !disabled;

    const {
      ref: magnetRef,
      onMouseMove,
      onMouseLeave,
      style,
    } = useMagnetic({
      radius,
      stiffness,
      damping,
    });

    // Merge the magnetic ref with the forwarded ref
    const setRef = (node: HTMLButtonElement | null) => {
      // Cast: useMagnetic uses HTMLElement internally
      (magnetRef as React.MutableRefObject<HTMLElement | null>).current = node;
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    };

    return (
      <motion.button
        ref={setRef}
        disabled={disabled}
        onMouseMove={active ? onMouseMove : undefined}
        onMouseLeave={active ? onMouseLeave : undefined}
        style={active ? style : undefined}
        className={cn(
          // Base: luxury pill button with accent bronze
          "group relative inline-flex cursor-pointer select-none items-center justify-center gap-2.5",
          "rounded-full bg-accent-500 px-8 py-4 text-sm font-medium text-accent-950",
          "transition-[background-color,box-shadow] duration-slow ease-standard",
          "hover:bg-accent-600 hover:shadow-glow-gold",
          "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent-400/30",
          "disabled:pointer-events-none disabled:opacity-50",
          // will-change only when magnetic is active
          active && "will-change-transform",
          className
        )}
        {...(props as Record<string, unknown>)}
      >
        {children}
        {/* Subtle arrow that shifts on hover */}
        <motion.span
          aria-hidden
          className="inline-block transition-transform duration-300 group-hover:translate-x-0.5"
        >
          →
        </motion.span>
      </motion.button>
    );
  }
);
MagneticButton.displayName = "MagneticButton";
