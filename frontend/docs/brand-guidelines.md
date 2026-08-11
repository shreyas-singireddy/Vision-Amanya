# Brand Guidelines — Vision Amnaya

Vision Amnaya is a luxury residential development. The brand must feel like
Apple, Porsche, Aman, Four Seasons or Sotheby's — **never** a generic
WordPress template. This document explains the palette rationale, the voice
and the explicit do / don't list.

## Personality

Premium · Luxury · Elegant · Timeless · Sophisticated · Professional ·
Trustworthy · Minimal · Architectural · High-end

The reference imagery is an inspiration for _feeling_, never a template to
copy. Every surface is a modern interpretation.

## Palette rationale

- **Emerald `#3d8b66`** — the deep green of the surrounding landscape,
  read as longevity, trust and quiet wealth. It is the primary voice and the
  colour of the primary button, focus rings and active states.
- **Burnished bronze-gold `#a3744a`** — evening light on stone and bronze
  fixtures. Used sparingly: the accent button, eyebrows, bronze-gradient
  numerals and selected states. Scarcity is what keeps it luxurious.
- **Warm neutrals** — stone, sand and parchment. The canvas. Warm greys
  (never blue-grey) keep interiors feeling physical and architectural.
- **Ink & dark sections** — near-black forest tones for hero sections and
  inverted moments, over which photography and bronze-gold glow.
- **Dusk navy** — a cool `#22303b`-family navy reserved for cinematic dark
  moments (hero overlay, gallery, footer). Prefer it over pure black so dark
  sections stay dimensional, not dead.

## The voice

Editorial, confident, restrained. Write like a place that doesn't need to
persuade.

- Short sentences. Precise nouns. No exclamation marks.
- Say what it is, let the reader imagine the rest.
- Use **serif display** for headings and numerals; **Geist** for body.
- Copy that feels like architecture: stone, light, water, silence, time.

## Do

- Do use `SectionTitle` (eyebrow + serif heading) to open every section.
- Do keep buttons few: one primary (or accent) action per view.
- Do use negative space generously — luxury is a function of restraint.
- Do use gold for a single moment of emphasis per composition.
- Do apply `text-gradient-gold` to numerals and select display words.
- Do match photography with `ImageFrame` so the vignette reads consistently.

## Don't

- Don't use gradients more than one per section; the hero gradient is enough.
- Don't use `text-background` on dark/inverted surfaces (breaks in dark mode) —
  use `text-neutral-50` variants.
- Don't stack more than two display sizes in one composition.
- Don't use emojis, comic-styled borders, or rounded "friendly" shapes beyond
  the token radius scale.
- Don't write marketing copy like "Luxury Redefined!!!". Write:
  "A considered residence, composed around light and water."
- Don't use the accent button for every action — it is the signature, not the
  default. Default is primary emerald.
- Don't introduce new shadows, durations or hex values inline. Add a token.

## Accessible contrast

Light theme body text (foreground on background) and muted text are AA-safe.
Inverted sections use `text-neutral-50` based tokens. Interactive controls
have an emerald focus ring (`focus-visible:ring-primary-500/15`) plus a
2px outline fallback in `globals.css`.
