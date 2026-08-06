/**
 * SEO foundation — metadata builders used by layouts/pages.
 *
 * Page components export `metadata` built from these helpers so Open Graph,
 * Twitter cards, canonical URLs and JSON-LD stay consistent app-wide.
 */

import type { Metadata } from "next";

import { siteConfig } from "@config/site";

interface SeoOptions {
  title?: string;
  description?: string;
  /** Absolute canonical URL for this page. */
  canonicalPath?: string;
  /** Open Graph image (absolute URL or relative path under /og). */
  images?: string[];
  keywords?: string[];
  noIndex?: boolean;
  /** Route group — use "protected" for authenticated pages to avoid leaks. */
  robots?: "index, follow" | "noindex, nofollow";
}

const DEFAULT_IMAGE = "/og/default.jpg";

/** Absolute URL helper (canonical + social tags require absolute URLs). */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Build a `Metadata` object with consistent defaults. */
export function buildMetadata({
  title,
  description = siteConfig.description,
  canonicalPath = "/",
  images = [DEFAULT_IMAGE],
  keywords = siteConfig.keywords,
  noIndex = false,
  robots = "index, follow",
}: SeoOptions = {}): Metadata {
  const canonical = absoluteUrl(canonicalPath);
  const resolvedTitle = title ? siteConfig.titleTemplate.replace("%s", title) : siteConfig.name;

  return {
    title: resolvedTitle,
    description,
    keywords: [...new Set([...keywords, ...siteConfig.keywords])],
    metadataBase: new URL(siteConfig.url),
    alternates: { canonical },
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      title: resolvedTitle,
      description,
      url: canonical,
      locale: siteConfig.locale,
      images: images.map((image) => absoluteUrl(image)),
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description,
      images: images.map((image) => absoluteUrl(image)),
    },
    robots:
      robots === "noindex, nofollow"
        ? { index: false, follow: false }
        : { index: !noIndex, follow: !noIndex },
  };
}

/** JSON-LD builder for the project (RealEstateAgent/Residence schema). */
export function buildProjectJsonLd(
  overrides: Partial<{
    name: string;
    description: string;
    url: string;
    image: string;
  }> = {}
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Residence",
    name: overrides.name ?? siteConfig.name,
    description: overrides.description ?? siteConfig.description,
    url: overrides.url ?? siteConfig.url,
    image: overrides.image ?? absoluteUrl(DEFAULT_IMAGE),
    address: {
      "@type": "PostalAddress",
      addressLocality: siteConfig.developer.city,
      addressCountry: siteConfig.developer.country,
    },
    developer: {
      "@type": "Organization",
      name: siteConfig.developer.name,
    },
    ...(siteConfig.developer.reraNumber && { rera: siteConfig.developer.reraNumber }),
  };
}
