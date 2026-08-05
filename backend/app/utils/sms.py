"""SMS delivery service.

No SMS provider is wired yet. The service exposes a single ``send`` method
with a provider-agnostic contract; until a provider is configured it logs and
returns ``sent=False`` so the rest of the pipeline never crashes. This module
is intentionally small — swap in a real provider (Twilio/Exotel/Msg91)
behind the same interface.
"""

from __future__ import annotations

import logging

from app.core.config import get_settings

logger = logging.getLogger("app.utils.sms")


class SmsService:
    """Send transactional SMS messages (provider-agnostic facade)."""

    def __init__(self) -> None:
        self.settings = get_settings()

    async def send(self, phone: str, message: str) -> bool:
        """Send an SMS; returns True when delivered.

        Currently logs and returns False because no provider is configured.
        """
        logger.warning("SMS provider not configured; skipping SMS to %s", phone)
        return False
