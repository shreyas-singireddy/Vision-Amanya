"""Event-Driven Automation Orchestration Package."""

from app.events.bus import EventBus, event_bus
from app.events.models import (
    BaseDomainEvent,
    LeadCreatedEvent,
    LeadQualificationChangedEvent,
    LeadUpdatedEvent,
    RecommendationUpdatedEvent,
    SalesHandoffRequestedEvent,
    ShortlistReadyEvent,
    WhatsAppConsentGrantedEvent,
)
from app.events.orchestrator import AutomationOrchestrator, orchestrator

__all__ = [
    "EventBus",
    "event_bus",
    "AutomationOrchestrator",
    "orchestrator",
    "BaseDomainEvent",
    "LeadCreatedEvent",
    "LeadUpdatedEvent",
    "LeadQualificationChangedEvent",
    "WhatsAppConsentGrantedEvent",
    "ShortlistReadyEvent",
    "RecommendationUpdatedEvent",
    "SalesHandoffRequestedEvent",
]
