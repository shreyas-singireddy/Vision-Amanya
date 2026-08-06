/** Favourite store — optimistic saved-property state. */

import { create } from "zustand";

import { favouriteService } from "@services/favourite.service";

import type { Property } from "@domain/property";

interface FavouriteState {
  /** property id -> saved state, used for instant heart toggles. */
  ids: Record<string, boolean>;
  /** Total count, kept in sync with the backend. */
  total: number;
  /** Latest fetched page of saved properties. */
  items: Property[];
  loading: boolean;

  setIds: (ids: Record<string, boolean>) => void;
  setTotal: (total: number) => void;
  setItems: (items: Property[]) => void;
  setLoading: (loading: boolean) => void;

  /** Optimistically toggle, roll back on failure. */
  toggle: (propertyId: string) => Promise<void>;

  /** Refresh count + ids from the backend. */
  sync: () => Promise<void>;
}

export const useFavouriteStore = create<FavouriteState>()((set, get) => ({
  ids: {},
  total: 0,
  items: [],
  loading: false,

  setIds: (ids) => set({ ids }),
  setTotal: (total) => set({ total }),
  setItems: (items) => set({ items }),
  setLoading: (loading) => set({ loading }),

  toggle: async (propertyId) => {
    const current = get().ids[propertyId] ?? false;
    set((state) => ({
      ids: { ...state.ids, [propertyId]: !current },
      total: Math.max(0, state.total + (current ? -1 : 1)),
    }));

    try {
      const result = await favouriteService.toggle(propertyId);
      set((state) => ({
        ids: { ...state.ids, [propertyId]: result.is_favorite },
        total: Math.max(0, state.total),
      }));
    } catch {
      // Roll back the optimistic update.
      set((state) => ({
        ids: { ...state.ids, [propertyId]: current },
        total: Math.max(0, state.total + (current ? 1 : -1)),
      }));
      throw new Error("Could not update saved list. Please try again.");
    }
  },

  sync: async () => {
    set({ loading: true });
    try {
      const [count, page] = await Promise.all([
        favouriteService.count(),
        favouriteService.list(1, 100),
      ]);
      const ids: Record<string, boolean> = {};
      for (const property of page.items) ids[property.id] = true;
      set({ ids, total: count.count, items: page.items });
    } finally {
      set({ loading: false });
    }
  },
}));
