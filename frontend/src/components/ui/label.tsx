"use client";

/** Label — accessible form field label with optional required marker. */

import { Slot } from "@radix-ui/react-slot";
import { forwardRef, type LabelHTMLAttributes } from "react";

import { cn } from "@utils/cn";

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  asChild?: boolean;
  /** Show an asterisk + `aria-required`. */
  required?: boolean;
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, asChild = false, required = false, children, ...props }, ref) => {
    const Component = asChild ? Slot : "label";
    return (
      <Component
        ref={ref}
        aria-required={required || undefined}
        className={cn(
          "text-sm font-medium leading-none text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
          className
        )}
        {...props}
      >
        {children}
        {required ? (
          <span aria-hidden className="ml-0.5 text-accent-600 dark:text-accent-400">
            *
          </span>
        ) : null}
      </Component>
    );
  }
);
Label.displayName = "Label";
