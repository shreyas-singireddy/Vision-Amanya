"use client";

/** HomepageEnquiryTeaser — the closing conversion section on the homepage.
 *
 * A dark band with the primary CTA and a phone number. Distinct from the
 * full `/contact` enquiry form — this section creates urgency and routes
 * to the enquiry page.
 */

import Link from "next/link";

import { ctaConfig } from "@config/cta";
import { projectAssets } from "@config/project";
import { routes } from "@constants/routes";

import { Button } from "@components/ui/button";
import { DisplayHeading, Eyebrow } from "@components/ui/heading";
import { Container } from "@components/ui/container";
import { Reveal } from "@components/motion";

export function HomepageEnquiryTeaser() {
  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={projectAssets.amenities}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-navy-950/85" />
      </div>

      <Container className="relative z-10 py-section-lg">
        <Reveal>
          <div className="flex flex-col items-center gap-8 text-center">
            <Eyebrow className="text-accent-400">Enquire</Eyebrow>
            <DisplayHeading as="h2" level={2} className="max-w-2xl text-neutral-50">
              Begin your conversation with Amnaya
            </DisplayHeading>
            <p className="max-w-xl text-lead text-neutral-50/70">
              Schedule a site visit, request a brochure, or simply ask a question. Our team is
              available Monday through Sunday, 9 AM to 7 PM.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button asChild variant="accent" size="lg">
                <Link href={routes.contact}>{ctaConfig.enquireNow.label}</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-neutral-50/30 text-neutral-50 hover:bg-neutral-50/10"
              >
                <Link href={routes.contact}>{ctaConfig.scheduleSiteVisit.label}</Link>
              </Button>
            </div>
            <p className="text-sm text-neutral-50/50">
              Or call us at{" "}
              <a
                href="tel:+919000000000"
                className="text-accent-400 transition-colors hover:text-accent-300"
              >
                +91 90000 00000
              </a>
            </p>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
