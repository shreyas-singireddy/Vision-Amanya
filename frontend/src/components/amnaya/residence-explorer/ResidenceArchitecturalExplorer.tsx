"use client";

/**
 * ResidenceArchitecturalExplorer — Phase 2 Master 2D ↔ 3D Interactive Residence Explorer.
 *
 * Connects:
 * - 13 Size/Configuration Selectors (1,715 Sq.Ft. to 2,590 Sq.Ft.)
 * - Authoritative 2D Floor Plan Stage with vector SVG room detection and red borders
 * - Synchronized 3D Architectural Scene with room selection and camera focus
 * - AI Context synchronization (residence_id & selected_room_id)
 * - Auto-populated Enquiry & Site Visit Modal
 */

import { useEffect, useState } from "react";
import {
  Layers,
  Box,
  LayoutGrid,
  Columns,
  CheckCircle2,
  Calendar,
  Building2,
  PhoneCall,
  Sparkles,
  MapPin,
} from "lucide-react";

import {
  AMNAYA_ARCHITECTURAL_RESIDENCES,
  ARCHITECTURAL_RESIDENCES_BY_ID,
} from "../../../config/residence-architectural-data";
import {
  useResidenceExplorerStore,
  type ExplorerViewMode,
} from "../../../store/residence-explorer.store";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { ResidenceFloorPlanStage } from "./ResidenceFloorPlanStage";
import { Residence3DCanvas } from "../residence3d/Residence3DCanvas";
import { ResidenceEnquiryModal } from "../residences/ResidenceEnquiryModal";
import { Button } from "../../ui/button";
import { useAIContext } from "../../../providers/AIContextProvider";
import { AIContextType } from "../../../lib/ai/ai-context";

export interface ResidenceArchitecturalExplorerProps {
  initialResidenceId?: string;
  className?: string;
  onEnquireClick?: () => void;
}

export function ResidenceArchitecturalExplorer({
  initialResidenceId = "residence-3bhk-1715sqft",
  className,
  onEnquireClick,
}: ResidenceArchitecturalExplorerProps) {
  const shouldReduceMotion = useReducedMotion();
  const residenceId = useResidenceExplorerStore((s) => s.residenceId);
  const selectResidence = useResidenceExplorerStore((s) => s.selectResidence);
  const selectedRoomId = useResidenceExplorerStore((s) => s.selectedRoomId);
  const selectRoom = useResidenceExplorerStore((s) => s.selectRoom);
  const setCameraPreset = useResidenceExplorerStore((s) => s.setCameraPreset);
  const viewMode = useResidenceExplorerStore((s) => s.viewMode);
  const setViewMode = useResidenceExplorerStore((s) => s.setViewMode);

  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);

  // Active residence data
  const currentResidence =
    ARCHITECTURAL_RESIDENCES_BY_ID[residenceId] ||
    ARCHITECTURAL_RESIDENCES_BY_ID[initialResidenceId] ||
    AMNAYA_ARCHITECTURAL_RESIDENCES[0]!;

  // Try synchronizing with AIContextProvider
  let aiCtx: ReturnType<typeof useAIContext> | null = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    aiCtx = useAIContext();
  } catch {
    // Graceful if rendered outside AIContextProvider in standalone test
  }

  useEffect(() => {
    if (aiCtx?.setAIContext) {
      const activeRoom = currentResidence.rooms.find((r) => r.id === selectedRoomId);
      aiCtx.setAIContext({
        page_type: AIContextType.RESIDENCE,
        residence_id: currentResidence.id,
        context_source: viewMode === "3d" ? "3d_experience" : "floor_plan_viewer",
        metadata: {
          residence_title: currentResidence.title,
          super_built_up_area_sqft: currentResidence.superBuiltUpAreaSqft,
          selected_room_id: selectedRoomId,
          selected_room_name: activeRoom?.name,
          selected_room_dimensions: activeRoom?.dimensions,
        },
      });
    }
  }, [currentResidence, selectedRoomId, viewMode, aiCtx]);

  // Transition from 2D room card to 3D view
  const handleExploreRoomIn3D = (roomId: string) => {
    selectRoom(roomId as any);
    setCameraPreset(roomId);
    setViewMode("3d");
  };

  const handleOpenEnquiry = () => {
    if (onEnquireClick) {
      onEnquireClick();
    } else {
      setIsEnquiryModalOpen(true);
    }
  };

  // Convert current architectural residence to Residence DTO for modal compatibility
  const residenceDTO = {
    id: currentResidence.id,
    slug: currentResidence.id,
    unitNumber: `${currentResidence.superBuiltUpAreaSqft}`,
    title: currentResidence.title,
    subtitle: `${currentResidence.configuration} · ${currentResidence.builtUpAreaSqm} Sq.M`,
    summary: `${currentResidence.title} luxury residence at Vision Amnaya, Khajaguda, Hyderabad.`,
    description: `3 BHK luxury residence offering ${currentResidence.superBuiltUpAreaSqft.toLocaleString()} Sq.Ft. super built-up area (${currentResidence.builtUpAreaSqm} Sq.M) with premium layout and verified architectural specifications.`,
    typology: "3 BHK Type A" as const,
    location: {
      building: "Vision Amnaya",
      towerId: "Tower-A" as const,
      floor: 10,
      unitNumber: `${currentResidence.superBuiltUpAreaSqft}`,
      totalFloors: 10,
      facing: currentResidence.facing || "North-East",
      view: (currentResidence.view as any) || "Lake View",
    },
    listingStatus: "published" as const,
    priceDisplay: currentResidence.priceStarting,
    isPriceOnRequest: false,
    bedrooms: 3,
    bathrooms: 3,
    parkingSpaces: 2,
    carpetAreaSqft: Math.round(currentResidence.superBuiltUpAreaSqft * 0.73),
    superBuiltUpAreaSqft: currentResidence.superBuiltUpAreaSqft,
    media: {
      hero: currentResidence.floorPlanAssetUrl,
      gallery: [],
      unitPlanUrl: currentResidence.floorPlanAssetUrl,
      unitPlanAlt: currentResidence.floorPlanAssetAlt,
      floorPlanUrl: currentResidence.floorPlanAssetUrl,
      floorPlanAlt: currentResidence.floorPlanAssetAlt,
    },
    specifications: [
      { label: "Super Built-Up Area", value: `${currentResidence.superBuiltUpAreaSqft.toLocaleString()} sq.ft.` },
      { label: "Built-Up Area", value: `${currentResidence.builtUpAreaSqm} sq.m.` },
      { label: "Configuration", value: currentResidence.configuration },
      { label: "RERA Registration", value: currentResidence.reraNumber },
    ],
    amenityHighlights: [
      "5.3-Acre Master Land Parcel",
      "2-Acre Central Park",
      "25-Acre Lake Sightlines",
      "25,000 Sq.Ft. Resident Clubhouse",
    ],
  };

  return (
    <section
      id="residence-architectural-explorer"
      className={`relative py-12 lg:py-20 bg-background text-foreground ${className || ""}`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ── Section Header ───────────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-border">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-accent-600 dark:text-accent-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Interactive 2D ↔ 3D Residence Explorer</span>
            </div>
            <h2 className="mt-2 font-serif text-3xl font-medium tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Residences & Floor Plans
            </h2>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-2xl">
              Inspect authoritative 2D architectural layouts with interactive room detection and
              synchronized 3D spatial representations across all 13 verified configurations at Vision Amnaya.
            </p>
          </div>

          {/* View Mode Switcher (2D / 3D / Split) */}
          <div className="flex items-center gap-1 rounded-full border border-border bg-card p-1.5 shadow-sm self-start lg:self-auto">
            <button
              onClick={() => setViewMode("2d")}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] transition-all ${
                viewMode === "2d"
                  ? "bg-accent-500 text-neutral-950 font-semibold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>2D Floor Plan</span>
            </button>
            <button
              onClick={() => setViewMode("3d")}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] transition-all ${
                viewMode === "3d"
                  ? "bg-accent-500 text-neutral-950 font-semibold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Box className="h-3.5 w-3.5" />
              <span>3D Model</span>
            </button>
            <button
              onClick={() => setViewMode("split")}
              className={`hidden sm:flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] transition-all ${
                viewMode === "split"
                  ? "bg-accent-500 text-neutral-950 font-semibold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Columns className="h-3.5 w-3.5" />
              <span>2D ↔ 3D Split</span>
            </button>
          </div>
        </div>

        {/* ── Size & Configuration Horizontal Selector ─────────────────── */}
        <div className="my-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Select Residence Size ({AMNAYA_ARCHITECTURAL_RESIDENCES.length} Verified Configurations)
            </span>
            <span className="text-xs font-medium text-accent-600 dark:text-accent-400">
              {currentResidence.title} ({currentResidence.builtUpAreaSqm} Sq.M)
            </span>
          </div>

          <div className="flex gap-2.5 overflow-x-auto pb-3 pt-1 scrollbar-thin scrollbar-thumb-border">
            {AMNAYA_ARCHITECTURAL_RESIDENCES.map((res) => {
              const isSelected = res.id === currentResidence.id;

              return (
                <button
                  key={res.id}
                  onClick={() => selectResidence(res.id)}
                  className={`flex-shrink-0 flex flex-col items-start px-4 py-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "border-accent-500 bg-accent-50 dark:bg-accent-950/40 shadow-sm ring-1 ring-accent-500"
                      : "border-border bg-card hover:border-accent-400/50 hover:bg-surface-subtle"
                  }`}
                >
                  <span className="text-xs font-bold text-foreground">
                    {res.superBuiltUpAreaSqft.toLocaleString()} Sq.Ft.
                  </span>
                  <span className="text-[0.6875rem] text-muted-foreground mt-0.5">
                    {res.builtUpAreaSqm} Sq.M · {res.priceStarting}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Main Architectural Viewport Matrix ───────────────────────── */}
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          {/* Viewport Stage (2D, 3D, or Split) with Cinematic Motion */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <AnimatePresence mode="wait">
              {viewMode === "2d" && (
                <motion.div
                  key="view-2d"
                  initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: -8 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  <ResidenceFloorPlanStage
                    residence={currentResidence}
                    onExploreRoomIn3D={handleExploreRoomIn3D}
                  />
                </motion.div>
              )}

              {viewMode === "3d" && (
                <motion.div
                  key="view-3d"
                  initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: -8 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="rounded-2xl border border-border overflow-hidden bg-card shadow-sm"
                >
                  <Residence3DCanvas
                    residence={currentResidence}
                    className="aspect-[16/10] sm:aspect-[16/11] w-full"
                    onSwitchTo2D={() => setViewMode("2d")}
                  />
                </motion.div>
              )}

              {viewMode === "split" && (
                <motion.div
                  key="view-split"
                  initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="grid grid-cols-1 xl:grid-cols-2 gap-6"
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      Authoritative 2D Plan
                    </span>
                    <ResidenceFloorPlanStage
                      residence={currentResidence}
                      onExploreRoomIn3D={handleExploreRoomIn3D}
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      Synchronized 3D Spatial Representation
                    </span>
                    <div className="rounded-2xl border border-border overflow-hidden bg-card shadow-sm h-full min-h-[460px]">
                      <Residence3DCanvas
                        residence={currentResidence}
                        className="h-full w-full min-h-[460px]"
                        onSwitchTo2D={() => setViewMode("2d")}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Residence Meta & Specifications Sidebar */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Primary Details Card */}
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-accent-100 dark:bg-accent-950/60 px-3 py-1 text-[0.6875rem] font-semibold uppercase tracking-wider text-accent-700 dark:text-accent-300">
                  {currentResidence.status}
                </span>
                <span className="text-xs font-mono text-muted-foreground">
                  RERA: {currentResidence.reraNumber}
                </span>
              </div>

              <h3 className="mt-4 font-serif text-2xl font-medium text-foreground">
                {currentResidence.title}
              </h3>
              <p className="mt-1 text-sm font-semibold text-accent-600 dark:text-accent-400">
                Starting from {currentResidence.priceStarting}
              </p>

              {/* Key Specs Breakdown */}
              <div className="mt-6 flex flex-col gap-3 border-t border-border pt-4 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5" /> Super Built-up Area
                  </span>
                  <span className="font-semibold text-foreground">
                    {currentResidence.superBuiltUpAreaSqft.toLocaleString()} Sq.Ft.
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Built-up Area (Metric)</span>
                  <span className="font-semibold text-foreground">
                    {currentResidence.builtUpAreaSqm} Sq.M
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Configuration</span>
                  <span className="font-semibold text-foreground">
                    3 Bedrooms · 3 Bathrooms · Balcony
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" /> Possession
                  </span>
                  <span className="font-semibold text-foreground">
                    {currentResidence.possessionDate}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> Location
                  </span>
                  <span className="font-semibold text-foreground">
                    Khajaguda, Hyderabad
                  </span>
                </div>
              </div>

              {/* Verified Project Facts */}
              <div className="mt-6 rounded-xl bg-surface-subtle p-4 border border-border/60">
                <span className="text-[0.6875rem] font-semibold uppercase tracking-wider text-foreground">
                  Verified Project Standards
                </span>
                <ul className="mt-2.5 flex flex-col gap-2 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-accent-500 flex-shrink-0" />
                    <span>5.3 Acre Master Land Parcel (420 Total Units)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-accent-500 flex-shrink-0" />
                    <span>2-Acre Central Park & 25-Acre Lake Sightlines</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-accent-500 flex-shrink-0" />
                    <span>Double-Height 18ft Stilt Pedestrian Foyer</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-accent-500 flex-shrink-0" />
                    <span>25,000 Sq.Ft. 4-Level Resident Clubhouse</span>
                  </li>
                </ul>
              </div>

              {/* Action Trigger */}
              <div className="mt-6 flex flex-col gap-3">
                <Button
                  onClick={handleOpenEnquiry}
                  variant="primary"
                  size="lg"
                  className="w-full flex items-center justify-center gap-2"
                >
                  <PhoneCall className="h-4 w-4" />
                  <span>Enquire for {currentResidence.superBuiltUpAreaSqft} Sq.Ft.</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Synchronized Enquiry & Site Visit Modal */}
      <ResidenceEnquiryModal
        residence={residenceDTO as any}
        isOpen={isEnquiryModalOpen}
        onClose={() => setIsEnquiryModalOpen(false)}
        defaultMode="enquiry"
      />
    </section>
  );
}
