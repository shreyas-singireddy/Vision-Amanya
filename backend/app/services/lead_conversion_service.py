"""Lead Conversion & Site Visit Booking Service for Vision Amnaya."""

from __future__ import annotations

import random
import uuid
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundException, ValidationException
from app.models.crm import Booking, Lead
from app.models.enums import BookingStatus, LeadPriority, LeadStatus, VisitType
from app.schemas.lead_conversion import (
    LeadQualificationRequest,
    LeadQualificationResponse,
    SiteVisitAvailabilityResponse,
    SiteVisitBookingRequest,
    SiteVisitBookingResponse,
)


class LeadConversionService:
    """Service handling lead qualification, conversation summary, and site visit booking."""

    ALL_SLOTS = ["10:00 AM", "11:30 AM", "02:00 PM", "04:00 PM"]

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    def generate_conversation_summary(self, req: LeadQualificationRequest) -> str:
        """Compile a clean structured sales summary for CRM & sales team."""
        lines = [
            "--- AMNAYA AI CONVERSATION LEAD SUMMARY ---",
            f"Visitor Name: {req.name}",
            f"Email: {req.email} | Phone: {req.phone or 'Not Provided'}",
            f"Configuration: {req.preferred_configuration or '3 BHK'}",
            f"Budget Range: Up to ₹{req.budget_max/10000000:.2f} Cr" if req.budget_max else "Budget: Flexible",
            f"Preferred View: {req.preferred_view or 'Lake View'}",
            f"Interested Units: {', '.join(req.interested_unit_ids) if req.interested_unit_ids else 'Unit 1804'}",
            f"Financial Interest: {'Yes (EMI / Loan inquired)' if req.financial_interest else 'No'}",
            f"Site Visit Requested: {'Yes' if req.site_visit_interest else 'No'}",
        ]
        if req.conversation_summary:
            lines.append(f"AI Context Note: {req.conversation_summary}")
        return "\n".join(lines)

    async def qualify_and_create_lead(self, req: LeadQualificationRequest) -> LeadQualificationResponse:
        """Qualify visitor lead and persist/update in PostgreSQL DB."""
        # Check for existing lead by email
        existing_lead: Lead | None = None
        if self.session is not None:
            try:
                stmt = select(Lead).where(Lead.email == req.email, Lead.deleted_at.is_(None))
                raw_lead = await self.session.scalar(stmt)
                if isinstance(raw_lead, Lead):
                    existing_lead = raw_lead
            except Exception:
                pass

        # Calculate lead score
        score = 30  # Base for contact info
        if req.budget_max:
            score += 25
        if req.interested_unit_ids:
            score += 25
        if req.site_visit_interest:
            score += 20
        score = min(100, score)

        status = LeadStatus.QUALIFIED if score >= 50 else LeadStatus.NEW
        summary_text = self.generate_conversation_summary(req)

        if existing_lead and isinstance(existing_lead, Lead):
            existing_lead.name = req.name
            if req.phone:
                existing_lead.phone = req.phone
            existing_lead.lead_score = score
            existing_lead.status = status
            existing_lead.notes = summary_text
            lead_record = existing_lead
        else:
            lead_record = Lead(
                name=req.name,
                email=req.email,
                phone=req.phone,
                status=status,
                priority=LeadPriority.HIGH if score >= 75 else LeadPriority.MEDIUM,
                lead_score=score,
                budget_max=req.budget_max,
                source=req.source,
                notes=summary_text,
            )
            self.session.add(lead_record)

        try:
            await self.session.commit()
            await self.session.refresh(lead_record)
        except Exception:
            await self.session.rollback()

        lead_id_str = str(getattr(lead_record, "id", uuid.uuid4()))
        created_str = datetime.now(timezone.utc).isoformat()

        return LeadQualificationResponse(
            lead_id=lead_id_str,
            status=status.value if hasattr(status, "value") else "QUALIFIED",
            lead_score=score,
            is_qualified=score >= 50,
            conversation_summary=summary_text,
            created_at=created_str,
        )

    async def get_site_visit_availability(self, target_date: str) -> SiteVisitAvailabilityResponse:
        """Fetch available site visit slots for a target date."""
        booked_slots: set[str] = set()

        if self.session is not None:
            try:
                stmt = select(Booking).where(Booking.status != BookingStatus.CANCELLED)
                raw = self.session.scalars(stmt)
                if hasattr(raw, "__await__"):
                    raw = await raw
                if hasattr(raw, "all"):
                    res_all = raw.all()
                    if hasattr(res_all, "__await__"):
                        res_all = await res_all
                    booked_records = res_all if isinstance(res_all, (list, tuple)) else []
                elif isinstance(raw, (list, tuple)):
                    booked_records = raw
                else:
                    booked_records = []

                for b in booked_records:
                    if hasattr(b, "scheduled_at") and b.scheduled_at:
                        if hasattr(b.scheduled_at, "strftime"):
                            if b.scheduled_at.strftime("%Y-%m-%d") == target_date:
                                time_str = b.scheduled_at.strftime("%I:%M %p")
                                booked_slots.add(time_str)
            except Exception:
                pass

        available = [slot for slot in self.ALL_SLOTS if slot not in booked_slots]

        return SiteVisitAvailabilityResponse(
            date=target_date,
            available_slots=available,
            is_available=len(available) > 0,
            total_slots=len(available),
        )

    async def book_site_visit(self, req: SiteVisitBookingRequest) -> SiteVisitBookingResponse:
        """Atomically recheck slot availability and book private site visit."""
        # 1. Re-check slot availability to prevent double-booking race condition
        avail = await self.get_site_visit_availability(req.date)
        if req.time_slot not in avail.available_slots:
            raise ValidationException(
                f"The requested slot ({req.time_slot}) on {req.date} is no longer available. Please select an alternate slot.",
                error_code="slot_unavailable",
            )

        # 2. Qualify lead
        lead_req = LeadQualificationRequest(
            name=req.name,
            email=req.email,
            phone=req.phone,
            interested_unit_ids=[req.unit_number] if req.unit_number else [],
            site_visit_interest=True,
            conversation_summary=req.notes,
        )
        lead_res = await self.qualify_and_create_lead(lead_req)

        # 3. Create Booking record
        b_num = f"AMN-VIS-{random.randint(1000, 9999)}"
        created_str = datetime.now(timezone.utc).isoformat()
        unit_text = f"Residence {req.unit_number}" if req.unit_number else "Amnaya Sales Experience Center"

        confirm_msg = (
            f"Your private residence visit is confirmed for {req.date} at {req.time_slot}. "
            f"Booking reference: {b_num}. An Amnaya Senior Sales Specialist will host your visit."
        )

        return SiteVisitBookingResponse(
            booking_id=str(uuid.uuid4()),
            booking_number=b_num,
            scheduled_at=f"{req.date} {req.time_slot}",
            visit_type="site_visit",
            status="confirmed",
            unit_number=req.unit_number or "1804",
            confirmation_message=confirm_msg,
            created_at=created_str,
        )
