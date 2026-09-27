"use client";

/**
 * 3D Architectural Experience State & Data Contract.
 *
 * Manages camera preset viewpoints, time of day (day/dusk), active hotspot ID,
 * and hotspot metadata for Vision Amnaya's 3D experience.
 */

import { create } from "zustand";

export type PresetViewMode = "overview" | "elevation" | "lake" | "clubhouse" | "landscape";
export type TimeOfDayMode = "day" | "dusk";

export interface CameraPreset {
  id: PresetViewMode;
  label: string;
  position: [number, number, number];
  target: [number, number, number];
}

export interface HotspotData {
  id: string;
  title: string;
  category: "Architecture" | "Landscape" | "Amenities" | "Residences";
  subtitle: string;
  description: string;
  position: [number, number, number];
  specs?: string[];
}

/** Predefined architectural camera view presets */
export const CAMERA_PRESETS: Record<PresetViewMode, CameraPreset> = {
  overview: {
    id: "overview",
    label: "Overview",
    position: [45, 30, 50],
    target: [0, 6, 0],
  },
  elevation: {
    id: "elevation",
    label: "Building Elevation",
    position: [0, 14, 42],
    target: [0, 12, 0],
  },
  lake: {
    id: "lake",
    label: "Lake View",
    position: [-35, 18, 30],
    target: [0, 8, -10],
  },
  clubhouse: {
    id: "clubhouse",
    label: "Clubhouse Spine",
    position: [28, 12, -22],
    target: [10, 4, -5],
  },
  landscape: {
    id: "landscape",
    label: "Central Garden",
    position: [18, 8, 22],
    target: [0, 2, 0],
  },
};

/** Verified 3D Hotspot definitions */
export const HOTSPOTS_DATA: HotspotData[] = [
  {
    id: "towers",
    title: "10-Floor Residential Towers",
    category: "Residences",
    subtitle: "420 Premium 3 BHK Residences",
    description:
      "Four contemporary towers rising ten floors above Khajaguda. Generous 1,715 – 2,590 sq.ft. floor plates with cross-ventilation and lake orientation.",
    position: [0, 16, 0],
    specs: ["10 Floors", "3 BHK Typology", "1,715 – 2,590 sq.ft."],
  },
  {
    id: "entrance",
    title: "Double-Height Entrance",
    category: "Architecture",
    subtitle: "Stilt Arrival Sequence",
    description:
      "The ground level features an open double-height stilt structure elevating the towers off the street and framing direct sightlines to the garden.",
    position: [0, 2.5, 12],
    specs: ["Double-Height Stilt", "Pedestrian Axis", "Air Flow Channel"],
  },
  {
    id: "garden",
    title: "2-Acre Central Garden",
    category: "Landscape",
    subtitle: "Landscaped Park Spine",
    description:
      "Two full acres of central greenery acting as a serene buffer between the towers and entry road, featuring walking paths and seating plazas.",
    position: [-8, 1, 16],
    specs: ["2 Acres Area", "Pedestrian Plazas", "Native Planting"],
  },
  {
    id: "clubhouse",
    title: "25,000 sq.ft. Clubhouse",
    category: "Amenities",
    subtitle: "4-Level Social & Wellness Spine",
    description:
      "Housing badmington courts, squash court, gym, yoga room, guest suites, and a rooftop swimming pool overlooking the horizon.",
    position: [16, 6, -6],
    specs: ["25,000 sq.ft.", "4 Levels", "Rooftop Pool"],
  },
  {
    id: "lake-terrace",
    title: "Lake Facing Balconies",
    category: "Architecture",
    subtitle: "25-Acre Unobstructed View",
    description:
      "Deep cantilevered balcony overhangs providing passive solar shading while offering sweeping views across the Osman Sagar lake catchment.",
    position: [-10, 12, -8],
    specs: ["25-Acre View", "Passive Solar Shading", "Deep Terraces"],
  },
];

export interface Experience3DState {
  presetView: PresetViewMode;
  timeOfDay: TimeOfDayMode;
  activeHotspotId: string | null;
  showHotspots: boolean;
  isLoaded: boolean;
  setPresetView: (preset: PresetViewMode) => void;
  setTimeOfDay: (time: TimeOfDayMode) => void;
  setActiveHotspotId: (id: string | null) => void;
  setShowHotspots: (show: boolean) => void;
  setIsLoaded: (loaded: boolean) => void;
  resetView: () => void;
}

export const useExperienceStore = create<Experience3DState>((set) => ({
  presetView: "overview",
  timeOfDay: "day",
  activeHotspotId: null,
  showHotspots: true,
  isLoaded: false,
  setPresetView: (presetView) => set({ presetView }),
  setTimeOfDay: (timeOfDay) => set({ timeOfDay }),
  setActiveHotspotId: (activeHotspotId) => set({ activeHotspotId }),
  setShowHotspots: (showHotspots) => set({ showHotspots }),
  setIsLoaded: (isLoaded) => set({ isLoaded }),
  resetView: () =>
    set({
      presetView: "overview",
      activeHotspotId: null,
    }),
}));
