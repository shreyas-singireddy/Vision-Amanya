"""Review schemas."""

from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import ReviewStatus


class ReviewCreate(BaseModel):
    """Payload for POST /api/v1/reviews."""

    property_id: uuid.UUID | None = None
    project_id: uuid.UUID | None = None
    rating: int = Field(..., ge=1, le=5)
    title: str | None = Field(None, max_length=150)
    body: str | None = None
    pros: str | None = None
    cons: str | None = None

    model_config = ConfigDict(json_schema_extra={"example": {
        "property_id": "00000000-0000-0000-0000-000000000000",
        "rating": 5,
        "title": "Beautiful apartment",
        "body": "Spacious layout and great amenities.",
        "pros": "Location, finishing",
        "cons": "None",
    }})


class ReviewUpdate(BaseModel):
    """Payload for PATCH /api/v1/reviews/{id}."""

    rating: int | None = Field(None, ge=1, le=5)
    title: str | None = Field(None, max_length=150)
    body: str | None = None
    pros: str | None = None
    cons: str | None = None


class ReviewModerate(BaseModel):
    """Admin payload for POST /api/v1/reviews/{id}/moderate."""

    status: ReviewStatus = Field(..., description="'approved' or 'rejected'.")
    admin_note: str | None = Field(None, max_length=2000)


class ReviewResponse(BaseModel):
    """Review representation."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    property_id: uuid.UUID | None = None
    project_id: uuid.UUID | None = None
    booking_id: uuid.UUID | None = None
    rating: int
    title: str | None = None
    body: str | None = None
    pros: str | None = None
    cons: str | None = None
    status: ReviewStatus
    is_verified_purchase: bool = False
    created_at: datetime
    updated_at: datetime


class ReviewListResponse(BaseModel):
    """Paginated review collection."""

    items: list[ReviewResponse]
    meta: dict
