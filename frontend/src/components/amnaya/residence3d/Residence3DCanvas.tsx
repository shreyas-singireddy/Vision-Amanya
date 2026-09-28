"use client";

/**
 * Residence3DCanvas — Phase 2 Interactive 3D Residence Canvas & Controls.
 *
 * Implements:
 * 1. React Three Fiber Canvas with ACESFilmic tone mapping and antialiasing.
 * 2. On-canvas camera control overlay (Zoom In, Zoom Out, Reset).
 * 3. Quick-Jump Room Carousel / Camera Presets bar.
 * 4. Selected Room Details Banner synchronized with 2D Floor Plan.
 * 5. WebGL hardware detection & graceful architectural fallback.
 */

import { Suspense, useEffect, useState, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import {
  AlertCircle,
  Compass,
  Columns2,
  LayoutGrid,
  Maximize2,
  Minimize2,
  RefreshCw,
  Ruler,
  Sun,
  Sunset,
  Moon,
  Sparkles,
  Play,
  Layers,
  ArrowLeft,
} from "lucide-react";

import type { ArchitecturalResidence } from "../../../types/residence-architecture";
import { detectWebGLSupport } from "./WebGLCapabilityDetector";
import { ResidenceCameraRig } from "./ResidenceCameraRig";
import { ResidenceEnvironment } from "./ResidenceEnvironment";
import { ResidenceModelStage } from "./ResidenceModelStage";
import { ResidenceMiniMap } from "./ResidenceMiniMap";
import { ResidenceTourController } from "./ResidenceTourController";
import { ResidenceStorytellingHUD } from "./ResidenceStorytellingHUD";
import {
  useResidenceExplorerStore,
  type LightingMode,
} from "../../../store/residence-explorer.store";
import { IconButton } from "../../ui/icon-button";
import { Button } from "../../ui/button";

export interface Residence3DCanvasProps {
  residence: ArchitecturalResidence;
  className?: string;
  onSwitchTo2D?: () => void;
}

export function Residence3DCanvas({ residence, className, onSwitchTo2D }: Residence3DCanvasProps) {
  const hasVerifiedModel = residence.config3D.hasVerifiedGLB && residence.config3D.modelUrl;
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasWebGL, setHasWebGL] = useState<boolean | null>(null);
  const [isLocalFullscreen, setIsLocalFullscreen] = useState(false);

  const setIsWebGLSupported = useResidenceExplorerStore((s) => s.setIsWebGLSupported);
  const setIs3DLoaded = useResidenceExplorerStore((s) => s.setIs3DLoaded);
  const selectedRoomId = useResidenceExplorerStore((s) => s.selectedRoomId);
  const selectRoom = useResidenceExplorerStore((s) => s.selectRoom);
  const activePreset = useResidenceExplorerStore((s) => s.activeCameraPreset);
  const setCameraPreset = useResidenceExplorerStore((s) => s.setCameraPreset);
  const setViewMode = useResidenceExplorerStore((s) => s.setViewMode);
  const lightingMode = useResidenceExplorerStore((s) => s.lightingMode);
  const setLightingMode = useResidenceExplorerStore((s) => s.setLightingMode);
  const startTour = useResidenceExplorerStore((s) => s.startTour);
  const isTourActive = useResidenceExplorerStore((s) => s.isTourActive);

  useEffect(() => {
    const supported = detectWebGLSupport();
    setHasWebGL(supported);
    setIsWebGLSupported(supported);
  }, [setIsWebGLSupported]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsLocalFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsLocalFullscreen(false);
    }
  };

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsLocalFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  // If WebGL is not supported on the user's device/browser, show graceful architectural fallback
  if (hasWebGL === false) {
    return (
      <div
        className={`relative flex flex-col items-center justify-center bg-[#0F1713] text-white p-8 ${className || "h-full w-full min-h-[440px]"}`}
      >
        <div className="max-w-md text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-accent-400 mb-3" />
          <h3 className="font-serif text-lg font-medium text-white">
            3D Hardware Acceleration Unavailable
          </h3>
          <p className="mt-2 text-sm text-white/70">
            Your browser does not currently support WebGL hardware acceleration. You can explore the
            authoritative 2D architectural floor plan with full room measurements.
          </p>
          <div className="mt-6">
            <Button
              onClick={() => {
                if (onSwitchTo2D) onSwitchTo2D();
                else setViewMode("2d");
              }}
              variant="primary"
              size="md"
              className="flex items-center gap-2"
            >
              <LayoutGrid className="h-4 w-4" />
              <span>Explore 2D Floor Plan</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // If no verified 3D model exists for this residence, show professional unavailable state
  if (!hasVerifiedModel) {
    return (
      <div
        className={`relative flex flex-col items-center justify-center bg-[#070B09] text-white p-8 ${className || "h-full w-full min-h-[540px]"}`}
      >
        <div className="max-w-2xl text-center">
          <div className="mx-auto w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
            <AlertCircle className="h-10 w-10 text-amber-500" />
          </div>
          <h3 className="font-serif text-xl font-medium text-white">
            3D Model Unavailable for This Residence
          </h3>
          <p className="mt-3 text-sm text-white/70 leading-relaxed">
            No verified architectural 3D model is currently available for{" "}
            <span className="font-medium">{residence.title}</span>. The authoritative 2D floor plan
            below provides complete room measurements, layout, and spatial relationships.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              onClick={() => {
                if (onSwitchTo2D) onSwitchTo2D();
                else setViewMode("2d");
              }}
              variant="primary"
              size="md"
              className="flex items-center gap-2"
            >
              <LayoutGrid className="h-4 w-4" />
              <span>Explore 2D Floor Plan</span>
            </Button>
            <Button
              onClick={() => setViewMode("split")}
              variant="outline"
              size="md"
              className="flex items-center gap-2 border-white/20 text-white hover:bg-white/10"
            >
              <Columns2 className="h-4 w-4" />
              <span>2D ↔ 3D Split View</span>
            </Button>
          </div>
          <div className="mt-8 p-4 rounded-xl bg-white/5 border border-white/10 text-left">
            <p className="text-xs font-mono text-amber-400 uppercase tracking-wider mb-2">
              Architectural Integrity Notice
            </p>
            <ul className="text-sm text-white/60 space-y-1.5">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                Placeholder geometry is <span className="font-medium">not</span> presented as real
                architecture
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                2D floor plan remains the authoritative spatial reference
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                3D infrastructure ready for approved CAD-derived model
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative h-full w-full min-h-[540px] bg-[#070B09] select-none overflow-hidden transition-all duration-300 ${className || ""}`}
    >
      {/* ── 3D Canvas Viewport ─────────────────────────────────────────── */}
      <Canvas
        camera={{
          fov: 38,
          near: 0.5,
          far: 200,
          position: [0, 18, 22],
        }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure:
            lightingMode === "day" ? 1.15 : lightingMode === "evening" ? 1.05 : 0.9,
        }}
        shadows
        className="h-full w-full"
        onCreated={() => setIs3DLoaded(true)}
      >
        <Suspense fallback={null}>
          <ResidenceCameraRig residence={residence} />
          <ResidenceEnvironment />
          <ResidenceModelStage residence={residence} />
        </Suspense>
      </Canvas>

      {/* ── Top Header Bar (Model Status, Tour CTA, Switcher) ─────────── */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-3 pointer-events-none z-20">
        <div className="flex items-center gap-2 pointer-events-auto">
          <span className="rounded-full bg-black/70 border border-white/15 px-3 py-1.5 text-[0.6875rem] font-semibold uppercase tracking-wider text-white backdrop-blur-md shadow-lg">
            {residence.title} · {hasVerifiedModel ? "3D Spatial View" : "3D Model Unavailable"}
          </span>

          {/* Guided Tour Trigger — only when verified model exists */}
          {hasVerifiedModel && !isTourActive && (
            <button
              onClick={startTour}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#D4AF37] to-amber-400 text-stone-950 font-sans font-semibold text-xs shadow-lg hover:shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Play className="w-3 h-3 fill-stone-950" />
              <span>Take a Tour</span>
            </button>
          )}
        </div>

        {/* View Switcher & Fullscreen Actions */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <Button
            onClick={() => {
              if (onSwitchTo2D) onSwitchTo2D();
              else setViewMode("2d");
            }}
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5 text-xs text-white bg-black/70 border-white/20 hover:bg-white/20 backdrop-blur-md shadow-lg"
          >
            <LayoutGrid className="h-3.5 w-3.5 text-accent-400" />
            <span>2D Plan</span>
          </Button>

          <IconButton
            aria-label={isLocalFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            icon={isLocalFullscreen ? Minimize2 : Maximize2}
            variant="ghost"
            size="sm"
            className="text-white bg-black/70 border border-white/15 hover:bg-white/20 backdrop-blur-md"
            onClick={toggleFullscreen}
          />
        </div>
      </div>

      {/* ── Top-Right Floating Atmospheric Controls (Day/Evening/Night) — only with verified model ── */}
      {hasVerifiedModel && (
        <div className="absolute top-16 right-4 flex flex-col gap-1.5 rounded-2xl border border-white/15 bg-black/75 p-1.5 backdrop-blur-md shadow-xl z-20 pointer-events-auto">
          {/* Lighting Mode Selector */}
          <div className="flex flex-col gap-1">
            <button
              onClick={() => setLightingMode("day")}
              title="Daylight Visualization"
              className={`p-2 rounded-xl transition-all ${
                lightingMode === "day"
                  ? "bg-[#D4AF37] text-stone-950 shadow-md"
                  : "text-stone-400 hover:text-white hover:bg-white/10"
              }`}
            >
              <Sun className="w-4 h-4" />
            </button>
            <button
              onClick={() => setLightingMode("evening")}
              title="Golden Evening Visualization"
              className={`p-2 rounded-xl transition-all ${
                lightingMode === "evening"
                  ? "bg-amber-600 text-white shadow-md"
                  : "text-stone-400 hover:text-white hover:bg-white/10"
              }`}
            >
              <Sunset className="w-4 h-4" />
            </button>
            <button
              onClick={() => setLightingMode("night")}
              title="Nocturnal Ambience Visualization"
              className={`p-2 rounded-xl transition-all ${
                lightingMode === "night"
                  ? "bg-indigo-900 text-indigo-100 shadow-md"
                  : "text-stone-400 hover:text-white hover:bg-white/10"
              }`}
            >
              <Moon className="w-4 h-4" />
            </button>
          </div>

          <div className="h-px w-full bg-white/15 my-0.5" />

          {/* Reset Camera Button */}
          <IconButton
            aria-label="Reset camera view"
            icon={RefreshCw}
            variant="ghost"
            size="sm"
            className="text-stone-300 hover:text-white hover:bg-white/20"
            onClick={() => {
              selectRoom(null);
              setCameraPreset("overview");
            }}
          />
        </div>
      )}

      {/* ── Phase 3 Guided Tour Controller Overlay — only with verified model ── */}
      {hasVerifiedModel && <ResidenceTourController residence={residence} />}

      {/* ── Phase 3 Minimal Architectural Storytelling HUD — only with verified model ── */}
      {hasVerifiedModel && !isTourActive && <ResidenceStorytellingHUD residence={residence} />}

      {/* ── Bottom-Right Interactive Mini-Map Navigator — only with verified model ── */}
      {hasVerifiedModel && (
        <div className="absolute bottom-16 sm:bottom-4 right-4 z-20">
          <ResidenceMiniMap residence={residence} />
        </div>
      )}

      {/* ── Bottom Quick-Jump Camera Presets / Room Pills Bar — only with verified model ── */}
      {hasVerifiedModel && (
        <div className="absolute bottom-2 sm:bottom-4 left-4 right-44 sm:right-48 flex flex-col gap-3 pointer-events-none z-20">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pointer-events-auto max-w-full">
            {/* Overview Preset */}
            <button
              onClick={() => {
                selectRoom(null);
                setCameraPreset("overview");
              }}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-semibold uppercase tracking-wider backdrop-blur-md transition-all ${
                activePreset === "overview" && !selectedRoomId
                  ? "bg-[#D4AF37] text-stone-950 border-amber-300 shadow-lg"
                  : "bg-black/70 text-stone-300 border-white/15 hover:border-white/40 hover:text-white"
              }`}
            >
              <Compass className="h-3.5 w-3.5" />
              <span>Overview</span>
            </button>

            {/* Room Presets */}
            {residence.rooms.map((room) => {
              const isSelected = selectedRoomId === room.id;

              return (
                <button
                  key={room.id}
                  onClick={() => {
                    if (isSelected) {
                      selectRoom(null);
                      setCameraPreset("overview");
                    } else {
                      selectRoom(room.id);
                      setCameraPreset(room.id);
                    }
                  }}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium backdrop-blur-md transition-all ${
                    isSelected
                      ? "bg-[#EF4444] text-white border-red-400 shadow-lg ring-1 ring-red-300"
                      : "bg-black/70 text-stone-300 border-white/15 hover:border-white/40 hover:text-white"
                  }`}
                >
                  <span>{room.name}</span>
                  {room.dimensions?.metric && (
                    <span className="text-[0.6875rem] opacity-75 font-mono">
                      ({room.dimensions.metric.split("X")[0]?.trim()})
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
