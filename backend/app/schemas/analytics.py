"""Analytics schemas."""

from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class AnalyticsEventCreate(BaseModel):
    """Payload for POST /api/v1/analytics/events."""

    event_type: str = Field(..., min_length=1, max_length=50, description="e.g. 'page_view', 'search', 'click'.")
    session_id: str | None = Field(None, max_length=100)
    entity_type: str | None = Field(None, max_length=50)
    entity_id: uuid.UUID | None = None
    properties: dict | None = Field(None, description="Arbitrary event payload.")

    model_config = ConfigDict(json_schema_extra={"example": {
        "event_type": "search",
        "session_id": "abc123",
        "entity_type": "property",
        "entity_id": "00000000-0000-0000-0000-000000000000",
        "properties": {"filters": {"city": "Bengaluru"}, "results": 42},
    }})


class DashboardStats(BaseModel):
    """Aggregate figures for the admin dashboard."""

    total_users: int = 0
    total_agents: int = 0
    total_properties: int = 0
    published_properties: int = 0
    total_projects: int = 0
    total_leads: int = 0
    open_leads: int = 0
    total_bookings: int = 0
    confirmed_bookings: int = 0
    total_enquiries: int = 0
    pending_reviews: int = 0
    active_listings_value: float = 0.0
    generated_at: datetime | None = None
