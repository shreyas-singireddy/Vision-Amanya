/**
 * Floor Plan System DTOs — Phase 6.5 Interactive Floor Plans.
 *
 * Data-driven model bridging visual floor plan rendering with unit-level
 * discovery. All coordinates are normalized (0–1 float values mapped to an
 * abstract 1000×1000 stage) so the SVG overlay remains resolution-independent.
 *
 * When real Amnaya SVG/CAD floor-plan assets with embedded unit boundaries
 * become available, only the `config/floor-plans.ts` source needs updating —
 * the rendering system remains unchanged.
 */

import type { TowerId, ViewOrientation } from "./residence";

/** Availability status — mirrors the backend `ListingStatus` subset used by public visitors. */
export type UnitAvailability = "available" | "reserved" | "sold";

/** The plan format that describes how a floor plan is presented. */
export type FloorPlanFormat = "svg" | "raster";

/** Layout orientation of the building block. */
export type BlockOrientation =
  "North" | "North-East" | "East" | "South-East" | "South" | "South-West" | "West" | "North-West";

/** Normalized position of a unit boundary inside the 1000×1000 stage. */
export interface UnitBoundary {
  /** Unit label anchored at a fixed position (normalized 0–1). */
  labelX: number;
  labelY: number;
  /** Rough normalized area engagement (avg of polygon points) for touch fallback. */
  centroidX: number;
  centroidY: number;
  /** Normalized polygon points covering the unit footprint. */
  polygon: string;
}

/** A unit (apartment) rendered on a floor plan stage. */
export interface FloorPlanUnit {
  /** Stable identifier e.g. `A-1204`. */
  id: string;
  /** Human unit number, e.g. `1204`. */
  unitNumber: string;
  /** Availability state (not a backend hardcode). */
  availability: UnitAvailability;
  /** Displayed configuration, e.g. "3 BHK Type B". */
  typology: string;
  /** Verified carpet area in sq.ft. */
  carpetAreaSqft: number;
  /** Verified super built-up area in sq.ft. */
  superBuiltUpAreaSqft: number;
  /** Verified facing direction. */
  facing: string;
  /** Verified primary orientation. */
  view: ViewOrientation;
  /** Normalized boundary for the interactive overlay. */
  boundary: UnitBoundary;
}

/** A floor within a building. */
export interface FloorPlanFloor {
  /** Stable floor identifier. */
  id: string;
  /** Display floor number, e.g. `12`. */
  floorNumber: number;
  /** Label shown in the floor selector, e.g. "Floor 12". */
  label: string;
  /** Raster source for the underlying plan image (verified asset path). */
  assetUrl: string;
  /** Alternative text description of the plan image. */
  assetAlt: string;
  /** Source format — `svg` when a vector asset is provided. */
  kind: FloorPlanFormat;
  /** SVG viewBox of the plan when `kind === 'svg'`. */
  viewBox?: string;
  /** The interactive unit inventory for this floor. */
  units: FloorPlanUnit[];
}

/** A residential tower / building. */
export interface FloorPlanBuilding {
  /** Tower slug e.g. `Tower-A`. */
  id: TowerId;
  /** Display name e.g. "Tower A". */
  name: string;
  /** Short facade label e.g. "A". */
  shortLabel: string;
  /** Total number of floors in the building. */
  totalFloors: number;
  /** Verified floors with plans. */
  floors: FloorPlanFloor[];
}

/** The complete development legacy dataset. */
export interface FloorPlanDataset {
  /** Project name — always "Amnaya". */
  projectName: string;
  /** Official project short descriptor. */
  projectDescription: string;
  /** Buildings in the development. */
  buildings: FloorPlanBuilding[];
}

/** Analytics horizon events exposed for Phase 7. */
export type FloorPlanAnalyticsEvent =
  | "floor_plan_opened"
  | "building_selected"
  | "floor_selected"
  | "unit_hovered"
  | "unit_selected"
  | "unit_details_opened"
  | "unit_3d_opened"
  | "unit_share_clicked"
  | "enquiry_clicked"
  | "site_visit_clicked";

export interface FloorPlanAnalyticsPayload {
  buildingId?: string;
  floorId?: string;
  unitId?: string;
  [key: string]: unknown;
}
