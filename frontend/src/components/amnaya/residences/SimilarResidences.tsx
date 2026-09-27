"use client";

/**
 * SimilarResidences — "You May Also Like" verified recommendations grid.
 *
 * Queries `residenceService.getSimilar(currentId)` to display verified Amnaya units
 * matching typology or view orientation. Prepares seam for Phase 6.7 AI recommendations.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, BedDouble, Compass, Ruler } from "lucide-react";

import { routes } from "@constants/routes";
import { residenceService } from "@services/residence.service";
import type { Residence } from "@domain/residence";

import { ImageCard } from "@components/ui/image-card";
import { PropertyBadge } from "@components/property/badges";

export interface SimilarResidencesProps {
  currentResidenceId: string;
}

export function SimilarResidences({ currentResidenceId }: SimilarResidencesProps) {
  const [similarList, setSimilarList] = useState<Residence[]>([]);

  useEffect(() => {
    residenceService.getSimilar(currentResidenceId, 3).then(setSimilarList);
  }, [currentResidenceId]);

  if (!similarList.length) return null;

  return (
    <section id="similar-residences" className="py-16 bg-background border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-1 mb-8">
          <span className="text-[0.625rem] font-medium uppercase tracking-[0.22em] text-accent-600 dark:text-accent-400">
            Recommendations
          </span>
          <h2 className="font-serif text-3xl font-medium tracking-tight text-foreground">
            You May Also Like
          </h2>
          <p className="text-sm text-muted-foreground">
            Explore similar 3 BHK residences with comparable floor areas or lake/garden
            orientations.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {similarList.map((res) => (
            <Link key={res.id} href={routes.residenceDetail(res.id)} className="group block">
              <ImageCard src={res.media.hero} alt={res.title} aspect="landscape" className="h-full">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <PropertyBadge status="available" />
                    <h3 className="mt-1 font-serif text-xl font-semibold text-neutral-50">
                      {res.title}
                    </h3>
                    <p className="text-xs text-neutral-50/70">{res.subtitle}</p>
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-neutral-50/80 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-50/80 border-t border-neutral-50/15 pt-3">
                  <span className="inline-flex items-center gap-1.5">
                    <Ruler className="h-3.5 w-3.5" />
                    {res.superBuiltUpAreaSqft.toLocaleString()} sq.ft.
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <BedDouble className="h-3.5 w-3.5" />
                    {res.bedrooms} BHK
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Compass className="h-3.5 w-3.5" />
                    {res.location.view}
                  </span>
                </div>
              </ImageCard>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
