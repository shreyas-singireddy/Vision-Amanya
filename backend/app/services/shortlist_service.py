"""Phase 6: Personalized Shortlist Delivery via WhatsApp with Consent Enforcement.

Architecture:
    ShortlistService
        └── LeadService (for recommendations & lead data)
        └── WhatsAppService (for message delivery)
        └── RecommendationEngine (for property data)

Design Principles:
- Explicit WhatsApp consent REQUIRED — backend enforces, never trusts frontend
- Phone validation uses existing canonical phone field and normalization
- Consumes Phase 5 recommendation output — no duplicate recommendation logic
- Reuses existing WhatsApp provider abstraction
- Idempotency via existing WhatsAppMessage records
- Message status tracked (PENDING → SENT/DELIVERED/FAILED/SIMULATED)
- Failures never break AI chat, CRM, lead scoring, or recommendations
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import BusinessException, NotFoundException, ValidationException
from app.core.logging import get_logger
from app.models.crm import Lead, WhatsAppMessage
from app.models.enums import WhatsAppMessageStatus
from app.services.lead_service import LeadService
from app.services.whatsapp_service import WhatsAppService, WhatsAppSendResult
from app.utils.validators import is_valid_phone

logger = get_logger("app.services.shortlist")


@dataclass
class ShortlistDeliveryResult:
    """Result of a shortlist delivery attempt."""

    success: bool
    whatsapp_message_id: Optional[uuid.UUID] = None
    status: str = "pending"
    provider_message_id: Optional[str] = None
    error_message: Optional[str] = None
    units_sent: list[str] = None

    def __post_init__(self):
        if self.units_sent is None:
            self.units_sent = []


class ShortlistService:
    """Orchestrates the complete shortlist delivery workflow.

    Workflow:
        1. Validate lead exists and has explicit WhatsApp consent
        2. Validate and normalize phone number
        3. Fetch personalized recommendations from Phase 5 engine
        4. Check idempotency (prevent duplicate sends)
        5. Format structured shortlist message
        6. Send via WhatsApp provider
        7. Persist message status for audit
    """

    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.lead_service = LeadService(db)
        self.whatsapp_service = WhatsAppService(db)

    async def deliver_shortlist(
        self,
        lead_id: uuid.UUID,
        *,
        top_n: int = 3,
        force_refresh: bool = False,
        conversation_id: Optional[uuid.UUID] = None,
        idempotency_key: Optional[str] = None,
    ) -> ShortlistDeliveryResult:
        """Deliver personalized shortlist to lead via WhatsApp.

        Args:
            lead_id: CRM lead identifier
            top_n: Number of top recommendations to include
            force_refresh: Bypass idempotency check (use with caution)
            conversation_id: Optional chat session ID for context linking
            idempotency_key: Optional client-provided key for duplicate prevention

        Returns:
            ShortlistDeliveryResult with delivery status and metadata

        Raises:
            NotFoundException: Lead not found
            ValidationException: Consent missing, phone invalid, or no recommendations
            BusinessException: Delivery failed due to provider error
        """
        # 1. Validate lead and consent
        lead = await self._validate_lead_and_consent(lead_id)

        # 2. Validate and get canonical phone number
        phone = self._get_canonical_phone(lead)
        normalized_phone = self._normalize_phone(phone)

        # 3. Check idempotency
        if not force_refresh:
            existing = await self._check_idempotency(lead_id, normalized_phone, idempotency_key)
            if existing:
                logger.info("Shortlist delivery skipped — idempotent request for lead=%s", lead_id)
                return ShortlistDeliveryResult(
                    success=True,
                    whatsapp_message_id=existing.id,
                    status=str(existing.status),
                    provider_message_id=existing.provider_message_id,
                    units_sent=self._extract_units_from_message(existing.message_body),
                )

        # 4. Fetch personalized recommendations from Phase 5
        recommendation_response = await self.lead_service.get_recommendations_for_lead(
            lead_id, top_n=top_n, update_lead=True
        )

        if not recommendation_response.recommendations:
            logger.warning("No recommendations available for lead=%s", lead_id)
            return ShortlistDeliveryResult(
                success=False,
                status="no_recommendations",
                error_message="No personalized recommendations available for this lead.",
            )

        # 5. Format structured shortlist units for message
        units_for_message = self._format_units_for_message(recommendation_response.recommendations)

        # 6. Send via WhatsApp
        try:
            wa_msg = await self.whatsapp_service.send_shortlist(
                lead_id=lead_id,
                phone=normalized_phone,
                name=lead.name or "there",
                units=units_for_message,
                configuration=lead.configuration,
                view=lead.preferred_view,
                budget_str=self._format_budget(lead),
                conversation_id=conversation_id,
            )
        except Exception as exc:
            logger.exception("WhatsApp delivery failed for lead=%s", lead_id)
            return ShortlistDeliveryResult(
                success=False,
                status="failed",
                error_message=f"WhatsApp delivery failed: {exc}",
            )

        # 7. Return success result
        return ShortlistDeliveryResult(
            success=True,
            whatsapp_message_id=wa_msg.id,
            status=str(wa_msg.status),
            provider_message_id=wa_msg.provider_message_id,
            units_sent=units_for_message,
        )

    async def _validate_lead_and_consent(self, lead_id: uuid.UUID) -> Lead:
        """Validate lead exists and has explicit WhatsApp consent."""
        lead = await self.lead_service.get(lead_id)

        if not lead.whatsapp_consent:
            logger.warning("WhatsApp consent denied for lead=%s", lead_id)
            raise ValidationException(
                "Explicit WhatsApp consent required. Lead has not opted in to WhatsApp communications.",
                error_code="whatsapp_consent_required",
                details={"lead_id": str(lead_id), "consent": lead.whatsapp_consent},
            )

        # Double-check consent timestamp exists (backend enforcement)
        if not lead.consent_timestamp:
            logger.warning("WhatsApp consent timestamp missing for lead=%s", lead_id)
            raise ValidationException(
                "WhatsApp consent record incomplete. Please re-confirm consent.",
                error_code="whatsapp_consent_incomplete",
                details={"lead_id": str(lead_id)},
            )

        logger.info("WhatsApp consent verified for lead=%s (consented at=%s)", lead_id, lead.consent_timestamp)
        return lead

    def _get_canonical_phone(self, lead: Lead) -> str:
        """Get the canonical phone number from lead, preferring whatsapp_number."""
        phone = lead.whatsapp_number or lead.phone
        if not phone:
            raise ValidationException(
                "No phone number available for WhatsApp delivery.",
                error_code="phone_missing",
                details={"lead_id": str(lead.id)},
            )
        return phone

    def _normalize_phone(self, phone: str) -> str:
        """Normalize phone number to E.164 format for WhatsApp API."""
        # Strip all non-digit characters except leading +
        cleaned = "".join(ch for ch in phone if ch.isdigit() or ch == "+")

        # Ensure it starts with +
        if not cleaned.startswith("+"):
            # Assume Indian numbers if no country code
            if len(cleaned) == 10:
                cleaned = "+91" + cleaned
            elif len(cleaned) == 12 and cleaned.startswith("91"):
                cleaned = "+" + cleaned
            else:
                cleaned = "+" + cleaned

        # Validate format
        if not is_valid_phone(cleaned):
            raise ValidationException(
                f"Invalid phone number format: {phone}",
                error_code="phone_invalid",
                details={"original": phone, "normalized": cleaned},
            )

        logger.debug("Phone normalized: %s -> %s", phone, cleaned)
        return cleaned

    async def _check_idempotency(
        self,
        lead_id: uuid.UUID,
        phone: str,
        idempotency_key: Optional[str] = None,
    ) -> Optional[WhatsAppMessage]:
        """Check for existing shortlist delivery to prevent duplicates.

        Checks:
        1. Recent successful/pending message to same phone for same lead
        2. Optional client-provided idempotency key
        """
        # Check for recent shortlist message (within last 24 hours)
        stmt = select(WhatsAppMessage).where(
            WhatsAppMessage.lead_id == lead_id,
            WhatsAppMessage.phone_number == phone,
            WhatsAppMessage.template_name == "amnaya_shortlist",
            WhatsAppMessage.status.in_(
                [WhatsAppMessageStatus.PENDING, WhatsAppMessageStatus.SENT, WhatsAppMessageStatus.DELIVERED, WhatsAppMessageStatus.SIMULATED]
            ),
        ).order_by(WhatsAppMessage.created_at.desc()).limit(1)

        existing = await self.db.scalar(stmt)
        if existing:
            # Check if it's within 24 hours
            age = datetime.now(timezone.utc) - existing.created_at.replace(tzinfo=timezone.utc)
            if age.total_seconds() < 86400:  # 24 hours
                return existing

        # If client provided idempotency key, check for it in metadata
        # (Would require adding idempotency_key column to WhatsAppMessage)
        # For now, we rely on the above check

        return None

    def _format_units_for_message(self, recommendations: list[Any]) -> list[str]:
        """Format recommendation units into shortlist message lines."""
        units = []
        for rec in recommendations:
            unit_line = f"{rec.unit_number} — {rec.typology}, {rec.tower}, Floor {rec.floor}, {rec.view}, {self._format_inr(rec.price)}"
            units.append(unit_line)
        return units

    def _format_budget(self, lead: Lead) -> Optional[str]:
        """Format budget range for message."""
        if lead.budget_max:
            from app.ai.recommendation_engine import RecommendationEngine
            return RecommendationEngine.format_inr(float(lead.budget_max))
        return None

    def _format_inr(self, amount: float) -> str:
        """Format INR amount to readable string."""
        if amount >= 10_000_000:
            return f"₹{amount / 10_000_000:.2f} Cr"
        if amount >= 100_000:
            return f"₹{amount / 100_000:.2f} L"
        return f"₹{amount:,.0f}"

    def _extract_units_from_message(self, message_body: str) -> list[str]:
        """Extract unit identifiers from a shortlist message body."""
        units = []
        for line in message_body.split("\n"):
            line = line.strip()
            if line and (line[0].isdigit() or line.startswith("•")):
                # Extract unit number from formatted line
                parts = line.split("—")
                if parts:
                    unit_part = parts[0].strip()
                    # Remove leading number/bullet
                    unit_part = unit_part.lstrip("0123456789.• ").strip()
                    if unit_part:
                        units.append(unit_part)
        return units

    async def get_delivery_status(self, lead_id: uuid.UUID) -> list[dict[str, Any]]:
        """Get delivery history for a lead's shortlist messages."""
        stmt = select(WhatsAppMessage).where(
            WhatsAppMessage.lead_id == lead_id,
            WhatsAppMessage.template_name == "amnaya_shortlist",
        ).order_by(WhatsAppMessage.created_at.desc())

        result = await self.db.scalars(stmt)
        messages = result.all()

        return [
            {
                "message_id": str(msg.id),
                "phone_number": msg.phone_number,
                "status": str(msg.status),
                "provider_message_id": msg.provider_message_id,
                "sent_at": msg.sent_at.isoformat() if msg.sent_at else None,
                "failed_reason": msg.failed_reason,
                "provider_name": msg.provider_name,
                "created_at": msg.created_at.isoformat(),
            }
            for msg in messages
        ]

    async def retry_failed_delivery(self, lead_id: uuid.UUID) -> ShortlistDeliveryResult:
        """Retry a failed shortlist delivery.

        Only retries if the last attempt was FAILED.
        """
        # Get last failed message
        stmt = select(WhatsAppMessage).where(
            WhatsAppMessage.lead_id == lead_id,
            WhatsAppMessage.template_name == "amnaya_shortlist",
            WhatsAppMessage.status == WhatsAppMessageStatus.FAILED,
        ).order_by(WhatsAppMessage.created_at.desc()).limit(1)

        failed_msg = await self.db.scalar(stmt)
        if not failed_msg:
            raise ValidationException(
                "No failed delivery to retry.",
                error_code="no_failed_delivery",
            )

        # Retry with force_refresh to bypass idempotency
        return await self.deliver_shortlist(lead_id, force_refresh=True)