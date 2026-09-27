import type { Metadata } from "next";

import { ctaConfig } from "@config/cta";
import { projectAssets, projectConfig, projectFacts } from "@config/project";

import { Eyebrow, DisplayHeading } from "@components/ui/heading";

import { Section } from "@components/layout/section";
import { SplitSection } from "@components/layout/split-section";
import { MediaBand } from "@components/layout/media-band";
import { StatStrip } from "@components/layout/stat-strip";
import { CtaSection } from "@components/layout/cta-section";

import { HeroReveal, HeroRule, ImageReveal, WordReveal, Reveal } from "@components/motion";

export const metadata: Metadata = {
  title: "The Project — Amnaya by Vision Infra",
  description:
    "Vision Amnaya: 420 three-bedroom residences on 5.3 acres in Khajaguda, Hyderabad. Architecture, design concept, and project overview.",
};

export default function ProjectPage() {
  return (
    <>
      {/* Hero */}
      <HeroReveal
        background={{
          src: projectAssets.exterior01,
          alt: "Amnaya — aerial view of the development",
          priority: true,
        }}
        eyebrow={
          <span className="flex items-center gap-3">
            <HeroRule />
            <span className="text-xs font-medium uppercase tracking-eyebrow text-neutral-50/80">
              The Project
            </span>
          </span>
        }
        headline={
          <WordReveal
            text="Vision Amnaya"
            as="h1"
            className="font-serif text-display-1 font-medium tracking-display text-neutral-50"
          />
        }
        subheading={
          <p className="text-lead text-neutral-50/75">
            {projectConfig.tagline} — {projectConfig.location}.
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

      {/* Introduction */}
      <Section id="story" spacing="lg" tone="light">
        <div className="mx-auto max-w-3xl">
          <Reveal className="flex flex-col gap-6 text-center items-center">
            <Eyebrow>The Story</Eyebrow>
            <DisplayHeading as="h2" level={2}>
              A project of considered restraint
            </DisplayHeading>
            <p className="text-lead text-muted-foreground">
              Amnaya was conceived from a simple idea: that a residential project should respond to
              where it is, not override it. The 5.3-acre site at Khajaguda sits on the southern edge
              of Hyderabad&apos;s natural lake belt. The project&apos;s orientation, massing, and
              landscaping all work in service of that setting.
            </p>
            <p className="text-base text-muted-foreground">
              The result is 420 three-bedroom residences — each between 1,715 and 2,590 sq.ft. —
              organized across 10 floors, with a 2-acre central garden and unobstructed views of the
              25-acre Osman Sagar fringe.
            </p>
          </Reveal>
        </div>
      </Section>

      {/* Architecture */}
      <SplitSection
        eyebrow="Architecture"
        title="Contemporary architecture, permanent material"
        body="The Amnaya towers are designed for the long view. The architecture favors solid geometry over decoration — controlled rhythms of facade panels, recessed balconies that provide shade without sacrificing view, and a material palette that ages well in the Hyderabad climate."
        image={{
          src: projectAssets.architecture,
          alt: "Amnaya — architectural design concept",
        }}
        className="py-section"
      />

      {/* Entrance */}
      <Section id="entrance" spacing="default" tone="subtle">
        <SplitSection
          reversed
          eyebrow="Arrival"
          title="The double-height stilt entrance"
          body="Every resident's experience of Amnaya begins at the stilt level — a double-height covered arrival forecourt that frames the garden and, beyond it, the lake. The scale of this space sets the register for everything that follows."
          image={{
            src: projectAssets.entrance,
            alt: "Amnaya — double-height stilt entrance",
          }}
        />
      </Section>

      {/* Media band */}
      <MediaBand
        image={{
          src: projectAssets.exterior04,
          alt: "Amnaya — building front elevation",
        }}
        eyebrow="Amnaya"
        title="Khajaguda, Hyderabad"
        height="compact"
      />

      {/* Garden & lake */}
      <Section id="landscape" spacing="lg" tone="light">
        <div className="grid gap-12 lg:grid-cols-2">
          <Reveal>
            <div className="flex flex-col gap-6">
              <Eyebrow>Garden</Eyebrow>
              <DisplayHeading as="h2" level={3}>
                2 acres of garden view
              </DisplayHeading>
              <p className="text-base text-muted-foreground">
                The 2-acre central garden separates the residential towers from the road. Landscaped
                pathways, native planting, and curated lighting create a ground plane that rewards
                daily use.
              </p>
              <ImageReveal
                src={projectAssets.landscape}
                alt="Amnaya — 2-acre landscape garden"
                aspect="landscape"
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="mt-4 w-full"
              />
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="flex flex-col gap-6">
              <Eyebrow>Lake</Eyebrow>
              <DisplayHeading as="h2" level={3}>
                25 acres of lake view
              </DisplayHeading>
              <p className="text-base text-muted-foreground">
                The northern edge of the site opens directly to the Osman Sagar catchment. Every
                north-facing residence captures an uninterrupted lake view — the defining feature of
                life at Amnaya.
              </p>
              <ImageReveal
                src={projectAssets.lake}
                alt="Amnaya — 25-acre lake view"
                aspect="landscape"
                delay={0.2}
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="mt-4 w-full"
              />
            </div>
          </Reveal>
        </div>
      </Section>

      {/* CTA */}
      <CtaSection
        eyebrow="Enquire"
        title="Ready to know more?"
        lead="Request a brochure, schedule a site visit, or ask our team a question."
        primaryCta={ctaConfig.enquireNow}
        secondaryCta={ctaConfig.scheduleSiteVisit}
      />
    </>
  );
}
