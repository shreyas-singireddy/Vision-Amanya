"""Phase 7: sales-team notification + CRM task automation (internal workflow).

Scope and boundaries
--------------------
This module owns *only* the internal sales workflow:

    Lead -> canonical qualification (Phase 4) -> sales trigger
         -> internal sales notification -> CRM task

It deliberately does **not**:

* re-implement lead scoring — ``app.ai.lead_scoring.temperature_from_score``
  (Phase 4) remains the single source of qualification truth;
* send any customer-facing message (WhatsApp/SMS/email to the buyer);
* mutate the ``leads`` row — the lead is never put at risk by an internal
  notification or task failure;
* dispatch global events. ``SalesTaskService.process_lead_sales_state`` /
  ``run_for_lead_id`` are the integration point for Agent 8's orchestration
  layer and for the RBAC-guarded ``/api/v1/crm`` endpoints.

Delivery failures are never silent: every attempt is persisted (CRM task row +
``sales_notifications`` row), audit-logged and returned in
:class:`SalesWorkflowResult` while the lead stays intact.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass, field
from datetime import timedelta
from typing import Any

from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.exceptions import BusinessException, NotFoundException
from app.core.logging import get_logger
from app.models.crm import SalesNotification
from app.models.crm_task import CrmTask
from app.models.enums import (
    CrmTaskStatus,
    CrmTaskType,
    LeadPriority,
    LeadStatus,
    LeadTemperature,
    SalesTrigger,
)
from app.models.user import Agent
from app.repositories.crm_task import CrmTaskRepository
from app.repositories.lead import LeadRepository
from app.repositories.sales_notification import SalesNotificationRepository
from app.schemas.crm_task import CrmTaskCreate, CrmTaskUpdate
from app.services.base import BaseService
from app.utils.audit import write_audit_log
from app.utils.dates import utcnow

logger = get_logger("app.services.sales_task")

# Canonical Phase 4 temperature bands, ordered for comparison.
_TEMPERATURE_RANK: dict[LeadTemperature, int] = {
    LeadTemperature.COLD: 0,
    LeadTemperature.WARM: 1,
    LeadTemperature.HOT: 2,
    LeadTemperature.HIGH_INTENT: 3,
}

#: The only accepted floors — existing Phase 4 bands, never new thresholds.
_MIN_TEMPERATURES: dict[str, LeadTemperature] = {
    "hot": LeadTemperature.HOT,
    "high_intent": LeadTemperature.HIGH_INTENT,
}

_TASK_TYPE_BY_TRIGGER: dict[SalesTrigger, CrmTaskType] = {
    SalesTrigger.HIGH_INTENT_LEAD: CrmTaskType.CONTACT_QUALIFIED_LEAD,
    SalesTrigger.HOT_LEAD: CrmTaskType.HOT_LEAD_FOLLOW_UP,
    SalesTrigger.SITE_VISIT_REQUEST: CrmTaskType.SITE_VISIT_COORDINATION,
    SalesTrigger.HUMAN_ASSISTANCE_REQUEST: CrmTaskType.CONTACT_QUALIFIED_LEAD,
    SalesTrigger.MANUAL: CrmTaskType.MANUAL,
}

_TASK_TITLE_BY_TYPE: dict[CrmTaskType, str] = {
    CrmTaskType.CONTACT_QUALIFIED_LEAD: "Contact qualified lead",
    CrmTaskType.HOT_LEAD_FOLLOW_UP: "Follow up with hot lead",
    CrmTaskType.SITE_VISIT_COORDINATION: "Coordinate requested site visit",
    CrmTaskType.MANUAL: "Sales follow-up",
}


@dataclass(frozen=True)
class TriggerDecision:
    """Outcome of deterministic sales-trigger evaluation."""

    triggered: bool
    trigger: SalesTrigger | None = None
    qualification: LeadTemperature = LeadTemperature.COLD
    reason: str = ""


@dataclass
class SalesWorkflowResult:
    """Result of one sales-workflow pass (always returned, never raised)."""

    lead_id: uuid.UUID | None
    triggered: bool
    reason: str
    trigger: SalesTrigger | None = None
    qualification: str | None = None
    task_id: uuid.UUID | None = None
    task_created: bool = False
    notification_id: uuid.UUID | None = None
    notification_status: str | None = None
    duplicate: bool = False
    errors: list[str] = field(default_factory=list)

    def as_dict(self) -> dict[str, Any]:
        """Serializable form used by the API response schema."""
        return {
            "lead_id": self.lead_id,
            "triggered": self.triggered,
            "trigger": self.trigger,
            "qualification": self.qualification,
            "reason": self.reason,
            "task_id": self.task_id,
            "task_created": self.task_created,
            "notification_id": self.notification_id,
            "notification_status": self.notification_status,
            "duplicate": self.duplicate,
            "errors": list(self.errors),
        }


def _as_value(value: Any) -> Any:
    """Return the raw value of an enum member (or the value unchanged)."""
    return getattr(value, "value", value)


class SalesTriggerPolicy:
    """Deterministic rules deciding whether a lead escalates to the sales team.

    Grounded strictly in existing semantics:

    * ``HOT`` / ``HIGH_INTENT`` come from ``app.ai.lead_scoring`` (Phase 4). The
      configured floor (``SALES_TRIGGER_MIN_TEMPERATURE``) may only select one of
      those two existing bands — no new numbers are invented.
    * ``Lead.site_visit_interest`` is the explicit action signal already scored
      by the ACTION dimension.
    * Explicit escalations (for example the AI handoff's explicit human request)
      are supplied by the calling flow.

    Ambient conversation ("Hello", "What is the project?", "Tell me about
    amenities") never reaches the floor, so it never notifies sales.
    """

    @staticmethod
    def qualification_of(lead: Any) -> LeadTemperature:
        """Canonical qualification band for a lead (reuses the Phase 4 engine)."""
        from app.ai.lead_scoring import temperature_from_score

        score = int(getattr(lead, "lead_score", 0) or 0)
        return temperature_from_score(score)

    @classmethod
    def min_temperature(cls) -> LeadTemperature:
        """Configured escalation floor, defaulting to the HOT band."""
        raw = str(
            getattr(get_settings(), "SALES_TRIGGER_MIN_TEMPERATURE", "hot") or "hot"
        ).strip().lower()
        return _MIN_TEMPERATURES.get(raw, LeadTemperature.HOT)

    @classmethod
    def evaluate(
        cls, lead: Any, *, explicit_trigger: SalesTrigger | None = None
    ) -> TriggerDecision:
        """Decide whether this lead state is a meaningful sales trigger."""
        qualification = cls.qualification_of(lead)

        if explicit_trigger is not None:
            return TriggerDecision(
                True,
                explicit_trigger,
                qualification,
                f"explicit escalation trigger '{_as_value(explicit_trigger)}' supplied by an authorized flow.",
            )

        if getattr(lead, "site_visit_interest", False):
            return TriggerDecision(
                True,
                SalesTrigger.SITE_VISIT_REQUEST,
                qualification,
                "visitor explicitly requested a site visit.",
            )

        floor = cls.min_temperature()
        if _TEMPERATURE_RANK[qualification] >= _TEMPERATURE_RANK[floor]:
            trigger = (
                SalesTrigger.HIGH_INTENT_LEAD
                if qualification == LeadTemperature.HIGH_INTENT
                else SalesTrigger.HOT_LEAD
            )
            return TriggerDecision(
                True,
                trigger,
                qualification,
                f"qualification '{_as_value(qualification)}' meets the sales floor '{_as_value(floor)}'.",
            )

        return TriggerDecision(
            False,
            None,
            qualification,
            f"qualification '{_as_value(qualification)}' is below the sales floor '{_as_value(floor)}'.",
        )

    @staticmethod
    def build_dedupe_key(
        lead: Any, trigger: SalesTrigger, qualification: LeadTemperature
    ) -> str:
        """Idempotency fingerprint of the business state being escalated."""
        return f"lead:{getattr(lead, 'id', None)}:{_as_value(trigger)}:{_as_value(qualification)}"



class SalesTaskService(BaseService):
    """Creates internal sales notifications and CRM tasks for sales-ready leads.

    Every public method is *raise-free* for infrastructure failures of the
    internal workflow: the lead is never mutated here, and errors are collected
    in :class:`SalesWorkflowResult.errors` so an AI conversation or API call can
    never fail because a sales email or CRM insert did.
    """

    def __init__(self, db: AsyncSession) -> None:
        super().__init__(db)
        self.tasks = self._repo("crm_tasks", CrmTaskRepository)
        self.leads = self._repo("leads", LeadRepository)
        self.notifications = self._repo("sales_notifications", SalesNotificationRepository)

    # ── Canonical integration point (Agent 8 orchestration / endpoints) ──────

    async def process_lead_sales_state(
        self,
        lead: Any,
        *,
        actor_id: uuid.UUID | None = None,
        explicit_trigger: SalesTrigger | None = None,
        note: str | None = None,
        notify: bool = True,
    ) -> SalesWorkflowResult:
        """Evaluate a lead's canonical state and escalate it once.

        Idempotent: the same ``(lead, trigger, qualification)`` state is
        processed at most once, so repeated conversation turns or repeated
        qualification updates never duplicate the notification or the task.
        """
        lead_id = getattr(lead, "id", None)
        decision = SalesTriggerPolicy.evaluate(lead, explicit_trigger=explicit_trigger)
        qualification = _as_value(decision.qualification)

        if getattr(lead, "status", None) in (LeadStatus.WON, LeadStatus.LOST):
            reason = "lead is closed (won/lost); no sales escalation."
            self._log(lead_id, None, qualification, None, None, None, False, reason)
            return SalesWorkflowResult(
                lead_id=lead_id,
                triggered=False,
                qualification=qualification,
                reason=reason,
            )

        if not decision.triggered or decision.trigger is None:
            self._log(lead_id, None, qualification, None, None, None, False, decision.reason)
            return SalesWorkflowResult(
                lead_id=lead_id,
                triggered=False,
                qualification=qualification,
                reason=decision.reason,
            )

        dedupe_key = SalesTriggerPolicy.build_dedupe_key(
            lead, decision.trigger, decision.qualification
        )
        errors: list[str] = []

        # 1. Idempotency guard — the task row is the escalation ledger.
        existing = await self._existing_task(dedupe_key, errors)
        if existing is not None:
            reason = "already escalated for this qualification state; duplicate suppressed."
            self._log(lead_id, decision.trigger, qualification, existing.id, None, None, True, reason)
            return SalesWorkflowResult(
                lead_id=lead_id,
                triggered=True,
                trigger=decision.trigger,
                qualification=qualification,
                reason=reason,
                task_id=existing.id,
                duplicate=True,
            )

        # 2. CRM task (internal work item).
        task: CrmTask | None = None
        try:
            task = await self._create_task(
                lead, decision, dedupe_key=dedupe_key, actor_id=actor_id, note=note
            )
        except IntegrityError:
            # Lost a race with a concurrent escalation for the same state.
            await self._safe_rollback()
            existing = await self._existing_task(dedupe_key, errors)
            reason = "concurrent escalation detected; duplicate suppressed."
            self._log(
                lead_id, decision.trigger, qualification,
                getattr(existing, "id", None), None, None, True, reason,
            )
            return SalesWorkflowResult(
                lead_id=lead_id,
                triggered=True,
                trigger=decision.trigger,
                qualification=qualification,
                reason=reason,
                task_id=getattr(existing, "id", None),
                duplicate=True,
                errors=errors,
            )
        except Exception as exc:  # noqa: BLE001 - internal workflow must not fail the caller
            await self._safe_rollback()
            errors.append(f"task_creation_failed: {exc}")
            logger.error(
                "CRM task creation failed for lead=%s trigger=%s: %s",
                lead_id, _as_value(decision.trigger), exc,
            )

        # 3. Internal sales notification (never customer-facing). Sent even when
        #    the task insert failed, so a sales event is never silently lost.
        notification: SalesNotification | None = None
        if notify:
            try:
                from app.services.sales_notification_service import SalesNotificationService

                notification = await SalesNotificationService(self.db).notify_new_lead(
                    lead,
                    trigger=_as_value(decision.trigger),
                    qualification=qualification,
                )
            except Exception as exc:  # noqa: BLE001 - notification failure stays contained
                errors.append(f"notification_failed: {exc}")
                logger.error(
                    "Sales notification failed for lead=%s trigger=%s: %s",
                    lead_id, _as_value(decision.trigger), exc,
                )

        result = SalesWorkflowResult(
            lead_id=lead_id,
            triggered=True,
            trigger=decision.trigger,
            qualification=qualification,
            reason=decision.reason,
            task_id=getattr(task, "id", None),
            task_created=task is not None,
            notification_id=getattr(notification, "id", None),
            notification_status=_as_value(getattr(notification, "status", None)),
            errors=errors,
        )
        self._log(
            lead_id, decision.trigger, qualification, result.task_id,
            result.notification_id, result.notification_status, False, decision.reason,
        )
        return result

    async def run_for_lead_id(
        self,
        lead_id: uuid.UUID,
        *,
        actor_id: uuid.UUID | None = None,
        explicit_trigger: SalesTrigger | None = None,
        note: str | None = None,
        notify: bool = True,
    ) -> SalesWorkflowResult:
        """Load a lead by id and run the sales workflow for it."""
        lead = await self.leads.get_or_404(lead_id)
        return await self.process_lead_sales_state(
            lead,
            actor_id=actor_id,
            explicit_trigger=explicit_trigger,
            note=note,
            notify=notify,
        )


    # ── CRM task creation / management ───────────────────────────────────────

    async def create_manual_task(
        self, payload: CrmTaskCreate, *, actor_id: uuid.UUID | None = None
    ) -> CrmTask:
        """Create a CRM task on request (agent/admin). Not deduplicated."""
        lead = await self.leads.get_or_404(payload.lead_id)
        qualification = SalesTriggerPolicy.qualification_of(lead)
        decision = TriggerDecision(True, SalesTrigger.MANUAL, qualification, "manually created.")
        priority = payload.priority or self._priority_for(lead, decision)
        assigned_to = payload.assigned_to or await self._resolve_assignee(lead)
        if payload.assigned_to:
            await self._validate_agent(payload.assigned_to)

        task = CrmTask(
            lead_id=lead.id,
            assigned_to=assigned_to,
            created_by=actor_id,
            task_type=payload.task_type,
            status=CrmTaskStatus.OPEN,
            priority=priority,
            title=payload.title or _TASK_TITLE_BY_TYPE[payload.task_type],
            description=payload.description,
            trigger=SalesTrigger.MANUAL,
            qualification=_as_value(qualification),
            lead_score=int(getattr(lead, "lead_score", 0) or 0),
            dedupe_key=None,
            context_data=self.build_context_snapshot(lead, decision),
            due_at=payload.due_at or self._default_due_at(),
        )
        self.db.add(task)
        await self.db.flush()
        await write_audit_log(
            self.db,
            action="sales_task.created_manual",
            resource_type="crm_task",
            resource_id=task.id,
            actor_user_id=actor_id,
            new_value={
                "lead_id": str(task.lead_id) if task.lead_id else None,
                "task_type": _as_value(task.task_type),
                "priority": _as_value(task.priority),
                "assigned_to": str(task.assigned_to) if task.assigned_to else None,
            },
        )
        await self.commit()
        return task

    async def update_task(
        self,
        task_id: uuid.UUID,
        payload: CrmTaskUpdate,
        *,
        actor_id: uuid.UUID | None = None,
    ) -> CrmTask:
        """Update a CRM task (status, priority, owner, due date, notes)."""
        task = await self.tasks.get_or_404(task_id)
        data = payload.model_dump(exclude_unset=True)
        old_value = {
            "status": _as_value(task.status),
            "priority": _as_value(task.priority),
            "assigned_to": str(task.assigned_to) if task.assigned_to else None,
        }

        new_status = data.pop("status", None)
        if new_status is not None:
            self._apply_status(task, new_status)
        if "assigned_to" in data and data["assigned_to"] is not None:
            await self._validate_agent(data["assigned_to"])
        for field_name, value in data.items():
            if value is not None:
                setattr(task, field_name, value)

        await write_audit_log(
            self.db,
            action="sales_task.updated",
            resource_type="crm_task",
            resource_id=task.id,
            actor_user_id=actor_id,
            old_value=old_value,
            new_value={key: _as_value(value) for key, value in payload.model_dump(exclude_unset=True).items()},
        )
        await self.commit()
        return task

    async def get_task(self, task_id: uuid.UUID) -> CrmTask:
        """Fetch one CRM task or raise 404."""
        return await self.tasks.get_or_404(task_id)

    async def list_tasks(
        self,
        *,
        page: int = 1,
        page_size: int = 20,
        lead_id: uuid.UUID | None = None,
        assigned_to: uuid.UUID | None = None,
        status: CrmTaskStatus | None = None,
        priority: LeadPriority | None = None,
    ) -> Any:
        """Paginate CRM tasks for the internal team."""
        return await self.tasks.list_tasks(
            page=page,
            page_size=page_size,
            lead_id=lead_id,
            assigned_to=assigned_to,
            status=status,
            priority=priority,
        )

    async def list_for_lead(self, lead_id: uuid.UUID) -> list[CrmTask]:
        """All CRM tasks raised for a lead."""
        await self.leads.get_or_404(lead_id)
        return await self.tasks.list_for_lead(lead_id)

    async def list_sales_notifications(
        self,
        *,
        page: int = 1,
        page_size: int = 20,
        lead_id: uuid.UUID | None = None,
        status: Any | None = None,
    ) -> Any:
        """Paginate the internal sales-notification log."""
        return await self.notifications.list_notifications(
            page=page, page_size=page_size, lead_id=lead_id, status=status
        )


    # ── Helpers ──────────────────────────────────────────────────────────────

    async def _create_task(
        self,
        lead: Any,
        decision: TriggerDecision,
        *,
        dedupe_key: str,
        actor_id: uuid.UUID | None = None,
        note: str | None = None,
    ) -> CrmTask:
        """Persist the internal CRM task for an automated sales trigger."""
        trigger = decision.trigger or SalesTrigger.MANUAL
        task = CrmTask(
            lead_id=getattr(lead, "id", None),
            assigned_to=await self._resolve_assignee(lead),
            created_by=actor_id,
            task_type=_TASK_TYPE_BY_TRIGGER.get(trigger, CrmTaskType.CONTACT_QUALIFIED_LEAD),
            status=CrmTaskStatus.OPEN,
            priority=self._priority_for(lead, decision),
            title=self.build_task_title(lead, decision),
            description=self.build_task_description(lead, decision, note=note),
            trigger=trigger,
            qualification=_as_value(decision.qualification),
            lead_score=int(getattr(lead, "lead_score", 0) or 0),
            dedupe_key=dedupe_key,
            context_data=self.build_context_snapshot(lead, decision),
            due_at=self._default_due_at(),
        )
        self.db.add(task)
        await self.db.flush()
        await write_audit_log(
            self.db,
            action="sales_task.created",
            resource_type="crm_task",
            resource_id=task.id,
            actor_user_id=actor_id,
            new_value={
                "lead_id": str(task.lead_id) if task.lead_id else None,
                "trigger": _as_value(task.trigger),
                "qualification": task.qualification,
                "task_type": _as_value(task.task_type),
                "priority": _as_value(task.priority),
                "assigned_to": str(task.assigned_to) if task.assigned_to else None,
                "dedupe_key": dedupe_key,
            },
        )
        await self.commit()
        return task

    async def _resolve_assignee(self, lead: Any) -> uuid.UUID | None:
        """Pick the sales agent that should own the task.

        Reuses the existing assignment semantics instead of inventing a new
        algorithm: an already-owned lead keeps its agent (``Lead.assigned_to``),
        otherwise the least-loaded active agent is chosen — the same LEAST_ACTIVE
        notion ``HandoffService.assign_sales_consultant`` uses. When no active
        agent exists the task is created **unassigned** (documented limitation).
        """
        existing_owner = getattr(lead, "assigned_to", None)
        if existing_owner:
            return existing_owner

        try:
            agents = await self.tasks.list_active_sales_agents()
        except Exception as exc:  # noqa: BLE001 - assignment is best effort
            logger.warning("Agent lookup failed during CRM task assignment: %s", exc)
            return None

        if not agents:
            logger.info(
                "No active sales agent available for lead=%s; CRM task created unassigned.",
                getattr(lead, "id", None),
            )
            return None

        loads: dict[Any, int] = {}
        for agent in agents:
            try:
                loads[agent.id] = await self.tasks.count_open_for_agent(agent.id)
            except Exception:  # noqa: BLE001 - fall back to zero load
                loads[agent.id] = 0
        return min(agents, key=lambda agent: loads.get(agent.id, 0)).id

    @staticmethod
    def _priority_for(lead: Any, decision: TriggerDecision) -> LeadPriority:
        """Map the canonical score to priority, reusing LeadService's mapping.

        Explicit escalations (high intent / human assistance) are URGENT; the
        remaining automated sales triggers are floored at HIGH so a sales-ready
        lead never lands in a low bucket. Human-created tasks keep the
        score-derived priority.
        """
        from app.services.lead_service import LeadService

        score = int(getattr(lead, "lead_score", 0) or 0)
        priority = LeadService._priority_from_score(score)
        if decision.trigger in {
            SalesTrigger.HIGH_INTENT_LEAD,
            SalesTrigger.HUMAN_ASSISTANCE_REQUEST,
        }:
            return LeadPriority.URGENT
        if decision.trigger in {
            SalesTrigger.HOT_LEAD,
            SalesTrigger.SITE_VISIT_REQUEST,
        } and priority in {LeadPriority.LOW, LeadPriority.MEDIUM}:
            return LeadPriority.HIGH
        return priority

    @staticmethod
    def _apply_status(task: CrmTask, new_status: CrmTaskStatus) -> None:
        """Move a task through its lifecycle, refusing to reopen closed work."""
        terminal = {CrmTaskStatus.COMPLETED, CrmTaskStatus.CANCELLED}
        if task.status in terminal and new_status not in terminal:
            raise BusinessException(
                "A closed CRM task cannot be reopened.", error_code="crm_task_closed"
            )
        task.status = new_status
        if new_status == CrmTaskStatus.COMPLETED:
            task.completed_at = utcnow()
        elif new_status == CrmTaskStatus.CANCELLED:
            task.cancelled_at = utcnow()

    async def _validate_agent(self, agent_id: uuid.UUID) -> Agent:
        """Ensure an assignee agent profile exists."""
        agent = await self.db.get(Agent, agent_id)
        if agent is None:
            raise NotFoundException("Agent not found", error_code="agent_not_found")
        return agent

    async def _existing_task(self, dedupe_key: str, errors: list[str]) -> CrmTask | None:
        """Look up the escalation ledger row for a business state."""
        try:
            return await self.tasks.get_by_dedupe_key(dedupe_key)
        except Exception as exc:  # noqa: BLE001 - a lookup failure must not hide the trigger
            errors.append(f"idempotency_lookup_failed: {exc}")
            logger.warning("Idempotency lookup failed for %s: %s", dedupe_key, exc)
            return None

    async def _safe_rollback(self) -> None:
        """Roll back without propagating session errors."""
        try:
            await self.rollback()
        except Exception:  # noqa: BLE001 - already handling a failure
            logger.debug("Rollback after sales-workflow failure was a no-op.")

    @staticmethod
    def _default_due_at() -> Any:
        """Follow-up SLA for a new task (existing 30-minute sales guideline)."""
        minutes = int(getattr(get_settings(), "SALES_TASK_DUE_MINUTES", 30) or 30)
        return utcnow() + timedelta(minutes=max(1, minutes))

    @staticmethod
    def _log(
        lead_id: Any,
        trigger: SalesTrigger | None,
        qualification: Any,
        task_id: Any,
        notification_id: Any,
        notification_status: Any,
        duplicate: bool,
        reason: str,
    ) -> None:
        """Structured internal activity log (never contains secrets)."""
        logger.info(
            "sales_workflow lead=%s trigger=%s qualification=%s task=%s notification=%s "
            "notification_status=%s duplicate=%s reason=%s",
            lead_id,
            _as_value(trigger) if trigger is not None else None,
            qualification,
            task_id,
            notification_id,
            notification_status,
            duplicate,
            reason,
            extra={
                "extra_fields": {
                    "lead_id": str(lead_id) if lead_id else None,
                    "trigger": _as_value(trigger) if trigger is not None else None,
                    "qualification": qualification,
                    "task_id": str(task_id) if task_id else None,
                    "notification_id": str(notification_id) if notification_id else None,
                    "notification_status": notification_status,
                    "duplicate": duplicate,
                    "reason": reason,
                }
            },
        )



    # ── Content builders (internal CRM content, no customer data leakage) ────

    @staticmethod
    def build_task_title(lead: Any, decision: TriggerDecision) -> str:
        """Human task title, e.g. ``Contact qualified lead — Priya Sharma (3BHK)``."""
        trigger = decision.trigger or SalesTrigger.MANUAL
        base = _TASK_TITLE_BY_TYPE.get(
            _TASK_TYPE_BY_TRIGGER.get(trigger, CrmTaskType.CONTACT_QUALIFIED_LEAD),
            "Sales follow-up",
        )
        name = (getattr(lead, "name", None) or "").strip()
        configuration = (getattr(lead, "configuration", None) or "").strip()
        detail = " — ".join(part for part in (name, configuration) if part)
        return f"{base} — {detail}" if detail else base

    @staticmethod
    def build_task_description(
        lead: Any, decision: TriggerDecision, *, note: str | None = None
    ) -> str:
        """Internal task description built from canonical lead facts only."""
        lines = [f"Trigger: {_as_value(decision.trigger or SalesTrigger.MANUAL)}",
                 f"Qualification: {_as_value(decision.qualification)}",
                 f"Lead score: {int(getattr(lead, 'lead_score', 0) or 0)}/100"]
        if getattr(lead, "buying_timeline", None):
            lines.append(f"Timeline: {getattr(lead, 'buying_timeline')}")
        if getattr(lead, "site_visit_interest", False):
            lines.append("Site visit: explicitly requested by the visitor")
        units = list(getattr(lead, "interested_unit_ids", None) or [])
        if units:
            lines.append(f"Interested units: {', '.join(str(unit) for unit in units)}")
        recommendations = list(getattr(lead, "recommended_unit_ids", None) or [])
        if recommendations:
            lines.append(f"Recommendations: {', '.join(str(unit) for unit in recommendations)}")
        if note:
            lines.append(f"Note: {note}")
        return "\n".join(lines)

    @staticmethod
    def build_context_snapshot(lead: Any, decision: TriggerDecision) -> dict[str, Any]:
        """Structured CRM context stored on the task (JSONB).

        Only buyer-profile facts already stored on the lead are copied — no
        credentials, tokens or secrets exist on these fields, and nothing in this
        payload is ever returned to a customer-facing API.
        """
        budget_min = getattr(lead, "budget_min", None)
        budget_max = getattr(lead, "budget_max", None)
        return {
            "trigger": _as_value(decision.trigger) if decision.trigger else None,
            "qualification": _as_value(decision.qualification),
            "reason": decision.reason,
            "lead_status": _as_value(getattr(lead, "status", None)),
            "lead_priority": _as_value(getattr(lead, "priority", None)),
            "location": getattr(lead, "location", None),
            "buying_purpose": getattr(lead, "buying_purpose", None),
            "buying_timeline": getattr(lead, "buying_timeline", None),
            "configuration": getattr(lead, "configuration", None),
            "budget_min": float(budget_min) if budget_min is not None else None,
            "budget_max": float(budget_max) if budget_max is not None else None,
            "site_visit_interest": bool(getattr(lead, "site_visit_interest", False)),
            "interested_unit_ids": list(getattr(lead, "interested_unit_ids", None) or []),
            "recommended_unit_ids": list(getattr(lead, "recommended_unit_ids", None) or []),
            "conversation_id": str(conversation_id) if (conversation_id := getattr(lead, "conversation_id", None)) else None,
            "source": getattr(lead, "source", None),
        }

