/**
 * Canonical Image Asset Manifest for Vision Amnaya.
 *
 * Sourced strictly from genuine 3D renders uploaded across 5 batches (21 assets).
 * Every image is permanently stored under `public/assets/amnaya/`.
 *
 * NOTE: Homepage assets are explicitly protected and excluded from this migration manifest
 * to prevent accidental modifications to the homepage image system.
 */

export type MediaCategory =
  | "amenity"
  | "exterior"
  | "entrance"
  | "landscape"
  | "lifestyle"
  | "masterplan";

export interface MediaAsset {
  id: string;
  file: string;
  originalUpload: string;
  category: MediaCategory;
  subject: string;
  dimensions: { width: number; height: number };
  aspectRatio: "16:9" | "4:3";
  focalPoint: string;
  suitableSections: string[];
  unsuitableSections: string[];
  protectedHomepage: boolean;
  verified: boolean;
  altText: string;
}

export const mediaManifest: MediaAsset[] = [
  /* ── BATCH 1: AMENITIES ─────────────────────────────────────────────────── */
  {
    id: "amenity-outdoor-gym",
    file: "/assets/amnaya/amenities/outdoor-gym.jpg",
    originalUpload: "media_1790611324494.jpg",
    category: "amenity",
    subject: "Outdoor gym / open-air fitness station with workout equipment",
    dimensions: { width: 1024, height: 576 },
    aspectRatio: "16:9",
    focalPoint: "Central fitness equipment cluster with active residents",
    suitableSections: ["amenities", "wellness", "gallery"],
    unsuitableSections: ["homepage", "floor-plans", "residence-units"],
    protectedHomepage: true,
    verified: true,
    altText: "Vision Amnaya open-air fitness station with outdoor gym equipment in landscaped setting",
  },
  {
    id: "amenity-chess-garden",
    file: "/assets/amnaya/amenities/chess-garden.jpg",
    originalUpload: "media_1790611324605.jpg",
    category: "amenity",
    subject: "Giant outdoor chess board with family recreation",
    dimensions: { width: 1024, height: 576 },
    aspectRatio: "16:9",
    focalPoint: "Giant chess board and family interaction in garden setting",
    suitableSections: ["amenities", "recreation", "gallery", "lifestyle"],
    unsuitableSections: ["homepage", "floor-plans", "residence-units"],
    protectedHomepage: true,
    verified: true,
    altText: "Vision Amnaya outdoor chess garden with oversized board and landscaped garden perimeter",
  },
  {
    id: "amenity-rooftop-pool",
    file: "/assets/amnaya/amenities/pool.jpg",
    originalUpload: "media_1790611324690.jpg",
    category: "amenity",
    subject: "Rooftop swimming pool with residential tower facade backdrop",
    dimensions: { width: 1024, height: 576 },
    aspectRatio: "16:9",
    focalPoint: "Swimming pool water surface, deck lounges, and tower backdrop",
    suitableSections: ["amenities", "sports", "gallery"],
    unsuitableSections: ["homepage", "floor-plans", "residence-units"],
    protectedHomepage: true,
    verified: true,
    altText: "Vision Amnaya rooftop swimming pool with pool deck loungers and residential tower elevation",
  },
  {
    id: "amenity-pet-park",
    file: "/assets/amnaya/amenities/pet-park.jpg",
    originalUpload: "media_1790611324732.jpg",
    category: "amenity",
    subject: "Pet park with agility play equipment in golden-hour light",
    dimensions: { width: 1024, height: 576 },
    aspectRatio: "16:9",
    focalPoint: "Dog in sand play area with agility hoops and landscaped green boundary",
    suitableSections: ["amenities", "family", "gallery"],
    unsuitableSections: ["homepage", "floor-plans", "residence-units"],
    protectedHomepage: true,
    verified: true,
    altText: "Vision Amnaya pet park featuring dog agility equipment and secured green run zone",
  },
  {
    id: "amenity-event-lawn",
    file: "/assets/amnaya/amenities/event-lawn.jpg",
    originalUpload: "media_1790611512528.jpg",
    category: "amenity",
    subject: "Evening outdoor banquet and open-air event lawn with festive lighting",
    dimensions: { width: 1024, height: 576 },
    aspectRatio: "16:9",
    focalPoint: "Banquet dining tables under fairy lights with illuminated clubhouse backdrop",
    suitableSections: ["amenities", "community", "events", "gallery"],
    unsuitableSections: ["homepage", "floor-plans", "residence-units"],
    protectedHomepage: true,
    verified: true,
    altText: "Vision Amnaya evening banquet lawn with festive lighting and illuminated clubhouse facade",
  },

  /* ── BATCH 2: SPORTS & RECREATION ────────────────────────────────────────── */
  {
    id: "amenity-pickleball-court",
    file: "/assets/amnaya/amenities/pickleball-court.jpg",
    originalUpload: "media_1790611571181.jpg",
    category: "amenity",
    subject: "Pickleball / tennis court with players mid-rally in lush greenery",
    dimensions: { width: 1024, height: 576 },
    aspectRatio: "16:9",
    focalPoint: "Player returning shot across net with jacaranda trees in background",
    suitableSections: ["amenities", "sports", "gallery"],
    unsuitableSections: ["homepage", "floor-plans", "residence-units"],
    protectedHomepage: true,
    verified: true,
    altText: "Vision Amnaya outdoor pickleball court with active rally and lush landscaped perimeter",
  },
  {
    id: "amenity-cricket-net",
    file: "/assets/amnaya/amenities/cricket-net.jpg",
    originalUpload: "media_1790611571269.jpg",
    category: "amenity",
    subject: "Cricket practice net enclosure with batsman and bowler in action",
    dimensions: { width: 1024, height: 576 },
    aspectRatio: "16:9",
    focalPoint: "Batsman at crease facing bowler inside covered net enclosure",
    suitableSections: ["amenities", "sports", "gallery"],
    unsuitableSections: ["homepage", "floor-plans", "residence-units"],
    protectedHomepage: true,
    verified: true,
    altText: "Vision Amnaya dedicated cricket practice net with covered enclosure and turf pitch",
  },
  {
    id: "amenity-jogging-track",
    file: "/assets/amnaya/amenities/jogging-track.jpg",
    originalUpload: "media_1790611571325.jpg",
    category: "amenity",
    subject: "Jogging track winding through flowering garden pathway",
    dimensions: { width: 1024, height: 576 },
    aspectRatio: "16:9",
    focalPoint: "Runner on textured track path bordered by purple flowering beds and palms",
    suitableSections: ["amenities", "wellness", "landscape", "gallery"],
    unsuitableSections: ["homepage", "floor-plans", "residence-units"],
    protectedHomepage: true,
    verified: true,
    altText: "Vision Amnaya landscaped jogging track through central garden with flowering flora",
  },
  {
    id: "amenity-kids-playground",
    file: "/assets/amnaya/amenities/kids-playground.jpg",
    originalUpload: "media_1790611571389.jpg",
    category: "amenity",
    subject: "Children's adventure playground with rope bridges and climbing structures",
    dimensions: { width: 1024, height: 576 },
    aspectRatio: "16:9",
    focalPoint: "Children on rope bridge with climbing wall and residential tower in background",
    suitableSections: ["amenities", "family", "gallery"],
    unsuitableSections: ["homepage", "floor-plans", "residence-units"],
    protectedHomepage: true,
    verified: true,
    altText: "Vision Amnaya children's play zone with adventure climbing structures and safety flooring",
  },
  {
    id: "amenity-swing-lounge",
    file: "/assets/amnaya/amenities/swing-lounge.jpg",
    originalUpload: "media_1790611571410.jpg",
    category: "amenity",
    subject: "Hanging pod swing lounge beneath modern steel canopy structure",
    dimensions: { width: 1024, height: 576 },
    aspectRatio: "16:9",
    focalPoint: "Hanging pod egg chairs under architectural canopy facing garden courtyard",
    suitableSections: ["amenities", "leisure", "lifestyle", "gallery"],
    unsuitableSections: ["homepage", "floor-plans", "residence-units"],
    protectedHomepage: true,
    verified: true,
    altText: "Vision Amnaya open-air swing lounge with hanging chairs and landscaped garden seating",
  },

  /* ── BATCH 3: COURTS, GARDENS, ARRIVAL, LAKE ELEVATION ───────────────────── */
  {
    id: "amenity-basketball-court",
    file: "/assets/amnaya/amenities/basketball-court.jpg",
    originalUpload: "media_1790611599352.jpg",
    category: "amenity",
    subject: "Half basketball court with players at dusk",
    dimensions: { width: 1024, height: 576 },
    aspectRatio: "16:9",
    focalPoint: "Player dribbling at center court with residential facade in background",
    suitableSections: ["amenities", "sports", "gallery"],
    unsuitableSections: ["homepage", "floor-plans", "residence-units"],
    protectedHomepage: true,
    verified: true,
    altText: "Vision Amnaya half basketball court with acrylic sports surface and perimeter lighting",
  },
  {
    id: "lifestyle-community-garden",
    file: "/assets/amnaya/lifestyle/community-garden.jpg",
    originalUpload: "media_1790611599619.jpg",
    category: "lifestyle",
    subject: "Community garden promenade with residents strolling, flowering trees, and outdoor games",
    dimensions: { width: 1024, height: 576 },
    aspectRatio: "16:9",
    focalPoint: "Paved garden promenade with families, jacaranda and gulmohar trees",
    suitableSections: ["project", "about", "lifestyle", "gallery"],
    unsuitableSections: ["homepage", "floor-plans", "residence-units"],
    protectedHomepage: true,
    verified: true,
    altText: "Vision Amnaya community promenade with flowering canopy trees, leisure seating, and garden paths",
  },
  {
    id: "lifestyle-podium-courtyard",
    file: "/assets/amnaya/lifestyle/podium-courtyard.jpg",
    originalUpload: "media_1790611599713.jpg",
    category: "lifestyle",
    subject: "Landscaped leisure garden plaza with hexagonal paving and manicured lawn islands",
    dimensions: { width: 1024, height: 576 },
    aspectRatio: "16:9",
    focalPoint: "Resident on lawn island surrounded by geometric pavers and raised planters",
    suitableSections: ["project", "gallery", "lifestyle"],
    unsuitableSections: ["homepage", "floor-plans", "residence-units"],
    protectedHomepage: true,
    verified: true,
    altText: "Vision Amnaya podium garden plaza with geometric paving, manicured lawn islands, and planters",
  },
  {
    id: "entrance-arrival-gate",
    file: "/assets/amnaya/entrance/amnaya-entrance-gate.jpg",
    originalUpload: "media_1790611599762.jpg",
    category: "entrance",
    subject: "Grand entrance arrival gate with cantilevered canopy and 'Vision Amnaya' signage",
    dimensions: { width: 1024, height: 576 },
    aspectRatio: "16:9",
    focalPoint: "Illuminated 'Vision Amnaya' entrance feature wall and drop-off canopy with towers behind",
    suitableSections: ["about", "project", "gallery"],
    unsuitableSections: ["homepage", "floor-plans", "residence-units"],
    protectedHomepage: true,
    verified: true,
    altText: "Vision Amnaya grand entrance gate with architectural canopy and branded arrival portal",
  },
  {
    id: "exterior-twilight-lake",
    file: "/assets/amnaya/exterior/twilight-lake-elevation.jpg",
    originalUpload: "media_1790611599799.jpg",
    category: "exterior",
    subject: "Full project aerial elevation across lake at twilight with illuminated towers",
    dimensions: { width: 1024, height: 576 },
    aspectRatio: "16:9",
    focalPoint: "Towers mirrored across water at blue hour with distant city skyline",
    suitableSections: ["project", "gallery", "location"],
    unsuitableSections: ["homepage", "floor-plans", "residence-units"],
    protectedHomepage: true,
    verified: true,
    altText: "Vision Amnaya multi-tower residential elevation mirrored in lake waters during twilight",
  },

  /* ── BATCH 4: EXTERIOR, DAYTIME LAKE, PODIUM & AERIAL AMENITIES ─────────── */
  {
    id: "exterior-street-level",
    file: "/assets/amnaya/exterior/street-level-exterior.jpg",
    originalUpload: "media_1790611639603.jpg",
    category: "exterior",
    subject: "Street-level perspective showing full tower facade from arterial road",
    dimensions: { width: 1024, height: 576 },
    aspectRatio: "16:9",
    focalPoint: "Arterial road approach and architectural tower facade frontage",
    suitableSections: ["about", "project", "gallery"],
    unsuitableSections: ["homepage", "floor-plans", "residence-units"],
    protectedHomepage: true,
    verified: true,
    altText: "Vision Amnaya street-level architectural frontage from arterial road approach",
  },
  {
    id: "exterior-lake-daytime",
    file: "/assets/amnaya/exterior/lake-daytime.jpg",
    originalUpload: "media_1790611639699.jpg",
    category: "exterior",
    subject: "Serene daytime lake-front elevation with calm mirror reflection",
    dimensions: { width: 1024, height: 576 },
    aspectRatio: "16:9",
    focalPoint: "Reflection of modern residential towers across 25-acre calm lake surface",
    suitableSections: ["project", "gallery"],
    unsuitableSections: ["homepage", "floor-plans", "residence-units"],
    protectedHomepage: true,
    verified: true,
    altText: "Vision Amnaya daytime lake-front elevation with natural water reflection and open horizon",
  },
  {
    id: "lifestyle-garden-courtyard",
    file: "/assets/amnaya/lifestyle/garden-courtyard.jpg",
    originalUpload: "media_1790611639750.jpg",
    category: "lifestyle",
    subject: "Podium garden courtyard with couple on lawn and glass-front clubhouse",
    dimensions: { width: 1024, height: 689 },
    aspectRatio: "4:3",
    focalPoint: "Residents relaxing on lawn with glass clubhouse ground floor",
    suitableSections: ["about", "lifestyle", "gallery"],
    unsuitableSections: ["homepage", "floor-plans", "residence-units"],
    protectedHomepage: true,
    verified: true,
    altText: "Vision Amnaya podium garden courtyard with residents relaxing before glazed clubhouse pavilion",
  },
  {
    id: "masterplan-aerial-amenity-zone",
    file: "/assets/amnaya/masterplan/aerial-amenity-zone.jpg",
    originalUpload: "media_1790611639827.jpg",
    category: "masterplan",
    subject: "Bird's-eye overhead amenity layout showing basketball court, play areas, and jogging track",
    dimensions: { width: 1024, height: 689 },
    aspectRatio: "4:3",
    focalPoint: "Full overhead view of amenity deck with marked track, sports court, and play structures",
    suitableSections: ["masterplan", "gallery"],
    unsuitableSections: ["homepage", "floor-plans", "residence-units"],
    protectedHomepage: true,
    verified: true,
    altText: "Vision Amnaya aerial amenity zone layout showing sports court, track, and recreation zones",
  },
  {
    id: "amenity-aerial-basketball",
    file: "/assets/amnaya/amenities/aerial-basketball.jpg",
    originalUpload: "media_1790611639848.jpg",
    category: "amenity",
    subject: "Aerial view of basketball court and spectator steps on podium sports deck",
    dimensions: { width: 1024, height: 576 },
    aspectRatio: "16:9",
    focalPoint: "Basketball court with spectator seating steps adjacent to lake bank",
    suitableSections: ["contact", "amenities", "gallery"],
    unsuitableSections: ["homepage", "floor-plans", "residence-units"],
    protectedHomepage: true,
    verified: true,
    altText: "Vision Amnaya elevated view of podium sports deck, basketball court, and spectator terrace",
  },

  /* ── BATCH 5: GOLDEN HOUR LAKE ───────────────────────────────────────────── */
  {
    id: "exterior-golden-hour-lake",
    file: "/assets/amnaya/exterior/golden-hour-lake.jpg",
    originalUpload: "media_1790611656802.jpg",
    category: "exterior",
    subject: "Dawn / golden hour lake elevation with natural water lilies, reeds, and birdlife",
    dimensions: { width: 1024, height: 576 },
    aspectRatio: "16:9",
    focalPoint: "Towers illuminated in warm dawn light across natural wetland lake edge",
    suitableSections: ["project", "gallery", "about"],
    unsuitableSections: ["homepage", "floor-plans", "residence-units"],
    protectedHomepage: true,
    verified: true,
    altText: "Vision Amnaya golden-hour lake elevation with water lilies, wetlands, and residential towers",
  },
];

/** Lookup helpers */
export function getMediaAssetById(id: string): MediaAsset | undefined {
  return mediaManifest.find((asset) => asset.id === id);
}

export function getMediaAssetsByCategory(category: MediaCategory): MediaAsset[] {
  return mediaManifest.filter((asset) => asset.category === category);
}

export function getMediaAssetsForSection(section: string): MediaAsset[] {
  return mediaManifest.filter((asset) => asset.suitableSections.includes(section));
}

/** Direct typed constants for non-homepage consumption */
export const amnayanMigratedAssets = {
  // Entrance & Arrival
  entranceGate: "/assets/amnaya/entrance/amnaya-entrance-gate.jpg",

  // Exterior & Lake
  twilightLakeElevation: "/assets/amnaya/exterior/twilight-lake-elevation.jpg",
  daytimeLakeElevation: "/assets/amnaya/exterior/lake-daytime.jpg",
  goldenHourLakeElevation: "/assets/amnaya/exterior/golden-hour-lake.jpg",
  streetLevelExterior: "/assets/amnaya/exterior/street-level-exterior.jpg",

  // Landscape & Lifestyle
  communityGarden: "/assets/amnaya/lifestyle/community-garden.jpg",
  podiumCourtyard: "/assets/amnaya/lifestyle/podium-courtyard.jpg",
  gardenCourtyard: "/assets/amnaya/lifestyle/garden-courtyard.jpg",

  // Masterplan Aerials
  aerialAmenityZone: "/assets/amnaya/masterplan/aerial-amenity-zone.jpg",

  // Amenities
  outdoorGym: "/assets/amnaya/amenities/outdoor-gym.jpg",
  chessGarden: "/assets/amnaya/amenities/chess-garden.jpg",
  rooftopPool: "/assets/amnaya/amenities/pool.jpg",
  petPark: "/assets/amnaya/amenities/pet-park.jpg",
  eventLawn: "/assets/amnaya/amenities/event-lawn.jpg",
  pickleballCourt: "/assets/amnaya/amenities/pickleball-court.jpg",
  cricketNet: "/assets/amnaya/amenities/cricket-net.jpg",
  joggingTrack: "/assets/amnaya/amenities/jogging-track.jpg",
  kidsPlayground: "/assets/amnaya/amenities/kids-playground.jpg",
  swingLounge: "/assets/amnaya/amenities/swing-lounge.jpg",
  basketballCourt: "/assets/amnaya/amenities/basketball-court.jpg",
  aerialBasketball: "/assets/amnaya/amenities/aerial-basketball.jpg",
} as const;
