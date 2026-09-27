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
        history_rows = (
            await self.db.scalars(
                select(ChatMessage)
                .where(ChatMessage.session_id == session.id)
                .order_by(ChatMessage.created_at)
            )
        ).all()
        history = [
            {"role": m.role.value if hasattr(m.role, "value") else str(m.role), "content": m.content}
            for m in history_rows
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

        return ai_response

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
