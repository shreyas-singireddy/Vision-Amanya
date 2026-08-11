import type { MetadataRoute } from "next";

import { siteConfig } from "@config/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: "Vision Amnaya",
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#fbfaf7",
    theme_color: "#2c6f52",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
