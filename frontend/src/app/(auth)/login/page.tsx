import type { Metadata } from "next";

import { PagePlaceholder } from "@components/composite/page-placeholder";

import { buildMetadata } from "@lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Sign in",
  canonicalPath: "/login",
});

export default function LoginPage() {
  return (
    <PagePlaceholder
      eyebrow="Account"
      title="Welcome back"
      description="The sign-in form (BFF /api/auth/login) mounts here in a later phase."
    />
  );
}
