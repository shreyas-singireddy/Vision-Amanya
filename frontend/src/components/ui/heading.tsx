"use client";

/** Typographic primitives — the editorial heading system.
 *
 * Eyebrow  → small tracked uppercase kicker above a title.
 * SectionTitle → eyebrow + display title + optional lead paragraph (centered
 *                or left-aligned), the canonical section header block.
 * DisplayHeading → bare display type for custom compositions.
 */

import { forwardRef, type ElementType, type HTMLAttributes } from "react";

import { cn } from "@utils/cn";

/* --- Eyebrow -------------------------------------------------------------- */

export interface EyebrowProps extends HTMLAttributes<HTMLSpanElement> {
  /** Render the eyebrow as a different element (e.g. `div`, `p`). */
  as?: ElementType;
}

export const Eyebrow = forwardRef<HTMLSpanElement, EyebrowProps>(
  ({ className, as: Component = "span", ...props }, ref) => (
    <Component
      ref={ref}
      className={cn(
        "text-eyebrow font-medium uppercase tracking-eyebrow text-accent-600 dark:text-accent-400",
        className
      )}
      {...props}
    />
  )
);
Eyebrow.displayName = "Eyebrow";

/* --- Display heading ------------------------------------------------------ */

export interface DisplayHeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  /** Heading level for document outline. */
  as?: "h1" | "h2" | "h3" | "h4";
  /** Display scale step (1 = largest). */
  level?: 1 | 2 | 3 | 4;
}

const displaySize: Record<NonNullable<DisplayHeadingProps["level"]>, string> = {
  1: "text-display-1 sm:text-display-2 lg:text-display-1",
  2: "text-display-2 sm:text-display-3 lg:text-display-2",
  3: "text-display-3 sm:text-display-4 lg:text-display-3",
  4: "text-display-4 sm:text-display-4 lg:text-display-4",
};

export const DisplayHeading = forwardRef<HTMLHeadingElement, DisplayHeadingProps>(
  ({ className, as: Component = "h2", level = 2, ...props }, ref) => (
    <Component
      ref={ref}
      className={cn(
        "font-serif font-medium tracking-display text-foreground",
        displaySize[level],
        className
      )}
      {...props}
    />
  )
);
DisplayHeading.displayName = "DisplayHeading";

/* --- Section title -------------------------------------------------------- */

export interface SectionTitleProps extends HTMLAttributes<HTMLDivElement> {
  eyebrow?: string;
  /** Main heading text. */
  title: string;
  description?: string;
  /** Center the block (default) or align left. */
  align?: "center" | "left";
  as?: "h1" | "h2" | "h3";
}

export const SectionTitle = forwardRef<HTMLDivElement, SectionTitleProps>(
  ({ className, eyebrow, title, description, align = "center", as = "h2", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex flex-col gap-4",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className
      )}
      {...props}
    >
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <DisplayHeading as={as} level={2}>
        {title}
      </DisplayHeading>
      {description ? (
        <p className={cn("text-lead text-muted-foreground", align === "center" && "max-w-prose")}>
          {description}
        </p>
      ) : null}
    </div>
  )
);
SectionTitle.displayName = "SectionTitle";
