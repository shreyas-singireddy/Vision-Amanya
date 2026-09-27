"use client";

/**
 * Floor Plan Store — Phase 6.5 interactive floor plan client state.
 *
 * Centralizes selected building, floor, unit, and viewer (zoom/pan) state in
 * a single Zustand store so components never duplicate state. URL sync is
 * handled by the explorer page (not this store) to keep the store router-free.
 */

import { create } from "zustand";

export interface FloorPlanViewport {
  /** Current zoom scale (fit-to-screen resolves to this baseline). */
  scale: number;
  /** Pan offset x (scale-independent stage units). */
  offsetX: number;
  /** Pan offset y (scale-independent stage units). */
  offsetY: number;
}

export interface FloorPlanExplorerState {
  /** Currently selected building id (Tower-A … Tower-D). */
  buildingId: string | null;
  /** Currently selected floor id. */
  floorId: string | null;
  /** Currently selected unit id, if any. */
  unitId: string | null;
  /** Unit currently hovered (touch/desktop preview). */
  hoveredUnitId: string | null;
  /** Viewport transform (zoom/pan). */
  viewport: FloorPlanViewport;
  /** Whether the details panel is open (mobile bottom sheet). */
  detailsPanelOpen: boolean;

  setBuildingId: (buildingId: string) => void;
  setFloorId: (floorId: string) => void;
  selectUnit: (unitId: string | null) => void;
  setHoveredUnitId: (unitId: string | null) => void;
  setViewport: (viewport: Partial<FloorPlanViewport>) => void;
  resetViewport: () => void;
  setDetailsPanelOpen: (open: boolean) => void;
  resetSelection: () => void;
}

export const useFloorPlanStore = create<FloorPlanExplorerState>()((set) => ({
  buildingId: "Tower-A",
  floorId: "Tower-A-F10",
  unitId: null,
  hoveredUnitId: null,
  viewport: { scale: 1, offsetX: 0, offsetY: 0 },
  detailsPanelOpen: false,

  setBuildingId: (buildingId) =>
    set({
      buildingId,
      // reset floor + unit when building changes
      floorId: null,
      unitId: null,
      hoveredUnitId: null,
      detailsPanelOpen: false,
      viewport: { scale: 1, offsetX: 0, offsetY: 0 },
    }),

  setFloorId: (floorId) =>
    set({
      floorId,
      unitId: null,
      hoveredUnitId: null,
      detailsPanelOpen: false,
      viewport: { scale: 1, offsetX: 0, offsetY: 0 },
    }),

  selectUnit: (unitId) => set({ unitId, detailsPanelOpen: Boolean(unitId) }),

  setHoveredUnitId: (hoveredUnitId) => set({ hoveredUnitId }),

  setViewport: (viewport) => set((state) => ({ viewport: { ...state.viewport, ...viewport } })),

  resetViewport: () => set({ viewport: { scale: 1, offsetX: 0, offsetY: 0 } }),

  setDetailsPanelOpen: (detailsPanelOpen) => set({ detailsPanelOpen }),

  resetSelection: () =>
    set({
      unitId: null,
      hoveredUnitId: null,
      detailsPanelOpen: false,
    }),
}));
