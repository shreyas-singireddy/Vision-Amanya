"""Event-Driven Automation Orchestrator for Vision Amnaya.

Connects lead updates, scoring/qualification, recommendations, WhatsApp messaging,
and sales team notifications through decoupled domain events without duplicating business logic.
"""

from __future__ import annotations

import logging
import uuid
from typing import Any, Optional

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

logger = logging.getLogger("app.events.orchestrator")


class AutomationOrchestrator:
    """Coordinates cross-service automation workflows via domain events."""

    def __init__(self, bus: EventBus = event_bus) -> None:
        self.bus = bus
        self._register_subscriptions()

    def _register_subscriptions(self) -> None:
        """Register all default domain event handlers."""
        self.bus.subscribe("lead.created", self.on_lead_created)
        self.bus.subscribe("lead.updated", self.on_lead_updated)
        self.bus.subscribe("lead.qualification_changed", self.on_qualification_changed)
        self.bus.subscribe("lead.whatsapp_consent_granted", self.on_whatsapp_consent_granted)
        self.bus.subscribe("lead.shortlist_ready", self.on_shortlist_ready)
        self.bus.subscribe("lead.sales_handoff_requested", self.on_sales_handoff_requested)

    # ── Handlers ──────────────────────────────────────────────────────────────

    async def on_lead_created(self, event: LeadCreatedEvent, db: Optional[Any] = None) -> dict[str, Any]:
        """Orchestrate automation when a new lead is created."""
        logger.info("Orchestrating workflow for LeadCreated: %s (Score: %d)", event.lead_id, event.lead_score)
        actions_taken: list[str] = []

        # 1. If high intent / qualified lead on creation -> trigger sales notification
        if event.lead_score >= 50 or event.status == "qualified":
            qual_event = LeadQualificationChangedEvent(
                lead_id=event.lead_id,
                previous_score=0,
                new_score=event.lead_score,
                previous_status="new",
                new_status=event.status,
                temperature="hot" if event.lead_score >= 70 else "warm",
                is_qualified=True,
                is_hot=event.lead_score >= 70,
                idempotency_key=f"qual-{event.lead_id}-{event.lead_score}",
                correlation_id=event.correlation_id,
            )
            await self.bus.publish(qual_event, db)
            actions_taken.append("emitted_qualification_event")

        # 2. If consent granted and phone available -> emit consent event
        if event.whatsapp_consent and (event.whatsapp_number or event.phone):
            phone = event.whatsapp_number or event.phone
            consent_event = WhatsAppConsentGrantedEvent(
                lead_id=event.lead_id,
                whatsapp_number=str(phone),
                consent_source=event.source,
                idempotency_key=f"consent-{event.lead_id}",
                correlation_id=event.correlation_id,
            )
            await self.bus.publish(consent_event, db)
            actions_taken.append("emitted_consent_event")

        return {"lead_id": str(event.lead_id), "actions": actions_taken, "status": "processed"}

    async def on_lead_updated(self, event: LeadUpdatedEvent, db: Optional[Any] = None) -> dict[str, Any]:
        """Orchestrate automation when lead preferences or attributes are updated."""
        logger.info("Orchestrating workflow for LeadUpdated: %s (Preferences changed: %s)", event.lead_id, event.preferences_changed)
        actions_taken: list[str] = []

        # 1. If preferences changed materially -> recalculate recommendations
        if event.preferences_changed and db is not None:
            try:
                from app.services.lead_service import LeadService
                lead_svc = LeadService(db)
                rec_res = await lead_svc.get_recommendations_for_lead(event.lead_id, top_n=3)
                top_units = [u.unit_number for u in rec_res.recommendations] or [u.unit_number for u in rec_res.alternatives]

                rec_event = RecommendationUpdatedEvent(
                    lead_id=event.lead_id,
                    recommended_unit_ids=top_units,
                    top_unit=top_units[0] if top_units else None,
                    total_matches=rec_res.total_matches,
                    constraint_relaxed=rec_res.constraint_relaxed,
                    idempotency_key=f"rec-{event.lead_id}-{len(top_units)}-{rec_res.total_matches}",
                    correlation_id=event.correlation_id,
                )
                await self.bus.publish(rec_event, db)
                actions_taken.append("recommendations_recalculated")
            except Exception as exc:
                logger.warning("Failed to recalculate recommendations for lead %s: %s", event.lead_id, exc)
                actions_taken.append("recommendations_recalculation_failed")

        return {"lead_id": str(event.lead_id), "actions": actions_taken, "status": "processed"}

    async def on_qualification_changed(self, event: LeadQualificationChangedEvent, db: Optional[Any] = None) -> dict[str, Any]:
        """Orchestrate sales alerts and CRM tasks when lead qualification tier changes."""
        logger.info(
            "Orchestrating qualification workflow for lead %s (Score: %d -> %d, Qualified: %s)",
            event.lead_id,
            event.previous_score,
            event.new_score,
            event.is_qualified,
        )
        actions_taken: list[str] = []

        # Only escalate when lead crosses the qualification threshold
        if (event.is_qualified or event.new_score >= 50) and db is not None:
            try:
                from app.models.crm import Lead
                from app.services.sales_task_service import SalesTaskService
                from sqlalchemy import select

                lead = await db.scalar(select(Lead).where(Lead.id == event.lead_id))
                if lead:
                    sales_svc = SalesTaskService(db)
                    result = await sales_svc.process_lead_sales_state(lead)
                    if result.task_created:
                        actions_taken.append("crm_task_created")
                    if result.notification_status:
                        actions_taken.append(f"sales_notification_{result.notification_status}")
                    elif result.notification_id:
                        actions_taken.append("sales_notification_dispatched")
                    if result.duplicate:
                        actions_taken.append("sales_escalation_duplicate_suppressed")
                    if not result.task_created and not result.duplicate and not result.notification_id:
                        actions_taken.append("sales_evaluated_no_escalation")
            except Exception as exc:
                logger.error("Sales qualification workflow failed for lead %s: %s", event.lead_id, exc, exc_info=True)
                actions_taken.append("sales_notification_failed")

        return {"lead_id": str(event.lead_id), "actions": actions_taken, "status": "processed"}

    async def on_whatsapp_consent_granted(self, event: WhatsAppConsentGrantedEvent, db: Optional[Any] = None) -> dict[str, Any]:
        """Check for shortlisted units and emit ShortlistReadyEvent upon receiving consent."""
        logger.info("WhatsApp consent granted for lead %s (%s)", event.lead_id, event.whatsapp_number)
        actions_taken: list[str] = []

        if db is not None:
            try:
                from app.models.crm import Lead
                from app.services.lead_service import LeadService
                from sqlalchemy import select

                lead = await db.scalar(select(Lead).where(Lead.id == event.lead_id))
                if lead:
                    units = list(lead.recommended_unit_ids or lead.interested_unit_ids or [])
                    # If no units calculated yet, compute recommendations on the fly
                    if not units:
                        try:
                            lead_svc = LeadService(db)
                            rec_res = await lead_svc.get_recommendations_for_lead(lead.id, top_n=3, update_lead=True)
                            units = [u.unit_number for u in rec_res.recommendations] or [u.unit_number for u in rec_res.alternatives]
                        except Exception as rec_err:
                            logger.warning("Could not auto-generate recommendations on consent for lead %s: %s", event.lead_id, rec_err)

                    if units:
                        shortlist_event = ShortlistReadyEvent(
                            lead_id=event.lead_id,
                            recipient_name=lead.name or "Amnaya Visitor",
                            phone_number=event.whatsapp_number,
                            unit_ids=units,
                            configuration=lead.configuration,
                            preferred_view=lead.preferred_view,
                            whatsapp_consent=True,
                            idempotency_key=f"shortlist-ready-{event.lead_id}-{len(units)}",
                            correlation_id=event.correlation_id,
                        )
                        await self.bus.publish(shortlist_event, db)
                        actions_taken.append("emitted_shortlist_ready")
            except Exception as exc:
                logger.error("Failed to check shortlist for lead %s: %s", event.lead_id, exc)
                actions_taken.append("shortlist_check_failed")

        return {"lead_id": str(event.lead_id), "actions": actions_taken, "status": "processed"}

    async def on_shortlist_ready(self, event: ShortlistReadyEvent, db: Optional[Any] = None) -> dict[str, Any]:
        """Send WhatsApp shortlist to lead with strict failure isolation."""
        logger.info("Shortlist ready for lead %s (Units: %s, Phone: %s)", event.lead_id, event.unit_ids, event.phone_number)
        actions_taken: list[str] = []

        if not event.whatsapp_consent:
            logger.info("Skipping WhatsApp shortlist dispatch for lead %s: consent not given", event.lead_id)
            return {"lead_id": str(event.lead_id), "status": "skipped_no_consent"}

        if not event.unit_ids:
            logger.info("Skipping WhatsApp shortlist dispatch for lead %s: no units in shortlist", event.lead_id)
            return {"lead_id": str(event.lead_id), "status": "skipped_no_units"}

        if db is not None:
            try:
                from app.services.whatsapp_service import WhatsAppService
                wa_service = WhatsAppService(db)
                send_result = await wa_service.send_shortlist(
                    lead_id=event.lead_id,
                    phone=event.phone_number,
                    name=event.recipient_name,
                    units=event.unit_ids,
                    configuration=event.configuration,
                    view=event.preferred_view,
                )
                status_str = send_result.status if hasattr(send_result, "status") else "dispatched"
                actions_taken.append(f"whatsapp_sent_{status_str}")
            except Exception as exc:
                logger.error("WhatsApp dispatch failed for lead %s: %s", event.lead_id, exc, exc_info=True)
                actions_taken.append("whatsapp_dispatch_failed")

        return {"lead_id": str(event.lead_id), "actions": actions_taken, "status": "processed"}

    async def on_sales_handoff_requested(self, event: SalesHandoffRequestedEvent, db: Optional[Any] = None) -> dict[str, Any]:
        """Trigger immediate sales team alert and CRM task on consultant handoff request."""
        logger.info("Sales handoff requested for lead %s (Reason: %s, Urgency: %s)", event.lead_id, event.reason, event.urgency)
        actions_taken: list[str] = []

        if db is not None:
            try:
                from app.models.crm import Lead
                from app.models.enums import SalesTrigger
                from app.services.sales_task_service import SalesTaskService
                from sqlalchemy import select

                lead = await db.scalar(select(Lead).where(Lead.id == event.lead_id))
                if lead:
                    sales_svc = SalesTaskService(db)
                    result = await sales_svc.process_lead_sales_state(
                        lead,
                        explicit_trigger=SalesTrigger.HUMAN_ASSISTANCE_REQUEST,
                        note=f"Sales handoff requested: {event.reason} (urgency: {event.urgency})",
                    )
                    if result.task_created:
                        actions_taken.append("crm_task_created")
                    if result.notification_id or result.notification_status:
                        actions_taken.append("sales_handoff_alert_sent")
                    if result.duplicate:
                        actions_taken.append("sales_handoff_duplicate_suppressed")
            except Exception as exc:
                logger.error("Sales handoff alert failed for lead %s: %s", event.lead_id, exc)
                actions_taken.append("sales_handoff_alert_failed")

        return {"lead_id": str(event.lead_id), "actions": actions_taken, "status": "processed"}


# Global orchestrator singleton instance
orchestrator = AutomationOrchestrator()
