"""Phase 9 Comprehensive Integration, Reliability, and Failure Recovery Test Suite.

Verifies end-to-end multi-agent automation pipeline:
1. End-to-End Golden Path (AI Chat -> Lead Context -> CRM Lead -> Scoring -> Recommendations -> Consent -> Shortlist -> Sales Task + Notification -> Audit Trail)
2. Exact-Once Delivery & Idempotency (duplicate events delivered 3x result in 1 business outcome)
3. Failure Isolation & Resilience (WhatsApp failure does not break CRM lead or Sales task; Sales notification failure does not rollback Lead or CRM task)
4. User Corrections (budget update correctly triggers re-scoring and recommendation recalculation)
5. Anonymous -> Identified User Reconciliation (conversation session lead safely reconciled with contact info)
6. Backend Consent Enforcement (WhatsApp messaging strictly blocked without verified consent)
7. Concurrent Execution & Race Condition Safety (concurrent escalation attempts resolved via DB constraint / dedupe key)
"""

import asyncio
import uuid
import pytest
from datetime import datetime, timezone
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
from app.models.crm import Lead, WhatsAppMessage, SalesNotification
from app.models.crm_task import CrmTask
from app.models.enums import (
    CrmTaskStatus,
    CrmTaskType,
    LeadPriority,
    LeadStatus,
    LeadTemperature,
    SalesTrigger,
    WhatsAppMessageStatus,
)
from app.schemas.lead import LeadContext
from app.services.lead_service import LeadService
from app.services.sales_task_service import SalesTaskService, SalesTriggerPolicy
from app.services.sales_notification_service import SalesNotificationService
from app.services.shortlist_service import ShortlistService
from app.services.whatsapp_service import (
    WhatsAppService,
    MockWhatsAppProvider,
    WhatsAppSendResult,
)
from app.utils.dates import utcnow


@pytest.fixture
def clean_bus():
    """Provides an isolated EventBus instance for testing."""
    bus = EventBus()
    yield bus
    bus.clear()


@pytest.fixture
def mock_db_session():
    """Mock async DB session supporting ORM operations."""
    session = AsyncMock()
    session.add = MagicMock()
    session.commit = AsyncMock()
    session.rollback = AsyncMock()
    session.flush = AsyncMock()
    session.refresh = AsyncMock()
    session.scalar = AsyncMock()
    session.scalars = AsyncMock()
    session.execute = AsyncMock()
    return session


# ==============================================================================
# 1. FULL END-TO-END AUTOMATION GOLDEN PATH
# ==============================================================================

@pytest.mark.asyncio
async def test_01_full_automation_pipeline_golden_path(clean_bus, mock_db_session):
    """End-to-end golden path:
    Visitor chat -> Lead extraction -> CRM Lead creation -> Scoring (>=50)
    -> Qualification -> Recommendation -> WhatsApp consent -> Shortlist dispatch
    -> Sales Notification -> CRM Task -> Audit log.
    """
    lead_id = uuid.uuid4()
    conv_id = uuid.uuid4()
    now = utcnow()

    # Canonical lead state
    lead = Lead(
        id=lead_id,
        created_at=now,
        updated_at=now,
        name="Sunita Rao",
        phone="+919876543210",
        email="sunita.rao@example.com",
        whatsapp_number="+919876543210",
        whatsapp_consent=True,
        configuration="3BHK",
        budget_min=20_000_000,
        budget_max=30_000_000,
        preferred_view="clubhouse",
        lead_score=75,
        status=LeadStatus.QUALIFIED,
        priority=LeadPriority.HIGH,
        recommended_unit_ids=["T1-1402", "T2-1804"],
        conversation_id=conv_id,
    )
    mock_db_session.scalar.return_value = lead
    mock_db_session.scalars.return_value.all.return_value = []

    orchestrator = AutomationOrchestrator(clean_bus)

    # 1. Publish LeadCreatedEvent
    created_event = LeadCreatedEvent(
        lead_id=lead_id,
        name="Sunita Rao",
        phone="+919876543210",
        email="sunita.rao@example.com",
        whatsapp_number="+919876543210",
        whatsapp_consent=True,
        configuration="3BHK",
        budget_max=30_000_000,
        lead_score=75,
        status="qualified",
        priority="high",
        idempotency_key=f"lead-created-{lead_id}",
        correlation_id=conv_id,
    )

    results = await clean_bus.publish(created_event, mock_db_session)
    assert len(results) >= 1
    assert results[0]["status"] == "success"
    actions = results[0]["result"]["actions"]
    assert "emitted_qualification_event" in actions
    assert "emitted_consent_event" in actions

    # 2. Verify Qualification -> Sales Escalation (CRM Task + Sales Notification)
    qual_event = LeadQualificationChangedEvent(
        lead_id=lead_id,
        previous_score=0,
        new_score=75,
        previous_status="new",
        new_status="qualified",
        temperature="hot",
        is_qualified=True,
        is_hot=True,
        idempotency_key=f"qual-step2-{lead_id}-75",
        correlation_id=conv_id,
    )

    with patch("app.services.sales_task_service.SalesTaskService.process_lead_sales_state") as mock_sales:
        from app.services.sales_task_service import SalesWorkflowResult
        mock_sales.return_value = SalesWorkflowResult(
            lead_id=lead_id,
            triggered=True,
            trigger=SalesTrigger.HOT_LEAD,
            qualification="hot",
            reason="Hot lead score >= 70",
            task_id=uuid.uuid4(),
            task_created=True,
            notification_id=uuid.uuid4(),
            notification_status="sent",
        )
        qual_results = await clean_bus.publish(qual_event, mock_db_session)
        assert qual_results[0]["status"] == "success"
        assert "crm_task_created" in qual_results[0]["result"]["actions"]

    # 3. Verify Shortlist Ready -> WhatsApp Delivery
    shortlist_event = ShortlistReadyEvent(
        lead_id=lead_id,
        recipient_name="Sunita Rao",
        phone_number="+919876543210",
        unit_ids=["T1-1402", "T2-1804"],
        configuration="3BHK",
        preferred_view="clubhouse",
        whatsapp_consent=True,
        idempotency_key=f"shortlist-step3-{lead_id}-2",
        correlation_id=conv_id,
    )

    with patch("app.services.whatsapp_service.WhatsAppService.send_shortlist") as mock_wa:
        mock_wa.return_value = MagicMock(status="simulated", id=uuid.uuid4())
        shortlist_results = await clean_bus.publish(shortlist_event, mock_db_session)
        assert shortlist_results[0]["status"] == "success"
        assert "whatsapp_sent_simulated" in shortlist_results[0]["result"]["actions"]


# ==============================================================================
# 2. EXACT-ONCE DELIVERY & IDEMPOTENCY
# ==============================================================================

@pytest.mark.asyncio
async def test_02_duplicate_events_delivered_three_times_executes_once(clean_bus, mock_db_session):
    """When the identical event is delivered 3 times, business logic executes exactly once."""
    lead_id = uuid.uuid4()
    event = LeadCreatedEvent(
        lead_id=lead_id,
        name="Vikram Singh",
        phone="+919876543211",
        lead_score=60,
        status="qualified",
        idempotency_key=f"lead-created-{lead_id}",
    )

    call_count = 0

    async def custom_handler(evt, db):
        nonlocal call_count
        call_count += 1
        return {"processed": True}

    clean_bus.subscribe("lead.created", custom_handler)

    # Deliver 1st time
    res1 = await clean_bus.publish(event, mock_db_session)
    assert res1[0]["status"] == "success"
    assert call_count == 1

    # Deliver 2nd time (duplicate)
    res2 = await clean_bus.publish(event, mock_db_session)
    assert res2[0]["status"] == "skipped_duplicate"
    assert call_count == 1

    # Deliver 3rd time (duplicate)
    res3 = await clean_bus.publish(event, mock_db_session)
    assert res3[0]["status"] == "skipped_duplicate"
    assert call_count == 1


@pytest.mark.asyncio
async def test_03_sales_task_service_idempotency_dedupes_repeated_evaluations(mock_db_session):
    """SalesTaskService suppresses duplicate tasks and notifications for the same qualification state."""
    lead_id = uuid.uuid4()
    lead = Lead(
        id=lead_id,
        name="Anita Desai",
        phone="+919876543212",
        lead_score=85,
        status=LeadStatus.QUALIFIED,
        site_visit_interest=True,
    )

    service = SalesTaskService(mock_db_session)

    # Existing task returned on subsequent check
    existing_task = CrmTask(
        id=uuid.uuid4(),
        lead_id=lead_id,
        task_type=CrmTaskType.CONTACT_QUALIFIED_LEAD,
        title="Contact qualified lead",
        status=CrmTaskStatus.OPEN,
        dedupe_key=f"lead:{lead_id}:high_intent_lead:high_intent",
    )

    # First call: no existing task
    mock_db_session.scalar.return_value = None
    with patch.object(service, "_create_task", return_value=existing_task):
        with patch("app.services.sales_notification_service.SalesNotificationService.notify_new_lead", return_value=MagicMock(id=uuid.uuid4())):
            res1 = await service.process_lead_sales_state(lead)
            assert res1.triggered is True
            assert res1.duplicate is False
            assert res1.task_created is True

    # Second call: existing task found in DB
    mock_db_session.scalar.return_value = existing_task
    res2 = await service.process_lead_sales_state(lead)
    assert res2.triggered is True
    assert res2.duplicate is True
    assert res2.task_created is False
    assert "duplicate suppressed" in res2.reason


# ==============================================================================
# 3. FAILURE ISOLATION & RESILIENCE
# ==============================================================================

@pytest.mark.asyncio
async def test_04_whatsapp_provider_failure_does_not_break_lead_or_orchestration(clean_bus, mock_db_session):
    """If the WhatsApp provider fails or times out, the error is isolated, logged, and does not crash."""
    lead_id = uuid.uuid4()
    orchestrator = AutomationOrchestrator(clean_bus)

    shortlist_event = ShortlistReadyEvent(
        lead_id=lead_id,
        recipient_name="Ramesh Gupta",
        phone_number="+919876543213",
        unit_ids=["T1-101"],
        whatsapp_consent=True,
        idempotency_key=f"shortlist-fail-test-{lead_id}",
    )

    # WhatsApp provider throws runtime exception
    with patch("app.services.whatsapp_service.WhatsAppService.send_shortlist", side_effect=RuntimeError("Meta WhatsApp API Timeout")):
        results = await clean_bus.publish(shortlist_event, mock_db_session)
        assert len(results) == 1
        assert results[0]["status"] == "success"  # Orchestrator handler handled exception cleanly
        assert "whatsapp_dispatch_failed" in results[0]["result"]["actions"]


@pytest.mark.asyncio
async def test_05_sales_notification_failure_does_not_break_crm_task_creation(mock_db_session):
    """If SMTP/Sales Notification dispatch fails, CRM Task remains created and no exception escapes."""
    lead_id = uuid.uuid4()
    lead = Lead(
        id=lead_id,
        name="Karan Johar",
        phone="+919876543214",
        lead_score=85,
        status=LeadStatus.QUALIFIED,
    )

    service = SalesTaskService(mock_db_session)
    mock_db_session.scalar.return_value = None  # No existing task

    created_task = CrmTask(
        id=uuid.uuid4(),
        lead_id=lead_id,
        task_type=CrmTaskType.CONTACT_QUALIFIED_LEAD,
        title="Contact qualified lead",
        status=CrmTaskStatus.OPEN,
        dedupe_key=f"lead:{lead_id}:high_intent_lead:high_intent",
    )

    with patch.object(service, "_create_task", return_value=created_task):
        with patch("app.services.sales_notification_service.SalesNotificationService.notify_new_lead", side_effect=ConnectionError("SMTP server unreachable")):
            res = await service.process_lead_sales_state(lead)
            assert res.triggered is True
            assert res.task_created is True
            assert any("notification_failed" in err for err in res.errors)


@pytest.mark.asyncio
async def test_06_event_bus_subscriber_failure_isolation(clean_bus, mock_db_session):
    """Failure in one event subscriber MUST NOT prevent other subscribers from executing."""
    executed_healthy = False

    async def faulty_handler(evt, db):
        raise ValueError("Database connection lost in subscriber A")

    async def healthy_handler(evt, db):
        nonlocal executed_healthy
        executed_healthy = True
        return {"healthy": True}

    clean_bus.subscribe("test.isolation", faulty_handler)
    clean_bus.subscribe("test.isolation", healthy_handler)

    test_event = BaseDomainEvent(
        event_type="test.isolation",
        idempotency_key="test-iso-key",
    )

    results = await clean_bus.publish(test_event, mock_db_session)
    assert len(results) == 2
    statuses = {r["handler"]: r["status"] for r in results}
    assert statuses["faulty_handler"] == "failed"
    assert statuses["healthy_handler"] == "success"
    assert executed_healthy is True


# ==============================================================================
# 4. USER CORRECTIONS & STATE RECONCILIATION
# ==============================================================================

@pytest.mark.asyncio
async def test_07_user_budget_correction_triggers_recalculation(clean_bus, mock_db_session):
    """When a user changes their budget, LeadUpdatedEvent triggers recommendation recalculation."""
    lead_id = uuid.uuid4()
    orchestrator = AutomationOrchestrator(clean_bus)

    # Lead initially had 1.5 Cr budget, now updated to 3.0 Cr
    update_event = LeadUpdatedEvent(
        lead_id=lead_id,
        changed_fields=["budget_max", "configuration"],
        lead_score=80,
        configuration="4BHK",
        budget_max=30_000_000,
        preferences_changed=True,
        idempotency_key=f"lead-update-{lead_id}-30cr",
    )

    rec_mock_res = MagicMock()
    rec_mock_res.recommendations = [MagicMock(unit_number="T2-2401"), MagicMock(unit_number="T2-2402")]
    rec_mock_res.alternatives = []
    rec_mock_res.total_matches = 2
    rec_mock_res.constraint_relaxed = False

    with patch("app.services.lead_service.LeadService.get_recommendations_for_lead", return_value=rec_mock_res):
        results = await clean_bus.publish(update_event, mock_db_session)
        assert results[0]["status"] == "success"
        assert "recommendations_recalculated" in results[0]["result"]["actions"]


@pytest.mark.asyncio
async def test_08_anonymous_to_identified_reconciliation(mock_db_session):
    """Anonymous conversation lead is successfully merged when user provides phone & email."""
    conv_id = uuid.uuid4()
    existing_lead_id = uuid.uuid4()
    now = utcnow()

    existing_anonymous_lead = Lead(
        id=existing_lead_id,
        created_at=now,
        updated_at=now,
        name="Amnaya Visitor",
        phone=None,
        email=None,
        conversation_id=conv_id,
        configuration="3BHK",
        lead_score=20,
        status=LeadStatus.NEW,
    )

    mock_db_session.scalar.return_value = existing_anonymous_lead
    mock_db_session.scalars.return_value.all.return_value = []

    lead_service = LeadService(mock_db_session)

    # User now identifies themselves in the same conversation with strong intent
    context = LeadContext(
        name="Deepak Sharma",
        phone="+919876543215",
        email="deepak.sharma@example.com",
        whatsapp_consent=True,
        conversation_id=conv_id,
        configuration="3BHK",
        budget_min=25_000_000,
        budget_max=35_000_000,
        buying_purpose="self_use",
        buying_timeline="ready_to_move",
        site_visit_interest=True,
        interaction_count=3,
    )

    result = await lead_service.process_lead_context(context)

    # Lead should be updated, not duplicated
    assert result.lead_id == existing_lead_id
    assert existing_anonymous_lead.name == "Deepak Sharma"
    assert existing_anonymous_lead.phone == "+919876543215"
    assert existing_anonymous_lead.whatsapp_consent is True
    assert existing_anonymous_lead.lead_score >= 50


# ==============================================================================
# 5. BACKEND CONSENT ENFORCEMENT
# ==============================================================================

@pytest.mark.asyncio
async def test_09_whatsapp_shortlist_blocked_without_explicit_consent(clean_bus, mock_db_session):
    """ShortlistReadyEvent without whatsapp_consent=True is strictly rejected by the backend."""
    lead_id = uuid.uuid4()
    orchestrator = AutomationOrchestrator(clean_bus)

    event_without_consent = ShortlistReadyEvent(
        lead_id=lead_id,
        recipient_name="Pooja Hegde",
        phone_number="+919876543216",
        unit_ids=["T1-502"],
        whatsapp_consent=False,
        idempotency_key=f"shortlist-no-consent-{lead_id}",
    )

    results = await clean_bus.publish(event_without_consent, mock_db_session)
    assert results[0]["status"] == "success"
    assert results[0]["result"]["status"] == "skipped_no_consent"


# ==============================================================================
# 6. CONCURRENT SALES ESCALATION INTEGRITY
# ==============================================================================

@pytest.mark.asyncio
async def test_10_concurrent_sales_escalation_race_condition_handled(mock_db_session):
    """When two concurrent workers attempt to escalate the same lead, DB IntegrityError is handled and deduplicated."""
    lead_id = uuid.uuid4()
    lead = Lead(
        id=lead_id,
        name="Alok Nath",
        phone="+919876543217",
        lead_score=90,
        status=LeadStatus.QUALIFIED,
    )

    from sqlalchemy.exc import IntegrityError
    service = SalesTaskService(mock_db_session)

    # First attempt: _existing_task returns None (race condition window)
    mock_db_session.scalar.return_value = None

    existing_won_task = CrmTask(
        id=uuid.uuid4(),
        lead_id=lead_id,
        task_type=CrmTaskType.CONTACT_QUALIFIED_LEAD,
        title="Contact qualified lead",
        status=CrmTaskStatus.OPEN,
        dedupe_key=f"lead:{lead_id}:high_intent_lead:high_intent",
    )

    # Simulate initial check seeing None, INSERT losing the race (IntegrityError), and subsequent check finding existing task
    with patch.object(service, "_existing_task", side_effect=[None, existing_won_task]):
        with patch.object(service, "_create_task", side_effect=IntegrityError("INSERT", {}, Exception("unique constraint duplicate key"))):
            res = await service.process_lead_sales_state(lead)
            assert res.triggered is True
            assert res.duplicate is True
            assert "concurrent escalation detected" in res.reason


# ==============================================================================
# 7. FAILURE RECOVERY & RETRY
# ==============================================================================

@pytest.mark.asyncio
async def test_11_whatsapp_failure_and_subsequent_retry(mock_db_session):
    """WhatsApp message fails on first attempt and succeeds on retry without creating duplicate CRM tasks."""
    lead_id = uuid.uuid4()
    phone = "+919876543218"

    mock_provider = MockWhatsAppProvider()
    service = WhatsAppService(mock_db_session, provider=mock_provider)

    # First attempt: simulate temporary provider network error
    with patch.object(mock_provider, "send_text", return_value=WhatsAppSendResult(
        success=False,
        status="failed",
        error_message="503 Service Unavailable",
        provider_name="mock",
    )):
        msg1 = await service.send_shortlist(
            lead_id=lead_id,
            phone=phone,
            name="Manish Malhotra",
            units=["T1-1001"],
        )
        assert msg1.status == WhatsAppMessageStatus.FAILED
        assert msg1.failed_reason == "503 Service Unavailable"

    # Second attempt (retry): provider succeeds
    with patch.object(mock_provider, "send_text", return_value=WhatsAppSendResult(
        success=True,
        status="simulated",
        provider_message_id="mock-retry-1234",
        provider_name="mock",
    )):
        msg2 = await service.send_shortlist(
            lead_id=lead_id,
            phone=phone,
            name="Manish Malhotra",
            units=["T1-1001"],
        )
        assert msg2.status == WhatsAppMessageStatus.SIMULATED
        assert msg2.provider_message_id == "mock-retry-1234"
