"use client";

/**
 * Amnaya3DExperience — Flagship Interactive 3D Architectural Experience Component.
 *
 * Isolated, production-grade 3D experience for Vision Amnaya.
 * Features:
 *   - Client-side dynamic import guard (0 bundle bloat on initial SSR homepage load)
 *   - WebGL capability detection (`isWebGLAvailable`)
 *   - `prefers-reduced-motion` compliance (switches to high-res static render fallback)
 *   - Brand-aligned loading state and WebGL fallback view
 *   - Integrated Phase 6.2 UI overlay controls (`ExperienceUI`)
 */

import { Component, type ReactNode, useState } from "react";
import dynamic from "next/dynamic";

import { isWebGLAvailable } from "@lib/3d/webgl-check";
import { useMounted } from "@hooks/use-mounted";
import { useReducedMotionPreference } from "@hooks/use-reduced-motion";

import { ExperienceUI } from "./ExperienceUI";

import { cn } from "@utils/cn";

// Dynamically import the Three.js Canvas component with SSR disabled
const DynamicAmnayaCanvas = dynamic(
  () => import("./AmnayaCanvas").then((mod) => mod.AmnayaCanvas),
  {
    ssr: false,
    loading: () => <LoadingFallback />,
  }
);

export interface Amnaya3DExperienceProps {
  /** Optional custom `.glb` model path */
  modelUrl?: string;
  className?: string;
}

export function Amnaya3DExperience({ modelUrl, className }: Amnaya3DExperienceProps) {
  const hasMounted = useMounted();
  const reduced = useReducedMotionPreference();
  const [webGlSupported] = useState<boolean>(() => isWebGLAvailable());

  // SSR or before hydration
  if (!hasMounted) {
    return <LoadingFallback className={className} />;
  }

  // Reduced motion or WebGL unsupported — display high-res static render fallback
  if (reduced || !webGlSupported) {
    return (
      <StaticFallback
        reason={
          !webGlSupported ? "WebGL not supported on device" : "Reduced motion preference active"
        }
        className={className}
      />
    );
  }

  return (
    <ErrorBoundary
      fallback={<StaticFallback reason="3D rendering encountered an error" className={className} />}
    >
      <div
        className={cn(
          "relative h-[650px] w-full overflow-hidden rounded-card-lg border border-border shadow-cinematic",
          className
        )}
      >
        {/* R3F WebGL Canvas */}
        <DynamicAmnayaCanvas modelUrl={modelUrl} />

        {/* 2D Luxury Control Overlay */}
        <ExperienceUI />
      </div>
    </ErrorBoundary>
  );
}

/** Brand-aligned loading fallback */
function LoadingFallback({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative flex h-[650px] w-full flex-col items-center justify-center bg-[#0A120E] text-neutral-50 rounded-card-lg border border-border p-8",
        className
      )}
    >
      <div className="flex flex-col items-center text-center gap-4">
        <span className="text-[0.625rem] font-medium uppercase tracking-[0.3em] text-accent-400">
          Vision Infra Developers
        </span>
        <h3 className="font-serif text-3xl font-medium tracking-tight text-white">Vision Amnaya</h3>
        <div className="h-0.5 w-16 bg-accent-500/60 animate-pulse my-2" />
        <p className="text-xs uppercase tracking-[0.2em] text-neutral-400 font-light">
          Preparing 3D Architectural Scene...
        </p>
      </div>
    </div>
  );
}

/** High-resolution static render fallback when WebGL or reduced-motion is active */
function StaticFallback({ reason, className }: { reason: string; className?: string }) {
  return (
    <div
      className={cn(
        "relative h-[650px] w-full overflow-hidden rounded-card-lg border border-border shadow-cinematic bg-navy-950 text-neutral-50",
        className
      )}
    >
      {/* Fallback render background */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/amnaya/renders/building-day.jpg"
        alt="Vision Amnaya — 3D architectural render overview"
        className="h-full w-full object-cover opacity-60"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/40 to-transparent pointer-events-none" />

      {/* Info Overlay */}
      <div className="absolute bottom-8 left-8 right-8 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
        <div>
          <span className="text-[0.625rem] font-medium uppercase tracking-[0.22em] text-accent-400">
            Architectural View ({reason})
          </span>
          <h3 className="mt-1 font-serif text-2xl font-medium text-white">
            Vision Amnaya — 10-Floor Residential Towers
          </h3>
          <p className="mt-1 text-xs text-white/70 font-light max-w-md">
            420 three-bedroom residences framed by two acres of central garden and twenty-five acres
            of lake view.
          </p>
        </div>
      </div>
    </div>
  );
}

/** Lightweight React Error Boundary for WebGL canvas failures */
class ErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  override state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  override render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}
