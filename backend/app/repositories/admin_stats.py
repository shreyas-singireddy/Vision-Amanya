"""Admin statistics repository (aggregation queries for the admin panel)."""

from __future__ import annotations

from datetime import UTC, datetime, timedelta

from sqlalchemy import select

from app.models.property import Property
from app.models.system import AnalyticsEvent, AppSetting, Notification
from app.models.user import Agent
from app.repositories.base import BaseRepository


class AdminStatsRepository(BaseRepository[Property]):
    """Aggregation queries for admin dashboards."""

    model = Property

    async def count_agents(self) -> int:
        return await self.count(select(Agent))

    async def count_notifications(self) -> int:
        return await self.count(select(Notification))

    async def count_app_settings(self) -> int:
        return await self.count(select(AppSetting))

    async def count_events_since(self, since: datetime) -> int:
        return await self.count(select(AnalyticsEvent).where(AnalyticsEvent.created_at >= since))

    async def events_last_7_days(self) -> int:
        since = datetime.now(UTC) - timedelta(days=7)
        return await self.count_events_since(since)
