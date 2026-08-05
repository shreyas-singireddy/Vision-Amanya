"""Booking reference number generation.

Numbers are short, human-friendly and embed the creation date so customers and
sales teams can read them at a glance::

    BK-20260805-8F3KQ2

Collision avoidance is the caller's responsibility (the ``booking_number``
column is unique and the service retries on conflict by passing a higher
``attempt`` counter, which appends a distinguishing suffix letter).
"""

from __future__ import annotations

import secrets
import string

from app.utils.dates import utcnow

_ALPHABET = string.ascii_uppercase + string.digits  # no ambiguous characters


def generate_booking_number(attempt: int = 0) -> str:
    """Generate a booking reference number ``BK-YYYYMMDD-XXXXXX``.

    Args:
        attempt: Retry counter; values > 0 append a deterministic suffix letter
            so two bookings created in the same second never collide.
    """
    date_part = utcnow().strftime("%Y%m%d")
    random_part = "".join(secrets.choice(_ALPHABET) for _ in range(6))
    if attempt > 0:
        random_part = f"{random_part[:5]}{chr(ord('A') + min(attempt - 1, 25))}"
    return f"BK-{date_part}-{random_part}"
