"""AIService — orchestrates AI conversation threads, message persistence, and CRM integration."""

from __future__ import annotations

import uuid
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.ai.orchestrator import orchestrator
from app.core.exceptions import NotFoundException, PermissionDeniedException
from app.models.chat import ChatMessage, ChatSession
from app.models.enums import ChatMessageRole, ChatSessionStatus
from app.schemas.ai import (
    AIChatRequest,
    AIConversationCreate,
    AILeadCaptureRequest,
    AISiteVisitRequest,
    AIStructuredResponse,
    AIResponseType,
    AISuggestedAction,
)
from app.schemas.lead import LeadCreate
from app.schemas.enquiry import EnquiryCreate
from app.services.base import BaseService
from app.services.lead_service import LeadService
from app.services.enquiry_service import EnquiryService
from app.utils.dates import utcnow


class AIService(BaseService):
    """Manages AI conversation threads, message history, and CRM lead capture."""

    async def get_or_create_session(
        self,
        conversation_id: uuid.UUID | None = None,
        user_id: uuid.UUID | None = None,
        guest_id: str | None = None,
        persona: str | None = None,
    ) -> ChatSession:
        """Fetch an existing session or create a new active session."""
        if conversation_id:
            query = select(ChatSession).options(selectinload(ChatSession.messages)).where(ChatSession.id == conversation_id)
            session = await self.db.scalar(query)
            if session:
                if user_id and session.user_id and session.user_id != user_id:
                    raise PermissionDeniedException("Access denied to conversation thread.", error_code="forbidden")
                return session

        # Create new session
        session = ChatSession(
            id=conversation_id or uuid.uuid4(),
            user_id=user_id,
            guest_id=guest_id or (f"guest_{uuid.uuid4().hex[:12]}" if not user_id else None),
            persona=persona or "Amnaya AI Consultant",
            status=ChatSessionStatus.ACTIVE,
            message_count=0,
        )
        self.db.add(session)
        await self.commit()
        return session

    async def chat(
        self,
        payload: AIChatRequest,
        user_id: uuid.UUID | None = None,
    ) -> AIStructuredResponse:
        """Process user message, persist prompt and reply, return structured response."""
        session = await self.get_or_create_session(
            conversation_id=payload.conversation_id,
            user_id=user_id,
            guest_id=payload.guest_id,
        )

        # Record user message
        user_msg = ChatMessage(
            session_id=session.id,
            role=ChatMessageRole.USER,
            content=payload.message,
        )
        self.db.add(user_msg)

        # Build history context via explicit query. Accessing ``session.messages``
        # on a freshly committed session would trigger an implicit lazy load,
        # which is unsupported inside AsyncSession (MissingGreenlet).
        scalar_res = await self.db.scalars(
            select(ChatMessage)
            .where(ChatMessage.session_id == session.id)
            .order_by(ChatMessage.created_at)
        )
        if hasattr(scalar_res, "all"):
            history_rows = scalar_res.all()
            if hasattr(history_rows, "__await__"):
                history_rows = await history_rows
        elif isinstance(scalar_res, (list, tuple)):
            history_rows = scalar_res
        else:
            history_rows = []

        history = [
            {"role": m.role.value if hasattr(m.role, "value") else str(m.role), "content": m.content}
            for m in (history_rows or [])
            if hasattr(m, "role") and hasattr(m, "content")
        ]

        # Process via Orchestrator
        ai_response = await orchestrator.process_query(
            conversation_id=session.id,
            user_message=payload.message,
            context=payload.context,
            history=history,
            db_session=self.db,
        )

        # Check repeated failure threshold in session metadata
        meta = session.metadata_ or {}
        failure_count = meta.get("failure_count", 0)
        if ai_response.response_type in (AIResponseType.ERROR, AIResponseType.CLARIFICATION) or ai_response.intent == "unsupported_request":
            failure_count += 1
            meta["failure_count"] = failure_count
            session.metadata_ = meta

            # If failure threshold reached (>= 2), offer human handoff
            if failure_count >= 2:
                ai_response.message = "I don't want to give you an inaccurate answer. Let me connect you with an Amnaya sales consultant who can assist you."
                ai_response.response_type = AIResponseType.HANDOFF
                ai_response.suggested_actions = [
                    AISuggestedAction(label="Connect with Sales Consultant", action_type="handoff", payload={"reason": "repeated_ai_failure"}),
                ]
                ai_response.handoff_context = {
                    "reason": "repeated_ai_failure",
                    "title": "Amnaya Sales Consultant Handoff",
                    "description": "Connect directly with our sales team for personalized guidance.",
                }
        else:
            meta["failure_count"] = 0
            session.metadata_ = meta

        # Record assistant reply
        assistant_msg = ChatMessage(
            session_id=session.id,
            role=ChatMessageRole.ASSISTANT,
            content=ai_response.message,
            sources={
                "intent": ai_response.intent,
                "confidence": ai_response.confidence,
                "response_type": ai_response.response_type.value,
                "citations": [c.model_dump() for c in ai_response.citations],
                "suggested_actions": [a.model_dump() for a in ai_response.suggested_actions],
                "units": ai_response.units,
            },
        )
        self.db.add(assistant_msg)

        session.message_count += 2
        await self.commit()

        # ── Phase 7.5: async pipeline side-effects (never block the response) ─
        import asyncio
        asyncio.create_task(self._run_pipeline_hooks(conversation_id=session.id, db=self.db))
        # ──────────────────────────────────────────────────────────────────────

        return ai_response

    @staticmethod
    async def _run_pipeline_hooks(conversation_id: uuid.UUID, db: Any) -> None:
        """Phase 7.5: Execute all CRM/WhatsApp/notification side-effects after a chat turn.

        Runs asynchronously via asyncio.create_task — never blocks the HTTP response.
        All errors are swallowed with logging so failures here never surface to the visitor.
        """
        import logging
        _log = logging.getLogger("app.services.ai_service.hooks")

        try:
            from app.ai.conversation_manager import ConversationManager
            from app.models.enums import ConvStage
            from app.services.lead_service import LeadService
            from app.services.whatsapp_service import WhatsAppService
            from app.services.sales_notification_service import SalesNotificationService
            from app.models.crm import Lead

            state = ConversationManager._sessions.get(conversation_id)
            if state is None:
                return  # session not yet in memory (e.g. first turn not yet processed)

            lp = state.lead_profile

            # ── 1. Create / update CRM Lead when phone is known ────────────────
            if lp.whatsapp_number and not lp.lead_id:
                try:
                    lead_svc = LeadService(db)
                    lead = await lead_svc.create_from_conversation(lp, conversation_id=conversation_id)
                    lp.lead_id = str(lead.id)
                    _log.info("Pipeline: Lead created/updated id=%s score=%d", lead.id, lead.lead_score)
                except Exception:
                    _log.exception("Pipeline: failed to create/update Lead")

            # ── 2. Record WhatsApp consent ─────────────────────────────────────
            if lp.lead_id and lp.whatsapp_consent is not None:
                try:
                    lead_svc = LeadService(db)
                    await lead_svc.record_whatsapp_consent(
                        uuid.UUID(lp.lead_id), lp.whatsapp_consent, source="ai_consultant"
                    )
                except Exception:
                    _log.exception("Pipeline: failed to record WhatsApp consent")

            # Resolve lead ORM object for subsequent steps
            lead_obj: Lead | None = None
            if lp.lead_id:
                try:
                    lead_svc = LeadService(db)
                    lead_obj = await lead_svc.get(uuid.UUID(lp.lead_id))
                except Exception:
                    _log.exception("Pipeline: failed to fetch Lead ORM object")

            # ── 3. Send WhatsApp shortlist when stage == SALES_HANDOFF ─────────
            if (
                state.stage == ConvStage.SALES_HANDOFF
                and lp.whatsapp_number
                and lp.interested_unit_ids
                and lead_obj
            ):
                try:
                    wa_svc = WhatsAppService(db)
                    await wa_svc.send_shortlist(
                        lead_id=lead_obj.id,
                        phone=lp.whatsapp_number,
                        name=lead_obj.name or "there",
                        units=lp.interested_unit_ids,
                        configuration=lead_obj.configuration,
                        view=lead_obj.preferred_view,
                        budget_str=(
                            f"₹{lead_obj.budget_max / 10_000_000:.1f} Cr"
                            if lead_obj.budget_max else None
                        ),
                        conversation_id=conversation_id,
                    )
                    _log.info("Pipeline: WhatsApp shortlist sent to %s", lp.whatsapp_number)
                except Exception:
                    _log.exception("Pipeline: failed to send WhatsApp shortlist")


            # ── 4. Notify sales team when lead goes HOT (score ≥ 61) ──────────
            if lp.lead_score >= 61 and lead_obj:
                try:
                    notif_svc = SalesNotificationService(db)
                    await notif_svc.notify_new_lead(lead_obj)
                    _log.info(
                        "Pipeline: sales notification dispatched lead=%s score=%d",
                        lead_obj.id, lp.lead_score,
                    )
                except Exception:
                    _log.exception("Pipeline: failed to send sales notification")

            # ── 5. Trigger handoff for HIGH_INTENT leads (score ≥ 81) ─────────
            if lp.lead_score >= 81 and lead_obj and not state.whatsapp_declined:
                try:
                    from app.schemas.handoff import HandoffRequest
                    from app.services.handoff_service import HandoffService
                    from app.models.enums import HandoffReason
                    handoff_svc = HandoffService(db)
                    await handoff_svc.request_handoff(
                        HandoffRequest(
                            conversation_id=conversation_id,
                            lead_id=lead_obj.id,
                            reason=HandoffReason.HIGH_INTENT_LEAD,
                        )
                    )
                    _log.info(
                        "Pipeline: HIGH_INTENT handoff requested lead=%s score=%d",
                        lead_obj.id, lp.lead_score,
                    )
                except Exception:
                    _log.exception("Pipeline: failed to trigger handoff")

        except Exception:
            _log.exception("Pipeline hooks top-level error for conversation %s", conversation_id)

    async def get_session_history(
        self,
        conversation_id: uuid.UUID,
        user_id: uuid.UUID | None = None,
    ) -> ChatSession:
        """Fetch session and all ordered messages."""
        query = select(ChatSession).options(selectinload(ChatSession.messages)).where(ChatSession.id == conversation_id)
        session = await self.db.scalar(query)
        if not session:
            raise NotFoundException("Conversation not found.", error_code="conversation_not_found")
        if user_id and session.user_id and session.user_id != user_id:
            raise PermissionDeniedException("Access denied to conversation thread.", error_code="forbidden")
        return session

    async def delete_session(
        self,
        conversation_id: uuid.UUID,
        user_id: uuid.UUID | None = None,
    ) -> None:
        """End and archive/delete a conversation session."""
        session = await self.get_session_history(conversation_id, user_id=user_id)
        session.status = ChatSessionStatus.CLOSED
        session.ended_at = utcnow()
        await self.commit()

    async def capture_lead(
        self,
        payload: AILeadCaptureRequest,
        user_id: uuid.UUID | None = None,
    ) -> dict[str, Any]:
        """Integrate with LeadService to create an AI-qualified lead."""
        lead_service = LeadService(self.db)
        lead_create = LeadCreate(
            name=payload.full_name,
            phone=payload.phone,
            email=payload.email,
            notes=f"[AI Consultant Lead] Conversation: {payload.conversation_id} | Preferred Unit: {payload.preferred_unit_id or 'General'} | {payload.notes or ''}",
        )
        lead = await lead_service.create(lead_create, user_id=user_id)
        return {"lead_id": str(lead.id), "status": "created", "name": lead.name}

    async def request_site_visit(
        self,
        payload: AISiteVisitRequest,
        user_id: uuid.UUID | None = None,
    ) -> dict[str, Any]:
        """Integrate with LeadService to schedule a site visit request."""
        lead_service = LeadService(self.db)
        lead_create = LeadCreate(
            name=payload.full_name,
            phone=payload.phone,
            email=payload.email,
            interested_in="sale",
            notes=f"[AI Site Visit Request] Date: {payload.preferred_date} | Residence: {payload.preferred_unit_id or 'General'} | {payload.notes or ''}",
        )
        lead = await lead_service.create(lead_create, user_id=user_id)
        return {"enquiry_id": str(lead.id), "status": "scheduled", "preferred_date": payload.preferred_date}
