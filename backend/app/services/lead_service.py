"""Lead service: pipeline management, assignment and scoring."""

from __future__ import annotations

import uuid

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
