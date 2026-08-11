"use client";

/** IconButton — square icon control (share, favourite, expand, close).
 * Smallest interactive unit; paired with a Tooltip for labelling. */

import { Slot } from "@radix-ui/react-slot";
import { forwardRef, type ButtonHTMLAttributes } from "react";

import { cn } from "@utils/cn";

type Size = "sm" | "md" | "lg";

type Variant = "ghost" | "soft" | "outline" | "solid" | "glass";

const sizeClasses: Record<Size, string> = {
  sm: "h-9 w-9 rounded-md",
  md: "h-10 w-10 rounded-lg",
  lg: "h-12 w-12 rounded-xl",
};

const iconSizeClasses: Record<Size, string> = {
  sm: "h-4 w-4",
  md: "h-[18px] w-[18px]",
  lg: "h-5 w-5",
};

const variantClasses: Record<Variant, string> = {
  ghost: "text-muted-foreground hover:bg-muted hover:text-foreground",
  soft: "bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground",
  outline:
    "border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
  solid: "bg-primary-600 text-white hover:bg-primary-700",
  glass: "glass text-neutral-50 hover:text-neutral-100",
};

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Icon component to render. */
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  size?: Size;
  variant?: Variant;
  /** Render as the passed child. */
  asChild?: boolean;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      className,
      icon: Icon,
      size = "md",
      variant = "ghost",
      asChild = false,
      type = "button",
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        type={type}
        className={cn(
          "inline-flex shrink-0 items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        {...props}
      >
        <Icon
          className={cn(iconSizeClasses[size], "[&>path]:stroke-[1.75]")}
          strokeWidth={1.75}
          aria-hidden
        />
      </Comp>
    );
  }
);
IconButton.displayName = "IconButton";
