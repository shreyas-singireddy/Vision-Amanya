import type { Metadata } from "next";

import { projectAssets } from "@config/project";

import { FloatingEnquiry } from "@components/layout/floating-enquiry";
import { ScrollProgress } from "@components/layout/scroll-progress";
import { Section } from "@components/layout/section";

import { CinematicIntro, ImmersiveHero } from "@components/motion";

import { InteractiveMasterplan } from "@components/project/interactive-masterplan";
import { Eyebrow, DisplayHeading } from "@components/ui/heading";

import {
  AmenitiesExperience,
  AmnayaStory,
  ArchitectureSection,
  CinematicStatement,
  FinalCTA,
  LocationSection,
  NatureSection,
  ResidencesPreview,
} from "@components/amnaya/homepage";

import { HomepageGallery } from "./_sections/homepage-gallery";
import { AskAmnaya } from "@components/ai";

export const metadata: Metadata = {
  title: "Amnaya by Vision Infra — Luxury Lake-Facing Residences, Khajaguda, Hyderabad",
  description:
    "420 premium 3 BHK residences across 5.3 acres with 2-acre central garden, 25-acre lake view and 25,000 sq.ft. clubhouse. Khajaguda, Hyderabad.",
};

export default function HomePage() {
  return (
    <>
      {/* ── 01. CINEMATIC INTRO (Optional overlay sequence) ──────── */}
      <CinematicIntro />

      {/* ── SCROLL PROGRESS RAIL & FLOATING ENQUIRY ──────────────── */}
      <ScrollProgress />
      <FloatingEnquiry />

      {/* ── 01. IMMERSIVE HERO — 2.5D architectural depth scene ──── */}
      <ImmersiveHero
        heroSrc={projectAssets.hero}
        heroAlt="Vision Amnaya — premier luxury residences at Khajaguda, Hyderabad"
      />

      {/* ── 02. CINEMATIC STATEMENT — High-impact typography reveal */}
      <CinematicStatement
        quote="Where Khajaguda meets the lake, architecture learns to breathe."
        author="Vision Amnaya — Khajaguda, Hyderabad"
      />

      <AskAmnaya variant="hero" label="Ask Amnaya AI Consultant" />

      {/* ── 03. THE AMNAYA STORY — Asymmetric editorial narrative ──── */}
      <AmnayaStory />

      {/* ── 04. ARCHITECTURE — "Architecture shaped by light" ────── */}
      <ArchitectureSection />

      {/* ── 05. LAKE & NATURE — "Where the city meets stillness" ──── */}
      <NatureSection />

      {/* ── 06. RESIDENCES PREVIEW — Reimagined 3 BHK living ──────── */}
      <ResidencesPreview />

      {/* ── 07. AMENITIES EXPERIENCE — 25,000 sq.ft. clubhouse spine ── */}
      <AmenitiesExperience />

      {/* ── 08. INTERACTIVE MASTERPLAN — 5.3-acre site plan exploration */}
      <Section id="masterplan" spacing="lg" tone="light">
        <div className="flex flex-col gap-4 mb-12 text-center items-center">
          <Eyebrow>Masterplan</Eyebrow>
          <DisplayHeading as="h2" level={2} className="max-w-2xl">
            5.3 acres of considered layout
          </DisplayHeading>
          <p className="text-base text-muted-foreground max-w-xl font-light">
            Inspect the official Amnaya site plan below. Click any hotspot to highlight towers,
            garden, entrance, and clubhouse zones.
          </p>
        </div>
        <InteractiveMasterplan />
      </Section>

      {/* ── 09. EDITORIAL GALLERY — Asymmetric grid & lightbox ───── */}
      <HomepageGallery />

      {/* ── 10. LOCATION STORY — Khajaguda, Hyderabad ─────────────── */}
      <LocationSection />

      {/* ── 11. FINAL CONVERSION CTA — "Your view begins here" ────── */}
      <FinalCTA />
    </>
  );
}
