"""Pydantic schemas for the AI Sales Conversion & Site Visit subsystem."""

from __future__ import annotations

import uuid
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, EmailStr


class LeadQualificationRequest(BaseModel):
    """Payload for qualifying and capturing a sales lead."""

    name: str = Field(..., min_length=2, max_length=150)
    email: EmailStr
    phone: str | None = Field(None, max_length=20)
    preferred_configuration: str | None = None
    budget_min: float | None = Field(None, ge=0.0)
    budget_max: float | None = Field(None, ge=0.0)
    preferred_view: str | None = None
    preferred_floor: str | None = None
    interested_unit_ids: list[str] = Field(default_factory=list)
    compared_unit_ids: list[str] = Field(default_factory=list)
    financial_interest: bool = False
    site_visit_interest: bool = False
    conversation_summary: str | None = None
    source: str = Field("ai_consultant", description="Source channel identifier")


class LeadQualificationResponse(BaseModel):
    """Response returned upon lead qualification."""

    model_config = ConfigDict(from_attributes=True)

    lead_id: str
    status: str
    lead_score: int = Field(..., ge=0, le=100)
    is_qualified: bool = True
    conversation_summary: str
    created_at: str


class SiteVisitAvailabilityRequest(BaseModel):
    """Request payload for fetching available site visit slots."""

    date: str = Field(..., description="Target visit date in YYYY-MM-DD format")
    time_range: str | None = Field(None, description="Optional morning/afternoon preference")


class SiteVisitAvailabilityResponse(BaseModel):
    """Response containing available site visit slots."""

    date: str
    available_slots: list[str] = Field(default_factory=list, description="Available time slots e.g. ['10:00 AM', '11:30 AM']")
    is_available: bool = True
    total_slots: int = 0


class SiteVisitBookingRequest(BaseModel):
    """Request payload for scheduling a private site visit."""

    lead_id: str | None = None
    name: str = Field(..., min_length=2, max_length=150)
    phone: str = Field(..., min_length=10, max_length=20)
    email: EmailStr
    date: str = Field(..., description="Target visit date YYYY-MM-DD")
    time_slot: str = Field(..., description="Chosen time slot e.g. '11:30 AM'")
    unit_id: str | None = None
    unit_number: str | None = None
    notes: str | None = None


class SiteVisitBookingResponse(BaseModel):
    """Authoritative booking confirmation returned by backend service."""

    model_config = ConfigDict(from_attributes=True)

    booking_id: str
    booking_number: str
    scheduled_at: str
    visit_type: str = "site_visit"
    status: str = "confirmed"
    unit_number: str | None = None
    confirmation_message: str
    created_at: str
