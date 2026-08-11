/** Health check for the Next.js process (used by uptime probes). */

export const runtime = "nodejs";

export async function GET() {
  return Response.json({
    success: true,
    data: { status: "ok", service: "vision-amnaya-web", timestamp: new Date().toISOString() },
  });
}
