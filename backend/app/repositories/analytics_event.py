"""Analytics-event repository."""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import select

from app.models.system import AnalyticsEvent
from app.repositories.base import BaseRepository
from app.utils.pagination import Page


class AnalyticsEventRepository(BaseRepository[AnalyticsEvent]):
    """Data access for the append-only ``analytics_events`` stream."""

    model = AnalyticsEvent

    async def list_events(
        self,
        *,
        page: int = 1,
        page_size: int = 20,
        event_type: str | None = None,
        entity_type: str | None = None,
        from_date: datetime | None = None,
    ) -> Page[AnalyticsEvent]:
        """List events newest first with optional filters."""
        stmt = select(AnalyticsEvent).order_by(AnalyticsEvent.created_at.desc())
        if event_type:
            stmt = stmt.where(AnalyticsEvent.event_type == event_type)
        if entity_type:
            stmt = stmt.where(AnalyticsEvent.entity_type == entity_type)
        if from_date:
            stmt = stmt.where(AnalyticsEvent.created_at >= from_date)
        return await self.paginate(stmt, page, page_size)

    async def count_since(self, since: datetime) -> int:
        """Count events recorded since a timestamp (activity metric)."""
        return await self.count(select(AnalyticsEvent).where(AnalyticsEvent.created_at >= since))
