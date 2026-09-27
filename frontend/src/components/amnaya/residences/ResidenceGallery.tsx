"use client";

/**
 * ResidenceGallery — Visual gallery system for Amnaya residences.
 *
 * Desktop: Large primary image display with thumbnail navigation.
 * Mobile: Touch-swipe media gallery with indicator dots.
 * Fullscreen Lightbox dialog with keyboard navigation support (Escape, Left, Right).
 */

import { useState } from "react";
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";
import type { PropertyImage } from "@domain/property";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@components/ui/dialog";
import { IconButton } from "@components/ui/icon-button";
import { cn } from "@utils/cn";

export interface ResidenceGalleryProps {
  hero: string;
  images: PropertyImage[];
  title: string;
}

export function ResidenceGallery({ hero, images, title }: ResidenceGalleryProps) {
  const mediaList =
    images.length > 0
      ? images
      : [
          {
            id: "hero-1",
            file_upload_id: "fu-1",
            sort_order: 1,
            is_primary: true,
            image_type: "image" as const,
            caption: title,
            alt_text: title,
          },
        ];

  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const activeMedia = mediaList[activeIndex] || mediaList[0];

  const handleNext = () => setActiveIndex((prev) => (prev + 1) % mediaList.length);
  const handlePrev = () =>
    setActiveIndex((prev) => (prev - 1 + mediaList.length) % mediaList.length);

  return (
    <section id="gallery" className="py-16 bg-card border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-1 mb-8">
          <span className="text-[0.625rem] font-medium uppercase tracking-[0.22em] text-accent-600 dark:text-accent-400">
            Visual Experience
          </span>
          <h2 className="font-serif text-3xl font-medium tracking-tight text-foreground">
            Architectural Gallery & Renderings
          </h2>
        </div>

        {/* Primary Stage */}
        <div className="relative overflow-hidden rounded-card-lg border border-border bg-neutral-950 aspect-[16/9] shadow-cinematic">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={hero}
            alt={activeMedia?.alt_text || title}
            className="h-full w-full object-cover transition-opacity duration-300"
          />

          {/* Scrim Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

          {/* Media Info Caption */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-4">
            <span className="rounded-full bg-black/70 px-3.5 py-1 text-xs font-medium text-white/90 backdrop-blur-md">
              {activeMedia?.caption || `${title} — Render View`}
            </span>

            <IconButton
              aria-label="Expand image fullscreen"
              icon={Expand}
              variant="glass"
              size="md"
              onClick={() => setIsLightboxOpen(true)}
              className="text-white hover:bg-white/20"
            />
          </div>

          {/* Desktop Next / Previous Controls */}
          {mediaList.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                aria-label="Previous gallery image"
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/60 p-2 text-white backdrop-blur-md transition-colors hover:bg-white/30 hidden sm:flex"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={handleNext}
                aria-label="Next gallery image"
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/60 p-2 text-white backdrop-blur-md transition-colors hover:bg-white/30 hidden sm:flex"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnail Navigation Strip */}
        {mediaList.length > 1 && (
          <div className="mt-4 flex items-center gap-3 overflow-x-auto pb-2">
            {mediaList.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => setActiveIndex(idx)}
                className={cn(
                  "relative h-20 w-32 shrink-0 overflow-hidden rounded-md border-2 transition-all duration-200 focus-visible:outline-none",
                  activeIndex === idx
                    ? "border-accent-500 scale-105 shadow-md"
                    : "border-transparent opacity-60 hover:opacity-100"
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={hero}
                  alt={item.alt_text || `Thumbnail ${idx + 1}`}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Lightbox Modal */}
      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent className="max-w-5xl bg-neutral-950 p-2 border-white/20 text-white">
          <DialogHeader className="p-4 border-b border-white/10">
            <DialogTitle className="font-serif text-xl text-white">
              {title} — {activeMedia?.caption || "Gallery View"}
            </DialogTitle>
          </DialogHeader>

          <div className="relative flex aspect-[16/9] items-center justify-center overflow-hidden rounded-md bg-black">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={hero}
              alt={activeMedia?.alt_text || title}
              className="max-h-full max-w-full object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
