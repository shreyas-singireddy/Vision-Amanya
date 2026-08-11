/**
 * Client-safe environment configuration.
 *
 * Only `NEXT_PUBLIC_*` variables are readable here — everything this module
 * exposes is bundled into the browser. Never import server-only secrets here.
 * Validation is performed once at module load; failures fail fast in dev and
 * warn in production.
 */

import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url()
    .default("http://localhost:3000")
    .transform((url) => url.replace(/\/+$/, "")),
  NEXT_PUBLIC_API_URL: z
    .string()
    .url()
    .default("http://localhost:8000/api/v1")
    .transform((url) => url.replace(/\/+$/, "")),
  NEXT_PUBLIC_MEDIA_URL: z
    .string()
    .url()
    .optional()
    .transform((url) => url?.replace(/\/+$/, "")),
  NEXT_PUBLIC_APP_NAME: z.string().default("Vision Amnaya"),
  NEXT_PUBLIC_APP_DESCRIPTION: z
    .string()
    .default("Luxury residential residences by Vision Infra Developers, Khajaguda, Hyderabad."),
  NEXT_PUBLIC_SUPPORTED_LOCALES: z
    .string()
    .default("en")
    .transform((value) => value.split(",").map((locale) => locale.trim())),
  NEXT_PUBLIC_DEFAULT_LOCALE: z.string().default("en"),
  NEXT_PUBLIC_ENVIRONMENT: z.enum(["development", "production", "test"]).default("development"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const message = `Invalid environment variables:\n${parsed.error.issues
    .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
    .join("\n")}`;
  if (process.env.NODE_ENV === "production") {
    console.error(message);
    throw new Error(message);
  }
  console.warn(message);
}

/** Validated, typed environment object. */
export const env = parsed.data ?? {
  NEXT_PUBLIC_APP_URL: "http://localhost:3000",
  NEXT_PUBLIC_API_URL: "http://localhost:8000/api/v1",
  NEXT_PUBLIC_MEDIA_URL: undefined as string | undefined,
  NEXT_PUBLIC_APP_NAME: "Vision Amnaya",
  NEXT_PUBLIC_APP_DESCRIPTION: "",
  NEXT_PUBLIC_SUPPORTED_LOCALES: ["en"],
  NEXT_PUBLIC_DEFAULT_LOCALE: "en",
  NEXT_PUBLIC_ENVIRONMENT: "development",
};
