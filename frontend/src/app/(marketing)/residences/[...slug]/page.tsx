import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { residenceService } from "@services/residence.service";
import { ResidenceExplorer } from "@components/amnaya/residences";

type ResidenceRouteProps = {
  params: Promise<{ slug: string[] }>;
};

/** Dynamic SEO Metadata Generator for Residence Catch-All Route */
export async function generateMetadata({ params }: ResidenceRouteProps): Promise<Metadata> {
  const { slug } = await params;

  if (!slug || slug.length === 0) {
    return { title: "Residence Not Found — Vision Amnaya" };
  }

  // Handle single segment (/residences/residence-1804) vs 3-segment (/residences/Tower-A/10/1804)
  const residence =
    slug.length === 1
      ? await residenceService.get(slug[0]!)
      : await residenceService.getByLocation(slug[0]!, slug[1]!, slug[2]!);

  if (!residence) {
    return { title: "Residence Not Found — Vision Amnaya" };
  }

  const { title, typology, location, superBuiltUpAreaSqft, summary } = residence;

  return {
    title: `${title} | ${typology} ${location.view} | Vision Amnaya`,
    description: `${summary} — ${superBuiltUpAreaSqft.toLocaleString()} sq.ft. residence at ${location.building}, Khajaguda, Hyderabad.`,
    openGraph: {
      title: `${title} — ${typology} | Vision Amnaya`,
      description: summary,
      images: [
        {
          url: residence.media.hero,
          alt: `${title} architectural render`,
        },
      ],
    },
  };
}

export default async function ResidenceRoutePage({ params }: ResidenceRouteProps) {
  const { slug } = await params;

  if (!slug || slug.length === 0) {
    notFound();
  }

  const residence =
    slug.length === 1
      ? await residenceService.get(slug[0]!)
      : await residenceService.getByLocation(slug[0]!, slug[1]!, slug[2]!);

  if (!residence) {
    notFound();
  }

  return <ResidenceExplorer residence={residence} />;
}
