/**
 * Residence DTOs & Domain Contracts.
 *
 * Models individual residential units at Vision Amnaya, bridging backend `properties`
 * schema with Phase 6.6 architectural discovery capabilities.
 */

import type { ListingStatus } from "./enums";
import type { PropertyImage } from "./property";

export type TowerId = "Tower-A" | "Tower-B" | "Tower-C" | "Tower-D";
export type ViewOrientation = "Lake View" | "Garden View" | "City View" | "Dual Aspect";
export type ResidenceTypology = "3 BHK Type A" | "3 BHK Type B" | "3 BHK Type C";

export interface ResidenceSpecification {
  label: string;
  value: string;
  category?: "Architecture" | "Dimensions" | "Orientation" | "Possession";
  iconName?: string;
}

export interface UnitLocation {
  building: string;
  towerId: TowerId;
  floor: number;
  unitNumber: string;
  totalFloors: number;
  facing: string;
  view: ViewOrientation;
}

export interface UnitMedia {
  hero: string;
  gallery: PropertyImage[];
  unitPlanUrl: string;
  unitPlanAlt: string;
  floorPlanUrl: string;
  floorPlanAlt: string;
  virtual3DUrl?: string;
}

export interface Residence {
  id: string;
  slug: string;
  unitNumber: string;
  title: string;
  subtitle: string;
  summary: string;
  description: string;
  typology: ResidenceTypology;
  location: UnitLocation;
  listingStatus: ListingStatus;
  priceDisplay?: string;
  isPriceOnRequest: boolean;
  bedrooms: number;
  bathrooms: number;
  parkingSpaces: number;
  carpetAreaSqft: number;
  superBuiltUpAreaSqft: number;
  balconyDepthFt?: number;
  stiltClearanceFt?: number;
  possessionDate?: string;
  media: UnitMedia;
  specifications: ResidenceSpecification[];
  amenityHighlights: string[];
  isFeatured?: boolean;
}
