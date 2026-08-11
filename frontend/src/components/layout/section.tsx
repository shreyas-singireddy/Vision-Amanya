"use client";

/** Section — the vertical rhythm unit of every page.
 *
 * A page is a stack of `Section`s. Each section owns its vertical padding
 * (token-driven), surface tone and content width, so pages compose a calm,
 * consistent editorial rhythm without repeating layout classes.
 *
 *   <Section id="location" tone="dark" spacing="lg">
 *     <SectionHeader eyebrow="Location" title="A quiet edge of the city" … />
 *     …
 *   </Section>
 */

import { forwardRef, type HTMLAttributes } from "react";

import { Container, type ContainerProps } from "@components/ui/container";
import { SectionTitle } from "@components/ui/heading";

import { cn } from "@utils/cn";

type Tone = "light" | "subtle" | "dark";
type Spacing = "sm" | "default" | "lg";

const toneClasses: Record<Tone, string> = {
  light: "bg-background text-foreground",
  subtle: "bg-surface-subtle text-foreground",
  dark: "bg-grad-dusk text-neutral-50",
};

const spacingClasses: Record<Spacing, string> = {
  sm: "py-section-sm",
  default: "py-section",
  lg: "py-section-lg",
};

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  /** Anchor id for in-page navigation / deep links. */
  id?: string;
  /** Vertical breathing room (sm 4rem / default 6rem / lg 8rem). */
  spacing?: Spacing;
  /** Surface tone. `dark` is the cinematic navy band. */
  tone?: Tone;
  /** Content width (default `page`). Use `flush` to own the layout. */
  container?: ContainerProps["size"];
  /** Omit the `Container` wrapper for edge-to-edge compositions. */
  flush?: boolean;
}

export const Section = forwardRef<HTMLElement, SectionProps>(
  (
    {
      className,
      id,
      spacing = "default",
      tone = "light",
      container = "page",
      flush = false,
      children,
      ...props
    },
    ref
  ) => (
    <section
      ref={ref}
      id={id}
      className={cn("relative", toneClasses[tone], spacingClasses[spacing], className)}
      {...props}
    >
      {flush ? children : <Container size={container}>{children}</Container>}
    </section>
  )
);
Section.displayName = "Section";

/** SectionHeader — the canonical section intro block (eyebrow + title + lead). */
export interface SectionHeaderProps extends HTMLAttributes<HTMLDivElement> {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
  as?: "h1" | "h2" | "h3";
  /** Content width (default `page`). */
  container?: ContainerProps["size"];
  /** Show the block in the inverted (dark section) voice. */
  inverted?: boolean;
}

export function SectionHeader({
  className,
  eyebrow,
  title,
  description,
  align = "center",
  as = "h2",
  container = "page",
  inverted = false,
  ...props
}: SectionHeaderProps) {
  return (
    <Container size={container} className={className} {...props}>
      <SectionTitle
        eyebrow={eyebrow}
        title={title}
        description={description}
        align={align}
        as={as}
        inverted={inverted}
      />
    </Container>
  );
}
