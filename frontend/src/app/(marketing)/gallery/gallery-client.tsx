"use client";

import { useState } from "react";
import Image from "next/image";
import { Maximize2 } from "lucide-react";
import { projectAssets } from "@config/project";
import { Section } from "@components/layout/section";
import { Container } from "@components/ui/container";
import { Reveal, HoverReveal } from "@components/motion";
import { GalleryLightbox, type GalleryItem } from "@components/project/gallery-lightbox";

import { amnayanMigratedAssets } from "@config/media";

const allGalleryItems: GalleryItem[] = [
  /* ── Exterior Renders ─────────────────────────────────────────── */
  {
    src: amnayanMigratedAssets.twilightLakeElevation,
    alt: "Amnaya — Twilight Lake Elevation",
    category: "Exterior",
    caption: "Multi-tower residential elevation mirrored across lake waters at blue hour",
  },
  {
    src: amnayanMigratedAssets.streetLevelExterior,
    alt: "Amnaya — Street-Level Architectural Frontage",
    category: "Exterior",
    caption: "Full tower facade seen from arterial road with lush podium landscaping",
  },
  {
    src: amnayanMigratedAssets.daytimeLakeElevation,
    alt: "Amnaya — Daytime Lake-Front View",
    category: "Exterior",
    caption: "Calm mirror reflection of towers across the 25-acre natural lake",
  },
  {
    src: amnayanMigratedAssets.goldenHourLakeElevation,
    alt: "Amnaya — Golden-Hour Lake Horizon",
    category: "Exterior",
    caption: "Warm morning light over natural wetland lake fringe with water lilies and reeds",
  },

  /* ── Arrival ──────────────────────────────────────────────────── */
  {
    src: amnayanMigratedAssets.entranceGate,
    alt: "Amnaya — Grand Arrival Gate",
    category: "Arrival",
    caption: "Cantilevered drop-off canopy and illuminated 'Vision Amnaya' branded portal wall",
  },

  /* ── Landscape & Nature ───────────────────────────────────────── */
  {
    src: amnayanMigratedAssets.communityGarden,
    alt: "Amnaya — Community Garden Promenade",
    category: "Landscape",
    caption: "Paved walking promenade with flowering canopy trees, giant chess, and leisure zones",
  },
  {
    src: amnayanMigratedAssets.podiumCourtyard,
    alt: "Amnaya — Podium Garden Courtyard",
    category: "Landscape",
    caption: "Geometric paved plaza with manicured lawn islands and raised architectural planters",
  },
  {
    src: amnayanMigratedAssets.gardenCourtyard,
    alt: "Amnaya — Clubhouse Garden Courtyard",
    category: "Landscape",
    caption: "Green lawn courtyard framed by the ground-floor clubhouse glass facade",
  },

  /* ── Amenities ────────────────────────────────────────────────── */
  {
    src: amnayanMigratedAssets.rooftopPool,
    alt: "Amnaya — Rooftop Swimming Pool",
    category: "Amenities",
    caption: "Panoramic rooftop pool overlooking the lake horizon and residential towers",
  },
  {
    src: amnayanMigratedAssets.outdoorGym,
    alt: "Amnaya — Open-Air Fitness Station",
    category: "Amenities",
    caption: "Full workout circuit integrated into the podium landscape",
  },
  {
    src: amnayanMigratedAssets.pickleballCourt,
    alt: "Amnaya — Pickleball Court",
    category: "Amenities",
    caption: "Dedicated regulation court with lush jacaranda tree perimeter",
  },
  {
    src: amnayanMigratedAssets.cricketNet,
    alt: "Amnaya — Cricket Practice Net",
    category: "Amenities",
    caption: "Covered batting and bowling turf net surrounded by landscaped gardens",
  },
  {
    src: amnayanMigratedAssets.basketballCourt,
    alt: "Amnaya — Half Basketball Court",
    category: "Amenities",
    caption: "Podium half court with acrylic sports surface and perimeter lighting",
  },
  {
    src: amnayanMigratedAssets.joggingTrack,
    alt: "Amnaya — Landscaped Jogging Track",
    category: "Amenities",
    caption: "Winding fitness path through flowering shrub beds and palms",
  },
  {
    src: amnayanMigratedAssets.kidsPlayground,
    alt: "Amnaya — Children's Play Zone",
    category: "Amenities",
    caption: "Adventure play area with climbing wall, rope bridge, and safety surfacing",
  },
  {
    src: amnayanMigratedAssets.petPark,
    alt: "Amnaya — Dedicated Pet Park",
    category: "Amenities",
    caption: "Secured pet-friendly open lawn with agility play obstacles",
  },
  {
    src: amnayanMigratedAssets.eventLawn,
    alt: "Amnaya — Evening Banquet Lawn",
    category: "Amenities",
    caption: "Open-air celebration lawn with fairy lights and clubhouse illumination",
  },
  {
    src: amnayanMigratedAssets.swingLounge,
    alt: "Amnaya — Canopy Swing Lounge",
    category: "Amenities",
    caption: "Relaxed open-air lounge with hanging egg chairs under steel canopy",
  },
  {
    src: amnayanMigratedAssets.aerialBasketball,
    alt: "Amnaya — Podium Sports Deck",
    category: "Amenities",
    caption: "Elevated perspective of the sports courts and spectator seating steps",
  },

  /* ── Masterplan & Architectural Plans ─────────────────────────── */
  {
    src: amnayanMigratedAssets.aerialAmenityZone,
    alt: "Amnaya — Aerial Amenity Zone Plan",
    category: "Plans",
    caption: "Bird's-eye overhead layout showing sports courts, play park, and marked jogging track",
  },
  {
    src: projectAssets.masterplan01,
    alt: "Amnaya — Site Masterplan",
    category: "Plans",
    caption: "Official 5.3-acre site layout showing towers, central garden & clubhouse footprint",
  },
  {
    src: projectAssets.floorplans,
    alt: "Amnaya — 3 BHK Typology Plan",
    category: "Plans",
    caption: "Optimized 3-bedroom spatial layout with deep balconies",
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
