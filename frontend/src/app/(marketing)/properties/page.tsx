import type { Metadata } from "next";
import Link from "next/link";

import { ctaConfig } from "@config/cta";
import { projectAssets } from "@config/project";
import { routes } from "@constants/routes";

import { Button } from "@components/ui/button";
import { Eyebrow, DisplayHeading } from "@components/ui/heading";

import { Section, SectionHeader } from "@components/layout/section";
import { CtaSection } from "@components/layout/cta-section";

import {
  HeroReveal,
  HeroRule,
  ImageReveal,
  WordReveal,
  Reveal,
  HoverReveal,
} from "@components/motion";

import { FloorPlanExplorer, type FloorPlan } from "@components/property/floor-plan-explorer";

export const metadata: Metadata = {
  title: "Residences — Amnaya by Vision Infra",
  description:
    "3 BHK luxury residences from 1,715 to 2,590 sq.ft. at Amnaya, Khajaguda, Hyderabad. Floor plans and apartment configurations.",
};

/** All residence configurations at Amnaya — sourced from project documentation. */
const residencePlans: FloorPlan[] = [
  {
    id: "type-a",
    tabLabel: "Type A",
    title: "3 BHK — Type A",
    area: "1,715 sq.ft.",
    note: "Garden-facing",
    src: projectAssets.floorplanA,
    alt: "Amnaya 3 BHK Type A floor plan",
    description:
      "A compact, efficient 3 BHK configuration with generous living-dining space and garden-facing orientation.",
    tag: "Residence",
  },
  {
    id: "type-b",
    tabLabel: "Type B",
    title: "3 BHK — Type B",
    area: "2,100 sq.ft.",
    note: "Lake-facing",
    src: projectAssets.floorplanB,
    alt: "Amnaya 3 BHK Type B floor plan",
    description:
      "The lake-facing configuration — positioned to capture the full 25-acre view from the main living area.",
    tag: "Residence",
  },
  {
    id: "type-c",
    tabLabel: "Type C",
    title: "3 BHK — Type C",
    area: "2,590 sq.ft.",
    note: "Corner — Dual aspect",
    src: projectAssets.floorplanC,
    alt: "Amnaya 3 BHK Type C floor plan",
    description:
      "The largest configuration — a dual-aspect corner residence with extended balcony and panoramic views.",
    tag: "Residence",
  },
  {
    id: "block",
    tabLabel: "Block Plan",
    title: "Typical block layout",
    note: "10 floors per block",
    src: projectAssets.blockPlan,
    alt: "Amnaya typical block plan",
    description:
      "The typical block arrangement across each tower floor. Exact unit placement and availability are available on request.",
    tag: "Typical floor",
    ctaLabel: "Enquire about availability",
  },
];

/** Interior feature cards */
const features = [
  {
    src: projectAssets.interior01,
    alt: "Amnaya — interior living space",
    title: "Living & Dining",
    desc: "Proportioned for comfort, not just display. Full-height windows, curated finishes, and enough room to live in.",
  },
  {
    src: projectAssets.interior02,
    alt: "Amnaya — master bedroom",
    title: "Master Bedroom",
    desc: "Large enough for a sitting area. Lake-facing in the Type B and C configurations.",
  },
  {
    src: projectAssets.lifestyle,
    alt: "Amnaya — lifestyle and community",
    title: "Community",
    desc: "Life at Amnaya extends beyond the front door — the clubhouse, garden, and lake are your extended living space.",
  },
] as const;

export default function PropertiesPage() {
  return (
    <>
      {/* Hero */}
      <HeroReveal
        background={{
          src: projectAssets.interior01,
          alt: "Amnaya — premium 3 BHK interior",
          priority: true,
        }}
        eyebrow={
          <span className="flex items-center gap-3">
            <HeroRule />
            <span className="text-xs font-medium uppercase tracking-eyebrow text-neutral-50/80">
              Residences
            </span>
          </span>
        }
        headline={
          <WordReveal
            text="Three bedrooms. Every configuration."
            as="h1"
            className="font-serif text-display-2 font-medium tracking-display text-neutral-50"
          />
        }
        subheading={
          <p className="text-lead text-neutral-50/75">
            Amnaya offers 420 3 BHK residences from 1,715 to 2,590 sq.ft. — three configurations,
            each oriented to capture the landscape.
          </p>
        }
        minHeight="min-h-[70vh]"
        depth
        overlay
      />

      {/* Residence overview */}
      <Section id="overview" spacing="lg" tone="light">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal className="flex flex-col gap-6 items-center">
            <Eyebrow>3 BHK Residences</Eyebrow>
            <DisplayHeading as="h2" level={2}>
              1,715 – 2,590 sq.ft.
            </DisplayHeading>
            <p className="text-lead text-muted-foreground">
              Every residence at Amnaya is a three-bedroom apartment. The range of sizes across
              three configurations allows residents to choose between compact efficiency,
              lake-facing orientation, or the full dual-aspect corner layout.
            </p>
          </Reveal>
        </div>
      </Section>

      {/* Interactive floor plan explorer */}
      <Section id="floor-plans" spacing="default" tone="subtle">
        <SectionHeader
          eyebrow="Configurations"
          title="Choose your residence"
          description="Three 3 BHK configurations — each with distinct orientation, size, and character. Compare layouts, then view any plan in full."
          align="center"
        />

        <Reveal className="mt-16">
          <FloorPlanExplorer plans={residencePlans} />
        </Reveal>

        <Reveal className="mt-8">
          <p className="text-center text-xs text-muted-foreground">
            * Floor plan images are representative. Exact configurations available on request.
          </p>
        </Reveal>
      </Section>

      {/* Interior features */}
      <Section id="interiors" spacing="lg" tone="light">
        <SectionHeader eyebrow="Interiors" title="Space designed to live in" align="center" />

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.12}>
              <HoverReveal preset="lift">
                <div className="flex flex-col gap-4">
                  <ImageReveal
                    src={f.src}
                    alt={f.alt}
                    aspect="landscape"
                    delay={i * 0.1}
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="w-full"
                  />
                  <div>
                    <h3 className="font-serif text-xl font-medium text-foreground">{f.title}</h3>
                    <p className="mt-2 text-base text-muted-foreground">{f.desc}</p>
                  </div>
                </div>
              </HoverReveal>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Full masterplan teaser */}
      <Section id="masterplan-teaser" spacing="default" tone="dark">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-5 flex flex-col gap-6">
            <Eyebrow className="text-accent-400">Masterplan</Eyebrow>
            <DisplayHeading as="h2" level={2} className="text-neutral-50">
              Understanding the layout
            </DisplayHeading>
            <p className="text-base text-neutral-50/70">
              The tower positioning, garden orientation, and approach sequence are best understood
              in the site masterplan. Every decision is there.
            </p>
            <Button asChild variant="accent" size="md">
              <Link href={routes.masterplan}>{ctaConfig.viewMasterplan.label}</Link>
            </Button>
          </Reveal>

          <div className="lg:col-span-7">
            <ImageReveal
              src={projectAssets.masterplan01}
              alt="Amnaya — official site masterplan"
              aspect="landscape"
              sizes="(min-width: 1024px) 58vw, 100vw"
              className="w-full"
            />
          </div>
        </div>
      </Section>

      {/* CTA */}
      <CtaSection
        eyebrow="Enquire"
        title="Request a floor plan or schedule a visit"
        lead="Our team can walk you through each configuration and answer any questions."
        primaryCta={ctaConfig.enquireNow}
        secondaryCta={ctaConfig.scheduleSiteVisit}
      />
    </>
  );
}
