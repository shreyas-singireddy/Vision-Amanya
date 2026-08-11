"use client";

/** SiteFooter — the closing chrome of every page.
 *
 * A dusk band with the brand lock-up, footer link columns, contact channels
 * and the RERA line. Content comes from `@config/site`; links stay typed
 * routes so nothing hardcodes paths.
 */

import Link from "next/link";

import { chromeContact, chromeFooterColumns, reraNumber } from "@config/chrome";
import { projectConfig } from "@config/project";

import { BrandMark } from "./brand-mark";

import { Container } from "@components/ui/container";
import { Eyebrow } from "@components/ui/heading";

import { cn } from "@utils/cn";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-grad-dusk text-neutral-50">
      <Container className="py-section">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="flex flex-col gap-6 lg:col-span-4">
            <BrandMark inverted />
            <p className="max-w-sm text-lead text-neutral-50/70">
              {projectConfig.tagline} — {projectConfig.location}.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-5">
            {chromeFooterColumns.map((column) => (
              <nav key={column.title} aria-label={column.title}>
                <Eyebrow className="text-neutral-50/50">{column.title}</Eyebrow>
                <ul className="mt-4 flex flex-col gap-3">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-neutral-50/70 transition-colors duration-fast ease-standard hover:text-neutral-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/15 rounded-sm"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>

          <div className="flex flex-col gap-4 lg:col-span-3">
            <Eyebrow className="text-neutral-50/50">Contact</Eyebrow>
            <address className="not-italic">
              <p className="text-sm leading-relaxed text-neutral-50/70">
                {chromeContact.address[0]}
                <br />
                {chromeContact.address[1]}
              </p>
              <p className="mt-3 text-sm text-neutral-50/70">
                <a
                  href={`tel:${chromeContact.phone}`}
                  className="transition-colors duration-fast ease-standard hover:text-neutral-50"
                >
                  {chromeContact.phone}
                </a>
              </p>
              <p className="text-sm text-neutral-50/70">
                <a
                  href={`mailto:${chromeContact.email}`}
                  className="transition-colors duration-fast ease-standard hover:text-neutral-50"
                >
                  {chromeContact.email}
                </a>
              </p>
              <p className="mt-3 text-xs text-neutral-50/50">{chromeContact.hours}</p>
            </address>
          </div>
        </div>

        <div
          className={cn(
            "mt-16 flex flex-col gap-4 border-t border-neutral-50/15 pt-8",
            "sm:flex-row sm:items-center sm:justify-between"
          )}
        >
          <p className="text-xs text-neutral-50/50">© {year} Vision Infra Developers · Amnaya</p>
          <p className="text-xs text-neutral-50/50">{reraNumber}</p>
        </div>
      </Container>
    </footer>
  );
}
