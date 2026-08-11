import Link from "next/link";

import { Container, Eyebrow } from "@components/ui";
import { routes } from "@constants/routes";

/**
 * Development-only design-system verification route.
 *
 * Proves the Phase 6.2 design tokens are actually being consumed by the
 * running application — brand colors, typography, buttons, cards, inputs,
 * spacing, borders, shadows and responsive behaviour.
 *
 * This is NOT the homepage. It is a technical verification tool.
 */

function Swatch({ label, className }: { label: string; className: string }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className={`h-14 w-full ${className}`} />
      <div className="px-2 py-1.5 text-center text-[11px] text-muted-foreground">{label}</div>
    </div>
  );
}

export default function DesignSystemPage() {
  return (
    <div className="py-16">
      <Container size="page">
        <Eyebrow>Phase 6.2 verification</Eyebrow>
        <h1 className="mt-3 font-serif text-4xl font-medium tracking-tight text-foreground">
          Design system — live
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
          The following elements are rendered using the design tokens defined in{" "}
          <code className="text-xs">globals.css</code>. If these appear correctly, the design system
          is integrated and active.
        </p>

        {/* Brand colors */}
        <section className="mt-12">
          <h2 className="font-serif text-2xl font-medium text-foreground">Brand colors</h2>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            <Swatch label="primary-600" className="bg-primary-600" />
            <Swatch label="primary-500" className="bg-primary-500" />
            <Swatch label="accent-500" className="bg-accent-500" />
            <Swatch label="accent-400" className="bg-accent-400" />
            <Swatch label="navy-800" className="bg-navy-800" />
            <Swatch label="sky-500" className="bg-sky-500" />
            <Swatch label="neutral-100" className="bg-neutral-100" />
            <Swatch label="surface-subtle" className="bg-surface-subtle" />
            <Swatch label="muted" className="bg-muted" />
            <Swatch label="card" className="bg-card" />
            <Swatch label="border" className="bg-border" />
            <Swatch label="success-500" className="bg-success-500" />
          </div>
        </section>

        {/* Typography */}
        <section className="mt-12">
          <h2 className="font-serif text-2xl font-medium text-foreground">Typography</h2>
          <div className="mt-4 space-y-4 rounded-card border border-border bg-card p-6">
            <p className="font-serif text-4xl font-medium text-foreground">Display — Cormorant</p>
            <p className="text-xl font-medium text-foreground">Lead — Geist</p>
            <p className="text-base text-muted-foreground">
              Body text — quiet and legible at rest.
            </p>
            <p className="text-label uppercase tracking-label text-muted-foreground">
              Label · tracked caps
            </p>
            <p className="text-gradient-gold font-serif text-2xl">Gradient gold text</p>
          </div>
        </section>

        {/* Buttons */}
        <section className="mt-12">
          <h2 className="font-serif text-2xl font-medium text-foreground">Buttons</h2>
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-card border border-border bg-card p-6">
            <button className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-500">
              Primary
            </button>
            <button className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover">
              Outline
            </button>
            <button className="rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-400">
              Accent
            </button>
            <button className="rounded-lg bg-navy-800 px-4 py-2 text-sm font-medium text-neutral-50 transition-colors hover:bg-navy-700">
              Navy
            </button>
          </div>
        </section>

        {/* Cards & views */}
        <section>
          <h2 className="mt-12 font-serif text-2xl font-medium text-foreground">
            Cards & elevation
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="rounded-card border border-border bg-card p-6 shadow-card">
              <p className="font-medium text-foreground">shadow-card</p>
              <p className="mt-1 text-sm text-muted-foreground">Default resting surface.</p>
            </div>
            <div className="rounded-card border border-border bg-card p-6 shadow-elevated">
              <p className="font-medium text-foreground">shadow-elevated</p>
              <p className="mt-1 text-sm text-muted-foreground">Lifted interaction.</p>
            </div>
            <div className="rounded-card border border-border bg-card p-6 shadow-cinematic">
              <p className="font-medium text-foreground">shadow-cinematic</p>
              <p className="mt-1 text-sm text-muted-foreground">Hero / gallery moments.</p>
            </div>
          </div>
        </section>

        {/* Inputs */}
        <section>
          <h2 className="mt-12 font-serif text-2xl font-medium text-foreground">Inputs</h2>
          <div className="mt-4 rounded-card border border-border bg-card p-6">
            <label className="text-label uppercase tracking-label text-muted-foreground">
              Email address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
          </div>
        </section>

        {/* Link to full styleguide + assets */}
        <section className="mt-12">
          <h2 className="font-serif text-2xl font-medium text-foreground">Further verification</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Link
              href="/styleguide"
              className="rounded-card border border-border bg-card p-6 shadow-subtle transition-colors hover:bg-surface-hover"
            >
              <p className="font-serif text-xl text-foreground">Full styleguide →</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Every component and token rendered live.
              </p>
            </Link>
            <Link
              href={routes.design.assets}
              className="rounded-card border border-border bg-card p-6 shadow-subtle transition-colors hover:bg-surface-hover"
            >
              <p className="font-serif text-xl text-foreground">Asset pipeline check →</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Phase 6.4A extracted imagery served from the public directory.
              </p>
            </Link>
          </div>
        </section>
      </Container>
    </div>
  );
}
