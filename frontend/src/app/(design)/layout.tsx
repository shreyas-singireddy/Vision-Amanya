/** Design route group shell — a clean, chrome-free canvas for the styleguide.
 *
 * Intentionally excluded from `navigationConfig` so the system never appears
 * in public navigation; it exists to document and dogfood the design system. */

import Link from "next/link";

import { siteConfig } from "@config/site";

export default function DesignLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full bg-background">
      <div className="border-b border-border bg-surface-subtle">
        <div className="mx-auto flex h-14 w-full max-w-page items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="font-serif text-sm tracking-wide text-foreground transition-opacity hover:opacity-70"
          >
            {siteConfig.name}
          </Link>
          <span className="text-xs font-medium uppercase tracking-eyebrow text-muted-foreground">
            Design System
          </span>
        </div>
      </div>
      <main>{children}</main>
    </div>
  );
}
