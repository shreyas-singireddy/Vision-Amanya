"use client";

/**
 * ResidenceActions — Primary CTAs, Share link, Compare toggle, and Contact channels.
 *
 * Provides understated luxury action triggers for Amnaya residences:
 *   - Enquire About This Residence
 *   - Schedule Site Visit (Phase 6.8 prep)
 *   - Share Residence Link (Clipboard copy with toast)
 *   - Compare Residence (Zustand compare state toggle)
 *   - Direct Call & WhatsApp triggers
 *   - Sticky Mobile Bottom Action Bar
 */

import { useState } from "react";
import { Check, Scale, Share2 } from "lucide-react";
import type { Residence } from "@domain/residence";
import { usePropertyStore } from "@store/property.store";

import { LuxuryButton } from "@components/amnaya/luxury-button";
import { Button } from "@components/ui/button";

export interface ResidenceActionsProps {
  residence: Residence;
  onEnquire: () => void;
  onScheduleVisit: () => void;
}

export function ResidenceActions({ residence, onEnquire, onScheduleVisit }: ResidenceActionsProps) {
  const [copied, setCopied] = useState(false);
  const compareIds = usePropertyStore((state) => state.compareIds);
  const toggleCompare = usePropertyStore((state) => state.toggleCompare);

  const isCompared = compareIds.includes(residence.id);

  const handleShare = async () => {
    try {
      if (typeof window !== "undefined") {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // Fallback
    }
  };

  return (
    <>
      {/* Main Desktop & Tablet Action Bar Section */}
      <section id="actions" className="py-12 bg-card border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 rounded-card-lg border border-border bg-surface-subtle p-6 sm:p-8 shadow-card">
            <div>
              <span className="text-[0.625rem] font-medium uppercase tracking-[0.22em] text-accent-600 dark:text-accent-400">
                Residence Inquiry
              </span>
              <h3 className="font-serif text-2xl font-medium text-foreground">
                Interested in {residence.title}?
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {residence.typology} · {residence.superBuiltUpAreaSqft.toLocaleString()} sq.ft. ·{" "}
                {residence.location.building} Floor {residence.location.floor}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <LuxuryButton onClick={onEnquire} variant="accent" size="md">
                Enquire Now
              </LuxuryButton>

              <Button onClick={onScheduleVisit} variant="outline" size="lg">
                Schedule Site Visit
              </Button>

              <Button
                onClick={() => toggleCompare(residence.id)}
                variant={isCompared ? "accent" : "ghost"}
                size="lg"
                className="gap-2"
              >
                <Scale className="h-4 w-4" />
                <span>{isCompared ? "Compared" : "Compare"}</span>
              </Button>

              <Button onClick={handleShare} variant="ghost" size="lg" className="gap-2">
                {copied ? (
                  <Check className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Share2 className="h-4 w-4" />
                )}
                <span>{copied ? "Link Copied" : "Share"}</span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Mobile Bottom CTA Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between gap-3 border-t border-border bg-background/95 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-lg shadow-2xl lg:hidden">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-foreground">{residence.title}</p>
          <p className="truncate text-[0.625rem] uppercase tracking-wider text-muted-foreground">
            {residence.typology} · {residence.superBuiltUpAreaSqft} sq.ft.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button onClick={onScheduleVisit} variant="outline" size="sm" className="text-xs">
            Visit
          </Button>

          <LuxuryButton onClick={onEnquire} variant="accent" size="sm" arrow={false}>
            Enquire
          </LuxuryButton>
        </div>
      </div>
    </>
  );
}
