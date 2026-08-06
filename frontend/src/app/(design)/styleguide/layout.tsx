import type { Metadata } from "next";

import { buildMetadata } from "@lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Design System",
  description:
    "The complete design language for Vision Amanya — tokens, typography, components and motion.",
  noIndex: true,
});

export default function StyleguideLayout({ children }: { children: React.ReactNode }) {
  return children;
}
