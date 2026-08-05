"""Booking schemas."""

from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import BookingStatus, VisitType


class BookingCreate(BaseModel):
    """Payload for POST /api/v1/bookings."""

    property_id: uuid.UUID | None = None
    project_id: uuid.UUID | None = None
    scheduled_at: datetime = Field(..., description="Requested visit time (timezone-aware).")
    duration_minutes: int = Field(60, ge=15, le=480)
    visit_type: VisitType = VisitType.SITE_VISIT
    attendee_count: int = Field(1, ge=1, le=20)
    notes: str | None = None

    model_config = ConfigDict(json_schema_extra={"example": {
        "property_id": "00000000-0000-0000-0000-000000000000",
        "scheduled_at": "2026-08-07T10:30:00+05:30",
        "visit_type": "site_visit",
        "attendee_count": 2,
        "notes": "Prefers a morning slot.",
    }})


class BookingUpdate(BaseModel):
    """Agent/admin payload to update a booking."""

    scheduled_at: datetime | None = None
    duration_minutes: int | None = Field(None, ge=15, le=480)
    visit_type: VisitType | None = None
    status: BookingStatus | None = None
    attendee_count: int | None = Field(None, ge=1, le=20)
    cancellation_reason: str | None = Field(None, max_length=200)
    notes: str | None = None


class BookingResponse(BaseModel):
    """Booking representation."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    booking_number: str
    user_id: uuid.UUID | None = None
    enquiry_id: uuid.UUID | None = None
    property_id: uuid.UUID | None = None
    project_id: uuid.UUID | None = None
    agent_id: uuid.UUID | None = None
    scheduled_at: datetime
    duration_minutes: int = 60
    visit_type: VisitType
    status: BookingStatus
    cancellation_reason: str | None = None
    attendee_count: int = 1
    notes: str | None = None
    created_at: datetime
    updated_at: datetime


class BookingListResponse(BaseModel):
    """Paginated booking collection."""

    items: list[BookingResponse]
    meta: dict
