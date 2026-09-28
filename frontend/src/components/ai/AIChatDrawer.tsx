"use client";

/**
 * AIChatDrawer — Production Slide-Over Contextual AI Drawer.
 *
 * Provides a luxury, responsive AI chat interface embedded with page context,
 * citations, recommended units, contextual suggested prompts, and safe action execution.
 */

import React, { useEffect, useRef, useState } from "react";
import { X, Send, Sparkles, Bot, User, ChevronRight, ExternalLink, Calendar, PhoneCall, RefreshCw } from "lucide-react";
import { useAIContext } from "@providers/AIContextProvider";
import { executeAIAction } from "@lib/ai/ai-actions";
import type { AIStructuredResponse, AISuggestedAction } from "@domain/assistant";
import { LeadProfilePanel } from "./LeadProfilePanel";
import { WhatsAppConsentCard } from "./WhatsAppConsentCard";
import { ShortlistTrigger } from "./ShortlistTrigger";
import type { ConversationLeadProfile } from "./LeadProfilePanel";

interface MessageItem {
  id: string;
  role: "user" | "assistant";
  content: string;
  response?: AIStructuredResponse | null;
}

export function AIChatDrawer() {
  const {
    isDrawerOpen,
    closeDrawer,
    activeContext,
    activeConversationId,
    suggestedPrompts,
    sendQuery,
    isLoading,
    pendingPrompt,
    setPendingPrompt,
  } = useAIContext();

  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Greetings. I am Amnaya's AI Sales Consultant. How may I assist your luxury property discovery today?",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [leadProfile, setLeadProfile] = useState<ConversationLeadProfile>({});
  const [leadId, setLeadId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Handle pending initial prompt when opened via contextual CTA
  useEffect(() => {
    if (isDrawerOpen && pendingPrompt) {
      const promptToRun = pendingPrompt;
      setPendingPrompt(null);
      void handleSend(promptToRun);
    }
  }, [isDrawerOpen, pendingPrompt]);

  if (!isDrawerOpen) return null;

  const handleSend = async (customText?: string) => {
    const query = customText || inputMessage.trim();
    if (!query || isLoading) return;

    if (!customText) setInputMessage("");

    const userMsgId = `user-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: userMsgId, role: "user", content: query },
    ]);

    const response = await sendQuery(query);

    const assistantMsgId = `assistant-${Date.now()}`;
    if (response) {
      // Phase 7.5: extract and merge lead qualification context
      // `profile_summary` is the canonical field; fall back to legacy key for safety
      const ctx =
        (response as any).profile_summary ??
        (response as any).lead_qualification_context;
      if (ctx && typeof ctx === "object") {
        setLeadProfile((prev) => ({
          ...prev,
          ...ctx,
          // Merge top-level lead_score and stage if present
          ...(typeof (response as any).lead_score === "number"
            ? { lead_score: (response as any).lead_score }
            : {}),
          ...(typeof (response as any).stage === "string"
            ? { stage: (response as any).stage }
            : {}),
        }));

        // Capture lead_id and conversation_id for WhatsApp features
        if ((response as any).lead_id) {
          setLeadId((response as any).lead_id);
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          id: assistantMsgId,
          role: "assistant",
          content: response.message,
          response,
        },
      ]);
    } else {
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMsgId,
          role: "assistant",
          content: "Amnaya AI is temporarily unavailable. You can still explore residences or speak directly with our sales team.",
        },
      ]);
    }
  };

  const handleActionClick = (action: AISuggestedAction) => {
    executeAIAction(
      {
        type: action.action_type || (action as any).type || "",
        label: action.label,
        payload: action.payload,
      },
      {
        onNavigate: (url) => {
          window.location.href = url;
        },
        onOpenUnit: (unitId) => {
          window.location.href = `/properties/${unitId}`;
        },
        onCompareUnits: (unitIds) => {
          window.location.href = `/residences?compare=${unitIds.join(",")}`;
        },
        onScheduleVisit: (unitId) => {
          handleSend(`I want to schedule a site visit for unit ${unitId || ""}`);
        },
        onRequestHuman: (reason) => {
          handleSend("I would like to speak to a real sales consultant");
        },
      }
    );
  };

  const contextLabel = () => {
    const type = activeContext.page_type || "project";
    if (activeContext.unit_id) return `Unit ${activeContext.unit_id} Context`;
    if (activeContext.residence_id) return `Residence ${activeContext.residence_id} Context`;
    return `${type.toUpperCase()} Context`;
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-neutral-950/70 backdrop-blur-sm transition-opacity duration-300">
      <div className="flex h-full w-full max-w-lg flex-col border-l border-amber-500/20 bg-neutral-950 text-neutral-100 shadow-2xl">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 bg-neutral-900/60 px-5 py-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-amber-600 to-yellow-400 text-neutral-950 shadow-md">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-base font-bold tracking-wide text-neutral-100">
                  Ask Amnaya
                </h3>
                <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] uppercase font-semibold text-amber-400">
                  {contextLabel()}
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Verified Real-Estate AI Assistant
              </p>
            </div>
          </div>
          <button
            onClick={closeDrawer}
            className="rounded-full p-2 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-neutral-100"
            aria-label="Close AI Drawer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Phase 7.5: Lead Profile Panel — shown when 2+ fields collected */}
        <LeadProfilePanel profile={leadProfile} />

        {/* Phase 6: WhatsApp Consent Card — shown when stage is CONTACT_PERMISSION and consent not yet set */}
        {leadProfile.stage === "contact_permission" && leadProfile.whatsapp_consent === undefined && (
          <WhatsAppConsentCard
            profile={leadProfile}
            conversationId={activeConversationId || ""}
            onConsentChange={(granted) => {
              setLeadProfile((prev) => ({ ...prev, whatsapp_consent: granted }));
            }}
          />
        )}

        {/* Phase 6: Shortlist Trigger — shown when consent granted, phone exists, and units selected */}
        {leadProfile.whatsapp_consent === true && leadProfile.interested_units && leadProfile.interested_units.length > 0 && leadId && (
          <ShortlistTrigger
            profile={leadProfile}
            leadId={leadId}
            conversationId={activeConversationId || undefined}
          />
        )}

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-md ${
                  msg.role === "user"
                    ? "bg-amber-600 text-neutral-950 font-medium rounded-tr-none"
                    : "bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-tl-none"
                }`}
              >
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>

                {/* Units Cards */}
                {msg.response?.units && msg.response.units.length > 0 && (
                  <div className="mt-3 space-y-2 border-t border-neutral-800 pt-2">
                    <p className="text-xs font-semibold text-amber-400">Recommended Units:</p>
                    {msg.response.units.map((u: any, idx: number) => (
                      <div
                        key={idx}
                        onClick={() => (window.location.href = `/properties/${u.unit_number || u.id}`)}
                        className="flex cursor-pointer items-center justify-between rounded-lg border border-neutral-800 bg-neutral-950 p-2.5 transition-colors hover:border-amber-500/40"
                      >
                        <div>
                          <p className="text-xs font-bold text-neutral-100">
                            Unit {u.unit_number || u.title || "Residence"}
                          </p>
                          <p className="text-[11px] text-neutral-400">
                            {u.configuration || "Luxury Suite"} • {u.price_formatted || u.carpet_area_sqft ? `${u.carpet_area_sqft} sq ft` : "Lake View"}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-amber-400" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Suggested Actions */}
                {msg.response?.suggested_actions && msg.response.suggested_actions.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5 border-t border-neutral-800 pt-2">
                    {msg.response.suggested_actions.map((act, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleActionClick(act)}
                        className="inline-flex items-center gap-1 rounded-md border border-amber-500/40 bg-neutral-950 px-2.5 py-1 text-[11px] font-semibold text-amber-300 transition-colors hover:bg-amber-500 hover:text-neutral-950"
                      >
                        <span>{act.label}</span>
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Citations */}
                {msg.response?.citations && msg.response.citations.length > 0 && (
                  <div className="mt-2 text-[10px] text-neutral-500">
                    Source: {msg.response.citations[0]?.document_title}
                  </div>
                )}
              </div>

              {msg.role === "user" && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-neutral-300">
                  <User className="h-3.5 w-3.5" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-amber-400/80 italic">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              <span>Amnaya AI is consulting project records...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Contextual Suggested Prompt Chips */}
        <div className="border-t border-neutral-800 bg-neutral-900/40 p-3">
          <p className="mb-2 text-[11px] uppercase tracking-wider font-semibold text-amber-400/80">
            Suggested Prompts
          </p>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
            {suggestedPrompts.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSend(item.prompt)}
                disabled={isLoading}
                className="rounded-full border border-neutral-800 bg-neutral-950 px-3 py-1 text-xs text-neutral-300 transition-all hover:border-amber-500/50 hover:text-amber-300 hover:bg-neutral-900 disabled:opacity-50"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="border-t border-neutral-800 bg-neutral-950 p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={`Ask about ${activeContext.unit_id ? `Unit ${activeContext.unit_id}` : "Amnaya residences, pricing, amenities..."}`}
              disabled={isLoading}
              className="flex-1 rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 focus:border-amber-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-neutral-950 transition-transform hover:scale-105 active:scale-95 disabled:opacity-40"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
