/**
 * Typed route map — the ONLY place app routes are declared.
 *
 * Using `next/link` with these constants keeps navigation type-safe
 * (`typedRoutes`) and grep-able. Page builders import from here instead of
 * writing raw path strings.
 */

import type { Route } from "next";

export const routes = {
  home: "/",
  project: "/project",
  location: "/location",
  amenities: "/amenities",
  properties: "/properties",
  propertyDetail: (slug: string) => `/properties/${slug}` as Route,
  masterplan: "/masterplan",
  gallery: "/gallery",
  contact: "/contact",
  about: "/about",
  privacy: "/privacy",
  terms: "/terms",

  design: {
    styleguide: "/styleguide",
    system: "/design-system",
    assets: "/design-system/assets" as Route,
  },

  auth: {
    login: "/login",
    register: "/register",
    forgotPassword: "/forgot-password",
    resetPassword: "/reset-password",
    verifyEmail: "/verify-email",
  },

  account: {
    dashboard: "/dashboard",
    favourites: "/favourites",
    enquiries: "/enquiries",
    settings: "/settings",
  },
} as const;

/** Route prefixes protected by `src/app/proxy.ts`. */
export const protectedRoutePrefixes: readonly Route[] = [
  "/dashboard",
  "/favourites",
  "/enquiries",
  "/settings",
] as const;
