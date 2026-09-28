"""Lead schemas."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

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
    email: str | None = None
    phone: str | None = None
    whatsapp_number: str | None = None
    whatsapp_consent: bool = False
    location: str | None = None
    buying_purpose: str | None = None
    configuration: str | None = None
    preferred_floor: str | None = None
    preferred_view: str | None = None
    preferred_orientation: str | None = None
    family_size: int | None = None
    buying_timeline: str | None = None
    site_visit_interest: bool = False
    interested_unit_ids: list[str] | None = None
    recommended_unit_ids: list[str] | None = None
    viewed_unit_ids: list[str] | None = None
    compared_unit_ids: list[str] | None = None
    conversation_id: uuid.UUID | None = None
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


class LeadContext(BaseModel):
    """Structured lead context extracted from AI conversation or external sources."""

    conversation_id: uuid.UUID | None = None
    name: str | None = Field(None, max_length=150)
    email: str | None = Field(None, max_length=255)
    phone: str | None = Field(None, max_length=30)
    whatsapp_number: str | None = Field(None, max_length=30)
    whatsapp_consent: bool | None = None
    consent_source: str | None = Field("ai_consultant", max_length=50)

    # Buyer profile & intent
    location: str | None = Field(None, max_length=100)
    buying_purpose: str | None = Field(None, max_length=50)
    buying_timeline: str | None = Field(None, max_length=50)
    configuration: str | None = Field(None, max_length=30)
    budget_min: float | None = Field(None, ge=0)
    budget_max: float | None = Field(None, ge=0)
    preferred_floor: str | None = Field(None, max_length=30)
    preferred_view: str | None = Field(None, max_length=50)
    preferred_orientation: str | None = Field(None, max_length=30)
    family_size: int | None = Field(None, ge=1)

    # Unit interactions
    interested_unit_ids: list[str] = Field(default_factory=list)
    viewed_unit_ids: list[str] = Field(default_factory=list)
    compared_unit_ids: list[str] = Field(default_factory=list)
    recommended_unit_ids: list[str] = Field(default_factory=list)

    # Intent & engagement
    intent: str | None = Field(None, max_length=100)
    secondary_intent: str | None = Field(None, max_length=100)
    site_visit_interest: bool = False
    interaction_count: int = 1
    conversation_summary: str | None = None
    notes: str | None = None
    source: str = "ai_consultant"


class LeadContextScoreBreakdown(BaseModel):
    """5-dimension lead scoring breakdown."""

    contact: int = 0
    intent: int = 0
    property_fit: int = 0
    engagement: int = 0
    action: int = 0
    total: int = 0
    temperature: str = "COLD"
    details: dict[str, Any] = Field(default_factory=dict)


class LeadContextProcessResponse(BaseModel):
    """Result of processing LeadContext through deduplication, history preservation, and scoring."""

    lead_id: uuid.UUID
    is_created: bool
    is_updated: bool
    lead: LeadResponse
    score_breakdown: LeadContextScoreBreakdown
    status: LeadStatus
    temperature: str
    intent: str | None = None
    secondary_intent: str | None = None
    message: str


