"""Vision Amanya FastAPI application entrypoint.

Composition root: builds the ASGI app, configures middleware and exception
handlers, and mounts the versioned feature routers. Every response travels in
the standard envelope produced by ``app.core.response``.
"""

from __future__ import annotations

from contextlib import asynccontextmanager

import redis.asyncio as aioredis
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.api.v1 import (
    admin_router,
    ai_router,
    analytics_router,
    auth_router,
    bookings_router,
    enquiries_router,
    favorites_router,
    handoff_router,
    leads_router,
    notifications_router,
    projects_router,
    properties_router,
    reviews_router,
    users_router,
)
from app.core.config import get_settings
from app.core.database import dispose_engines, get_db
from app.core.exceptions import AppException
from app.core.logging import get_logger, setup_logging
from app.core.request_context import get_request_id
from app.core.response import error_response, success_response
from app.middleware import (
    RateLimitMiddleware,
    RequestContextMiddleware,
    SecurityHeadersMiddleware,
)

settings = get_settings()
logger = get_logger("app.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialise the shared Redis client on startup; release on shutdown."""
    redis_client = None
    if settings.REDIS_URL:
        redis_client = aioredis.from_url(
            settings.REDIS_URL, socket_connect_timeout=2, decode_responses=True
        )
        app.state.redis = redis_client
    logger.info("Starting %s in %s environment", settings.PROJECT_NAME, settings.ENVIRONMENT)
    try:
        yield
    finally:
        if redis_client is not None:
            await redis_client.aclose()
        await dispose_engines()
        logger.info("Application shutdown complete")


setup_logging(level="DEBUG" if settings.DEBUG else "INFO")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description=(
        "Vision Amanya real-estate platform API. All endpoints return a "
        "standard envelope; authenticated endpoints require a bearer access "
        "token obtained from ``POST /api/v1/auth/login``."
    ),
    openapi_url=(
        None if settings.is_production else f"{settings.API_V1_STR}/openapi.json"
    ),
    docs_url=None if settings.is_production else "/docs",
    redoc_url=None if settings.is_production else "/redoc",
    lifespan=lifespan,
)

# --- Middleware ---------------------------------------------------------------
# Starlette wraps the app in the order middleware are added (the last added is
# outermost). CORS must stay outermost so pre-flight OPTIONS requests are
# answered before they hit request logging, rate limiting or the routers.
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RateLimitMiddleware)
app.add_middleware(RequestContextMiddleware)
app.add_middleware(CORSMiddleware, allow_origins=settings.BACKEND_CORS_ORIGINS, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])


# --- Exception handlers -------------------------------------------------------


@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    """Translate application exceptions into the standard error envelope."""
    if exc.status_code >= 500:
        logger.error("AppException %s on %s %s: %s", exc.error_code, request.method, request.url.path, exc.message)
    else:
        logger.info("AppException %s on %s %s: %s", exc.error_code, request.method, request.url.path, exc.message)
    return JSONResponse(
        status_code=exc.status_code,
        content=error_response(exc.message, exc.error_code, details=exc.details, status_code=exc.status_code),
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """Surface schema-validation failures with field-level detail.

    The raw ``input``/``ctx`` fields are stripped so submitted payloads (for
    example a mistyped ``password``) are never echoed back to the client.
    """
    errors = [
        {key: value for key, value in error.items() if key not in {"input", "ctx"}}
        for error in exc.errors()
    ]
    details = {"errors": errors}
    return JSONResponse(
        status_code=422,
        content=error_response(
            "Request validation failed.",
            "validation_error",
            details=details,
            status_code=422,
        ),
    )


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    """Translate Starlette/HTTPException into the standard envelope."""
    message = str(exc.detail) if isinstance(exc.detail, str) else "HTTP error."
    return JSONResponse(
        status_code=exc.status_code,
        content=error_response(message, "http_error", status_code=exc.status_code),
    )


@app.exception_handler(IntegrityError)
async def integrity_error_handler(request: Request, exc: IntegrityError) -> JSONResponse:
    """Map database constraint violations to client-safe errors.

    The request-scoped session (``get_db``) has already rolled back the
    failed transaction by the time this handler runs.
    """
    logger.warning("IntegrityError on %s %s: %s", request.method, request.url.path, exc.orig)
    return JSONResponse(
        status_code=409,
        content=error_response(
            "The operation conflicts with existing data.",
            "conflict",
            status_code=409,
        ),
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Catch-all: never leak internals, always include a request id."""
    request_id = get_request_id() or "unknown"
    logger.error("Unhandled error on %s %s: %s", request.method, request.url.path, exc)
    return JSONResponse(
        status_code=500,
        content=error_response(
            "An unexpected error occurred.",
            "internal_error",
            status_code=500,
            request_id=request_id,
        ),
    )


# --- Routers ------------------------------------------------------------------

for router in (
    auth_router,
    users_router,
    projects_router,
    properties_router,
    enquiries_router,
    leads_router,
    bookings_router,
    reviews_router,
    favorites_router,
    notifications_router,
    analytics_router,
    admin_router,
    ai_router,
    handoff_router,
):
    app.include_router(router, prefix=settings.API_V1_STR)


# --- Top-level routes -----------------------------------------------------------


@app.get("/")
async def read_root() -> dict:
    """Root endpoint describing the running service."""
    return success_response(
        {
            "name": settings.PROJECT_NAME,
            "version": settings.PROJECT_VERSION,
            "environment": settings.ENVIRONMENT,
            "status": "online",
        },
        message="Vision Amanya API",
    )


@app.get("/health")
async def health_check(request: Request) -> dict:
    """Health probe reporting API, PostgreSQL and Redis connectivity."""
    health_status: dict = {
        "status": "healthy",
        "services": {
            "api": "healthy",
            "postgres": "unknown",
            "redis": "unknown",
        },
    }

    try:
        async for session in get_db():
            from sqlalchemy import text

            await session.execute(text("SELECT 1"))
            break
        health_status["services"]["postgres"] = "healthy"
    except Exception as exc:  # noqa: BLE001 - fail-closed on any dependency failure
        logger.error("PostgreSQL health check failed: %s", exc)
        health_status["status"] = "unhealthy"
        health_status["services"]["postgres"] = "unhealthy"

    redis_client = getattr(request.app.state, "redis", None)
    if redis_client is not None:
        try:
            await redis_client.ping()
            health_status["services"]["redis"] = "healthy"
        except Exception as exc:  # noqa: BLE001 - fail-closed on any dependency failure
            logger.error("Redis health check failed: %s", exc)
            health_status["status"] = "unhealthy"
            health_status["services"]["redis"] = "unhealthy"
    else:
        health_status["status"] = "unhealthy"
        health_status["services"]["redis"] = "unhealthy: client not initialized"

    return JSONResponse(
        status_code=200 if health_status["status"] == "healthy" else 503,
        content=success_response(health_status, message="Health check"),
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",  # noqa: S104 - dev runner; production binds behind nginx/Docker # nosec B104
        port=8000,
        reload=True,
    )
