<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Vision Amanya frontend — working rules

## Verification (always run after changes)

- `npm run lint` — ESLint, includes Prettier as a rule (fix with `npx eslint --fix`)
- `npm run typecheck` — `tsc --noEmit`
- `npm run build` — full production build (re-regenerates typed routes)
- After adding/removing routes, run `npx next typegen` before `typecheck` so
  the typed-routes `.d.ts` stays in sync.

## Conventions

- Typed routes are enabled. Import the route map from `@constants/routes` and
  never hardcode path strings.
- The backend envelope is unwrapped by `src/api/interceptors.ts` — services
  receive plain `data`, not `{ success, message, data }`.
- Refresh token lives in the `httpOnly` cookie via BFF route handlers
  (`src/app/api/auth/*`, helpers in `src/lib/server/cookies.ts`). Never store
  tokens in `localStorage`.
- Server-only modules import `server-only` (e.g. `@lib/server/*`,
  `src/services/bff-auth.service.ts`).
- Metadata is built with `buildMetadata` from `@lib/seo`.
- Alias is `@domain/*` for `src/types/*` — do NOT reintroduce `@types/*`.
- Design tokens are canonical in `src/app/globals.css` (`@theme inline`);
  quantitative mirrors live in `src/constants/design-tokens.ts` — keep in sync.
- **Use the design system**: import components from `@components/ui`, never
  scatter raw hex/durations/shadows in pages. Docs: `docs/design-system.md`,
  `docs/brand-guidelines.md`, `docs/motion-guidelines.md`. The live styleguide
  is `/styleguide` (`(design)` route group, no-index).
- **Inverted sections**: on dark surfaces (hero, ink) use `text-neutral-50`
  variants, never `text-background` (breaks in dark mode).
- **Motion**: consume the `animate-*` tokens and `@lib/motion` helpers — no
  bespoke keyframes in components.
- This phase is architecture + design system only: no business pages. Replace
  `PagePlaceholder` stubs in later phases.
