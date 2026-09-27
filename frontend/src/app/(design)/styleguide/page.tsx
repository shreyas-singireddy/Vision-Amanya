"use client";

/**
 * Design System — the living styleguide for Vision Amnaya.
 *
 * Every token and component is rendered live so changes in `globals.css` are
 * reflected immediately. This page is architecture-only: no business logic,
 * no forms with meaning — purely a catalogue of the visual language.
 */

import { useState } from "react";
import { ChevronDown, Expand, Heart, Settings, Share2, User, X } from "lucide-react";

import { BudgetSelect, DateInput, PhoneInput, PreferenceSelect } from "@components/forms";
import { BuildingCard, FloorPlanCard, ResidenceCard, SpecList } from "@components/property";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Alert,
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
  Grid,
  GridItem,
  IconButton,
  ImageCard,
  ImageFrame,
  Input,
  Label,
  LoadingState,
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
  Stack,
  Stat,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Tag,
  TextLink,
  Textarea,
  ToggleGroup,
  ToggleGroupItem,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@components/ui";
import {
  ArchitecturalGrid,
  HorizontalLine,
  LuxuryButton,
  MagneticButton,
  ScrollIndicator,
  SectionHeading,
} from "@components/amnaya";
import { ui, useUIStore } from "@store/ui.store";
import { routes } from "@constants/routes";
import { cn } from "@utils/cn";

const brandRamps = ["primary", "accent", "neutral", "navy", "sky"] as const;

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
  const [phone, setPhone] = useState("");
  const [budget, setBudget] = useState("1cr-2cr");
  const [prefs, setPrefs] = useState<string[]>(["2bhk", "pool-facing"]);
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
            Vision Amnaya · Phase 6
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
                Amnaya unfolds slowly — a considered landscape of light, stone and shadow where each
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
                ["body-large", "text-body-large", "Body large"],
                ["base", "text-base", "Body text"],
                ["body-small", "text-body-small", "Body small"],
                ["caption", "text-caption", "Caption & meta"],
                ["label", "text-label uppercase tracking-label", "LABEL"],
                ["nav", "text-nav uppercase tracking-nav", "NAV"],
                ["button", "text-button uppercase tracking-button", "BUTTON"],
                ["numeric", "numeric text-numeric", "4,20,000"],
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
                <div className="h-16 w-full rounded-lg bg-grad-dusk border border-border" />
                <div className="h-16 w-full rounded-lg bg-grad-lake border border-border" />
                <div className="h-16 w-full rounded-lg bg-grad-ink border border-border" />
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
                <p className="rounded-lg border border-border bg-surface-subtle px-4 py-3 text-sm leading-relaxed">
                  <span className="bg-clip-text text-transparent bg-grad-ink">
                    Gradient text (ink)
                  </span>{" "}
                  reserved for the darkest moments.
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
                <div className="h-24 w-24 rounded-lg bg-card shadow-cinematic border border-border" />
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                shadow-cinematic is reserved for full-bleed hero imagery and the gallery.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <SubLabel>Glow</SubLabel>
          <div className="flex flex-wrap gap-6">
            <div className="h-24 w-24 rounded-lg bg-card shadow-glow-primary border border-border flex items-center justify-center text-[11px] text-muted-foreground">
              glow-primary
            </div>
            <div className="h-24 w-24 rounded-lg bg-card shadow-glow-gold border border-border flex items-center justify-center text-[11px] text-muted-foreground">
              glow-gold
            </div>
          </div>
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
                ["max-w-hero", "96rem"],
                ["max-w-gallery", "100rem"],
                ["max-w-wide", "88rem"],
                ["max-w-page", "80rem"],
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
              {["96rem", "100rem", "88rem", "80rem", "72rem", "60rem", "42rem"].join(" · ")}
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
                    title: "Welcome to Amnaya",
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
                  <SelectItem value="amnaya">The Amnaya</SelectItem>
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
              <CardTitle>The Amnaya</CardTitle>
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
              <CardDescription>Amnaya by the numbers.</CardDescription>
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
              { label: "The Amnaya" },
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
                  A member of the Amnaya concierge will be in touch within one working day.
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
              <AccordionTrigger>What is Amnaya?</AccordionTrigger>
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
        id="primitives"
        label="Primitives"
        title="Small pieces, one voice."
        description="Tags, links, alerts and icon controls — the vocabulary used inside every larger composition."
      >
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <SubLabel>Tags</SubLabel>
            <div className="flex flex-wrap items-center gap-2">
              <Tag tone="neutral">2 BHK</Tag>
              <Tag tone="primary">Furnished</Tag>
              <Tag tone="accent">Pool-facing</Tag>
              <Tag tone="navy">Corner unit</Tag>
            </div>
          </div>

          <div>
            <SubLabel>Text links</SubLabel>
            <div className="space-y-3">
              <div>
                <TextLink href={routes.properties}>View all residences</TextLink>
              </div>
              <div>
                <TextLink href={routes.gallery} arrow="up-right">
                  Open the gallery
                </TextLink>
              </div>
              <div>
                <TextLink href={routes.about} arrow="none">
                  Quiet, arrowless link
                </TextLink>
              </div>
              <div>
                <TextLink href="https://example.com" arrow="up-right">
                  External source
                </TextLink>
              </div>
            </div>
          </div>

          <div>
            <SubLabel>Alerts</SubLabel>
            <div className="space-y-3">
              <Alert
                tone="info"
                title="Visit booked"
                description="Our concierge will confirm by email within one working day."
              />
              <Alert
                tone="success"
                title="Enquiry received"
                description="We have your details and will be in touch shortly."
              />
              <Alert
                tone="warning"
                title="Phase 2 nearly full"
                description="Only a handful of 3 BHK units remain in this phase."
              />
              <Alert
                tone="error"
                title="Could not submit"
                description="Check your phone number and try again."
              />
            </div>
          </div>

          <div>
            <SubLabel>Icon buttons</SubLabel>
            <div className="flex flex-wrap items-center gap-2">
              <IconButton icon={Heart} aria-label="Favourite" variant="soft" />
              <IconButton icon={Share2} aria-label="Share" variant="outline" />
              <IconButton icon={Expand} aria-label="Expand" variant="ghost" />
              <IconButton icon={X} aria-label="Close" variant="ghost" />
              <div className="bg-navy-900 rounded-lg px-2 py-2">
                <IconButton icon={Heart} aria-label="Favourite on dark" variant="glass" />
              </div>
              <IconButton icon={Heart} aria-label="Favourite solid" variant="solid" size="lg" />
            </div>
          </div>
        </div>

        <div className="mt-10">
          <SubLabel>Grid &amp; Stack</SubLabel>
          <Grid cols={{ base: 1, lg: 12 }} gap="md">
            <GridItem span={{ base: 12, lg: 7 }}>
              <div className="rounded-lg border border-border bg-surface-subtle px-4 py-6 font-serif text-lg text-foreground">
                Editorial column — span 7 of 12 on desktop.
              </div>
            </GridItem>
            <GridItem span={{ base: 12, lg: 5 }}>
              <div className="rounded-lg border border-border bg-surface-subtle px-4 py-6 font-serif text-lg text-foreground">
                Companion column — span 5.
              </div>
            </GridItem>
          </Grid>
          <div className="mt-6">
            <Stack
              direction="row"
              gap="sm"
              align="center"
              wrap
              className="rounded-lg border border-border bg-surface-subtle px-4 py-4"
            >
              <Tag tone="primary">Lake-facing</Tag>
              <Tag tone="neutral">2,590 sq.ft.</Tag>
              <Tag tone="navy">10th floor</Tag>
            </Stack>
          </div>
        </div>
      </Section>

      <Section
        id="forms-enquiry"
        label="Enquiry"
        title="Purpose-built controls."
        description="Phone, date, budget and preference inputs — the quiet machinery of a reservation."
      >
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <Field label="Phone">
              <PhoneInput value={phone} onChange={setPhone} />
            </Field>
            <Field label="Preferred visit date" hint="We confirm within one working day.">
              <DateInput />
            </Field>
          </div>
          <div className="space-y-6">
            <div>
              <SubLabel>Budget</SubLabel>
              <BudgetSelect value={budget} onChange={setBudget} />
            </div>
            <div>
              <SubLabel>Interests</SubLabel>
              <PreferenceSelect
                value={prefs}
                onChange={setPrefs}
                options={[
                  { value: "2bhk", label: "2 BHK" },
                  { value: "3bhk", label: "3 BHK" },
                  { value: "lake-facing", label: "Lake-facing" },
                  { value: "pool-facing", label: "Pool-facing" },
                  { value: "ready", label: "Ready to move" },
                ]}
              />
            </div>
          </div>
        </div>
      </Section>

      <Section
        id="property"
        label="Property"
        title="Residences, plans, towers."
        description="The listing vocabulary — rendered here with the real project imagery."
      >
        <div className="space-y-4">
          <SubLabel>Residence cards</SubLabel>
          <Grid cols={{ base: 1, sm: 2, lg: 3 }} gap="md">
            <ResidenceCard
              src="/assets/amnaya/renders/building-day.jpg"
              alt="Residence render at day"
              title="The Amnaya"
              subtitle="Khajaguda · 3 BHK"
              price="₹1.6 Cr"
              area="1,715 sq.ft."
              beds={3}
              baths={3}
              badge="phase-open"
            />
            <ResidenceCard
              src="/assets/amnaya/renders/dusk-building.jpg"
              alt="Residence render at dusk"
              title="The Banyan"
              subtitle="Khajaguda · 3 &amp; 4 BHK"
              price="₹2.4 Cr"
              area="2,590 sq.ft."
              beds={4}
              baths={4}
              badge="available"
            />
            <ResidenceCard
              src="/assets/amnaya/renders/lake-view.jpg"
              alt="Lake-view residence"
              title="The Garden House"
              subtitle="Khajaguda · 2 BHK"
              price="₹1.2 Cr"
              area="1,240 sq.ft."
              beds={2}
              baths={2}
              badge="sold-out"
            />
          </Grid>
        </div>

        <div className="mt-10 space-y-4">
          <SubLabel>Floor plans</SubLabel>
          <Grid cols={{ base: 2, sm: 3, lg: 4 }} gap="md">
            <FloorPlanCard
              src="/assets/amnaya/floorplans/amnaya-floorplans-01.jpeg"
              alt="2 BHK floor plan"
              type="2 BHK"
              area="1,240 sq.ft."
              note="Lake-facing"
            />
            <FloorPlanCard
              src="/assets/amnaya/floorplans/amnaya-floorplans-01.jpeg"
              alt="3 BHK floor plan"
              type="3 BHK"
              area="1,715 sq.ft."
              note="Corner"
            />
            <FloorPlanCard
              src="/assets/amnaya/floorplans/amnaya-floorplans-01.jpeg"
              alt="3 BHK floor plan"
              type="3 BHK"
              area="1,890 sq.ft."
              note="East wing"
            />
            <FloorPlanCard
              src="/assets/amnaya/floorplans/amnaya-floorplans-01.jpeg"
              alt="4 BHK floor plan"
              type="4 BHK"
              area="2,590 sq.ft."
              note="Podium level"
            />
          </Grid>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div>
            <SubLabel>Specifications</SubLabel>
            <div className="rounded-card border border-border bg-card p-6">
              <SpecList
                items={[
                  { label: "Configuration", value: "3 BHK" },
                  { label: "Carpet area", value: "1,715 sq.ft." },
                  { label: "Floor", value: "8 of 10" },
                  { label: "Bathrooms", value: "3" },
                  { label: "Balconies", value: "2" },
                  { label: "Furnishing", value: "Unfurnished" },
                  { label: "Possession", value: "Q4 2027" },
                  { label: "Facing", value: "Lake" },
                ]}
              />
            </div>
          </div>
          <div>
            <SubLabel>Towers</SubLabel>
            <div className="grid gap-4 sm:grid-cols-2">
              <BuildingCard
                title="The Amnaya"
                description="First of its kind — 2 acres of garden with 25 acres of lake view."
                status="phase-open"
                residences={140}
                floors={10}
              />
              <BuildingCard
                title="The Banyan"
                description="Corner residences with full-height glass and private terraces."
                status="launching"
                residences={160}
                floors={10}
              />
            </div>
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
            src="/assets/amnaya/hero/amnaya-hero-01.jpeg"
            alt="Architectural study"
            aspect="portrait"
            caption="The entrance"
            captionDetail="Study 01"
          />
          <ImageFrame
            src="/assets/amnaya/renders/hero-day.jpg"
            alt="Architectural study"
            aspect="square"
            variant="card"
            caption="The courtyard"
            captionDetail="Study 02"
          />
          <ImageFrame
            src="/assets/amnaya/pool/amnaya-pool-01.jpeg"
            alt="Architectural study"
            aspect="landscape"
            caption="Lake light"
            captionDetail="Study 03"
          />
        </div>
        <div className="mt-6">
          <ImageFrame
            src="/assets/amnaya/renders/panorama.jpg"
            alt="Hero architectural study"
            aspect="cinematic"
            variant="hero"
            caption="Amnaya at dusk"
            captionDetail="The signature frame"
          />
        </div>

        <div className="mt-10">
          <SubLabel>ImageCard — overlay treatment</SubLabel>
          <ImageCard
            src="/assets/amnaya/landscape/amnaya-landscape-01.jpeg"
            alt="Landscape amenity"
            aspect="wide"
          >
            <Tag tone="primary" className="w-fit">
              Landscaped gardens
            </Tag>
            <h3 className="font-serif text-2xl font-semibold leading-snug text-neutral-50">
              Two acres of garden, twenty-five of lake.
            </h3>
          </ImageCard>
        </div>

        <div className="mt-10">
          <SubLabel>Loading state</SubLabel>
          <LoadingState label="Loading residences" />
        </div>
      </Section>

      {/* ── AMNAYA-specific components ─────────────────────────────── */}
      <Section
        id="amnaya-components"
        label="Phase 6.2 — AMNAYA"
        title="AMNAYA design vocabulary"
        description="Brand-specific components for the luxury marketing experience. Import from @components/amnaya — never use these in utility/dashboard views."
      >
        {/* LuxuryButton */}
        <div className="mb-10">
          <SubLabel>LuxuryButton — pill CTA variants</SubLabel>
          <div className="mt-6 flex flex-wrap items-center gap-4 rounded-card border border-border bg-card p-8">
            <LuxuryButton variant="accent">Book a Visit</LuxuryButton>
            <LuxuryButton variant="primary">View Residences</LuxuryButton>
            <LuxuryButton variant="dark" size="md">
              Learn More
            </LuxuryButton>
            <LuxuryButton variant="accent" size="sm" arrow={false}>
              Explore
            </LuxuryButton>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-4 rounded-card bg-neutral-950 p-8">
            <LuxuryButton variant="ghost">Explore Amnaya</LuxuryButton>
            <LuxuryButton variant="accent">Schedule a Visit</LuxuryButton>
          </div>
        </div>

        {/* MagneticButton */}
        <div className="mb-10">
          <SubLabel>MagneticButton — cursor-attracted CTA (desktop only)</SubLabel>
          <p className="mb-4 text-sm text-muted-foreground">
            Move your cursor slowly over the button to feel the magnetic attraction. Disabled on
            touch and reduced motion.
          </p>
          <div className="flex flex-wrap gap-6 rounded-card border border-border bg-card p-8">
            <MagneticButton>Explore Amnaya</MagneticButton>
            <MagneticButton radius={40}>Schedule a Visit</MagneticButton>
          </div>
        </div>

        {/* SectionHeading */}
        <div className="mb-10">
          <SubLabel>SectionHeading — animated editorial header</SubLabel>
          <div className="mt-6 space-y-12 rounded-card border border-border bg-card p-8">
            <SectionHeading
              eyebrow="Architecture"
              title="Where Khajaguda meets the lake"
              description="420 premium 3 BHK residences across 5.3 acres, framed by 2 acres of central garden and an unobstructed 25-acre lake view."
              line
            />
            <SectionHeading
              eyebrow="Location"
              title="The most coveted address in Hyderabad"
              align="center"
            />
          </div>
          <div className="mt-4 rounded-card bg-navy-900 p-8">
            <SectionHeading
              eyebrow="Residences"
              title="Crafted for those who live with intention"
              description="Every detail of Amnaya is designed around the resident's experience — from the double-height stilt entrance to the private sky gardens."
              inverted
              line
            />
          </div>
        </div>

        {/* HorizontalLine */}
        <div className="mb-10">
          <SubLabel>HorizontalLine — animated architectural divider</SubLabel>
          <div className="mt-6 space-y-8 rounded-card border border-border bg-card p-8">
            <div>
              <p className="mb-3 text-sm text-muted-foreground">Left-to-right (default)</p>
              <HorizontalLine />
            </div>
            <div>
              <p className="mb-3 text-sm text-muted-foreground">Right-to-left</p>
              <HorizontalLine direction="rtl" />
            </div>
            <div>
              <p className="mb-3 text-sm text-muted-foreground">Short accent line (w-12)</p>
              <HorizontalLine className="w-12" />
            </div>
          </div>
          <div className="mt-4 rounded-card bg-navy-900 p-8">
            <p className="mb-3 text-sm text-neutral-50/50">Inverted variant</p>
            <HorizontalLine inverted />
          </div>
        </div>

        {/* ScrollIndicator */}
        <div className="mb-10">
          <SubLabel>ScrollIndicator — animated scroll cue</SubLabel>
          <div className="mt-6 flex flex-wrap gap-12 rounded-card bg-navy-900 p-8">
            <ScrollIndicator />
            <ScrollIndicator label="Discover" />
            <ScrollIndicator label="" cycleDuration={1.2} />
          </div>
          <div className="mt-4 flex flex-wrap gap-12 rounded-card border border-border bg-card p-8">
            <ScrollIndicator inverted label="Scroll" />
            <ScrollIndicator inverted label="Continue" />
          </div>
        </div>

        {/* ArchitecturalGrid */}
        <div className="mb-10">
          <SubLabel>ArchitecturalGrid — structural overlay</SubLabel>
          <p className="mb-4 text-sm text-muted-foreground">
            The grid is position: absolute inset-0 — the parent must be position: relative. Default
            opacity is near-invisible (3–5%).
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="relative h-48 rounded-card bg-navy-900">
              <ArchitecturalGrid columns={6} surface="dark" />
              <div className="absolute inset-0 flex items-end p-4">
                <span className="text-xs text-neutral-50/40">lines · dark · 6 cols</span>
              </div>
            </div>
            <div className="relative h-48 rounded-card bg-navy-900">
              <ArchitecturalGrid columns={8} surface="dark" variant="cross" />
              <div className="absolute inset-0 flex items-end p-4">
                <span className="text-xs text-neutral-50/40">cross · dark · 8 cols</span>
              </div>
            </div>
            <div className="relative h-48 rounded-card border border-border bg-muted">
              <ArchitecturalGrid columns={6} surface="light" />
              <div className="absolute inset-0 flex items-end p-4">
                <span className="text-xs text-muted-foreground">lines · light · 6 cols</span>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <footer className="border-t border-border">
        <Container size="page" className="flex flex-col items-center gap-2 py-12 text-center">
          <p className="font-serif text-2xl text-foreground">Vision Amnaya</p>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            Every element above is a live component from the design system — edit the tokens in{" "}
            <code className="text-xs">globals.css</code> and this page follows.
          </p>
        </Container>
      </footer>
    </>
  );
}
