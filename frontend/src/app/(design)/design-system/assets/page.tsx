import { Container, Eyebrow } from "@components/ui";

/**
 * Asset verification route — proves the Phase 6.4A pipeline:
 * PDF → extraction → filesystem → Next.js public dir → browser.
 *
 * This is a technical verification page only, not a marketing gallery.
 */

const assetGroups: {
  label: string;
  description: string;
  items: { src: string; alt: string; caption: string }[];
}[] = [
  {
    label: "Exterior",
    description: "Extracted from the source PDF (pages 3–5).",
    items: [
      {
        src: "/assets/amnaya/exterior/amnaya-exterior-01.jpeg",
        alt: "Exterior aerial view",
        caption: "exterior-01 · page 3",
      },
      {
        src: "/assets/amnaya/exterior/amnaya-exterior-03.jpeg",
        alt: "Exterior building view",
        caption: "exterior-03 · page 4",
      },
      {
        src: "/assets/amnaya/exterior/amnaya-exterior-04.jpeg",
        alt: "Exterior front view",
        caption: "exterior-04 · page 5",
      },
    ],
  },
  {
    label: "Architecture",
    description: "Architectural design render (page 6).",
    items: [
      {
        src: "/assets/amnaya/architecture/amnaya-architecture-01.jpeg",
        alt: "Architectural design",
        caption: "architecture-01 · page 6",
      },
      {
        src: "/assets/amnaya/entrance/amnaya-entrance-01.jpeg",
        alt: "Grand entrance",
        caption: "entrance-01 · page 7",
      },
    ],
  },
  {
    label: "Amenities & Lifestyle",
    description: "Amenity and lifestyle imagery (pages 8, 11).",
    items: [
      {
        src: "/assets/amnaya/amenities/amnaya-amenities-01.jpeg",
        alt: "Amenities overview",
        caption: "amenities-01 · page 11",
      },
      {
        src: "/assets/amnaya/lifestyle/amnaya-lifestyle-01.jpeg",
        alt: "Lifestyle imagery",
        caption: "lifestyle-01 · page 8",
      },
      {
        src: "/assets/amnaya/pool/amnaya-pool-01.jpeg",
        alt: "Rooftop pool",
        caption: "pool-01 · page 14",
      },
    ],
  },
  {
    label: "Landscape & Lake",
    description: "Garden and lake views (pages 15–16).",
    items: [
      {
        src: "/assets/amnaya/landscape/amnaya-landscape-01.jpeg",
        alt: "Landscaped garden",
        caption: "landscape-01 · page 15",
      },
      {
        src: "/assets/amnaya/lake/amnaya-lake-01.jpeg",
        alt: "25-acre lake view",
        caption: "lake-01 · page 16",
      },
    ],
  },
  {
    label: "Masterplan",
    description: "Official master / layout plans (pages 17–18).",
    items: [
      {
        src: "/assets/amnaya/masterplan/amnaya-masterplan-01.jpeg",
        alt: "Official master plan",
        caption: "masterplan-01 · page 17",
      },
      {
        src: "/assets/amnaya/masterplan/amnaya-masterplan-02.jpeg",
        alt: "Detailed layout plan",
        caption: "masterplan-02 · page 18",
      },
    ],
  },
  {
    label: "Floor Plans",
    description: "Residence floor plans (page 19).",
    items: [
      {
        src: "/assets/amnaya/floorplans/amnaya-floorplans-01.jpeg",
        alt: "3 BHK floor plan",
        caption: "floorplans-01 · page 19",
      },
    ],
  },
  {
    label: "Clubhouse & Interior",
    description: "Clubhouse and interior renders (pages 9–13).",
    items: [
      {
        src: "/assets/amnaya/clubhouse/amnaya-clubhouse-01.jpeg",
        alt: "Clubhouse",
        caption: "clubhouse-01 · page 12",
      },
      {
        src: "/assets/amnaya/interior/amnaya-interior-01.jpeg",
        alt: "Interior living space",
        caption: "interior-01 · page 9",
      },
      {
        src: "/assets/amnaya/interior/amnaya-interior-02.jpeg",
        alt: "Interior bedroom",
        caption: "interior-02 · page 10",
      },
    ],
  },
  {
    label: "Hero & Location",
    description: "Hero cover and location context (pages 1, 21).",
    items: [
      {
        src: "/assets/amnaya/hero/amnaya-hero-01.jpeg",
        alt: "Project cover",
        caption: "hero-01 · page 1",
      },
      {
        src: "/assets/amnaya/location/amnaya-location-01.jpeg",
        alt: "Location context",
        caption: "location-01 · page 21",
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
                {group.items.map((item, idx) => (
                  <figure
                    key={`${item.key}-${item.src}-${idx}`}
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
