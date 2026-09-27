"use client";

import React, { useState } from "react";
import { User, Phone, Mail, CheckCircle2, Sparkles } from "lucide-react";

export interface LeadCaptureFormProps {
  unitNumber?: string;
  onSuccess?: (leadData: any) => void;
}

export function LeadCaptureForm({ unitNumber, onSuccess }: LeadCaptureFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) return;
    setSubmitted(true);
    onSuccess?.({ name, email, phone, unitNumber });
  };

  if (submitted) {
    return (
      <div className="my-4 rounded-xl border border-primary-500/30 bg-primary-500/10 p-5 text-center shadow-xl">
        <CheckCircle2 className="mx-auto h-8 w-8 text-primary-400" />
        <h4 className="mt-2 font-serif text-lg font-bold text-neutral-100">
          Sales Request Registered
        </h4>
        <p className="mt-1 text-xs text-neutral-300">
          Thank you, {name}. An Amnaya Senior Sales Specialist will connect with you shortly.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="my-4 rounded-xl border border-neutral-800 bg-neutral-900/95 p-5 shadow-xl backdrop-blur-md"
    >
      <div className="mb-4 border-b border-neutral-800 pb-3">
        <span className="text-xs uppercase tracking-wider text-accent-400">
          Amnaya Private Sales Consultation
        </span>
        <h3 className="font-serif text-lg font-bold text-neutral-100">
          Connect with Amnaya Specialist {unitNumber && `• Unit ${unitNumber}`}
        </h3>
      </div>

      <div className="space-y-3 text-xs">
        <div>
          <label className="block mb-1 font-medium text-neutral-300">Full Name</label>

            <input
              type="text"
              required
              placeholder="e.g. Shreyas Singireddy"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-neutral-200 focus:border-accent-500 focus:outline-none"
            />

        </div>

        <div>
          <label className="block mb-1 font-medium text-neutral-300">Email Address</label>

            <input
              type="email"
              required
              placeholder="shreyas@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-neutral-200 focus:border-accent-500 focus:outline-none"
            />

        </div>

        <div>
          <label className="block mb-1 font-medium text-neutral-300">Phone Number</label>

            <input
              type="tel"
              required
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-neutral-200 focus:border-accent-500 focus:outline-none"
            />

        </div>
      </div>

      <button
        type="submit"
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-accent-500 py-2.5 text-xs font-semibold text-neutral-950 transition hover:bg-accent-400"
      >
        <Sparkles className="h-4 w-4" />
        <span>Request Executive Consultation</span>
      </button>
    </form>
  );
}
