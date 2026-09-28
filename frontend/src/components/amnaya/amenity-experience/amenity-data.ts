/**
 * amenity-data.ts — Verified Amenity Data Model for the Amnaya 3D Amenities Page.
 *
 * Sourced strictly from project documentation (amenityGroups in config/project.ts)
 * and real image assets confirmed in public/assets/amnaya/amenities/.
 * Do not add amenities not present in the project source.
 */

export type AmenityCategory =
  | "Health & Wellness"
  | "Sports & Courts"
  | "Family & Community"
  | "Leisure & Social"
  | "Outdoor & Garden";

export interface AmenityItem {
  id: string;
  name: string;
  description: string;
  category: AmenityCategory;
  image: string;
  imageAlt: string;
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
  hotspotPosition: [number, number, number];
}

export const AMENITIES: AmenityItem[] = [
  {
    id: "outdoor-gym",
    name: "Outdoor Gym",
    description:
      "An open-air fitness zone integrated into the podium landscape, providing a full workout experience with fresh air and natural surroundings.",
    category: "Health & Wellness",
    image: "/assets/amnaya/amenities/outdoor-gym.jpg",
    imageAlt: "Amnaya - outdoor gym and fitness zone",
    cameraPosition: [28, 12, -22],
    cameraTarget: [10, 4, -5],
    hotspotPosition: [20, 4, -10],
  },
  {
    id: "pool",
    name: "Rooftop Swimming Pool",
    description:
      "The rooftop swimming pool sits atop the 25,000 sq.ft. clubhouse spine, offering panoramic lake and skyline views.",
    category: "Sports & Courts",
    image: "/assets/amnaya/amenities/pool.jpg",
    imageAlt: "Amnaya - rooftop swimming pool",
    cameraPosition: [28, 20, -10],
    cameraTarget: [28, 10, -8],
    hotspotPosition: [28, 11, -8],
  },
  {
    id: "basketball-court",
    name: "Half Basketball Court",
    description:
      "A full-size half basketball court on the podium deck, open to residents for daily use.",
    category: "Sports & Courts",
    image: "/assets/amnaya/amenities/basketball-court.jpg",
    imageAlt: "Amnaya - half basketball court",
    cameraPosition: [18, 8, 22],
    cameraTarget: [0, 2, 0],
    hotspotPosition: [8, 1, 14],
  },
  {
    id: "pickleball-court",
    name: "Pickleball Court",
    description:
      "A dedicated pickleball court for residents, one of the fastest-growing racket sports in the community.",
    category: "Sports & Courts",
    image: "/assets/amnaya/amenities/pickleball-court.jpg",
    imageAlt: "Amnaya - pickleball court",
    cameraPosition: [22, 10, 18],
    cameraTarget: [5, 2, 5],
    hotspotPosition: [12, 1, 10],
  },
  {
    id: "cricket-net",
    name: "Cricket Practice Net",
    description:
      "A dedicated cricket net practice facility for residents to refine their game within the campus.",
    category: "Sports & Courts",
    image: "/assets/amnaya/amenities/cricket-net.jpg",
    imageAlt: "Amnaya - cricket practice net",
    cameraPosition: [-22, 10, 20],
    cameraTarget: [-8, 2, 8],
    hotspotPosition: [-14, 1, 12],
  },
  {
    id: "jogging-track",
    name: "Jogging Track",
    description:
      "A landscaped jogging track winding through the 2-acre central garden and podium perimeter for daily wellness.",
    category: "Sports & Courts",
    image: "/assets/amnaya/amenities/jogging-track.jpg",
    imageAlt: "Amnaya - jogging track through central garden",
    cameraPosition: [18, 8, 22],
    cameraTarget: [0, 2, 0],
    hotspotPosition: [-5, 1, 18],
  },
  {
    id: "kids-playground",
    name: "Kids' Playground",
    description:
      "A dedicated children's play area within the central garden, designed for safe and imaginative outdoor play.",
    category: "Family & Community",
    image: "/assets/amnaya/amenities/kids-playground.jpg",
    imageAlt: "Amnaya - kids playground",
    cameraPosition: [12, 8, 20],
    cameraTarget: [-2, 2, 6],
    hotspotPosition: [-6, 1, 16],
  },
  {
    id: "event-lawn",
    name: "Event Lawn",
    description:
      "An open event lawn for community gatherings, celebrations, and residents' social functions.",
    category: "Family & Community",
    image: "/assets/amnaya/amenities/event-lawn.jpg",
    imageAlt: "Amnaya - event lawn for community gatherings",
    cameraPosition: [10, 10, 28],
    cameraTarget: [0, 2, 10],
    hotspotPosition: [-4, 1, 20],
  },
  {
    id: "pet-park",
    name: "Pet Park",
    description:
      "A dedicated pet-friendly open space within the landscaped grounds for residents and their companions.",
    category: "Family & Community",
    image: "/assets/amnaya/amenities/pet-park.jpg",
    imageAlt: "Amnaya - pet park and open green space",
    cameraPosition: [-20, 8, 22],
    cameraTarget: [-8, 2, 8],
    hotspotPosition: [-18, 1, 14],
  },
  {
    id: "chess-garden",
    name: "Chess Garden",
    description:
      "An outdoor chess and games garden — a quiet retreat within the landscaped podium for leisure and reflection.",
    category: "Leisure & Social",
    image: "/assets/amnaya/amenities/chess-garden.jpg",
    imageAlt: "Amnaya - outdoor chess garden",
    cameraPosition: [15, 7, 20],
    cameraTarget: [2, 2, 6],
    hotspotPosition: [5, 1, 14],
  },
  {
    id: "swing-lounge",
    name: "Swing Lounge",
    description:
      "A relaxed open-air lounge with swing seating — designed for casual evenings and social moments in the garden.",
    category: "Leisure & Social",
    image: "/assets/amnaya/amenities/swing-lounge.jpg",
    imageAlt: "Amnaya - swing lounge seating area",
    cameraPosition: [16, 9, 22],
    cameraTarget: [3, 2, 8],
    hotspotPosition: [6, 1, 16],
  },
  {
    id: "aerial-basketball",
    name: "Podium Sports Deck",
    description:
      "The elevated podium sports deck provides an aerial perspective of the sports courts and landscaped grounds below.",
    category: "Outdoor & Garden",
    image: "/assets/amnaya/amenities/aerial-basketball.jpg",
    imageAlt: "Amnaya - aerial view of podium sports deck",
    cameraPosition: [30, 22, 20],
    cameraTarget: [10, 4, 2],
    hotspotPosition: [14, 8, 12],
  },
];

export const AMENITY_CATEGORIES: AmenityCategory[] = [
  "Health & Wellness",
  "Sports & Courts",
  "Family & Community",
  "Leisure & Social",
  "Outdoor & Garden",
];

export function getAmenitiesByCategory(category: AmenityCategory): AmenityItem[] {
  return AMENITIES.filter((a) => a.category === category);
}
