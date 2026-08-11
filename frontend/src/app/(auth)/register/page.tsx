import type { Metadata } from "next";

import { PagePlaceholder } from "@components/composite/page-placeholder";

import { buildMetadata } from "@lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Create account",
  canonicalPath: "/register",
});

export default function RegisterPage() {
  return (
    <PagePlaceholder
      eyebrow="Account"
      title="Join Vision Amnaya"
      description="The registration form (BFF /api/auth/register) mounts here in a later phase."
    />
  );
}
