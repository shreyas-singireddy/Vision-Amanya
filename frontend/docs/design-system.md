# Design System

The complete visual language for Vision Amanya, built in Phase 6.2. This is
the canonical reference for tokens, typography, spacing and the reusable
component library. It pairs with:

- [`brand-guidelines.md`](brand-guidelines.md) — palette rationale, brand voice, do / don't
- [`motion-guidelines.md`](motion-guidelines.md) — durations, easings, principles

## Where tokens live

| Concern | Source of truth |
| --- | --- |
| Colour, surfaces, gradients, glass, semantic roles, type scale | `src/app/globals.css` (`:root` + `.dark`) |
| Tailwind utility mapping (`bg-*`, `text-*`, `shadow-*`, `rounded-*`, `max-w-*`) | `@theme inline` block in the same file |
| Quantitative mirrors (durations, easings, springs, z-index, spacing, radii, shadows, containers) | `src/constants/design-tokens.ts` |
| Motion helpers | `src/lib/motion/` |

**Rule:** `globals.css` is canonical. Never hardcode a hex, duration or shadow
in a component — consume a utility or token. Keep the TS mirror in sync.

## Live styleguide

Route: `/styleguide` (under the `(design)` route group — intentionally *not*
linked from public navigation). Every section renders live components, so
editing a token in `globals.css` is reflected instantly. Run
`npm run dev` and open `/styleguide`.

## Colour

- **Primary** — deep residential emerald `#3d8b66` (500). The brand's
  primary voice: trust, nature, longevity.
- **Accent** — burnished gold `#c08e2e` (500). Reserved for the signature
  accent button, eyebrows, selected states and gold-gradient numerals.
- **Neutral** — warm greys, never blue-grey, to keep stone/wood palettes warm.
- **Semantic** — success / warning / error / info, each with 50/100/200/
  500/600/800/900 shades for soft + solid + text use.
- **Overlays & glass** — `--overlay-*` for scrims over imagery; `glass` utility
  for blur surfaces over photography.
- **Gradients** — `grad-hero`, `grad-primary`, `grad-gold`, `grad-surface`,
  `grad-ink` via `bg-grad-*` utilities; `text-gradient-gold` for display type.

Accessible contrast (light): body text uses `foreground` on `background`;
muted text stays within WCAG AA on `card`/`background`. Inverted sections
(dark hero) always use `text-neutral-50`-based tokens — do **not** use
`text-background` on a dark surface, because in dark mode it resolves dark.

## Typography

- **Display / editorial** — **Cormorant Garamond** (serif, weights 400–700,
  italic available). Headings `h1`–`h3` default to it. Used for numerals,
  quotes, captions and any voice moment.
- **Body / UI** — **Geist** (sans). Everything interactive or informational.
- **Semantic scale** (`text-*` utilities): `display-1..4`, `lead`, `base`,
  `caption`, `eyebrow`, `overline`, `quote`.
- **Tracking** (`tracking-*`): `display`, `eyebrow` (0.18em), `overline`
  (0.22em), `caps`.

Copy is confident and editorial — never salesy. See `brand-guidelines.md`.

## Spacing, radius, elevation

- Spacing uses Tailwind's 4px base scale; sections use `sectionSpacing`
  (`sm` 4rem / `default` 6rem / `lg` 8rem) — see the styleguide rhythm section.
- Containers: `max-w-page` 80rem, `max-w-wide` 88rem, `max-w-narrow` 72rem,
  `max-w-tight` 60rem, `max-w-prose` 42rem. Use `<Container size="…" />`.
- Radius scale runs 6px → 24px plus semantic `rounded-input`, `rounded-card`,
  `rounded-card-lg`, `rounded-dialog`.
- Elevation: `shadow-xs`…`shadow-2xl` plus semantic `shadow-card`,
  `shadow-elevated`, `shadow-soft`, `shadow-glow-primary`, `shadow-glow-gold`.
- Z-index ladder in `zIndex`: hide → base → raised → dropdown → sticky →
  overlay → modal → popover → tooltip → toast → skipLink.

## Components

Import from `@components/ui` (barrel in `src/components/ui/index.ts`).

| Group | Components |
| --- | --- |
| Actions | `Button` (7 variants × 6 sizes, `asChild`, `loading`) |
| Signal | `Badge` (3 variants × 7 tones) |
| Forms | `Input`, `Textarea`, `Select`, `Checkbox`, `RadioGroup`, `Switch`, `ToggleGroup`, `Label`, `Field` |
| Typography | `Eyebrow`, `DisplayHeading`, `SectionTitle` |
| Content | `Card`, `CardInteractive`, `Stat`, `ImageFrame`, `Divider`, `Container` |
| Feedback | `Spinner`, `Skeleton`, `Progress`, `EmptyState`, `ErrorState`, `Avatar` |
| Overlays | `Dialog`, `Drawer`, `Popover`, `Tooltip`, `DropdownMenu`, `ScrollArea`, `Separator` |
| Navigation | `NavLink`, `Tabs`, `Accordion`, `Breadcrumbs`, `Pagination` |
| Motion | `Reveal`, `Stagger` (see `motion-guidelines.md`) |

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
