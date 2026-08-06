/**
 * API endpoint map — the ONLY place endpoint paths are defined.
 *
 * Services reference `apiEndpoints.auth.login` etc. Never hardcode URL strings
 * inside service/feature code. Endpoint segments are relative to the base URL
 * configured in `@lib/env` (`NEXT_PUBLIC_API_URL` for the browser, `API_URL`
 * for server-side route handlers).
 */

export const apiEndpoints = {
  health: "/health",

  auth: {
    register: "/auth/register",
    login: "/auth/login",
    refresh: "/auth/refresh",
    logout: "/auth/logout",
    verifyEmail: "/auth/verify-email",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
  },

  users: {
    me: "/users/me",
    mePassword: "/users/me/password",
    detail: (id: string) => `/users/${id}`,
  },

  projects: {
    list: "/projects",
    detail: (idOrSlug: string) => `/projects/${idOrSlug}`,
    featured: "/projects/featured",
  },

  properties: {
    list: "/properties",
    detail: (idOrSlug: string) => `/properties/${idOrSlug}`,
    featured: "/properties/featured",
    related: (id: string) => `/properties/${id}/related`,
  },

  favourites: {
    list: "/favorites/me",
    toggle: "/favorites/toggle",
    status: (propertyId: string) => `/favorites/me/status/${propertyId}`,
    count: "/favorites/me/count",
  },

  enquiries: {
    list: "/enquiries",
    create: "/enquiries",
    detail: (id: string) => `/enquiries/${id}`,
  },

  bookings: {
    list: "/bookings",
    create: "/bookings",
    detail: (id: string) => `/bookings/${id}`,
  },

  reviews: {
    list: "/reviews",
    create: "/reviews",
    detail: (id: string) => `/reviews/${id}`,
  },

  assistant: {
    sessions: "/assistant/sessions",
    session: (id: string) => `/assistant/sessions/${id}`,
    messages: (id: string) => `/assistant/sessions/${id}/messages`,
    send: "/assistant/chat",
  },
} as const;

/** BFF (Next.js route handler) endpoints — same-origin paths. */
export const bffEndpoints = {
  auth: {
    session: "/api/auth/session",
    refresh: "/api/auth/refresh",
    logout: "/api/auth/logout",
  },
  health: "/api/health",
} as const;
