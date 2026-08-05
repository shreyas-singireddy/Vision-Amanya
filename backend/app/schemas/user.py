"""User schemas."""

from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models.enums import AgentStatus


class UserUpdate(BaseModel):
    """Payload for PATCH /api/v1/users/me (self-update)."""

    full_name: str | None = Field(None, min_length=1, max_length=150)
    phone: str | None = Field(None, max_length=20)
    preferred_locale: str | None = Field(None, max_length=10)
    timezone: str | None = Field(None, max_length=50)

    model_config = ConfigDict(json_schema_extra={"example": {
        "full_name": "Aarav Sharma",
        "phone": "+919876543210",
        "preferred_locale": "en",
        "timezone": "Asia/Kolkata",
    }})


class ChangePasswordRequest(BaseModel):
    """Payload for PATCH /api/v1/users/me/password."""

    current_password: str = Field(..., description="Current password for verification.")
    new_password: str = Field(..., min_length=8, max_length=128, description="New password.")


class UserAdminUpdate(BaseModel):
    """Admin-only payload to update another user's flags/roles."""

    is_active: bool | None = None
    is_email_verified: bool | None = None
    roles: list[str] | None = Field(None, description="Role codes to assign (replaces existing).")


class UserRoleAssignment(BaseModel):
    """Payload to grant a role to a user."""

    role_code: str = Field(..., min_length=1, max_length=50, description="Role code, e.g. 'agent'.")


class AgentProfile(BaseModel):
    """Public agent profile."""

    model_config = ConfigDict(from_attributes=True)

    user_id: uuid.UUID
    license_number: str | None = None
    designation: str | None = None
    years_experience: int | None = None
    rating: float | None = None
    is_verified: bool = False
    status: AgentStatus


class UserResponse(BaseModel):
    """Public user representation (safe to expose to clients)."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: str
    phone: str | None = None
    full_name: str
    is_active: bool
    is_email_verified: bool
    preferred_locale: str = "en"
    timezone: str = "Asia/Kolkata"
    created_at: datetime
    updated_at: datetime
    roles: list[str] = []
    agent: AgentProfile | None = None

    @field_validator("roles", mode="before")
    @classmethod
    def _normalize_roles(cls, value: object) -> list[str]:
        """Coerce ``Role`` ORM objects into their role codes.

        The ``User.roles`` relationship yields ``Role`` instances; clients
        only ever see the role codes.
        """
        if value is None:
            return []
        return [
            item.code if not isinstance(item, str) else item
            for item in value
        ]
