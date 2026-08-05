"""Notification service: in-app/email notifications for users."""

from __future__ import annotations

import uuid
from datetime import UTC, datetime

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundException
from app.models.enums import (
    NotificationCategory,
    NotificationStatus,
    NotificationType,
)
from app.models.system import Notification
from app.repositories.notification import NotificationRepository
from app.services.base import BaseService
from app.utils.email import EmailService
from app.utils.pagination import Page


class NotificationService(BaseService):
    """Owns notification creation, delivery and read-state."""

    def __init__(self, db: AsyncSession, *, email_service: EmailService | None = None) -> None:
        super().__init__(db)
        self.notifications = self._repo("notifications", NotificationRepository)
        self.email_service = email_service or EmailService()

    async def notify(
        self,
        *,
        user_id: uuid.UUID,
        type_: NotificationType = NotificationType.IN_APP,
        category: NotificationCategory = NotificationCategory.SYSTEM,
        title: str,
        body: str | None = None,
        data: dict | None = None,
    ) -> Notification:
        """Create a notification; EMAIL/SMS types are delivered and their status updated."""
        notification = Notification(
            user_id=user_id,
            type=type_,
            category=category,
            title=title,
            body=body,
            data=data,
            status=NotificationStatus.PENDING,
        )
        await self.notifications.add(notification)

        if type_ in {NotificationType.EMAIL, NotificationType.PUSH, NotificationType.SMS}:
            from app.models.user import User

            user = await self.db.get(User, user_id)
            if user is not None and user.email:
                result = await self.email_service.send(user.email, title, f"<p>{body or ''}</p>")
                notification.status = NotificationStatus.SENT if result.sent else NotificationStatus.FAILED
                notification.sent_at = datetime.now(UTC) if result.sent else None
                notification.failure_reason = result.reason
            else:
                notification.status = NotificationStatus.FAILED
                notification.failure_reason = "no_recipient"
        await self.commit()
        return notification

    async def get(self, notification_id: uuid.UUID, *, user_id: uuid.UUID) -> Notification:
        """Fetch a notification owned by the caller."""
        notification = await self.notifications.get_or_404(notification_id)
        if notification.user_id != user_id:
            raise NotFoundException("Notification not found", error_code="notification_not_found")
        return notification

    async def list(self, user_id: uuid.UUID, *, page: int = 1, page_size: int = 20, unread_first: bool = True) -> Page[Notification]:
        """Paginate a user's notifications."""
        return await self.notifications.list_user_notifications(
            user_id, page=page, page_size=page_size, unread_first=unread_first
        )

    async def unread_count(self, user_id: uuid.UUID) -> int:
        """Return the number of unread notifications."""
        return await self.notifications.unread_count(user_id)

    async def mark_read(self, notification_id: uuid.UUID, *, user_id: uuid.UUID) -> Notification:
        """Mark one notification read (owner only)."""
        notification = await self.get(notification_id, user_id=user_id)
        await self.notifications.mark_read(notification)
        await self.commit()
        return notification

    async def mark_all_read(self, user_id: uuid.UUID) -> int:
        """Mark all notifications read; returns how many were updated."""
        count = await self.notifications.mark_all_read(user_id)
        await self.commit()
        return count
