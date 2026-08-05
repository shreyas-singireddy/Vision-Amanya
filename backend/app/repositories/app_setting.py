"""App-setting repository."""

from __future__ import annotations

from sqlalchemy import select

from app.models.system import AppSetting
from app.repositories.base import BaseRepository


class AppSettingRepository(BaseRepository[AppSetting]):
    """Data access for the ``app_settings`` key/value store."""

    model = AppSetting

    async def get_by_key(self, key: str) -> AppSetting | None:
        """Fetch a setting by key."""
        return await self.session.scalar(select(AppSetting).where(AppSetting.key == key))

    async def get_public(self, key: str) -> AppSetting | None:
        """Fetch a setting only when it is marked public."""
        return await self.session.scalar(
            select(AppSetting).where(AppSetting.key == key, AppSetting.is_public.is_(True))
        )

    async def list_settings(self) -> list[AppSetting]:
        """List all settings."""
        stmt = select(AppSetting).order_by(AppSetting.key.asc())
        return list((await self.session.execute(stmt)).scalars().all())
