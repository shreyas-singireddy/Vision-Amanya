"""Date/time helpers (timezone-safe)."""

from __future__ import annotations

from datetime import UTC, datetime


def utcnow() -> datetime:
    """Return the current UTC time as a timezone-aware datetime."""
    return datetime.now(UTC)


def to_utc(value: datetime) -> datetime:
    """Normalize an arbitrary datetime to UTC (timezone-aware)."""
    if value.tzinfo is None:
        return value.replace(tzinfo=UTC)
    return value.astimezone(UTC)
