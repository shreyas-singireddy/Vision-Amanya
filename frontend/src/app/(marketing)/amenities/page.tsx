import type { Metadata } from "next";

import { ctaConfig } from "@config/cta";
import { amenityGroups, featuredAmenities } from "@config/project";
import { amnayanMigratedAssets } from "@config/media";

import { Container } from "@components/ui/container";
import { Section, SectionHeader } from "@components/layout/section";
import { CtaSection } from "@components/layout/cta-section";
import { HeroReveal, HeroRule, WordReveal, Reveal } from "@components/motion";

import { AmenityExperienceSection } from "./_sections/amenity-experience-section";
import { AmenityCollectionGrid } from "./_sections/amenity-collection-grid";

export const metadata: Metadata = {
  title: "Amenities — Amnaya by Vision Infra",
  description:
    "Explore the 25,000 sq.ft. Amnaya clubhouse spine interactively — rooftop swimming pool, sports courts, gym, spa, children's play area, pet park, jogging track and more at Khajaguda, Hyderabad.",
};

export default function AmenitiesPage() {
  return (
    <>
      {/* Hero */}
      <HeroReveal
        background={{
          src: amnayanMigratedAssets.rooftopPool,
          alt: "Vision Amnaya — rooftop swimming pool overlooking lake horizon and clubhouse spine",
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

      {/* ── INTERACTIVE 3D AMENITY EXPERIENCE ─────────────────────────────── */}
      <AmenityExperienceSection />

      {/* ── AMENITY COLLECTION GRID ───────────────────────────────────────── */}
      <AmenityCollectionGrid />

      {/* Clubhouse amenity groups */}
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
