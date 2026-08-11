/**
 * CTA architecture — the single source of truth for conversion calls.
 *
 * Amnaya uses a small, consistent vocabulary of actions. Pages compose these
 * labels/hrefs instead of inventing new CTAs, so the conversion experience
 * stays calm and coherent. Primary = enquire; secondary = schedule a visit.
 */

import { routes } from "@constants/routes";

export interface CtaDefinition {
  label: string;
  href: string;
  /** `Button` variant used for the primary moment. */
  variant: "primary" | "accent" | "outline" | "ghost" | "link";
}

/** The two headline actions. Everything else links onward, not upward. */
export const ctaConfig = {
  enquire: {
    label: "Enquire",
    href: routes.contact,
    variant: "accent",
  } satisfies CtaDefinition,
  enquireNow: {
    label: "Enquire Now",
    href: routes.contact,
    variant: "accent",
  } satisfies CtaDefinition,
  scheduleSiteVisit: {
    label: "Schedule a Site Visit",
    href: routes.contact,
    variant: "primary",
  } satisfies CtaDefinition,
  exploreProject: {
    label: "Explore the Project",
    href: routes.project,
    variant: "outline",
  } satisfies CtaDefinition,
  viewResidences: {
    label: "View Residences",
    href: routes.properties,
    variant: "outline",
  } satisfies CtaDefinition,
  discoverAmenities: {
    label: "Discover Amenities",
    href: routes.amenities,
    variant: "outline",
  } satisfies CtaDefinition,
  viewMasterplan: {
    label: "View Masterplan",
    href: routes.masterplan,
    variant: "outline",
  } satisfies CtaDefinition,
  viewGallery: {
    label: "View Gallery",
    href: routes.gallery,
    variant: "outline",
  } satisfies CtaDefinition,
  aboutDeveloper: {
    label: "About Vision Infra",
    href: routes.about,
    variant: "outline",
  } satisfies CtaDefinition,
} as const;

export type CtaKey = keyof typeof ctaConfig;
