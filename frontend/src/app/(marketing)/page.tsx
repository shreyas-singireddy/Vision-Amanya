import type { Metadata } from "next";
import Link from "next/link";

import { ctaConfig } from "@config/cta";
import { projectAssets, projectConfig, amenityGroups } from "@config/project";
import { routes } from "@constants/routes";

import { Button } from "@components/ui/button";
import { Eyebrow, DisplayHeading } from "@components/ui/heading";

import { Section, SectionHeader } from "@components/layout/section";
import { MediaBand } from "@components/layout/media-band";
import { ScrollProgress } from "@components/layout/scroll-progress";
import { FloatingEnquiry } from "@components/layout/floating-enquiry";

import {
  CinematicIntro,
  HeroReveal,
  HeroRule,
  ImageReveal,
  WordReveal,
  Reveal,
  HoverReveal,
} from "@components/motion";

import { PinnedStorytelling } from "@components/motion/pinned-storytelling";
import { ProjectNumbers } from "@components/project/project-numbers";
import { InteractiveMasterplan } from "@components/project/interactive-masterplan";

import { AmenitiesGrid } from "./_sections/amenities-grid";
import { GalleryStrip } from "./_sections/gallery-strip";
import { HomepageEnquiryTeaser } from "./_sections/homepage-enquiry-teaser";

export const metadata: Metadata = {
  title: "Amnaya by Vision Infra — Luxury Residences, Khajaguda, Hyderabad",
  description:
    "420 premium 3 BHK residences on 5.3 acres with 2-acre garden, 25-acre lake view and 25,000 sq.ft. clubhouse. Khajaguda, Hyderabad.",
};

export default function HomePage() {
  return (
    <>
      {/* ── 01. CINEMATIC INTRO ───────────────────────────────────── */}
      <CinematicIntro />

      {/* ── SCROLL PROGRESS RAIL & FLOATING ENQUIRY ──────────────── */}
      <ScrollProgress />
      <FloatingEnquiry />

      {/* ── 02. CINEMATIC HERO ─────────────────────────────────────── */}
      <HeroReveal
        background={{
          src: projectAssets.hero,
          alt: "Vision Amnaya — premier luxury residences at Khajaguda, Hyderabad",
          priority: true,
        }}
        eyebrow={
          <span className="flex items-center gap-3">
            <HeroRule />
            <span className="text-xs font-medium uppercase tracking-[0.25em] text-neutral-50/90">
              {projectConfig.location}
            </span>
          </span>
        }
        headline={
          <WordReveal
            text="Where Khajaguda meets the lake"
            as="h1"
            className="font-serif text-display-2 sm:text-display-1 font-medium tracking-display text-neutral-50 max-w-4xl"
          />
        }
        subheading={
          <p className="text-lead text-neutral-50/80 max-w-2xl font-light leading-relaxed">
            {projectConfig.fullName} — 420 premium 3 BHK residences across 5.3 acres, framed by 2
            acres of central garden and an unobstructed 25-acre lake view.
          </p>
        }
        actions={
          <>
            <Button asChild variant="accent" size="lg">
              <Link href={routes.contact}>{ctaConfig.enquireNow.label}</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-neutral-50/30 text-neutral-50 hover:bg-neutral-50/10"
            >
              <Link href={routes.project}>{ctaConfig.exploreProject.label}</Link>
            </Button>
          </>
        }
        secondary={
          <div className="flex items-center gap-4">
            <span className="block h-px w-8 bg-accent-400" aria-hidden />
            <span className="text-xs font-medium uppercase tracking-eyebrow text-neutral-50/70">
              420 Residences · 3 BHK · 1,715–2,590 sq.ft.
            </span>
          </div>
        }
        depth
        overlay
      />

      {/* ── 03. PROJECT NUMBERS ───────────────────────────────────── */}
      <ProjectNumbers />

      {/* ── 04. ARCHITECTURE STORY (GSAP PINNED) ────────────────── */}
      <PinnedStorytelling
        id="architecture-story"
        eyebrow="The Architecture"
        title="Designed around light, landscape and everyday life"
        lead="The Amnaya towers emerge from a considered interplay of mass and void. Contemporary architecture married to the landscape, framed by deep balconies, controlled materiality, and direct orientation toward Hyderabad's green fringe."
        primaryImage={projectAssets.exterior01}
        primaryAlt="Amnaya — aerial architectural view"
        secondaryImage={projectAssets.exterior03}
        secondaryAlt="Amnaya — dusk building elevation"
        stats={[
          { label: "Building Height", value: "10 Floors" },
          { label: "Typology", value: "3 BHK Only" },
        ]}
      />

      {/* ── 05. RESIDENCES ────────────────────────────────────────── */}
      <Section id="residences" spacing="lg" tone="light">
        <SectionHeader
          eyebrow="Residences"
          title="Three-bedroom living, reimagined"
          description="Every residence at Amnaya is a 3 BHK configuration ranging from 1,715 to 2,590 sq.ft. — sized to live generously, not minimally."
          align="center"
        />

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              src: projectAssets.interior01,
              alt: "Amnaya — interior living space",
              title: "The Living Suite",
              desc: "Generous proportions, high ceilings, and a view that frames the horizon.",
            },
            {
              src: projectAssets.interior02,
              alt: "Amnaya — master bedroom interior",
              title: "The Master Bedroom",
              desc: "Designed for quiet elegance, daylight, and deep rest.",
            },
            {
              src: projectAssets.lifestyle,
              alt: "Amnaya — balcony lifestyle view",
              title: "Deep Balconies",
              desc: "Outdoor living spaces that merge interior comfort with lake views.",
            },
          ].map((item, i) => (
            <Reveal key={item.title} delay={i * 0.1}>
              <HoverReveal preset="elevate" className="h-full">
                <div className="group overflow-hidden rounded-card-lg bg-surface-subtle border border-border shadow-card h-full flex flex-col">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.src}
                      alt={item.alt}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    />
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-serif text-xl font-medium text-foreground">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </div>
              </HoverReveal>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-12 flex justify-center">
          <Button asChild variant="outline" size="lg">
            <Link href={routes.properties}>{ctaConfig.viewResidences.label}</Link>
          </Button>
        </Reveal>
      </Section>

      {/* ── 06. AMENITIES / CLUBHOUSE ─────────────────────────────── */}
      <Section id="amenities" tone="subtle" spacing="lg">
        <SectionHeader
          eyebrow="Amenities"
          title="25,000 sq.ft. clubhouse spine"
          description="The social and wellness anchor of Amnaya — 4 levels housing sports courts, guest rooms, gym, yoga, and rooftop pool."
          align="center"
        />
        <AmenitiesGrid groups={amenityGroups} className="mt-16" />
        <Reveal className="mt-12 flex justify-center">
          <Button asChild variant="primary" size="lg">
            <Link href={routes.amenities}>{ctaConfig.discoverAmenities.label}</Link>
          </Button>
        </Reveal>
      </Section>

      {/* ── MEDIA BAND (Rooftop Pool) ─────────────────────────────── */}
      <MediaBand
        image={{
          src: projectAssets.pool,
          alt: "Amnaya — rooftop swimming pool render",
        }}
        eyebrow="Amenities"
        title="Rooftop swimming pool & deck"
        height="default"
      />

      {/* ── 07. LAKE & LANDSCAPE STORY (GSAP PINNED) ─────────────── */}
      <PinnedStorytelling
        id="lake-landscape"
        eyebrow="The Landscape & Lake"
        title="Framed by a 2-acre garden & 25-acre lake view"
        lead="Amnaya's northern edge overlooks the Osman Sagar catchment. 2 acres of central garden buffer the towers from the entry road, creating a quiet sanctuary in Khajaguda."
        primaryImage={projectAssets.lake}
        primaryAlt="Amnaya — 25-acre lake view"
        secondaryImage={projectAssets.landscape}
        secondaryAlt="Amnaya — 2-acre garden landscape"
        stats={[
          { label: "Lake View Area", value: "25 Acres" },
          { label: "Central Garden", value: "2 Acres" },
        ]}
      />

      {/* ── 08. INTERACTIVE MASTERPLAN ───────────────────────────── */}
      <Section id="masterplan" spacing="lg" tone="light">
        <div className="flex flex-col gap-4 mb-12 text-center items-center">
          <Eyebrow>Masterplan</Eyebrow>
          <DisplayHeading as="h2" level={2} className="max-w-2xl">
            5.3 acres of considered layout
          </DisplayHeading>
          <p className="text-base text-muted-foreground max-w-xl">
            Inspect the official Amnaya site plan below. Click any hotspot to highlight towers,
            garden, entrance, and clubhouse zones.
          </p>
        </div>
        <InteractiveMasterplan />
      </Section>

      {/* ── 09. GALLERY STRIP ────────────────────────────────────── */}
      <Section id="gallery" tone="subtle" spacing="default">
        <GalleryStrip />
      </Section>

      {/* ── 10. LOCATION ─────────────────────────────────────────── */}
      <Section id="location" tone="dark" spacing="lg">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16 items-center">
          <Reveal className="lg:col-span-5 flex flex-col justify-center gap-6">
            <Eyebrow className="text-accent-400">Location</Eyebrow>
            <DisplayHeading as="h2" level={2} className="text-neutral-50 max-w-lg">
              Khajaguda — Hyderabad&apos;s quiet edge
            </DisplayHeading>
            <p className="text-base text-neutral-300 leading-relaxed max-w-md font-light">
              Khajaguda sits at the intersection of Hyderabad&apos;s established IT corridor and the
              open landscape of the Osman Sagar catchment. Within reach of major tech hubs while
              preserving daily calm.
            </p>
            <div className="mt-2 flex flex-wrap gap-4">
              <Button asChild variant="accent" size="md">
                <Link href={routes.location}>Explore location</Link>
              </Button>
            </div>
          </Reveal>

          <div className="lg:col-span-7">
            <ImageReveal
              src={projectAssets.location}
              alt="Amnaya — Khajaguda, Hyderabad location map render"
              aspect="landscape"
              sizes="(min-width: 1024px) 58vw, 100vw"
              className="w-full shadow-cinematic"
            />
          </div>
        </div>
      </Section>

      {/* ── 11. ENQUIRY / SITE VISIT CTA ──────────────────────────── */}
      <HomepageEnquiryTeaser />
    </>
  );
}
