"""Redis-backed fixed-window rate limiting middleware.

Enabled only when ``RATE_LIMIT_ENABLED`` is true. Enforces a per-IP default
limit across all routes and a tighter, per-IP limit for authentication routes
(``/auth/*``). Uses a Redis ``INCR`` + ``EXPIRE`` fixed window; the client is
informed how long to wait via the ``Retry-After`` header. When Redis is
unreachable the middleware fails open (logs a warning) so a cache outage never
takes the API down.
"""

from __future__ import annotations

import logging
import time

import redis.exceptions as redis_errors
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response

from app.core.config import get_settings
from app.core.response import error_response

logger = logging.getLogger("app.middleware.rate_limit")
_settings = get_settings()


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Enforce per-IP fixed-window request limits using Redis."""

    def __init__(self, app) -> None:
        super().__init__(app)
        self.enabled = _settings.RATE_LIMIT_ENABLED
        self.default_limit = _settings.RATE_LIMIT_DEFAULT_LIMIT
        self.default_window = _settings.RATE_LIMIT_DEFAULT_PERIOD_SECONDS
        self.auth_limit = _settings.RATE_LIMIT_AUTH_ENDPOINTS_LIMIT
        self.auth_window = _settings.RATE_LIMIT_AUTH_ENDPOINTS_PERIOD_SECONDS

    async def dispatch(self, request: Request, call_next) -> Response:
        if not self.enabled:
            return await call_next(request)
        redis = getattr(request.app.state, "redis", None)
        if redis is None:
            return await call_next(request)

        client_ip = request.client.host if request.client else "unknown"
        auth_prefix = _settings.API_V1_STR.rstrip("/") + "/auth"
        is_auth_route = request.url.path.rstrip("/").startswith(auth_prefix)
        window = self.auth_window if is_auth_route else self.default_window
        limit = self.auth_limit if is_auth_route else self.default_limit
        bucket = f"ratelimit:{client_ip}:{window}"
        window_key = f"{bucket}:{int(time.time()) // window}"

        try:
            current = await redis.incr(window_key)
            if current == 1:
                await redis.expire(window_key, window)
            if current > limit:
                retry_after = window - (int(time.time()) % window)
                return JSONResponse(
                    status_code=429,
                    content=error_response(
                        "Too many requests. Please retry later.",
                        "rate_limit_exceeded",
                        details={"retry_after_seconds": retry_after},
                    ),
                    headers={"Retry-After": str(retry_after)},
                )
        except (redis_errors.RedisError, OSError) as exc:  # pragma: no cover - redis outage
            logger.warning("Rate limiter unavailable, failing open: %s", exc)

        return await call_next(request)
