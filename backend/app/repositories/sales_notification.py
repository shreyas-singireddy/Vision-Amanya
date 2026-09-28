"""Sales notification repository (internal sales-team notification log)."""

from __future__ import annotations

import uuid

from sqlalchemy import select

from app.models.crm import SalesNotification
from app.models.enums import SalesNotificationStatus
from app.repositories.base import BaseRepository
from app.utils.pagination import Page


class SalesNotificationRepository(BaseRepository[SalesNotification]):
    """Data access for ``sales_notifications`` (internal-only records)."""

    model = SalesNotification

    async def list_notifications(
        self,
        *,
        page: int = 1,
        page_size: int = 20,
        lead_id: uuid.UUID | None = None,
        status: SalesNotificationStatus | None = None,
    ) -> Page[SalesNotification]:
        """Paginate internal sales notifications, newest first."""
        stmt = select(SalesNotification).order_by(SalesNotification.created_at.desc())
        if lead_id:
            stmt = stmt.where(SalesNotification.lead_id == lead_id)
        if status:
            stmt = stmt.where(SalesNotification.status == status)
        return await self.paginate(stmt, page, page_size)
