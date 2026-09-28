"use client";

/**
 * Residence Explorer Store — Phase 1 2D ↔ 3D Synchronization State.
 *
 * Provides shared state connecting:
 * - Selected residence configuration (1,715 to 2,590 Sq.Ft)
 * - Authoritative 2D floor plan view & room inspection
 * - 3D scene representation, camera preset, and node selection
 * - WebGL capability detection & graceful fallback
 */

import { create } from "zustand";
import type { RoomId } from "../types/residence-architecture";

export type ExplorerViewMode = "2d" | "3d" | "split";
export type LightingMode = "day" | "evening" | "night";

export interface ResidenceViewport {
  scale: number;
  offsetX: number;
  offsetY: number;
}

export interface ResidenceExplorerStoreState {
  /** Selected residence ID, defaults to flagship 1,715 Sq.Ft */
  residenceId: string;
  /** Active view mode */
  viewMode: ExplorerViewMode;
  /** Currently selected room ID shared between 2D and 3D */
  selectedRoomId: RoomId | null;
  /** Currently hovered room ID for preview */
  hoveredRoomId: RoomId | null;
  /** Active camera preset in 3D */
  activeCameraPreset: string;
  /** 2D Pan and zoom viewport */
  viewport2D: ResidenceViewport;
  /** Is 3D scene loaded and ready */
  is3DLoaded: boolean;
  /** WebGL hardware capability status (null = detecting, true = supported, false = unsupported) */
  isWebGLSupported: boolean | null;
  /** Fullscreen modal mode */
  isFullscreen: boolean;
  /** Phase 3: Architectural lighting mode */
  lightingMode: LightingMode;
  /** Phase 3: Guided tour active state */
  isTourActive: boolean;
  /** Phase 3: Guided tour step index */
  tourStepIndex: number;
  /** Phase 3: Guided tour paused state */
  isTourPaused: boolean;

  /* Actions */
  selectResidence: (residenceId: string) => void;
  setViewMode: (mode: ExplorerViewMode) => void;
  selectRoom: (roomId: RoomId | null) => void;
  setHoveredRoom: (roomId: RoomId | null) => void;
  setCameraPreset: (presetId: string) => void;
  setViewport2D: (viewport: Partial<ResidenceViewport>) => void;
  resetViewport2D: () => void;
  setIs3DLoaded: (loaded: boolean) => void;
  setIsWebGLSupported: (supported: boolean) => void;
  setIsFullscreen: (fullscreen: boolean) => void;
  setLightingMode: (mode: LightingMode) => void;
  startTour: () => void;
  pauseTour: () => void;
  resumeTour: () => void;
  setTourStepIndex: (index: number) => void;
  nextTourStep: () => void;
  prevTourStep: () => void;
  exitTour: () => void;
  resetSelection: () => void;
}

export const useResidenceExplorerStore = create<ResidenceExplorerStoreState>()((set, get) => ({
  residenceId: "residence-3bhk-1715sqft",
  viewMode: "2d",
  selectedRoomId: null,
  hoveredRoomId: null,
  activeCameraPreset: "overview",
  viewport2D: { scale: 1, offsetX: 0, offsetY: 0 },
  is3DLoaded: false,
  isWebGLSupported: null,
  isFullscreen: false,
  lightingMode: "day",
  isTourActive: false,
  tourStepIndex: 0,
  isTourPaused: false,

  selectResidence: (residenceId) =>
    set({
      residenceId,
      selectedRoomId: null,
      hoveredRoomId: null,
      activeCameraPreset: "overview",
      viewport2D: { scale: 1, offsetX: 0, offsetY: 0 },
      isTourActive: false,
      tourStepIndex: 0,
    }),

  setViewMode: (viewMode) => set({ viewMode }),

  selectRoom: (selectedRoomId) => set({ selectedRoomId }),

  setHoveredRoom: (hoveredRoomId) => set({ hoveredRoomId }),

  setCameraPreset: (activeCameraPreset) => set({ activeCameraPreset }),

  setViewport2D: (viewport) =>
    set((state) => ({
      viewport2D: { ...state.viewport2D, ...viewport },
    })),

  resetViewport2D: () => set({ viewport2D: { scale: 1, offsetX: 0, offsetY: 0 } }),

  setIs3DLoaded: (is3DLoaded) => set({ is3DLoaded }),

  setIsWebGLSupported: (isWebGLSupported) => set({ isWebGLSupported }),

  setIsFullscreen: (isFullscreen) => set({ isFullscreen }),

  setLightingMode: (lightingMode) => set({ lightingMode }),

  startTour: () =>
    set({
      isTourActive: true,
      tourStepIndex: 0,
      isTourPaused: false,
      viewMode: "3d",
    }),

  pauseTour: () => set({ isTourPaused: true }),

  resumeTour: () => set({ isTourPaused: false }),

  setTourStepIndex: (tourStepIndex) => set({ tourStepIndex }),

  nextTourStep: () => {
    const { tourStepIndex } = get();
    set({ tourStepIndex: tourStepIndex + 1 });
  },

  prevTourStep: () => {
    const { tourStepIndex } = get();
    set({ tourStepIndex: Math.max(0, tourStepIndex - 1) });
  },

  exitTour: () =>
    set({
      isTourActive: false,
      tourStepIndex: 0,
      isTourPaused: false,
      activeCameraPreset: "overview",
    }),

  resetSelection: () =>
    set({
      selectedRoomId: null,
      hoveredRoomId: null,
      activeCameraPreset: "overview",
      isTourActive: false,
      tourStepIndex: 0,
    }),
}));
