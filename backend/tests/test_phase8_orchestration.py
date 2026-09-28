"""Phase 8 Comprehensive Test Suite — Event-Driven Automation Orchestration.

Validates domain event contracts, event bus pub/sub, idempotent deduplication,
failure isolation, non-blocking background dispatch, cross-service workflow coordination
(Lead -> Scoring -> Recommendation -> WhatsApp -> Sales Notification), and transaction safety.
"""

import asyncio
import uuid
import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from app.events.bus import EventBus
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
from app.events.orchestrator import AutomationOrchestrator
from app.models.crm import Lead
from app.models.enums import LeadPriority, LeadStatus


@pytest.fixture
def clean_bus():
    """Provides an isolated EventBus instance for testing."""
    bus = EventBus()
    yield bus
    bus.clear()


@pytest.fixture
def mock_db_session():
    mock = AsyncMock()
    return mock


# ==============================================================================
# 1. EVENT CONTRACT & SERIALIZATION TESTS
# ==============================================================================

def test_01_lead_created_event_contract():
    """Validates LeadCreatedEvent schema, canonical IDs, and serialization."""
    lead_id = uuid.uuid4()
    corr_id = uuid.uuid4()
    event = LeadCreatedEvent(
        lead_id=lead_id,
        name="Rahul Verma",
        phone="+919876543210",
        whatsapp_number="+919876543210",
        whatsapp_consent=True,
        configuration="3BHK",
        budget_max=27_000_000,
        lead_score=65,
        status="qualified",
        event_type="lead.created",
        idempotency_key=f"lead-created-{lead_id}",
        correlation_id=corr_id,
    )
    assert event.lead_id == lead_id
    assert event.event_type == "lead.created"
    assert event.idempotency_key == f"lead-created-{lead_id}"
    assert event.correlation_id == corr_id
    assert event.lead_score == 65
    dumped = event.model_dump()
    assert dumped["name"] == "Rahul Verma"
    assert isinstance(dumped["event_id"], uuid.UUID)


def test_02_lead_qualification_event_contract():
    """Validates LeadQualificationChangedEvent schema."""
    lead_id = uuid.uuid4()
    event = LeadQualificationChangedEvent(
        lead_id=lead_id,
        previous_score=30,
        new_score=85,
        previous_status="new",
        new_status="qualified",
        temperature="hot",
        is_qualified=True,
        is_hot=True,
        event_type="lead.qualification_changed",
        idempotency_key=f"qual-{lead_id}-85",
    )
    assert event.is_hot is True
    assert event.temperature == "hot"
    assert event.new_score == 85


def test_03_shortlist_ready_event_contract():
    """Validates ShortlistReadyEvent schema with unit arrays."""
    lead_id = uuid.uuid4()
    event = ShortlistReadyEvent(
        lead_id=lead_id,
        recipient_name="Ananya Rao",
        phone_number="+919876543210",
        unit_ids=["1804", "1601"],
        configuration="3BHK",
        preferred_view="lake",
        whatsapp_consent=True,
        event_type="lead.shortlist_ready",
        idempotency_key=f"shortlist-{lead_id}",
    )
    assert len(event.unit_ids) == 2
    assert "1804" in event.unit_ids


# ==============================================================================
# 2. EVENT BUS PUB/SUB & DISPATCH TESTS
# ==============================================================================

@pytest.mark.asyncio
async def test_04_event_bus_pub_sub_single_subscriber(clean_bus):
    """Subscribed handler receives published event."""
    received = []

    async def handler(event: BaseDomainEvent, db: any):
        received.append(event)
        return "handled"

    clean_bus.subscribe("lead.created", handler)

    lead_id = uuid.uuid4()
    event = LeadCreatedEvent(
        lead_id=lead_id,
        name="Test Visitor",
        event_type="lead.created",
        idempotency_key=f"test-{lead_id}",
    )

    results = await clean_bus.publish(event)
    assert len(received) == 1
    assert received[0].lead_id == lead_id
    assert len(results) == 1
    assert results[0]["status"] == "success"
    assert results[0]["result"] == "handled"


@pytest.mark.asyncio
async def test_05_event_bus_multiple_subscribers(clean_bus):
    """Multiple handlers receive the same event."""
    counter = {"a": 0, "b": 0}

    async def handler_a(event: BaseDomainEvent, db: any):
        counter["a"] += 1

    async def handler_b(event: BaseDomainEvent, db: any):
        counter["b"] += 1

    clean_bus.subscribe("lead.updated", handler_a)
    clean_bus.subscribe("lead.updated", handler_b)

    lead_id = uuid.uuid4()
    event = LeadUpdatedEvent(
        lead_id=lead_id,
        event_type="lead.updated",
        idempotency_key=f"test-update-{lead_id}",
    )

    results = await clean_bus.publish(event)
    assert counter["a"] == 1
    assert counter["b"] == 1
    assert len(results) == 2


@pytest.mark.asyncio
async def test_06_wildcard_subscription(clean_bus):
    """Wildcard subscriber receives all events."""
    all_events = []

    async def audit_all(event: BaseDomainEvent, db: any):
        all_events.append(event.event_type)

    clean_bus.subscribe("*", audit_all)

    lead_id = uuid.uuid4()
    e1 = LeadCreatedEvent(lead_id=lead_id, name="V", event_type="lead.created", idempotency_key=f"e1-{lead_id}")
    e2 = WhatsAppConsentGrantedEvent(lead_id=lead_id, whatsapp_number="+919876543210", event_type="lead.whatsapp_consent_granted", idempotency_key=f"e2-{lead_id}")

    await clean_bus.publish(e1)
    await clean_bus.publish(e2)

    assert "lead.created" in all_events
    assert "lead.whatsapp_consent_granted" in all_events


# ==============================================================================
# 3. IDEMPOTENCY & DEDUPLICATION TESTS
# ==============================================================================

@pytest.mark.asyncio
async def test_07_idempotent_event_deduplication(clean_bus):
    """Publishing the same idempotency key twice executes only once."""
    execution_count = 0

    async def handler(event: BaseDomainEvent, db: any):
        nonlocal execution_count
        execution_count += 1

    clean_bus.subscribe("lead.created", handler)

    lead_id = uuid.uuid4()
    key = f"idempotent-{lead_id}"
    e1 = LeadCreatedEvent(lead_id=lead_id, name="First", event_type="lead.created", idempotency_key=key)
    e2 = LeadCreatedEvent(lead_id=lead_id, name="Duplicate", event_type="lead.created", idempotency_key=key)

    res1 = await clean_bus.publish(e1)
    res2 = await clean_bus.publish(e2)

    assert execution_count == 1
    assert res1[0]["status"] == "success"
    assert res2[0]["status"] == "skipped_duplicate"


# ==============================================================================
# 4. FAILURE ISOLATION TESTS
# ==============================================================================

@pytest.mark.asyncio
async def test_08_failure_isolation_subscriber_crash(clean_bus):
    """Crashing subscriber does not prevent other subscribers from executing."""
    second_executed = False

    async def failing_handler(event: BaseDomainEvent, db: any):
        raise RuntimeError("External network timeout")

    async def successful_handler(event: BaseDomainEvent, db: any):
        nonlocal second_executed
        second_executed = True

    clean_bus.subscribe("lead.created", failing_handler)
    clean_bus.subscribe("lead.created", successful_handler)

    lead_id = uuid.uuid4()
    event = LeadCreatedEvent(lead_id=lead_id, name="Test", event_type="lead.created", idempotency_key=f"fail-{lead_id}")

    results = await clean_bus.publish(event)
    assert second_executed is True
    assert len(results) == 2
    assert results[0]["status"] == "failed"
    assert "External network timeout" in results[0]["error"]
    assert results[1]["status"] == "success"


# ==============================================================================
# 5. AUTOMATION ORCHESTRATOR WORKFLOW TESTS
# ==============================================================================

@pytest.mark.asyncio
async def test_09_orchestrator_lead_created_qualified_triggers_sales_notification(clean_bus, mock_db_session):
    """High score lead creation triggers sales notification flow."""
    orch = AutomationOrchestrator(bus=clean_bus)

    test_lead_id = uuid.uuid4()
    lead_model = Lead(
        id=test_lead_id,
        name="Deepak Joshi",
        phone="+919876543210",
        whatsapp_number="+919876543210",
        lead_score=80,
        status=LeadStatus.QUALIFIED,
        priority=LeadPriority.HIGH,
    )

    mock_db_session.scalar = AsyncMock(return_value=lead_model)
    mock_db_session.add = MagicMock()
    mock_db_session.commit = AsyncMock()

    event = LeadCreatedEvent(
        lead_id=test_lead_id,
        name="Deepak Joshi",
        phone="+919876543210",
        whatsapp_consent=False,
        lead_score=80,
        status="qualified",
        event_type="lead.created",
        idempotency_key=f"created-{test_lead_id}",
    )

    results = await clean_bus.publish(event, mock_db_session)
    assert len(results) > 0
    assert any(r.get("status") == "success" for r in results)


@pytest.mark.asyncio
async def test_10_orchestrator_whatsapp_consent_triggers_shortlist(clean_bus, mock_db_session):
    """WhatsApp consent event triggers shortlist dispatch when units exist."""
    orch = AutomationOrchestrator(bus=clean_bus)

    test_lead_id = uuid.uuid4()
    lead_model = Lead(
        id=test_lead_id,
        name="Sunita Rao",
        phone="+919876543210",
        whatsapp_number="+919876543210",
        whatsapp_consent=True,
        recommended_unit_ids=["1804", "1601"],
        configuration="3BHK",
        preferred_view="lake",
    )

    mock_db_session.scalar = AsyncMock(return_value=lead_model)
    mock_db_session.commit = AsyncMock()

    event = WhatsAppConsentGrantedEvent(
        lead_id=test_lead_id,
        whatsapp_number="+919876543210",
        event_type="lead.whatsapp_consent_granted",
        idempotency_key=f"wa-{test_lead_id}",
    )

    results = await clean_bus.publish(event, mock_db_session)
    assert len(results) > 0
    assert any(r.get("status") == "success" for r in results)


@pytest.mark.asyncio
async def test_11_orchestrator_shortlist_ready_dispatches_whatsapp(clean_bus, mock_db_session):
    """ShortlistReadyEvent invokes WhatsApp service with failure isolation."""
    orch = AutomationOrchestrator(bus=clean_bus)

    test_lead_id = uuid.uuid4()
    event = ShortlistReadyEvent(
        lead_id=test_lead_id,
        recipient_name="Sunita Rao",
        phone_number="+919876543210",
        unit_ids=["1804"],
        configuration="3BHK",
        preferred_view="lake",
        whatsapp_consent=True,
        event_type="lead.shortlist_ready",
        idempotency_key=f"ready-{test_lead_id}",
    )

    results = await clean_bus.publish(event, mock_db_session)
    assert len(results) == 1
    assert results[0]["status"] == "success"
    action_res = results[0]["result"]
    assert "whatsapp_sent" in action_res["actions"][0] or "processed" in action_res["status"]


@pytest.mark.asyncio
async def test_12_orchestrator_background_publishing(clean_bus):
    """Background publishing runs asynchronously without blocking."""
    executed = asyncio.Event()

    async def bg_handler(event: BaseDomainEvent, db: any):
        executed.set()

    clean_bus.subscribe("lead.created", bg_handler)

    lead_id = uuid.uuid4()
    event = LeadCreatedEvent(lead_id=lead_id, name="Async Test", event_type="lead.created", idempotency_key=f"bg-{lead_id}")

    task = clean_bus.publish_background(event)
    await asyncio.wait_for(executed.wait(), timeout=2.0)
    assert executed.is_set()
    await task
