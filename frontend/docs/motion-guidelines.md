# Motion Guidelines

Motion at Amanya is quiet and expensive. This phase ships the *tokens* and
philosophy; Framer Motion choreography (hero reveals, parallax, page
transitions) is implemented in the motion phase on top of these foundations.

## Principles

1. **Slow is luxury.** Entrances use decelerating curves and generous
   durations. Nothing snaps, nothing bounces.
2. **One idea per motion.** A card lifts, a heading fades up — not both at
   once. Reserve layering for hero moments.
3. **Motion explains state.** Menus pop in, drawers slide from their edge,
   accordions expand. Transitions always match the metaphor.
4. **Reduced motion is respected.** `globals.css` neutralises CSS
   transitions/animations under `prefers-reduced-motion: reduce`, and the
   Framer helpers honour it via `src/lib/motion/reduced-motion.ts`.

## Durations (`durations` in `design-tokens.ts` / `--duration-*` in CSS)

| Token | ms | Use |
| --- | --- | --- |
| `instant` | 50 | Micro-feedback, toggles |
| `fast` | 150 | Hover, focus, small state changes |
| `base` | 250 | Menus, overlays, list transitions |
| `slow` | 400 | Card hovers, section reveals |
| `slower` | 600 | Editorial reveals, staggered lists |
| `slowest` | 900 | Page-level transitions |
| `luxury` | 1200 | Hero reveals, flagship moments |

## Easings (`easings` / `--ease-*`)

| Token | Curve | Use |
| --- | --- | --- |
| `standard` | (0.4, 0, 0.2, 1) | Default interactive |
| `decelerate` | (0, 0, 0.2, 1) | Entrances — come to rest naturally |
| `accelerate` | (0.4, 0, 1, 1) | Exits — leave quickly |
| `emphasize` | (0.2, 0.8, 0.2, 1) | Soft overshoot for emphasis |
| `outExpo` | (0.16, 1, 0.3, 1) | Luxury ease-out — hero reveals, long travel |
| `inOutEmphasized` | (0.83, 0, 0.17, 1) | Modals and drawers |

Springs (`springs`): `soft` / `gentle` / `snappy`. Prefer the gentle preset
for anything that should feel heavy and deliberate.

## CSS motion tokens (already in use)

- `animate-pop-in` — menus, popovers, dialogs, tooltips (Radix content).
- `animate-fade-in` / `animate-fade-out` — overlays and scrims.
- `animate-expand` / `animate-collapse` — accordion height (Radix measures
  `--radix-accordion-content-height`).
- `animate-drawer-{left,right,top,bottom}-{in,out}` — drawer slide motion,
  driven by Radix `data-state`.

## Framer Motion helpers (`@lib/motion`)

- `transitions.ts` — `transitionFast/Base/Slow/Page/Modal/Exit` + `springs`,
  built from the token durations/easings.
- `variants.ts` — `fadeUpVariant`, `scaleInVariant`, `slideInVariant`,
  `staggerContainer`, `exitVariants`.
- Components `Reveal` / `Stagger` wrap these for content blocks.

## Interaction choreography (implemented in this phase)

- `Button` / `CardInteractive` — hover lift with `ease-out-expo` over
  `duration-slow`; press scale `0.985`.
- `NavLink` — gold underline scales in on hover/active (`ease-out-expo`).
- Accordion chevron rotates with the same curve.
- Drawer/dialog/menu entrances use the `animate-*` tokens above.

## Do / Don't

- Do pair `duration-slow` + `ease-out-expo` for hover lifts.
- Don't animate layout properties beyond transform/opacity.
- Don't add new keyframes to components — extend the token system.
- Don't exceed `luxury` (1200ms) for any single transition.
