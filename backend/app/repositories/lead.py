"""Lead repository."""

from __future__ import annotations

import uuid

from sqlalchemy import select

from app.models.crm import Lead
from app.models.enums import LeadPriority, LeadStatus
from app.repositories.base import BaseRepository
from app.utils.pagination import Page


class LeadRepository(BaseRepository[Lead]):
    """Data access for ``leads`` (sales pipeline)."""

    model = Lead

    async def list_leads(
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
        """List leads with optional filters, newest first."""
        stmt = select(Lead).order_by(Lead.created_at.desc())
        if status:
            stmt = stmt.where(Lead.status == status)
        if priority:
            stmt = stmt.where(Lead.priority == priority)
        if assigned_to:
            stmt = stmt.where(Lead.assigned_to == assigned_to)
        if user_id:
            stmt = stmt.where(Lead.user_id == user_id)
        if email:
            stmt = stmt.where(Lead.email == email)
        if search:
            like = f"%{search}%"
            stmt = stmt.where(
                Lead.name.ilike(like) | Lead.email.ilike(like) | Lead.phone.ilike(like)
            )
        return await self.paginate(stmt, page, page_size)

    async def list_due_follow_ups(self, *, limit: int = 50) -> list[Lead]:
        """Leads with a next follow-up at or before now that are still open."""
        from app.utils.dates import utcnow

        stmt = (
            select(Lead)
            .where(
                Lead.next_follow_up_at.isnot(None),
                Lead.next_follow_up_at <= utcnow(),
                Lead.status.notin_(["won", "lost"]),
            )
            .order_by(Lead.next_follow_up_at.asc())
            .limit(limit)
        )
        return list((await self.session.execute(stmt)).scalars().all())

    async def count_open(self) -> int:
        """Count leads not yet won/lost."""
        return await self.count(
            select(Lead).where(Lead.status.notin_(["won", "lost"]))
        )
