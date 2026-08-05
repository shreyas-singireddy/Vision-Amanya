"""Standardized API response envelopes.

Every endpoint returns either a success envelope::

    {
        "success": true,
        "message": "...",
        "data": {...},
        "request_id": "...",
        "timestamp": "..."
    }

or an error envelope (produced by the global exception handlers)::

    {
        "success": false,
        "message": "...",
        "error_code": "...",
        "details": {...},
        "request_id": "...",
        "timestamp": "..."
    }

This keeps the API contract stable for the frontend, admin portal and mobile
clients regardless of which route produced the response.
"""

from __future__ import annotations

from datetime import UTC, datetime
from typing import Any

from app.core.request_context import get_request_id


def _now_iso() -> str:
    return datetime.now(UTC).isoformat()


def success_response(
    data: Any = None,
    message: str = "Success",
    *,
    request_id: str | None = None,
) -> dict[str, Any]:
    """Build a standard success envelope."""
    return {
        "success": True,
        "message": message,
        "data": data,
        "request_id": request_id or get_request_id(),
        "timestamp": _now_iso(),
    }


def error_response(
    message: str,
    error_code: str,
    *,
    details: Any = None,
    status_code: int | None = None,
    request_id: str | None = None,
) -> dict[str, Any]:
    """Build a standard error envelope (used by exception handlers)."""
    payload: dict[str, Any] = {
        "success": False,
        "message": message,
        "error_code": error_code,
        "details": details,
        "request_id": request_id or get_request_id(),
        "timestamp": _now_iso(),
    }
    if status_code is not None:
        payload["status_code"] = status_code
    return payload
