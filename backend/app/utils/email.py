"""Async email delivery built on smtplib running in a worker thread.

When SMTP is configured (``SMTP_HOST`` set) emails are sent for real; when it
is empty the service records a debug log and skips delivery. This keeps local
development and CI green without a mail server while remaining fully
functional in staging/production.
"""

from __future__ import annotations

import asyncio
import logging
from dataclasses import dataclass
from email.message import EmailMessage
from email.utils import formataddr
from smtplib import SMTP_SSL, SMTPAuthenticationError, SMTPException, SMTPServerDisconnected

from app.core.config import get_settings

logger = logging.getLogger("app.utils.email")


@dataclass(frozen=True)
class EmailResult:
    """Outcome of a send attempt."""

    recipient: str
    sent: bool
    reason: str | None = None


class EmailService:
    """Send transactional emails (HTML body supported) via a background thread.

    Threads are used because smtplib is blocking; the event loop is never
    blocked. Raise-free by design: failures are logged and returned in the
    :class:`EmailResult` so business flows can decide how to react.
    """

    def __init__(self) -> None:
        self.settings = get_settings()

    @property
    def _configured(self) -> bool:
        return bool(self.settings.SMTP_HOST)

    def _deliver(self, recipient: str, subject: str, html: str) -> None:
        cfg = self.settings
        message = EmailMessage()
        message["Subject"] = subject
        message["From"] = formataddr(("Vision Amanya", cfg.SMTP_FROM_EMAIL))
        message["To"] = recipient
        message.set_content("Please view this email in an HTML-compatible client.")
        message.add_alternative(html, subtype="html")

        if cfg.SMTP_PORT == 465:
            with SMTP_SSL(cfg.SMTP_HOST, cfg.SMTP_PORT, timeout=15) as server:
                if cfg.SMTP_USER:
                    server.login(cfg.SMTP_USER, cfg.SMTP_PASSWORD)
                server.send_message(message)
        else:
            import smtplib

            with smtplib.SMTP(cfg.SMTP_HOST, cfg.SMTP_PORT, timeout=15) as server:
                server.starttls()
                if cfg.SMTP_USER:
                    server.login(cfg.SMTP_USER, cfg.SMTP_PASSWORD)
                server.send_message(message)

    async def send(self, recipient: str, subject: str, html: str) -> EmailResult:
        """Send an email to ``recipient`` with the given subject/HTML body."""
        if not self._configured:
            logger.debug("SMTP not configured; skipping email to %s", recipient)
            return EmailResult(recipient=recipient, sent=False, reason="smtp_not_configured")
        try:
            await asyncio.to_thread(self._deliver, recipient, subject, html)
            logger.info("Email sent to %s subject=%r", recipient, subject)
            return EmailResult(recipient=recipient, sent=True)
        except (SMTPAuthenticationError, SMTPServerDisconnected, SMTPException, OSError) as exc:
            logger.warning("Email delivery failed to %s: %s", recipient, exc)
            return EmailResult(recipient=recipient, sent=False, reason=str(exc))
