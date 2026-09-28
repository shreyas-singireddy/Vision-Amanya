import type { Metadata } from "next";
import Link from "next/link";

import { routes } from "@constants/routes";
import { projectAssets } from "@config/project";
import { residenceService } from "@services/residence.service";

import { Section, SectionHeader } from "@components/layout/section";
import { HeroReveal, HeroRule, WordReveal, Reveal } from "@components/motion";
import { ResidenceCard } from "@components/property/residence-card";
import { ResidenceComparison } from "@components/amnaya/residences/ResidenceComparison";
import { ResidenceArchitecturalExplorer } from "@components/amnaya/residence-explorer";
import { CtaSection } from "@components/layout/cta-section";
import { ctaConfig } from "@config/cta";

export const metadata: Metadata = {
  title: "Residences Directory — Vision Amnaya",
  description:
    "Explore 420 luxury 3 BHK residences across 10 floors at Amnaya, Khajaguda, Hyderabad. Compare lake views, garden orientations, and floor plan typologies.",
};

export default async function ResidencesDirectoryPage() {
  const residences = await residenceService.list();

  return (
    <>
      {/* Hero */}
      <HeroReveal
        background={{
          src: projectAssets.interior01,
          alt: "Vision Amnaya — luxury residence interior",
          priority: true,
        }}
        eyebrow={
          <span className="flex items-center gap-3">
            <HeroRule />
            <span className="text-xs font-medium uppercase tracking-eyebrow text-neutral-50/80">
              Residences Directory
            </span>
          </span>
        }
        headline={
          <WordReveal
            text="Discover your residence"
            as="h1"
            className="font-serif text-display-2 font-medium tracking-display text-neutral-50"
          />
        }
        subheading={
          <p className="text-lead text-neutral-50/75">
            420 three-bedroom residences framed by 2 acres of central garden and 25 acres of lake
            view.
          </p>
        }
        minHeight="min-h-[65vh]"
        depth
        overlay
      />

      {/* Interactive 2D ↔ 3D Architectural Floor Plan Explorer (Phase 1 Foundation) */}
      <ResidenceArchitecturalExplorer />


      {/* Overview */}
      <Section id="residences-grid" spacing="lg" tone="light">
        <SectionHeader
          eyebrow="Available Inventory"
          title="Explore Amnaya Residences"
          description="Select any residence to inspect full specifications, 3D building placement, unit floor plan, and lake view orientation."
          align="center"
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {residences.map((res, i) => (
            <Reveal key={res.id} delay={i * 0.1}>
              <Link href={routes.residenceDetail(res.id)} className="block h-full">
                <ResidenceCard
                  src={res.media.hero}
                  alt={res.title}
                  title={res.title}
                  subtitle={`${res.typology} · ${res.location.building} Floor ${res.location.floor}`}
                  price={res.priceDisplay || "Price on Request"}
                  area={`${res.superBuiltUpAreaSqft.toLocaleString()} sq.ft.`}
                  beds={res.bedrooms}
                  baths={res.bathrooms}
                  badge="available"
                />
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Floating Comparison Drawer */}
      <ResidenceComparison />

      {/* CTA Section */}
      <CtaSection
        eyebrow="Personalized Assistance"
        title="Need guidance choosing the right floor?"
        lead="Our advisory team can walk you through exact availability across Towers A, B, C, and D."
        primaryCta={ctaConfig.enquireNow}
        secondaryCta={ctaConfig.scheduleSiteVisit}
      />
    </>
  );
}
