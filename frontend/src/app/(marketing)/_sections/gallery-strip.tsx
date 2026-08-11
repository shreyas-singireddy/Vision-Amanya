"use client";

/** GalleryStrip — the homepage gallery band.
 *
 * A horizontal, oversized strip of key project imagery that teases the
 * gallery page. Uses 5 curated renders in a tight horizontal scroll on mobile,
 * a CSS grid on desktop.
 */

import Link from "next/link";

import { projectAssets } from "@config/project";
import { routes } from "@constants/routes";

import { HoverReveal, Reveal } from "@components/motion";
import { Button } from "@components/ui/button";
import { Eyebrow } from "@components/ui/heading";

const galleryImages = [
  {
    src: projectAssets.exterior01,
    alt: "Amnaya exterior — aerial view",
    label: "Exterior",
    span: "lg:col-span-2",
  },
  {
    src: projectAssets.clubhouse01,
    alt: "Amnaya — clubhouse",
    label: "Clubhouse",
    span: "lg:col-span-1",
  },
  {
    src: projectAssets.lake,
    alt: "Amnaya — 25-acre lake view",
    label: "Lake View",
    span: "lg:col-span-1",
  },
  {
    src: projectAssets.landscape,
    alt: "Amnaya — 2-acre garden landscape",
    label: "Landscape",
    span: "lg:col-span-2",
  },
] as const;

export function GalleryStrip() {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <div>
          <Eyebrow>Gallery</Eyebrow>
          <p className="mt-1 text-sm text-muted-foreground">Project imagery</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={routes.gallery}>View all</Link>
        </Button>
      </div>

      {/* Mobile: horizontal scroll */}
      <div className="flex gap-3 overflow-x-auto px-4 pb-2 sm:px-6 lg:hidden">
        {galleryImages.map((img) => (
          <div
            key={img.src}
            className="relative aspect-[4/3] w-72 shrink-0 overflow-hidden rounded-card"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.src}
              alt={img.alt}
              loading="lazy"
              className="h-full w-full object-cover"
            />
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-3">
              <p className="text-xs font-medium uppercase tracking-label text-white/80">
                {img.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: grid */}
      <div className="hidden lg:grid lg:grid-cols-4 lg:gap-3 lg:px-4">
        {galleryImages.map((img, i) => (
          <Reveal key={img.src} delay={i * 0.08} className={img.span}>
            <HoverReveal preset="zoom" className="block">
              <div className="relative aspect-[4/3] overflow-hidden rounded-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.src}
                  alt={img.alt}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="absolute bottom-0 inset-x-0 p-4">
                  <p className="text-xs font-medium uppercase tracking-label text-white/80">
                    {img.label}
                  </p>
                </div>
              </div>
            </HoverReveal>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
