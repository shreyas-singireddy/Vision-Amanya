"use client";

/** ToggleGroup — accessible single/multiple toggle set (Radix primitives). */

import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { forwardRef, type ReactElement } from "react";

import { cn } from "@utils/cn";

export const ToggleGroup = forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root>
>(({ className, ...props }, ref) => (
  <ToggleGroupPrimitive.Root
    ref={ref}
    className={cn(
      "inline-flex items-center gap-px overflow-hidden rounded-input border border-input bg-card p-1",
      className
    )}
    {...props}
  />
));
ToggleGroup.displayName = "ToggleGroup";

export const ToggleGroupItem = forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <ToggleGroupPrimitive.Item
    ref={ref}
    className={cn(
      "inline-flex h-9 items-center justify-center gap-2 rounded-input px-4 text-sm font-medium text-muted-foreground transition-colors duration-fast ease-standard hover:text-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/15 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-surface-hover data-[state=on]:text-foreground",
      className
    )}
    {...props}
  >
    {children as ReactElement}
  </ToggleGroupPrimitive.Item>
));
ToggleGroupItem.displayName = "ToggleGroupItem";
