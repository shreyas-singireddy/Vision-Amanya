/**
 * Amnaya — the single-project content source.
 *
 * Everything a page shell needs to know about the development lives here:
 * verified facts (sourced from `knowledge/project/amnaya/*`), amenities and
 * curated real renders (from `public/assets/amnaya/`). This is the seam where
 * future backend data replaces static content: page components read this
 * module and never hardcode project facts themselves.
 *
 * NOTE: Only figures present in the project documentation are listed. Do not
 * add distances, prices, dates or claims that are not verified.
 */

/** Project identity — the word "Amnaya" is the brand. */
export const projectConfig = {
  name: "Amnaya",
  fullName: "Vision Amnaya",
  developer: "Vision Infra Developers",
  location: "Khajaguda, Hyderabad",
  country: "India",
  tagline: "First of its kind residential project",
} as const;

/** Verified project facts (labels + values from the project source). */
export const projectFacts = [
  { label: "Site", value: "5.3 acres" },
  { label: "Residences", value: "420" },
  { label: "Floors", value: "10" },
  { label: "Typology", value: "3 BHK" },
  { label: "Sizes", value: "1,715 – 2,590 sq.ft." },
  { label: "Garden", value: "2 acres" },
  { label: "Lake view", value: "25 acres" },
  { label: "Entrance", value: "Double-height stilt" },
  { label: "Clubhouse", value: "25,000 sq.ft." },
] as const;

export type ProjectFact = (typeof projectFacts)[number];

/**
 * Curated real renders — all paths confirmed valid JPEG files.
 *
 * The primary named assets (hero, exterior01…) map to the valid `renders/`
 * sub-directory which contains properly encoded JPEG files. The previous
 * named category files (hero/, exterior/, interior/ etc.) contained corrupted
 * binary data and have been superseded.
 */
export const projectAssets = {
  /* ── Hero ─────────────────────────────────────────────────── */
  hero: "/assets/amnaya/renders/hero-day.jpg",

  /* ── Exterior / Architecture ──────────────────────────────── */
  exterior01: "/assets/amnaya/renders/building-day.jpg",
  exterior02: "/assets/amnaya/renders/building-day-2.jpg",
  exterior03: "/assets/amnaya/renders/dusk-building.jpg",
  exterior04: "/assets/amnaya/renders/building-mid.jpg",
  architecture: "/assets/amnaya/renders/building-mid.jpg",

  /* ── Entrance / Arrival ───────────────────────────────────── */
  entrance: "/assets/amnaya/renders/building-day.jpg",

  /* ── Interiors & Lifestyle ────────────────────────────────── */
  interior01: "/assets/amnaya/renders/hero-day.jpg",
  interior02: "/assets/amnaya/renders/panorama.jpg",
  lifestyle: "/assets/amnaya/renders/landscape.jpg",

  /* ── Amenities ────────────────────────────────────────────── */
  amenities: "/assets/amnaya/renders/clubhouse.jpg",
  clubhouse01: "/assets/amnaya/renders/clubhouse.jpg",
  clubhouse02: "/assets/amnaya/renders/panorama.jpg",
  pool: "/assets/amnaya/renders/panorama.jpg",

  /* ── Landscape & Nature ───────────────────────────────────── */
  landscape: "/assets/amnaya/renders/landscape.jpg",
  lake: "/assets/amnaya/renders/lake-view.jpg",

  /* ── Masterplan & Location ────────────────────────────────── */
  masterplan01: "/assets/amnaya/renders/masterplan.jpg",
  masterplan02: "/assets/amnaya/renders/building-day.jpg",
  location: "/assets/amnaya/renders/location.jpg",
  diagram: "/assets/amnaya/renders/masterplan.jpg",

  /* ── Floor Plans ──────────────────────────────────────────── */
  floorplans: "/assets/amnaya/floor-plans/floor-plan-01.jpg",
  floorplanA: "/assets/amnaya/floor-plans/floor-plan-01.jpg",
  floorplanB: "/assets/amnaya/floor-plans/floor-plan-02.jpg",
  floorplanC: "/assets/amnaya/floor-plans/floor-plan-03.jpg",
  blockPlan: "/assets/amnaya/floor-plans/floor-plan-04.jpg",

  /* ── Render aliases (used by gallery, design pages) ──────── */
  buildingDay: "/assets/amnaya/renders/building-day.jpg",
  buildingMid: "/assets/amnaya/renders/building-mid.jpg",
  buildingDusk: "/assets/amnaya/renders/dusk-building.jpg",
  lakeView: "/assets/amnaya/renders/lake-view.jpg",
  panorama: "/assets/amnaya/renders/panorama.jpg",
} as const;

export type ProjectAssetKey = keyof typeof projectAssets;

/** Amenity groups — verified from the project documentation. */
export const amenityGroups = [
  {
    id: "health",
    label: "Health & Wellness",
    items: ["Gym", "Meditation & Yoga room", "Aerobics", "Spa & salon"],
  },
  {
    id: "sports",
    label: "Sports & Courts",
    items: [
      "Rooftop swimming pool",
      "Badminton courts (2)",
      "Squash court",
      "Half basketball court",
      "Cricket practice net",
    ],
  },
  {
    id: "family",
    label: "Family & Community",
    items: ["25,000 sq.ft. clubhouse", "Multipurpose hall", "Guest rooms (4)", "Creche"],
  },
  {
    id: "leisure",
    label: "Leisure & Social",
    items: ["Billiards lounge", "Indoor games", "Table tennis", "Chess & carroms", "Hobby room"],
  },
] as const;

export type AmenityGroup = (typeof amenityGroups)[number];

/** A curated subset used by the homepage amenity preview. */
export const featuredAmenities = [
  "25,000 sq.ft. clubhouse",
  "Rooftop swimming pool",
  "Meditation & yoga room",
  "Badminton courts",
  "Gym",
  "Spa & salon",
] as const;
