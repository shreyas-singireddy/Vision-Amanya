"use client";

/**
 * AmenityExperience3D — The full-page 3D Amenities Experience.
 *
 * Architecture:
 *   - isWebGLAvailable + prefers-reduced-motion checks (same pattern as Amnaya3DExperience)
 *   - Dynamic import for the R3F canvas (SSR disabled, 0 server bundle cost)
 *   - Zustand amenity-store as the single state source
 *   - AmenityNav overlay for category/amenity selection
 *   - AmenityDetailPanel overlay for selected amenity info + image
 *   - StaticFallback with the amenity-specific imagery for no-WebGL devices
 */

import { Component, type ReactNode, useState } from "react";
import dynamic from "next/dynamic";

import { isWebGLAvailable } from "@lib/3d/webgl-check";
import { useMounted } from "@hooks/use-mounted";
import { useReducedMotionPreference } from "@hooks/use-reduced-motion";

import { AmenityNav } from "./AmenityNav";
import { AmenityDetailPanel } from "./AmenityDetailPanel";
import { useAmenityStore } from "./amenity-store";
import { cn } from "@utils/cn";

/* Dynamic import — no SSR, loads only when client hydrates */
const DynamicAmenityCanvas = dynamic(
  () => import("./AmenitySceneCanvas").then((m) => m.AmenitySceneCanvas),
  {
    ssr: false,
    loading: () => <LoadingFallback />,
  }
);

/* ══════════════════════════════════════════════════════════════════════════ */

export interface AmenityExperience3DProps {
  className?: string;
}

export function AmenityExperience3D({ className }: AmenityExperience3DProps) {
  const hasMounted = useMounted();
  const reduced = useReducedMotionPreference();
  const [webGlSupported] = useState<boolean>(() => isWebGLAvailable());

  if (!hasMounted) return <LoadingFallback className={className} />;

  if (reduced || !webGlSupported) {
    return (
      <StaticFallback
        reason={!webGlSupported ? "WebGL not available" : "Reduced motion preference active"}
        className={className}
      />
    );
  }

  return (
    <ErrorBoundary
      fallback={
        <StaticFallback reason="3D rendering encountered an error" className={className} />
      }
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-card-lg border border-border shadow-cinematic",
          className
        )}
        style={{ height: "clamp(480px, 60vh, 720px)" }}
      >
        {/* 3D WebGL Canvas */}
        <DynamicAmenityCanvas className="absolute inset-0" />

        {/* 2D Overlay UI */}
        <AmenityOverlayUI />
      </div>
    </ErrorBoundary>
  );
}

/* ── Overlay UI ──────────────────────────────────────────────────────────── */

function AmenityOverlayUI() {
  const isSceneLoaded = useAmenityStore((s) => s.isSceneLoaded);
  const activeAmenityId = useAmenityStore((s) => s.activeAmenityId);
  const closePanel = useAmenityStore((s) => s.closePanel);

  return (
    <div className="pointer-events-none absolute inset-0 z-20 select-none">
      {/* Top bar */}
      <div className="flex items-center justify-between p-4 sm:p-6">
        <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/20 bg-black/60 px-4 py-1.5 backdrop-blur-md">
          <span
            className={cn(
              "h-2 w-2 rounded-full transition-colors duration-500",
              isSceneLoaded ? "bg-accent-400" : "bg-white/40 animate-pulse"
            )}
          />
          <span className="text-[0.6rem] font-medium uppercase tracking-[0.2em] text-white/90">
            {isSceneLoaded ? "3D Amenity Explorer · Interactive" : "Loading Scene…"}
          </span>
        </div>

        {/* Reset button */}
        {activeAmenityId && (
          <button
            onClick={closePanel}
            className="pointer-events-auto rounded-full border border-white/20 bg-black/60 px-4 py-1.5 text-[0.6rem] font-medium uppercase tracking-[0.18em] text-white/80 backdrop-blur-md transition-colors hover:bg-white/20 hover:text-white focus-visible:outline-none"
          >
            Overview
          </button>
        )}
      </div>

      {/* Bottom nav bar */}
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
        {/* Instructions hint when nothing is selected */}
        {!activeAmenityId && isSceneLoaded && (
          <p className="mb-3 text-center text-[0.6rem] uppercase tracking-[0.2em] text-white/40 hidden sm:block">
            Click a hotspot or select an amenity below
          </p>
        )}
        <div className="pointer-events-auto max-w-2xl">
          <AmenityNav />
        </div>
      </div>

      {/* Detail panel */}
      <AmenityDetailPanel />
    </div>
  );
}

/* ── Loading fallback ────────────────────────────────────────────────────── */

function LoadingFallback({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center bg-[#0A120E] text-neutral-50 rounded-card-lg border border-border",
        className
      )}
      style={{ height: "clamp(480px, 60vh, 720px)" }}
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="text-[0.625rem] font-medium uppercase tracking-[0.3em] text-accent-400">
          Vision Infra Developers
        </span>
        <h3 className="font-serif text-3xl font-medium tracking-tight text-white">Vision Amnaya</h3>
        <div className="h-0.5 w-16 animate-pulse bg-accent-500/60 my-2" />
        <p className="text-xs uppercase tracking-[0.2em] text-neutral-400 font-light">
          Preparing Amenity Experience…
        </p>
        {/* Progress bar */}
        <div className="w-40 h-0.5 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-accent-500/60 animate-pulse rounded-full" style={{ width: "60%" }} />
        </div>
      </div>
    </div>
  );
}

/* ── Static fallback (reduced motion / no WebGL) ─────────────────────────── */

function StaticFallback({ reason, className }: { reason: string; className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-card-lg border border-border shadow-cinematic bg-navy-950 text-neutral-50",
        className
      )}
      style={{ height: "clamp(480px, 60vh, 720px)" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/amnaya/amenities/aerial-basketball.jpg"
        alt="Vision Amnaya — podium amenity spaces and sports deck"
        className="h-full w-full object-cover opacity-60"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/40 to-transparent pointer-events-none" />

      <div className="absolute bottom-8 left-8 right-8 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
        <div>
          <span className="text-[0.625rem] font-medium uppercase tracking-[0.22em] text-accent-400">
            Amenity Overview
          </span>
          <h3 className="mt-1 font-serif text-2xl font-medium text-white">
            Podium Amenity Spaces
          </h3>
          <p className="mt-1 text-xs text-white/70 font-light max-w-md">
            Sports courts, garden, swimming pool and community spaces across the Amnaya campus.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Error boundary ──────────────────────────────────────────────────────── */

class ErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  override state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  override render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}
