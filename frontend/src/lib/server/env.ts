/**
 * Server-only environment configuration.
 *
 * Importing this module from a Client Component throws at build time (the
 * `server-only` package guarantees it). It exposes the backend URL used by the
 * BFF route handlers and the session-cookie settings.
 */

import "server-only";

import { z } from "zod";

const serverEnvSchema = z.object({
  /** Base URL the Next.js route handlers proxy to (FastAPI). */
  API_URL: z
    .string()
    .url()
    .default("http://localhost:8000/api/v1")
    .transform((url) => url.replace(/\/+$/, "")),
  SESSION_COOKIE_NAME: z.string().default("va_session"),
  SESSION_COOKIE_SECURE: z
    .string()
    .default("false")
    .transform((value) => value === "true"),
  SESSION_COOKIE_DOMAIN: z.string().optional().default(""),
  SESSION_MAX_AGE_SECONDS: z.coerce.number().default(2592000),
});

const parsed = serverEnvSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(
    `Invalid server environment variables:\n${parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n")}`
  );
}

/** Validated, typed server environment object (server only). */
export const serverEnv = parsed.data;
