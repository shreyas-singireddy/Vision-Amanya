/**
 * AMNAYA Residence Architectural & 3D Contracts — Phase 1 Foundation.
 *
 * Establishes the authoritative architectural source of truth connecting:
 * RESIDENCE -> FLOOR PLAN -> ROOMS -> 3D REPRESENTATION
 *
 * All room IDs are stable and shared between 2D floor-plan overlays and 3D scene nodes.
 */

export type RoomType =
  | "living"
  | "drawing"
  | "dining"
  | "kitchen"
  | "utility"
  | "master-bedroom"
  | "bedroom"
  | "bathroom"
  | "balcony"
  | "sitout"
  | "dresser"
  | "puja"
  | "foyer"
  | "other";

export type RoomId =
  | "living-room"
  | "drawing-room"
  | "dining-area"
  | "kitchen"
  | "utility"
  | "master-bedroom"
  | "master-dresser"
  | "master-toilet"
  | "bedroom-2"
  | "bedroom-2-dresser"
  | "toilet-2"
  | "bedroom-3"
  | "bedroom-3-dresser"
  | "toilet-3"
  | "toilet-powder"
  | "puja-room"
  | "sitout-1"
  | "sitout-2"
  | "sitout-3"
  | "balcony-1"
  | "balcony-2"
  | "entrance-foyer";

export interface RoomDimensions {
  /** Metric dimensions in meters, e.g. "3.66 m X 3.96 m" or null if unmeasured */
  metric?: string;
  /** Imperial dimensions in feet/inches, e.g. "12' 0'' X 13' 0''" or null if unmeasured */
  imperial?: string;
  /** Length in meters if known from CAD */
  lengthM?: number;
  /** Width in meters if known from CAD */
  widthM?: number;
  /** Height in meters (defaults to standard luxury ceiling height 3.15m if unmeasured) */
  ceilingHeightM?: number;
}

export interface ArchitecturalRoom {
  /** Stable room identifier connecting 2D <-> 3D */
  id: RoomId;
  /** Display label e.g. "Master Bedroom" */
  name: string;
  /** Standard room category */
  type: RoomType;
  /** Authoritative dimensions from architectural source */
  dimensions: RoomDimensions;
  /** Architectural source attribution */
  source: "ARCHITECTURAL_FLOOR_PLAN" | "VERIFIED_PROJECT_DATA";
  /** Normalized 2D polygon or bounding box (0-1000 space) if mapped on floor plan */
  boundary2D?: {
    polygon: string;
    labelX: number;
    labelY: number;
  };
  /** 3D node / mesh name in the GLTF/GLB hierarchy */
  node3DReference?: string;
  /** Target camera position for this specific room in 3D */
  cameraPreset?: {
    position: [number, number, number];
    target: [number, number, number];
    fov?: number;
  };
  /** Description or key feature of the room */
  featureHighlight?: string;
}

export interface CameraPresetConfig {
  id: string;
  name: string;
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
  description?: string;
}

export interface Residence3DConfig {
  /** Path to production .glb or .gltf asset */
  modelUrl?: string;
  /** Fallback raster render if WebGL fails or asset is loading */
  fallbackImageUrl: string;
  /** Node mapping connecting RoomId to 3D scene node names */
  roomNodeMap: Partial<Record<RoomId, string>>;
  /** Camera presets available for this residence */
  cameraPresets: CameraPresetConfig[];
  /** Default camera preset on initial load */
  defaultPresetId: string;
  /** Whether verified CAD GLB geometry is currently available */
  hasVerifiedGLB: boolean;
}

export interface ArchitecturalResidence {
  /** Unique stable residence identity, e.g. "residence-3bhk-1715sqft" */
  id: string;
  /** Configuration label e.g. "3 BHK" */
  configuration: "3 BHK";
  /** Exact super built-up area in square feet */
  superBuiltUpAreaSqft: number;
  /** Exact built-up area in square meters */
  builtUpAreaSqm: number;
  /** Display title e.g. "3 BHK — 1,715 Sq.Ft." */
  title: string;
  /** Starting price in Indian Rupees formatting */
  priceStarting: string;
  /** Construction status */
  status: "New Launch" | "Under Construction" | "Ready";
  /** Possession timeline */
  possessionDate: string;
  /** RERA registration number */
  reraNumber: string;
  /** Authoritative 2D floor-plan raster asset path */
  floorPlanAssetUrl: string;
  /** Alternative text for screen readers */
  floorPlanAssetAlt: string;
  /** Facing orientation if defined */
  facing?: string;
  /** Primary view orientation if defined */
  view?: string;
  /** List of architectural rooms verified from the floor plan */
  rooms: ArchitecturalRoom[];
  /** 3D architectural configuration */
  config3D: Residence3DConfig;
}
