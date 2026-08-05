"""Notification repository."""

from __future__ import annotations

import uuid

from sqlalchemy import select

from app.models.system import Notification
from app.repositories.base import BaseRepository
from app.utils.pagination import Page


class NotificationRepository(BaseRepository[Notification]):
    """Data access for ``notifications``."""

    model = Notification

    async def list_user_notifications(
        self, user_id: uuid.UUID, *, page: int = 1, page_size: int = 20, unread_first: bool = True
    ) -> Page[Notification]:
        """List a user's notifications (unread first by default)."""
        stmt = select(Notification).where(Notification.user_id == user_id)
        if unread_first:
            stmt = stmt.order_by(Notification.read_at.is_(None).desc(), Notification.created_at.desc())
        else:
            stmt = stmt.order_by(Notification.created_at.desc())
        return await self.paginate(stmt, page, page_size)

    async def unread_count(self, user_id: uuid.UUID) -> int:
        """Count unread notifications for a user."""
        return await self.count(
            select(Notification).where(
                Notification.user_id == user_id,
                Notification.read_at.is_(None),
            )
        )

    async def mark_read(self, notification: Notification) -> None:
        """Mark a single notification read (idempotent)."""
        from app.utils.dates import utcnow

        if notification.read_at is None:
            notification.read_at = utcnow()
            notification.status = "read"
            await self.session.flush()

    async def mark_all_read(self, user_id: uuid.UUID) -> int:
        """Mark every unread notification read; returns the count updated."""
        from app.utils.dates import utcnow

        stmt = (
            select(Notification)
            .where(Notification.user_id == user_id, Notification.read_at.is_(None))
        )
        rows = list((await self.session.execute(stmt)).scalars().all())
        for notification in rows:
            notification.read_at = utcnow()
            notification.status = "read"
        if rows:
            await self.session.flush()
        return len(rows)
