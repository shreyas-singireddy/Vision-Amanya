import type { Metadata } from "next";

import { PagePlaceholder } from "@components/composite/page-placeholder";

import { buildMetadata } from "@lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Verify email",
  canonicalPath: "/verify-email",
});

export default function VerifyEmailPage() {
  return (
    <PagePlaceholder
      eyebrow="Account"
      title="Confirm your email"
      description="The email-verification state mounts here in a later phase."
    />
  );
}
