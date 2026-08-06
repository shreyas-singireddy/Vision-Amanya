/** TanStack Query key factory.
 *
 * Centralizes query keys so cache invalidations stay consistent across the app.
 * Always use `queryKeys` instead of inline string arrays.
 */

import type { EnquiryListParams } from "@domain/enquiry";
import type { PropertyListParams } from "@domain/property";
import type { ProjectListParams } from "@domain/project";

export const queryKeys = {
  session: ["session"] as const,
  user: ["user"] as const,

  projects: {
    all: ["projects"] as const,
    list: (params: ProjectListParams) => ["projects", "list", params] as const,
    featured: ["projects", "featured"] as const,
    detail: (idOrSlug: string) => ["projects", "detail", idOrSlug] as const,
  },

  properties: {
    all: ["properties"] as const,
    list: (params: PropertyListParams) => ["properties", "list", params] as const,
    featured: ["properties", "featured"] as const,
    detail: (idOrSlug: string) => ["properties", "detail", idOrSlug] as const,
  },

  favourites: {
    all: ["favourites"] as const,
    ids: ["favourites", "ids"] as const,
    detail: (id: string) => ["favourites", "detail", id] as const,
  },

  enquiries: {
    all: ["enquiries"] as const,
    list: (params: EnquiryListParams) => ["enquiries", "list", params] as const,
    detail: (id: string) => ["enquiries", "detail", id] as const,
  },

  assistant: {
    sessions: ["assistant", "sessions"] as const,
    messages: (sessionId: string) => ["assistant", "messages", sessionId] as const,
  },
} as const;
