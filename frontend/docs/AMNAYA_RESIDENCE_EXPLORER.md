# Vision Amnaya — Unit / Residence Explorer Specification

Comprehensive technical specification and integration guide for Amnaya's Unit / Residence Explorer (`src/components/amnaya/residences/`).

---

## 1. Architectural Role & Flow

The **Unit / Residence Explorer** acts as the central property discovery bridge connecting interactive floor plans to unit-level 3D visualization and future AI advisory services:

```
Homepage / Masterplan
       ↓
Residences Directory (/residences)
       ↓
Tower & Floor Level Selection
       ↓
Interactive Floor Plan (Phase 6.5)
       ↓
Select Residence
       ↓
UNIT / RESIDENCE EXPLORER (/residences/[unitId])
       ├── Architectural Hero & Verified Specs
       ├── Visual Renderings Gallery & Lightbox
       ├── Unit Plan vs. Block Floor Plan Viewer (Phase 6.5)
       ├── Interactive 3D Tower Placement (Phase 6.4)
       ├── Side-by-Side Comparison Matrix (Zustand)
       ├── Auto-Populated Enquiry & Site Visit Modal (Phase 6.8 Prep)
       └── "You May Also Like" Verified Recommendations (Phase 6.7 Prep)
```

---

## 2. Route Architecture & Deep-Linking

The Unit Explorer supports three shareable, bookmarkable route structures:

1. **Unit ID Route**: `/residences/[unitId]` (e.g. `/residences/residence-1804`)
2. **Hierarchical Location Route**: `/residences/[building]/[floor]/[unit]` (e.g. `/residences/Tower-A/10/1804`)
3. **Property Slug Route**: `/properties/[slug]` (e.g. `/properties/residence-1804`)

All routes render server-side generated dynamic metadata (`generateMetadata`) with OpenGraph tags based strictly on verified unit attributes.

---

## 3. Data Integrity & Verified Inventory

> [!IMPORTANT]
> **Data Integrity Constraint**: No property figures or features are invented. Inventory data strictly mirrors verified Amnaya project facts:
>
> - Site: 5.3 acres
> - Total Units: 420 3 BHK residences across 10 floors
> - Typologies: 3 BHK Type A (1,715 sq.ft.), Type B (2,100 sq.ft.), Type C (2,590 sq.ft.)
> - Orientations: 25-Acre Lake View, 2-Acre Central Garden View, Dual Aspect Corner
> - Clearance: Double-height 18 ft. stilt entrance

---

## 4. Component Structure

All components are located in `src/components/amnaya/residences/`:

```
src/components/amnaya/residences/
├── ResidenceHero.tsx           # Architectural hero with title, typology, floor, view, availability
├── ResidenceSummary.tsx        # SpecList grid grouped by Architecture, Dimensions, Orientation
├── ResidenceGallery.tsx        # Desktop primary + thumbnail strip & mobile touch swipe gallery + Lightbox
├── ResidenceFloorPlan.tsx      # Differentiates Unit Plan from Typical Block Floor Plan (Phase 6.5)
├── Residence3D.tsx             # Integrates Phase 6.4 <Amnaya3DExperience /> focused on tower context
├── ResidenceActions.tsx        # Action triggers, Share link (toast), Compare toggle, Mobile sticky bar
├── ResidenceComparison.tsx     # Bottom floating comparison matrix using usePropertyStore (up to 3 units)
├── SimilarResidences.tsx       # Verified recommendations grid matching view/typology
├── ResidenceEnquiryModal.tsx   # Auto-populated enquiry/site visit modal preserving unit context
├── ResidenceExplorer.tsx       # Composite experience container
└── index.ts                    # Barrel export module
```

---

## 5. Integration Hooks (Phase 6.7 AI & Phase 6.8 CRM)

### Phase 6.7 AI Sales Consultant Integration Seam

`ResidenceService.getSimilar(unitId)` and `ResidenceExplorer` expose structured property DTOs for the future AI Sales Consultant:

- AI prompt context: `unitId`, `typology`, `location.view`, `superBuiltUpAreaSqft`, `availability`.
- Deep-link trigger: The AI assistant can recommend a unit by directing the user to `/residences/[unitId]`.

### Phase 6.8 CRM / Site Visit Integration Contract

`ResidenceEnquiryModal` submits an automated payload containing:

```json
{
  "projectId": "vision-amanya",
  "unitId": "residence-1804",
  "unitNumber": "1804",
  "building": "Tower A",
  "floor": 10,
  "typology": "3 BHK Type B",
  "mode": "visit",
  "name": "User Name",
  "phone": "+91 98765 43210",
  "date": "2026-09-01"
}
```

---

## 6. Accessibility & Responsive Standards

1. **Touch & Sticky Mobile Bar**: Mobile screens feature a sticky bottom CTA bar with `env(safe-area-inset-bottom)` padding.
2. **Keyboard Navigation**: Lightbox dialogs and comparison modals support Escape to close and focus trapping.
3. **HTML Fallback**: All specifications, unit descriptions, and orientation data are rendered as accessible HTML text (never trapped inside images or Canvas).
