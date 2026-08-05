"""Favorite schemas."""

from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class FavoriteCreate(BaseModel):
    """Payload for POST /api/v1/favorites."""

    property_id: uuid.UUID = Field(..., description="Property to save.")

    model_config = ConfigDict(json_schema_extra={"example": {"property_id": "00000000-0000-0000-0000-000000000000"}})


class FavoriteResponse(BaseModel):
    """Favorite representation."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    property_id: uuid.UUID
    created_at: datetime


class FavoriteListResponse(BaseModel):
    """Paginated favorite collection."""

    items: list[FavoriteResponse]
    meta: dict


class FavoriteToggleResponse(BaseModel):
    """Result of a toggle action."""

    is_favorite: bool
    message: str
