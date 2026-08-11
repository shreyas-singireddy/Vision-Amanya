# Vision Amnaya — Design Rules (Enforced)

The non-negotiable implementation rules for building any page or component in
this project. Read this **before** writing JSX. Violating a rule is a review
failure. The live source of truth is `/styleguide`; tokens are canonical in
`src/app/globals.css`.

## 1. Tokens only — never literals

- Never hardcode a hex colour, duration, shadow, or z-index in a component.
  Use the utility (`text-primary-700`, `shadow-card`) or a token from
  `@constants/design-tokens`.
- `globals.css` is canonical; the TS mirror in `design-tokens.ts` must stay in
  sync when a token changes.
- No bespoke keyframes or inline transitions in components — consume the
  `animate-*` tokens and `@lib/motion` helpers.

## 2. Import from the barrels

- UI: `@components/ui` — never deep-import component files.
- Forms: `@components/forms` (`PhoneInput`, `DateInput`, `BudgetSelect`,
  `PreferenceSelect`).
- Property: `@components/property` (`ResidenceCard`, `FloorPlanCard`,
  `BuildingCard`, `SpecList`, `PropertyBadge`).
- Routes: `@constants/routes` — never hardcode a path string (typed routes).

## 3. Layout primitives

- Use `Grid` / `GridItem` for column layouts, `Stack` for flex rows/columns
  with token gaps, `Container size="…"` for page widths.
- Semantic spacing: `gap-md`, `p-lg` etc. Prefer over raw numbers.
- Containers: hero 96rem / gallery 100rem / page 80rem / narrow 72rem /
  tight 60rem / prose 42rem. Editorial text stays ≤ `max-w-prose`.

## 4. Type

- Serif (`Cormorant Garamond`) for display, numerals, quotes, captions.
  Geist for body and everything interactive.
- Display sizes are fluid `clamp()` values — reserve `display-1` for the hero.
- Numerals in statistics use the `numeric` utility (tabular figures).
- Labels/eyebrows use `tracking-label`/`tracking-eyebrow` + uppercase — never
  invent tracking.

## 5. Colour & surfaces

- One signature accent moment per composition. The accent button is the
  signature, not the default — default to primary emerald.
- Inverted (dark) sections: use `text-neutral-50` variants. **Never**
  `text-background` on a dark surface (breaks in dark mode).
- `shadow-cinematic` is reserved for hero/gallery moments only.
- Overlays on imagery use `ImageCard` (default `ink` scrim) or `ImageFrame`
  hero variant — never hand-rolled scrim divs.

## 6. Imagery

- Use the real renders in `public/assets/amnaya/**` (via `/assets/amnaya/…`).
- Always frame photography with `ImageFrame` / `ImageCard` so the vignette
  reads consistently. Provide `alt` text describing the image.

## 7. Forms

- Compose label + control + message with `Field`. Errors set `aria-invalid`.
- Enquiry/contact forms use the purpose-built controls: `PhoneInput`,
  `DateInput`, `BudgetSelect`, `PreferenceSelect`.
- Validate phone/date/budget before submit; surface errors with `Alert`
  (`tone="error"`).

## 8. Feedback & states

- Loading = `LoadingState` / `Skeleton` / `Spinner`. Empty = `EmptyState`.
  Failure = `ErrorState` or `Alert`. No bespoke spinners or toasts.
- Toasts come from the `ui` store (`ui.toast`) with a tone — not from custom
  code.

## 9. Brand & voice

- The brand is **Vision Amnaya** — never "Amanya". Every user-facing string
  uses the correct spelling.
- Editorial copy: short sentences, no exclamation marks, no "Luxury
  Redefined!!!" hype. Let the architecture speak.
- Use the correct project facts (from `project-assets/`): 5.3 acres, 420
  units, 10 floors, 1,715–2,590 sq.ft., 3 BHK, 25-acre lake view, 2-acre
  garden, double-height stilt entrance, 25,000 sq.ft. clubhouse.

## 10. Verification

After any change run, in `frontend/`:

```bash
npm run lint
npm run typecheck
npm run build
```

All three must pass before a PR. After route changes also run
`npx next typegen`.
