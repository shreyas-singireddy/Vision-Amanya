"use client";

/** StatStrip — the key-facts ribbon under a hero or atop a page.
 *
 * Renders a row of `Stat`s (drawn from the project's verified figures) with a
 * hairline rhythm. `inverted` flips the voice for dark surfaces.
 */

import { Container } from "@components/ui/container";
import { Stat } from "@components/ui/stat";

export interface StatStripProps {
  /** `{ label, value, suffix? }` rows — usually a subset of `projectFacts`. */
  stats: Array<{ label: string; value: string; suffix?: string }>;
  /** Dark-surface voice. */
  inverted?: boolean;
  /** Optional leading label for the strip. */
  title?: string;
}

export function StatStrip({ stats, inverted = false, title }: StatStripProps) {
  return (
    <Container>
      <div className="flex flex-col gap-8">
        {title ? (
          <p
            className={
              inverted
                ? "text-xs font-medium uppercase tracking-eyebrow text-neutral-50/60"
                : "text-xs font-medium uppercase tracking-eyebrow text-muted-foreground"
            }
          >
            {title}
          </p>
        ) : null}
        <dl className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
          {stats.map((stat) => (
            <div key={stat.label} className="border-l border-border pl-4">
              <Stat
                label={stat.label}
                value={stat.value}
                suffix={stat.suffix}
                inverted={inverted}
                align="left"
              />
            </div>
          ))}
        </dl>
      </div>
    </Container>
  );
}
