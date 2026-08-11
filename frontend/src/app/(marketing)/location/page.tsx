import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

import { ctaConfig } from "@config/cta";
import { projectAssets } from "@config/project";
import { routes } from "@constants/routes";

import { Button } from "@components/ui/button";
import { Container } from "@components/ui/container";
import { Eyebrow, DisplayHeading } from "@components/ui/heading";

import { Section, SectionHeader } from "@components/layout/section";
import { CtaSection } from "@components/layout/cta-section";

import { HeroReveal, HeroRule, ImageReveal, WordReveal, Reveal, Stagger } from "@components/motion";

export const metadata: Metadata = {
  title: "Location — Amnaya by Vision Infra, Khajaguda, Hyderabad",
  description:
    "Vision Amnaya is located in Khajaguda, Hyderabad — at the intersection of the IT corridor and the natural lake landscape.",
};

/** Proximity context — qualitative descriptions only, no invented distances. */
const locationContext = [
  {
    label: "Setting",
    title: "Khajaguda",
    description:
      "Khajaguda occupies the southern edge of Hyderabad's IT and financial district belt, while retaining the open landscape that much of the city has lost. It is the quieter counterpart to the dense corridors of Gachibowli and Hitech City.",
  },
  {
    label: "Connectivity",
    title: "Well connected",
    description:
      "The Khajaguda area connects directly to the Outer Ring Road and the Financial District. Major employment centres, retail destinations, and educational institutions are within accessible reach.",
  },
  {
    label: "Nature",
    title: "The lake",
    description:
      "The northern edge of the Amnaya site abuts the Osman Sagar catchment — a 25-acre natural lake that provides the development's defining view and ensures that Amnaya's northern horizon will remain open.",
  },
  {
    label: "Address",
    title: "Amnaya, Khajaguda",
    description: "Vision Amnaya · Khajaguda · Hyderabad, Telangana · India",
  },
] as const;

export default function LocationPage() {
  return (
    <>
      {/* Hero */}
      <HeroReveal
        background={{
          src: projectAssets.location,
          alt: "Amnaya — Khajaguda, Hyderabad location context",
          priority: true,
        }}
        eyebrow={
          <span className="flex items-center gap-3">
            <HeroRule />
            <span className="text-xs font-medium uppercase tracking-eyebrow text-neutral-50/80">
              Location
            </span>
          </span>
        }
        headline={
          <WordReveal
            text="Khajaguda, Hyderabad"
            as="h1"
            className="font-serif text-display-2 font-medium tracking-display text-neutral-50"
          />
        }
        subheading={
          <p className="text-lead text-neutral-50/75">
            At the intersection of Hyderabad&apos;s IT corridor and the open lake landscape — a
            location that combines accessibility with calm.
          </p>
        }
        minHeight="min-h-[70vh]"
        depth
        overlay
      />

      {/* Location context */}
      <Section id="context" spacing="lg" tone="light">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <Stagger className="flex flex-col gap-10">
              {locationContext.map((ctx) => (
                <Reveal key={ctx.label} as="div">
                  <Eyebrow>{ctx.label}</Eyebrow>
                  <h2 className="mt-2 font-serif text-2xl font-medium text-foreground">
                    {ctx.title}
                  </h2>
                  <p className="mt-3 text-base text-muted-foreground">{ctx.description}</p>
                </Reveal>
              ))}
            </Stagger>
          </div>

          <div className="lg:col-span-7">
            <Reveal className="flex flex-col gap-6">
              <ImageReveal
                src={projectAssets.exterior01}
                alt="Amnaya — aerial perspective of the Khajaguda site"
                aspect="landscape"
                sizes="(min-width: 1024px) 58vw, 100vw"
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Aerial perspective — Vision Amnaya site, Khajaguda, Hyderabad
              </p>
            </Reveal>
          </div>
        </div>
      </Section>

      {/* Map embed */}
      <Section id="map" spacing="default" tone="subtle">
        <SectionHeader
          eyebrow="Find Us"
          title="Visit Amnaya"
          description="Vision Amnaya · Khajaguda · Hyderabad, Telangana"
          align="center"
        />
        <Reveal className="mt-12">
          <div className="overflow-hidden rounded-card-lg border border-border shadow-card">
            <iframe
              title="Vision Amnaya location map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15232.45!2d78.3627!3d17.4176!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb95b5c4444!2sKhajaguda%2C+Hyderabad%2C+Telangana!5e0!3m2!1sen!2sin"
              width="100%"
              height="480"
              style={{ border: 0, display: "block" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Khajaguda, Hyderabad — exact pin shared upon enquiry confirmation.
          </p>
        </Reveal>
      </Section>

      {/* CTA */}
      <CtaSection
        eyebrow="Enquire"
        title="Visit the site"
        lead="Our team will arrange a guided site visit at a time that suits you."
        primaryCta={ctaConfig.scheduleSiteVisit}
        secondaryCta={ctaConfig.enquireNow}
      />
    </>
  );
}
