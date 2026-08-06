import { NextResponse, type NextRequest } from "next/server";

/** Base security headers applied to every page response.
 *
 * Route-level auth is NOT enforced here: page access is controlled in the
 * layouts/route handlers where the session can be verified properly.
 */
const securityHeaders: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
};

/** HSTS is only meaningful (and safe) over HTTPS. */
const productionHeaders: Record<string, string> = {
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
};

/** Serve `en-US` in the Accept-Language header for localized chrome. */
const DEFAULT_ACCEPT_LANGUAGE = "en-US";

export function proxy(request: NextRequest) {
  const response = NextResponse.next();

  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }
  if (process.env.NODE_ENV === "production") {
    for (const [key, value] of Object.entries(productionHeaders)) {
      response.headers.set(key, value);
    }
  }

  // Expose the original path so server layouts can build accurate redirects.
  response.headers.set("x-pathname", request.nextUrl.pathname);

  const acceptLanguage = request.headers.get("accept-language");
  if (!acceptLanguage) {
    response.headers.set("accept-language", DEFAULT_ACCEPT_LANGUAGE);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Run on every request except:
     * - api (route handlers)
     * - _next/static + _next/image (assets)
     * - public metadata files
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|manifest.webmanifest).*)",
  ],
};
