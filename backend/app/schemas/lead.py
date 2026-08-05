"""Lead schemas."""

from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.enums import InterestType, LeadPriority, LeadStatus


class LeadCreate(BaseModel):
    """Payload for POST /api/v1/leads."""

    enquiry_id: uuid.UUID | None = None
    property_id: uuid.UUID | None = None
    project_id: uuid.UUID | None = None
    name: str = Field(..., min_length=1, max_length=150)
    email: EmailStr
    phone: str | None = Field(None, max_length=20)
    source: str | None = Field(None, max_length=50)
    status: LeadStatus = LeadStatus.NEW
    priority: LeadPriority = LeadPriority.MEDIUM
    interested_in: InterestType | None = None
    budget_min: float | None = Field(None, ge=0)
    budget_max: float | None = Field(None, ge=0)
    notes: str | None = None
    next_follow_up_at: datetime | None = None

    model_config = ConfigDict(json_schema_extra={"example": {
        "name": "Rohan Verma",
        "email": "rohan@example.com",
        "phone": "+919700000000",
        "property_id": "00000000-0000-0000-0000-000000000000",
        "priority": "high",
        "interested_in": "sale",
        "budget_min": 5000000,
        "budget_max": 9000000,
        "next_follow_up_at": "2026-08-06T10:00:00Z",
    }})


class LeadUpdate(BaseModel):
    """Payload for PATCH /api/v1/leads/{id}."""

    name: str | None = Field(None, min_length=1, max_length=150)
    phone: str | None = Field(None, max_length=20)
    status: LeadStatus | None = None
    priority: LeadPriority | None = None
    interested_in: InterestType | None = None
    budget_min: float | None = Field(None, ge=0)
    budget_max: float | None = Field(None, ge=0)
    notes: str | None = None
    next_follow_up_at: datetime | None = None


class LeadAssign(BaseModel):
    """Payload for POST /api/v1/leads/{id}/assign."""

    agent_id: uuid.UUID = Field(..., description="Agent (users.id) to assign this lead to.")


class LeadResponse(BaseModel):
    """Lead representation."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    enquiry_id: uuid.UUID | None = None
    assigned_to: uuid.UUID | None = None
    user_id: uuid.UUID | None = None
    property_id: uuid.UUID | None = None
    project_id: uuid.UUID | None = None
    name: str
    email: str
    phone: str | None = None
    status: LeadStatus
    priority: LeadPriority
    source: str | None = None
    lead_score: int = 0
    budget_min: float | None = None
    budget_max: float | None = None
    interested_in: InterestType | None = None
    notes: str | None = None
    next_follow_up_at: datetime | None = None
    converted_at: datetime | None = None
    lost_at: datetime | None = None
    lost_reason: str | None = None
    created_at: datetime
    updated_at: datetime


class LeadListResponse(BaseModel):
    """Paginated lead collection."""

    items: list[LeadResponse]
    meta: dict
