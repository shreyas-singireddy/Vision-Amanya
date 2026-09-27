"""Phase 7.5: WhatsApp messaging service with provider abstraction.

Architecture:
    WhatsAppService
        └── WhatsAppProvider (ABC)
                ├── MockWhatsAppProvider      (default in dev — logs, returns SIMULATED)
                └── MetaWhatsAppProvider      (production — Meta Cloud API)

Design principles:
- The LLM never calls this service directly.
- The lead is ALWAYS saved to PostgreSQL first.
- WhatsApp delivery is async (background task).
- Every send attempt is recorded in whatsapp_messages regardless of outcome.
- Failure is never silent — status is always updated to FAILED with reason.

Production setup (Meta Cloud API):
  WHATSAPP_PROVIDER=meta
  WHATSAPP_ACCESS_TOKEN=<your token>
  WHATSAPP_PHONE_NUMBER_ID=<your phone number ID>
  WHATSAPP_TEMPLATE_SHORTLIST=amnaya_shortlist
"""

from __future__ import annotations

import uuid
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any, Optional

from app.core.logging import get_logger

logger = get_logger("app.services.whatsapp")


@dataclass
class WhatsAppSendResult:
    """Result returned by any WhatsApp provider."""

    success: bool
    status: str          # "simulated" | "sent" | "failed"
    provider_message_id: Optional[str] = None
    provider_name: str = "unknown"
    error_message: Optional[str] = None
    simulated: bool = False


class WhatsAppProvider(ABC):
    """Abstract base for WhatsApp delivery providers."""

    @abstractmethod
    async def send_text(self, phone: str, message: str) -> WhatsAppSendResult:
        """Send a plain-text WhatsApp message."""

    @abstractmethod
    async def send_template(
        self, phone: str, template_name: str, params: list[str]
    ) -> WhatsAppSendResult:
        """Send a template-based WhatsApp message."""

    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Provider identifier string."""


class MockWhatsAppProvider(WhatsAppProvider):
    """Development provider — logs message, returns SIMULATED status.

    No external calls are made. Safe for local development and testing.
    """

    @property
    def provider_name(self) -> str:
        return "mock"

    async def send_text(self, phone: str, message: str) -> WhatsAppSendResult:
        logger.info("📱 [MOCK WhatsApp] To=%s | Message length=%d chars", phone, len(message))
        logger.debug("📱 [MOCK WhatsApp] Body: %s", message[:200])
        return WhatsAppSendResult(
            success=True,
            status="simulated",
            provider_message_id=f"mock-{uuid.uuid4().hex[:8]}",
            provider_name=self.provider_name,
            simulated=True,
        )

    async def send_template(
        self, phone: str, template_name: str, params: list[str]
    ) -> WhatsAppSendResult:
        logger.info(
            "📱 [MOCK WhatsApp] Template=%s To=%s params=%s",
            template_name, phone, params,
        )
        return WhatsAppSendResult(
            success=True,
            status="simulated",
            provider_message_id=f"mock-{uuid.uuid4().hex[:8]}",
            provider_name=self.provider_name,
            simulated=True,
        )


class MetaWhatsAppProvider(WhatsAppProvider):
    """Production provider — Meta WhatsApp Business Cloud API (v17+).

    Requires:
        WHATSAPP_ACCESS_TOKEN
        WHATSAPP_PHONE_NUMBER_ID
    """

    def __init__(self) -> None:
        try:
            from app.core.config import settings  # type: ignore[import-untyped]
            self._token = getattr(settings, "WHATSAPP_ACCESS_TOKEN", None)
            self._phone_number_id = getattr(settings, "WHATSAPP_PHONE_NUMBER_ID", None)
            self._api_url = getattr(
                settings,
                "WHATSAPP_API_URL",
                "https://graph.facebook.com/v17.0",
            )
        except Exception:
            self._token = None
            self._phone_number_id = None
            self._api_url = "https://graph.facebook.com/v17.0"

    @property
    def provider_name(self) -> str:
        return "meta"

    def _is_configured(self) -> bool:
        return bool(self._token and self._phone_number_id)

    async def send_text(self, phone: str, message: str) -> WhatsAppSendResult:
        if not self._is_configured():
            logger.warning("Meta WhatsApp not configured — falling back to SIMULATED status")
            return WhatsAppSendResult(
                success=False,
                status="failed",
                provider_name=self.provider_name,
                error_message="WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID not configured",
            )
        try:
            import httpx
            url = f"{self._api_url}/{self._phone_number_id}/messages"
            payload = {
                "messaging_product": "whatsapp",
                "to": phone,
                "type": "text",
                "text": {"body": message},
            }
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(
                    url,
                    json=payload,
                    headers={"Authorization": f"Bearer {self._token}"},
                )
            if resp.status_code == 200:
                data = resp.json()
                msg_id = data.get("messages", [{}])[0].get("id", "")
                return WhatsAppSendResult(
                    success=True,
                    status="sent",
                    provider_message_id=msg_id,
                    provider_name=self.provider_name,
                )
            else:
                return WhatsAppSendResult(
                    success=False,
                    status="failed",
                    provider_name=self.provider_name,
                    error_message=f"HTTP {resp.status_code}: {resp.text[:200]}",
                )
        except Exception as exc:
            logger.exception("Meta WhatsApp send_text failed")
            return WhatsAppSendResult(
                success=False,
                status="failed",
                provider_name=self.provider_name,
                error_message=str(exc),
            )

    async def send_template(
        self, phone: str, template_name: str, params: list[str]
    ) -> WhatsAppSendResult:
        if not self._is_configured():
            return WhatsAppSendResult(
                success=False,
                status="failed",
                provider_name=self.provider_name,
                error_message="WhatsApp not configured",
            )
        try:
            import httpx
            url = f"{self._api_url}/{self._phone_number_id}/messages"
            components = []
            if params:
                components = [{
                    "type": "body",
                    "parameters": [{"type": "text", "text": p} for p in params],
                }]
            payload = {
                "messaging_product": "whatsapp",
                "to": phone,
                "type": "template",
                "template": {
                    "name": template_name,
                    "language": {"code": "en"},
                    "components": components,
                },
            }
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(
                    url,
                    json=payload,
                    headers={"Authorization": f"Bearer {self._token}"},
                )
            if resp.status_code == 200:
                data = resp.json()
                msg_id = data.get("messages", [{}])[0].get("id", "")
                return WhatsAppSendResult(
                    success=True,
                    status="sent",
                    provider_message_id=msg_id,
                    provider_name=self.provider_name,
                )
            else:
                return WhatsAppSendResult(
                    success=False,
                    status="failed",
                    provider_name=self.provider_name,
                    error_message=f"HTTP {resp.status_code}: {resp.text[:200]}",
                )
        except Exception as exc:
            logger.exception("Meta WhatsApp send_template failed")
            return WhatsAppSendResult(
                success=False,
                status="failed",
                provider_name=self.provider_name,
                error_message=str(exc),
            )


def _get_provider() -> WhatsAppProvider:
    """Factory: returns the configured WhatsApp provider."""
    try:
        from app.core.config import settings  # type: ignore[import-untyped]
        provider_name = getattr(settings, "WHATSAPP_PROVIDER", "mock").lower()
    except Exception:
        provider_name = "mock"

    if provider_name == "meta":
        return MetaWhatsAppProvider()
    return MockWhatsAppProvider()


class WhatsAppService:
    """High-level WhatsApp service.

    Always persists a WhatsAppMessage DB record regardless of provider outcome.
    The lead MUST already be saved to PostgreSQL before calling this service.
    """

    def __init__(self, db: Any, provider: Optional[WhatsAppProvider] = None) -> None:
        self.db = db
        self._provider = provider or _get_provider()

    def _format_shortlist_message(
        self,
        name: str,
        units: list[str],
        configuration: Optional[str] = None,
        view: Optional[str] = None,
        budget_str: Optional[str] = None,
    ) -> str:
        """Compose the WhatsApp shortlist message body."""
        lines = [
            f"Hello {name or 'there'},",
            "",
            "Thank you for exploring Amnaya by Vision Infra.",
            "",
        ]
        if configuration or view or budget_str:
            lines.append("Based on your preferences:")
            if configuration:
                lines.append(f"• {configuration}")
            if view:
                lines.append(f"• {view.replace('_', ' ').title()} view preference")
            if budget_str:
                lines.append(f"• Budget: {budget_str}")
            lines.append("")

        if units:
            lines.append("Shortlisted residences:")
            for i, u in enumerate(units, 1):
                lines.append(f"{i}. {u}")
            lines.append("")

        lines.extend([
            "Our Amnaya sales team is ready to assist you with availability,",
            "detailed pricing, and a private site visit.",
            "",
            "— Team Amnaya",
        ])
        return "\n".join(lines)

    async def send_shortlist(
        self,
        *,
        lead_id: uuid.UUID,
        phone: str,
        name: str,
        units: list[str],
        configuration: Optional[str] = None,
        view: Optional[str] = None,
        budget_str: Optional[str] = None,
        conversation_id: Optional[uuid.UUID] = None,
    ) -> Any:  # Returns WhatsAppMessage ORM object
        """Send a shortlist message and persist the result."""
        from app.models.crm import WhatsAppMessage
        from app.models.enums import WhatsAppMessageStatus
        from app.utils.dates import utcnow

        message_body = self._format_shortlist_message(name, units, configuration, view, budget_str)

        wa_msg = WhatsAppMessage(
            lead_id=lead_id,
            conversation_id=conversation_id,
            phone_number=phone,
            message_body=message_body,
            template_name="amnaya_shortlist",
            status=WhatsAppMessageStatus.PENDING,
            provider_name=self._provider.provider_name,
        )
        if self.db:
            self.db.add(wa_msg)
            try:
                await self.db.flush()
            except Exception:
                pass

        result = await self._provider.send_text(phone, message_body)

        # Update status record
        wa_msg.status = WhatsAppMessageStatus(result.status)
        wa_msg.provider_message_id = result.provider_message_id
        wa_msg.failed_reason = result.error_message
        if result.success:
            wa_msg.sent_at = utcnow()

        if self.db:
            try:
                await self.db.commit()
                await self.db.refresh(wa_msg)
            except Exception:
                try:
                    await self.db.rollback()
                except Exception:
                    pass

        logger.info(
            "WhatsApp [%s] → %s | lead=%s | status=%s",
            self._provider.provider_name, phone, lead_id, result.status,
        )
        return wa_msg

    async def send_confirmation(
        self,
        *,
        lead_id: uuid.UUID,
        phone: str,
        name: str,
        conversation_id: Optional[uuid.UUID] = None,
    ) -> Any:
        """Send a simple enquiry confirmation message."""
        from app.models.crm import WhatsAppMessage
        from app.models.enums import WhatsAppMessageStatus
        from app.utils.dates import utcnow

        body = (
            f"Hello {name or 'there'},\n\n"
            "Thank you for your enquiry at Amnaya by Vision Infra.\n"
            "Our sales team will be in touch with you shortly.\n\n"
            "— Team Amnaya"
        )

        wa_msg = WhatsAppMessage(
            lead_id=lead_id,
            conversation_id=conversation_id,
            phone_number=phone,
            message_body=body,
            template_name="amnaya_enquiry_confirmation",
            status=WhatsAppMessageStatus.PENDING,
            provider_name=self._provider.provider_name,
        )
        if self.db:
            self.db.add(wa_msg)

        result = await self._provider.send_text(phone, body)
        wa_msg.status = WhatsAppMessageStatus(result.status)
        wa_msg.provider_message_id = result.provider_message_id
        wa_msg.failed_reason = result.error_message
        if result.success:
            wa_msg.sent_at = utcnow()

        if self.db:
            try:
                await self.db.commit()
                await self.db.refresh(wa_msg)
            except Exception:
                try:
                    await self.db.rollback()
                except Exception:
                    pass

        return wa_msg
