"""Booking repository."""

from __future__ import annotations

import uuid
from datetime import datetime, timedelta

from sqlalchemy import select

from app.models.crm import Booking
from app.models.enums import BookingStatus
from app.repositories.base import BaseRepository
from app.utils.pagination import Page


class BookingRepository(BaseRepository[Booking]):
    """Data access for ``bookings`` (site visits / virtual tours / calls)."""

    model = Booking

    async def list_bookings(
        self,
        *,
        page: int = 1,
        page_size: int = 20,
        status: BookingStatus | None = None,
        user_id: uuid.UUID | None = None,
        agent_id: uuid.UUID | None = None,
        property_id: uuid.UUID | None = None,
    ) -> Page[Booking]:
        """List bookings with optional filters, soonest scheduled first."""
        stmt = select(Booking).order_by(Booking.scheduled_at.asc())
        if status:
            stmt = stmt.where(Booking.status == status)
        if user_id:
            stmt = stmt.where(Booking.user_id == user_id)
        if agent_id:
            stmt = stmt.where(Booking.agent_id == agent_id)
        if property_id:
            stmt = stmt.where(Booking.property_id == property_id)
        return await self.paginate(stmt, page, page_size)

    async def find_overlap(
        self,
        *,
        property_id: uuid.UUID | None,
        agent_id: uuid.UUID | None,
        start: datetime,
        end: datetime,
        exclude_booking_id: uuid.UUID | None = None,
    ) -> list[Booking]:
        """Bookings overlapping ``[start, end]`` for the same property/agent.

        Used to reject double-bookings. An existing booking overlaps when its
        window intersects the requested one.
        """
        conditions = [Booking.status.notin_(["cancelled", "no_show"])]
        if property_id:
            conditions.append(Booking.property_id == property_id)
        if agent_id:
            conditions.append(Booking.agent_id == agent_id)
        if exclude_booking_id:
            conditions.append(Booking.id != exclude_booking_id)
        stmt = select(Booking).where(*conditions, Booking.scheduled_at < end)
        rows = list((await self.session.execute(stmt)).scalars().all())
        return [b for b in rows if (b.scheduled_at + timedelta(minutes=b.duration_minutes or 60)) > start]

    async def get_by_number(self, booking_number: str) -> Booking | None:
        """Fetch a booking by its reference number."""
        return await self.session.scalar(
            select(Booking).where(Booking.booking_number == booking_number)
        )
