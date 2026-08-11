# Design System

The complete visual language for Vision Amnaya, built in Phase 6.2. This is
the canonical reference for tokens, typography, spacing and the reusable
component library. It pairs with:

- [`brand-guidelines.md`](brand-guidelines.md) — palette rationale, brand voice, do / don't
- [`motion-guidelines.md`](motion-guidelines.md) — durations, easings, principles
- [`AMNAYA_DESIGN_RULES.md`](AMNAYA_DESIGN_RULES.md) — the enforced implementation rules for building pages

## Where tokens live

| Concern                                                                                          | Source of truth                           |
| ------------------------------------------------------------------------------------------------ | ----------------------------------------- |
| Colour, surfaces, gradients, glass, semantic roles, type scale                                   | `src/app/globals.css` (`:root` + `.dark`) |
| Tailwind utility mapping (`bg-*`, `text-*`, `shadow-*`, `rounded-*`, `max-w-*`)                  | `@theme inline` block in the same file    |
| Quantitative mirrors (durations, easings, springs, z-index, spacing, radii, shadows, containers) | `src/constants/design-tokens.ts`          |
| Motion helpers                                                                                   | `src/lib/motion/`                         |

**Rule:** `globals.css` is canonical. Never hardcode a hex, duration or shadow
in a component — consume a utility or token. Keep the TS mirror in sync.

## Live styleguide

Route: `/styleguide` (under the `(design)` route group — intentionally _not_
linked from public navigation). Every section renders live components, so
editing a token in `globals.css` is reflected instantly. Run
`npm run dev` and open `/styleguide`.

## Colour

- **Primary** — deep residential emerald `#3d8b66` (500). The brand's
  primary voice: trust, nature, longevity.
- **Accent** — burnished bronze-gold `#a3744a` (500). Reserved for the
  signature accent button, eyebrows, selected states and gold-gradient
  numerals. Bronze reads warmer and more architectural than a pure gold.
- **Neutral** — warm greys, never blue-grey, to keep stone/wood palettes warm.
- **Navy (dusk)** — `#22303b`-family dusk navy for cinematic dark surfaces
  (hero, footer, gallery overlays) that need a cooler, night-lit mood than
  the forest ink.
- **Sky & lake** — a daylight ramp paired with the lake imagery; use for
  weather/light moments and light sections, never as a primary CTA colour.
- **Semantic** — success / warning / error / info, each with 50/100/200/
  500/600/800/900 shades for soft + solid + text use.
- **Overlays & glass** — `--overlay-*` for scrims over imagery; `glass` utility
  for blur surfaces over photography.
- **Gradients** — `grad-hero`, `grad-primary`, `grad-gold`, `grad-surface`,
  `grad-ink`, `grad-dusk`, `grad-lake` via `bg-grad-*` utilities;
  `text-gradient-gold` for display type.

Accessible contrast (light): body text uses `foreground` on `background`;
muted text stays within WCAG AA on `card`/`background`. Inverted sections
(dark hero) always use `text-neutral-50`-based tokens — do **not** use
`text-background` on a dark surface, because in dark mode it resolves dark.

## Typography

- **Display / editorial** — **Cormorant Garamond** (serif, weights 400–700,
  italic available). Headings `h1`–`h3` default to it. Used for numerals,
  quotes, captions and any voice moment.
- **Body / UI** — **Geist** (sans). Everything interactive or informational.
- **Semantic scale** (`text-*` utilities): `display-1..4` (fluid `clamp()`),
  `lead`, `body-large`, `body`, `body-small`, `caption`, `label`, `nav`,
  `button`, `numeric` (tabular numerals), `eyebrow`, `overline`, `quote`.
- **Tracking** (`tracking-*`): `display`, `eyebrow` (0.18em), `overline`
  (0.22em), `caps`, `nav`, `button`, `label`.
- Display sizes are fluid: `--text-display-1` is `clamp(2.75rem, 2rem + 4vw,
4.5rem)` — reserve the top of the range for the hero only.

Copy is confident and editorial — never salesy. See `brand-guidelines.md`.

## Spacing, radius, elevation

- Semantic spacing scale (`space`): `2xs` 0.25 → `5xl` 5rem, exposed as
  `gap-*`/`p-*`/`m-*` utilities (`gap-md`, `p-lg`). Prefer it over raw
  Tailwind numbers. Sections use `sectionSpacing` (`sm` 4rem / `default`
  6rem / `lg` 8rem).
- Containers: `max-w-hero` 96rem, `max-w-gallery` 100rem, `max-w-wide` 88rem,
  `max-w-page` 80rem, `max-w-narrow` 72rem, `max-w-tight` 60rem,
  `max-w-prose` 42rem. Use `<Container size="…" />`.
- Radius scale runs 6px → 24px plus semantic `rounded-input`, `rounded-card`,
  `rounded-card-lg`, `rounded-dialog`.
- Elevation: `shadow-xs`…`shadow-2xl` plus semantic `shadow-card`,
  `shadow-elevated`, `shadow-soft`, `shadow-subtle`, `shadow-modal`,
  `shadow-cinematic` (hero/gallery only), `shadow-glow-primary`,
  `shadow-glow-gold`.
- Z-index ladder in `zIndex`: hide → base → raised → dropdown → sticky →
  overlay → modal → popover → tooltip → toast → skipLink.

## Components

Import from `@components/ui` (barrel in `src/components/ui/index.ts`), form
controls from `@components/forms`, property tiles from `@components/property`.

| Group                | Components                                                                                                 |
| -------------------- | ---------------------------------------------------------------------------------------------------------- |
| Actions              | `Button` (7 variants × 6 sizes, `asChild`, `loading`), `IconButton`                                        |
| Signal               | `Badge` (3 variants × 7 tones), `Tag`, `PropertyBadge`                                                     |
| Links                | `TextLink` (animated underline, `up-right` arrow, external-aware)                                          |
| Feedback             | `Alert` (4 tones), `LoadingState`, `Spinner`, `Skeleton`, `Progress`, `EmptyState`, `ErrorState`, `Avatar` |
| Forms                | `Input`, `Textarea`, `Select`, `Checkbox`, `RadioGroup`, `Switch`, `ToggleGroup`, `Label`, `Field`         |
| Form (purpose-built) | `PhoneInput`, `DateInput`, `BudgetSelect`, `PreferenceSelect`                                              |
| Typography           | `Eyebrow`, `DisplayHeading`, `SectionTitle`                                                                |
| Layout               | `Grid`, `GridItem` (12-col responsive), `Stack` (flex with token gaps), `Container`                        |
| Content              | `Card`, `CardInteractive`, `Stat`, `ImageFrame`, `ImageCard`, `Divider`                                    |
| Property             | `ResidenceCard`, `FloorPlanCard`, `BuildingCard`, `SpecList`/`SpecItem`                                    |
| Overlays             | `Dialog`, `Drawer`, `Popover`, `Tooltip`, `DropdownMenu`, `ScrollArea`, `Separator`                        |
| Navigation           | `NavLink`, `Tabs`, `Accordion`, `Breadcrumbs`, `Pagination`                                                |
| Motion               | `Reveal`, `Stagger` (see `motion-guidelines.md`)                                                           |

All overlays are built on Radix primitives (keyboard nav, focus trap,
`aria-*` included) with design-system styling on top.

## Usage conventions

- Prefer composable primitives over bespoke styles; if you need a new variant,
  extend the component rather than scattering Tailwind strings.
- State feedback (`aria-invalid`, error messages) comes from `Field`.
- Navigation uses typed routes from `@constants/routes` — never hardcode paths.
- Reduced motion: globals already neutralise CSS transitions/animations;
  Framer Motion helpers respect the preference automatically.
- After editing a route or component, run `npm run lint` (Prettier enforced),
  `npm run typecheck`, and `npm run build`.
