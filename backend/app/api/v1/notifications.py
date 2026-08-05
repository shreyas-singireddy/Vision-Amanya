"""Notification endpoints."""

from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import CurrentUser, Pagination
from app.core.database import get_db
from app.core.response import success_response
from app.schemas.notification import NotificationResponse
from app.services.notification_service import NotificationService

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("/me")
async def my_notifications(
    user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
    pagination: Pagination,
) -> dict:
    """List the caller's notifications."""
    service = NotificationService(db)
    page, page_size = pagination
    result = await service.list(user.id, page=page, page_size=page_size)
    return success_response({
        "items": [NotificationResponse.model_validate(n).model_dump() for n in result.items],
        "meta": result.as_dict(),
    })


@router.get("/me/unread-count")
async def unread_count(
    user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Return the caller's unread notification count."""
    service = NotificationService(db)
    count = await service.unread_count(user.id)
    return success_response({"count": count})


@router.patch("/{notification_id}/read")
async def mark_read(
    notification_id: uuid.UUID,
    user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Mark one notification as read."""
    service = NotificationService(db)
    notification = await service.mark_read(notification_id, user_id=user.id)
    return success_response(NotificationResponse.model_validate(notification).model_dump(), message="Notification marked read.")


@router.post("/me/read-all")
async def mark_all_read(
    user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Mark all of the caller's notifications as read."""
    service = NotificationService(db)
    count = await service.mark_all_read(user.id)
    return success_response({"updated": count}, message="All notifications marked read.")
