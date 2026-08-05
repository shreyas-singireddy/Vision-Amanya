"""Security-header middleware.

Applies a conservative set of security headers to every response:

* ``X-Content-Type-Options: nosniff``
* ``X-Frame-Options: DENY``
* ``X-XSS-Protection: 1; mode=block``
* ``Referrer-Policy: strict-origin-when-cross-origin``
* ``Permissions-Policy`` (disables camera, geolocation, microphone)
* ``Content-Security-Policy`` (default-deny; frontends are separate origins)
* ``Strict-Transport-Security`` only in production (HTTPS already enforced)
"""

from __future__ import annotations

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from app.core.config import get_settings

_settings = get_settings()

_CSP = "default-src 'none'; frame-ancestors 'none'"
_PERMISSIONS_POLICY = (
    "camera=(), geolocation=(), microphone=(), payment=(), usb=()"
)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Attach security headers to all responses."""

    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = _PERMISSIONS_POLICY
        response.headers["Content-Security-Policy"] = _CSP
        if _settings.is_production:
            response.headers["Strict-Transport-Security"] = (
                "max-age=63072000; includeSubDomains"
            )
        return response
