import type { Metadata } from "next";

import { PagePlaceholder } from "@components/composite/page-placeholder";

import { buildMetadata } from "@lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Forgot password",
  canonicalPath: "/forgot-password",
});

export default function ForgotPasswordPage() {
  return (
    <PagePlaceholder
      eyebrow="Account"
      title="Reset your password"
      description="The password-recovery form (BFF /api/auth/forgot-password) mounts here in a later phase."
    />
  );
}
