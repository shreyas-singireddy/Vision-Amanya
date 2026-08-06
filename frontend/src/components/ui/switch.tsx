"use client";

/** Switch — accessible toggle control (Radix primitives). */

import * as SwitchPrimitive from "@radix-ui/react-switch";
import { forwardRef } from "react";

import { cn } from "@utils/cn";

export const Switch = forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    className={cn(
      "peer inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-transparent bg-neutral-300 transition-colors duration-base ease-standard focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/15 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary-600 dark:bg-neutral-700",
      className
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb className="pointer-events-none block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-base ease-out-expo data-[state=checked]:translate-x-5" />
  </SwitchPrimitive.Root>
));
Switch.displayName = "Switch";
