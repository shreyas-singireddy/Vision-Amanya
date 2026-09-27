"use client";

/**
 * ResidenceExplorer — Composite Experience Container for Phase 6.6.
 *
 * Assembles all residence subcomponents into a cohesive architectural property experience:
 * Hero → Summary Specs → Visual Gallery → Unit & Floor Plan → 3D Experience → Actions → Similar Units.
 */

import { useState } from "react";
import type { Residence } from "@domain/residence";

import { ResidenceHero } from "./ResidenceHero";
import { ResidenceSummary } from "./ResidenceSummary";
import { ResidenceGallery } from "./ResidenceGallery";
import { ResidenceFloorPlan } from "./ResidenceFloorPlan";
import { Residence3D } from "./Residence3D";
import { ResidenceActions } from "./ResidenceActions";
import { SimilarResidences } from "./SimilarResidences";
import { ResidenceComparison } from "./ResidenceComparison";
import { ResidenceEnquiryModal } from "./ResidenceEnquiryModal";

export interface ResidenceExplorerProps {
  residence: Residence;
}

export function ResidenceExplorer({ residence }: ResidenceExplorerProps) {
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [enquiryMode, setEnquiryMode] = useState<"enquiry" | "visit">("enquiry");

  const handleOpenEnquiry = () => {
    setEnquiryMode("enquiry");
    setIsEnquiryOpen(true);
  };

  const handleOpenVisit = () => {
    setEnquiryMode("visit");
    setIsEnquiryOpen(true);
  };

  const scrollToSection = (id: string) => {
    if (typeof document !== "undefined") {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <article className="min-h-screen bg-background text-foreground">
      {/* 1. Architectural Hero */}
      <ResidenceHero
        residence={residence}
        onExplore3D={() => scrollToSection("experience-3d")}
        onViewFloorPlan={() => scrollToSection("floor-plan")}
      />

      {/* 2. Residence Summary & Specifications */}
      <ResidenceSummary residence={residence} />

      {/* 3. Visual Renderings Gallery */}
      <ResidenceGallery
        hero={residence.media.hero}
        images={residence.media.gallery}
        title={residence.title}
      />

      {/* 4. Unit & Floor Plan Viewer (Phase 6.5 Integration) */}
      <ResidenceFloorPlan residence={residence} />

      {/* 5. 3D Architectural Experience (Phase 6.4 Integration) */}
      <Residence3D residence={residence} />

      {/* 6. Primary Action Triggers */}
      <ResidenceActions
        residence={residence}
        onEnquire={handleOpenEnquiry}
        onScheduleVisit={handleOpenVisit}
      />

      {/* 7. Similar Residences Recommendations */}
      <SimilarResidences currentResidenceId={residence.id} />

      {/* Floating Side-by-Side Comparison Matrix */}
      <ResidenceComparison />

      {/* Auto-Populated Enquiry & Site Visit Modal */}
      <ResidenceEnquiryModal
        residence={residence}
        isOpen={isEnquiryOpen}
        onClose={() => setIsEnquiryOpen(false)}
        defaultMode={enquiryMode}
      />
    </article>
  );
}
