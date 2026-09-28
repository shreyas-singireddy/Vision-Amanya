"""CRM task repository (internal sales follow-up work)."""

from __future__ import annotations

import uuid

from sqlalchemy import func, select

from app.models.crm_task import CrmTask
from app.models.enums import CrmTaskStatus, LeadPriority
from app.models.user import Agent
from app.repositories.base import BaseRepository
from app.utils.pagination import Page


class CrmTaskRepository(BaseRepository[CrmTask]):
    """Data access for ``crm_tasks`` (no business rules)."""

    model = CrmTask

    async def get_by_dedupe_key(self, dedupe_key: str) -> CrmTask | None:
        """Fetch the task previously created for a business state, if any."""
        return await self.session.scalar(
            select(CrmTask).where(CrmTask.dedupe_key == dedupe_key)
        )

    async def list_tasks(
        self,
        *,
        page: int = 1,
        page_size: int = 20,
        lead_id: uuid.UUID | None = None,
        assigned_to: uuid.UUID | None = None,
        status: CrmTaskStatus | None = None,
        priority: LeadPriority | None = None,
    ) -> Page[CrmTask]:
        """Paginate CRM tasks, newest first, with optional filters."""
        stmt = select(CrmTask).order_by(CrmTask.created_at.desc())
        if lead_id:
            stmt = stmt.where(CrmTask.lead_id == lead_id)
        if assigned_to:
            stmt = stmt.where(CrmTask.assigned_to == assigned_to)
        if status:
            stmt = stmt.where(CrmTask.status == status)
        if priority:
            stmt = stmt.where(CrmTask.priority == priority)
        return await self.paginate(stmt, page, page_size)

    async def list_for_lead(self, lead_id: uuid.UUID) -> list[CrmTask]:
        """Every task raised for one lead, newest first."""
        stmt = (
            select(CrmTask)
            .where(CrmTask.lead_id == lead_id)
            .order_by(CrmTask.created_at.desc())
        )
        return list((await self.session.execute(stmt)).scalars().all())

    async def count_open_for_agent(self, agent_id: uuid.UUID) -> int:
        """Number of still-actionable tasks owned by an agent."""
        return await self.count(
            select(CrmTask).where(
                CrmTask.assigned_to == agent_id,
                CrmTask.status.in_([CrmTaskStatus.OPEN, CrmTaskStatus.IN_PROGRESS]),
            )
        )

    async def list_active_sales_agents(self) -> list[Agent]:
        """Active sales agents, mirroring the existing handoff assignment pool.

        ``HandoffService.assign_sales_consultant`` selects active agents with the
        same predicate; this keeps the CRM-task assignment pool identical to the
        handoff pool instead of inventing a new roster.
        """
        from app.models.enums import AgentStatus

        stmt = select(Agent).where(Agent.status == AgentStatus.ACTIVE).order_by(Agent.created_at.asc())
        return list((await self.session.execute(stmt)).scalars().all())

    async def count_by_status(self) -> dict[str, int]:
        """Task counts grouped by status (internal reporting)."""
        rows = (
            await self.session.execute(
                select(CrmTask.status, func.count(CrmTask.id)).group_by(CrmTask.status)
            )
        ).all()
        return {str(status.value if hasattr(status, "value") else status): count for status, count in rows}
