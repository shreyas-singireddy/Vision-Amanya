"use client";

import React, { useState } from "react";
import { Calendar, Clock, CheckCircle2, MapPin } from "lucide-react";

export interface SiteVisitSchedulerProps {
  unitNumber?: string;
  onBookSuccess?: (bookingData: any) => void;
}

export function SiteVisitScheduler({ unitNumber, onBookSuccess }: SiteVisitSchedulerProps) {
  const [selectedDate, setSelectedDate] = useState("2026-08-29");
  const [selectedSlot, setSelectedSlot] = useState("11:30 AM");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [bookingRef, setBookingRef] = useState("");

  const availableSlots = ["10:00 AM", "11:30 AM", "02:00 PM", "04:00 PM"];

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !email || !selectedSlot) return;

    const ref = `AMN-VIS-${Math.floor(1000 + Math.random() * 9000)}`;
    setBookingRef(ref);
    setConfirmed(true);

    onBookSuccess?.({
      bookingRef: ref,
      date: selectedDate,
      timeSlot: selectedSlot,
      unitNumber,
      name,
      phone,
      email,
    });
  };

  if (confirmed) {
    return (
      <div className="my-4 rounded-xl border border-primary-500/30 bg-neutral-900 p-5 text-center shadow-xl">
        <CheckCircle2 className="mx-auto h-10 w-10 text-primary-400" />
        <h4 className="mt-2 font-serif text-xl font-bold text-neutral-100">
          Private Visit Confirmed!
        </h4>
        <p className="mt-1 text-xs text-neutral-300">
          Ref: <span className="font-mono font-bold text-accent-400">{bookingRef}</span> • {selectedDate} at {selectedSlot}
        </p>
        <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-neutral-400">
          <MapPin className="h-3.5 w-3.5 text-accent-400" />
          <span>Amnaya Experience Center, Khajaguda, Hyderabad</span>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleBooking}
      className="my-4 rounded-xl border border-neutral-800 bg-neutral-900/95 p-5 shadow-xl backdrop-blur-md"
    >
      <div className="border-b border-neutral-800 pb-3">
        <span className="text-xs uppercase tracking-wider text-accent-400">
          Schedule Private Visit
        </span>
        <h3 className="font-serif text-lg font-bold text-neutral-100">
          Experience Amnaya {unitNumber && `• Residence ${unitNumber}`}
        </h3>
      </div>

      <div className="mt-4 space-y-4 text-xs">
        {/* Date Selection */}
        <div>
          <label className="block mb-1.5 font-medium text-neutral-300">Select Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-neutral-200 focus:border-accent-500 focus:outline-none"
          />
        </div>

        {/* Real Slot Options */}
        <div>
          <label className="block mb-1.5 font-medium text-neutral-300">Available Time Slots</label>
          <div className="grid grid-cols-2 gap-2">
            {availableSlots.map((slot) => (
              <button
                key={slot}
                type="button"
                className={`rounded-lg border px-3 py-2 text-center font-medium transition ${
                  selectedSlot === slot
                    ? "border-accent-500 bg-accent-500/20 text-accent-300"
                    : "border-neutral-800 bg-neutral-950 text-neutral-300 hover:border-neutral-700"
                }`}
                onClick={() => setSelectedSlot(slot)}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>

        {/* Visitor Details */}
        <div className="space-y-2 pt-2 border-t border-neutral-800">
          <input
            type="text"
            required
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-neutral-200 focus:border-accent-500 focus:outline-none"
          />
          <input
            type="tel"
            required
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-neutral-200 focus:border-accent-500 focus:outline-none"
          />
          <input
            type="email"
            required
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-neutral-200 focus:border-accent-500 focus:outline-none"
          />
        </div>
      </div>

      <button
        type="submit"
        className="mt-4 w-full rounded-lg bg-accent-500 py-2.5 text-xs font-semibold text-neutral-950 transition hover:bg-accent-400"
      >
        Confirm Private Site Visit
      </button>
    </form>
  );
}
