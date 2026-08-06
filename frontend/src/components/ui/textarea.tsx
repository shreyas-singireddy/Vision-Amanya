"use client";

/** Textarea — multi-line text input with the same luxury treatment as Input. */

import { forwardRef, type TextareaHTMLAttributes } from "react";

import { cn } from "@utils/cn";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-24 w-full rounded-input border border-input bg-card px-4 py-3 text-sm text-foreground shadow-xs transition-[border-color,box-shadow,background-color] duration-fast ease-standard placeholder:text-muted-foreground hover:border-neutral-400 focus-visible:border-primary-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/15 aria-invalid:border-error-500 aria-invalid:focus-visible:ring-error-500/15 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
