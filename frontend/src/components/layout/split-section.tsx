"use client";

/** SplitSection — the alternating editorial band (image | content).
 *
 * The workhorse of the marketing pages: a media column and a copy column
 * sitting on opposite sides. `reversed` flips the order on desktop; on mobile
 * the media always stacks above the copy. Motion is delegated to `ImageReveal`
 * and `Reveal` so the rhythm stays consistent site-wide.
 */

import type { ReactNode } from "react";

import { Container } from "@components/ui/container";
import { Eyebrow, DisplayHeading } from "@components/ui/heading";
import { ImageReveal } from "@components/motion/image-reveal";
import { Reveal } from "@components/motion/reveal";

import { cn } from "@utils/cn";

export interface SplitSectionProps {
  /** Place the media on the right (desktop). */
  reversed?: boolean;
  eyebrow?: string;
  /** Heading of the copy column. */
  title: string;
  body: string;
  /** Optional action(s) rendered under the copy. */
  actions?: ReactNode;
  image: { src: string; alt: string };
  /** Optional small print under the image (credit/caption). */
  caption?: string;
  className?: string;
}

export function SplitSection({
  reversed = false,
  eyebrow,
  title,
  body,
  actions,
  image,
  caption,
  className,
}: SplitSectionProps) {
  return (
    <Container className={className}>
      <div
        className={cn(
          "grid items-center gap-12 lg:grid-cols-12 lg:gap-16",
          reversed && "lg:[&>*:first-child]:order-2"
        )}
      >
        <div className="lg:col-span-6">
          <ImageReveal
            src={image.src}
            alt={image.alt}
            aspect="landscape"
            className="w-full sm:aspect-[3/4]"
          />
          {caption ? <p className="mt-3 text-sm text-muted-foreground">{caption}</p> : null}
        </div>
        <div className="lg:col-span-6">
          <Reveal>
            <div className="flex flex-col gap-6">
              {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
              <DisplayHeading as="h2" level={2}>
                {title}
              </DisplayHeading>
              <p className="text-lead text-muted-foreground">{body}</p>
              {actions ? <div className="flex flex-wrap gap-4 pt-2">{actions}</div> : null}
            </div>
          </Reveal>
        </div>
      </div>
    </Container>
  );
}
