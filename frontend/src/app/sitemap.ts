import type { MetadataRoute } from "next";

import { siteConfig } from "@config/site";

/** Static sitemap for the current public route set.
 *
 * When projects/properties are backed by data they become dynamic entries;
 * for now the sitemap lists the stable public routes only.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const publicRoutes = [
    "",
    "/project",
    "/properties",
    "/gallery",
    "/contact",
    "/about",
    "/privacy",
    "/terms",
  ] as const;

  return publicRoutes.map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: now,
    changeFrequency: route === "" ? ("weekly" as const) : ("monthly" as const),
    priority: route === "" ? 1 : 0.8,
  }));
}
