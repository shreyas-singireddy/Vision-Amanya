/** Reusable Zod validators shared by forms (react-hook-form resolvers). */

import { z } from "zod";

/** Indian + international phone, loosely validated. */
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^[+]?[0-9]{8,15}$/, "Enter a valid phone number")
  .or(z.literal(""))
  .optional();

export const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required")
  .email("Enter a valid email address");

/** Password policy mirrors the backend (min 8, max 128). */
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be at most 128 characters");

/** Standard login credentials schema. */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

/** Standard registration schema. */
export const registerSchema = z.object({
  full_name: z.string().trim().min(1, "Full name is required").max(150),
  email: emailSchema,
  phone: phoneSchema,
  password: passwordSchema,
});

/** Enquiry form schema (lead capture). */
export const enquirySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(150),
  email: emailSchema,
  phone: phoneSchema,
  subject: z.string().trim().max(200).optional(),
  message: z.string().trim().max(5000).optional(),
});

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
export type EnquiryValues = z.infer<typeof enquirySchema>;
