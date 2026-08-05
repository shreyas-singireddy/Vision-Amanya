"""Booking endpoints: scheduling and lifecycle."""

from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import ActiveUser, CurrentUser, Pagination, require_permission
from app.core.database import get_db
from app.core.response import success_response
from app.models.enums import BookingStatus
from app.permissions import BOOKING_CREATE, BOOKING_READ, BOOKING_UPDATE
from app.schemas.booking import BookingCreate, BookingResponse, BookingUpdate
from app.services.booking_service import BookingService

router = APIRouter(prefix="/bookings", tags=["bookings"])


def _serialize_page(result) -> dict:
    return {
        "items": [BookingResponse.model_validate(b).model_dump() for b in result.items],
        "meta": result.as_dict(),
    }


@router.post("", dependencies=[Depends(require_permission(BOOKING_CREATE))])
async def create_booking(
    payload: BookingCreate,
    user: CurrentUser,
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Create a booking for the caller (authenticated user)."""
    service = BookingService(db)
    booking = await service.create(payload, user_id=user.id, actor_id=user.id)
    return success_response(BookingResponse.model_validate(booking).model_dump(), message="Booking requested.")


@router.get("/my")
async def my_bookings(
    user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
    pagination: Pagination,
    status: Annotated[BookingStatus | None, Query()] = None,
) -> dict:
    """List the caller's bookings."""
    service = BookingService(db)
    page, page_size = pagination
    result = await service.list(page=page, page_size=page_size, status=status, user_id=user.id)
    return success_response(_serialize_page(result))


@router.get("/number/{booking_number}", dependencies=[Depends(require_permission(BOOKING_READ))])
async def get_booking_by_number(
    booking_number: str,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Fetch a booking by reference number (agent/admin)."""
    service = BookingService(db)
    booking = await service.get_by_number(booking_number)
    return success_response(BookingResponse.model_validate(booking).model_dump())


@router.get("", dependencies=[Depends(require_permission(BOOKING_READ))])
async def list_bookings(
    db: Annotated[AsyncSession, Depends(get_db)],
    pagination: Pagination,
    status: Annotated[BookingStatus | None, Query()] = None,
    user_id: Annotated[uuid.UUID | None, Query()] = None,
    agent_id: Annotated[uuid.UUID | None, Query()] = None,
    property_id: Annotated[uuid.UUID | None, Query()] = None,
) -> dict:
    """List bookings with optional filters (agent/admin)."""
    service = BookingService(db)
    page, page_size = pagination
    result = await service.list(
        page=page,
        page_size=page_size,
        status=status,
        user_id=user_id,
        agent_id=agent_id,
        property_id=property_id,
    )
    return success_response(_serialize_page(result))


@router.get("/{booking_id}")
async def get_booking(
    booking_id: uuid.UUID,
    user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Fetch a booking (owner or agent/admin)."""
    service = BookingService(db)
    booking = await service.get(booking_id)
    if booking.user_id != user.id:
        from app.core.exceptions import PermissionDeniedException

        raise PermissionDeniedException("You can only view your own bookings.", error_code="booking_not_owned")
    return success_response(BookingResponse.model_validate(booking).model_dump())


@router.patch("/{booking_id}", dependencies=[Depends(require_permission(BOOKING_UPDATE))])
async def update_booking(
    booking_id: uuid.UUID,
    payload: BookingUpdate,
    actor: ActiveUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Update a booking (agent/admin)."""
    service = BookingService(db)
    booking = await service.update(booking_id, payload, actor_id=actor.id)
    return success_response(BookingResponse.model_validate(booking).model_dump(), message="Booking updated.")


@router.post("/{booking_id}/cancel", dependencies=[Depends(require_permission(BOOKING_UPDATE))])
async def cancel_booking(
    booking_id: uuid.UUID,
    payload: dict,
    actor: ActiveUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Cancel a booking with an optional reason (agent/admin)."""
    service = BookingService(db)
    booking = await service.cancel(booking_id, reason=payload.get("reason"), actor_id=actor.id)
    return success_response(BookingResponse.model_validate(booking).model_dump(), message="Booking cancelled.")
