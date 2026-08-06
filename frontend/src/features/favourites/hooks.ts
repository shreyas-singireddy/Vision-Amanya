"use client";

/** Favourites feature — hooks over the optimistic favourite store. */

import { useCallback } from "react";

import { useFavouriteStore } from "@store/favourite.store";

import { ui } from "@store/ui.store";

/** Toggle a property's saved state with an optimistic UI update. */
export function useFavouriteToggle(propertyId: string) {
  const isSaved = useFavouriteStore((state) => state.ids[propertyId] ?? false);
  const toggle = useFavouriteStore((state) => state.toggle);

  const handleToggle = useCallback(async () => {
    try {
      await toggle(propertyId);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not update saved list.";
      ui.toast({ title: message, tone: "error" });
    }
  }, [propertyId, toggle]);

  return { isSaved, toggle: handleToggle };
}

/** Count of saved properties. */
export function useFavouriteCount() {
  return useFavouriteStore((state) => state.total);
}
