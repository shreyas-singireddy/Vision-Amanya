"""Booking service: scheduling, double-booking prevention and lifecycle."""

from __future__ import annotations

import uuid
from datetime import timedelta

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import BusinessException, NotFoundException
from app.models.crm import Booking
from app.models.enums import BookingStatus
from app.models.property import Project, Property
from app.repositories.booking import BookingRepository
from app.schemas.booking import BookingCreate, BookingUpdate
from app.services.base import BaseService
from app.utils.audit import write_audit_log
from app.utils.booking_number import generate_booking_number
from app.utils.pagination import Page


class BookingService(BaseService):
    """Owns scheduling rules and booking lifecycle."""

    def __init__(self, db: AsyncSession) -> None:
        super().__init__(db)
        self.bookings = self._repo("bookings", BookingRepository)

    async def create(
        self,
        payload: BookingCreate,
        *,
        user_id: uuid.UUID | None = None,
        enquiry_id: uuid.UUID | None = None,
        actor_id: uuid.UUID | None = None,
    ) -> Booking:
        """Create a booking after validating references and availability."""
        if payload.property_id is None and payload.project_id is None:
            raise BusinessException("A booking must reference a property or project.", error_code="booking_reference_required")

        property_ = None
        project = None
        if payload.property_id:
            property_ = await self.db.get(Property, payload.property_id)
            if property_ is None:
                raise NotFoundException("Property not found", error_code="property_not_found")
            agent_id = property_.listing_agent_id
        else:
            project = await self.db.get(Project, payload.project_id)
            if project is None:
                raise NotFoundException("Project not found", error_code="project_not_found")
            agent_id = None

        start = payload.scheduled_at
        end = start + timedelta(minutes=payload.duration_minutes)
        overlaps = await self.bookings.find_overlap(
            property_id=payload.property_id,
            agent_id=agent_id,
            start=start,
            end=end,
        )
        if overlaps:
            raise BusinessException(
                "The requested slot conflicts with an existing booking.",
                error_code="booking_slot_conflict",
            )

        booking = Booking(
            user_id=user_id,
            enquiry_id=enquiry_id,
            property_id=payload.property_id,
            project_id=payload.project_id,
            agent_id=agent_id,
            scheduled_at=payload.scheduled_at,
            duration_minutes=payload.duration_minutes,
            visit_type=payload.visit_type,
            attendee_count=payload.attendee_count,
            notes=payload.notes,
            status=BookingStatus.REQUESTED,
        )
        booking.booking_number = await self._unique_booking_number()
        await self.bookings.add(booking)
        await write_audit_log(
            self.db,
            action="booking.created",
            resource_type="booking",
            resource_id=booking.id,
            actor_user_id=actor_id,
            new_value={"booking_number": booking.booking_number, "scheduled_at": booking.scheduled_at.isoformat()},
        )
        await self.commit()
        return booking

    async def get(self, booking_id: uuid.UUID) -> Booking:
        """Fetch a booking or raise 404."""
        return await self.bookings.get_or_404(booking_id)

    async def get_by_number(self, booking_number: str) -> Booking:
        """Fetch a booking by its reference number."""
        booking = await self.bookings.get_by_number(booking_number)
        if booking is None:
            raise NotFoundException("Booking not found", error_code="booking_not_found")
        return booking

    async def update(self, booking_id: uuid.UUID, payload: BookingUpdate, *, actor_id: uuid.UUID | None = None) -> Booking:
        """Update a booking; rescheduling re-checks availability."""
        booking = await self.bookings.get_or_404(booking_id)
        data = payload.model_dump(exclude_unset=True)
        old = booking.scheduled_at

        if data.get("scheduled_at"):
            new_start = data["scheduled_at"]
            duration = data.get("duration_minutes", booking.duration_minutes or 60)
            overlaps = await self.bookings.find_overlap(
                property_id=booking.property_id,
                agent_id=booking.agent_id,
                start=new_start,
                end=new_start + timedelta(minutes=duration),
                exclude_booking_id=booking.id,
            )
            if overlaps:
                raise BusinessException("The requested slot conflicts with an existing booking.", error_code="booking_slot_conflict")

        if "status" in data:
            self._validate_status_transition(booking, data["status"])

        for field, value in data.items():
            setattr(booking, field, value)

        await write_audit_log(
            self.db,
            action="booking.updated",
            resource_type="booking",
            resource_id=booking.id,
            actor_user_id=actor_id,
            old_value={"scheduled_at": old.isoformat()} if old != booking.scheduled_at else None,
            new_value=data,
        )
        await self.commit()
        return booking

    async def cancel(self, booking_id: uuid.UUID, *, reason: str | None = None, actor_id: uuid.UUID | None = None) -> Booking:
        """Cancel a booking with a reason."""
        booking = await self.bookings.get_or_404(booking_id)
        self._validate_status_transition(booking, BookingStatus.CANCELLED)
        booking.status = BookingStatus.CANCELLED
        booking.cancellation_reason = reason
        await write_audit_log(
            self.db,
            action="booking.cancelled",
            resource_type="booking",
            resource_id=booking.id,
            actor_user_id=actor_id,
            new_value={"reason": reason},
        )
        await self.commit()
        return booking

    async def list(
        self,
        *,
        page: int = 1,
        page_size: int = 20,
        status: BookingStatus | None = None,
        user_id: uuid.UUID | None = None,
        agent_id: uuid.UUID | None = None,
        property_id: uuid.UUID | None = None,
    ) -> Page[Booking]:
        """Paginate bookings with optional filters."""
        return await self.bookings.list_bookings(
            page=page,
            page_size=page_size,
            status=status,
            user_id=user_id,
            agent_id=agent_id,
            property_id=property_id,
        )

    async def _unique_booking_number(self) -> str:
        attempt = 0
        while True:
            candidate = generate_booking_number(attempt)
            if await self.bookings.get_by_number(candidate) is None:
                return candidate
            attempt += 1
            if attempt > 100:
                raise BusinessException("Could not allocate a unique booking number.", error_code="booking_number_alloc_failed")

    @staticmethod
    def _validate_status_transition(booking: Booking, new_status: BookingStatus) -> None:
        if new_status == booking.status:
            return
        if booking.status == BookingStatus.CANCELLED:
            raise BusinessException("A cancelled booking cannot change status.", error_code="booking_closed")
        if new_status == BookingStatus.REQUESTED and booking.status not in {BookingStatus.REQUESTED, BookingStatus.CONFIRMED}:
            raise BusinessException("A completed/cancelled booking cannot revert to requested.", error_code="booking_status_illegal")
