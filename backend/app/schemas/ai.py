"""AI Consultant foundation Pydantic schemas.

Structured request and response models for Amnaya AI Consultant endpoints.
Includes structured response contract, citations, suggested actions, intent classifications,
and lead capture / site visit integration payloads.
"""

from __future__ import annotations

import uuid
from datetime import datetime
from enum import Enum
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import ChatMessageRole, ChatSessionStatus


class AIResponseType(str, Enum):
    """Structured response classifications for the AI Consultant."""

    TEXT = "text"
    UNIT_RECOMMENDATION = "unit_recommendation"
    UNIT_COMPARISON = "unit_comparison"
    FLOOR_PLAN = "floor_plan"
    SITE_VISIT = "site_visit"
    LEAD_CAPTURE = "lead_capture"
    HANDOFF = "handoff"
    PRICING = "pricing"
    CLARIFICATION = "clarification"
    CAPABILITY_NOT_AVAILABLE = "capability_not_available"
    ERROR = "error"


class PropertyPreferences(BaseModel):
    """Normalized structured property preferences extracted from user queries."""

    configuration: str = Field("3BHK", description="Normalized typology (e.g. 3BHK)")
    bedrooms: int | None = Field(3, description="Bedrooms count")
    bathrooms: int | None = Field(None, description="Bathrooms count")
    budget: float | None = Field(None, description="Target budget in INR")
    minimum_budget: float | None = Field(None, description="Min budget in INR")
    maximum_budget: float | None = Field(None, description="Max budget in INR")
    area: float | None = Field(None, description="Target area in sq ft")
    minimum_area: float | None = Field(None, description="Min area in sq ft")
    maximum_area: float | None = Field(None, description="Max area in sq ft")
    tower: str | None = Field(None, description="Target tower name")
    floor: int | None = Field(None, description="Target floor number")
    floor_preference: str | None = Field(None, description="Floor preference (high, mid, low)")
    view: str | None = Field(None, description="View preference (lake, garden, city)")
    orientation: str | None = Field(None, description="Orientation (east, north-east)")
    unit_id: str | None = Field(None, description="Single target unit ID")
    unit_ids: list[str] = Field(default_factory=list, description="Target unit IDs for comparison")
    buying_purpose: str | None = Field(None, description="End use vs investment")
    timeline: str | None = Field(None, description="Target possession timeline")
    raw_entities: dict[str, Any] = Field(default_factory=dict, description="Raw unnormalized extracted entities")


class IntentClassificationResult(BaseModel):
    """Result payload from the IntentEngine classification."""

    intent: str
    confidence: float = Field(1.0, ge=0.0, le=1.0)
    preferences: PropertyPreferences = Field(default_factory=PropertyPreferences)
    missing_fields: list[str] = Field(default_factory=list)
    requires_clarification: bool = False
    clarification_prompt: str | None = None



class AIChatContext(BaseModel):
    """Contextual page/residence parameters passed from the frontend."""

    page_type: str | None = Field(None, description="Page context classification (e.g. project, unit, location)")
    page_id: str | None = Field(None, description="Active page ID")
    residence_id: str | None = Field(None, description="Active residence ID or slug")
    unit_id: str | None = Field(None, description="Active unit number or ID")
    floor_plan_id: str | None = Field(None, description="Active floor plan ID")
    view_id: str | None = Field(None, description="Active 3D view ID")
    location_id: str | None = Field(None, description="Active location ID")
    selected_units: list[str] | None = Field(None, description="Selected units for comparison")
    context_source: str | None = Field(None, description="Trigger source component")
    user_preferences: dict[str, Any] | None = Field(None, description="User preference overrides")
    current_page: str | None = Field(None, description="Active URL path (e.g. /residences/1804)")
    current_unit_id: str | None = Field(None, description="Selected residence ID or unit number")
    current_project_id: str | None = Field(None, description="Active project slug (e.g. vision-amanya)")
    floor_plan_metadata: dict[str, Any] | None = Field(None, description="Active floor/building metadata")


class AIChatRequest(BaseModel):
    """Payload for POST /api/v1/ai/chat."""

    conversation_id: uuid.UUID | None = Field(None, description="Existing conversation UUID or None to create one")
    message: str = Field(..., min_length=1, max_length=4000, description="User query text")
    context: AIChatContext | None = Field(None, description="Current UI context")
    guest_id: str | None = Field(None, max_length=100, description="Guest session identifier")

    model_config = ConfigDict(json_schema_extra={"example": {
        "conversation_id": "00000000-0000-0000-0000-000000000000",
        "message": "Can you recommend a 3 BHK lake-facing residence on a high floor?",
        "context": {
            "current_page": "/residences",
            "current_project_id": "vision-amanya"
        }
    }})


class AICitation(BaseModel):
    """Knowledge citation snippet back-reference."""

    document_title: str
    document_type: str | None = None
    snippet: str
    source_url: str | None = None
    page_number: int | None = None


class AISuggestedAction(BaseModel):
    """Interactive action chip returned with AI responses."""

    label: str
    action_type: str = Field(..., description="Action category (e.g. navigate, filter, open_modal, enquire)")
    payload: dict[str, Any] = Field(default_factory=dict)


class AIStructuredResponse(BaseModel):
    """Extensible structured response contract returned by POST /api/v1/ai/chat."""

    conversation_id: uuid.UUID
    message: str = Field(..., description="Natural language response text")
    response_type: AIResponseType = AIResponseType.TEXT
    intent: str = Field("general_inquiry", description="Classified intent tag")
    confidence: float = Field(1.0, ge=0.0, le=1.0, description="Response confidence metric")
    citations: list[AICitation] = Field(default_factory=list)
    suggested_actions: list[AISuggestedAction] = Field(default_factory=list)
    units: list[dict[str, Any]] = Field(default_factory=list, description="Structured unit metadata for recommendations")
    floor_plan_context: dict[str, Any] | None = Field(None, description="Floor plan metadata if relevant")
    lead_context: dict[str, Any] | None = Field(None, description="Lead capture state if relevant")
    handoff_context: dict[str, Any] | None = Field(None, description="Sales handoff context if handoff is offered or requested")
    handoff_id: uuid.UUID | None = Field(None, description="Sales handoff record ID if initiated")
    metadata: dict[str, Any] = Field(default_factory=dict)


class AIConversationCreate(BaseModel):
    """Payload for POST /api/v1/ai/conversations."""

    persona: str | None = Field(None, max_length=50)
    guest_id: str | None = Field(None, max_length=100)
    initial_context: AIChatContext | None = None


class ChatMessageResponse(BaseModel):
    """Representation of an individual conversation message."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    session_id: uuid.UUID
    role: ChatMessageRole
    content: str
    intent: str | None = None
    metadata: dict[str, Any] | None = None
    created_at: datetime


class AIConversationResponse(BaseModel):
    """Representation of an AI conversation thread."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID | None = None
    guest_id: str | None = None
    persona: str | None = None
    status: ChatSessionStatus
    message_count: int = 0
    created_at: datetime
    updated_at: datetime
    messages: list[ChatMessageResponse] = Field(default_factory=list)


class AIConversationListResponse(BaseModel):
    """Paginated collection of AI conversation threads."""

    items: list[AIConversationResponse]
    meta: dict[str, Any]


class AILeadCaptureRequest(BaseModel):
    """Payload for POST /api/v1/ai/lead."""

    conversation_id: uuid.UUID | None = None
    full_name: str = Field(..., min_length=1, max_length=200)
    phone: str = Field(..., min_length=5, max_length=30)
    email: str | None = Field(None, max_length=255)
    preferred_unit_id: str | None = Field(None, max_length=100)
    notes: str | None = Field(None, max_length=1000)


class AISiteVisitRequest(BaseModel):
    """Payload for POST /api/v1/ai/site-visit."""

    conversation_id: uuid.UUID | None = None
    full_name: str = Field(..., min_length=1, max_length=200)
    phone: str = Field(..., min_length=5, max_length=30)
    email: str | None = Field(None, max_length=255)
    preferred_date: str = Field(..., description="Preferred visit date (YYYY-MM-DD)")
    preferred_unit_id: str | None = Field(None, max_length=100)
    notes: str | None = Field(None, max_length=1000)
