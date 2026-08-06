/** Enquiry store — submission status for public enquiry forms. */

import { create } from "zustand";

import { enquiryService } from "@services/enquiry.service";

import type { Enquiry, EnquiryCreate } from "@domain/enquiry";

type EnquiryStatus = "idle" | "submitting" | "success" | "error";

interface EnquiryState {
  status: EnquiryStatus;
  lastError: string | null;
  /** The last enquiry submitted (for success screens). */
  lastEnquiry: Enquiry | null;

  /** Submit a public enquiry; resolves with the created enquiry. */
  submit: (payload: EnquiryCreate) => Promise<Enquiry>;
  reset: () => void;
}

export const useEnquiryStore = create<EnquiryState>()((set) => ({
  status: "idle",
  lastError: null,
  lastEnquiry: null,

  submit: async (payload) => {
    set({ status: "submitting", lastError: null });
    try {
      const enquiry = await enquiryService.create(payload);
      set({ status: "success", lastEnquiry: enquiry });
      return enquiry;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong. Please try again.";
      set({ status: "error", lastError: message });
      throw error;
    }
  },

  reset: () => set({ status: "idle", lastError: null, lastEnquiry: null }),
}));
