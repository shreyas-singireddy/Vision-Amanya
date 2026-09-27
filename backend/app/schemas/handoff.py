"""Schemas for AI-to-Human Sales Consultant Handoff & Escalation."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field

from app.models.enums import AssignmentStrategy, HandoffReason, HandoffStatus


class HandoffRequest(BaseModel):
    """Payload to request an AI-to-human sales consultant handoff."""

    conversation_id: uuid.UUID = Field(..., description="Active AI chat session ID")
    lead_id: uuid.UUID | None = Field(default=None, description="Optional associated lead ID")
    reason: HandoffReason = Field(
        default=HandoffReason.EXPLICIT_HUMAN_REQUEST,
        description="Reason trigger for handoff",
    )
    notes: str | None = Field(default=None, max_length=1000, description="Optional visitor notes")


class SalesConversationSummary(BaseModel):
    """Structured executive summary of visitor dialogue for the sales consultant."""

    lead_name: str | None = Field(default="Visitor", description="Visitor / Lead Name")
    lead_contact: str | None = Field(default=None, description="Visitor Phone / Email if captured")
    intent: str | None = Field(default=None, description="Primary detected intent")
    configuration: str | None = Field(default=None, description="Preferred typology e.g. 3 BHK")
    budget: str | None = Field(default=None, description="Formatted budget range")
    preferred_view: str | None = Field(default=None, description="e.g. Lake View, Garden View")
    preferred_floor: str | None = Field(default=None, description="e.g. High Floor")
    interested_units: list[str] = Field(default_factory=list, description="Units viewed/interested")
    compared_units: list[str] = Field(default_factory=list, description="Units compared")
    financial_context: str | None = Field(default=None, description="Summary of EMI or financial queries")
    site_visit_context: str | None = Field(default=None, description="Site visit booking status or slot requested")
    visitor_request: str | None = Field(default=None, description="Explicit visitor request or concern")
    last_user_message: str | None = Field(default=None, description="Most recent visitor message")
    handoff_reason: str = Field(..., description="Trigger reason description")


class HandoffContext(BaseModel):
    """Sanitized, structured context package passed to the sales consultant."""

    lead_id: uuid.UUID | None = None
    conversation_id: uuid.UUID
    selected_unit_id: str | None = None
    interested_unit_ids: list[str] = Field(default_factory=list)
    preferences: dict[str, Any] = Field(default_factory=dict)
    recommendations: list[dict[str, Any]] = Field(default_factory=list)
    comparison_context: dict[str, Any] | None = None
    financial_context: dict[str, Any] | None = None
    site_visit_context: dict[str, Any] | None = None
    conversation_summary: SalesConversationSummary
    handoff_reason: HandoffReason
    last_user_message: str | None = None


class HandoffResponse(BaseModel):
    """API response for a created or queried sales handoff."""

    handoff_id: uuid.UUID
    conversation_id: uuid.UUID
    lead_id: uuid.UUID | None = None
    status: HandoffStatus
    reason: HandoffReason
    message: str
    assigned_consultant: dict[str, Any] | None = None
    estimated_wait_minutes: int | None = Field(default=None, description="Actual wait time estimation if available")
    created_at: datetime
    summary: SalesConversationSummary | None = None

    class Config:
        from_attributes = True


class SalesAssignment(BaseModel):
    """Assignment payload when a consultant is matched with a handoff."""

    handoff_id: uuid.UUID
    agent_id: uuid.UUID
    agent_name: str
    strategy: AssignmentStrategy
    assigned_at: datetime


class HandoffStatusUpdate(BaseModel):
    """Payload to update handoff lifecycle status."""

    status: HandoffStatus
    notes: str | None = Field(default=None, max_length=1000)
    agent_id: uuid.UUID | None = None


class KnowledgeGapEvent(BaseModel):
    """Record of an unverified question asked by a visitor."""

    id: uuid.UUID = Field(default_factory=uuid.uuid4)
    question: str
    topic: str
    frequency: int = 1
    last_asked_at: datetime
    status: str = "pending_review"


class HandoffAnalytics(BaseModel):
    """Operational metrics for handoff performance tracking."""

    handoff_count: int = 0
    handoff_reasons_breakdown: dict[str, int] = Field(default_factory=dict)
    handoff_acceptance_rate: float = 0.0
    average_handoff_wait_seconds: float = 0.0
    handoff_completion_rate: float = 0.0
    unknown_question_count: int = 0
    negotiation_request_count: int = 0
