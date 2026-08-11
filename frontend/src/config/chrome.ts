/**
 * Chrome config — the content the global header & footer render.
 *
 * Project narrative and figures live in `@config/project`; metadata in
 * `@config/site`. This module holds what the chrome itself needs: primary
 * navigation, footer link columns and contact channels, so the shell never
 * hardcodes copy. Every href is a typed route.
 */

import { routes } from "@constants/routes";

/** Primary navigation (desktop header + mobile menu). */
export const chromeNavigation = [
  { label: "Home", href: routes.home },
  { label: "The Project", href: routes.project },
  { label: "Residences", href: routes.properties },
  { label: "Amenities", href: routes.amenities },
  { label: "Masterplan", href: routes.masterplan },
  { label: "Gallery", href: routes.gallery },
  { label: "Location", href: routes.location },
  { label: "Contact", href: routes.contact },
] as const;

/** Footer link columns (label → route). */
export const chromeFooterColumns = [
  {
    title: "Project",
    links: [
      { label: "The Project", href: routes.project },
      { label: "Residences", href: routes.properties },
      { label: "Amenities", href: routes.amenities },
      { label: "Masterplan", href: routes.masterplan },
      { label: "Gallery", href: routes.gallery },
      { label: "Location", href: routes.location },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Vision Infra", href: routes.about },
      { label: "Enquire", href: routes.contact },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: routes.privacy },
      { label: "Terms of Use", href: routes.terms },
    ],
  },
] as const;

/** Contact channels shown in the footer. */
export const chromeContact = {
  address: ["Vision Amnaya, Khajaguda", "Hyderabad, Telangana"],
  phone: "+91 90000 00000",
  email: "hello@visionamnaya.in",
  hours: "Mon – Sun · 9:00 AM – 7:00 PM",
} as const;

/** RERA disclaimer line. Fill once the number is confirmed. */
export const reraNumber: string | null = null;
