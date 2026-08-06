"use client";

/** Input — base text input with luxury focus treatment.
 *
 * Composes a hairline border, soft hover and an emerald focus ring. Use
 * inside `<Field>` for label + hint + error wiring.
 */

import { forwardRef, type InputHTMLAttributes } from "react";

import { cn } from "@utils/cn";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = "text", ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-11 w-full rounded-input border border-input bg-card px-4 text-sm text-foreground shadow-xs transition-[border-color,box-shadow,background-color] duration-fast ease-standard placeholder:text-muted-foreground hover:border-neutral-400 focus-visible:border-primary-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/15 aria-invalid:border-error-500 aria-invalid:focus-visible:ring-error-500/15 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
