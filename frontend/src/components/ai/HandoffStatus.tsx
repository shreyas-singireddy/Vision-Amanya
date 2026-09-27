"use client";

import React from "react";
import { UserCheck, Clock, CheckCircle2, XCircle, AlertCircle, RefreshCw } from "lucide-react";

export type HandoffStatusType =
  | "REQUESTED"
  | "QUEUED"
  | "ASSIGNED"
  | "ACCEPTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export interface HandoffStatusProps {
  status: HandoffStatusType;
  assignedConsultant?: {
    name?: string;
    title?: string;
    phone?: string;
  };
  estimatedWaitMinutes?: number;
  onRefresh?: () => void;
  onCancel?: () => void;
}

export function HandoffStatus({
  status,
  assignedConsultant,
  estimatedWaitMinutes = 3,
  onRefresh,
  onCancel,
}: HandoffStatusProps) {
  const getStatusBadge = () => {
    switch (status) {
      case "ACCEPTED":
      case "IN_PROGRESS":
        return {
          bg: "bg-emerald-950/40 border-emerald-800/60 text-emerald-300",
          icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
          title: "Connected with Sales Consultant",
          desc: assignedConsultant?.name
            ? `${assignedConsultant.name} (${assignedConsultant.title || "Sales Consultant"}) is now attending to your conversation.`
            : "An Amnaya sales consultant has accepted your handoff request.",
        };
      case "ASSIGNED":
        return {
          bg: "bg-amber-950/40 border-amber-800/60 text-amber-300",
          icon: <UserCheck className="h-4 w-4 text-amber-400" />,
          title: "Sales Consultant Assigned",
          desc: assignedConsultant?.name
            ? `${assignedConsultant.name} has been assigned to your consultation.`
            : "A consultant has been assigned and is joining shortly.",
        };
      case "REQUESTED":
      case "QUEUED":
        return {
          bg: "bg-blue-950/40 border-blue-800/60 text-blue-300",
          icon: <Clock className="h-4 w-4 text-blue-400 animate-pulse" />,
          title: "Request Queued in Sales System",
          desc: `Estimated wait time: ~${estimatedWaitMinutes} minute${estimatedWaitMinutes > 1 ? "s" : ""}. Your preferences have been securely forwarded.`,
        };
      case "COMPLETED":
        return {
          bg: "bg-neutral-900 border-neutral-700 text-neutral-300",
          icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
          title: "Consultation Completed",
          desc: "Your session with the sales consultant has concluded. Thank you for exploring Vision Amnaya.",
        };
      case "CANCELLED":
        return {
          bg: "bg-red-950/40 border-red-800/60 text-red-300",
          icon: <XCircle className="h-4 w-4 text-red-400" />,
          title: "Handoff Cancelled",
          desc: "The sales handoff request was cancelled. You can continue interacting with the AI Assistant.",
        };
      default:
        return {
          bg: "bg-neutral-900 border-neutral-800 text-neutral-300",
          icon: <AlertCircle className="h-4 w-4 text-neutral-400" />,
          title: "Handoff Status",
          desc: `Current status: ${status}`,
        };
    }
  };

  const current = getStatusBadge();

  return (
    <div className={`my-3 rounded-xl border p-4 backdrop-blur-md shadow-lg transition ${current.bg}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">{current.icon}</div>
          <div>
            <h4 className="font-serif text-sm font-bold text-neutral-100">
              {current.title}
            </h4>
            <p className="mt-0.5 text-xs text-neutral-300">{current.desc}</p>

            {(status === "REQUESTED" || status === "QUEUED" || status === "ASSIGNED") && (
              <p className="mt-2 text-[11px] italic text-neutral-400">
                You're connected with the Amnaya sales team. Your conversation context has been shared so you won't need to repeat your preferences.
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="rounded-lg p-1.5 text-neutral-400 transition hover:bg-neutral-800 hover:text-neutral-200"
              title="Refresh status"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          )}

          {onCancel && (status === "REQUESTED" || status === "QUEUED" || status === "ASSIGNED") && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded border border-neutral-700 px-2 py-1 text-[10px] font-medium text-neutral-300 hover:bg-neutral-800"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
