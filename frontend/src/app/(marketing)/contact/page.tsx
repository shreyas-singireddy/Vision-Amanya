"use client";

import { useState, type FormEvent } from "react";

import { projectAssets } from "@config/project";

import { Button } from "@components/ui/button";
import { Eyebrow, DisplayHeading } from "@components/ui/heading";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import { Label } from "@components/ui/label";
import { Field } from "@components/ui/field";

import { Section } from "@components/layout/section";

import { HeroReveal, HeroRule, WordReveal, Reveal, Stagger } from "@components/motion";

import { PhoneInput } from "@components/forms/phone-input";
import { BudgetSelect } from "@components/forms/budget-select";
import { PreferenceSelect } from "@components/forms/preference-select";
import { DateInput } from "@components/forms/date-input";

/** Contact channels — filled once confirmed. */
const contactDetails = [
  {
    label: "Address",
    value: "Vision Amnaya · Khajaguda\nHyderabad, Telangana",
  },
  {
    label: "Sales Office",
    value: "+91 90000 00000",
    href: "tel:+919000000000",
  },
  {
    label: "Email",
    value: "hello@visionamnaya.in",
    href: "mailto:hello@visionamnaya.in",
  },
  {
    label: "Hours",
    value: "Monday – Sunday · 9:00 AM – 7:00 PM",
  },
] as const;

const preferenceOptions = [
  { value: "site-visit", label: "Schedule a site visit" },
  { value: "brochure", label: "Request a brochure" },
  { value: "floor-plan", label: "Request floor plans" },
  { value: "pricing", label: "Pricing inquiry" },
  { value: "general", label: "General question" },
];

export default function ContactPage() {
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [budget, setBudget] = useState("");
  const [preferences, setPreferences] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulate async submission — in production this calls the backend enquiry endpoint.
    await new Promise((r) => setTimeout(r, 1200));
    setSubmitting(false);
    setSubmitted(true);
  };

  return (
    <>
      {/* Hero */}
      <HeroReveal
        background={{
          src: projectAssets.exterior01,
          alt: "Vision Amnaya — Khajaguda, Hyderabad",
          priority: true,
        }}
        eyebrow={
          <span className="flex items-center gap-3">
            <HeroRule />
            <span className="text-xs font-medium uppercase tracking-eyebrow text-neutral-50/80">
              Contact
            </span>
          </span>
        }
        headline={
          <WordReveal
            text="Begin your conversation with Amnaya"
            as="h1"
            className="font-serif text-display-2 font-medium tracking-display text-neutral-50"
          />
        }
        subheading={
          <p className="text-lead text-neutral-50/75">
            Our sales team is available seven days a week to answer questions, arrange site visits,
            and share project information.
          </p>
        }
        minHeight="min-h-[60vh]"
        depth
        overlay
      />

      {/* Enquiry form + contact details */}
      <Section id="enquiry" spacing="lg" tone="light">
        <div className="grid gap-16 lg:grid-cols-12 lg:gap-20">
          {/* Form */}
          <div className="lg:col-span-7">
            <Reveal className="flex flex-col gap-8">
              <div>
                <Eyebrow>Enquiry Form</Eyebrow>
                <DisplayHeading as="h2" level={3} className="mt-3">
                  Tell us about your interest
                </DisplayHeading>
              </div>

              {submitted ? (
                <div className="rounded-card-lg border border-primary-200 bg-primary-50 p-8 text-center">
                  <p className="font-serif text-2xl font-medium text-primary-800">
                    Thank you for your enquiry.
                  </p>
                  <p className="mt-3 text-base text-primary-700">
                    Our team will be in touch within one working day. In the meantime, feel free to
                    explore the project gallery and masterplan.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="First name" required>
                      <Input
                        name="firstName"
                        autoComplete="given-name"
                        placeholder="Ravi"
                        required
                      />
                    </Field>
                    <Field label="Last name" required>
                      <Input
                        name="lastName"
                        autoComplete="family-name"
                        placeholder="Sharma"
                        required
                      />
                    </Field>
                  </div>

                  <Field label="Email address" required>
                    <Input
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="ravi@example.com"
                      required
                    />
                  </Field>

                  <Field label="Mobile number" required>
                    <PhoneInput name="phone" value={phone} onChange={setPhone} required />
                  </Field>

                  {/* Preference chips — multi-select, not wrapped in Field */}
                  <div className="flex flex-col gap-2">
                    <Label>I am interested in</Label>
                    <PreferenceSelect
                      options={preferenceOptions}
                      value={preferences}
                      onChange={setPreferences}
                    />
                  </div>

                  {/* Budget chips — radio-style, not wrapped in Field */}
                  <div className="flex flex-col gap-2">
                    <Label>Budget range</Label>
                    <BudgetSelect value={budget} onChange={setBudget} />
                  </div>

                  {/* Visit date */}
                  <div className="flex flex-col gap-2">
                    <Label>Preferred visit date (optional)</Label>
                    <DateInput value={date} onChange={(e) => setDate(e.target.value)} />
                  </div>

                  <Field label="Message (optional)">
                    <Textarea
                      name="message"
                      rows={4}
                      placeholder="Any specific questions or requirements you'd like us to know about..."
                    />
                  </Field>

                  <p className="text-xs text-muted-foreground">
                    By submitting this form you agree to be contacted by Vision Infra Developers
                    regarding Vision Amnaya. We will not share your details with third parties.
                  </p>

                  <Button
                    type="submit"
                    variant="accent"
                    size="lg"
                    loading={submitting}
                    className="self-start"
                  >
                    Submit enquiry
                  </Button>
                </form>
              )}
            </Reveal>
          </div>

          {/* Contact details sidebar */}
          <div className="lg:col-span-5">
            <Reveal delay={0.2} className="flex flex-col gap-10">
              <div>
                <Eyebrow>Contact Details</Eyebrow>
                <DisplayHeading as="h2" level={3} className="mt-3">
                  Sales office
                </DisplayHeading>
              </div>

              <Stagger className="flex flex-col gap-8">
                {contactDetails.map((detail) => (
                  <Reveal key={detail.label} as="div" className="flex flex-col gap-1">
                    <p className="text-xs font-medium uppercase tracking-label text-muted-foreground">
                      {detail.label}
                    </p>
                    {"href" in detail ? (
                      <a
                        href={detail.href}
                        className="text-base text-foreground transition-colors hover:text-primary-700"
                      >
                        {detail.value}
                      </a>
                    ) : (
                      <p className="whitespace-pre-line text-base text-foreground">
                        {detail.value}
                      </p>
                    )}
                  </Reveal>
                ))}
              </Stagger>

              {/* Location image */}
              <div className="relative aspect-[4/3] overflow-hidden rounded-card border border-border shadow-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={projectAssets.exterior03}
                  alt="Vision Amnaya — building"
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </Section>
    </>
  );
}
