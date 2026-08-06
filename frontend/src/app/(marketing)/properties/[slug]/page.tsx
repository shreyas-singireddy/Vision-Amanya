import { notFound } from "next/navigation";

import { PagePlaceholder } from "@components/composite/page-placeholder";

type PropertyDetailPageProps = {
  params: Promise<{ slug: string }>;
};

/**
 * Dynamic-route foundation. The slug will be resolved against the property
 * API in a later phase; for now any non-empty slug renders the stub.
 */
export default async function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const { slug } = await params;

  if (!slug) notFound();

  return (
    <PagePlaceholder
      eyebrow="Residences"
      title={slug.split("-").join(" ")}
      description="The property detail experience will be built here in a later phase."
    />
  );
}
