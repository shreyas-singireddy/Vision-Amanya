import type { Metadata } from "next";
import { ctaConfig } from "@config/cta";
import { projectAssets } from "@config/project";
import { CtaSection } from "@components/layout/cta-section";
import { HeroReveal, HeroRule, WordReveal } from "@components/motion";
import { GalleryClient } from "./gallery-client";

export const metadata: Metadata = {
  title: "Gallery — Amnaya by Vision Infra",
  description:
    "Architectural renders, exterior views, interior photography, amenities, and landscape imagery from Vision Amnaya, Khajaguda, Hyderabad.",
};

export default function GalleryPage() {
  return (
    <>
      {/* Hero */}
      <HeroReveal
        background={{
          src: projectAssets.exterior01,
          alt: "Amnaya — aerial view",
          priority: true,
        }}
        eyebrow={
          <span className="flex items-center gap-3">
            <HeroRule />
            <span className="text-xs font-medium uppercase tracking-eyebrow text-neutral-50/80">
              Gallery
            </span>
          </span>
        }
        headline={
          <WordReveal
            text="Architectural Gallery"
            as="h1"
            className="font-serif text-display-2 font-medium tracking-display text-neutral-50"
          />
        }
        subheading={
          <p className="text-lead text-neutral-50/75">
            Verified architectural renders, exterior elevations, living interiors, amenities, and
            site imagery from Vision Amnaya.
          </p>
        }
        minHeight="min-h-[60vh]"
        depth
        overlay
      />

      {/* Gallery Client with Category Filter Tabs & Fullscreen Lightbox */}
      <GalleryClient />

      {/* CTA */}
      <CtaSection
        eyebrow="Enquire"
        title="Experience Amnaya in person"
        lead="Renders communicate a fraction of the reality. Schedule a site visit."
        primaryCta={ctaConfig.scheduleSiteVisit}
        secondaryCta={ctaConfig.enquireNow}
      />
    </>
  );
}
