"use client";

/**
 * LuxuryButton — the premium architectural CTA.
 *
 * A pill-shaped button with architectural proportions, used only for primary
 * marketing calls to action on marketing and landing pages. It differs from
 * the utility `Button` component in:
 *
 *   - Pill shape (rounded-full) vs. rounded-md
 *   - Two visual modes: solid (accent/primary) and ghost (outline/light)
 *   - Hover: subtle lift (-2px translateY) + shadow reveal
 *   - An optional directional arrow that shifts on hover
 *   - Rendered as a `motion.button` so the hover physics are smooth
 *   - `asChild` support for rendering as a Next.js Link
 *
 * Keyboard accessibility: full keyboard focus ring, no reliance on hover.
 *
 * Design rules:
 *   - Max 2 LuxuryButtons per viewport: primary (accent) + secondary (ghost)
 *   - Do NOT use for utility actions (close, cancel, edit) — use `Button`
 *   - `size="lg"` is the canonical marketing proportion; only use "sm" for
 *     very tight layouts (mobile sticky bars)
 */

import { Slot } from "@radix-ui/react-slot";
import { motion } from "framer-motion";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

import { useReducedMotionPreference } from "@hooks/use-reduced-motion";

import { cn } from "@utils/cn";

export type LuxuryButtonVariant = "accent" | "primary" | "ghost" | "dark";
export type LuxuryButtonSize = "sm" | "md" | "lg";

export interface LuxuryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: LuxuryButtonVariant;
  size?: LuxuryButtonSize;
  /** Show a trailing directional arrow. */
  arrow?: boolean;
  /** Render as child element (e.g. Next.js Link). */
  asChild?: boolean;
  children?: ReactNode;
}

const variantClasses: Record<LuxuryButtonVariant, string> = {
  /** Bronze accent — the signature marketing CTA. */
  accent:
    "bg-accent-500 text-accent-950 hover:bg-accent-600 hover:shadow-glow-gold focus-visible:ring-accent-400/30",
  /** Emerald primary — secondary CTA that reads as brand. */
  primary:
    "bg-primary-600 text-white hover:bg-primary-700 hover:shadow-glow-primary focus-visible:ring-primary-500/30",
  /** Ghost — white/neutral border, for use over dark imagery. */
  ghost:
    "border border-neutral-50/25 bg-transparent text-neutral-50/85 backdrop-blur-sm hover:border-neutral-50/50 hover:bg-white/10 hover:text-neutral-50 focus-visible:ring-neutral-50/20",
  /** Dark — for light surfaces needing a dark/ink CTA. */
  dark: "bg-neutral-900 text-neutral-50 hover:bg-neutral-950 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white focus-visible:ring-neutral-500/30",
};

const sizeClasses: Record<LuxuryButtonSize, string> = {
  sm: "h-10 px-5 text-xs gap-2",
  md: "h-12 px-7 text-sm gap-2.5",
  lg: "h-14 px-9 text-sm gap-3",
};

export const LuxuryButton = forwardRef<HTMLButtonElement, LuxuryButtonProps>(
  (
    {
      variant = "accent",
      size = "lg",
      arrow = true,
      asChild = false,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const reduced = useReducedMotionPreference();

    const baseClasses = cn(
      "group inline-flex cursor-pointer select-none items-center justify-center rounded-full font-medium",
      "transition-[background-color,border-color,box-shadow,transform] duration-slow ease-standard",
      "focus-visible:outline-none focus-visible:ring-4",
      "disabled:pointer-events-none disabled:opacity-50",
      variantClasses[variant],
      sizeClasses[size],
      className
    );

    const content = (
      <>
        {children}
        {arrow && (
          <span
            aria-hidden
            className="inline-block transition-transform duration-300 ease-standard group-hover:translate-x-0.5"
          >
            →
          </span>
        )}
      </>
    );

    if (asChild) {
      return (
        <Slot ref={ref} className={baseClasses} {...props}>
          <span className="inline-flex items-center gap-[inherit]">{content}</span>
        </Slot>
      );
    }

    return (
      <motion.button
        ref={ref}
        disabled={disabled}
        className={baseClasses}
        whileHover={reduced ? undefined : { y: -2 }}
        whileTap={reduced ? undefined : { y: 0, scale: 0.985 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        {...(props as Record<string, unknown>)}
      >
        {content}
      </motion.button>
    );
  }
);
LuxuryButton.displayName = "LuxuryButton";
