/**
 * AMNAYA-specific components — the luxury real-estate design vocabulary.
 *
 * These components are distinct from the generic `@components/ui` library.
 * They encode the AMNAYA brand, architectural aesthetic, and marketing
 * experience. Use them only in the marketing/public-facing pages.
 *
 * DO NOT import AMNAYA components into the admin dashboard, property
 * management flows, or utility UI — use `@components/ui` for those.
 *
 * @see docs/AMNAYA_DESIGN_SYSTEM.md for the full component catalogue.
 */

export { HorizontalLine } from "./horizontal-line";
export type { HorizontalLineProps } from "./horizontal-line";

export { ScrollIndicator } from "./scroll-indicator";
export type { ScrollIndicatorProps } from "./scroll-indicator";

export { ArchitecturalGrid } from "./architectural-grid";
export type {
  ArchitecturalGridProps,
  ArchitecturalGridVariant,
  ArchitecturalGridSurface,
} from "./architectural-grid";

export { MagneticButton } from "./magnetic-button";
export type { MagneticButtonProps } from "./magnetic-button";

export { LuxuryButton } from "./luxury-button";
export type { LuxuryButtonProps, LuxuryButtonVariant, LuxuryButtonSize } from "./luxury-button";

export { SectionHeading } from "./section-heading";
export type { SectionHeadingProps } from "./section-heading";

export { CursorFollower } from "./cursor-follower";
export type { CursorState } from "./cursor-follower";
