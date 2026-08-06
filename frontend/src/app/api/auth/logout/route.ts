import { NextResponse } from "next/server";

import { clearSessionCookie, readSessionCookie } from "@lib/server/cookies";

import { bffLogout } from "@services/bff-auth.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Revoke the refresh token and clear the session cookie. */
export async function POST() {
  const refreshToken = await readSessionCookie();

  // Best-effort server-side revocation; the cookie is always cleared.
  if (refreshToken) {
    await bffLogout(refreshToken);
  }
  await clearSessionCookie();

  return NextResponse.json({ success: true, data: null });
}
