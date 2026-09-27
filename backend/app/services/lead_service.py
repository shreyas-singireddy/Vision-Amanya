"""Lead service: pipeline management, assignment and scoring."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import BusinessException, NotFoundException
from app.models.crm import Lead
from app.models.enums import LeadPriority, LeadStatus
from app.repositories.lead import LeadRepository
from app.schemas.lead import LeadAssign, LeadCreate, LeadUpdate
from app.services.base import BaseService
from app.utils.audit import write_audit_log
from app.utils.dates import utcnow
from app.utils.pagination import Page

_PRIORITY_POINTS = {LeadPriority.URGENT: 10, LeadPriority.HIGH: 7, LeadPriority.MEDIUM: 4, LeadPriority.LOW: 2}


class LeadService(BaseService):
    """Owns the sales pipeline and lead lifecycle rules."""

    def __init__(self, db: AsyncSession) -> None:
        super().__init__(db)
        self.leads = self._repo("leads", LeadRepository)

    async def create(self, payload: LeadCreate, *, actor_id: uuid.UUID | None = None, user_id: uuid.UUID | None = None) -> Lead:
        """Create a lead (optionally linked to the caller's account)."""
        lead = Lead(**payload.model_dump())
        lead.lead_score = self._score(payload.priority, payload.budget_min, payload.budget_max, payload.phone, payload.interested_in)
        lead.user_id = user_id
        await self.leads.add(lead)
        await write_audit_log(
            self.db,
            action="lead.created",
            resource_type="lead",
            resource_id=lead.id,
            actor_user_id=actor_id,
            new_value={"name": lead.name, "email": lead.email},
        )
        await self.commit()
        return lead

    async def get(self, lead_id: uuid.UUID) -> Lead:
        """Fetch a lead or raise 404."""
        return await self.leads.get_or_404(lead_id)

    async def update(self, lead_id: uuid.UUID, payload: LeadUpdate, *, actor_id: uuid.UUID | None = None) -> Lead:
        """Update lead fields, recomputing the score when relevant fields change."""
        lead = await self.leads.get_or_404(lead_id)
        data = payload.model_dump(exclude_unset=True)
        old_status = lead.status
        for field, value in data.items():
            setattr(lead, field, value)
        score_fields = {"priority", "budget_min", "budget_max", "phone", "interested_in"}
        if score_fields.intersection(data):
            lead.lead_score = self._score(lead.priority, lead.budget_min, lead.budget_max, lead.phone, lead.interested_in)
        if "status" in data and data["status"] != old_status:
            self._apply_status_side_effects(lead, data["status"], previous_status=old_status)
        await write_audit_log(
            self.db,
            action="lead.updated",
            resource_type="lead",
            resource_id=lead.id,
            actor_user_id=actor_id,
            new_value=data,
        )
        await self.commit()
        return lead

    async def assign(self, lead_id: uuid.UUID, payload: LeadAssign, *, actor_id: uuid.UUID | None = None) -> Lead:
        """Assign a lead to an agent (validates the agent profile exists)."""
        lead = await self.leads.get_or_404(lead_id)
        from sqlalchemy import select

        from app.models.user import Agent

        agent = await self.db.scalar(select(Agent).where(Agent.user_id == payload.agent_id))
        if agent is None:
            raise NotFoundException("Agent not found", error_code="agent_not_found")
        old_agent = lead.assigned_to
        lead.assigned_to = agent.id
        if lead.status == LeadStatus.NEW:
            lead.status = LeadStatus.CONTACTED
        await write_audit_log(
            self.db,
            action="lead.assigned",
            resource_type="lead",
            resource_id=lead.id,
            actor_user_id=actor_id,
            old_value={"assigned_to": old_agent},
            new_value={"assigned_to": agent.id},
        )
        await self.commit()
        return lead

    async def transition(self, lead_id: uuid.UUID, new_status: LeadStatus, *, reason: str | None = None, actor_id: uuid.UUID | None = None) -> Lead:
        """Move a lead through the pipeline, applying won/lost side effects."""
        lead = await self.leads.get_or_404(lead_id)
        if new_status == lead.status:
            return lead
        self._apply_status_side_effects(lead, new_status, reason, previous_status=lead.status)
        lead.status = new_status
        await write_audit_log(
            self.db,
            action="lead.status_changed",
            resource_type="lead",
            resource_id=lead.id,
            actor_user_id=actor_id,
            old_value={"status": lead.status.value},
            new_value={"status": new_status.value, "reason": reason},
        )
        await self.commit()
        return lead

    async def list(
        self,
        *,
        page: int = 1,
        page_size: int = 20,
        status: LeadStatus | None = None,
        priority: LeadPriority | None = None,
        assigned_to: uuid.UUID | None = None,
        user_id: uuid.UUID | None = None,
        email: str | None = None,
        search: str | None = None,
    ) -> Page[Lead]:
        """Paginate leads with optional filters."""
        return await self.leads.list_leads(
            page=page,
            page_size=page_size,
            status=status,
            priority=priority,
            assigned_to=assigned_to,
            user_id=user_id,
            email=email,
            search=search,
        )

    async def list_due_follow_ups(self, *, limit: int = 50) -> list[Lead]:
        """Leads whose next follow-up is due."""
        return await self.leads.list_due_follow_ups(limit=limit)

    # --- Helpers -----------------------------------------------------------------

    @staticmethod
    def _score(priority: LeadPriority, budget_min: float | None, budget_max: float | None, phone: str | None, interested_in) -> int:
        score = _PRIORITY_POINTS.get(priority, 0)
        if budget_min is not None or budget_max is not None:
            score += 10
        if phone:
            score += 5
        if interested_in == "investment":
            score += 5
        return min(score, 100)

    def _apply_status_side_effects(self, lead: Lead, new_status: LeadStatus, reason: str | None = None, previous_status: LeadStatus | None = None) -> None:
        if previous_status in {LeadStatus.WON, LeadStatus.LOST} and new_status not in {LeadStatus.WON, LeadStatus.LOST}:
            raise BusinessException("A won/lost lead cannot be reopened.", error_code="lead_closed")
        if new_status == LeadStatus.WON:
            if lead.converted_at is None:
                lead.converted_at = utcnow()
        elif new_status == LeadStatus.LOST:
            if lead.lost_at is None:
                lead.lost_at = utcnow()
            if reason:
                lead.lost_reason = reason

    # ── Phase 7.5: AI Consultant lead methods ─────────────────────────────────

    async def upsert_by_whatsapp(
        self,
        whatsapp_number: str,
        profile: Any,
        *,
        conversation_id: uuid.UUID | None = None,
    ) -> Lead:
        """Deduplicate by WhatsApp number. Creates or updates the lead.

        PostgreSQL is the source of truth. Call this BEFORE sending WhatsApp messages.
        """
        # 1. Look for existing lead with same WhatsApp number
        existing: Lead | None = None
        stmt = select(Lead).where(
            Lead.whatsapp_number == whatsapp_number, Lead.deleted_at.is_(None)
        )
        existing = await self.db.scalar(stmt)

        # 2. Also check phone column
        if not existing:
            stmt2 = select(Lead).where(
                Lead.phone == whatsapp_number, Lead.deleted_at.is_(None)
            )
            existing = await self.db.scalar(stmt2)

        name = getattr(profile, "name", None) or "Amnaya Visitor"
        email = getattr(profile, "email", None)

        if existing:
            # Update in place — never create duplicates
            if name and name != "Amnaya Visitor":
                existing.name = name
            if email:
                existing.email = email
            existing.whatsapp_number = whatsapp_number
            existing.phone = existing.phone or whatsapp_number
            self._apply_profile(existing, profile, conversation_id)
            existing.lead_score = self._compute_score(existing)
            existing.priority = self._priority_from_score(existing.lead_score)
            await write_audit_log(
                self.db, action="lead.updated_from_conversation",
                resource_type="lead", resource_id=existing.id,
                new_value={"whatsapp_number": whatsapp_number, "lead_score": existing.lead_score},
            )
            await self.commit()
            return existing

        # 3. Create new lead
        lead = Lead(
            name=name,
            email=email,
            phone=whatsapp_number,
            whatsapp_number=whatsapp_number,
            source="ai_consultant",
            status=LeadStatus.NEW,
        )
        self._apply_profile(lead, profile, conversation_id)
        lead.lead_score = self._compute_score(lead)
        lead.priority = self._priority_from_score(lead.lead_score)
        self.db.add(lead)
        await write_audit_log(
            self.db, action="lead.created_from_conversation",
            resource_type="lead", resource_id=lead.id,
            new_value={"whatsapp_number": whatsapp_number, "name": name},
        )
        await self.commit()
        return lead

    async def create_from_conversation(
        self,
        profile: Any,
        *,
        conversation_id: uuid.UUID | None = None,
        source: str = "ai_consultant",
    ) -> Lead:
        """Create or update a lead from a ConversationLeadProfile.

        Deduplicates first by WhatsApp, then by email, then creates new.
        """
        whatsapp = getattr(profile, "whatsapp_number", None)
        email = getattr(profile, "email", None)

        if whatsapp:
            return await self.upsert_by_whatsapp(
                whatsapp, profile, conversation_id=conversation_id
            )

        # Deduplicate by email if provided
        existing: Lead | None = None
        if email:
            stmt = select(Lead).where(Lead.email == email, Lead.deleted_at.is_(None))
            existing = await self.db.scalar(stmt)

        name = getattr(profile, "name", None) or "Amnaya Visitor"
        if existing:
            self._apply_profile(existing, profile, conversation_id)
            existing.lead_score = self._compute_score(existing)
            existing.priority = self._priority_from_score(existing.lead_score)
            await self.commit()
            return existing

        lead = Lead(
            name=name,
            email=email,
            phone=getattr(profile, "phone", None),
            source=source,
            status=LeadStatus.NEW,
        )
        self._apply_profile(lead, profile, conversation_id)
        lead.lead_score = self._compute_score(lead)
        lead.priority = self._priority_from_score(lead.lead_score)
        self.db.add(lead)
        await write_audit_log(
            self.db, action="lead.created_from_conversation",
            resource_type="lead", resource_id=lead.id,
            new_value={"name": name, "source": source},
        )
        await self.commit()
        return lead

    async def record_whatsapp_consent(
        self,
        lead_id: uuid.UUID,
        consent: bool,
        *,
        source: str = "ai_consultant",
    ) -> Lead:
        """Record WhatsApp consent (or declination). Writes audit log."""
        lead = await self.leads.get_or_404(lead_id)
        lead.whatsapp_consent = consent
        lead.consent_timestamp = utcnow()
        lead.consent_source = source
        await write_audit_log(
            self.db,
            action="lead.whatsapp_consent_given" if consent else "lead.whatsapp_consent_declined",
            resource_type="lead",
            resource_id=lead.id,
            new_value={"whatsapp_consent": consent, "consent_source": source},
        )
        await self.commit()
        return lead

    async def update_unit_interest(
        self,
        lead_id: uuid.UUID,
        unit_id: str,
        interaction_type: str = "viewed",
    ) -> Lead:
        """Append a unit to the appropriate interaction list on the lead."""
        lead = await self.leads.get_or_404(lead_id)
        field_map = {
            "viewed": "viewed_unit_ids",
            "interested": "interested_unit_ids",
            "compared": "compared_unit_ids",
            "recommended": "recommended_unit_ids",
        }
        field = field_map.get(interaction_type, "viewed_unit_ids")
        current = list(getattr(lead, field) or [])
        if unit_id not in current:
            current.append(unit_id)
            setattr(lead, field, current)
            lead.lead_score = self._compute_score(lead)
        await self.commit()
        return lead

    @staticmethod
    def generate_sales_summary(lead: Lead) -> str:
        """Produce a concise sales-team text card from a Lead record."""
        from datetime import datetime
        lines = [
            "── AMNAYA AI LEAD CARD ──────────────────────────────",
            f"Name        : {lead.name}",
            f"WhatsApp    : {lead.whatsapp_number or lead.phone or 'N/A'}",
            f"City        : {lead.location or '—'}",
            f"Purpose     : {(lead.buying_purpose or '—').replace('_', ' ').title()}",
            f"Config      : {lead.configuration or '3BHK'}",
        ]
        if lead.budget_max:
            lines.append(f"Budget      : ₹{lead.budget_max / 10_000_000:.1f} Cr")
        if lead.preferred_view:
            lines.append(f"View        : {lead.preferred_view.replace('_', ' ').title()}")
        if lead.preferred_floor:
            lines.append(f"Floor       : {lead.preferred_floor.replace('_', ' ').title()}")
        if lead.buying_timeline:
            lines.append(f"Timeline    : {lead.buying_timeline}")
        units = lead.interested_unit_ids or []
        if units:
            lines.append(f"Interested  : {', '.join(units)}")
        lines.append(f"Lead Score  : {lead.lead_score}/100")
        lines.append(f"Site Visit  : {'Yes' if lead.site_visit_interest else 'No'}")
        lines.append(f"Consent     : {'Yes' if lead.whatsapp_consent else 'No'}")
        lines.append("─────────────────────────────────────────────────────")
        return "\n".join(lines)

    @staticmethod
    def _apply_profile(lead: Lead, profile: Any, conversation_id: uuid.UUID | None = None) -> None:
        """Copy profile fields onto a Lead model object."""
        field_map = [
            ("location", "location"),
            ("buying_purpose", "buying_purpose"),
            ("buying_timeline", "buying_timeline"),
            ("configuration", "configuration"),
            ("budget_min", "budget_min"),
            ("budget_max", "budget_max"),
            ("preferred_floor", "preferred_floor"),
            ("preferred_view", "preferred_view"),
            ("preferred_orientation", "preferred_orientation"),
            ("family_size", "family_size"),
            ("site_visit_interest", "site_visit_interest"),
            ("whatsapp_consent", "whatsapp_consent"),
            ("consent_source", "consent_source"),
            ("interested_unit_ids", "interested_unit_ids"),
            ("viewed_unit_ids", "viewed_unit_ids"),
            ("compared_unit_ids", "compared_unit_ids"),
            ("recommended_unit_ids", "recommended_unit_ids"),
        ]
        for src, dst in field_map:
            val = getattr(profile, src, None)
            if val is not None:
                setattr(lead, dst, val)
        if conversation_id:
            lead.conversation_id = conversation_id
        if getattr(profile, "whatsapp_consent", None) and getattr(profile, "consent_timestamp", None) is None:
            lead.consent_timestamp = utcnow()

    @staticmethod
    def _compute_score(lead: Lead) -> int:
        """Compute lead score using the Phase 7.5 engine."""
        from app.ai.lead_scoring import lead_scoring_engine
        profile_dict = {
            "name": lead.name,
            "phone": lead.phone,
            "whatsapp_number": lead.whatsapp_number,
            "whatsapp_consent": lead.whatsapp_consent,
            "buying_purpose": lead.buying_purpose,
            "buying_timeline": lead.buying_timeline,
            "budget_min": lead.budget_min,
            "budget_max": lead.budget_max,
            "configuration": lead.configuration,
            "preferred_view": lead.preferred_view,
            "preferred_floor": lead.preferred_floor,
            "preferred_orientation": lead.preferred_orientation,
            "interested_unit_ids": lead.interested_unit_ids,
            "viewed_unit_ids": lead.viewed_unit_ids,
            "compared_unit_ids": lead.compared_unit_ids,
            "site_visit_interest": lead.site_visit_interest,
        }
        return lead_scoring_engine.score(profile_dict).total

    @staticmethod
    def _priority_from_score(score: int) -> LeadPriority:
        """Map lead score to priority."""
        if score >= 75:
            return LeadPriority.HIGH
        if score >= 45:
            return LeadPriority.MEDIUM
        return LeadPriority.LOW
