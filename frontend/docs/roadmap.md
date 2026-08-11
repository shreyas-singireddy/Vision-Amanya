# Roadmap

Status of the Phase 6 foundation and what comes next.

## Done (Phase 6.1 — foundation)

- Next.js 16 project configuration (typed routes, Turbopack, images,
  `next.config.ts`), TypeScript, ESLint + Prettier, Tailwind v4.
- **Types** (`src/types`) mirroring every backend DTO/envelope.
- **Config & constants**: site, navigation, auth, query defaults, endpoint
  map, typed route map, query keys, roles, design tokens.
- **Utilities**: `cn`, formatting, validation, pagination query serialization.
- **Lib**: env validation (client + server), logger, storage, token store,
  query client, SEO metadata builder, motion system (reduced-motion aware).
- **API client**: axios instance, envelope unwrapping, single-flight refresh,
  idempotent retries, normalized `ApiError` hierarchy.
- **Services**: auth, projects, properties, favourites, enquiries, assistant,
  plus the server-only BFF auth service.
- **Stores**: auth (in-memory tokens + persisted user), user, project,
  property (favourites/compare/view), favourite (optimistic toggle), enquiry,
  assistant, UI (theme/toasts/modals).
- **Hooks**: media query, debounce, local storage, toggle, click-outside,
  keyboard nav, focus trap, locked body, mounted.
- **Providers**: Query (+ devtools), Theme, Toast, Root (auth hydration +
  session-expiry handling).
- **Components**: Button, Input, Textarea, Label, Badge, Skeleton, Divider,
  Reveal/Stagger motion wrappers, Spinner, SkipLink, PagePlaceholder.
- **Feature foundations**: auth form schemas, project/property query hooks,
  favourite toggle hook, enquiry submission hook, assistant hook.
- **BFF route handlers**: `api/health`, `api/auth/{login,register,refresh,
logout,session}`.
- **Routing foundation**: route groups `(marketing)`, `(auth)`, `(protected)`,
  dynamic `properties/[slug]`, `error.tsx`, `global-error.tsx`, `not-found.tsx`,
  `loading.tsx`, `proxy.ts` (security headers), `sitemap.ts`, `robots.ts`,
  `manifest.ts`, root layout with theme bootstrap + skip link.
- `npm run lint`, `npm run typecheck` and `npm run build` all pass.

## Done (Phase 6.2 — visual identity & design system)

- **Design tokens** (`src/app/globals.css`, canonical):
  - Light/dark surfaces + text, interactive surfaces, primary emerald
    `#3d8b66`, accent gold `#c08e2e`, warm neutral 50–950, semantic
    success/warning/error/info ramps.
  - Overlays (`overlay-*`), glass (`glass`), gradients (`bg-grad-*`,
    `text-gradient-gold`), elevation (`shadow-xs`→`2xl` + semantic), radius
    scale + semantic, z-index ladder, containers (`max-w-page`…`max-w-prose`),
    section spacing, breakpoint `3xl`.
  - Motion tokens: durations `instant`→`luxury` (1200ms), six easings,
    `animate-pop-in / fade-in / fade-out / expand / collapse / drawer-*`.
  - Base layer: serif headings, selection, focus-visible, reduced-motion
    kill-switch; slim theme-aware scrollbars.
  - TS mirror kept in sync: `src/constants/design-tokens.ts`.
- **Typography**: Cormorant Garamond (display serif) via `next/font/google`
  in `layout.tsx`; semantic type scale (`text-display-1..4`, `text-eyebrow`,
  `text-overline`, `text-lead`, `text-caption`, `text-quote`).
- **Component library** (`src/components/ui/`, Radix-based, exported via
  barrel):
  - Actions: `Button` (7 variants × 6 sizes, `asChild`, `loading`).
  - Signal: `Badge` (soft/solid/outline × 7 tones).
  - Typography: `Eyebrow`, `DisplayHeading`, `SectionTitle`.
  - Content: `Card`, `CardInteractive`, `Stat`, `ImageFrame`, `Divider`,
    `Container`.
  - Forms: `Input`, `Textarea`, `Label`, `Field` (auto id/aria-invalid),
    `Select`, `Checkbox`, `RadioGroup`, `Switch`, `ToggleGroup`.
  - Feedback: `Spinner`, `Skeleton`, `Progress`, `Avatar`, `EmptyState`,
    `ErrorState`.
  - Overlays: `Dialog`, `Drawer` (4 edges), `Tooltip`, `Popover`,
    `DropdownMenu` (incl. danger items), `ScrollArea`, `Separator`.
  - Navigation: `NavLink` (gold underline), `Tabs`, `Accordion`,
    `Breadcrumbs`, `Pagination`.
  - Polished existing `Input`/`Textarea`/`Label`/`Divider` to the new tokens.
- **Live styleguide**: `(design)/styleguide` route (`/styleguide`, no-index)
  rendering every token + component live; theme toggle; excluded from public
  navigation.
- **Docs**: `docs/design-system.md`, `docs/brand-guidelines.md`,
  `docs/motion-guidelines.md`; README updated.
- `npm run lint`, `npm run typecheck` and `npm run build` all pass.

## Next (Phase 6.3+)

1. **Auth UI**: login/register/forgot/reset forms wired to the BFF handlers
   (`features/auth`), session probe on app start.
2. **Marketing pages**: replace `PagePlaceholder` stubs — homepage, project,
   properties index + detail (`[slug]`), gallery, contact. Apply the design
   system and motion choreography (hero reveals, parallax, transitions).
3. **Dashboard**: account overview, favourites list, enquiries history,
   settings.
4. **Data wiring**: property/project query hooks into pages, pagination,
   filtering, optimistic favourites.
5. **QA hardening**: e2e tests, error monitoring, performance budget,
   accessibility pass.
