"use client";

import { useState } from "react";
import Image from "next/image";
import { Maximize2 } from "lucide-react";
import { projectAssets } from "@config/project";
import { Section } from "@components/layout/section";
import { Container } from "@components/ui/container";
import { Reveal, HoverReveal } from "@components/motion";
import { GalleryLightbox, type GalleryItem } from "@components/project/gallery-lightbox";

const allGalleryItems: GalleryItem[] = [
  {
    src: projectAssets.hero,
    alt: "Amnaya — Hero Architectural Render",
    category: "Exterior",
    caption: "Flagship 3-BHK luxury towers in Khajaguda",
  },
  {
    src: projectAssets.exterior01,
    alt: "Amnaya — Aerial Campus View",
    category: "Exterior",
    caption: "5.3 Acres site layout framed by green expanse",
  },
  {
    src: projectAssets.exterior03,
    alt: "Amnaya — Dusk Architectural Elevation",
    category: "Exterior",
    caption: "Deep balconies and architectural facade lighting",
  },
  {
    src: projectAssets.entrance,
    alt: "Amnaya — Double-Height Stilt Entrance",
    category: "Arrival",
    caption: "Grand arrival concourse framing the central garden",
  },
  {
    src: projectAssets.landscape,
    alt: "Amnaya — 2-Acre Central Garden",
    category: "Landscape",
    caption: "Landscaped green buffer separating towers from entry",
  },
  {
    src: projectAssets.lake,
    alt: "Amnaya — 25-Acre Lake View",
    category: "Nature",
    caption: "Unobstructed northern view over Osman Sagar catchment",
  },
  {
    src: projectAssets.interior01,
    alt: "Amnaya — Living Room Suite",
    category: "Interiors",
    caption: "High ceilings and generous 1,715–2,590 sq.ft. layouts",
  },
  {
    src: projectAssets.interior02,
    alt: "Amnaya — Master Bedroom Suite",
    category: "Interiors",
    caption: "Daylight-filled bedrooms designed for quiet rest",
  },
  {
    src: projectAssets.amenities,
    alt: "Amnaya — 25,000 sq.ft. Clubhouse",
    category: "Amenities",
    caption: "Four levels of indoor sports, spa, and leisure",
  },
  {
    src: projectAssets.pool,
    alt: "Amnaya — Rooftop Swimming Pool",
    category: "Amenities",
    caption: "Panoramic rooftop pool overlooking the lake horizon",
  },
  {
    src: projectAssets.masterplan01,
    alt: "Amnaya — Site Masterplan",
    category: "Plans",
    caption: "Official site layout showing towers, garden & clubhouse",
  },
  {
    src: projectAssets.floorplans,
    alt: "Amnaya — 3 BHK Floor Plan",
    category: "Plans",
    caption: "Optimized 3-bedroom spatial layout",
  },
];

export function GalleryClient() {
  const [activeTab, setActiveTab] = useState<string>("All");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const categories = ["All", "Exterior", "Arrival", "Landscape", "Interiors", "Amenities", "Plans"];

  const filteredItems =
    activeTab === "All"
      ? allGalleryItems
      : allGalleryItems.filter((item) => item.category === activeTab);

  return (
    <>
      <Section spacing="sm" tone="light">
        <Container>
          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`rounded-full px-5 py-2 text-xs font-medium uppercase tracking-eyebrow transition-all duration-300 ${
                  activeTab === cat
                    ? "bg-foreground text-background shadow-sm"
                    : "bg-surface-subtle border border-border text-muted-foreground hover:text-foreground hover:bg-surface"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Editorial Architectural Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredItems.map((item, i) => (
              <Reveal key={`${item.category ?? "gallery"}-${item.src}-${i}`} delay={i * 0.06}>
                <HoverReveal preset="zoom" className="block h-full">
                  <div
                    onClick={() => setLightboxIndex(i)}
                    className="group relative overflow-hidden rounded-card-lg border border-border bg-surface-subtle shadow-card cursor-pointer h-full flex flex-col"
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden">
                      <Image
                        src={item.src}
                        alt={item.alt}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                      />
                      {/* Custom View Cue Overlay */}
                      <div className="absolute inset-0 bg-navy-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <span className="flex items-center gap-2 rounded-full border border-neutral-100/40 bg-neutral-950/60 px-4 py-2 text-xs font-medium uppercase tracking-eyebrow text-neutral-50 backdrop-blur-md">
                          <Maximize2 className="h-3.5 w-3.5" />
                          View Render +
                        </span>
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between border-t border-border/60">
                      <div>
                        <span className="text-[10px] font-medium uppercase tracking-eyebrow text-accent-600 dark:text-accent-400">
                          {item.category}
                        </span>
                        <h3 className="font-serif text-lg font-medium text-foreground mt-1">
                          {item.alt}
                        </h3>
                      </div>
                    </div>
                  </div>
                </HoverReveal>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* Lightbox Modal */}
      <GalleryLightbox
        items={filteredItems}
        currentIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={(idx) => setLightboxIndex(idx)}
      />
    </>
  );
}
