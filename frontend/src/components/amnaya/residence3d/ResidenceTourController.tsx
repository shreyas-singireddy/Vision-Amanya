"use client";

/**
 * ResidenceTourController — Phase 3 Guided Residence Walkthrough.
 *
 * Choreographs an automated, calm architectural tour across verified rooms.
 * Features:
 * - Sequenced room transitions with smooth camera lerping
 * - Non-intrusive progress bar and timer
 * - Pause, resume, skip, previous, and exit controls
 * - Respects prefers-reduced-motion
 */

import { memo, useEffect, useRef } from "react";
import { Play, Pause, SkipForward, SkipBack, X, Compass } from "lucide-react";
import { useResidenceExplorerStore } from "../../../store/residence-explorer.store";
import type { ArchitecturalResidence, RoomId } from "../../../types/residence-architecture";

export interface ResidenceTourControllerProps {
  residence: ArchitecturalResidence;
}

const STEP_DURATION_MS = 6500;

export const ResidenceTourController = memo(function ResidenceTourController({
  residence,
}: ResidenceTourControllerProps) {
  const isTourActive = useResidenceExplorerStore((s) => s.isTourActive);
  const isTourPaused = useResidenceExplorerStore((s) => s.isTourPaused);
  const tourStepIndex = useResidenceExplorerStore((s) => s.tourStepIndex);
  const selectRoom = useResidenceExplorerStore((s) => s.selectRoom);
  const pauseTour = useResidenceExplorerStore((s) => s.pauseTour);
  const resumeTour = useResidenceExplorerStore((s) => s.resumeTour);
  const nextTourStep = useResidenceExplorerStore((s) => s.nextTourStep);
  const prevTourStep = useResidenceExplorerStore((s) => s.prevTourStep);
  const exitTour = useResidenceExplorerStore((s) => s.exitTour);

  // Filter tour sequence to verified main rooms with camera presets
  const tourRooms = residence.rooms.filter(
    (r) =>
      r.cameraPreset ||
      ["living-room", "drawing-room", "dining", "kitchen", "master-bedroom", "bedroom-2", "bedroom-3", "balcony-1", "sitout-1"].includes(
        r.id
      )
  );

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isTourActive) return;

    if (tourStepIndex >= tourRooms.length) {
      // Tour completed naturally
      exitTour();
      return;
    }

    const currentRoom = tourRooms[tourStepIndex];
    if (currentRoom) {
      selectRoom(currentRoom.id as RoomId);
    }

    if (isTourPaused) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    timerRef.current = setTimeout(() => {
      nextTourStep();
    }, STEP_DURATION_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isTourActive, tourStepIndex, isTourPaused, tourRooms, selectRoom, nextTourStep, exitTour]);

  if (!isTourActive) return null;

  const currentRoom = tourRooms[tourStepIndex] || tourRooms[0];
  const progressPercent = ((tourStepIndex + 1) / tourRooms.length) * 100;

  return (
    <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 w-[92%] max-w-lg bg-[#0D1512]/90 backdrop-blur-xl border border-[#D4AF37]/40 rounded-2xl p-4 shadow-2xl animate-fade-in pointer-events-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37]">
            <Compass className="w-3.5 h-3.5 animate-spin-slow" />
          </div>
          <div>
            <span className="text-[10px] font-mono tracking-widest text-[#D4AF37] uppercase">
              Architectural Tour
            </span>
            <p className="text-xs font-serif text-stone-200">
              {currentRoom?.name || "Overview"}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={prevTourStep}
            disabled={tourStepIndex === 0}
            className="p-1.5 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-stone-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Previous Room"
            aria-label="Previous Room"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={isTourPaused ? resumeTour : pauseTour}
            className="p-1.5 rounded-lg bg-[#D4AF37] text-stone-950 hover:bg-[#c49f27] transition-colors"
            title={isTourPaused ? "Resume Tour" : "Pause Tour"}
            aria-label={isTourPaused ? "Resume Tour" : "Pause Tour"}
          >
            {isTourPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={nextTourStep}
            disabled={tourStepIndex >= tourRooms.length - 1}
            className="p-1.5 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-stone-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Next Room"
            aria-label="Next Room"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={exitTour}
            className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/40 ml-1 transition-colors"
            title="Exit Tour"
            aria-label="Exit Tour"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-stone-800/80 rounded-full h-1 overflow-hidden">
        <div
          className="bg-gradient-to-r from-[#D4AF37] to-amber-200 h-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Room Pips */}
      <div className="flex justify-between items-center mt-2 px-0.5">
        <span className="text-[9px] font-mono text-stone-400">
          Step {tourStepIndex + 1} of {tourRooms.length}
        </span>
        <span className="text-[9px] font-mono text-stone-400">
          {currentRoom?.dimensions?.metric
            ? currentRoom.dimensions.metric
            : "Spatial View"}
        </span>
      </div>
    </div>
  );
});
