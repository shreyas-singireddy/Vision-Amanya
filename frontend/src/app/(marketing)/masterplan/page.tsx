import type { Metadata } from "next";

import { ctaConfig } from "@config/cta";
import { projectAssets, projectFacts } from "@config/project";
import { amnayanMigratedAssets } from "@config/media";

import { Eyebrow, DisplayHeading } from "@components/ui/heading";

import { Section, SectionHeader } from "@components/layout/section";
import { StatStrip } from "@components/layout/stat-strip";
import { CtaSection } from "@components/layout/cta-section";

import { HeroReveal, HeroRule, WordReveal, Reveal } from "@components/motion";
import { InteractiveMasterplan } from "@components/project/interactive-masterplan";

export const metadata: Metadata = {
  title: "Masterplan — Amnaya by Vision Infra",
  description:
    "The official Vision Amnaya site masterplan — 5.3 acres in Khajaguda, Hyderabad. Tower placement, garden, lake orientation, and community layout.",
};

/** Site information drawn from verified project documentation. */
const siteInfo = [
  {
    heading: "5.3 Acres",
    label: "Total site area",
    description:
      "The Amnaya campus spans 5.3 acres in Khajaguda — enough space for towers, gardens, and a full clubhouse facility without compromise.",
  },
  {
    heading: "2 Acres",
    label: "Central garden",
    description:
      "The central garden separates the residential towers from the road. A landscaped buffer zone that doubles as the community's daily open-air living room.",
  },
  {
    heading: "25 Acres",
    label: "Lake view",
    description:
      "The northern boundary of the site faces the 25-acre Osman Sagar catchment. The layout preserves this view for the maximum number of residences.",
  },
  {
    heading: "10 Floors",
    label: "Building height",
    description:
      "A height that balances density with view. Every floor captures the garden below and the lake beyond.",
  },
] as const;

export default function MasterplanPage() {
  return (
    <>
      {/* Hero */}
      <HeroReveal
        background={{
          src: amnayanMigratedAssets.aerialAmenityZone,
          alt: "Vision Amnaya — aerial bird's-eye amenity zone and site plan",
          priority: true,
        }}
        eyebrow={
          <span className="flex items-center gap-3">
            <HeroRule />
            <span className="text-xs font-medium uppercase tracking-eyebrow text-neutral-50/80">
              Masterplan
            </span>
          </span>
        }
        headline={
          <WordReveal
            text="5.3 acres of considered space"
            as="h1"
            className="font-serif text-display-2 font-medium tracking-display text-neutral-50"
          />
        }
        subheading={
          <p className="text-lead text-neutral-50/75">
            The Amnaya site plan places every decision — tower orientation, garden placement,
            entrance sequence — in service of the landscape and the community.
          </p>
        }
        minHeight="min-h-[70vh]"
        depth
        overlay
      />

      {/* Stats */}
      <section className="border-b border-border bg-background py-section-sm">
        <StatStrip stats={[...projectFacts]} />
      </section>

      {/* Masterplan image */}
      <Section id="masterplan" spacing="lg" tone="light">
        <Reveal className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <Eyebrow>Official Masterplan</Eyebrow>
            <DisplayHeading as="h2" level={2}>
              The site layout
            </DisplayHeading>
            <p className="text-base text-muted-foreground max-w-2xl">
              The official Vision Amnaya masterplan — showing tower positions, garden corridors,
              entrance road, clubhouse footprint, and open-air spaces.
            </p>
          </div>

          {/* Interactive masterplan canvas with zoom & hotspot highlights */}
          <InteractiveMasterplan />
        </Reveal>
      </Section>

      {/* Site information grid */}
      <Section id="site-information" spacing="default" tone="subtle">
        <SectionHeader eyebrow="Site Information" title="Understanding the layout" align="center" />
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {siteInfo.map((info, i) => (
            <Reveal key={info.heading} delay={i * 0.1}>
              <div className="flex flex-col gap-4 rounded-card border border-border bg-card p-6 shadow-card">
                <div>
                  <p className="font-serif text-3xl font-medium text-primary-700">{info.heading}</p>
                  <p className="text-xs font-medium uppercase tracking-label text-muted-foreground">
                    {info.label}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">{info.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <CtaSection
        eyebrow="Enquire"
        title="See the site in person"
        lead="A site visit gives context that a plan cannot. Schedule yours today."
        primaryCta={ctaConfig.scheduleSiteVisit}
        secondaryCta={ctaConfig.enquireNow}
      />
    </>
  );
}
