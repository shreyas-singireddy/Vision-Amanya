"""Per-request correlation context.

A single request ID is generated once per HTTP request (honouring an incoming
``X-Request-ID`` header when present), stored in a context variable and reused
by logging, error envelopes, audit records and response headers. This gives the
entire request pipeline a stable correlation key end-to-end.
"""

from __future__ import annotations

import contextvars
import uuid

_request_id_var: contextvars.ContextVar[str] = contextvars.ContextVar(
    "request_id", default=""
)


def get_request_id() -> str:
    """Return the current request ID (empty string outside a request)."""
    return _request_id_var.get()


def set_request_id(request_id: str) -> contextvars.Token[str]:
    """Set the request ID for the current async context.

    Returns the reset token so callers can restore the previous value once
    the request completes (prevents the ID from leaking across tasks).
    """
    return _request_id_var.set(request_id)


def reset_request_id(token: contextvars.Token[str]) -> None:
    """Restore the request-ID context variable to its previous value."""
    _request_id_var.reset(token)


def generate_request_id() -> str:
    """Generate a new, URL-safe request identifier."""
    return uuid.uuid4().hex
