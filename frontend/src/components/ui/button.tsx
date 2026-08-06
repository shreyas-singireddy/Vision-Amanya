"use client";

/** Button — the primary interactive primitive, with variant/style system.
 *
 * Supports `asChild` (Radix Slot) so it can render as a Link, action, etc.,
 * and a `loading` state that swaps in a spinner and disables interaction.
 */

import { Slot } from "@radix-ui/react-slot";
import { Loader2 } from "lucide-react";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

import { cn } from "@utils/cn";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "accent" | "danger" | "link";

type Size = "xs" | "sm" | "md" | "lg" | "xl" | "icon";

const base =
  "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-[color,background-color,border-color,box-shadow,transform] duration-base ease-standard focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 active:scale-[0.985]";

const variantClasses: Record<Variant, string> = {
  primary: "bg-primary-600 text-white shadow-sm hover:bg-primary-700 active:bg-primary-800",
  secondary:
    "bg-neutral-100 text-neutral-900 hover:bg-surface-active dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700",
  outline: "border border-border bg-transparent text-foreground hover:bg-surface-hover",
  ghost: "bg-transparent text-foreground hover:bg-surface-hover",
  accent: "bg-accent-500 text-accent-950 shadow-sm hover:bg-accent-600 active:bg-accent-700",
  danger: "bg-error-600 text-white hover:bg-error-700 active:bg-error-800",
  link: "p-0 text-primary-700 underline-offset-4 hover:underline dark:text-primary-400",
};

const sizeClasses: Record<Size, string> = {
  xs: "h-8 px-3 text-xs",
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-7 text-base",
  xl: "h-14 px-9 text-base",
  icon: "h-11 w-11",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  /** Render the button element as the passed child (e.g. `<Link>`). */
  asChild?: boolean;
  /** Show an inline spinner and block interaction. */
  loading?: boolean;
  /** Replaces the default spinner glyph when `loading`. */
  loadingLabel?: string;
  children?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      asChild = false,
      loading = false,
      loadingLabel = "Loading",
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const Component = asChild ? Slot : "button";
    const content = loading ? (
      <>
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        <span className="sr-only">{loadingLabel}</span>
        <span aria-hidden className="invisible">
          {children}
        </span>
      </>
    ) : (
      children
    );

    return (
      <Component
        ref={ref}
        aria-busy={loading || undefined}
        disabled={disabled || loading || undefined}
        className={cn(base, variantClasses[variant], sizeClasses[size], className)}
        {...props}
      >
        {content}
      </Component>
    );
  }
);
Button.displayName = "Button";
