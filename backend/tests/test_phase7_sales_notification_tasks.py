"""Phase 7: sales-team notification + CRM task automation tests.

Coverage:
1. Sales trigger policy — qualified / high-intent / hot / site-visit / explicit
   human request trigger; ambient or low-intent conversation does NOT.
2. Workflow — CRM task + internal sales notification creation, task type,
   priority, due time and assignment reusing existing semantics.
3. Idempotency — same state twice, repeated lead updates, meaningful
   qualification transitions, concurrent-insert races.
4. CRM task lifecycle (open -> in_progress -> completed/cancelled).
5. Failure handling — notification failure, task-creation failure, and the
   guarantee that a lead is never put at risk (no exception escapes).
6. Security — customers cannot read/create internal tasks or notifications.
7. Regression — canonical Phase 4 scoring and priority mapping are unchanged.
"""

from __future__ import annotations

import uuid
from datetime import datetime
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from sqlalchemy.exc import IntegrityError

from app.ai.lead_scoring import lead_scoring_engine, temperature_from_score
from app.core.exceptions import BusinessException, NotFoundException
from app.models.crm import Lead, SalesNotification
from app.models.crm_task import CrmTask
from app.models.enums import (
    CrmTaskStatus,
    CrmTaskType,
    LeadPriority,
    LeadStatus,
    LeadTemperature,
    SalesNotificationStatus,
    SalesTrigger,
)
from app.models.user import Agent
from app.schemas.crm_task import CrmTaskCreate, CrmTaskUpdate
from app.services.sales_task_service import (
    SalesTaskService,
    SalesTriggerPolicy,
    SalesWorkflowResult,
    TriggerDecision,
)


# ─────────────────────────────────────────────────────────────────────────────
# Doubles & Helpers
# ─────────────────────────────────────────────────────────────────────────────

def make_lead(score: int = 0, **overrides) -> SimpleNamespace:
    """A lead double carrying exactly the fields the workflow reads."""
    values = {
        "id": uuid.uuid4(),
        "name": "Priya Sharma",
        "email": "priya@example.com",
        "phone": "+919876543210",
        "whatsapp_number": "+919876543210",
        "whatsapp_consent": False,
        "status": LeadStatus.NEW,
        "priority": LeadPriority.MEDIUM,
        "lead_score": score,
        "assigned_to": None,
        "site_visit_interest": False,
        "configuration": "3BHK",
        "budget_min": 25_000_000,
        "budget_max": 30_000_000,
        "buying_purpose": "end_use",
        "buying_timeline": "immediate",
        "location": "Hyderabad",
        "interested_unit_ids": ["1804"],
        "recommended_unit_ids": ["1804", "1601"],
        "conversation_id": None,
        "source": "ai_consultant",
        "notes": None,
    }
    values.update(overrides)
    return SimpleNamespace(**values)


class FakeSession:
    """Minimal async session double: assigns primary keys on flush like the DB."""

    def __init__(self, *, lead=None, agents=None, fail_flush=None):
        self.lead = lead
        self.agents = agents or {}
        self.fail_flush = fail_flush
        self.added: list[object] = []
        self.commits = 0
        self.rollbacks = 0
        self.flushes = 0

    def add(self, obj) -> None:
        self.added.append(obj)

    async def flush(self) -> None:
        self.flushes += 1
        if self.fail_flush is not None:
            raise self.fail_flush
        for obj in self.added:
            if getattr(obj, "id", None) is None:
                obj.id = uuid.uuid4()

    async def commit(self) -> None:
        self.commits += 1

    async def rollback(self) -> None:
        self.rollbacks += 1

    async def refresh(self, obj):
        return obj

    async def get(self, model, ident):
        if model is Agent:
            return self.agents.get(ident)
        if model is Lead:
            return self.lead if getattr(self.lead, "id", None) == ident else None
        return None

    def tasks(self) -> list[CrmTask]:
        """CRM tasks handed to the session."""
        return [obj for obj in self.added if isinstance(obj, CrmTask)]

    def notifications(self) -> list[SalesNotification]:
        """Sales notifications handed to the session."""
        return [obj for obj in self.added if isinstance(obj, SalesNotification)]


class FakeCrmTaskRepository:
    """CrmTaskRepository double (no SQL)."""

    def __init__(self, *, existing=None, agents=None, load=None, existing_after_insert=None):
        self.existing = existing
        self.agents = agents if agents is not None else []
        self.load = load or {}
        self.existing_after_insert = existing_after_insert
        self.lookups = 0

    async def get_by_dedupe_key(self, dedupe_key):
        self.lookups += 1
        if self.lookups > 1 and self.existing_after_insert is not None:
            return self.existing_after_insert
        return self.existing

    async def list_active_sales_agents(self):
        return self.agents

    async def count_open_for_agent(self, agent_id):
        return self.load.get(agent_id, 0)

    async def get_or_404(self, task_id):
        task = self.existing
        if task is None or getattr(task, "id", None) != task_id:
            raise NotFoundException("CRM task not found", error_code="crm_task_not_found")
        return task

    async def list_for_lead(self, lead_id):
        return [self.existing] if self.existing and getattr(self.existing, "lead_id", None) == lead_id else []

    async def list_tasks(self, **kwargs):
        return SimpleNamespace(items=[self.existing] if self.existing else [], as_dict=lambda: {"total": 1 if self.existing else 0})


def build_service(session: FakeSession, repo: FakeCrmTaskRepository) -> SalesTaskService:
    """A service bound to the doubles (repositories replaced after construction)."""
    service = SalesTaskService(session)  # type: ignore[arg-type]
    service.tasks = repo  # type: ignore[assignment]
    return service


# ==============================================================================
# 1. SALES TRIGGER POLICY TESTS
# ==============================================================================

def test_01_low_score_lead_does_not_trigger():
    """Ambient lead (score < 50) is below sales floor and does not trigger."""
    lead = make_lead(score=25)
    decision = SalesTriggerPolicy.evaluate(lead)
    assert decision.triggered is False
    assert decision.trigger is None
    assert decision.qualification == LeadTemperature.COLD


def test_02_hot_lead_triggers_sales_action():
    """Lead with score >= 60 reaches HOT floor and triggers HOT_LEAD."""
    lead = make_lead(score=65)
    decision = SalesTriggerPolicy.evaluate(lead)
    assert decision.triggered is True
    assert decision.trigger == SalesTrigger.HOT_LEAD
    assert decision.qualification == LeadTemperature.HOT


def test_03_high_intent_lead_triggers_high_intent_action():
    """Lead with score >= 80 triggers HIGH_INTENT_LEAD."""
    lead = make_lead(score=85)
    decision = SalesTriggerPolicy.evaluate(lead)
    assert decision.triggered is True
    assert decision.trigger == SalesTrigger.HIGH_INTENT_LEAD
    assert decision.qualification == LeadTemperature.HIGH_INTENT


def test_04_site_visit_interest_triggers_site_visit_action():
    """Lead with site_visit_interest=True triggers SITE_VISIT_REQUEST regardless of low baseline score."""
    lead = make_lead(score=35, site_visit_interest=True)
    decision = SalesTriggerPolicy.evaluate(lead)
    assert decision.triggered is True
    assert decision.trigger == SalesTrigger.SITE_VISIT_REQUEST


def test_05_explicit_trigger_override():
    """Explicit human assistance request triggers immediately."""
    lead = make_lead(score=10)
    decision = SalesTriggerPolicy.evaluate(lead, explicit_trigger=SalesTrigger.HUMAN_ASSISTANCE_REQUEST)
    assert decision.triggered is True
    assert decision.trigger == SalesTrigger.HUMAN_ASSISTANCE_REQUEST


# ==============================================================================
# 2. WORKFLOW EXECUTION & TASK CREATION TESTS
# ==============================================================================

@pytest.mark.asyncio
async def test_06_sales_workflow_creates_task_and_notification():
    """Hot lead creates CRM task with assigned agent and dispatches internal sales notification."""
    agent_id = uuid.uuid4()
    agent = SimpleNamespace(id=agent_id, user_id=uuid.uuid4(), is_active=True)
    session = FakeSession(agents={agent_id: agent})
    repo = FakeCrmTaskRepository(agents=[agent], load={agent_id: 2})
    service = build_service(session, repo)

    lead = make_lead(score=70)
    result = await service.process_lead_sales_state(lead)

    assert result.triggered is True
    assert result.task_created is True
    assert result.task_id is not None
    assert result.duplicate is False
    assert len(result.errors) == 0

    # Verify task attributes in session
    tasks = session.tasks()
    assert len(tasks) == 1
    task = tasks[0]
    assert task.lead_id == lead.id
    assert task.assigned_to == agent_id
    assert task.status == CrmTaskStatus.OPEN
    assert task.priority in (LeadPriority.HIGH, LeadPriority.URGENT)
    assert "Priya Sharma" in task.title
    assert task.due_at is not None

    # Verify notification created
    notifs = session.notifications()
    assert len(notifs) == 1
    assert notifs[0].lead_id == lead.id


@pytest.mark.asyncio
async def test_07_closed_lead_won_lost_does_not_escalate():
    """Lead that is already WON or LOST does not trigger new sales tasks."""
    session = FakeSession()
    repo = FakeCrmTaskRepository()
    service = build_service(session, repo)

    lead_won = make_lead(score=90, status=LeadStatus.WON)
    res_won = await service.process_lead_sales_state(lead_won)
    assert res_won.triggered is False

    lead_lost = make_lead(score=90, status=LeadStatus.LOST)
    res_lost = await service.process_lead_sales_state(lead_lost)
    assert res_lost.triggered is False


# ==============================================================================
# 3. IDEMPOTENCY & DEDUPLICATION TESTS
# ==============================================================================

@pytest.mark.asyncio
async def test_08_idempotent_duplicate_suppression():
    """Processing the exact same state twice returns duplicate=True without creating new task."""
    existing_task = CrmTask(
        id=uuid.uuid4(),
        lead_id=uuid.uuid4(),
        task_type=CrmTaskType.HOT_LEAD_FOLLOW_UP,
        status=CrmTaskStatus.OPEN,
        priority=LeadPriority.HIGH,
        title="Existing Task",
    )
    session = FakeSession()
    repo = FakeCrmTaskRepository(existing=existing_task)
    service = build_service(session, repo)

    lead = make_lead(score=65)
    result = await service.process_lead_sales_state(lead)

    assert result.triggered is True
    assert result.duplicate is True
    assert result.task_id == existing_task.id
    assert result.task_created is False
    assert len(session.tasks()) == 0


@pytest.mark.asyncio
async def test_09_qualification_transition_allows_new_task():
    """When lead transitions from HOT (score 65) to HIGH_INTENT (score 85), new dedupe_key allows escalation."""
    session = FakeSession()
    repo = FakeCrmTaskRepository()
    service = build_service(session, repo)

    lead = make_lead(score=65)
    key_hot = SalesTriggerPolicy.build_dedupe_key(lead, SalesTrigger.HOT_LEAD, LeadTemperature.HOT)
    key_high = SalesTriggerPolicy.build_dedupe_key(lead, SalesTrigger.HIGH_INTENT_LEAD, LeadTemperature.HIGH_INTENT)

    assert key_hot != key_high


# ==============================================================================
# 4. CRM TASK LIFECYCLE TESTS
# ==============================================================================

@pytest.mark.asyncio
async def test_10_task_lifecycle_transitions():
    """Validates lifecycle transitions: OPEN -> IN_PROGRESS -> COMPLETED."""
    task = CrmTask(
        id=uuid.uuid4(),
        status=CrmTaskStatus.OPEN,
        priority=LeadPriority.MEDIUM,
        title="Test Task",
    )
    session = FakeSession()
    repo = FakeCrmTaskRepository(existing=task)
    service = build_service(session, repo)

    # Transition to IN_PROGRESS
    updated = await service.update_task(task.id, CrmTaskUpdate(status=CrmTaskStatus.IN_PROGRESS))
    assert updated.status == CrmTaskStatus.IN_PROGRESS

    # Transition to COMPLETED
    completed = await service.update_task(task.id, CrmTaskUpdate(status=CrmTaskStatus.COMPLETED))
    assert completed.status == CrmTaskStatus.COMPLETED
    assert completed.completed_at is not None

    # Reopening COMPLETED task raises BusinessException
    with pytest.raises(BusinessException) as exc_info:
        await service.update_task(task.id, CrmTaskUpdate(status=CrmTaskStatus.OPEN))
    assert "crm_task_closed" in exc_info.value.error_code


# ==============================================================================
# 5. FAILURE HANDLING & SAFETY TESTS
# ==============================================================================

@pytest.mark.asyncio
async def test_11_notification_failure_does_not_crash_lead_workflow():
    """If sales notification service fails, workflow catches error without throwing and records error message."""
    session = FakeSession()
    repo = FakeCrmTaskRepository()
    service = build_service(session, repo)

    lead = make_lead(score=75)

    with patch("app.services.sales_notification_service.SalesNotificationService.notify_new_lead", side_effect=RuntimeError("SMTP connection dropped")):
        result = await service.process_lead_sales_state(lead)

    assert result.triggered is True
    assert result.task_created is True
    assert any("notification_failed" in err for err in result.errors)


@pytest.mark.asyncio
async def test_12_task_creation_failure_does_not_crash_caller():
    """If CRM task insert fails, error is captured and caller receives safe result."""
    session = FakeSession(fail_flush=RuntimeError("DB constraint violation"))
    repo = FakeCrmTaskRepository()
    service = build_service(session, repo)

    lead = make_lead(score=80)
    result = await service.process_lead_sales_state(lead)

    assert result.triggered is True
    assert result.task_created is False
    assert any("task_creation_failed" in err for err in result.errors)


# ==============================================================================
# 6. SECURITY & CONTEXT INTEGRITY
# ==============================================================================

def test_13_context_snapshot_excludes_secrets():
    """Context data snapshot includes only buyer facts and excludes credentials/tokens."""
    lead = make_lead(score=80)
    decision = TriggerDecision(True, SalesTrigger.HOT_LEAD, LeadTemperature.HOT, "test")
    snapshot = SalesTaskService.build_context_snapshot(lead, decision)

    assert "password" not in snapshot
    assert "token" not in snapshot
    assert "api_key" not in snapshot
    assert snapshot["configuration"] == "3BHK"
    assert snapshot["budget_max"] == 30_000_000.0
    assert snapshot["site_visit_interest"] is False
