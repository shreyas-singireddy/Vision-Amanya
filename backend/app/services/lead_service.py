"""Lead service: pipeline management, assignment and scoring."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import BusinessException, NotFoundException
from app.models.crm import Lead
from app.models.enums import LeadPriority, LeadStatus
from app.repositories.lead import LeadRepository
from app.schemas.lead import (
    LeadAssign,
    LeadContext,
    LeadContextProcessResponse,
    LeadContextScoreBreakdown,
    LeadCreate,
    LeadResponse,
    LeadUpdate,
)
from app.services.base import BaseService
from app.utils.audit import write_audit_log
from app.utils.dates import utcnow
from app.utils.pagination import Page

_PRIORITY_POINTS = {LeadPriority.URGENT: 10, LeadPriority.HIGH: 7, LeadPriority.MEDIUM: 4, LeadPriority.LOW: 2}


class LeadService(BaseService):
    """Owns the sales pipeline and lead lifecycle rules."""

    def __init__(self, db: AsyncSession) -> None:
        super().__init__(db)
        self.leads = self._repo("leads", LeadRepository)

    async def create(self, payload: LeadCreate, *, actor_id: uuid.UUID | None = None, user_id: uuid.UUID | None = None) -> Lead:
        """Create a lead (optionally linked to the caller's account)."""
        lead = Lead(**payload.model_dump())
        lead.lead_score = self._compute_score(lead)
        lead.priority = payload.priority or self._priority_from_score(lead.lead_score)
        if lead.status == LeadStatus.NEW and lead.lead_score >= 50:
            lead.status = LeadStatus.QUALIFIED
        lead.user_id = user_id
        await self.leads.add(lead)
        await write_audit_log(
            self.db,
            action="lead.created",
            resource_type="lead",
            resource_id=lead.id,
            actor_user_id=actor_id,
            new_value={"name": lead.name, "email": lead.email},
        )
        await self.commit()
        return lead

    async def get(self, lead_id: uuid.UUID) -> Lead:
        """Fetch a lead or raise 404."""
        return await self.leads.get_or_404(lead_id)

    async def update(self, lead_id: uuid.UUID, payload: LeadUpdate, *, actor_id: uuid.UUID | None = None) -> Lead:
        """Update lead fields, recomputing the score when relevant fields change."""
        lead = await self.leads.get_or_404(lead_id)
        data = payload.model_dump(exclude_unset=True)
        old_status = lead.status
        for field, value in data.items():
            setattr(lead, field, value)
        score_fields = {
            "priority", "budget_min", "budget_max", "phone", "whatsapp_number",
            "whatsapp_consent", "configuration", "preferred_view", "preferred_floor",
            "preferred_orientation", "buying_purpose", "buying_timeline",
            "site_visit_interest", "interested_unit_ids", "viewed_unit_ids",
            "compared_unit_ids", "recommended_unit_ids", "interested_in",
        }
        if score_fields.intersection(data):
            lead.lead_score = self._compute_score(lead)
            if "priority" not in data:
                lead.priority = self._priority_from_score(lead.lead_score)
            if lead.status == LeadStatus.NEW and lead.lead_score >= 50:
                lead.status = LeadStatus.QUALIFIED
        if "status" in data and data["status"] != old_status:
            self._apply_status_side_effects(lead, data["status"], previous_status=old_status)
        await write_audit_log(
            self.db,
            action="lead.updated",
            resource_type="lead",
            resource_id=lead.id,
            actor_user_id=actor_id,
            new_value=data,
        )
        await self.commit()
        return lead

    async def assign(self, lead_id: uuid.UUID, payload: LeadAssign, *, actor_id: uuid.UUID | None = None) -> Lead:
        """Assign a lead to an agent (validates the agent profile exists)."""
        lead = await self.leads.get_or_404(lead_id)
        from sqlalchemy import select

        from app.models.user import Agent

        agent = await self.db.scalar(select(Agent).where(Agent.user_id == payload.agent_id))
        if agent is None:
            raise NotFoundException("Agent not found", error_code="agent_not_found")
        old_agent = lead.assigned_to
        lead.assigned_to = agent.id
        if lead.status == LeadStatus.NEW:
            lead.status = LeadStatus.CONTACTED
        await write_audit_log(
            self.db,
            action="lead.assigned",
            resource_type="lead",
            resource_id=lead.id,
            actor_user_id=actor_id,
            old_value={"assigned_to": old_agent},
            new_value={"assigned_to": agent.id},
        )
        await self.commit()
        return lead

    async def transition(self, lead_id: uuid.UUID, new_status: LeadStatus, *, reason: str | None = None, actor_id: uuid.UUID | None = None) -> Lead:
        """Move a lead through the pipeline, applying won/lost side effects."""
        lead = await self.leads.get_or_404(lead_id)
        if new_status == lead.status:
            return lead
        self._apply_status_side_effects(lead, new_status, reason, previous_status=lead.status)
        lead.status = new_status
        await write_audit_log(
            self.db,
            action="lead.status_changed",
            resource_type="lead",
            resource_id=lead.id,
            actor_user_id=actor_id,
            old_value={"status": lead.status.value},
            new_value={"status": new_status.value, "reason": reason},
        )
        await self.commit()
        return lead

    async def list(
        self,
        *,
        page: int = 1,
        page_size: int = 20,
        status: LeadStatus | None = None,
        priority: LeadPriority | None = None,
        assigned_to: uuid.UUID | None = None,
        user_id: uuid.UUID | None = None,
        email: str | None = None,
        search: str | None = None,
    ) -> Page[Lead]:
        """Paginate leads with optional filters."""
        return await self.leads.list_leads(
            page=page,
            page_size=page_size,
            status=status,
            priority=priority,
            assigned_to=assigned_to,
            user_id=user_id,
            email=email,
            search=search,
        )

    async def list_due_follow_ups(self, *, limit: int = 50) -> list[Lead]:
        """Leads whose next follow-up is due."""
        return await self.leads.list_due_follow_ups(limit=limit)

    # --- Helpers -----------------------------------------------------------------

    @staticmethod
    def _score(priority: LeadPriority, budget_min: float | None, budget_max: float | None, phone: str | None, interested_in) -> int:
        score = _PRIORITY_POINTS.get(priority, 0)
        if budget_min is not None or budget_max is not None:
            score += 10
        if phone:
            score += 5
        if interested_in == "investment":
            score += 5
        return min(score, 100)

    def _apply_status_side_effects(self, lead: Lead, new_status: LeadStatus, reason: str | None = None, previous_status: LeadStatus | None = None) -> None:
        if previous_status in {LeadStatus.WON, LeadStatus.LOST} and new_status not in {LeadStatus.WON, LeadStatus.LOST}:
            raise BusinessException("A won/lost lead cannot be reopened.", error_code="lead_closed")
        if new_status == LeadStatus.WON:
            if lead.converted_at is None:
                lead.converted_at = utcnow()
        elif new_status == LeadStatus.LOST:
            if lead.lost_at is None:
                lead.lost_at = utcnow()
            if reason:
                lead.lost_reason = reason

    # ── Phase 7.5: AI Consultant lead methods ─────────────────────────────────

    async def upsert_by_whatsapp(
        self,
        whatsapp_number: str,
        profile: Any,
        *,
        conversation_id: uuid.UUID | None = None,
    ) -> Lead:
        """Deduplicate by WhatsApp number. Creates or updates the lead.

        PostgreSQL is the source of truth. Call this BEFORE sending WhatsApp messages.
        """
        # 1. Look for existing lead with same WhatsApp number
        existing: Lead | None = None
        stmt = select(Lead).where(
            Lead.whatsapp_number == whatsapp_number, Lead.deleted_at.is_(None)
        )
        existing = await self.db.scalar(stmt)

        # 2. Also check phone column
        if not existing:
            stmt2 = select(Lead).where(
                Lead.phone == whatsapp_number, Lead.deleted_at.is_(None)
            )
            existing = await self.db.scalar(stmt2)

        name = getattr(profile, "name", None) or "Amnaya Visitor"
        email = getattr(profile, "email", None)

        if existing:
            # Update in place — never create duplicates
            if name and name != "Amnaya Visitor":
                existing.name = name
            if email:
                existing.email = email
            existing.whatsapp_number = whatsapp_number
            existing.phone = existing.phone or whatsapp_number
            self._apply_profile(existing, profile, conversation_id)
            existing.lead_score = self._compute_score(existing)
            existing.priority = self._priority_from_score(existing.lead_score)
            if existing.status == LeadStatus.NEW and existing.lead_score >= 50:
                existing.status = LeadStatus.QUALIFIED
            await write_audit_log(
                self.db, action="lead.updated_from_conversation",
                resource_type="lead", resource_id=existing.id,
                new_value={"whatsapp_number": whatsapp_number, "lead_score": existing.lead_score},
            )
            await self.commit()
            return existing

        # 3. Create new lead
        lead = Lead(
            name=name,
            email=email,
            phone=whatsapp_number,
            whatsapp_number=whatsapp_number,
            source="ai_consultant",
            status=LeadStatus.NEW,
        )
        self._apply_profile(lead, profile, conversation_id)
        lead.lead_score = self._compute_score(lead)
        lead.priority = self._priority_from_score(lead.lead_score)
        if lead.status == LeadStatus.NEW and lead.lead_score >= 50:
            lead.status = LeadStatus.QUALIFIED
        self.db.add(lead)
        await write_audit_log(
            self.db, action="lead.created_from_conversation",
            resource_type="lead", resource_id=lead.id,
            new_value={"whatsapp_number": whatsapp_number, "name": name},
        )
        await self.commit()
        return lead

    async def create_from_conversation(
        self,
        profile: Any,
        *,
        conversation_id: uuid.UUID | None = None,
        source: str = "ai_consultant",
    ) -> Lead:
        """Create or update a lead from a ConversationLeadProfile.

        Deduplicates first by WhatsApp, then by email, then creates new.
        """
        whatsapp = getattr(profile, "whatsapp_number", None)
        email = getattr(profile, "email", None)

        if whatsapp:
            return await self.upsert_by_whatsapp(
                whatsapp, profile, conversation_id=conversation_id
            )

        # Deduplicate by email if provided
        existing: Lead | None = None
        if email:
            stmt = select(Lead).where(Lead.email == email, Lead.deleted_at.is_(None))
            existing = await self.db.scalar(stmt)

        name = getattr(profile, "name", None) or "Amnaya Visitor"
        if existing:
            self._apply_profile(existing, profile, conversation_id)
            existing.lead_score = self._compute_score(existing)
            existing.priority = self._priority_from_score(existing.lead_score)
            if existing.status == LeadStatus.NEW and existing.lead_score >= 50:
                existing.status = LeadStatus.QUALIFIED
            await self.commit()
            return existing

        lead = Lead(
            name=name,
            email=email,
            phone=getattr(profile, "phone", None),
            source=source,
            status=LeadStatus.NEW,
        )
        self._apply_profile(lead, profile, conversation_id)
        lead.lead_score = self._compute_score(lead)
        lead.priority = self._priority_from_score(lead.lead_score)
        if lead.status == LeadStatus.NEW and lead.lead_score >= 50:
            lead.status = LeadStatus.QUALIFIED
        self.db.add(lead)
        await write_audit_log(
            self.db, action="lead.created_from_conversation",
            resource_type="lead", resource_id=lead.id,
            new_value={"name": name, "source": source},
        )
        await self.commit()
        return lead

    async def process_lead_context(
        self,
        context: LeadContext,
        *,
        actor_id: uuid.UUID | None = None,
        user_id: uuid.UUID | None = None,
    ) -> LeadContextProcessResponse:
        """Execute end-to-end LeadContext intake & deduplication pipeline.

        Pipeline Stages:
        1. AI Conversation -> Structured LeadContext
        2. Find existing lead: match by whatsapp_number, phone, email, or conversation_id
        3. Existing lead?
           - No: Create new Lead with baseline fields and preferences
           - Yes: Update existing Lead (merge preferences, union unit lists, update consent)
        4. Preserve history: append conversation summary/notes with timestamp, log audit trail
        5. Ready for scoring: evaluate deterministic 5-dimension score, update temperature and status
        """
        from app.ai.lead_scoring import lead_scoring_engine

        existing_lead: Lead | None = None

        # Step 1 & 2: Deduplication lookup
        # Match 1: WhatsApp number
        if context.whatsapp_number:
            stmt = select(Lead).where(
                (Lead.whatsapp_number == context.whatsapp_number) | (Lead.phone == context.whatsapp_number),
                Lead.deleted_at.is_(None),
            )
            existing_lead = await self.db.scalar(stmt)

        # Match 2: Phone number
        if not existing_lead and context.phone:
            stmt = select(Lead).where(
                (Lead.phone == context.phone) | (Lead.whatsapp_number == context.phone),
                Lead.deleted_at.is_(None),
            )
            existing_lead = await self.db.scalar(stmt)

        # Match 3: Email
        if not existing_lead and context.email:
            stmt = select(Lead).where(
                Lead.email == context.email,
                Lead.deleted_at.is_(None),
            )
            existing_lead = await self.db.scalar(stmt)

        # Match 4: Conversation ID
        if not existing_lead and context.conversation_id:
            stmt = select(Lead).where(
                Lead.conversation_id == context.conversation_id,
                Lead.deleted_at.is_(None),
            )
            existing_lead = await self.db.scalar(stmt)

        is_created = False
        is_updated = False

        # Step 3: Branch Create vs Update
        if existing_lead:
            lead = existing_lead
            is_updated = True

            # Merge contact fields if newly provided
            if context.name and (lead.name in (None, "", "Amnaya Visitor") or context.name != "Amnaya Visitor"):
                lead.name = context.name
            if context.email and not lead.email:
                lead.email = context.email
            if context.phone and not lead.phone:
                lead.phone = context.phone
            if context.whatsapp_number:
                lead.whatsapp_number = context.whatsapp_number
                if not lead.phone:
                    lead.phone = context.whatsapp_number

            # WhatsApp consent updates
            if context.whatsapp_consent is not None:
                lead.whatsapp_consent = context.whatsapp_consent
                if context.whatsapp_consent and not lead.consent_timestamp:
                    lead.consent_timestamp = utcnow()
                if context.consent_source:
                    lead.consent_source = context.consent_source

            # Update preference fields if present in context
            pref_fields = [
                "location", "buying_purpose", "buying_timeline",
                "configuration", "preferred_floor", "preferred_view",
                "preferred_orientation", "family_size"
            ]
            for f in pref_fields:
                val = getattr(context, f, None)
                if val is not None:
                    setattr(lead, f, val)

            if context.budget_min is not None:
                lead.budget_min = context.budget_min
            if context.budget_max is not None:
                lead.budget_max = context.budget_max
            if context.site_visit_interest:
                lead.site_visit_interest = True
            if context.conversation_id:
                lead.conversation_id = context.conversation_id

            # Deduplicate & union unit lists
            for attr in ["viewed_unit_ids", "interested_unit_ids", "compared_unit_ids", "recommended_unit_ids"]:
                ctx_units = getattr(context, attr, []) or []
                if ctx_units:
                    existing_units = list(getattr(lead, attr) or [])
                    merged = list(dict.fromkeys(existing_units + ctx_units))
                    setattr(lead, attr, merged)
        else:
            is_created = True
            phone = context.phone or context.whatsapp_number
            whatsapp_num = context.whatsapp_number or (phone if context.whatsapp_consent else None)
            now = utcnow()
            lead = Lead(
                id=uuid.uuid4(),
                created_at=now,
                updated_at=now,
                name=context.name or "Amnaya Visitor",
                email=context.email,
                phone=phone,
                whatsapp_number=whatsapp_num,
                whatsapp_consent=bool(context.whatsapp_consent),
                consent_timestamp=now if context.whatsapp_consent else None,
                consent_source=context.consent_source or "ai_consultant",
                location=context.location,
                buying_purpose=context.buying_purpose,
                buying_timeline=context.buying_timeline,
                configuration=context.configuration,
                budget_min=context.budget_min,
                budget_max=context.budget_max,
                preferred_floor=context.preferred_floor,
                preferred_view=context.preferred_view,
                preferred_orientation=context.preferred_orientation,
                family_size=context.family_size,
                site_visit_interest=context.site_visit_interest,
                viewed_unit_ids=list(dict.fromkeys(context.viewed_unit_ids or [])),
                interested_unit_ids=list(dict.fromkeys(context.interested_unit_ids or [])),
                compared_unit_ids=list(dict.fromkeys(context.compared_unit_ids or [])),
                recommended_unit_ids=list(dict.fromkeys(context.recommended_unit_ids or [])),
                conversation_id=context.conversation_id,
                user_id=user_id,
                source=context.source or "ai_consultant",
                status=LeadStatus.NEW,
            )
            self.db.add(lead)

        # Step 4: Preserve history (append timestamped notes/summary and intent)
        notes_entries = []
        if context.intent:
            intent_entry = f"Intent: {context.intent}" + (f" (Secondary: {context.secondary_intent})" if context.secondary_intent else "")
            notes_entries.append(intent_entry)
        summary_to_append = (context.conversation_summary or context.notes or "").strip()
        if summary_to_append:
            notes_entries.append(summary_to_append)

        if notes_entries:
            ts = utcnow().strftime("%Y-%m-%d %H:%M UTC")
            formatted_entry = f"[{ts}] " + " | ".join(notes_entries)
            if lead.notes:
                lead.notes = f"{lead.notes}\n\n{formatted_entry}"
            else:
                lead.notes = formatted_entry

        # Step 5: Ready for scoring (deterministic 5-dimension evaluation)
        profile_dict = {
            "name": lead.name,
            "phone": lead.phone,
            "whatsapp_number": lead.whatsapp_number,
            "whatsapp_consent": lead.whatsapp_consent,
            "buying_purpose": lead.buying_purpose,
            "buying_timeline": lead.buying_timeline,
            "budget_min": float(lead.budget_min) if lead.budget_min is not None else None,
            "budget_max": float(lead.budget_max) if lead.budget_max is not None else None,
            "configuration": lead.configuration,
            "preferred_view": lead.preferred_view,
            "preferred_floor": lead.preferred_floor,
            "preferred_orientation": lead.preferred_orientation,
            "interested_unit_ids": lead.interested_unit_ids or [],
            "viewed_unit_ids": lead.viewed_unit_ids or [],
            "compared_unit_ids": lead.compared_unit_ids or [],
            "recommended_unit_ids": lead.recommended_unit_ids or [],
            "site_visit_interest": lead.site_visit_interest,
            "interaction_count": max(1, getattr(context, "interaction_count", 1)),
        }
        breakdown = lead_scoring_engine.score(profile_dict)
        lead.lead_score = breakdown.total
        lead.priority = self._priority_from_score(lead.lead_score)

        if lead.status == LeadStatus.NEW and breakdown.total >= 50:
            lead.status = LeadStatus.QUALIFIED

        # Audit logging
        action_name = "lead.created_from_context" if is_created else "lead.updated_from_context"
        await write_audit_log(
            self.db,
            action=action_name,
            resource_type="lead",
            resource_id=lead.id,
            actor_user_id=actor_id,
            new_value={
                "name": lead.name,
                "phone": lead.phone,
                "lead_score": lead.lead_score,
                "status": lead.status.value if hasattr(lead.status, "value") else str(lead.status),
                "is_created": is_created,
            },
        )

        await self.commit()
        await self.db.refresh(lead)

        # Phase 8: Publish domain events to the EventBus after successful DB commit
        try:
            from app.events.bus import event_bus
            if is_created:
                from app.events.models import LeadCreatedEvent
                c_event = LeadCreatedEvent(
                    lead_id=lead.id,
                    name=lead.name or "Amnaya Visitor",
                    phone=lead.phone,
                    email=lead.email,
                    whatsapp_number=lead.whatsapp_number,
                    whatsapp_consent=bool(lead.whatsapp_consent),
                    configuration=lead.configuration,
                    budget_min=float(lead.budget_min) if lead.budget_min is not None else None,
                    budget_max=float(lead.budget_max) if lead.budget_max is not None else None,
                    lead_score=lead.lead_score,
                    status=lead.status.value if hasattr(lead.status, "value") else str(lead.status),
                    priority=lead.priority.value if hasattr(lead.priority, "value") else str(lead.priority),
                    idempotency_key=f"lead-created-{lead.id}",
                    correlation_id=context.conversation_id,
                )
                await event_bus.publish(c_event, self.db)
            else:
                from app.events.models import LeadUpdatedEvent
                pref_changed = bool(context.configuration or context.budget_max or context.preferred_view or context.preferred_floor)
                u_event = LeadUpdatedEvent(
                    lead_id=lead.id,
                    changed_fields=list(context.model_dump(exclude_unset=True).keys()),
                    lead_score=lead.lead_score,
                    status=lead.status.value if hasattr(lead.status, "value") else str(lead.status),
                    priority=lead.priority.value if hasattr(lead.priority, "value") else str(lead.priority),
                    configuration=lead.configuration,
                    budget_max=float(lead.budget_max) if lead.budget_max is not None else None,
                    preferred_view=lead.preferred_view,
                    preferred_floor=lead.preferred_floor,
                    preferred_orientation=lead.preferred_orientation,
                    preferences_changed=pref_changed,
                    idempotency_key=f"lead-updated-{lead.id}-{lead.lead_score}",
                    correlation_id=context.conversation_id,
                )
                await event_bus.publish(u_event, self.db)
        except Exception as exc:
            import logging
            logging.getLogger("app.services.lead_service").debug("Event publish skipped/failed: %s", exc)

        score_breakdown_schema = LeadContextScoreBreakdown(
            contact=breakdown.contact,
            intent=breakdown.intent,
            property_fit=breakdown.property_fit,
            engagement=breakdown.engagement,
            action=breakdown.action,
            total=breakdown.total,
            temperature=breakdown.temperature.value if hasattr(breakdown.temperature, "value") else str(breakdown.temperature),
            details=breakdown.details,
        )

        msg = "Lead created and scored successfully." if is_created else "Lead updated and re-scored successfully."

        if lead.id is None:
            lead.id = uuid.uuid4()
        if getattr(lead, "created_at", None) is None:
            lead.created_at = utcnow()
        if getattr(lead, "updated_at", None) is None:
            lead.updated_at = utcnow()
        lead.whatsapp_consent = bool(getattr(lead, "whatsapp_consent", False))
        lead.site_visit_interest = bool(getattr(lead, "site_visit_interest", False))

        return LeadContextProcessResponse(
            lead_id=lead.id,
            is_created=is_created,
            is_updated=is_updated,
            lead=LeadResponse.model_validate(lead),
            score_breakdown=score_breakdown_schema,
            status=lead.status,
            temperature=score_breakdown_schema.temperature,
            intent=context.intent,
            secondary_intent=context.secondary_intent,
            message=msg,
        )

    async def record_whatsapp_consent(
        self,
        lead_id: uuid.UUID,
        consent: bool,
        *,
        source: str = "ai_consultant",
    ) -> Lead:
        """Record WhatsApp consent (or declination). Writes audit log."""
        lead = await self.leads.get_or_404(lead_id)
        lead.whatsapp_consent = consent
        lead.consent_timestamp = utcnow()
        lead.consent_source = source
        await write_audit_log(
            self.db,
            action="lead.whatsapp_consent_given" if consent else "lead.whatsapp_consent_declined",
            resource_type="lead",
            resource_id=lead.id,
            new_value={"whatsapp_consent": consent, "consent_source": source},
        )
        await self.commit()

        if consent:
            try:
                from app.events.bus import event_bus
                from app.events.models import WhatsAppConsentGrantedEvent
                w_event = WhatsAppConsentGrantedEvent(
                    lead_id=lead.id,
                    whatsapp_number=lead.whatsapp_number or lead.phone or "",
                    consent_source=source,
                    idempotency_key=f"wa-consent-{lead.id}",
                )
                await event_bus.publish(w_event, self.db)
            except Exception as exc:
                import logging
                logging.getLogger("app.services.lead_service").debug("Consent event publish skipped: %s", exc)

        return lead

    async def update_unit_interest(
        self,
        lead_id: uuid.UUID,
        unit_id: str,
        interaction_type: str = "viewed",
    ) -> Lead:
        """Append a unit to the appropriate interaction list on the lead."""
        lead = await self.leads.get_or_404(lead_id)
        field_map = {
            "viewed": "viewed_unit_ids",
            "interested": "interested_unit_ids",
            "compared": "compared_unit_ids",
            "recommended": "recommended_unit_ids",
        }
        field = field_map.get(interaction_type, "viewed_unit_ids")
        current = list(getattr(lead, field) or [])
        if unit_id not in current:
            current.append(unit_id)
            setattr(lead, field, current)
            lead.lead_score = self._compute_score(lead)
            lead.priority = self._priority_from_score(lead.lead_score)
            if lead.status == LeadStatus.NEW and lead.lead_score >= 50:
                lead.status = LeadStatus.QUALIFIED
        await self.commit()
        return lead

    async def get_recommendations_for_lead(
        self,
        lead_id: uuid.UUID,
        *,
        top_n: int = 3,
        update_lead: bool = True,
        actor_id: uuid.UUID | None = None,
    ) -> Any:
        """Generate deterministic residence recommendations for a CRM lead.

        Maps canonical Lead preferences (budget, configuration, floor, view, orientation)
        into PropertyPreferences and evaluates matching against PostgreSQL published property inventory.
        """
        import logging
        import time
        from app.ai.recommendation_engine import RecommendationEngine
        from app.schemas.ai import PropertyPreferences
        from app.schemas.recommendation import RecommendationRequest

        logger = logging.getLogger(__name__)
        start_time = time.perf_counter()

        lead = await self.leads.get_or_404(lead_id)

        # Parse bedrooms from configuration
        bedrooms = 3
        if lead.configuration:
            config_str = str(lead.configuration).upper()
            if "4" in config_str:
                bedrooms = 4
            elif "2" in config_str:
                bedrooms = 2
            elif "3" in config_str:
                bedrooms = 3

        prefs = PropertyPreferences(
            configuration=lead.configuration or "3BHK",
            bedrooms=bedrooms,
            minimum_budget=float(lead.budget_min) if lead.budget_min is not None else None,
            maximum_budget=float(lead.budget_max) if lead.budget_max is not None else None,
            budget=float(lead.budget_max) if lead.budget_max is not None else None,
            floor_preference=lead.preferred_floor.lower() if lead.preferred_floor else None,
            view=lead.preferred_view.lower() if lead.preferred_view else None,
            orientation=lead.preferred_orientation.lower() if lead.preferred_orientation else None,
            buying_purpose=lead.buying_purpose,
            timeline=lead.buying_timeline,
        )

        engine = RecommendationEngine(self.db)
        request = RecommendationRequest(
            preferences=prefs,
            top_n=top_n,
        )
        response = await engine.recommend(request)
        elapsed_ms = (time.perf_counter() - start_time) * 1000.0

        # Extract recommended unit numbers or IDs
        rec_units = [u.unit_number for u in response.recommendations]
        if not rec_units and response.alternatives:
            rec_units = [u.unit_number for u in response.alternatives]

        logger.info(
            "Personalized recommendations generated for lead %s: %d matches (%d total matches, %d alternatives, %.2f ms)",
            lead.id,
            len(response.recommendations),
            response.total_matches,
            len(response.alternatives),
            elapsed_ms,
            extra={
                "lead_id": str(lead.id),
                "total_matches": response.total_matches,
                "top_recommendations_count": len(response.recommendations),
                "alternatives_count": len(response.alternatives),
                "constraint_relaxed": response.constraint_relaxed,
                "execution_ms": elapsed_ms,
            },
        )

        if update_lead and rec_units:
            current_recommended = list(lead.recommended_unit_ids or [])
            merged = list(dict.fromkeys(current_recommended + rec_units))
            lead.recommended_unit_ids = merged
            lead.lead_score = self._compute_score(lead)
            lead.priority = self._priority_from_score(lead.lead_score)
            if lead.status == LeadStatus.NEW and lead.lead_score >= 50:
                lead.status = LeadStatus.QUALIFIED

            await write_audit_log(
                self.db,
                action="lead.recommendations_generated",
                resource_type="lead",
                resource_id=lead.id,
                actor_user_id=actor_id,
                new_value={
                    "recommended_unit_ids": lead.recommended_unit_ids,
                    "lead_score": lead.lead_score,
                    "matches_count": len(response.recommendations),
                    "constraint_relaxed": response.constraint_relaxed,
                },
            )
            await self.commit()

        return response

    @staticmethod
    def generate_sales_summary(lead: Lead) -> str:
        """Produce a concise sales-team text card from a Lead record."""
        from datetime import datetime
        lines = [
            "── AMNAYA AI LEAD CARD ──────────────────────────────",
            f"Name        : {lead.name}",
            f"WhatsApp    : {lead.whatsapp_number or lead.phone or 'N/A'}",
            f"City        : {lead.location or '—'}",
            f"Purpose     : {(lead.buying_purpose or '—').replace('_', ' ').title()}",
            f"Config      : {lead.configuration or '3BHK'}",
        ]
        if lead.budget_max:
            lines.append(f"Budget      : ₹{lead.budget_max / 10_000_000:.1f} Cr")
        if lead.preferred_view:
            lines.append(f"View        : {lead.preferred_view.replace('_', ' ').title()}")
        if lead.preferred_floor:
            lines.append(f"Floor       : {lead.preferred_floor.replace('_', ' ').title()}")
        if lead.buying_timeline:
            lines.append(f"Timeline    : {lead.buying_timeline}")
        units = lead.interested_unit_ids or []
        if units:
            lines.append(f"Interested  : {', '.join(units)}")
        lines.append(f"Lead Score  : {lead.lead_score}/100")
        lines.append(f"Site Visit  : {'Yes' if lead.site_visit_interest else 'No'}")
        lines.append(f"Consent     : {'Yes' if lead.whatsapp_consent else 'No'}")
        lines.append("─────────────────────────────────────────────────────")
        return "\n".join(lines)

    @staticmethod
    def _apply_profile(lead: Lead, profile: Any, conversation_id: uuid.UUID | None = None) -> None:
        """Copy profile fields onto a Lead model object."""
        field_map = [
            ("location", "location"),
            ("buying_purpose", "buying_purpose"),
            ("buying_timeline", "buying_timeline"),
            ("configuration", "configuration"),
            ("budget_min", "budget_min"),
            ("budget_max", "budget_max"),
            ("preferred_floor", "preferred_floor"),
            ("preferred_view", "preferred_view"),
            ("preferred_orientation", "preferred_orientation"),
            ("family_size", "family_size"),
            ("site_visit_interest", "site_visit_interest"),
            ("whatsapp_consent", "whatsapp_consent"),
            ("consent_source", "consent_source"),
            ("interested_unit_ids", "interested_unit_ids"),
            ("viewed_unit_ids", "viewed_unit_ids"),
            ("compared_unit_ids", "compared_unit_ids"),
            ("recommended_unit_ids", "recommended_unit_ids"),
        ]
        for src, dst in field_map:
            val = getattr(profile, src, None)
            if val is not None:
                setattr(lead, dst, val)
        if conversation_id:
            lead.conversation_id = conversation_id
        if getattr(profile, "whatsapp_consent", None) and getattr(profile, "consent_timestamp", None) is None:
            lead.consent_timestamp = utcnow()

    @staticmethod
    def _compute_score(lead: Lead) -> int:
        """Compute lead score using the Phase 7.5 engine."""
        from app.ai.lead_scoring import lead_scoring_engine
        profile_dict = {
            "name": lead.name,
            "phone": lead.phone,
            "whatsapp_number": lead.whatsapp_number,
            "whatsapp_consent": lead.whatsapp_consent,
            "buying_purpose": lead.buying_purpose,
            "buying_timeline": lead.buying_timeline,
            "budget_min": lead.budget_min,
            "budget_max": lead.budget_max,
            "configuration": lead.configuration,
            "preferred_view": lead.preferred_view,
            "preferred_floor": lead.preferred_floor,
            "preferred_orientation": lead.preferred_orientation,
            "interested_unit_ids": lead.interested_unit_ids,
            "viewed_unit_ids": lead.viewed_unit_ids,
            "compared_unit_ids": lead.compared_unit_ids,
            "site_visit_interest": lead.site_visit_interest,
        }
        return lead_scoring_engine.score(profile_dict).total

    @staticmethod
    def _priority_from_score(score: int) -> LeadPriority:
        """Map lead score to priority."""
        if score >= 75:
            return LeadPriority.HIGH
        if score >= 45:
            return LeadPriority.MEDIUM
        return LeadPriority.LOW
