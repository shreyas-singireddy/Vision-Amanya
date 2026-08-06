import { NextResponse, type NextRequest } from "next/server";

import { setSessionCookie } from "@lib/server/cookies";
import { serverEnv } from "@lib/server/env";

import { bffLogin, type BffAuthError } from "@services/bff-auth.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function errorResponse(error: BffAuthError): NextResponse {
  return NextResponse.json(
    { success: false, message: error.message, error_code: error.errorCode ?? null },
    { status: error.status || 401 }
  );
}

/** Exchange credentials for tokens; stores the refresh token in a cookie. */
export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    email?: unknown;
    password?: unknown;
  } | null;

  if (!body || typeof body.email !== "string" || typeof body.password !== "string") {
    return NextResponse.json(
      { success: false, message: "Email and password are required." },
      { status: 422 }
    );
  }

  const result = await bffLogin({ email: body.email, password: body.password });
  if (!result.ok) return errorResponse(result);

  const { token, user } = result.data;
  await setSessionCookie(token.refresh_token, {
    maxAgeSeconds: serverEnv.SESSION_MAX_AGE_SECONDS,
  });

  return NextResponse.json({
    success: true,
    data: {
      access_token: token.access_token,
      expires_in: token.expires_in,
      token_type: token.token_type,
      user,
    },
  });
}
