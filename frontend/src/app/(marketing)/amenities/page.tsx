import type { Metadata } from "next";
import Link from "next/link";

import { ctaConfig } from "@config/cta";
import { projectAssets, amenityGroups, featuredAmenities } from "@config/project";
import { routes } from "@constants/routes";

import { Button } from "@components/ui/button";
import { Container } from "@components/ui/container";
import { Eyebrow, DisplayHeading } from "@components/ui/heading";

import { Section, SectionHeader } from "@components/layout/section";
import { SplitSection } from "@components/layout/split-section";
import { MediaBand } from "@components/layout/media-band";
import { CtaSection } from "@components/layout/cta-section";

import { HeroReveal, HeroRule, ImageReveal, WordReveal, Reveal, Stagger } from "@components/motion";

export const metadata: Metadata = {
  title: "Amenities — Amnaya by Vision Infra",
  description:
    "25,000 sq.ft. clubhouse, rooftop swimming pool, badminton courts, gym, spa and more at Amnaya, Khajaguda, Hyderabad.",
};

export default function AmenitiesPage() {
  return (
    <>
      {/* Hero */}
      <HeroReveal
        background={{
          src: projectAssets.amenities,
          alt: "Amnaya amenities — overview",
          priority: true,
        }}
        eyebrow={
          <span className="flex items-center gap-3">
            <HeroRule />
            <span className="text-xs font-medium uppercase tracking-eyebrow text-neutral-50/80">
              Amenities
            </span>
          </span>
        }
        headline={
          <WordReveal
            text="25,000 sq.ft. of shared life"
            as="h1"
            className="font-serif text-display-2 font-medium tracking-display text-neutral-50"
          />
        }
        subheading={
          <p className="text-lead text-neutral-50/75">
            The Amnaya clubhouse is not an afterthought — it is the social and wellness centre of
            the community. Every pursuit has a home here.
          </p>
        }
        minHeight="min-h-[70vh]"
        depth
        overlay
      />

      {/* Featured amenities strip */}
      <section className="border-b border-border bg-background py-section-sm">
        <Container>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4 justify-center">
            {featuredAmenities.map((a, i) => (
              <span key={a} className="flex items-center gap-2">
                {i > 0 && <span aria-hidden className="hidden h-4 w-px bg-border sm:block" />}
                <span className="text-sm font-medium text-foreground">{a}</span>
              </span>
            ))}
          </div>
        </Container>
      </section>

      {/* Clubhouse */}
      <Section id="clubhouse" spacing="lg" tone="light">
        <SplitSection
          eyebrow="Clubhouse"
          title="The 25,000 sq.ft. clubhouse"
          body="The Amnaya clubhouse anchors the community's social life. A full floor of shared space — fitness facilities, sports courts, meeting spaces, and leisure rooms — designed so that residents never have to leave the campus for any recreational pursuit."
          image={{
            src: projectAssets.clubhouse01,
            alt: "Amnaya — clubhouse interior",
          }}
        />
      </Section>

      {/* Pool */}
      <MediaBand
        image={{
          src: projectAssets.pool,
          alt: "Amnaya — rooftop swimming pool",
        }}
        eyebrow="Amenities"
        title="Rooftop swimming pool"
        height="default"
      />

      {/* Amenity groups grid */}
      <Section id="all-amenities" spacing="lg" tone="subtle">
        <SectionHeader eyebrow="All Amenities" title="Everything in one place" align="center" />

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {amenityGroups.map((group, gi) => (
            <Reveal key={group.id} delay={gi * 0.1}>
              <div className="flex flex-col gap-6 rounded-card-lg border border-border bg-card p-8 shadow-card">
                <div>
                  <span className="numeric text-xs font-medium text-accent-500">
                    {String(gi + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-2 font-serif text-xl font-medium text-foreground">
                    {group.label}
                  </h3>
                </div>
                <ul className="flex flex-col gap-3">
                  {group.items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <span
                        aria-hidden
                        className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500"
                      />
                      <span className="text-sm text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Clubhouse continued */}
      <Section id="clubhouse-detail" spacing="lg" tone="light">
        <SplitSection
          reversed
          eyebrow="Wellness"
          title="Spa, salon, and meditation"
          body="The wellness wing of the Amnaya clubhouse is designed for daily use — not occasion visits. The spa, salon, and dedicated meditation and yoga room sit adjacent to the gym and aerobics studio, so a complete wellness routine is a short walk from your front door."
          image={{
            src: projectAssets.clubhouse02,
            alt: "Amnaya — clubhouse amenities continued",
          }}
        />
      </Section>

      {/* CTA */}
      <CtaSection
        eyebrow="Enquire"
        title="Discover Amnaya in person"
        lead="A site visit is the best way to experience the scale of the clubhouse and the quality of the amenities."
        primaryCta={ctaConfig.scheduleSiteVisit}
        secondaryCta={ctaConfig.enquireNow}
      />
    </>
  );
}
