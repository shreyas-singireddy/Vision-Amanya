# Vision Amnaya — Design System Reference

> **Phase 6.2 — AMNAYA Design System + Motion System**
> Canonical reference for all visual, typographic, spatial, motion, and interaction decisions.
> Tokens live in `src/app/globals.css`. TypeScript mirror in `src/constants/design-tokens.ts`.

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Color System](#2-color-system)
3. [Typography](#3-typography)
4. [Spacing & Layout](#4-spacing--layout)
5. [Borders & Radius](#5-borders--radius)
6. [Elevation & Shadow](#6-elevation--shadow)
7. [Component Library](#7-component-library)
8. [AMNAYA Components](#8-amnaya-components)
9. [Motion System](#9-motion-system)
10. [Responsive Design](#10-responsive-design)
11. [Accessibility](#11-accessibility)
12. [Performance](#12-performance)
13. [Do / Don't Examples](#13-do--dont-examples)

---

## 1. Design Philosophy

AMNAYA must feel like a world-class luxury architectural brand — not an Indian real-estate marketing website.

### Ten Design Principles

| #   | Principle                                  | Meaning                                                                                    |
| --- | ------------------------------------------ | ------------------------------------------------------------------------------------------ |
| 1   | **Architecture first**                     | Every layout decision is driven by architectural proportion and rhythm, not UI convention. |
| 2   | **Photography first**                      | The image IS the product. Motion and composition must always serve the photograph.         |
| 3   | **Typography creates hierarchy**           | Two font families (Cormorant + Geist). No random sizes. Use the scale.                     |
| 4   | **Motion should feel intentional**         | Every animation answers "why?". Decoration is not a reason.                                |
| 5   | **Whitespace is part of the design**       | Negative space communicates exclusivity. Never fill a gap with more content.               |
| 6   | **Interaction should feel physical**       | Springs, not tweens. Elements should move like they have weight and inertia.               |
| 7   | **Never animate for decoration alone**     | If removing an animation doesn't degrade the experience, remove it.                        |
| 8   | **Premium does not mean complicated**      | The most luxurious things are usually simple. One CTA per viewport.                        |
| 9   | **Mobile is a first-class experience**     | Touch targets ≥ 44px. Parallax reduced. Typography reflows cleanly.                        |
| 10  | **Accessibility must never be sacrificed** | Visual effects are enhancements. The experience without them must be complete.             |

### What AMNAYA Is Not

- Not a generic Indian real-estate portal (Magicbricks / Housing.com aesthetic)
- Not a SaaS dashboard
- Not a startup landing page with gradient blobs
- Not an overly animated digital agency site
- Not gold-everything luxury kitsch

### References for Tone

Architectural studio sites, luxury hospitality brands, high-end property development firms. The photography speaks. The typography breathes. The palette is restrained.

---

## 2. Color System

### Source of Truth

```
src/app/globals.css  →  :root {}        (light)
                    →  .dark {}         (dark)
                    →  @theme inline {} (Tailwind utilities)
```

### Palette Architecture

| Role                 | Light value            | Dark value | Usage             |
| -------------------- | ---------------------- | ---------- | ----------------- |
| `--background`       | `#fbfaf7` (warm cream) | `#121210`  | Page background   |
| `--foreground`       | `#191917`              | `#ecece6`  | Primary text      |
| `--card`             | `#ffffff`              | `#1a1a17`  | Card surfaces     |
| `--muted`            | `#f1efe9`              | `#232320`  | Muted backgrounds |
| `--muted-foreground` | `#6b6860`              | `#a3a096`  | Secondary text    |
| `--border`           | `#e4e1d8`              | `#2e2d28`  | Dividers, borders |
| `--ring`             | `#3d8b66`              | `#5ea883`  | Focus indicators  |

### Brand Palettes

#### Primary — Deep Residential Emerald

```css
--primary-500: #3d8b66 /* Brand mid */ --primary-600: #2c6f52 /* Default CTA */
  --primary-700: #255a44 /* Hover */;
```

Voice: trust, nature, permanence, longevity. The architectural green of Khajaguda's landscape.

#### Accent — Burnished Bronze

```css
--accent-400: #b9926c /* Light highlight */ --accent-500: #a3744a /* Default CTA (signature) */
  --accent-600: #865c39 /* Hover */;
```

Voice: craftsmanship, warmth, architectural detail. Bronze, not gold. Sparing use only — one accent moment per composition.

#### Neutral — Warm Greys

```css
--neutral-300: #c9c3b5 --neutral-500: #8b8476 /* Body text muted */ --neutral-900: #2c2a26
  /* Near-black for inverted text */;
```

Always warm (yellowish), never blue-grey. Matches stone and wood palettes.

#### Navy (Dusk) — Cinematic Dark

```css
--navy-700: #0f354a --navy-800: #0a283a --navy-900: #071d2b;
```

For hero sections, footer, gallery overlays using a cooler night-lit mood.

#### Sky & Lake — Daylight

```css
--sky-300: #a8c4d9 --sky-500: #648bac;
```

Used sparingly for water/light moments in imagery-adjacent accents.

### Semantic Colours

```css
--success-500: #2e9d5b --warning-500: #f59e0b --error-500: #ef4444 --info-500: #3b82f6;
```

Each with 50/100/200/500/600/800/900 steps for soft background, border, text use.

### Overlays & Glass

```css
--overlay-solid: rgb(13 33 26 / 0.6) /* standard image scrim */ --overlay-ink: linear-gradient(...)
  /* editorial text scrim  */ --overlay-hero: linear-gradient(...) /* hero full-bleed scrim */
  --glass-bg: rgb(255 255 255 / 0.72) /* frosted nav surface   */ --glass-blur: 16px;
```

### Gradients

```css
bg-grad-hero       /* dark cinematic hero */
bg-grad-primary    /* emerald brand gradient */
bg-grad-gold       /* warm bronze gradient */
bg-grad-dusk       /* navy night gradient */
bg-grad-lake       /* sky/water gradient */
text-gradient-gold  /* bronze display type */
```

### Rules

- **One accent moment per viewport.** Accent bronze = signature CTA.
- **Default CTA = emerald primary**, not bronze.
- `shadow-cinematic` is reserved for hero/gallery only.
- Inverted sections always use `text-neutral-50` variants. Never `text-background` on dark.

---

## 3. Typography

### Font Families

| Variable       | Family                               | Role                                                 |
| -------------- | ------------------------------------ | ---------------------------------------------------- |
| `--font-serif` | Cormorant Garamond (400–700, italic) | Display, h1–h3, numerals, quotes, captions           |
| `--font-sans`  | Geist                                | Body, UI, navigation, labels, everything interactive |
| `--font-mono`  | Geist Mono                           | Code only                                            |

### Fluid Type Scale

All display sizes are fluid via `clamp()` — they scale continuously between 320px and 3840px viewport width.

| Token             | CSS variable                                | Range         |
| ----------------- | ------------------------------------------- | ------------- |
| `text-display-1`  | `clamp(2.125rem, 1.5rem + 3.5vw, 4.5rem)`   | 34px → 72px   |
| `text-display-2`  | `clamp(1.875rem, 1.25rem + 2.75vw, 3.5rem)` | 30px → 56px   |
| `text-display-3`  | `clamp(1.625rem, 1.125rem + 2vw, 2.75rem)`  | 26px → 44px   |
| `text-display-4`  | `clamp(1.375rem, 1.1rem + 1.25vw, 2.25rem)` | 22px → 36px   |
| `text-lead`       | `1.125rem`                                  | 18px          |
| `text-body-large` | `1.0625rem`                                 | 17px          |
| `text-body`       | `1rem`                                      | 16px          |
| `text-body-small` | `0.9375rem`                                 | 15px          |
| `text-caption`    | `0.8125rem`                                 | 13px          |
| `text-label`      | `0.8125rem`                                 | 13px          |
| `text-nav`        | `0.875rem`                                  | 14px          |
| `text-button`     | `0.875rem`                                  | 14px          |
| `text-eyebrow`    | `0.75rem`                                   | 12px          |
| `text-overline`   | `0.6875rem`                                 | 11px          |
| `text-numeric`    | `clamp(2.5rem, 1.75rem + 2.5vw, 3.5rem)`    | Tabular stats |
| `text-quote`      | `1.5rem`                                    | Pull quotes   |

### Letter Spacing

| Token               | Value     | Use              |
| ------------------- | --------- | ---------------- |
| `tracking-display`  | `-0.02em` | Display headings |
| `tracking-eyebrow`  | `0.18em`  | Eyebrow labels   |
| `tracking-overline` | `0.22em`  | Overline text    |
| `tracking-caps`     | `0.12em`  | Uppercase body   |
| `tracking-nav`      | `0.08em`  | Navigation links |
| `tracking-button`   | `0.04em`  | Button labels    |
| `tracking-label`    | `0.06em`  | Form labels      |

### Typography Rules

- `display-1` reserved for the hero only. Maximum one per page.
- Numerals/statistics: `font-serif` + `numeric` utility (tabular figures).
- Labels/eyebrows: always `text-eyebrow` or `text-overline` + `uppercase` + correct tracking.
- Copy is editorial and confident — never salesy. No exclamation marks.

---

## 4. Spacing & Layout

### Semantic Scale

| Token         | rem  | px  | Use                      |
| ------------- | ---- | --- | ------------------------ |
| `--space-2xs` | 0.25 | 4   | Icon gap, tight padding  |
| `--space-xs`  | 0.5  | 8   | Inline spacing           |
| `--space-sm`  | 0.75 | 12  | Component padding        |
| `--space-md`  | 1    | 16  | Default padding          |
| `--space-lg`  | 1.5  | 24  | Section internal         |
| `--space-xl`  | 2    | 32  | Large component gap      |
| `--space-2xl` | 2.5  | 40  | Section gap              |
| `--space-3xl` | 3    | 48  | Section internal spacing |
| `--space-4xl` | 4    | 64  | Generous padding         |
| `--space-5xl` | 5    | 80  | Section-level spacer     |

### Containers

| Token           | Value           | Use                            |
| --------------- | --------------- | ------------------------------ |
| `max-w-gallery` | 100rem / 1600px | Gallery & full-bleed moments   |
| `max-w-hero`    | 96rem / 1536px  | Cinematic hero / full sections |
| `max-w-wide`    | 88rem / 1408px  | Wide content                   |
| `max-w-page`    | 80rem / 1280px  | Default content width          |
| `max-w-narrow`  | 72rem / 1152px  | Narrow content                 |
| `max-w-tight`   | 60rem / 960px   | Form / reading focus           |
| `max-w-prose`   | 42rem / 672px   | Editorial measure              |

### Section Rhythm

| Token           | Value        | Use                     |
| --------------- | ------------ | ----------------------- |
| `py-section-sm` | 4rem / 64px  | Tight sections          |
| `py-section`    | 6rem / 96px  | Default section padding |
| `py-section-lg` | 8rem / 128px | Hero adjacent sections  |

### Breakpoints

| Name  | px     | Use                              |
| ----- | ------ | -------------------------------- |
| `sm`  | 640px  | Mobile → small tablet transition |
| `md`  | 768px  | Tablet portrait                  |
| `lg`  | 1024px | Tablet landscape / laptop        |
| `xl`  | 1280px | Desktop                          |
| `2xl` | 1536px | Wide desktop                     |
| `3xl` | 1600px | TV / large display               |

---

## 5. Borders & Radius

### Radius Scale

| Token             | Value    | Use                       |
| ----------------- | -------- | ------------------------- |
| `rounded-none`    | 0        | Architectural sharp edges |
| `rounded-xs`      | 0.375rem | Small controls            |
| `rounded-sm`      | 0.5rem   | Badges, chips             |
| `rounded-md`      | 0.625rem | Default controls          |
| `rounded-lg`      | 0.75rem  | Cards, panels             |
| `rounded-xl`      | 1rem     | Large cards               |
| `rounded-input`   | 0.625rem | Form inputs               |
| `rounded-card`    | 1rem     | Content cards             |
| `rounded-card-lg` | 1.375rem | Feature cards             |
| `rounded-dialog`  | 1.25rem  | Modals, drawers           |
| `rounded-full`    | 9999px   | Pills, avatars            |

### Borders

- Default border: `border-border` (light: `#e4e1d8`, dark: `#2e2d28`)
- Subtle: `border-border-subtle`
- White/glass: `border-white/10` on dark surfaces
- Width: always 1px. Never 2px decorative borders.

---

## 6. Elevation & Shadow

Luxury design relies more on typography, whitespace, and imagery than heavy shadows. Use shadows sparingly.

| Token                 | Use                              |
| --------------------- | -------------------------------- |
| `shadow-xs`           | Hairline depth                   |
| `shadow-sm`           | Subtle lift for small controls   |
| `shadow-card`         | Default resting card surface     |
| `shadow-elevated`     | Lifted interaction state         |
| `shadow-soft`         | Subtle surface definition        |
| `shadow-subtle`       | Near-invisible depth             |
| `shadow-modal`        | Dialog / drawer surfaces         |
| `shadow-cinematic`    | **Hero/gallery moments only**    |
| `shadow-glow-primary` | Primary colour focus/interaction |
| `shadow-glow-gold`    | Accent bronze focus/interaction  |

### Z-Index Ladder

```
hide(-1) → base(0) → raised(10) → dropdown(20) → sticky(30)
→ overlay(40) → modal(50) → popover(60) → tooltip(70) → toast(80)
→ skipLink(100) → cursor(9999)
```

---

## 7. Component Library

Import from `@components/ui` (barrel in `src/components/ui/index.ts`).

### Actions

| Component    | Props                                   | Notes                                  |
| ------------ | --------------------------------------- | -------------------------------------- |
| `Button`     | `variant`, `size`, `loading`, `asChild` | 7 variants × 6 sizes. Utility UI only. |
| `IconButton` | `variant`, `size`, `label`              | Icon-only with accessible label        |

### Typography

| Component        | Notes                                 |
| ---------------- | ------------------------------------- |
| `Eyebrow`        | Tracked caps kicker above headings    |
| `DisplayHeading` | Fluid serif heading, levels 1–4       |
| `SectionTitle`   | eyebrow + heading + description block |

### Layout

| Component           | Notes                                                                |
| ------------------- | -------------------------------------------------------------------- |
| `Container`         | `size` prop: `page`/`wide`/`narrow`/`tight`/`prose`/`hero`/`gallery` |
| `Grid` / `GridItem` | 12-col responsive grid system                                        |
| `Stack`             | Flex row/column with token gaps                                      |

### Content

| Component                  | Notes                                 |
| -------------------------- | ------------------------------------- |
| `Card` / `CardInteractive` | Standard card surfaces                |
| `ImageFrame`               | Full-bleed image with scrim treatment |
| `ImageCard`                | Image + text card with ink scrim      |
| `Stat`                     | Statistic: numeric + label            |
| `Divider`                  | Horizontal rule                       |

### Feedback & States

| Component                   | Notes                                     |
| --------------------------- | ----------------------------------------- |
| `Alert`                     | 4 tones: info / success / warning / error |
| `LoadingState` / `Skeleton` | Loading patterns                          |
| `EmptyState` / `ErrorState` | Empty/error patterns                      |
| `Toast`                     | Via `ui.toast()` store — do not hand-roll |
| `Progress`                  | Progress bar                              |
| `Avatar`                    | User avatar with fallback                 |

### Forms

| Component          | Notes                                 |
| ------------------ | ------------------------------------- |
| `Input`            | Standard text input                   |
| `Textarea`         | Multi-line                            |
| `Select`           | Radix-based dropdown                  |
| `Checkbox`         | Accessible checkbox                   |
| `RadioGroup`       | Accessible radio                      |
| `Switch`           | Toggle                                |
| `Field`            | label + control + error message       |
| `PhoneInput`       | Purpose-built phone with country code |
| `DateInput`        | Date picker                           |
| `BudgetSelect`     | Budget range selector                 |
| `PreferenceSelect` | Unit preference selector              |

### Overlays

| Component      | Notes                      |
| -------------- | -------------------------- |
| `Dialog`       | Modal dialog (Radix)       |
| `Drawer`       | Bottom/side drawer (Radix) |
| `Tooltip`      | Hover tooltip              |
| `Popover`      | Click popover              |
| `DropdownMenu` | Context menu               |
| `ScrollArea`   | Custom scrollable region   |

### Navigation

| Component     | Notes                       |
| ------------- | --------------------------- |
| `NavLink`     | Animated underline link     |
| `Tabs`        | Radix tabs                  |
| `Accordion`   | Radix accordion             |
| `Breadcrumbs` | Accessible breadcrumb trail |
| `Pagination`  | Page navigator              |

---

## 8. AMNAYA Components

Import from `@components/amnaya` — these are **marketing-page only**.

### `HorizontalLine`

Animated thin rule that draws itself left-to-right via clip-path reveal.

```tsx
<HorizontalLine />                          // standard
<HorizontalLine direction="rtl" />          // right-to-left
<HorizontalLine inverted thin delay={0.2} />
```

Props: `direction` (`ltr`|`rtl`), `duration`, `delay`, `inverted`, `thin`, `margin`.

### `ScrollIndicator`

Animated scroll cue — pill with bouncing dot. Used at bottom of hero sections.

```tsx
<ScrollIndicator />
<ScrollIndicator label="Discover" inverted />
```

Props: `label`, `inverted`, `cycleDuration`.

### `ArchitecturalGrid`

Subtle structural grid overlay. Parent must be `position: relative`.

```tsx
<section className="relative">
  <ArchitecturalGrid columns={6} surface="dark" />
  ...
</section>
```

Props: `columns` (4|6|8|12), `variant` (`lines`|`cross`|`dots`), `surface` (`light`|`dark`), `opacity`.

### `MagneticButton`

Primary luxury CTA that gently follows the cursor on desktop.

```tsx
<MagneticButton>Explore Amnaya</MagneticButton>
<MagneticButton radius={40}>Schedule a Visit</MagneticButton>
```

Props: `radius`, `stiffness`, `damping`, all standard button props.
Rules: desktop only, disabled on touch + reduced motion, max 1–2 per viewport.

### `LuxuryButton`

Premium pill-shaped marketing CTA with hover lift.

```tsx
<LuxuryButton>View Residences</LuxuryButton>
<LuxuryButton variant="ghost">Learn More</LuxuryButton>
<LuxuryButton asChild variant="accent"><Link href="/contact">Book a Visit</Link></LuxuryButton>
```

Variants: `accent` (bronze), `primary` (emerald), `ghost` (white border), `dark`.
Sizes: `sm`, `md`, `lg`.
Props: `variant`, `size`, `arrow`, `asChild`.

### `SectionHeading`

Animated editorial section header with optional eyebrow, line, word-reveal title, description.

```tsx
<SectionHeading
  eyebrow="Architecture"
  title="Where nature shapes the residence"
  description="..."
  line
/>
<SectionHeading
  eyebrow="Location"
  title="Khajaguda — the city's most coveted address"
  align="center"
  inverted
/>
```

Props: `eyebrow`, `title`, `description`, `align`, `inverted`, `line`, `as`, `animate`, `descriptionWidth`.

### `CursorFollower`

Custom dot + ring cursor for desktop. Mount once at the root.

```tsx
// In RootProvider — already mounted
<CursorFollower />
```

Add `data-cursor` attributes to change state:

```html
<a data-cursor="link">...</a>
<figure data-cursor="image">...</figure>
<div data-cursor="drag">...</div>
```

Disabled on: touch devices, `prefers-reduced-motion`.

---

## 9. Motion System

### Architecture

| Layer                   | Library                     | Use                         |
| ----------------------- | --------------------------- | --------------------------- |
| Scroll reveals          | Framer Motion `whileInView` | Default entrance animations |
| Text reveals            | Framer Motion + split-text  | Word/letter/line entrances  |
| Scroll-pinned sequences | GSAP + ScrollTrigger (lazy) | Cinematic pinned sections   |
| Smooth scroll           | Lenis                       | Inertial page scrolling     |
| Spring interactions     | Framer Motion springs       | Magnetic, tilt, hover       |

### Duration Tokens

| Token              | ms     | Use                     |
| ------------------ | ------ | ----------------------- |
| `duration-instant` | 50ms   | State flashes           |
| `duration-fast`    | 150ms  | Micro-interactions      |
| `duration-base`    | 250ms  | Standard UI transitions |
| `duration-slow`    | 400ms  | Reveals, slide-ins      |
| `duration-slower`  | 600ms  | Major transitions       |
| `duration-slowest` | 900ms  | Cinematic entrances     |
| `duration-luxury`  | 1200ms | Hero/flagship moments   |

### Easing Tokens

| Token                    | Bezier             | Use                       |
| ------------------------ | ------------------ | ------------------------- |
| `ease-standard`          | (0.4, 0, 0.2, 1)   | General transitions       |
| `ease-decelerate`        | (0, 0, 0.2, 1)     | Entrances (come to rest)  |
| `ease-accelerate`        | (0.4, 0, 1, 1)     | Exits (leave quickly)     |
| `ease-emphasize`         | (0.2, 0.8, 0.2, 1) | Soft overshoot / emphasis |
| `ease-out-expo`          | (0.16, 1, 0.3, 1)  | Luxury hero reveals       |
| `ease-in-out-emphasized` | (0.83, 0, 0.17, 1) | Modal/drawer transitions  |

### Motion Presets

Named choreographies for consistent feel:

| Preset      | Duration | Use                            |
| ----------- | -------- | ------------------------------ |
| `luxury`    | 1.1s     | Hero/flagship moments          |
| `elegant`   | 0.9s     | Section-level reveals          |
| `minimal`   | 0.6s     | Quiet, high-frequency surfaces |
| `corporate` | 0.5s     | Functional UI                  |
| `fast`      | 0.3s     | Micro-interactions             |
| `premium`   | 0.8s     | Rich, tactile surfaces         |
| `cinematic` | 1.4s     | Long-form filmic reveals       |
| `editorial` | 1.0s     | Gallery, long-copy sections    |

### Framer Motion Components

Import from `@components/motion`:

```tsx
<Fade>...</Fade>                          // opacity reveal
<SlideIn direction="up" distance={32}>...</SlideIn>
<ScaleIn from={0.96}>...</ScaleIn>
<TextReveal text="..." mode="words" />    // word reveal
<WordReveal text="..." />
<LetterReveal text="..." />
<LineReveal text="..." />
<ImageReveal src="..." alt="..." aspect="landscape" />
<ParallaxImage src="..." alt="..." />
<Parallax strength="default">...</Parallax>
<HoverReveal preset="lift">...</HoverReveal>
<ImmersiveHero heroSrc="..." heroAlt="..." />
```

### GSAP (Lazy)

```tsx
import { useGsap } from "@hooks/use-gsap";

useGsap((gsap) => {
  gsap.to(el, {
    yPercent: -10,
    scrollTrigger: { scrub: true },
  });
}, []);
```

Only use GSAP for scroll-pinned cinematic sequences that Framer Motion cannot express cleanly.

### Lenis Smooth Scroll

Mounted automatically via `SmoothScrollProvider` in `RootProvider`. No manual setup needed. Disabled under reduced motion.

### Reduced Motion

All motion respects `prefers-reduced-motion: reduce`:

- Framer Motion: `useReducedMotionPreference()` hook disables animations
- CSS: `globals.css` neutralises `animation-duration` and `transition-duration`
- Parallax: disabled entirely
- CursorFollower: disabled entirely
- Lenis: disabled entirely

---

## 10. Responsive Design

### Mobile First

Build mobile layouts first. Expand up with `sm:`, `md:`, `lg:`, `xl:` prefixes.

### Touch Target

All interactive elements: minimum 44×44px on mobile.

### Typography Response

Display type scales automatically via `clamp()` — no manual responsive font classes needed for display headings. Body text and labels use fixed sizes.

### Motion Response

- Parallax travel: halved on mobile via `mobileFactor={0.5}`
- Magnetic buttons: disabled on touch (`pointer: coarse`)
- CursorFollower: disabled on touch
- Reduced motion: all major animations disabled

### Grid Response

The 12-column `Grid` component adapts:

```tsx
<Grid cols={{ base: 1, sm: 2, lg: 3, xl: 4 }}>
```

### Navigation Response

- Desktop (`lg+`): `SiteNavigation` horizontal nav
- Mobile (`< lg`): `MobileNavigation` drawer

---

## 11. Accessibility

### Keyboard Navigation

- All interactive elements: full keyboard focus ring (`focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring`)
- Drawers/dialogs: Radix focus trap
- Navigation: arrow key support via `useKeyboardNav`
- Skip link: `<SkipLink />` is the first focusable element

### Screen Readers

- `aria-label` on all icon-only controls
- `aria-hidden` on decorative elements (grid lines, parallax, architectural corners)
- Text reveal: `aria-label` on container, `aria-hidden` on animated fragments
- `<LoadingState>` includes `role="status"` and live region

### Reduced Motion

```tsx
const reduced = useReducedMotionPreference();
// Returns true when OS requests reduced motion
```

When `true`:

- Remove large movement (y travel, scale, clip-path)
- Remove parallax
- Remove cursor effects
- Remove scroll animations
- Keep simple opacity transitions only

### Colour Contrast

- Body text: `foreground` on `background` → WCAG AA (4.5:1 minimum)
- Muted text: `muted-foreground` on `card` → WCAG AA
- Inverted: `neutral-50` on dark surfaces → tested against navy/dusk backgrounds

---

## 12. Performance

### Server vs. Client Components

- Prefer Server Components for content, layouts, SEO pages
- Mark `"use client"` only for motion, state, browser APIs
- All motion components are client components (isolated)

### Code Splitting

- GSAP + ScrollTrigger: lazy-loaded on first use via `loadGsap()`
- Never `import "gsap"` statically
- Three.js / React Three Fiber: future phases — do not load now

### Animation Performance

- Only animate `transform` and `opacity` — GPU composited
- `will-change-transform` only on active animations, removed after
- Never animate `width`, `height`, `top`, `left`, `padding`, `margin`
- Use `IntersectionObserver` (via Framer Motion `whileInView`) for reveals
- Clean up all event listeners on unmount
- `requestAnimationFrame` via Framer Motion / GSAP — never raw `setInterval`

### Images

- All images via Next.js `<Image>` — automatic lazy loading, WebP conversion, `sizes` hints
- Provide accurate `sizes` prop for above-the-fold images
- Hero images: `priority` prop to eager-load
- `object-fit: cover` always — never stretch or distort

---

## 13. Do / Don't Examples

### Colors

```tsx
// ✅ DO — use token utilities
<div className="bg-background text-foreground" />
<button className="bg-accent-500 text-accent-950" />

// ❌ DON'T — hardcode hex
<div style={{ backgroundColor: "#a3744a" }} />
```

### Typography

```tsx
// ✅ DO — use the scale
<h2 className="font-serif text-display-2 tracking-display">
<p className="text-body-large text-muted-foreground leading-relaxed">
<span className="text-eyebrow tracking-eyebrow uppercase">

// ❌ DON'T — invent sizes
<h2 className="text-3xl font-bold" />
<p className="text-[17px]" />
```

### Buttons

```tsx
// ✅ DO — use LuxuryButton for marketing CTAs
<LuxuryButton variant="accent">Book a Visit</LuxuryButton>
<LuxuryButton variant="ghost" asChild><Link href="...">Explore</Link></LuxuryButton>

// ✅ DO — use Button for utility UI
<Button variant="primary" size="md">Save Changes</Button>

// ❌ DON'T — hand-roll CTA styles
<button className="bg-[#a3744a] rounded-full px-8 py-4 text-white">
```

### Motion

```tsx
// ✅ DO — use motion primitives
<Fade>
  <p>This text fades in when scrolled into view.</p>
</Fade>

<SectionHeading
  eyebrow="Residences"
  title="420 homes across 5.3 acres"
  line
/>

// ❌ DON'T — animate layout properties
motion.div animate={{ width: "100%", height: "200px" }}

// ❌ DON'T — animate everything
// Reserve motion for meaningful moments
```

### Inverted Sections

```tsx
// ✅ DO — use neutral-50 variants
<section className="bg-grad-dusk">
  <h2 className="text-neutral-50">...</h2>
  <p className="text-neutral-50/70">...</p>
</section>

// ❌ DON'T — use foreground/background on dark
<h2 className="text-foreground"> // resolves to dark in dark mode!
```

### Images

```tsx
// ✅ DO — always via Next.js Image with proper sizing
<Image
  src="/assets/amnaya/hero-render.jpg"
  alt="Amnaya exterior — Khajaguda lakeside view"
  fill
  sizes="(min-width: 1024px) 60vw, 100vw"
  className="object-cover"
  priority // hero only
/>

// ❌ DON'T — raw <img> or missing sizes/alt
<img src="/assets/..." />
```

---

_Last updated: Phase 6.2 — August 2026_
_Source of truth: `src/app/globals.css` (tokens), `src/constants/design-tokens.ts` (TS mirror)_
_Live reference: `/styleguide` (run `npm run dev`)_
