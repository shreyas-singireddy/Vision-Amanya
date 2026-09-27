"use client";

import React, { useState } from "react";
import {
  User,
  Phone,
  Mail,
  Home,
  CheckCircle2,
  Clock,
  Compass,
  DollarSign,
  Calendar,
  MessageSquare,
  Sparkles,
  UserCheck,
} from "lucide-react";

export interface HandoffQueueItem {
  handoff_id: string;
  conversation_id: string;
  lead_id?: string;
  status: string;
  reason: string;
  created_at: string;
  assigned_consultant?: {
    id: string;
    name: string;
  };
  summary?: {
    lead_name?: string;
    lead_contact?: string;
    intent?: string;
    configuration?: string;
    budget?: string;
    preferred_view?: string;
    preferred_floor?: string;
    interested_units?: string[];
    compared_units?: string[];
    financial_context?: string;
    site_visit_context?: string;
    visitor_request?: string;
    last_user_message?: string;
    handoff_reason?: string;
  };
}

export interface SalesConversationPanelProps {
  queue: HandoffQueueItem[];
  onAccept?: (handoffId: string) => Promise<void> | void;
  onComplete?: (handoffId: string, notes?: string) => Promise<void> | void;
  onSelectHandoff?: (handoff: HandoffQueueItem) => void;
}

export function SalesConversationPanel({
  queue,
  onAccept,
  onComplete,
  onSelectHandoff,
}: SalesConversationPanelProps) {
  const [selectedId, setSelectedId] = useState<string | null>(
    queue.length > 0 ? queue[0]?.handoff_id ?? null : null
  );

  const selectedItem: HandoffQueueItem | undefined =
    queue.find((item) => item.handoff_id === selectedId) || queue[0];

  return (
    <div className="my-6 rounded-xl border border-neutral-800 bg-neutral-950 p-5 shadow-2xl backdrop-blur-md">
      <div className="mb-4 flex items-center justify-between border-b border-neutral-800 pb-3">
        <div>
          <span className="text-xs uppercase tracking-wider text-amber-400 font-semibold">
            Sales Consultant Dashboard
          </span>
          <h2 className="font-serif text-xl font-bold text-neutral-100">
            Active Handoff Queue ({queue.length})
          </h2>
        </div>
      </div>

      {queue.length === 0 ? (
        <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-8 text-center">
          <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-400" />
          <h4 className="mt-2 font-serif text-base font-bold text-neutral-200">
            No Pending Handoff Requests
          </h4>
          <p className="mt-1 text-xs text-neutral-400">
            All visitor escalation requests have been attended to by sales specialists.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Queue Sidebar */}
          <div className="space-y-3 lg:col-span-1">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Incoming Handoffs
            </h4>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {queue.map((item) => {
                const isSelected = item.handoff_id === selectedItem?.handoff_id;
                return (
                  <button
                    key={item.handoff_id}
                    type="button"
                    onClick={() => {
                      setSelectedId(item.handoff_id);
                      onSelectHandoff?.(item);
                    }}
                    className={`w-full text-left rounded-lg p-3 border transition ${
                      isSelected
                        ? "border-amber-500/60 bg-amber-950/20 text-neutral-100 shadow-md"
                        : "border-neutral-800 bg-neutral-900/60 text-neutral-300 hover:border-neutral-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-xs font-serif text-amber-300">
                        {item.summary?.lead_name || "Visitor"}
                      </span>
                      <span className="rounded bg-neutral-800 px-1.5 py-0.5 text-[10px] text-neutral-300 font-mono">
                        {item.status}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-1 text-[11px] text-neutral-400">
                      Reason: {item.reason.replace(/_/g, " ")}
                    </p>
                    <p className="mt-1 line-clamp-1 text-[11px] text-neutral-300 italic">
                      "{item.summary?.last_user_message || item.summary?.visitor_request || "Escalation requested"}"
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detailed Summary View */}
          {selectedItem && (
            <div className="space-y-4 lg:col-span-2 rounded-xl border border-neutral-800 bg-neutral-900/80 p-5 backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-wider text-amber-400">
                      Handoff Context Summary
                    </span>
                    <span className="rounded bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 text-[10px] text-amber-300 font-mono">
                      ID: {selectedItem.handoff_id.slice(0, 8)}...
                    </span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-neutral-100 mt-1">
                    {selectedItem.summary?.lead_name || "Visitor"}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  {selectedItem.status !== "ACCEPTED" && selectedItem.status !== "COMPLETED" && (
                    <button
                      type="button"
                      onClick={() => onAccept?.(selectedItem.handoff_id)}
                      className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-neutral-950 hover:bg-amber-400 transition"
                    >
                      <UserCheck className="h-3.5 w-3.5" />
                      <span>Accept Handoff</span>
                    </button>
                  )}

                  {selectedItem.status !== "COMPLETED" && (
                    <button
                      type="button"
                      onClick={() => onComplete?.(selectedItem.handoff_id)}
                      className="flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-950/40 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-900/50 transition"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Mark Complete</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Grid Context Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg border border-neutral-800 bg-neutral-950/60 p-3">
                  <span className="text-[10px] uppercase font-semibold text-neutral-400 block mb-1">
                    Configuration & Budget
                  </span>
                  <div className="space-y-1 text-neutral-200">
                    <p>Typology: <strong className="text-amber-300">{selectedItem.summary?.configuration || "3 BHK"}</strong></p>
                    <p>Budget: <strong className="text-amber-300">{selectedItem.summary?.budget || "Up to ₹3 Cr"}</strong></p>
                    {selectedItem.summary?.preferred_view && (
                      <p>Preferred View: {selectedItem.summary.preferred_view}</p>
                    )}
                    {selectedItem.summary?.preferred_floor && (
                      <p>Preferred Floor: {selectedItem.summary.preferred_floor}</p>
                    )}
                  </div>
                </div>

                <div className="rounded-lg border border-neutral-800 bg-neutral-950/60 p-3">
                  <span className="text-[10px] uppercase font-semibold text-neutral-400 block mb-1">
                    Interested Units & Comparisons
                  </span>
                  <div className="space-y-1 text-neutral-200">
                    <p>Interested Units: <strong className="text-amber-300">{(selectedItem.summary?.interested_units || ["1804"]).join(", ")}</strong></p>
                    {selectedItem.summary?.compared_units && selectedItem.summary.compared_units.length > 0 && (
                      <p>Compared Units: {selectedItem.summary.compared_units.join(" vs ")}</p>
                    )}
                  </div>
                </div>

                {selectedItem.summary?.financial_context && (
                  <div className="rounded-lg border border-neutral-800 bg-neutral-950/60 p-3 sm:col-span-2">
                    <span className="text-[10px] uppercase font-semibold text-neutral-400 block mb-1">
                      Financial Calculation Context
                    </span>
                    <p className="text-neutral-300">{selectedItem.summary.financial_context}</p>
                  </div>
                )}

                {selectedItem.summary?.site_visit_context && (
                  <div className="rounded-lg border border-neutral-800 bg-neutral-950/60 p-3 sm:col-span-2">
                    <span className="text-[10px] uppercase font-semibold text-neutral-400 block mb-1">
                      Site Visit Context
                    </span>
                    <p className="text-neutral-300">{selectedItem.summary.site_visit_context}</p>
                  </div>
                )}
              </div>

              {/* Handoff Reason & Last User Query */}
              <div className="rounded-lg border border-amber-500/20 bg-amber-950/10 p-3 text-xs">
                <span className="text-[10px] uppercase font-semibold text-amber-400 block mb-1">
                  Escalation Trigger & Visitor Request
                </span>
                <p className="text-neutral-200 font-medium">
                  Reason: {selectedItem.summary?.handoff_reason || selectedItem.reason}
                </p>
                <p className="mt-1 text-neutral-300 italic">
                  Last Query: "{selectedItem.summary?.last_user_message || selectedItem.summary?.visitor_request || "N/A"}"
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
