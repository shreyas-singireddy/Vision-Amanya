import { Container, Eyebrow } from "@components/ui";

/**
 * Asset verification route — proves the asset pipeline:
 * source renders → `public/assets/amnaya/renders` → browser.
 *
 * This is a technical verification page only, not a marketing gallery.
 * Paths below are the canonical, validated renders consumed by `@config/project`.
 */

const assetGroups: {
  label: string;
  description: string;
  items: { src: string; alt: string; caption: string }[];
}[] = [
  {
    label: "Exterior & Architecture",
    description: "Building elevations and the hero cover.",
    items: [
      {
        src: "/assets/amnaya/renders/hero-day.jpg",
        alt: "Amnaya — hero day render",
        caption: "hero-day.jpg",
      },
      {
        src: "/assets/amnaya/renders/hero-dusk.jpg",
        alt: "Amnaya — hero dusk render",
        caption: "hero-dusk.jpg",
      },
      {
        src: "/assets/amnaya/renders/building-day.jpg",
        alt: "Amnaya — building day render",
        caption: "building-day.jpg",
      },
      {
        src: "/assets/amnaya/renders/building-day-2.jpg",
        alt: "Amnaya — second day elevation",
        caption: "building-day-2.jpg",
      },
      {
        src: "/assets/amnaya/renders/building-mid.jpg",
        alt: "Amnaya — mid-day elevation",
        caption: "building-mid.jpg",
      },
      {
        src: "/assets/amnaya/renders/dusk-building.jpg",
        alt: "Amnaya — dusk building render",
        caption: "dusk-building.jpg",
      },
    ],
  },
  {
    label: "Landscape & Lake",
    description: "Garden and 25-acre lake views.",
    items: [
      {
        src: "/assets/amnaya/renders/landscape.jpg",
        alt: "Amnaya — landscaped garden",
        caption: "landscape.jpg",
      },
      {
        src: "/assets/amnaya/renders/lake-view.jpg",
        alt: "Amnaya — 25-acre lake view",
        caption: "lake-view.jpg",
      },
    ],
  },
  {
    label: "Amenities & Clubhouse",
    description: "Clubhouse and community spaces.",
    items: [
      {
        src: "/assets/amnaya/renders/clubhouse.jpg",
        alt: "Amnaya — clubhouse render",
        caption: "clubhouse.jpg",
      },
      {
        src: "/assets/amnaya/renders/panorama.jpg",
        alt: "Amnaya — panoramic render",
        caption: "panorama.jpg",
      },
    ],
  },
  {
    label: "Masterplan & Location",
    description: "Site layout and location context.",
    items: [
      {
        src: "/assets/amnaya/renders/masterplan.jpg",
        alt: "Amnaya — official masterplan",
        caption: "masterplan.jpg",
      },
      {
        src: "/assets/amnaya/renders/location.jpg",
        alt: "Amnaya — location context",
        caption: "location.jpg",
      },
    ],
  },
  {
    label: "Floor Plans",
    description: "Residence floor-plan sheets.",
    items: [
      {
        src: "/assets/amnaya/floor-plans/floor-plan-01.jpg",
        alt: "Amnaya — 3 BHK floor plan",
        caption: "floor-plan-01.jpg",
      },
    ],
  },
];

export default function AssetTestPage() {
  return (
    <div className="py-16">
      <Container size="page">
        <Eyebrow>Technical verification</Eyebrow>
        <h1 className="mt-3 font-serif text-4xl font-medium tracking-tight text-foreground">
          Asset pipeline check
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
          Each image below is served from{" "}
          <code className="text-xs">frontend/public/assets/amnaya</code> via the public URL pattern.
          If any image fails to render, the PDF → extraction → filesystem → browser pipeline is
          broken for that asset.
        </p>

        <div className="mt-12 space-y-16">
          {assetGroups.map((group) => (
            <section key={group.label}>
              <h2 className="font-serif text-2xl font-medium text-foreground">{group.label}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{group.description}</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.items.map((item) => (
                  <figure
                    key={item.src}
                    className="overflow-hidden rounded-card border border-border bg-card"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.src}
                      alt={item.alt}
                      className="h-48 w-full object-cover"
                      loading="lazy"
                    />
                    <figcaption className="px-4 py-3 text-xs text-muted-foreground">
                      {item.caption}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </section>
          ))}
        </div>
      </Container>
    </div>
  );
}
