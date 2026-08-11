import type { Metadata } from "next";
import Link from "next/link";

import { ctaConfig } from "@config/cta";
import { projectAssets, projectConfig } from "@config/project";
import { routes } from "@constants/routes";

import { Button } from "@components/ui/button";
import { Container } from "@components/ui/container";
import { Eyebrow, DisplayHeading } from "@components/ui/heading";

import { Section } from "@components/layout/section";
import { MediaBand } from "@components/layout/media-band";
import { CtaSection } from "@components/layout/cta-section";

import { HeroReveal, HeroRule, ImageReveal, WordReveal, Reveal, Stagger } from "@components/motion";

export const metadata: Metadata = {
  title: "About Vision Infra Developers — Amnaya",
  description:
    "Vision Infra Developers is the developer behind Vision Amnaya — a premium residential project in Khajaguda, Hyderabad.",
};

const developerValues = [
  {
    label: "Architecture first",
    description:
      "Every Vision Infra project begins with architecture — the site, the orientation, the materials — before any commercial consideration is applied.",
  },
  {
    label: "Honest construction",
    description:
      "Vision Infra builds what it shows. The renders reflect the finished product. The specifications are upheld in the field.",
  },
  {
    label: "Long-term thinking",
    description:
      "Buildings should age well. Vision Infra chooses materials and construction methods for permanence, not quick delivery.",
  },
  {
    label: "Community over density",
    description:
      "Amnaya's 5.3 acres support 420 homes — a density chosen to leave room for garden, community, and view.",
  },
] as const;

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <HeroReveal
        background={{
          src: projectAssets.exterior02,
          alt: "Vision Amnaya — architecture",
          priority: true,
        }}
        eyebrow={
          <span className="flex items-center gap-3">
            <HeroRule />
            <span className="text-xs font-medium uppercase tracking-eyebrow text-neutral-50/80">
              The Developer
            </span>
          </span>
        }
        headline={
          <WordReveal
            text="Vision Infra Developers"
            as="h1"
            className="font-serif text-display-2 font-medium tracking-display text-neutral-50"
          />
        }
        subheading={
          <p className="text-lead text-neutral-50/75">
            The developer behind Vision Amnaya — committed to residential architecture that earns
            its place in Hyderabad&apos;s landscape.
          </p>
        }
        minHeight="min-h-[65vh]"
        depth
        overlay
      />

      {/* Introduction */}
      <Section id="introduction" spacing="lg" tone="light">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-5 flex flex-col justify-center gap-6">
            <Eyebrow>Vision Infra Developers</Eyebrow>
            <DisplayHeading as="h2" level={2}>
              Built on conviction
            </DisplayHeading>
            <p className="text-lead text-muted-foreground">
              Vision Infra Developers brought Amnaya to Khajaguda because they believed the site
              deserved a project of quality — not the generic residential tower formula that has
              defined much of Hyderabad&apos;s recent growth.
            </p>
            <p className="text-base text-muted-foreground">
              Amnaya is the physical expression of that conviction: a project where architecture,
              landscape, and community are given equal weight alongside commercial planning.
            </p>
          </Reveal>

          <div className="lg:col-span-7">
            <ImageReveal
              src={projectAssets.architecture}
              alt="Vision Amnaya — architectural quality"
              aspect="landscape"
              sizes="(min-width: 1024px) 58vw, 100vw"
              className="w-full"
            />
          </div>
        </div>
      </Section>

      {/* Values */}
      <Section id="values" spacing="lg" tone="subtle">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <Reveal className="flex flex-col gap-4 items-center">
            <Eyebrow>Our Values</Eyebrow>
            <DisplayHeading as="h2" level={2}>
              How we build
            </DisplayHeading>
          </Reveal>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {developerValues.map((val, i) => (
            <Reveal key={val.label} delay={i * 0.1}>
              <div className="flex flex-col gap-4 rounded-card border border-border bg-card p-6 shadow-card h-full">
                <span className="numeric text-3xl font-medium text-primary-500">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-serif text-lg font-medium text-foreground">{val.label}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{val.description}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Media band */}
      <MediaBand
        image={{
          src: projectAssets.entrance,
          alt: "Amnaya — the double-height stilt entrance",
        }}
        eyebrow="Vision Amnaya"
        title="The project in practice"
        height="compact"
      />

      {/* Project commitment */}
      <Section id="commitment" spacing="lg" tone="light">
        <div className="mx-auto max-w-3xl">
          <Reveal className="flex flex-col gap-8 text-center items-center">
            <Eyebrow>Amnaya</Eyebrow>
            <DisplayHeading as="h2" level={2}>
              The project speaks for itself
            </DisplayHeading>
            <p className="text-lead text-muted-foreground">
              Every claim about Vision Amnaya — the 5.3-acre site, the 420 residences, the 2-acre
              garden, the 25-acre lake view, the 25,000 sq.ft. clubhouse — is verifiable on a site
              visit. We invite you to come and see.
            </p>
            <Button asChild variant="accent" size="lg">
              <Link href={routes.contact}>{ctaConfig.scheduleSiteVisit.label}</Link>
            </Button>
          </Reveal>
        </div>
      </Section>

      {/* CTA */}
      <CtaSection
        eyebrow="Enquire"
        title="Connect with Vision Infra"
        lead="Questions about the project, the developer, or the construction status — we are available seven days a week."
        primaryCta={ctaConfig.enquireNow}
        secondaryCta={ctaConfig.exploreProject}
      />
    </>
  );
}
