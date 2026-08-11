"use client";

/** DateInput — calendar date field (native picker, luxury styling). Use for
 * visit scheduling, move-in dates and availability enquiries. */

import { CalendarDays } from "lucide-react";
import { forwardRef } from "react";

import { cn } from "@utils/cn";

export interface DateInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** Label shown as a floating/shrunk placeholder hint. */
  label?: string;
}

export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  ({ className, label, id, ...props }, ref) => (
    <div className="relative">
      <CalendarDays
        aria-hidden
        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
      />
      <input
        ref={ref}
        id={id}
        type="date"
        aria-label={label}
        className={cn(
          "h-11 w-full rounded-input border border-input bg-card pl-10 pr-4 text-sm text-foreground shadow-xs transition-[border-color,box-shadow,background-color] duration-fast ease-standard placeholder:text-muted-foreground hover:border-neutral-400 focus-visible:border-primary-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/15 aria-invalid:border-error-500 disabled:cursor-not-allowed disabled:opacity-50 [color-scheme:light] dark:[color-scheme:dark]",
          className
        )}
        {...props}
      />
    </div>
  )
);
DateInput.displayName = "DateInput";
