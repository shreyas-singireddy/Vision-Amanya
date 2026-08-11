import type { NextConfig } from "next";

/**
 * Next.js 16 configuration for the Vision Amnaya frontend.
 *
 * - `typedRoutes`  → type-safe `<Link>` hrefs (the typed routes manifest is
 *   generated into `.next/types`).
 * - `experimental.optimizePackageImports` → ships only the used exports from
 *   animation/Radix packages (tree-shaking-friendly barrel files). `lucide-react`
 *   is optimized by default in Next.js 16.
 * - `images.remotePatterns` → permits `next/image` to optimize media served by
 *   the FastAPI backend (uploads) and any configured media CDN.
 * - `poweredByHeader` → hides the `X-Powered-By: Next.js` header.
 */

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
const mediaUrl = process.env.NEXT_PUBLIC_MEDIA_URL ?? apiUrl;

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return "localhost";
  }
}

const remotePatterns = [
  { protocol: "http" as const, hostname: hostnameOf(apiUrl) },
  { protocol: "https" as const, hostname: hostnameOf(apiUrl) },
];

if (mediaUrl !== apiUrl) {
  remotePatterns.push(
    { protocol: "http" as const, hostname: hostnameOf(mediaUrl) },
    { protocol: "https" as const, hostname: hostnameOf(mediaUrl) }
  );
}

const nextConfig: NextConfig = {
  typedRoutes: true,
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  experimental: {
    optimizePackageImports: [
      "framer-motion",
      "@radix-ui/react-dialog",
      "@radix-ui/react-select",
      "@radix-ui/react-dropdown-menu",
    ],
  },
  images: {
    remotePatterns,
  },
};

export default nextConfig;
