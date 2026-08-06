import { NextResponse } from "next/server";

import { readSessionCookie } from "@lib/server/cookies";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Lightweight session probe — true when a session cookie is present. */
export async function GET() {
  const refreshToken = await readSessionCookie();
  return NextResponse.json({
    success: true,
    data: { authenticated: Boolean(refreshToken) },
  });
}
