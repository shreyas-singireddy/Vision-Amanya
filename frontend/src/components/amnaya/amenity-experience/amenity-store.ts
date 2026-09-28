"use client";

/**
 * amenity-store.ts — Zustand state for the 3D Amenities Experience.
 *
 * Manages the selected amenity, active category filter, camera transition state,
 * and panel visibility for the interactive amenity explorer.
 */

import { create } from "zustand";
import { AMENITIES, type AmenityItem, type AmenityCategory } from "./amenity-data";

export interface AmenityExperienceState {
  /** Currently selected amenity (null = overview mode) */
  activeAmenityId: string | null;
  /** Active category filter (null = show all) */
  activeCategory: AmenityCategory | null;
  /** Whether the detail panel is open */
  isPanelOpen: boolean;
  /** Whether the 3D scene is loaded */
  isSceneLoaded: boolean;
  /** Camera is currently transitioning */
  isTransitioning: boolean;

  /* Actions */
  selectAmenity: (id: string | null) => void;
  setCategory: (category: AmenityCategory | null) => void;
  closePanel: () => void;
  setSceneLoaded: (loaded: boolean) => void;
  setTransitioning: (transitioning: boolean) => void;
  nextAmenity: () => void;
  prevAmenity: () => void;
}

export const useAmenityStore = create<AmenityExperienceState>((set, get) => ({
  activeAmenityId: null,
  activeCategory: null,
  isPanelOpen: false,
  isSceneLoaded: false,
  isTransitioning: false,

  selectAmenity: (id) => {
    set({
      activeAmenityId: id,
      isPanelOpen: id !== null,
      isTransitioning: id !== null,
    });
  },

  setCategory: (category) => {
    set({ activeCategory: category, activeAmenityId: null, isPanelOpen: false });
  },

  closePanel: () => {
    set({ isPanelOpen: false, activeAmenityId: null });
  },

  setSceneLoaded: (loaded) => set({ isSceneLoaded: loaded }),

  setTransitioning: (transitioning) => set({ isTransitioning: transitioning }),

  nextAmenity: () => {
    const { activeAmenityId, activeCategory } = get();
    const filtered = activeCategory
      ? AMENITIES.filter((a) => a.category === activeCategory)
      : AMENITIES;
    const idx = filtered.findIndex((a) => a.id === activeAmenityId);
    const next = filtered[(idx + 1) % filtered.length];
    if (next) {
      set({ activeAmenityId: next.id, isPanelOpen: true, isTransitioning: true });
    }
  },

  prevAmenity: () => {
    const { activeAmenityId, activeCategory } = get();
    const filtered = activeCategory
      ? AMENITIES.filter((a) => a.category === activeCategory)
      : AMENITIES;
    const idx = filtered.findIndex((a) => a.id === activeAmenityId);
    const prev = filtered[(idx - 1 + filtered.length) % filtered.length];
    if (prev) {
      set({ activeAmenityId: prev.id, isPanelOpen: true, isTransitioning: true });
    }
  },
}));

/** Derived selector: active amenity item */
export function useActiveAmenity(): AmenityItem | null {
  const id = useAmenityStore((s) => s.activeAmenityId);
  if (!id) return null;
  return AMENITIES.find((a) => a.id === id) ?? null;
}
