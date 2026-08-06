"use client";

/**
 * Design System — the living styleguide for Vision Amanya.
 *
 * Every token and component is rendered live so changes in `globals.css` are
 * reflected immediately. This page is architecture-only: no business logic,
 * no forms with meaning — purely a catalogue of the visual language.
 */

import { useState } from "react";
import { ChevronDown, Settings, User, X } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Avatar,
  Badge,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardInteractive,
  CardTitle,
  Checkbox,
  Container,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Divider,
  DisplayHeading,
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  EmptyState,
  ErrorState,
  Eyebrow,
  Field,
  ImageFrame,
  Input,
  Label,
  NavLink,
  Pagination,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Progress,
  RadioGroup,
  RadioGroupItem,
  ScrollArea,
  SectionTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Spinner,
  Stat,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  ToggleGroup,
  ToggleGroupItem,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@components/ui";
import { ui, useUIStore } from "@store/ui.store";
import { routes } from "@constants/routes";
import { cn } from "@utils/cn";

const DEMO_IMAGE =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1a3b30"/><stop offset="0.55" stop-color="#3d8b66"/><stop offset="1" stop-color="#c08e2e"/></linearGradient></defs><rect width="1600" height="900" fill="url(#g)"/><circle cx="1200" cy="190" r="170" fill="#ffffff" opacity="0.08"/><circle cx="380" cy="760" r="220" fill="#0d211a" opacity="0.35"/><rect x="0" y="740" width="1600" height="160" fill="#000000" opacity="0.28"/></svg>`
  );

const brandRamps = ["primary", "accent", "neutral"] as const;

function Section({
  id,
  label,
  title,
  description,
  children,
}: {
  id: string;
  label: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 border-b border-border py-16 sm:py-20">
      <Container size="page">
        <div className="mb-10 max-w-2xl">
          <Eyebrow>{label}</Eyebrow>
          <h2 className="mt-3 font-serif text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            {title}
          </h2>
          {description ? (
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {children}
      </Container>
    </section>
  );
}

function SubLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-xs font-medium uppercase tracking-eyebrow text-muted-foreground">
      {children}
    </p>
  );
}

function SwatchGrid({ ramp }: { ramp: (typeof brandRamps)[number] }) {
  const shades = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"];
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-11">
      {shades.map((shade) => (
        <div key={shade} className="overflow-hidden rounded-lg border border-border">
          <div className={cn("h-14 w-full", `bg-${ramp}-${shade}`)} />
          <div className="px-2 py-1.5 text-center text-[11px] text-muted-foreground">{shade}</div>
        </div>
      ))}
    </div>
  );
}

export default function StyleguidePage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [checked, setChecked] = useState(false);
  const [radio, setRadio] = useState("one");
  const [switched, setSwitched] = useState(true);
  const [tabs, setTabs] = useState("overview");
  const setTheme = useUIStore((state) => state.setTheme);

  return (
    <>
      <header className="relative overflow-hidden bg-grad-hero">
        <div className="absolute inset-0 bg-grad-hero-overlay" />
        <Container size="page" className="relative py-24 sm:py-32">
          <Badge
            tone="accent"
            variant="outline"
            className="border-accent-500/40 bg-transparent text-accent-200"
          >
            Vision Amanya · Phase 6
          </Badge>
          <h1 className="mt-6 max-w-3xl font-serif text-5xl font-medium leading-[1.05] tracking-tight text-neutral-50 sm:text-6xl lg:text-7xl">
            The design language,
            <br />
            <span className="text-gradient-gold">considered.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-neutral-50/70">
            Tokens, typography and components built to feel like the places that never try to feel
            like anything. Everything below is rendered live from the design system.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => setTheme("light")}>
              Light
            </Button>
            <Button variant="secondary" onClick={() => setTheme("dark")}>
              Dark
            </Button>
            <Button variant="secondary" onClick={() => setTheme("system")}>
              System
            </Button>
          </div>
        </Container>
      </header>

      <Section
        id="typography"
        label="Typography"
        title="One serif voice, one sans."
        description="Cormorant Garamond carries the editorial voice; Geist stays quietly in service."
      >
        <div className="space-y-10">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <SubLabel>Display · Cormorant Garamond</SubLabel>
              <DisplayHeading level={1}>A quieter luxury</DisplayHeading>
              <DisplayHeading level={2}>Found in the details</DisplayHeading>
              <DisplayHeading level={3}>A residence, composed</DisplayHeading>
              <DisplayHeading level={4}>Private, by design</DisplayHeading>
            </div>
            <div>
              <SubLabel>Body · Geist</SubLabel>
              <p className="max-w-md text-lg leading-relaxed text-foreground">
                Amanya unfolds slowly — a considered landscape of light, stone and shadow where each
                day is an invitation to slow down.
              </p>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
                Quiet text is the default. Muted paragraphs describe, never persuade, and always
                leave room for the architecture to speak.
              </p>
              <p className="mt-4 font-serif text-xl italic text-foreground">
                “Live the way water moves — without hurry.”
              </p>
            </div>
          </div>

          <div>
            <SubLabel>Type scale</SubLabel>
            <div className="divide-y divide-border rounded-lg border border-border">
              {[
                ["display-1", "text-display-1", "Display One"],
                ["display-2", "text-display-2", "Display Two"],
                ["display-3", "text-display-3", "Display Three"],
                ["display-4", "text-display-4", "Display Four"],
                ["lead", "text-lead", "Lead paragraph"],
                ["base", "text-base", "Body text"],
                ["caption", "text-caption", "Caption & meta"],
                ["eyebrow", "text-eyebrow uppercase tracking-eyebrow", "EYEBROW"],
              ].map(([token, cls, sample]) => (
                <div
                  key={token}
                  className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-baseline sm:justify-between"
                >
                  <code className="text-xs text-muted-foreground">{token}</code>
                  <span className={cn("font-sans", cls as string)}>{sample}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section
        id="color"
        label="Colour"
        title="Emerald held by gold."
        description="Deep residential emerald is the primary voice; burnished gold is the accent — a palette borrowed from stone, foliage and evening light."
      >
        <div className="space-y-8">
          {brandRamps.map((ramp) => (
            <div key={ramp}>
              <SubLabel>{ramp}</SubLabel>
              <SwatchGrid ramp={ramp} />
            </div>
          ))}

          <div>
            <SubLabel>Semantic</SubLabel>
            <div className="grid gap-2 sm:grid-cols-4">
              {(["success", "warning", "error", "info"] as const).map((tone) => (
                <div key={tone} className="overflow-hidden rounded-lg border border-border">
                  <div className={cn("h-14 w-full", `bg-${tone}-500`)} />
                  <div className="px-2 py-1.5 text-center text-[11px] text-muted-foreground">
                    {tone}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <SubLabel>Gradients</SubLabel>
              <div className="space-y-3">
                <div className="h-16 w-full rounded-lg bg-grad-hero border border-border" />
                <div className="h-16 w-full rounded-lg bg-grad-gold border border-border" />
                <div className="h-16 w-full rounded-lg bg-grad-primary border border-border" />
                <div className="h-16 w-full rounded-lg bg-grad-surface border border-border" />
              </div>
            </div>
            <div>
              <SubLabel>Text treatments</SubLabel>
              <div className="space-y-3">
                <p className="rounded-lg border border-border bg-surface-subtle px-4 py-3 font-serif text-2xl text-gradient-gold">
                  text-gradient-gold
                </p>
                <p className="rounded-lg border border-border bg-surface-subtle px-4 py-3 text-sm leading-relaxed">
                  <span className="bg-clip-text text-transparent bg-grad-primary">
                    Gradient text (primary)
                  </span>{" "}
                  for emphasis without shouting.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section
        id="surfaces"
        label="Surfaces"
        title="Light, elevation, glass."
        description="Warm neutrals carry the content; shadows and glass lift interactive moments."
      >
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Card · shadow-card</CardTitle>
              <CardDescription>Default resting surface for content.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <div className="h-14 flex-1 rounded-lg bg-surface-hover border border-border" />
              <div className="h-14 flex-1 rounded-lg bg-surface-subtle border border-border" />
              <div className="h-14 flex-1 rounded-lg bg-muted border border-border" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Elevation</CardTitle>
              <CardDescription>Layered, soft shadows that read as depth.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-6">
                <div className="h-24 w-24 rounded-lg bg-card shadow-xs border border-border" />
                <div className="h-24 w-24 rounded-lg bg-card shadow-card border border-border" />
                <div className="h-24 w-24 rounded-lg bg-card shadow-elevated border border-border" />
                <div className="h-24 w-24 rounded-lg bg-card shadow-2xl border border-border" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <SubLabel>Glass</SubLabel>
          <div className="rounded-card-lg bg-gradient-hero bg-cover p-8">
            <div className="glass max-w-sm rounded-lg px-5 py-4">
              <p className="text-sm font-medium text-background">glass · backdrop blur</p>
              <p className="mt-1 text-sm leading-relaxed text-background/70">
                Used on sticky navigation over imagery.
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Section
        id="radius-spacing"
        label="Geometry"
        title="Radius & spacing."
        description="Generous radius at the edges of things; room to breathe between them."
      >
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <SubLabel>Radius scale</SubLabel>
            <div className="flex flex-wrap items-center gap-4">
              {[
                ["rounded-xs", "6px"],
                ["rounded-sm", "8px"],
                ["rounded-md", "10px"],
                ["rounded-lg", "12px"],
                ["rounded-xl", "16px"],
                ["rounded-2xl", "20px"],
                ["rounded-full", "pill"],
              ].map(([cls, label]) => (
                <div key={cls} className="flex flex-col items-center gap-2">
                  <div
                    className={cn(
                      "h-16 w-16 bg-primary-100 dark:bg-primary-900 border border-primary-200 dark:border-primary-800",
                      cls as string
                    )}
                  />
                  <code className="text-[11px] text-muted-foreground">{label}</code>
                </div>
              ))}
            </div>
          </div>
          <div>
            <SubLabel>Section rhythm</SubLabel>
            <div className="space-y-2">
              {[
                ["section-pad-sm", "4rem", "h-16"],
                ["section-pad-default", "6rem", "h-24"],
                ["section-pad-lg", "8rem", "h-32"],
              ].map(([token, label, h]) => (
                <div key={token} className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-40 rounded border border-border bg-surface-subtle",
                      h as string
                    )}
                  />
                  <code className="text-xs text-muted-foreground">{token}</code>
                  <span className="text-xs text-muted-foreground">= {label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10">
          <SubLabel>Containers</SubLabel>
          <div className="space-y-3">
            {(
              [
                ["max-w-page", "80rem"],
                ["max-w-wide", "88rem"],
                ["max-w-narrow", "72rem"],
                ["max-w-tight", "60rem"],
                ["max-w-prose", "42rem"],
              ] as const
            ).map(([cls]) => (
              <div
                key={cls}
                className={cn(
                  "h-4 rounded border border-border bg-primary-100/70 dark:bg-primary-900/70",
                  cls
                )}
              />
            ))}
            <p className="text-xs text-muted-foreground">
              {["80rem", "88rem", "72rem", "60rem", "42rem"].join(" · ")}
            </p>
          </div>
        </div>
      </Section>

      <Section
        id="buttons"
        label="Actions"
        title="Buttons."
        description="Six voices, one behaviour. The accent button is the signature — gold, deliberate, reserved."
      >
        <div className="space-y-8">
          <div>
            <SubLabel>Variants</SubLabel>
            <div className="flex flex-wrap items-center gap-3">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="accent">Accent</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="link">Link</Button>
            </div>
          </div>
          <div>
            <SubLabel>Sizes</SubLabel>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="xs">Extra small</Button>
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
              <Button size="xl">Extra large</Button>
              <Button size="icon" aria-label="Settings">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div>
            <SubLabel>States</SubLabel>
            <div className="flex flex-wrap items-center gap-3">
              <Button loading>Submitting</Button>
              <Button disabled>Disabled</Button>
              <Button
                variant="accent"
                onClick={() =>
                  ui.toast({
                    title: "Welcome to Amanya",
                    description: "Toasts are part of the feedback language.",
                    tone: "success",
                  })
                }
              >
                Trigger a toast
              </Button>
            </div>
          </div>
        </div>
      </Section>

      <Section
        id="badges"
        label="Signal"
        title="Badges."
        description="Small, precise labels across three treatments and seven tones."
      >
        <div className="space-y-6">
          {(["soft", "solid", "outline"] as const).map((variant) => (
            <div key={variant}>
              <SubLabel>{variant}</SubLabel>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={variant}>Neutral</Badge>
                <Badge tone="primary" variant={variant}>
                  Primary
                </Badge>
                <Badge tone="accent" variant={variant}>
                  Accent
                </Badge>
                <Badge tone="success" variant={variant}>
                  Success
                </Badge>
                <Badge tone="warning" variant={variant}>
                  Warning
                </Badge>
                <Badge tone="error" variant={variant}>
                  Error
                </Badge>
                <Badge tone="info" variant={variant}>
                  Info
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section
        id="forms"
        label="Forms"
        title="Quiet inputs."
        description="Hairline borders, an emerald focus ring, and none of the noise."
      >
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <Field label="Full name" hint="As it appears on your ID.">
              <Input placeholder="A. N. Sharma" />
            </Field>
            <Field label="Email" required error="Please enter a valid email address.">
              <Input type="email" placeholder="you@example.com" aria-invalid />
            </Field>
            <Field label="Message">
              <Textarea placeholder="Tell us what you're looking for…" rows={4} />
            </Field>
            <Field label="Residence">
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a residence" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="amanya">The Amanya</SelectItem>
                  <SelectItem value="banyan">The Banyan</SelectItem>
                  <SelectItem value="garden">The Garden House</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Checkbox
                id="terms"
                checked={checked}
                onCheckedChange={(v) => setChecked(v === true)}
              />
              <Label htmlFor="terms" className="leading-none">
                I accept the terms
              </Label>
            </div>

            <RadioGroup value={radio} onValueChange={setRadio}>
              <SubLabel>Tower</SubLabel>
              <div className="flex items-center gap-3">
                <RadioGroupItem id="r1" value="one" />
                <Label htmlFor="r1">North</Label>
              </div>
              <div className="flex items-center gap-3">
                <RadioGroupItem id="r2" value="two" />
                <Label htmlFor="r2">South</Label>
              </div>
            </RadioGroup>

            <div className="flex items-center gap-3">
              <Switch id="notify" checked={switched} onCheckedChange={setSwitched} />
              <Label htmlFor="notify">Notify me of releases</Label>
            </div>

            <div>
              <SubLabel>Toggle group</SubLabel>
              <ToggleGroup type="single" defaultValue="day">
                <ToggleGroupItem value="day">Day</ToggleGroupItem>
                <ToggleGroupItem value="evening">Evening</ToggleGroupItem>
                <ToggleGroupItem value="night">Night</ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>
        </div>
      </Section>

      <Section
        id="content"
        label="Content"
        title="Cards, stats, sections."
        description="Composed surfaces for galleries, listings and editorial moments."
      >
        <div className="grid gap-6 md:grid-cols-3">
          <CardInteractive>
            <CardHeader>
              <Badge tone="accent" className="w-fit">
                Now selling
              </Badge>
              <CardTitle>The Amanya</CardTitle>
              <CardDescription>Khajaguda · 2 &amp; 3 BHK</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Interiors in natural stone and teak, framed by the lake light.
              </p>
            </CardContent>
            <CardFooter>
              <span className="font-serif text-xl text-foreground">₹1.2Cr</span>
              <span className="text-xs text-muted-foreground">onwards</span>
            </CardFooter>
          </CardInteractive>

          <CardInteractive>
            <CardHeader>
              <Badge>Residences</Badge>
              <CardTitle>The Banyan</CardTitle>
              <CardDescription>Khajaguda · 3 &amp; 4 BHK</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Corner units with private terraces and a full-height glass spine.
              </p>
            </CardContent>
            <CardFooter>
              <span className="font-serif text-xl text-foreground">₹1.8Cr</span>
              <span className="text-xs text-muted-foreground">onwards</span>
            </CardFooter>
          </CardInteractive>

          <Card>
            <CardHeader>
              <CardTitle>At a glance</CardTitle>
              <CardDescription>Amanya by the numbers.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-6">
              <Stat label="Acres" value="4.5" />
              <Stat label="Towers" value="3" />
              <Stat label="Residences" value="180" />
              <Stat label="Open space" value="70" suffix="%" />
            </CardContent>
          </Card>
        </div>

        <div className="mt-10">
          <SectionTitle
            title="A considered way to live"
            description="Eyebrow-led section titles keep the narrative measured and calm."
          />
        </div>

        <Divider label="Editorial divider" ornament className="mt-10" />
      </Section>

      <Section
        id="navigation"
        label="Navigation"
        title="Wayfinding, quietly."
        description="Gold underlines on hover and a pill-based tab system."
      >
        <div className="space-y-10">
          <div className="flex flex-wrap items-center gap-8">
            <NavLink href={routes.home} active>
              Residences
            </NavLink>
            <NavLink href={routes.gallery}>Gallery</NavLink>
            <NavLink href={routes.about}>The Story</NavLink>
            <NavLink href={routes.contact}>Contact</NavLink>
          </div>

          <Breadcrumbs
            items={[
              { label: "Home", href: routes.home },
              { label: "Residences", href: routes.properties },
              { label: "The Amanya" },
            ]}
          />

          <Tabs value={tabs} onValueChange={setTabs}>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="amenities">Amenities</TabsTrigger>
              <TabsTrigger value="floorplans">Floorplans</TabsTrigger>
            </TabsList>
            <TabsContent
              value="overview"
              className="rounded-card border border-border bg-surface-subtle p-6 text-sm text-muted-foreground"
            >
              Overview tab content — quiet, unfilled, ready for the build phase.
            </TabsContent>
            <TabsContent
              value="amenities"
              className="rounded-card border border-border bg-surface-subtle p-6 text-sm text-muted-foreground"
            >
              Amenities tab content.
            </TabsContent>
            <TabsContent
              value="floorplans"
              className="rounded-card border border-border bg-surface-subtle p-6 text-sm text-muted-foreground"
            >
              Floorplan tab content.
            </TabsContent>
          </Tabs>

          <Pagination totalPages={4} currentPage={currentPage} onPageChange={setCurrentPage} />
        </div>
      </Section>

      <Section
        id="overlays"
        label="Overlays"
        title="Layers & menus."
        description="Modals, drawers, menus and hints — each with its own motion, all with the same restraint."
      >
        <div className="flex flex-wrap items-center gap-3">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>Open dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Book a private viewing</DialogTitle>
                <DialogDescription>
                  A member of the Amanya concierge will be in touch within one working day.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-2">
                <Field label="Preferred date">
                  <Input type="date" />
                </Field>
                <Field label="Guests">
                  <Input type="number" min={1} defaultValue={2} />
                </Field>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="accent" onClick={() => setDialogOpen(false)}>
                  Request viewing
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
            <Button onClick={() => setDrawerOpen(true)} variant="secondary">
              Open drawer
            </Button>
            <DrawerContent side="right">
              <DrawerHeader>
                <DrawerTitle>Enquiry</DrawerTitle>
                <DrawerDescription>Sliding panels suit short, focused tasks.</DrawerDescription>
              </DrawerHeader>
              <DrawerFooter>
                <Button onClick={() => setDrawerOpen(false)}>Done</Button>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline">Hover for tooltip</Button>
              </TooltipTrigger>
              <TooltipContent>A quiet nudge.</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">Popover</Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Filters</p>
                <p className="text-sm text-muted-foreground">
                  Configuration lives here in the build phase.
                </p>
              </div>
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary">
                Menu
                <ChevronDown className="h-4 w-4 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuItem>
                <User className="h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="danger">
                <X className="h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-10">
          <SubLabel>Accordion</SubLabel>
          <Accordion
            type="single"
            collapsible
            className="max-w-xl rounded-card border border-border px-6"
          >
            <AccordionItem value="a">
              <AccordionTrigger>What is Amanya?</AccordionTrigger>
              <AccordionContent>
                A composed enclave of residences in Khajaguda, designed around light, water and
                silence.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="b">
              <AccordionTrigger>Who is Vision Infra?</AccordionTrigger>
              <AccordionContent>
                The developer — an experienced Hyderabad builder with a record of considered,
                on-time delivery.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="c">
              <AccordionTrigger>When is delivery?</AccordionTrigger>
              <AccordionContent>
                The possession schedule is announced in the build phase.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </Section>

      <Section
        id="feedback"
        label="Feedback"
        title="States & data."
        description="Loaders that breathe, skeletons that settle, and empty states with dignity."
      >
        <div className="space-y-10">
          <div>
            <SubLabel>Indicators</SubLabel>
            <div className="flex flex-wrap items-center gap-6">
              <Spinner size="sm" />
              <Spinner size="md" />
              <Spinner size="lg" />
              <Progress value={64} className="w-48" />
            </div>
          </div>

          <div>
            <SubLabel>Skeleton</SubLabel>
            <div className="max-w-sm space-y-3 rounded-card border border-border p-5">
              <Skeleton className="h-40 w-full rounded-lg" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>

          <div>
            <SubLabel>Identity</SubLabel>
            <div className="flex flex-wrap items-center gap-4">
              <Avatar size="sm" initials="VA" />
              <Avatar size="md" initials="AN" />
              <Avatar size="lg" initials="SK" />
              <Avatar size="xl" initials="MR" />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <EmptyState
              title="No favourites yet"
              description="When you save a residence it will appear here, ready to revisit."
              action={<Button variant="outline">Explore residences</Button>}
            />
            <ErrorState
              title="This section lost its way"
              description="Try again in a moment — the concierge has been notified."
              action={<Button variant="secondary">Retry</Button>}
            />
          </div>

          <div>
            <SubLabel>Scroll region</SubLabel>
            <ScrollArea className="h-36 w-full max-w-md rounded-card border border-border bg-surface-subtle p-4">
              <div className="space-y-3 pr-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground"
                  >
                    Residence {i + 1} — amenity note
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </Section>

      <Section
        id="media"
        label="Media"
        title="The photography frame."
        description="Hairline borders and soft vignettes let the imagery do the talking."
      >
        <div className="grid gap-6 md:grid-cols-3">
          <ImageFrame
            src={DEMO_IMAGE}
            alt="Architectural study"
            aspect="portrait"
            caption="The entrance"
            captionDetail="Study 01"
          />
          <ImageFrame
            src={DEMO_IMAGE}
            alt="Architectural study"
            aspect="square"
            variant="card"
            caption="The courtyard"
            captionDetail="Study 02"
          />
          <ImageFrame
            src={DEMO_IMAGE}
            alt="Architectural study"
            aspect="landscape"
            caption="Lake light"
            captionDetail="Study 03"
          />
        </div>
        <div className="mt-6">
          <ImageFrame
            src={DEMO_IMAGE}
            alt="Hero architectural study"
            aspect="cinematic"
            variant="hero"
            caption="Amanya at dusk"
            captionDetail="The signature frame"
          />
        </div>
      </Section>

      <footer className="border-t border-border">
        <Container size="page" className="flex flex-col items-center gap-2 py-12 text-center">
          <p className="font-serif text-2xl text-foreground">Vision Amanya</p>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            Every element above is a live component from the design system — edit the tokens in{" "}
            <code className="text-xs">globals.css</code> and this page follows.
          </p>
        </Container>
      </footer>
    </>
  );
}
