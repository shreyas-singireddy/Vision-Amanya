/** Enquiries feature — schema + submit hook for the public enquiry form. */

import { z } from "zod";

import { useEnquiryStore } from "@store/enquiry.store";

export const enquirySchema = z.object({
  name: z.string().trim().min(2, "Enter your name"),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z
    .string()
    .trim()
    .regex(/^[+]?[\d\s-]{8,15}$/, "Enter a valid phone number")
    .optional()
    .or(z.literal("")),
  subject: z.string().trim().optional().or(z.literal("")),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
});

export type EnquiryFormValues = z.infer<typeof enquirySchema>;

/** Hook returning the submission status + a typed submit function. */
export function useSubmitEnquiry() {
  const submit = useEnquiryStore((state) => state.submit);
  const status = useEnquiryStore((state) => state.status);
  const lastError = useEnquiryStore((state) => state.lastError);
  const reset = useEnquiryStore((state) => state.reset);

  return { submit, status, lastError, reset };
}
