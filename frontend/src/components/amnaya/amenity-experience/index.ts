/**
 * amenity-experience/index.ts — Public exports for the 3D Amenities Experience.
 */

export { AmenityExperience3D } from "./AmenityExperience3D";
export type { AmenityExperience3DProps } from "./AmenityExperience3D";

export { AmenityMobileGrid } from "./AmenityMobileGrid";
export { AmenityNav } from "./AmenityNav";
export { AmenityDetailPanel } from "./AmenityDetailPanel";

export { useAmenityStore, useActiveAmenity } from "./amenity-store";
export {
  AMENITIES,
  AMENITY_CATEGORIES,
  getAmenitiesByCategory,
} from "./amenity-data";
export type { AmenityItem, AmenityCategory } from "./amenity-data";
