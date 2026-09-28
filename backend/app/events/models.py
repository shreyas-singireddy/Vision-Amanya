"""Domain Event Models for Event-Driven Automation Orchestration.

All domain events are immutable, serializable, typed Pydantic models containing
canonical IDs, event metadata, and payload attributes. Secrets and tokens are strictly excluded.
"""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, Field

from app.utils.dates import utcnow


class BaseDomainEvent(BaseModel):
    """Base domain event with canonical tracing identifiers and timestamps."""

    model_config = ConfigDict(frozen=True, from_attributes=True)

    event_id: uuid.UUID = Field(default_factory=uuid.uuid4, description="Unique event identifier")
    event_type: str = Field(..., description="Canonical event name (e.g. lead.created)")
    timestamp: datetime = Field(default_factory=utcnow, description="UTC event creation timestamp")
    source: str = Field("ai_consultant", description="Source component emitting event")
    correlation_id: Optional[uuid.UUID] = Field(None, description="Request/conversation correlation ID")
    idempotency_key: str = Field(..., description="Idempotency key for deduplication")


class LeadCreatedEvent(BaseDomainEvent):
    """Emitted when a new CRM Lead is created."""

    event_type: str = "lead.created"
    lead_id: uuid.UUID
    name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    whatsapp_number: Optional[str] = None
    whatsapp_consent: bool = False
    configuration: Optional[str] = None
    budget_min: Optional[float] = None
    budget_max: Optional[float] = None
    lead_score: int = 0
    status: str = "new"
    priority: str = "medium"


class LeadUpdatedEvent(BaseDomainEvent):
    """Emitted when a CRM Lead is updated with changed fields."""

    event_type: str = "lead.updated"
    lead_id: uuid.UUID
    changed_fields: list[str] = Field(default_factory=list)
    lead_score: int = 0
    status: str = "new"
    priority: str = "medium"
    configuration: Optional[str] = None
    budget_max: Optional[float] = None
    preferred_view: Optional[str] = None
    preferred_floor: Optional[str] = None
    preferred_orientation: Optional[str] = None
    preferences_changed: bool = False


class LeadQualificationChangedEvent(BaseDomainEvent):
    """Emitted when a lead's score or qualification tier changes significantly."""

    event_type: str = "lead.qualification_changed"
    lead_id: uuid.UUID
    previous_score: int
    new_score: int
    previous_status: str
    new_status: str
    temperature: str = "warm"  # cold | warm | hot | high_intent
    is_qualified: bool = False
    is_hot: bool = False


class WhatsAppConsentGrantedEvent(BaseDomainEvent):
    """Emitted when WhatsApp consent is granted by a visitor/lead."""

    event_type: str = "lead.whatsapp_consent_granted"
    lead_id: uuid.UUID
    whatsapp_number: str
    consent_source: str = "ai_consultant"
    consent_timestamp: datetime = Field(default_factory=utcnow)


class ShortlistReadyEvent(BaseDomainEvent):
    """Emitted when a personalized unit shortlist is ready to be shared with a lead."""

    event_type: str = "lead.shortlist_ready"
    lead_id: uuid.UUID
    recipient_name: str
    phone_number: str
    unit_ids: list[str] = Field(default_factory=list)
    configuration: Optional[str] = None
    preferred_view: Optional[str] = None
    whatsapp_consent: bool = False


class RecommendationUpdatedEvent(BaseDomainEvent):
    """Emitted when recommendations are recalculated for a lead."""

    event_type: str = "lead.recommendation_updated"
    lead_id: uuid.UUID
    recommended_unit_ids: list[str] = Field(default_factory=list)
    top_unit: Optional[str] = None
    total_matches: int = 0
    constraint_relaxed: bool = False


class SalesHandoffRequestedEvent(BaseDomainEvent):
    """Emitted when a lead requests or qualifies for human sales consultant handoff."""

    event_type: str = "lead.sales_handoff_requested"
    lead_id: uuid.UUID
    conversation_id: Optional[uuid.UUID] = None
    reason: str = "qualification_threshold"
    lead_score: int = 0
    urgency: str = "normal"  # normal | high | urgent
