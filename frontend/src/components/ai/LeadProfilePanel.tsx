"use client";

/**
 * LeadProfilePanel — Phase 7.5 Progressive Profile Display
 *
 * Subtle preference widget rendered inside AIChatDrawer when at least
 * 2 profile fields are known from the conversation. Shows only what has
 * been collected — never prompts the user for input (this is AI-driven).
 *
 * Displayed as: "3 BHK  ·  ₹2.5–3 Cr  ·  Lake view  ·  Higher floor"
 */

import React, { useEffect, useState } from "react";

export interface ConversationLeadProfile {
  name?: string;
  phone?: string;
  email?: string;
  whatsapp_number?: string;
  whatsapp_consent?: boolean;
  location?: string;
  purpose?: string;
  configuration?: string;
  budget?: string;
  view?: string;
  floor?: string;
  timeline?: string;
  interested_units?: string[];
  stage?: string;
  lead_score?: number;
}

interface LeadProfilePanelProps {
  profile: ConversationLeadProfile;
  className?: string;
}

/** Minimum number of fields required before showing the panel */
const MIN_FIELDS = 2;

function countFilledFields(p: ConversationLeadProfile): number {
  return [p.configuration, p.budget, p.view, p.floor, p.location, p.purpose, p.timeline]
    .filter(Boolean).length;
}

export function LeadProfilePanel({ profile, className = "" }: LeadProfilePanelProps) {
  const [visible, setVisible] = useState(false);

  const fieldCount = countFilledFields(profile);

  useEffect(() => {
    if (fieldCount >= MIN_FIELDS) {
      // Slight delay so animation feels intentional
      const t = setTimeout(() => setVisible(true), 200);
      return () => clearTimeout(t);
    } else {
      setVisible(false);
    }
  }, [fieldCount]);

  if (!visible) return null;

  // Build the tag pills
  const pills: { label: string; icon: string }[] = [];
  if (profile.configuration) pills.push({ label: profile.configuration, icon: "🏠" });
  if (profile.budget)        pills.push({ label: profile.budget, icon: "₹" });
  if (profile.view)          pills.push({ label: profile.view, icon: "🌊" });
  if (profile.floor)         pills.push({ label: profile.floor, icon: "⬆️" });
  if (profile.location)      pills.push({ label: profile.location, icon: "📍" });
  if (profile.purpose)       pills.push({ label: profile.purpose.replace(/_/g, " "), icon: "🎯" });
  if (profile.timeline)      pills.push({ label: profile.timeline, icon: "📅" });

  const score = profile.lead_score ?? 0;
  const temperature = score > 80 ? "high_intent" : score > 60 ? "hot" : score > 30 ? "warm" : "cold";
  const tempColors: Record<string, string> = {
    cold: "#64b5f6",
    warm: "#ffb74d",
    hot: "#ef5350",
    high_intent: "#c9a84c",
  };

  return (
    <div
      id="lead-profile-panel"
      className={`amnaya-lead-profile-panel ${className}`}
      style={{
        margin: "0 16px 12px",
        padding: "12px 14px",
        background: "rgba(26, 26, 46, 0.6)",
        border: "1px solid rgba(201, 168, 76, 0.25)",
        borderRadius: "10px",
        backdropFilter: "blur(10px)",
        animation: "fadeSlideUp 0.35s ease-out forwards",
        opacity: 0,
      }}
      aria-label="Your conversation preferences so far"
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "8px",
        }}
      >
        <span
          style={{
            fontSize: "10px",
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "rgba(201, 168, 76, 0.7)",
          }}
        >
          Your preferences
        </span>
        {score > 0 && (
          <span
            style={{
              fontSize: "10px",
              fontWeight: 600,
              color: tempColors[temperature],
              background: `${tempColors[temperature]}18`,
              padding: "2px 8px",
              borderRadius: "999px",
              border: `1px solid ${tempColors[temperature]}40`,
            }}
          >
            {temperature.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
          </span>
        )}
      </div>

      {/* Preference pills */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
        {pills.map((pill, i) => (
          <span
            key={i}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "11px",
              fontWeight: 500,
              color: "rgba(255,255,255,0.85)",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "6px",
              padding: "3px 8px",
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ fontSize: "10px" }}>{pill.icon}</span>
            {pill.label}
          </span>
        ))}
      </div>

      {/* Interested units */}
      {profile.interested_units && profile.interested_units.length > 0 && (
        <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "10px", color: "rgba(201,168,76,0.6)", fontWeight: 600 }}>
            Shortlisted:
          </span>
          {profile.interested_units.map((u) => (
            <span
              key={u}
              style={{
                fontSize: "10px",
                fontWeight: 700,
                color: "#c9a84c",
                background: "rgba(201,168,76,0.1)",
                border: "1px solid rgba(201,168,76,0.3)",
                padding: "2px 7px",
                borderRadius: "5px",
              }}
            >
              {u}
            </span>
          ))}
        </div>
      )}

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
