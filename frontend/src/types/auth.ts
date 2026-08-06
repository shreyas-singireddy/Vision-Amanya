/** Authentication DTOs mirroring `backend/app/schemas/auth.py` + `user.py`. */

import type { ISODateTimeString, UUID } from "./api";
import type { AgentStatus } from "./enums";

/** Payload for `POST /auth/register`. */
export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  phone?: string | null;
}

/** Payload for `POST /auth/login`. */
export interface LoginRequest {
  email: string;
  password: string;
}

/** Payload for `POST /auth/refresh`. */
export interface RefreshRequest {
  refresh_token: string;
}

/** Payload for `POST /auth/logout`. */
export interface LogoutRequest {
  refresh_token?: string | null;
}

/** Payload for `POST /auth/forgot-password`. */
export interface ForgotPasswordRequest {
  email: string;
}

/** Payload for `POST /auth/reset-password`. */
export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

/** Payload for `POST /auth/verify-email`. */
export interface VerifyEmailRequest {
  token: string;
}

/** Token pair returned by authentication endpoints. */
export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
  /** Access token lifetime in seconds. */
  expires_in: number;
}

/** Public agent profile (`AgentProfile`). */
export interface AgentProfile {
  user_id: UUID;
  license_number?: string | null;
  designation?: string | null;
  years_experience?: number | null;
  rating?: number | null;
  is_verified: boolean;
  status: AgentStatus;
}

/** Public user representation (`UserResponse`). */
export interface User {
  id: UUID;
  email: string;
  phone?: string | null;
  full_name: string;
  is_active: boolean;
  is_email_verified: boolean;
  preferred_locale: string;
  timezone: string;
  created_at: ISODateTimeString;
  updated_at: ISODateTimeString;
  roles: string[];
  agent?: AgentProfile | null;
}

/** Envelope returned after successful authentication. */
export interface AuthResponse {
  token: TokenPair;
  user: User;
}

/** Payload for `PATCH /users/me` (self-update). */
export interface UserUpdate {
  full_name?: string;
  phone?: string | null;
  preferred_locale?: string;
  timezone?: string;
}

/** Payload for `PATCH /users/me/password`. */
export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

/** The session cookie value: the opaque refresh token. */
export type SessionCookieValue = string;
