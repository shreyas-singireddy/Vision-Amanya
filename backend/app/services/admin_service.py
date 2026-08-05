"""Admin service: platform statistics and app-settings management."""

from __future__ import annotations

import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundException
from app.models.crm import Booking, Enquiry, Lead, Review
from app.models.property import Project, Property
from app.models.system import AppSetting, AuditLog
from app.models.user import User
from app.repositories.admin_stats import AdminStatsRepository
from app.repositories.app_setting import AppSettingRepository
from app.schemas.admin import AppSettingUpdate, SystemStats
from app.schemas.analytics import DashboardStats
from app.services.base import BaseService
from app.utils.audit import write_audit_log


class AdminService(BaseService):
    """Owns admin-only platform operations."""

    def __init__(self, db: AsyncSession) -> None:
        super().__init__(db)
        self.settings_repo = self._repo("settings", AppSettingRepository)
        self.stats = self._repo("stats", AdminStatsRepository)

    async def system_stats(self) -> SystemStats:
        """Return headline platform statistics for the admin panel."""
        return SystemStats(
            users=await self._count(User),
            agents=await self.stats.count_agents(),
            properties=await self._count(Property),
            projects=await self._count(Project),
            leads=await self._count(Lead),
            bookings=await self._count(Booking),
            enquiries=await self._count(Enquiry),
            reviews=await self._count(Review),
            notifications=await self.stats.count_notifications(),
            audit_logs=await self._count(AuditLog),
            generated_at=None,
        )

    async def dashboard_stats(self) -> DashboardStats:
        """Delegate to the analytics aggregation for the dashboard."""
        from app.services.analytics_service import AnalyticsService

        analytics = AnalyticsService(self.db)
        return await analytics.dashboard_stats()

    # --- App settings ----------------------------------------------------------

    async def list_settings(self) -> list[AppSetting]:
        """List all application settings."""
        return await self.settings_repo.list_settings()

    async def get_setting(self, key: str) -> AppSetting:
        """Fetch a setting by key or raise 404."""
        setting = await self.settings_repo.get_by_key(key)
        if setting is None:
            raise NotFoundException(f"Setting '{key}' not found", error_code="app_setting_not_found")
        return setting

    async def upsert_setting(self, key: str, payload: AppSettingUpdate, *, actor_id: uuid.UUID | None = None) -> AppSetting:
        """Create or update an application setting."""
        setting = await self.settings_repo.get_by_key(key)
        if setting is None:
            setting = AppSetting(
                key=key,
                value=payload.value,
                value_type=payload.value_type or "string",
                description=payload.description,
                is_public=payload.is_public if payload.is_public is not None else False,
                updated_by=actor_id,
            )
            await self.settings_repo.add(setting)
            action = "app_setting.created"
        else:
            if payload.value is not None:
                setting.value = payload.value
            if payload.value_type is not None:
                setting.value_type = payload.value_type
            if payload.description is not None:
                setting.description = payload.description
            if payload.is_public is not None:
                setting.is_public = payload.is_public
            setting.updated_by = actor_id
            action = "app_setting.updated"
        await write_audit_log(
            self.db,
            action=action,
            resource_type="app_setting",
            resource_id=setting.id,
            actor_user_id=actor_id,
            new_value={"key": key},
        )
        await self.commit()
        return setting

    # --- Helpers -----------------------------------------------------------------

    async def _count(self, model: type) -> int:
        return await self.db.scalar(select(func.count()).select_from(model)) or 0
