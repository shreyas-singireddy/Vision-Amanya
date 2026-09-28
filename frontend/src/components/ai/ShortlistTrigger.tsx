"use client";

/**
 * ShortlistTrigger — Button to send personalized shortlist to WhatsApp.
 *
 * Only rendered when:
 * - Lead has WhatsApp consent (whatsapp_consent=true)
 * - Lead has phone/whatsapp_number
 * - There are interested/recommended units
 *
 * Calls POST /api/v1/leads/{lead_id}/whatsapp/shortlist
 * Idempotent: duplicate clicks return existing delivery status.
 */

import React, { useState } from "react";
import { Send, CheckCircle2, AlertCircle, Loader2, MessageSquare, ExternalLink } from "lucide-react";
import { apiClient } from "@api/client";
import type { ConversationLeadProfile } from "./LeadProfilePanel";

interface ShortlistTriggerProps {
  profile: ConversationLeadProfile;
  leadId: string;
  conversationId?: string;
  className?: string;
  onSuccess?: (result: any) => void;
  onError?: (error: string) => void;
}

export function ShortlistTrigger({
  profile,
  leadId,
  conversationId,
  className = "",
  onSuccess,
  onError,
}: ShortlistTriggerProps) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "failed">("idle");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const hasConsent = profile.whatsapp_consent === true;
  const hasPhone = profile.phone || profile.whatsapp_number;
  const hasUnits = profile.interested_units && profile.interested_units.length > 0;

  const canSend = hasConsent && hasPhone && hasUnits;

  const handleSend = async () => {
    if (!canSend || state === "sending") return;

    setState("sending");
    setError(null);

    try {
      const payload: Record<string, any> = {
        top_n: 3,
      };
      if (conversationId) {
        payload.conversation_id = conversationId;
      }

      const response = await apiClient.post<{ success?: boolean; data?: any; message?: string }>(
        `/api/v1/leads/${leadId}/whatsapp/shortlist`,
        payload
      );

      if (response && (response.success !== false)) {
        setState("sent");
        setResult(response.data || response);
        onSuccess?.(response.data || response);
      } else {
        throw new Error(response?.message || "Failed to send shortlist");
      }
    } catch (err: any) {
      console.error("Shortlist send failed:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to send WhatsApp shortlist";
      setState("failed");
      setError(errorMessage);
      onError?.(errorMessage);
    }
  };

  const handleRetry = () => {
    setState("idle");
    handleSend();
  };

  if (!canSend) {
    // Show disabled state with reason
    let reason = "";
    if (!hasConsent) reason = "WhatsApp consent required";
    else if (!hasPhone) reason = "Phone number required";
    else if (!hasUnits) reason = "Select residences first";

    return (
      <button
        disabled
        className={`amnaya-shortlist-trigger ${className}`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "10px 16px",
          fontSize: "12px",
          fontWeight: 500,
          color: "rgba(255,255,255,0.4)",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "10px",
          cursor: "not-allowed",
        }}
        title={reason}
      >
        <MessageSquare className="h-4 w-4" style={{ opacity: 0.4 }} />
        <span>Send to WhatsApp</span>
        <span
          style={{
            fontSize: "9px",
            padding: "1px 6px",
            background: "rgba(239,83,80,0.2)",
            border: "1px solid rgba(239,83,80,0.3)",
            borderRadius: "999px",
            color: "#ef5350",
          }}
        >
          {reason}
        </span>
      </button>
    );
  }

  if (state === "sent") {
    return (
      <div className={`amnaya-shortlist-trigger ${className}`} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 16px",
            fontSize: "12px",
            fontWeight: 500,
            color: "#64b5f6",
            background: "rgba(100, 181, 246, 0.12)",
            border: "1px solid rgba(100, 181, 246, 0.3)",
            borderRadius: "10px",
          }}
        >
          <CheckCircle2 className="h-4 w-4" />
          <span>Shortlist sent to WhatsApp</span>
          {result?.units_sent && result.units_sent.length > 0 && (
            <span
              style={{
                fontSize: "9px",
                padding: "1px 6px",
                background: "rgba(100,181,246,0.2)",
                border: "1px solid rgba(100,181,246,0.3)",
                borderRadius: "999px",
              }}
            >
              {result.units_sent.length} unit{result.units_sent.length > 1 ? "s" : ""}
            </span>
          )}
        </div>

        <button
          onClick={() => setState("idle")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "6px 12px",
            fontSize: "11px",
            fontWeight: 500,
            color: "rgba(255,255,255,0.6)",
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "8px",
            cursor: "pointer",
            transition: "all 0.2s",
            alignSelf: "flex-start",
          }}
          onMouseOver={(e) => { e.currentTarget.style.color = "#c9a84c"; e.currentTarget.style.borderColor = "rgba(201,168,76,0.4)"; }}
          onMouseOut={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.6)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Send again
        </button>
      </div>
    );
  }

  if (state === "failed") {
    return (
      <div className={`amnaya-shortlist-trigger ${className}`} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 16px",
            fontSize: "12px",
            fontWeight: 500,
            color: "#ef5350",
            background: "rgba(239, 83, 80, 0.12)",
            border: "1px solid rgba(239, 83, 80, 0.3)",
            borderRadius: "10px",
          }}
        >
          <AlertCircle className="h-4 w-4" />
          <span>Failed to send</span>
        </div>

        {error && (
          <div
            style={{
              fontSize: "10px",
              color: "rgba(239,83,80,0.8)",
              padding: "6px 10px",
              background: "rgba(239,83,80,0.1)",
              borderRadius: "6px",
            }}
          >
            {error}
          </div>
        )}

        <button
          onClick={handleRetry}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 14px",
            fontSize: "12px",
            fontWeight: 600,
            color: "#1a1a2e",
            background: "linear-gradient(135deg, #c9a84c, #e8c56d)",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            alignSelf: "flex-start",
            transition: "transform 0.15s",
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <Loader2 className="h-3.5 w-3.5" />
          Retry
        </button>
      </div>
    );
  }

  // Idle state - ready to send
  return (
    <button
      onClick={handleSend}
      disabled={state === "sending"}
      className={`amnaya-shortlist-trigger ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        padding: "12px 20px",
        fontSize: "13px",
        fontWeight: 600,
        color: "#1a1a2e",
        background: "linear-gradient(135deg, #c9a84c, #e8c56d)",
        border: "none",
        borderRadius: "10px",
        cursor: state === "sending" ? "not-allowed" : "pointer",
        transition: "all 0.2s ease",
        boxShadow: "0 4px 14px rgba(201, 168, 76, 0.3)",
        opacity: state === "sending" ? 0.7 : 1,
        transform: state === "sending" ? "none" : undefined,
      }}
      onMouseOver={(e) => {
        if (state !== "sending") {
          e.currentTarget.style.boxShadow = "0 6px 20px rgba(201, 168, 76, 0.4)";
          e.currentTarget.style.transform = "translateY(-1px)";
        }
      }}
      onMouseOut={(e) => {
        if (state !== "sending") {
          e.currentTarget.style.boxShadow = "0 4px 14px rgba(201, 168, 76, 0.3)";
          e.currentTarget.style.transform = "translateY(0)";
        }
      }}
      onMouseDown={(e) => { if (state !== "sending") e.currentTarget.style.transform = "scale(0.98)"; }}
      onMouseUp={(e) => { if (state !== "sending") e.currentTarget.style.transform = "translateY(-1px)"; }}
    >
      {state === "sending" && <Loader2 className="h-4 w-4 animate-spin" />}
      {state !== "sending" && <MessageSquare className="h-4 w-4" />}
      <span>{state === "sending" ? "Sending..." : "Send Shortlist to WhatsApp"}</span>
    </button>
  );
}