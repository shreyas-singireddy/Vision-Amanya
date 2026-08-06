import { NextResponse, type NextRequest } from "next/server";

import { setSessionCookie } from "@lib/server/cookies";
import { serverEnv } from "@lib/server/env";

import { bffRegister, type BffAuthError } from "@services/bff-auth.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function errorResponse(error: BffAuthError): NextResponse {
  return NextResponse.json(
    { success: false, message: error.message, error_code: error.errorCode ?? null },
    { status: error.status || 422 }
  );
}

/** Register a new account; stores the refresh token in a cookie. */
export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    email?: unknown;
    password?: unknown;
    full_name?: unknown;
    phone?: unknown;
  } | null;

  if (
    !body ||
    typeof body.email !== "string" ||
    typeof body.password !== "string" ||
    typeof body.full_name !== "string"
  ) {
    return NextResponse.json(
      { success: false, message: "Name, email and password are required." },
      { status: 422 }
    );
  }

  const result = await bffRegister({
    email: body.email,
    password: body.password,
    full_name: body.full_name,
    phone: typeof body.phone === "string" ? body.phone : undefined,
  });
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
