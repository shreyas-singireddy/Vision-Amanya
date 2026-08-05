"""Notification schemas."""

from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import NotificationCategory, NotificationStatus, NotificationType


class NotificationResponse(BaseModel):
    """Notification representation."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    type: NotificationType
    category: NotificationCategory
    title: str
    body: str | None = None
    data: dict | None = None
    status: NotificationStatus
    read_at: datetime | None = None
    created_at: datetime


class NotificationListResponse(BaseModel):
    """Paginated notification collection."""

    items: list[NotificationResponse]
    meta: dict


class UnreadCountResponse(BaseModel):
    """Unread notification count."""

    count: int = Field(..., ge=0)
