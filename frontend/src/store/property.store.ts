/** Property store — UI state for property listings (filters, view, compare). */

import { create } from "zustand";

import type { PropertyListParams } from "@domain/property";

interface PropertyState {
  /** Current search/filter criteria. */
  filters: PropertyListParams;
  /** Map of property id -> favourite status (fast optimistic UI). */
  favouritesById: Record<string, boolean>;
  /** Up to N properties selected for comparison. */
  compareIds: string[];
  viewMode: "grid" | "list";

  setFilters: (filters: Partial<PropertyListParams>) => void;
  resetFilters: () => void;
  setFavourite: (propertyId: string, isFavourite: boolean) => void;
  toggleCompare: (propertyId: string) => void;
  clearCompare: () => void;
  setViewMode: (mode: "grid" | "list") => void;
}

const MAX_COMPARE = 4;

const defaultFilters: PropertyListParams = {
  page: 1,
  page_size: 12,
};

export const usePropertyStore = create<PropertyState>()((set) => ({
  filters: defaultFilters,
  favouritesById: {},
  compareIds: [],
  viewMode: "grid",

  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters, page: 1 } })),
  resetFilters: () => set({ filters: defaultFilters }),

  setFavourite: (propertyId, isFavourite) =>
    set((state) => ({
      favouritesById: { ...state.favouritesById, [propertyId]: isFavourite },
    })),

  toggleCompare: (propertyId) =>
    set((state) => {
      const has = state.compareIds.includes(propertyId);
      if (has) {
        return { compareIds: state.compareIds.filter((id) => id !== propertyId) };
      }
      if (state.compareIds.length >= MAX_COMPARE) return state;
      return { compareIds: [...state.compareIds, propertyId] };
    }),
  clearCompare: () => set({ compareIds: [] }),
  setViewMode: (viewMode) => set({ viewMode }),
}));
