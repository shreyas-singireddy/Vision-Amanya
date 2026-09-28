"use client";

/**
 * ResidenceFloorPlanStage — Interactive Architectural Room-Detection & Highlighting Layer.
 *
 * Implements:
 * 1. Authoritative 2D Floor Plan raster display.
 * 2. Vector SVG polygon room-boundary detection overlay.
 * 3. Exact architectural room highlighting with vibrant red selection borders (`#EF4444`).
 * 4. Cursor-centered desktop wheel zoom & mobile pinch-to-zoom.
 * 5. Smooth mouse & touch pan.
 * 6. Inline Room Information Popover with verified dimensions and `[ Explore in 3D ]` trigger.
 * 7. Synchronized with `useResidenceExplorerStore` for 2D ↔ 3D state symmetry.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Box,
  Expand,
  Maximize2,
  Minus,
  Plus,
  RefreshCw,
  Ruler,
  Sparkles,
  ArrowRight,
  Info,
} from "lucide-react";

import type { ArchitecturalResidence, ArchitecturalRoom } from "../../../types/residence-architecture";
import { useResidenceExplorerStore } from "../../../store/residence-explorer.store";
import { IconButton } from "../../ui/icon-button";
import { Button } from "../../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog";

export interface ResidenceFloorPlanStageProps {
  residence: ArchitecturalResidence;
  className?: string;
  onExploreRoomIn3D?: (roomId: string) => void;
}

const MIN_ZOOM = 0.7;
const MAX_ZOOM = 3.5;

// Coordinate space matching standard 16:10 floor plans
const SVG_VIEW_WIDTH = 1000;
const SVG_VIEW_HEIGHT = 625;

export function ResidenceFloorPlanStage({
  residence,
  className,
  onExploreRoomIn3D,
}: ResidenceFloorPlanStageProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef({
    pointerId: -1,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
    hasMoved: false,
  });

  const pinchRef = useRef({
    startDistance: 0,
    startScale: 1,
  });

  const viewport = useResidenceExplorerStore((s) => s.viewport2D);
  const setViewport = useResidenceExplorerStore((s) => s.setViewport2D);
  const resetViewport = useResidenceExplorerStore((s) => s.resetViewport2D);

  const selectedRoomId = useResidenceExplorerStore((s) => s.selectedRoomId);
  const hoveredRoomId = useResidenceExplorerStore((s) => s.hoveredRoomId);
  const selectRoom = useResidenceExplorerStore((s) => s.selectRoom);
  const setHoveredRoom = useResidenceExplorerStore((s) => s.setHoveredRoom);
  const setViewMode = useResidenceExplorerStore((s) => s.setViewMode);
  const setCameraPreset = useResidenceExplorerStore((s) => s.setCameraPreset);

  const [isPanning, setIsPanning] = useState(false);

  // Fit to screen on initial mount and residence change
  const fitToScreen = useCallback(() => {
    resetViewport();
  }, [resetViewport]);

  useEffect(() => {
    fitToScreen();
  }, [residence.id, fitToScreen]);

  /* ── Cursor-Centered Wheel Zoom (Desktop) ──────────────────────────────── */
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const pointerX = e.clientX - rect.left;
      const pointerY = e.clientY - rect.top;

      const zoomDelta = e.deltaY < 0 ? 1.15 : 1 / 1.15;
      const nextScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, viewport.scale * zoomDelta));
      const ratio = nextScale / viewport.scale;

      // World point under cursor
      const worldX = (pointerX - viewport.offsetX) / viewport.scale;
      const worldY = (pointerY - viewport.offsetY) / viewport.scale;

      // New offsets so anchor stays fixed under cursor
      const nextOffsetX = pointerX - worldX * ratio;
      const nextOffsetY = pointerY - worldY * ratio;

      setViewport({
        scale: nextScale,
        offsetX: nextOffsetX,
        offsetY: nextOffsetY,
      });
    },
    [viewport.scale, viewport.offsetX, viewport.offsetY, setViewport]
  );

  /* ── Zoom Controls (Buttons) ───────────────────────────────────────────── */
  const handleButtonZoom = useCallback(
    (factor: number) => {
      setViewport({
        scale: Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, viewport.scale * factor)),
      });
    },
    [viewport.scale, setViewport]
  );

  /* ── Mouse / Touch Pan ─────────────────────────────────────────────────── */
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      const container = containerRef.current;
      if (!container) return;

      // Check for multi-touch (pinch start)
      if (!e.isPrimary) return;

      dragRef.current = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        originX: viewport.offsetX,
        originY: viewport.offsetY,
        hasMoved: false,
      };

      setIsPanning(true);
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    },
    [viewport.offsetX, viewport.offsetY]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const drag = dragRef.current;
      if (drag.pointerId === -1) return;

      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;

      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        drag.hasMoved = true;
      }

      setViewport({
        offsetX: drag.originX + dx,
        offsetY: drag.originY + dy,
      });
    },
    [setViewport]
  );

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (dragRef.current.pointerId === e.pointerId) {
      dragRef.current = {
        pointerId: -1,
        startX: 0,
        startY: 0,
        originX: 0,
        originY: 0,
        hasMoved: false,
      };
      setIsPanning(false);
    }
  }, []);

  /* ── Touch Pinch Zoom Handling ─────────────────────────────────────────── */
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      if (touch1 && touch2) {
        const dist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
        pinchRef.current = {
          startDistance: dist,
          startScale: viewport.scale,
        };
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      if (touch1 && touch2) {
        const dist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
        if (pinchRef.current.startDistance > 0) {
          const ratio = dist / pinchRef.current.startDistance;
          const nextScale = Math.max(
            MIN_ZOOM,
            Math.min(MAX_ZOOM, pinchRef.current.startScale * ratio)
          );
          setViewport({ scale: nextScale });
        }
      }
    }
  };

  /* ── Room Selection / 3D Navigation ────────────────────────────────────── */
  const handleExploreIn3D = (roomId: string) => {
    if (onExploreRoomIn3D) {
      onExploreRoomIn3D(roomId);
    } else {
      selectRoom(roomId as any);
      setCameraPreset(roomId);
      setViewMode("3d");
    }
  };

  const activeRoom = residence.rooms.find((r) => r.id === selectedRoomId);

  return (
    <div className={`flex flex-col gap-6 ${className || ""}`}>
      {/* ── Floor Plan Interactive Stage ───────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {/* Stage Viewport */}
        <div
          ref={containerRef}
          onWheel={handleWheel}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          className={`relative flex aspect-[16/10] sm:aspect-[16/11] items-center justify-center overflow-hidden bg-neutral-950 p-2 sm:p-4 select-none ${
            isPanning ? "cursor-grabbing" : "cursor-grab"
          }`}
        >
          {/* Scalable Container holding both Raster Image & Vector Overlay */}
          <div
            style={{
              transform: `translate(${viewport.offsetX}px, ${viewport.offsetY}px) scale(${viewport.scale})`,
              transformOrigin: "center center",
              transition: isPanning ? "none" : "transform 0.12s ease-out",
            }}
            className="relative flex h-full w-full items-center justify-center"
          >
            {/* 1. Underlying Authoritative Floor Plan Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={residence.floorPlanAssetUrl}
              alt={residence.floorPlanAssetAlt}
              className="max-h-full max-w-full object-contain filter drop-shadow-2xl pointer-events-none"
              draggable={false}
            />

            {/* 2. Interactive SVG Vector Overlay for Room Highlighting */}
            <svg
              viewBox={`0 0 ${SVG_VIEW_WIDTH} ${SVG_VIEW_HEIGHT}`}
              className="absolute inset-0 h-full w-full pointer-events-auto"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                {/* Vibrant Red Glow Filter for Selected Room */}
                <filter id="red-room-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                {/* Amber Glow Filter for Hovered Room */}
                <filter id="amber-room-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Render Architectural Room Polygons */}
              {residence.rooms.map((room) => {
                if (!room.boundary2D) return null;

                const isSelected = selectedRoomId === room.id;
                const isHovered = hoveredRoomId === room.id;

                return (
                  <g key={room.id} className="cursor-pointer transition-all duration-200">
                    {/* Active Polygon Boundary */}
                    <polygon
                      points={room.boundary2D.polygon}
                      fill={
                        isSelected
                          ? "rgba(239, 68, 68, 0.22)" // Red selection fill
                          : isHovered
                          ? "rgba(217, 119, 6, 0.15)" // Amber hover fill
                          : "rgba(0, 0, 0, 0.001)" // Transparent hit area
                      }
                      stroke={
                        isSelected
                          ? "#EF4444" // Vibrant red selection border
                          : isHovered
                          ? "#F59E0B" // Amber hover border
                          : "transparent"
                      }
                      strokeWidth={isSelected ? "3.5" : isHovered ? "2.5" : "0"}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      filter={isSelected ? "url(#red-room-glow)" : isHovered ? "url(#amber-room-glow)" : undefined}
                      onPointerEnter={() => setHoveredRoom(room.id)}
                      onPointerLeave={() => setHoveredRoom(null)}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Ignore click if user was dragging/panning
                        if (dragRef.current.hasMoved) return;
                        selectRoom(isSelected ? null : room.id);
                      }}
                    />

                    {/* Architectural Room Pin on Selection */}
                    {isSelected && (
                      <g
                        transform={`translate(${room.boundary2D.labelX}, ${room.boundary2D.labelY})`}
                        className="pointer-events-none animate-pulse"
                      >
                        <circle r="7" fill="#EF4444" stroke="#FFFFFF" strokeWidth="2" />
                        <circle r="14" fill="rgba(239, 68, 68, 0.3)" />
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Controls Overlay (Zoom + Reset) */}
          <div className="absolute top-4 right-4 flex flex-col gap-1.5 rounded-xl border border-white/10 bg-black/70 p-1 backdrop-blur-md shadow-lg z-10">
            <IconButton
              aria-label="Zoom in"
              icon={Plus}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={() => handleButtonZoom(1.2)}
            />
            <IconButton
              aria-label="Zoom out"
              icon={Minus}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={() => handleButtonZoom(0.83)}
            />
            <IconButton
              aria-label="Reset view"
              icon={RefreshCw}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={fitToScreen}
            />
          </div>

          {/* Fullscreen Modal Inspection Trigger */}
          <Dialog>
            <DialogTrigger asChild>
              <IconButton
                aria-label="Fullscreen floor plan inspection"
                icon={Maximize2}
                variant="glass"
                size="md"
                className="absolute bottom-4 right-4 shadow-lg z-10"
              />
            </DialogTrigger>
            <DialogContent className="max-w-5xl bg-neutral-950 text-white border-white/20">
              <DialogHeader>
                <DialogTitle className="font-serif text-2xl">
                  {residence.title} — Authoritative Architectural Layout
                </DialogTitle>
              </DialogHeader>
              <div className="mt-4 flex max-h-[80vh] items-center justify-center p-4 bg-black rounded-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={residence.floorPlanAssetUrl}
                  alt={residence.floorPlanAssetAlt}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            </DialogContent>
          </Dialog>

          {/* Floating Instructions Helper */}
          <div className="pointer-events-none absolute bottom-4 left-4 rounded-lg border border-white/10 bg-black/70 px-3 py-1.5 text-[0.6875rem] font-medium text-white/80 backdrop-blur-md z-10 hidden sm:flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <span>Click / Tap any room for red outline & verified dimensions</span>
          </div>
        </div>

        {/* ── Active Room Information Floating Banner ──────────────────── */}
        {activeRoom && (
          <div className="border-t border-red-500/30 bg-red-950/20 dark:bg-red-950/30 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 flex-shrink-0 mt-0.5">
                <Info className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[0.6875rem] uppercase font-bold tracking-wider text-red-500">
                    Selected Architectural Space
                  </span>
                  <span className="text-xs text-muted-foreground">·</span>
                  <span className="text-xs text-muted-foreground">{residence.title}</span>
                </div>
                <h4 className="font-serif text-xl font-medium text-foreground">
                  {activeRoom.name}
                </h4>
                {activeRoom.featureHighlight && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {activeRoom.featureHighlight}
                  </p>
                )}
              </div>
            </div>

            {/* Room Dimensions & 3D Action */}
            <div className="flex flex-wrap items-center gap-3">
              {activeRoom.dimensions.metric && (
                <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-foreground bg-card px-3 py-2 rounded-xl border border-red-500/20 shadow-sm">
                  <Ruler className="h-3.5 w-3.5 text-red-500" />
                  <span>{activeRoom.dimensions.metric}</span>
                </div>
              )}
              {activeRoom.dimensions.imperial && (
                <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-foreground bg-card px-3 py-2 rounded-xl border border-red-500/20 shadow-sm">
                  <Ruler className="h-3.5 w-3.5 text-red-500" />
                  <span>{activeRoom.dimensions.imperial}</span>
                </div>
              )}
              <Button
                onClick={() => handleExploreIn3D(activeRoom.id)}
                variant="primary"
                size="sm"
                className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-medium"
              >
                <Box className="h-3.5 w-3.5" />
                <span>Explore in 3D</span>
                <ArrowRight className="h-3.5 w-3.5 ml-0.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── Room Dimension Matrix Grid ─────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
          <div>
            <h4 className="font-serif text-lg font-medium text-foreground">
              Complete Architectural Room Matrix
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Click any room card or tap the floor plan above to trace its exact architectural boundary
            </p>
          </div>
          {activeRoom && (
            <button
              onClick={() => selectRoom(null)}
              className="text-xs font-medium uppercase tracking-wider text-red-600 dark:text-red-400 hover:underline"
            >
              Clear Selection
            </button>
          )}
        </div>

        {/* Room Buttons Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {residence.rooms.map((room) => {
            const isSelected = selectedRoomId === room.id;
            const isHovered = hoveredRoomId === room.id;

            return (
              <button
                key={room.id}
                onClick={() => selectRoom(isSelected ? null : room.id)}
                onMouseEnter={() => setHoveredRoom(room.id)}
                onMouseLeave={() => setHoveredRoom(null)}
                className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? "border-red-500 bg-red-50/60 dark:bg-red-950/30 shadow-sm ring-1 ring-red-500"
                    : isHovered
                    ? "border-amber-400/60 bg-amber-50/30 dark:bg-amber-950/20"
                    : "border-border/70 bg-surface/50 hover:border-border"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-semibold text-foreground truncate">
                    {room.name}
                  </span>
                  {isSelected && (
                    <span className="h-2 w-2 rounded-full bg-red-500 flex-shrink-0" />
                  )}
                </div>
                <span className="mt-1 text-[0.6875rem] font-mono text-muted-foreground">
                  {room.dimensions.metric || room.dimensions.imperial || "Verified Plan"}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
