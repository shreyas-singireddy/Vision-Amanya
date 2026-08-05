"""Admin schemas."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.user import UserResponse


class SystemStats(BaseModel):
    """High-level platform statistics for the admin panel."""

    users: int = 0
    agents: int = 0
    properties: int = 0
    projects: int = 0
    leads: int = 0
    bookings: int = 0
    enquiries: int = 0
    reviews: int = 0
    notifications: int = 0
    audit_logs: int = 0
    generated_at: datetime | None = None


class AdminUserUpdate(BaseModel):
    """Admin-only user mutations."""

    is_active: bool | None = None
    is_email_verified: bool | None = None
    roles: list[str] | None = Field(None, description="Role codes to assign.")


class AdminUserResponse(BaseModel):
    """Admin view of a user (superset of the public view)."""

    model_config = ConfigDict(from_attributes=True)

    user: UserResponse
    audit_events: int = 0


class AppSettingUpdate(BaseModel):
    """Payload for PATCH /api/v1/admin/settings/{key}."""

    value: dict = Field(..., description="New setting value (JSON).")
    value_type: str | None = Field(None, max_length=20)
    description: str | None = None
    is_public: bool | None = None


class AppSettingResponse(BaseModel):
    """Application setting representation."""

    model_config = ConfigDict(from_attributes=True)

    key: str
    value: dict
    value_type: str = "string"
    description: str | None = None
    is_public: bool = False
    updated_at: datetime
