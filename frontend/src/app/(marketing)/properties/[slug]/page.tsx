import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { residenceService } from "@services/residence.service";
import { ResidenceExplorer } from "@components/amnaya/residences";

type PropertyDetailPageProps = {
  params: Promise<{ slug: string }>;
};

/** Dynamic SEO Metadata Generator for Property Slugs */
export async function generateMetadata({ params }: PropertyDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const residence = await residenceService.get(slug);

  if (!residence) {
    return {
      title: "Property Not Found — Vision Amnaya",
    };
  }

  return {
    title: `${residence.title} | ${residence.typology} | Vision Amnaya`,
    description: residence.summary,
  };
}

export default async function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const { slug } = await params;
  const residence = await residenceService.get(slug);

  if (!residence) {
    notFound();
  }

  return <ResidenceExplorer residence={residence} />;
}
