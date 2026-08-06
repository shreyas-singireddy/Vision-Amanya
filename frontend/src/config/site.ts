/** Global site configuration — the single source of truth for metadata. */

import { env } from "@lib/env";

export interface SiteConfig {
  /** Canonical public origin (no trailing slash). */
  url: string;
  name: string;
  description: string;
  /** Default short title used in <title> tags. */
  titleTemplate: string;
  locale: string;
  supportedLocales: string[];
  defaultLocale: string;
  /** Site owner/developer shown in structured data and the manifest. */
  developer: {
    name: string;
    reraNumber: string | null;
    city: string;
    country: string;
  };
  contact: {
    email: string;
    phone: string | null;
    address: string | null;
  };
  social: {
    twitter?: string;
    instagram?: string;
    facebook?: string;
    linkedin?: string;
  };
  keywords: string[];
}

function firstSupportedLocale(locales: string[]): string {
  return locales[0] ?? "en";
}

export const siteConfig: SiteConfig = {
  url: env.NEXT_PUBLIC_APP_URL,
  name: env.NEXT_PUBLIC_APP_NAME,
  description: env.NEXT_PUBLIC_APP_DESCRIPTION,
  titleTemplate: "%s | Vision Amanya",
  locale: firstSupportedLocale(env.NEXT_PUBLIC_SUPPORTED_LOCALES),
  supportedLocales: env.NEXT_PUBLIC_SUPPORTED_LOCALES,
  defaultLocale: env.NEXT_PUBLIC_DEFAULT_LOCALE,
  developer: {
    name: "Vision Infra Developers",
    reraNumber: null, // Fill once the RERA number is confirmed.
    city: "Hyderabad",
    country: "India",
  },
  contact: {
    email: "sales@visionamanya.in",
    phone: null, // Fill once confirmed.
    address: null, // Fill once confirmed.
  },
  social: {
    instagram: "https://instagram.com/visioninfra",
    twitter: "https://x.com/visioninfra",
  },
  keywords: [
    "Vision Amanya",
    "Vision Infra",
    "luxury apartments Hyderabad",
    "Khajaguda residences",
    "2BHK Hyderabad",
    "3BHK Hyderabad",
    "premium real estate Hyderabad",
  ],
};
