"use client";

/** AmenitiesGrid — the homepage amenity preview grid.
 *
 * Renders all four amenity groups as a tight, elegant grid with numbered
 * labels and staggered reveals. Used only on the homepage.
 */

import type { amenityGroups } from "@config/project";

import { Reveal, Stagger } from "@components/motion";
import { cn } from "@utils/cn";

type AmenityGroupType = (typeof amenityGroups)[number];

export function AmenitiesGrid({
  groups,
  className,
}: {
  groups: readonly AmenityGroupType[];
  className?: string;
}) {
  return (
    <div className={cn("grid gap-8 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {groups.map((group, gi) => (
        <Reveal key={group.id} delay={gi * 0.1}>
          <div className="flex flex-col gap-4 rounded-card border border-border bg-card p-6 shadow-card">
            <div className="flex items-center gap-3">
              <span className="numeric text-xs font-medium text-accent-500">
                {String(gi + 1).padStart(2, "0")}
              </span>
              <h3 className="text-sm font-semibold uppercase tracking-label text-foreground">
                {group.label}
              </h3>
            </div>
            <Stagger stagger={0.05} delayChildren={0}>
              <ul className="flex flex-col gap-2">
                {group.items.map((item) => (
                  <Reveal key={item} as="li" className="flex items-center gap-2">
                    <span
                      aria-hidden
                      className="block h-1 w-1 shrink-0 rounded-full bg-accent-500"
                    />
                    <span className="text-sm text-muted-foreground">{item}</span>
                  </Reveal>
                ))}
              </ul>
            </Stagger>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
