"use client";

/**
 * ResidenceEnquiryModal — Auto-populated enquiry & site visit modal.
 *
 * Preserves selected unit context (Unit Number, Tower, Floor, Typology, Sq.Ft.)
 * so the user never re-enters unit details. Prepares integration contract for Phase 6.8 CRM.
 */

import { useState } from "react";
import { Check, Calendar, Mail, Phone, User, Warehouse } from "lucide-react";
import type { Residence } from "@domain/residence";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@components/ui/dialog";
import { Button } from "@components/ui/button";
import { LuxuryButton } from "@components/amnaya/luxury-button";

export interface ResidenceEnquiryModalProps {
  residence: Residence;
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: "enquiry" | "visit";
}

export function ResidenceEnquiryModal({
  residence,
  isOpen,
  onClose,
  defaultMode = "enquiry",
}: ResidenceEnquiryModalProps) {
  const [mode, setMode] = useState<"enquiry" | "visit">(defaultMode);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    date: "",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulated API submission payload preserving unit context
    const payload = {
      projectId: "vision-amanya",
      unitId: residence.id,
      unitNumber: residence.unitNumber,
      building: residence.location.building,
      floor: residence.location.floor,
      typology: residence.typology,
      mode,
      ...formData,
    };
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.debug("Submitting enquiry payload:", payload);
    }

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  const handleReset = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg bg-card text-foreground p-6 sm:p-8">
        <DialogHeader className="border-b border-border pb-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent-600 dark:text-accent-400">
            <Warehouse className="h-4 w-4" />
            <span>Unit Context Preserved</span>
          </div>
          <DialogTitle className="font-serif text-2xl mt-1">
            {mode === "visit" ? "Schedule Site Visit" : "Enquire About Residence"}
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            {residence.title} · {residence.typology} · {residence.location.building} Floor{" "}
            {residence.location.floor}
          </p>
        </DialogHeader>

        {submitted ? (
          <div className="py-8 flex flex-col items-center text-center gap-4">
            <div className="h-12 w-12 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center">
              <Check className="h-6 w-6" />
            </div>
            <h4 className="font-serif text-xl font-medium">Inquiry Received</h4>
            <p className="text-xs text-muted-foreground max-w-sm">
              Thank you. Our executive team at Vision Infra Developers will contact you shortly with
              floor plans and availability for {residence.title}.
            </p>
            <Button onClick={handleReset} variant="accent" size="md" className="mt-2">
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4 text-xs">
            {/* Mode Switcher */}
            <div className="grid grid-cols-2 gap-1 rounded-full border border-border p-1 bg-surface-subtle">
              <button
                type="button"
                onClick={() => setMode("enquiry")}
                className={`rounded-full py-1.5 font-medium uppercase tracking-[0.14em] transition-all ${
                  mode === "enquiry"
                    ? "bg-accent-500 text-neutral-950 shadow-sm"
                    : "text-muted-foreground"
                }`}
              >
                General Inquiry
              </button>
              <button
                type="button"
                onClick={() => setMode("visit")}
                className={`rounded-full py-1.5 font-medium uppercase tracking-[0.14em] transition-all ${
                  mode === "visit"
                    ? "bg-accent-500 text-neutral-950 shadow-sm"
                    : "text-muted-foreground"
                }`}
              >
                Schedule Visit
              </button>
            </div>

            {/* Preserved Unit Identity Pill */}
            <div className="rounded-md border border-accent-400/30 bg-accent-500/10 p-3 flex items-center justify-between text-foreground">
              <div>
                <p className="font-semibold">
                  {residence.title} ({residence.typology})
                </p>
                <p className="text-[0.625rem] text-muted-foreground">
                  {residence.superBuiltUpAreaSqft.toLocaleString()} sq.ft. ·{" "}
                  {residence.location.view}
                </p>
              </div>
              <span className="text-[0.625rem] font-bold uppercase tracking-wider text-accent-600 dark:text-accent-400">
                Verified
              </span>
            </div>

            {/* Form Fields */}
            <div>
              <label className="block mb-1 font-medium uppercase tracking-wider text-[0.625rem] text-muted-foreground">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  required
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-md border border-border bg-background pl-9 pr-3 py-2 text-xs focus:border-accent-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-1 font-medium uppercase tracking-wider text-[0.625rem] text-muted-foreground">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded-md border border-border bg-background pl-9 pr-3 py-2 text-xs focus:border-accent-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-medium uppercase tracking-wider text-[0.625rem] text-muted-foreground">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder="name@domain.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-md border border-border bg-background pl-9 pr-3 py-2 text-xs focus:border-accent-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {mode === "visit" && (
              <div>
                <label className="block mb-1 font-medium uppercase tracking-wider text-[0.625rem] text-muted-foreground">
                  Preferred Visit Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="date"
                    required={mode === "visit"}
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full rounded-md border border-border bg-background pl-9 pr-3 py-2 text-xs focus:border-accent-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block mb-1 font-medium uppercase tracking-wider text-[0.625rem] text-muted-foreground">
                Additional Notes or Questions
              </label>
              <textarea
                rows={3}
                placeholder="Specific floor or timing preferences..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full rounded-md border border-border bg-background p-3 text-xs focus:border-accent-500 focus:outline-none"
              />
            </div>

            <LuxuryButton
              type="submit"
              disabled={loading}
              variant="accent"
              size="md"
              className="mt-2 w-full"
            >
              {loading
                ? "Submitting..."
                : mode === "visit"
                  ? "Confirm Site Visit Request"
                  : "Submit Residence Enquiry"}
            </LuxuryButton>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
