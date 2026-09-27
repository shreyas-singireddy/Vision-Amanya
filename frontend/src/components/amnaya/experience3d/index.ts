/**
 * 3D Architectural Experience — Module Exports.
 *
 * Isolated Three.js / React Three Fiber module for Vision Amnaya.
 * Exposes `<Amnaya3DExperience />` for clean integration into pages and sections.
 */

export { Amnaya3DExperience } from "./Amnaya3DExperience";
export type { Amnaya3DExperienceProps } from "./Amnaya3DExperience";

export { useExperienceStore, CAMERA_PRESETS, HOTSPOTS_DATA } from "./experience-store";
export type { PresetViewMode, TimeOfDayMode, CameraPreset, HotspotData } from "./experience-store";
