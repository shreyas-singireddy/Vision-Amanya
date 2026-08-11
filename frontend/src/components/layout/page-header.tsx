"use client";

/** PageHeader — the consistent intro band for every interior page.
 *
 * Composes the flagship `HeroReveal` choreography at a shorter height, always
 * in the inverted (dusk) voice: breadcrumbs + eyebrow, an `h1` headline, a
 * supporting lead, and optional actions. Content is supplied by the page so
 * no business copy lives here.
 *
 *   <PageHeader
 *     crumbs={[{ label: "Home", href: routes.home }, { label: "Amenities" }]}
 *     eyebrow="Amenities"
 *     title="Made for everyday living"
 *     lead="…"
 *     image={{ src: projectAssets.amenities, alt: "…" }}
 *   />
 */

import { Breadcrumbs, type Crumb } from "@components/ui/breadcrumbs";
import { Eyebrow, DisplayHeading } from "@components/ui/heading";
import { HeroReveal } from "@components/motion/hero-reveal";

import { cn } from "@utils/cn";
import type { ReactNode } from "react";

export interface PageHeaderProps {
  /** Breadcrumb trail (rendered inverted, above the eyebrow). */
  crumbs?: Crumb[];
  eyebrow?: string;
  /** Main page heading. */
  title: string;
  lead?: string;
  /** Background imagery for the band. */
  image?: { src: string; alt: string };
  /** Primary/secondary actions (render `Button`s). */
  actions?: ReactNode;
  /** Secondary detail — key facts strip, scroll cue, etc. */
  secondary?: ReactNode;
  /** Height of the band. */
  minHeight?: string;
  /** Horizontal alignment of the block. */
  align?: "left" | "center";
  className?: string;
}

export function PageHeader({
  crumbs,
  eyebrow,
  title,
  lead,
  image,
  actions,
  secondary,
  minHeight = "min-h-[52vh]",
  align = "left",
  className,
}: PageHeaderProps) {
  const center = align === "center";

  return (
    <HeroReveal
      background={image}
      align={align}
      minHeight={minHeight}
      className={className}
      eyebrow={
        eyebrow ? (
          <div className={cn("flex flex-col gap-4", center && "items-center")}>
            {crumbs && crumbs.length > 0 ? (
              <Breadcrumbs items={crumbs} inverted className={cn(center && "justify-center")} />
            ) : null}
            <Eyebrow className="text-accent-400">{eyebrow}</Eyebrow>
          </div>
        ) : crumbs && crumbs.length > 0 ? (
          <Breadcrumbs items={crumbs} inverted className={cn(center && "justify-center")} />
        ) : undefined
      }
      headline={
        <DisplayHeading as="h1" level={1} className="text-neutral-50">
          {title}
        </DisplayHeading>
      }
      subheading={
        lead ? (
          <p className={cn("text-lead text-neutral-50/70", center && "mx-auto")}>{lead}</p>
        ) : undefined
      }
      actions={
        actions ? (
          <div className={cn("flex flex-wrap gap-4", center && "justify-center")}>{actions}</div>
        ) : undefined
      }
      secondary={secondary}
    />
  );
}
