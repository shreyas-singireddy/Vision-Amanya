import { NextResponse } from "next/server";

import { clearSessionCookie, readSessionCookie, setSessionCookie } from "@lib/server/cookies";
import { serverEnv } from "@lib/server/env";

import { bffRefresh, type BffAuthError } from "@services/bff-auth.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function errorResponse(error: BffAuthError, status = error.status || 401): NextResponse {
  return NextResponse.json(
    { success: false, message: error.message, error_code: error.errorCode ?? null },
    { status }
  );
}

/** Exchange the httpOnly session cookie for a fresh token pair. */
export async function POST() {
  const refreshToken = await readSessionCookie();
  if (!refreshToken) {
    return NextResponse.json({ success: false, message: "No active session." }, { status: 401 });
  }

  const result = await bffRefresh(refreshToken);
  if (!result.ok) {
    // The refresh token is invalid or revoked — drop the cookie.
    await clearSessionCookie();
    return errorResponse(result);
  }

  const { token } = result.data;
  await setSessionCookie(token.refresh_token, {
    maxAgeSeconds: serverEnv.SESSION_MAX_AGE_SECONDS,
  });

  return NextResponse.json({
    success: true,
    data: {
      access_token: token.access_token,
      expires_in: token.expires_in,
      token_type: token.token_type,
    },
  });
}
