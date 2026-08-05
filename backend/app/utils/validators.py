"""Input validation helpers used across the service layer.

Schema-level validation (Pydantic) handles shape and type; these helpers
handle policy-level checks (password strength, phone format, amount sanity)
that are too business-specific for Pydantic or reused across modules.
"""

from __future__ import annotations

import ipaddress
import re

_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
_PHONE_RE = re.compile(r"^\+?[0-9\s\-()]{7,20}$")

MIN_PASSWORD_LENGTH = 8


def sanitize_ip(value: str | None) -> str | None:
    """Return ``value`` only when it is a real IP address, else ``None``.

    Reverse-proxies and test harnesses (e.g. Starlette's TestClient which
    reports ``client.host == "testclient"``) may surface non-IP host values;
    storing those in ``INET`` columns would raise a DataError.
    """
    if not value:
        return None
    try:
        ipaddress.ip_address(value.strip())
    except ValueError:
        return None
    return value.strip()


def is_valid_email(value: str) -> bool:
    """Return True when the value looks like a reasonable email address."""
    return bool(_EMAIL_RE.match(value.strip()))


def is_valid_phone(value: str) -> bool:
    """Return True when the value looks like a plausible phone number."""
    return bool(_PHONE_RE.match(value.strip()))


def validate_password_strength(password: str) -> None:
    """Raise ``ValueError`` for weak passwords (used by the auth service).

    Requires at least 8 characters and at least one letter and one digit.
    """
    if len(password) < MIN_PASSWORD_LENGTH:
        raise ValueError(
            f"Password must be at least {MIN_PASSWORD_LENGTH} characters long."
        )
    if not any(ch.isalpha() for ch in password):
        raise ValueError("Password must contain at least one letter.")
    if not any(ch.isdigit() for ch in password):
        raise ValueError("Password must contain at least one digit.")


def ensure_positive_amount(value: float | None, field_name: str) -> None:
    """Raise ``ValueError`` when a monetary amount is negative."""
    if value is not None and value < 0:
        raise ValueError(f"{field_name} must not be negative.")
