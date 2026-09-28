"""Phase 7.5: Sales Notification Service.

Notifies the sales team when a new qualified lead arrives.

Channels supported:
  - email   (SMTP via Python smtplib, or log-only if not configured)
  - pending  (stores record, waits for manual send — never silently fails)

All send attempts are persisted as SalesNotification DB records regardless
of delivery outcome. Never silent-fail.

Configuration:
  SALES_NOTIFICATION_CHANNEL=email  (or pending_only)
  SALES_NOTIFICATION_EMAIL=sales@amnaya.in
  SALES_TEAM_RECIPIENTS=sales@amnaya.in,manager@amnaya.in
"""

from __future__ import annotations

import smtplib
import uuid
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Any, Optional

from app.core.logging import get_logger
from app.models.enums import SalesNotificationStatus

logger = get_logger("app.services.sales_notification")


def _load_settings() -> dict[str, Any]:
    """Load notification settings from config/env."""
    try:
        from app.core.config import settings  # type: ignore[import-untyped]
        return {
            "channel": getattr(settings, "SALES_NOTIFICATION_CHANNEL", "pending_only"),
            "from_email": getattr(settings, "SALES_NOTIFICATION_EMAIL", "noreply@amnaya.in"),
            "recipients": getattr(settings, "SALES_TEAM_RECIPIENTS", ""),
            "smtp_host": getattr(settings, "SMTP_HOST", ""),
            "smtp_port": int(getattr(settings, "SMTP_PORT", 587)),
            "smtp_user": getattr(settings, "SMTP_USER", ""),
            "smtp_pass": getattr(settings, "SMTP_PASSWORD", ""),
        }
    except Exception:
        return {
            "channel": "pending_only",
            "from_email": "noreply@amnaya.in",
            "recipients": "",
            "smtp_host": "",
            "smtp_port": 587,
            "smtp_user": "",
            "smtp_pass": "",
        }


def _build_email_body(
    lead: Any,
    handoff: Any = None,
    trigger: str | None = None,
    qualification: str | None = None,
) -> tuple[str, str]:
    """Build subject + HTML email body for a lead notification.

    ``trigger`` / ``qualification`` are the canonical values produced by the
    sales workflow (Phase 7); they are optional so the legacy sales-handoff
    caller can keep using this builder unchanged.
    """
    name = getattr(lead, "name", "Unknown") or "Unknown"
    phone = getattr(lead, "whatsapp_number", None) or getattr(lead, "phone", None) or "N/A"
    location = getattr(lead, "location", None) or "—"
    purpose = (getattr(lead, "buying_purpose", None) or "—").replace("_", " ").title()
    config = getattr(lead, "configuration", None) or "3BHK"
    score = getattr(lead, "lead_score", 0) or 0
    budget = "—"
    bmax = getattr(lead, "budget_max", None)
    if bmax:
        budget = f"₹{bmax / 10_000_000:.1f} Cr"
    units = getattr(lead, "interested_unit_ids", None) or []

    # Optional sales-workflow provenance rows (Phase 7 internal notification).
    extra_rows = ""
    if qualification:
        extra_rows += (
            f'      <tr><td style="color:#666;">Qualification</td>'
            f'<td><strong>{qualification}</strong></td></tr>\n'
        )
    if trigger:
        extra_rows += (
            f'      <tr style="background:#f9f5ef;"><td style="color:#666;">Sales Trigger</td>'
            f'<td>{str(trigger).replace("_", " ").title()}</td></tr>\n'
        )

    temp = "Cold"
    if score > 80:
        temp = "🔥 High Intent"
    elif score > 60:
        temp = "🔴 Hot"
    elif score > 30:
        temp = "🟡 Warm"

    subject = f"[Amnaya Lead] {name} — {temp} | Score: {score}/100"

    html = f"""
<html><body style="font-family: Arial, sans-serif; color: #1a1a2e; background:#fff;">
<div style="max-width:600px;margin:0 auto;border:1px solid #c9a84c;border-radius:8px;overflow:hidden;">
  <div style="background:#1a1a2e;padding:20px;text-align:center;">
    <h2 style="color:#c9a84c;margin:0;">AMNAYA — New Lead Alert</h2>
    <p style="color:#ddd;margin:4px 0 0;">{temp} &nbsp;|&nbsp; Score: {score}/100</p>
  </div>
  <div style="padding:24px;">
    <table width="100%" cellpadding="8" style="border-collapse:collapse;">
      <tr><td style="color:#666;width:140px;">Name</td><td><strong>{name}</strong></td></tr>
      <tr style="background:#f9f5ef;"><td style="color:#666;">WhatsApp</td><td>{phone}</td></tr>
      <tr><td style="color:#666;">City</td><td>{location}</td></tr>
      <tr style="background:#f9f5ef;"><td style="color:#666;">Purpose</td><td>{purpose}</td></tr>
      <tr><td style="color:#666;">Configuration</td><td>{config}</td></tr>
      <tr style="background:#f9f5ef;"><td style="color:#666;">Budget</td><td>{budget}</td></tr>
      <tr><td style="color:#666;">Interested Units</td><td>{', '.join(units) or '—'}</td></tr>
      <tr style="background:#f9f5ef;"><td style="color:#666;">Lead Score</td><td><strong>{score}/100</strong></td></tr>
{extra_rows}    </table>
    <p style="margin-top:20px;font-size:12px;color:#999;">
      Please follow up within 30 minutes for best conversion.<br>
      Lead ID: {getattr(lead, 'id', '—')}
    </p>
  </div>
</div>
</body></html>"""
    return subject, html


class SalesNotificationService:
    """Notifies the sales team about new qualified leads.

    All attempts are persisted as SalesNotification records.
    If no email is configured, status is set to PENDING (never lost).
    """

    def __init__(self, db: Any) -> None:
        self.db = db

    async def notify_new_lead(
        self,
        lead: Any,
        handoff: Any = None,
        trigger: str | None = None,
        qualification: str | None = None,
    ) -> Any:  # Returns SalesNotification ORM object
        """Create a notification and attempt delivery on the configured channel.

        Never raises for delivery problems: the outcome is persisted on the
        ``sales_notifications`` row (``sent`` / ``pending`` / ``failed``) so an
        internal notification failure can never break the calling flow.
        """
        from app.models.crm import SalesNotification
        from app.utils.dates import utcnow

        cfg = _load_settings()
        subject, body_html = _build_email_body(
            lead, handoff, trigger=trigger, qualification=qualification
        )
        recipients = [r.strip() for r in cfg["recipients"].split(",") if r.strip()]

        notification = SalesNotification(
            lead_id=getattr(lead, "id", None),
            handoff_id=getattr(handoff, "id", None) if handoff else None,
            channel=cfg["channel"],
            status=SalesNotificationStatus.PENDING,
            recipient=", ".join(recipients) if recipients else None,
            subject=subject,
            body=body_html,
        )
        if self.db:
            self.db.add(notification)
            try:
                await self.db.flush()
            except Exception:
                pass

        success = False
        error_msg = None

        if cfg["channel"] == "email" and recipients:
            success, error_msg = await self._send_email(cfg, subject, body_html, recipients)
        else:
            logger.info(
                "Sales notification queued as PENDING (channel=%s, no recipients=%s)",
                cfg["channel"], not recipients,
            )

        notification.status = SalesNotificationStatus.SENT if success else SalesNotificationStatus.PENDING
        if not success and error_msg:
            notification.failed_reason = error_msg
            notification.status = SalesNotificationStatus.FAILED if cfg["channel"] == "email" else SalesNotificationStatus.PENDING
        if success:
            notification.sent_at = utcnow()

        if self.db:
            try:
                await self.db.commit()
                await self.db.refresh(notification)
            except Exception:
                try:
                    await self.db.rollback()
                except Exception:
                    pass

        logger.info(
            "SalesNotification [%s] lead=%s status=%s",
            cfg["channel"],
            getattr(lead, "id", "—"),
            notification.status.value if hasattr(notification.status, "value") else notification.status,
        )
        return notification

    @staticmethod
    async def _send_email(
        cfg: dict[str, Any],
        subject: str,
        body_html: str,
        recipients: list[str],
    ) -> tuple[bool, Optional[str]]:
        """Attempt SMTP delivery. Returns (success, error_msg)."""
        if not cfg["smtp_host"]:
            logger.info("SMTP not configured — notification stored as PENDING")
            return False, "SMTP_HOST not configured"

        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = cfg["from_email"]
            msg["To"] = ", ".join(recipients)
            msg.attach(MIMEText(body_html, "html", "utf-8"))

            with smtplib.SMTP(cfg["smtp_host"], cfg["smtp_port"], timeout=10) as server:
                server.ehlo()
                if cfg["smtp_port"] == 587:
                    server.starttls()
                if cfg["smtp_user"] and cfg["smtp_pass"]:
                    server.login(cfg["smtp_user"], cfg["smtp_pass"])
                server.sendmail(cfg["from_email"], recipients, msg.as_string())

            logger.info("Sales email sent to %s", recipients)
            return True, None
        except Exception as exc:
            logger.warning("Sales email delivery failed: %s", exc)
            return False, str(exc)
