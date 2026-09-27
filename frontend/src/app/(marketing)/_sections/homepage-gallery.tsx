"use client";

/**
 * HomepageGallery — editorial asymmetric gallery with lightbox.
 *
 * Uses an asymmetric grid with mixed aspect ratios (16:9, 4:3)
 * and the existing GalleryLightbox component for fullscreen viewing.
 * Hover: scale 1.03 + "VIEW RENDER +" label.
 * Click: fullscreen lightbox (keyboard ← → ESC).
 * Mobile: horizontal scroll strip.
 *
 * Uses only confirmed Amnaya render assets from /assets/amnaya/renders/.
 */

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

import { projectAssets } from "@config/project";
import { routes } from "@constants/routes";
import { useReducedMotionPreference } from "@hooks/use-reduced-motion";

import { GalleryLightbox } from "@components/project/gallery-lightbox";
import { Eyebrow, DisplayHeading } from "@components/ui/heading";
import { Button } from "@components/ui/button";

import { cn } from "@utils/cn";

const galleryItems = [
  {
    src: projectAssets.exterior01,
    alt: "Amnaya — aerial exterior view, Khajaguda",
    category: "Exterior",
    caption: "The Amnaya towers rising above Khajaguda's green fringe",
    colSpan: "lg:col-span-7",
    aspectClass: "aspect-[16/9]",
  },
  {
    src: projectAssets.landscape,
    alt: "Amnaya — 2-acre central garden landscape",
    category: "Garden",
    caption: "The 2-acre central garden — a quiet sanctuary between the towers",
    colSpan: "lg:col-span-5",
    aspectClass: "aspect-[4/3]",
  },
  {
    src: projectAssets.exterior02,
    alt: "Amnaya — building elevation, day render",
    category: "Architecture",
    caption: "Amnaya's architectural elevation — contemporary design in Khajaguda",
    colSpan: "lg:col-span-4",
    aspectClass: "aspect-[4/3]",
  },
  {
    src: projectAssets.exterior03,
    alt: "Amnaya — dusk building elevation render",
    category: "Dusk",
    caption: "Dusk elevation — architectural materiality under Hyderabad's golden hour",
    colSpan: "lg:col-span-4",
    aspectClass: "aspect-[4/3]",
  },
  {
    src: projectAssets.clubhouse01,
    alt: "Amnaya — 25,000 sq.ft. clubhouse",
    category: "Clubhouse",
    caption: "The clubhouse spine — 25,000 sq.ft. of wellness and leisure across 4 floors",
    colSpan: "lg:col-span-4",
    aspectClass: "aspect-[4/3]",
  },
] as const;

export function HomepageGallery() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const reduced = useReducedMotionPreference();

  const lightboxItems = galleryItems.map((img) => ({
    src: img.src,
    alt: img.alt,
    category: img.category,
    caption: img.caption,
  }));

  return (
    <>
      <section
        id="gallery"
        className="relative overflow-hidden bg-background py-16 sm:py-20 lg:py-24"
        aria-label="Amnaya project gallery"
      >
        {/* Section header */}
        <div className="mx-auto max-w-[96rem] px-4 sm:px-6 lg:px-8 xl:px-16">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <Eyebrow>Gallery</Eyebrow>
              <DisplayHeading as="h2" level={3} className="mt-2 max-w-md">
                The Amnaya renders
              </DisplayHeading>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href={routes.gallery}>View all renders →</Link>
            </Button>
          </div>

          {/* Desktop: asymmetric editorial grid */}
          <div className="hidden lg:grid lg:grid-cols-12 lg:gap-3">
            {galleryItems.map((img, i) => (
              <motion.div
                key={img.src}
                className={cn(
                  "group relative cursor-pointer overflow-hidden rounded-card",
                  img.colSpan,
                  img.aspectClass
                )}
                initial={reduced ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.7, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => setLightboxIndex(i)}
                role="button"
                tabIndex={0}
                aria-label={`Open ${img.category} render in fullscreen`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setLightboxIndex(i);
                  }
                }}
              >
                {/* Image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.src}
                  alt={img.alt}
                  loading={i === 0 ? "eager" : "lazy"}
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />

                {/* Dark overlay on hover */}
                <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/30" />

                {/* Bottom gradient always visible */}
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/60 to-transparent" />

                {/* Category label */}
                <div className="absolute bottom-4 left-4">
                  <span className="text-[0.625rem] font-medium uppercase tracking-[0.22em] text-white/65">
                    {img.category}
                  </span>
                </div>

                {/* Hover: "VIEW RENDER +" */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <span className="flex items-center gap-2 rounded-full border border-white/30 bg-black/20 px-5 py-2.5 text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-white backdrop-blur-sm">
                    View Render
                    <span className="text-[#a3744a]">+</span>
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Mobile: horizontal scroll strip */}
          <div className="flex gap-3 overflow-x-auto pb-4 lg:hidden">
            {galleryItems.map((img, i) => (
              <div
                key={img.src}
                className="relative aspect-[4/3] w-72 shrink-0 cursor-pointer overflow-hidden rounded-card"
                onClick={() => setLightboxIndex(i)}
                role="button"
                tabIndex={0}
                aria-label={`Open ${img.category} render in fullscreen`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setLightboxIndex(i);
                  }
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.src}
                  alt={img.alt}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <span className="text-[0.625rem] font-medium uppercase tracking-eyebrow text-white/70">
                    {img.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      <GalleryLightbox
        items={lightboxItems}
        currentIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={(idx) => setLightboxIndex(idx)}
      />
    </>
  );
}
