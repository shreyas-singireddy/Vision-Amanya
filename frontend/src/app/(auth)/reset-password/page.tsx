import type { Metadata } from "next";

import { PagePlaceholder } from "@components/composite/page-placeholder";

import { buildMetadata } from "@lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Reset password",
  canonicalPath: "/reset-password",
});

export default function ResetPasswordPage() {
  return (
    <PagePlaceholder
      eyebrow="Account"
      title="Set a new password"
      description="The password-reset form mounts here in a later phase."
    />
  );
}
