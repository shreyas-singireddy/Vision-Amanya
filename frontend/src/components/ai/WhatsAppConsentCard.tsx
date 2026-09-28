"use client";

/**
 * WhatsAppConsentCard — Explicit WhatsApp consent collection UI.
 *
 * Rendered when AI reaches CONTACT_PERMISSION stage and whatsapp_consent is not yet set.
 * User must explicitly opt-in or decline. Backend enforces consent — frontend never
 * sends consent=true without explicit user action.
 */

import React, { useState } from "react";
import { CheckCircle2, XCircle, MessageSquare, Shield, Loader2 } from "lucide-react";
import { assistantService } from "@services/assistant.service";
import { useAIContext } from "@providers/AIContextProvider";
import type { ConversationLeadProfile } from "./LeadProfilePanel";

interface WhatsAppConsentCardProps {
  profile: ConversationLeadProfile;
  conversationId: string;
  onConsentChange?: (consent: boolean) => void;
  className?: string;
}

const CONSENT_TEXT = `By selecting "Yes, send via WhatsApp", you consent to receiving personalized property recommendations, project updates, and sales communications from Amnaya by Vision Infra via WhatsApp. You can opt out at any time by replying STOP. Standard messaging rates may apply.`;

export function WhatsAppConsentCard({
  profile,
  conversationId,
  onConsentChange,
  className = "",
}: WhatsAppConsentCardProps) {
  const [consentState, setConsentState] = useState<"pending" | "granted" | "declined" | "submitting">("pending");
  const [error, setError] = useState<string | null>(null);
  const { activeConversationId } = useAIContext();

  const handleConsent = async (granted: boolean) => {
    if (consentState !== "pending") return;

    setConsentState("submitting");
    setError(null);

    try {
      const cid = conversationId || activeConversationId;
      if (!cid) {
        throw new Error("No active conversation");
      }

      // Call backend to record consent
      await assistantService.captureLead({
        conversation_id: cid,
        full_name: profile.name || "Amnaya Visitor",
        phone: profile.phone || "",
        email: profile.email || undefined,
        notes: `WhatsApp consent: ${granted ? "granted" : "declined"}`,
      });

      setConsentState(granted ? "granted" : "declined");
      onConsentChange?.(granted);
    } catch (err) {
      console.error("Failed to record WhatsApp consent:", err);
      setError("Failed to save your preference. Please try again.");
      setConsentState("pending");
    }
  };

  if (consentState === "granted") {
    return (
      <div
        className={`amnaya-whatsapp-consent-card ${className}`}
        style={{
          margin: "12px 16px",
          padding: "14px 16px",
          background: "rgba(100, 181, 246, 0.12)",
          border: "1px solid rgba(100, 181, 246, 0.3)",
          borderRadius: "10px",
          animation: "fadeSlideUp 0.3s ease-out forwards",
        }}
        aria-live="polite"
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
          <CheckCircle2 className="h-5 w-5 text-[#64b5f6]" style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: "13px", fontWeight: 600, color: "#e8e8e8", margin: "0 0 4px" }}>
              WhatsApp updates enabled
            </p>
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", margin: 0 }}>
              You'll receive personalized shortlists and updates via WhatsApp.
            </p>
          </div>
        </div>
        <style>{`@keyframes fadeSlideUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      </div>
    );
  }

  if (consentState === "declined") {
    return (
      <div
        className={`amnaya-whatsapp-consent-card ${className}`}
        style={{
          margin: "12px 16px",
          padding: "14px 16px",
          background: "rgba(239, 83, 80, 0.12)",
          border: "1px solid rgba(239, 83, 80, 0.3)",
          borderRadius: "10px",
          animation: "fadeSlideUp 0.3s ease-out forwards",
        }}
        aria-live="polite"
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
          <XCircle className="h-5 w-5 text-[#ef5350]" style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: "13px", fontWeight: 600, color: "#e8e8e8", margin: "0 0 4px" }}>
              WhatsApp updates declined
            </p>
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", margin: 0 }}>
              You can enable WhatsApp updates anytime by asking "Send me the shortlist on WhatsApp".
            </p>
          </div>
        </div>
        <style>{`@keyframes fadeSlideUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      </div>
    );
  }

  return (
    <div
      className={`amnaya-whatsapp-consent-card ${className}`}
      style={{
        margin: "12px 16px",
        padding: "16px",
        background: "rgba(201, 168, 76, 0.1)",
        border: "1px solid rgba(201, 168, 76, 0.35)",
        borderRadius: "12px",
        animation: "fadeSlideUp 0.35s ease-out forwards",
      }}
      role="dialog"
      aria-label="WhatsApp consent request"
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "12px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 36,
            height: 36,
            borderRadius: "10px",
            background: "rgba(201, 168, 76, 0.15)",
            border: "1px solid rgba(201, 168, 76, 0.3)",
            flexShrink: 0,
          }}
        >
          <MessageSquare className="h-5 w-5 text-[#c9a84c]" />
        </div>
        <div style={{ flex: 1 }}>
          <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#fff", margin: "0 0 6px" }}>
            Receive shortlist on WhatsApp?
          </h4>
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", lineHeight: 1.5, margin: 0 }}>
            We'll send your personalized residence recommendations directly to WhatsApp — including
            unit details, pricing, availability, and direct links to explore further.
          </p>
        </div>
      </div>

      <div
        style={{
          fontSize: "10px",
          color: "rgba(255,255,255,0.5)",
          lineHeight: 1.5,
          padding: "10px 12px",
          background: "rgba(0,0,0,0.2)",
          borderRadius: "8px",
          marginBottom: "14px",
          border: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <Shield className="h-3.5 w-3.5 inline-block mr-1.5 align-middle" style={{ verticalAlign: "middle" }} />
        {CONSENT_TEXT}
      </div>

      {error && (
        <div
          style={{
            fontSize: "11px",
            color: "#ef5350",
            background: "rgba(239, 83, 80, 0.15)",
            border: "1px solid rgba(239, 83, 80, 0.3)",
            borderRadius: "8px",
            padding: "8px 12px",
            marginBottom: "12px",
          }}
          role="alert"
        >
          {error}
        </div>
      )}

      <div style={{ display: "flex", gap: "10px" }}>
        <button
          onClick={() => handleConsent(true)}
          disabled={consentState === "submitting"}
          style={{
            flex: 1,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            padding: "12px 16px",
            fontSize: "13px",
            fontWeight: 600,
            color: "#1a1a2e",
            background: consentState === "submitting" ? "rgba(201,168,76,0.5)" : "linear-gradient(135deg, #c9a84c, #e8c56d)",
            border: "none",
            borderRadius: "10px",
            cursor: consentState === "submitting" ? "not-allowed" : "pointer",
            transition: "all 0.2s ease",
            opacity: consentState === "submitting" ? 0.7 : 1,
          }}
          aria-busy={consentState === "submitting"}
        >
          {consentState === "submitting" && <Loader2 className="h-4 w-4 animate-spin" />}
          <CheckCircle2 className="h-4 w-4" />
          Yes, send via WhatsApp
        </button>

        <button
          onClick={() => handleConsent(false)}
          disabled={consentState === "submitting"}
          style={{
            flex: 1,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            padding: "12px 16px",
            fontSize: "13px",
            fontWeight: 500,
            color: "rgba(255,255,255,0.8)",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "10px",
            cursor: consentState === "submitting" ? "not-allowed" : "pointer",
            transition: "all 0.2s ease",
            opacity: consentState === "submitting" ? 0.7 : 1,
          }}
        >
          <XCircle className="h-4 w-4" />
          No, thanks
        </button>
      </div>

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}