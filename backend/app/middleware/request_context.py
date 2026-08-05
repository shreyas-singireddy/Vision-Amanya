"""Request-context middleware: correlation IDs + structured request logging.

Responsibilities:

* Generate (or honour an incoming ``X-Request-ID`` header) a request ID and
  publish it into the context variable so exception handlers, response
  envelopes, audit records and log lines share one correlation key.
* Record method, path, status, duration, client IP, user agent and (when
  available) the authenticated user, emitting one structured log line per
  request.
* Echo the request ID back on the ``X-Request-ID`` response header.
"""

from __future__ import annotations

import logging
import re
import time

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from app.core.request_context import (
    generate_request_id,
    reset_request_id,
    set_request_id,
)

logger = logging.getLogger("app.request")

# Inbound X-Request-ID values are honoured only when they look like our own
# generated ids (short, URL-safe); anything else is replaced. This prevents
# clients from poisoning log correlation or injecting unbounded values.
_REQUEST_ID_RE = re.compile(r"^[A-Za-z0-9_-]{1,64}$")


class RequestContextMiddleware(BaseHTTPMiddleware):
    """Assign a request ID and log request/response telemetry."""

    async def dispatch(self, request: Request, call_next) -> Response:
        incoming = request.headers.get("X-Request-ID")
        request_id = (
            incoming if incoming and _REQUEST_ID_RE.match(incoming) else generate_request_id()
        )
        token = set_request_id(request_id)
        start = time.perf_counter()
        client_ip = request.client.host if request.client else "unknown"

        user_id: str | None = None
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            try:
                from jose import JWTError

                from app.core.security import decode_access_token

                try:
                    payload = decode_access_token(auth_header[7:])
                    user_id = payload.get("sub")
                except JWTError:
                    pass
            except Exception:  # pragma: no cover - best-effort logging only
                logger.debug("Could not decode bearer token for request logging", exc_info=True)

        try:
            response = await call_next(request)
        except Exception:
            duration_ms = (time.perf_counter() - start) * 1000
            logger.exception(
                "request failed",
                extra={
                    "extra_fields": {
                        "request_id": request_id,
                        "method": request.method,
                        "path": request.url.path,
                        "status": 500,
                        "duration_ms": round(duration_ms, 2),
                        "client_ip": client_ip,
                        "user_agent": request.headers.get("User-Agent", ""),
                        "user_id": user_id,
                    }
                },
            )
            raise
        finally:
            # Keep the request ID out of later tasks running on this loop.
            reset_request_id(token)

        duration_ms = (time.perf_counter() - start) * 1000
        logger.info(
            "request",
            extra={
                "extra_fields": {
                    "request_id": request_id,
                    "method": request.method,
                    "path": request.url.path,
                    "status": response.status_code,
                    "duration_ms": round(duration_ms, 2),
                    "client_ip": client_ip,
                    "user_agent": request.headers.get("User-Agent", ""),
                    "user_id": user_id,
                }
            },
        )
        response.headers["X-Request-ID"] = request_id
        response.headers["X-Response-Time-Ms"] = f"{duration_ms:.1f}"
        return response
