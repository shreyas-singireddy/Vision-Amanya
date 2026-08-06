/** Authentication service — profile/password endpoints on the API client.
 *
 * Login/register/refresh/logout intentionally do NOT live here: those flows
 * go through the BFF route handlers (`/api/auth/*`), which keep the refresh
 * token in an httpOnly cookie. See `src/services/bff-auth.service.ts` and the
 * route handlers under `src/app/api/auth/`.
 */

import { apiEndpoints } from "@constants/api-endpoints";

import { apiClient } from "@api/client";
import type { ApiClient } from "@api/types";

import type {
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  User,
  UserUpdate,
  VerifyEmailRequest,
} from "@domain/auth";

export class AuthService {
  constructor(private readonly http: ApiClient = apiClient) {}

  /** Fetch the current user's profile. */
  async me(): Promise<User> {
    return this.http.get<User>(apiEndpoints.users.me);
  }

  /** Update the current user's profile. */
  async updateMe(payload: UserUpdate): Promise<User> {
    return this.http.patch<User>(apiEndpoints.users.me, payload);
  }

  /** Change the current user's password. */
  async changePassword(payload: ChangePasswordRequest): Promise<User> {
    return this.http.patch<User>(apiEndpoints.users.mePassword, payload, {
      meta: { retry: false },
    });
  }

  async forgotPassword(payload: ForgotPasswordRequest): Promise<{ status: string }> {
    return this.http.post<{ status: string }>(apiEndpoints.auth.forgotPassword, payload, {
      meta: { skipAuthRefresh: true, retry: false },
    });
  }

  async resetPassword(payload: ResetPasswordRequest): Promise<{ email: string }> {
    return this.http.post<{ email: string }>(apiEndpoints.auth.resetPassword, payload, {
      meta: { skipAuthRefresh: true, retry: false },
    });
  }

  async verifyEmail(payload: VerifyEmailRequest): Promise<User> {
    return this.http.post<User>(apiEndpoints.auth.verifyEmail, payload, {
      meta: { skipAuthRefresh: true, retry: false },
    });
  }
}

export const authService = new AuthService();
