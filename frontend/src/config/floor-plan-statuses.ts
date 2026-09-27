/**
 * Floor Plan Status Configuration — the single source of truth for unit
 * availability presentation.
 *
 * Centralizes label, visual treatment and interaction policy rather than
 * hardcoding colors/behaviour across the UI. Statuses mirror the backend
 * `ListingStatus` subset (`available` | `reserved` | `sold`) exposed to public
 * visitors. When the backend defines additional statuses, extend this map and
 * the strict `UnitAvailability` type together.
 */

import type { UnitAvailability } from "@domain/floor-plan";

export interface UnitStatusConfig {
  /** Machine-readable status. */
  id: UnitAvailability;
  /** Human label shown in legend, badges and accessible list. */
  label: string;
  /** Accessible description of what the status means. */
  description: string;
  /** Whether the unit can be selected / enquired. */
  selectable: boolean;
  /**
   * Tailwind classes for the status badge. Do not rely on colour alone —
   * every status also carries a distinct label + pattern/icon.
   */
  badgeClass: string;
  /** Fill used on the SVG overlay when the status is inactive/unselected. */
  fillClass: string;
  /** Stroke used for hover/selected emphasis. */
  strokeClass: string;
}

export const UNIT_STATUS_CONFIG: Record<UnitAvailability, UnitStatusConfig> = {
  available: {
    id: "available",
    label: "Available",
    description: "This residence is currently available for enquiry.",
    selectable: true,
    badgeClass: "bg-success-600 text-white",
    fillClass: "fill-primary-200/70 dark:fill-primary-900/50",
    strokeClass: "stroke-primary-600 dark:stroke-primary-400",
  },
  reserved: {
    id: "reserved",
    label: "Reserved",
    description: "This residence has been reserved. Enquire for similar options.",
    selectable: false,
    badgeClass: "bg-accent-600 text-accent-950",
    fillClass: "fill-accent-200/70 dark:fill-accent-900/50",
    strokeClass: "stroke-accent-600 dark:stroke-accent-400",
  },
  sold: {
    id: "sold",
    label: "Sold",
    description: "This residence has been sold.",
    selectable: false,
    badgeClass: "bg-neutral-700 text-neutral-100",
    fillClass: "fill-neutral-200/60 dark:fill-neutral-800/40",
    strokeClass: "stroke-neutral-500 dark:stroke-neutral-500",
  },
};

/** Ordered statuses for the legend display. */
export const UNIT_STATUS_ORDER: readonly UnitAvailability[] = [
  "available",
  "reserved",
  "sold",
] as const;

/** Tabular accessibility label for a unit card / row. */
export function unitAccessibilityLabel(
  unitNumber: string,
  typology: string,
  areaSqft: number,
  availability: UnitAvailability
): string {
  const status = UNIT_STATUS_CONFIG[availability].label;
  return `Unit ${unitNumber}, ${typology}, ${areaSqft.toLocaleString("en-IN")} square feet, ${status.toLowerCase()}.`;
}

/** Legend chip icon key map for non-colour status signalling. */
export const STATUS_LEGEND_MARK: Record<UnitAvailability, string> = {
  available: "●",
  reserved: "◐",
  sold: "○",
};
