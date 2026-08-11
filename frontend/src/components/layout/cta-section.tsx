"use client";

/** CtaSection — the closing conversion band of every page.
 *
 * A dark, single-idea close: one promise, one primary action, one phone
 * number. Label/paths come from `@config/cta` so the site never invents new
 * conversion language.
 */

import { Button } from "@components/ui/button";
import { Container } from "@components/ui/container";
import { Eyebrow, DisplayHeading } from "@components/ui/heading";
import { Reveal } from "@components/motion/reveal";

export interface CtaSectionProps {
  eyebrow?: string;
  title: string;
  lead?: string;
  /** Primary CTA definition from `@config/cta`. */
  primaryCta?: { label: string; href: string };
  /** Secondary CTA definition (outline on dark). */
  secondaryCta?: { label: string; href: string };
  /** Display phone for a direct call. */
  phone?: string;
}

export function CtaSection({
  eyebrow = "Enquire",
  title,
  lead,
  primaryCta,
  secondaryCta,
  phone,
}: CtaSectionProps) {
  return (
    <section className="relative overflow-hidden bg-grad-dusk py-section-lg text-neutral-50">
      <Container className="relative z-10">
        <Reveal>
          <div className="flex flex-col items-center gap-8 text-center">
            {eyebrow ? <Eyebrow className="text-accent-400">{eyebrow}</Eyebrow> : null}
            <DisplayHeading as="h2" level={2} className="max-w-2xl text-neutral-50">
              {title}
            </DisplayHeading>
            {lead ? <p className="max-w-xl text-lead text-neutral-50/70">{lead}</p> : null}
            <div className="flex flex-wrap items-center justify-center gap-4">
              {primaryCta ? (
                <Button asChild variant="accent" size="lg">
                  <a href={primaryCta.href}>{primaryCta.label}</a>
                </Button>
              ) : null}
              {secondaryCta ? (
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-neutral-50/30 text-neutral-50 hover:bg-neutral-50/10"
                >
                  <a href={secondaryCta.href}>{secondaryCta.label}</a>
                </Button>
              ) : null}
            </div>
            {phone ? (
              <p className="text-sm text-neutral-50/60">
                Or call us directly at{" "}
                <a
                  href={`tel:${phone}`}
                  className="text-accent-400 underline-offset-4 hover:underline"
                >
                  {phone}
                </a>
              </p>
            ) : null}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
