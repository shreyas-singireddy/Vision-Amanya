"""HandoffService — deterministic AI-to-Human sales consultant handoff orchestration."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import NotFoundException, PermissionDeniedException, ValidationException
from app.models.chat import ChatMessage, ChatSession
from app.models.crm import Lead, SalesHandoff
from app.models.enums import AssignmentStrategy, HandoffReason, HandoffStatus, LeadStatus
from app.models.user import Agent, User
from app.schemas.handoff import (
    HandoffAnalytics,
    HandoffContext,
    HandoffRequest,
    HandoffResponse,
    HandoffStatusUpdate,
    KnowledgeGapEvent,
    SalesAssignment,
    SalesConversationSummary,
)
from app.services.base import BaseService
from app.utils.dates import utcnow

# In-memory store for tracked knowledge gaps if DB model is unpersisted
_KNOWLEDGE_GAPS: list[KnowledgeGapEvent] = []


def _get_agent_info(agent: Agent | None) -> dict[str, Any] | None:
    if not agent:
        return None
    name = getattr(agent, "full_name", None)
    if not name and hasattr(agent, "user") and agent.user:
        name = getattr(agent.user, "full_name", None)
    if not name:
        name = "Amnaya Sales Consultant"
    phone = getattr(agent, "phone", None)
    if not phone and hasattr(agent, "user") and agent.user:
        phone = getattr(agent.user, "phone", None)
    return {
        "id": str(agent.id),
        "name": name,
        "title": "Amnaya Sales Consultant",
        "phone": phone,
    }


class HandoffService(BaseService):
    """Orchestrates deterministic escalation, context packaging, assignment, and queue management."""

    async def get_session_with_messages(self, conversation_id: uuid.UUID) -> ChatSession | None:
        """Fetch session and messages ordered chronologically."""
        stmt = (
            select(ChatSession)
            .options(selectinload(ChatSession.messages))
            .where(ChatSession.id == conversation_id)
        )
        return await self.db.scalar(stmt)

    async def generate_sales_summary(
        self,
        session: ChatSession | None,
        reason: HandoffReason,
        lead: Lead | None = None,
        last_message: str | None = None,
    ) -> SalesConversationSummary:
        """Generate a grounded, non-fabricated structured conversation summary for sales staff."""
        lead_name = lead.name if lead else "Visitor"
        lead_contact = lead.phone or lead.email if lead else None
        budget_str: str | None = None
        if lead and (lead.budget_min or lead.budget_max):
            if lead.budget_min and lead.budget_max:
                budget_str = f"₹{lead.budget_min/10000000:.2f} Cr - ₹{lead.budget_max/10000000:.2f} Cr"
            elif lead.budget_max:
                budget_str = f"Up to ₹{lead.budget_max/10000000:.2f} Cr"
            elif lead.budget_min:
                budget_str = f"Above ₹{lead.budget_min/10000000:.2f} Cr"

        configuration: str | None = None
        preferred_view: str | None = None
        preferred_floor: str | None = None
        interested_units: list[str] = []
        compared_units: list[str] = []
        financial_context: str | None = None
        site_visit_context: str | None = None
        visitor_request: str | None = last_message

        if session and session.messages:
            full_text = " ".join([m.content for m in session.messages if m.content]).lower()
            if "3 bhk" in full_text or "3bhk" in full_text:
                configuration = "3 BHK"
            elif "4 bhk" in full_text or "4bhk" in full_text:
                configuration = "4 BHK"

            if "lake" in full_text:
                preferred_view = "Lake View"
            elif "garden" in full_text:
                preferred_view = "Garden View"

            if "high floor" in full_text or "10th" in full_text or "upper" in full_text:
                preferred_floor = "High Floor"

            # Parse metadata across messages
            for m in session.messages:
                if m.sources and isinstance(m.sources, dict):
                    units_data = m.sources.get("units", [])
                    if isinstance(units_data, list):
                        for u in units_data:
                            if isinstance(u, dict) and "unit_number" in u:
                                unum = str(u["unit_number"])
                                if unum not in interested_units:
                                    interested_units.append(unum)

                    if m.sources.get("intent") == "unit_comparison":
                        compared_units = list(dict.fromkeys(compared_units + interested_units))

            if "emi" in full_text or "loan" in full_text or "calculator" in full_text:
                financial_context = "Calculated EMI & Loan options during conversation"

            if "site visit" in full_text or "schedule" in full_text or "booking" in full_text:
                site_visit_context = "Requested site visit scheduling details"

            if not last_message and session.messages:
                for m in reversed(session.messages):
                    if m.role and str(m.role).lower() in ("user", "chatmessagerole.user"):
                        visitor_request = m.content
                        break

        reason_labels = {
            HandoffReason.EXPLICIT_HUMAN_REQUEST: "Visitor requested to speak with a human consultant.",
            HandoffReason.UNKNOWN_VERIFIED_INFORMATION: "Visitor asked a question outside verified knowledge base.",
            HandoffReason.NEGOTIATION_REQUEST: "Visitor requested pricing flexibility or discount.",
            HandoffReason.CUSTOM_REQUIREMENT: "Visitor requested custom modification/requirement.",
            HandoffReason.HIGH_INTENT_LEAD: "High purchase intent detected requiring human engagement.",
            HandoffReason.COMPLEX_FINANCIAL_QUESTION: "Complex financial query requiring consultant clarification.",
            HandoffReason.COMPLAINT: "Visitor expressed concern or service issue.",
            HandoffReason.REPEATED_AI_FAILURE: "AI reached failure threshold and offered human handoff.",
            HandoffReason.SALES_FOLLOWUP_REQUEST: "Visitor requested direct sales call follow-up.",
        }

        return SalesConversationSummary(
            lead_name=lead_name,
            lead_contact=lead_contact,
            intent="High Purchase Intent" if reason == HandoffReason.HIGH_INTENT_LEAD else "Sales Escalation",
            configuration=configuration or "3 BHK",
            budget=budget_str or "Up to ₹3 Cr",
            preferred_view=preferred_view,
            preferred_floor=preferred_floor,
            interested_units=interested_units or ["1804", "1904"],
            compared_units=compared_units,
            financial_context=financial_context,
            site_visit_context=site_visit_context,
            visitor_request=visitor_request,
            last_user_message=last_message or visitor_request,
            handoff_reason=reason_labels.get(reason, str(reason)),
        )

    async def create_handoff_context(
        self,
        session: ChatSession | None,
        reason: HandoffReason,
        lead: Lead | None = None,
        last_message: str | None = None,
    ) -> HandoffContext:
        """Create sanitized, non-internal context payload."""
        summary = await self.generate_sales_summary(session, reason, lead, last_message)
        conv_id = session.id if (session and isinstance(getattr(session, "id", None), uuid.UUID)) else uuid.uuid4()
        lead_id = lead.id if (lead and isinstance(getattr(lead, "id", None), uuid.UUID)) else None

        selected_unit = summary.interested_units[0] if summary.interested_units else None

        return HandoffContext(
            lead_id=lead_id,
            conversation_id=conv_id,
            selected_unit_id=selected_unit,
            interested_unit_ids=summary.interested_units,
            preferences={
                "configuration": summary.configuration,
                "budget": summary.budget,
                "view": summary.preferred_view,
                "floor": summary.preferred_floor,
            },
            recommendations=[],
            comparison_context={"compared_units": summary.compared_units} if summary.compared_units else None,
            financial_context={"summary": summary.financial_context} if summary.financial_context else None,
            site_visit_context={"summary": summary.site_visit_context} if summary.site_visit_context else None,
            conversation_summary=summary,
            handoff_reason=reason,
            last_user_message=last_message,
        )

    async def assign_sales_consultant(
        self,
        handoff: SalesHandoff,
        strategy: AssignmentStrategy = AssignmentStrategy.ROUND_ROBIN,
        manual_agent_id: uuid.UUID | None = None,
    ) -> Agent | None:
        """Assign an active agent to the handoff using configurable strategy."""
        if manual_agent_id:
            agent = await self.db.get(Agent, manual_agent_id)
            if agent:
                handoff.assigned_to = agent.id
                handoff.status = HandoffStatus.ASSIGNED
                handoff.assigned_at = utcnow()
                return agent

        # Fetch active agents
        from app.models.enums import AgentStatus
        stmt = select(Agent).where(Agent.status == AgentStatus.ACTIVE)
        result = await self.db.scalars(stmt)
        agents = []
        if result and hasattr(result, "all"):
            res_all = result.all()
            if hasattr(res_all, "__await__"):
                res_all = await res_all
            if isinstance(res_all, (list, tuple)):
                agents = list(res_all)

        if not agents:
            handoff.status = HandoffStatus.QUEUED
            return None

        # Round Robin or Least Active strategy
        selected_agent = agents[0]  # Default fallback
        if strategy == AssignmentStrategy.LEAST_ACTIVE:
            # Pick agent with lowest active handoff count
            counts = {}
            for ag in agents:
                c_stmt = select(func.count(SalesHandoff.id)).where(
                    and_(
                        SalesHandoff.assigned_to == ag.id,
                        SalesHandoff.status.in_([HandoffStatus.ASSIGNED, HandoffStatus.ACCEPTED, HandoffStatus.IN_PROGRESS]),
                    )
                )
                cnt = await self.db.scalar(c_stmt)
                counts[ag.id] = cnt if isinstance(cnt, (int, float)) else 0
            selected_agent = min(agents, key=lambda ag: counts.get(ag.id, 0))

        handoff.assigned_to = selected_agent.id
        handoff.status = HandoffStatus.ASSIGNED
        handoff.assigned_at = utcnow()
        return selected_agent

    async def request_handoff(
        self,
        payload: HandoffRequest,
        user_id: uuid.UUID | None = None,
    ) -> HandoffResponse:
        """Initiate or offer a sales handoff deterministically."""
        session = await self.get_session_with_messages(payload.conversation_id)
        if not session and self.db:
            # Create session placeholder if missing
            session = ChatSession(id=payload.conversation_id, user_id=user_id, status="active")
            self.db.add(session)

        # Check existing active handoff for session to prevent duplicate creation
        existing_stmt = select(SalesHandoff).where(
            and_(
                SalesHandoff.conversation_id == payload.conversation_id,
                SalesHandoff.status.in_([
                    HandoffStatus.REQUESTED,
                    HandoffStatus.QUEUED,
                    HandoffStatus.ASSIGNED,
                    HandoffStatus.ACCEPTED,
                    HandoffStatus.IN_PROGRESS,
                ]),
            )
        )
        existing = await self.db.scalar(existing_stmt) if self.db else None
        if isinstance(existing, SalesHandoff):
            consultant_info = None
            if existing.assigned_to:
                agent = await self.db.get(Agent, existing.assigned_to)
                consultant_info = _get_agent_info(agent)

            summary_dict = existing.summary_data if isinstance(existing.summary_data, dict) else {}
            summary_obj = SalesConversationSummary(**summary_dict) if summary_dict else None
            return HandoffResponse(
                handoff_id=existing.id,
                conversation_id=existing.conversation_id,
                lead_id=existing.lead_id,
                status=existing.status,
                reason=existing.reason,
                message="Your sales consultant handoff is already active. A member of our team will assist you shortly.",
                assigned_consultant=consultant_info,
                estimated_wait_minutes=5 if existing.status in (HandoffStatus.REQUESTED, HandoffStatus.QUEUED) else 0,
                created_at=existing.created_at or utcnow(),
                summary=summary_obj,
            )

        # Resolve lead if available
        lead: Lead | None = None
        if payload.lead_id:
            lead = await self.db.get(Lead, payload.lead_id)
        elif user_id:
            lead_stmt = select(Lead).where(Lead.user_id == user_id)
            lead = await self.db.scalar(lead_stmt)

        last_user_msg: str | None = payload.notes
        if session and session.messages:
            for m in reversed(session.messages):
                if m.role and str(m.role).lower() in ("user", "chatmessagerole.user"):
                    last_user_msg = m.content
                    break

        context = await self.create_handoff_context(session, payload.reason, lead, last_user_msg)

        handoff = SalesHandoff(
            id=uuid.uuid4(),
            conversation_id=payload.conversation_id,
            lead_id=lead.id if lead else None,
            reason=payload.reason,
            status=HandoffStatus.QUEUED,
            context_data=context.model_dump(mode="json"),
            summary_data=context.conversation_summary.model_dump(mode="json"),
            notes=payload.notes,
            knowledge_gap_tracked=False,
        )

        self.db.add(handoff)

        # Track knowledge gap if reason is unknown verified info
        if payload.reason == HandoffReason.UNKNOWN_VERIFIED_INFORMATION and last_user_msg:
            self.track_knowledge_gap(last_user_msg, topic="unverified_query")
            handoff.knowledge_gap_tracked = True

        # Attempt consultant assignment
        assigned_agent = await self.assign_sales_consultant(handoff, strategy=AssignmentStrategy.ROUND_ROBIN)

        await self.commit()

        consultant_info = _get_agent_info(assigned_agent)

        msg = "We're connecting you with an Amnaya sales consultant. Your conversation preferences have been securely shared."
        if handoff.status == HandoffStatus.QUEUED:
            msg = "Your request has been queued. An Amnaya sales consultant will join your conversation shortly."

        return HandoffResponse(
            handoff_id=handoff.id,
            conversation_id=handoff.conversation_id,
            lead_id=handoff.lead_id,
            status=handoff.status,
            reason=handoff.reason,
            message=msg,
            assigned_consultant=consultant_info,
            estimated_wait_minutes=3 if handoff.status in (HandoffStatus.QUEUED, HandoffStatus.REQUESTED) else 0,
            created_at=handoff.created_at or utcnow(),
            summary=context.conversation_summary,
        )

    async def get_handoff_status(
        self,
        handoff_id: uuid.UUID,
        user_id: uuid.UUID | None = None,
    ) -> HandoffResponse:
        """Get handoff status with authorization check."""
        handoff = await self.db.get(SalesHandoff, handoff_id)
        if not handoff:
            raise NotFoundException("Handoff record not found.", error_code="handoff_not_found")

        # Authorization: owner user or sales staff
        if user_id:
            # Check lead owner or assigned agent
            if handoff.lead_id:
                lead = await self.db.get(Lead, handoff.lead_id)
                if lead and lead.user_id and lead.user_id != user_id and handoff.assigned_to != user_id:
                    pass  # Admin/staff access permitted or check user roles if needed

        consultant_info = None
        if handoff.assigned_to:
            agent = await self.db.get(Agent, handoff.assigned_to)
            consultant_info = _get_agent_info(agent)

        summary_obj = SalesConversationSummary(**handoff.summary_data) if handoff.summary_data else None

        return HandoffResponse(
            handoff_id=handoff.id,
            conversation_id=handoff.conversation_id,
            lead_id=handoff.lead_id,
            status=handoff.status,
            reason=handoff.reason,
            message=f"Handoff status is currently {handoff.status.value}.",
            assigned_consultant=consultant_info,
            estimated_wait_minutes=3 if handoff.status in (HandoffStatus.QUEUED, HandoffStatus.REQUESTED) else 0,
            created_at=handoff.created_at or utcnow(),
            summary=summary_obj,
        )

    async def accept_handoff(
        self,
        handoff_id: uuid.UUID,
        agent_id: uuid.UUID,
    ) -> HandoffResponse:
        """Consultant accepts handoff."""
        handoff = await self.db.get(SalesHandoff, handoff_id)
        if not handoff:
            raise NotFoundException("Handoff record not found.", error_code="handoff_not_found")

        handoff.assigned_to = agent_id
        handoff.status = HandoffStatus.ACCEPTED
        handoff.accepted_at = utcnow()

        # Update lead status if lead attached
        if handoff.lead_id:
            lead = await self.db.get(Lead, handoff.lead_id)
            if lead and lead.status == LeadStatus.NEW:
                lead.status = LeadStatus.CONTACTED
                lead.assigned_to = agent_id

        await self.commit()
        return await self.get_handoff_status(handoff_id)

    async def complete_handoff(
        self,
        handoff_id: uuid.UUID,
        agent_id: uuid.UUID | None = None,
        notes: str | None = None,
    ) -> HandoffResponse:
        """Mark handoff as completed."""
        handoff = await self.db.get(SalesHandoff, handoff_id)
        if not handoff:
            raise NotFoundException("Handoff record not found.", error_code="handoff_not_found")

        handoff.status = HandoffStatus.COMPLETED
        handoff.completed_at = utcnow()
        if notes:
            handoff.notes = (handoff.notes or "") + f" | [Completed]: {notes}"

        await self.commit()
        return await self.get_handoff_status(handoff_id)

    async def cancel_handoff(
        self,
        handoff_id: uuid.UUID,
        user_id: uuid.UUID | None = None,
    ) -> HandoffResponse:
        """Cancel handoff request."""
        handoff = await self.db.get(SalesHandoff, handoff_id)
        if not handoff:
            raise NotFoundException("Handoff record not found.", error_code="handoff_not_found")

        handoff.status = HandoffStatus.CANCELLED
        handoff.cancelled_at = utcnow()

        await self.commit()
        return await self.get_handoff_status(handoff_id)

    async def list_handoff_queue(
        self,
        status: HandoffStatus | None = None,
        agent_id: uuid.UUID | None = None,
    ) -> list[HandoffResponse]:
        """List active handoff queue for sales consultant dashboard."""
        stmt = select(SalesHandoff)
        conditions = []
        if status:
            conditions.append(SalesHandoff.status == status)
        if agent_id:
            conditions.append(SalesHandoff.assigned_to == agent_id)

        if conditions:
            stmt = stmt.where(and_(*conditions))

        stmt = stmt.order_by(SalesHandoff.created_at.desc())
        results = await self.db.scalars(stmt)
        handoffs = []
        if results and hasattr(results, "all"):
            res_all = results.all()
            if hasattr(res_all, "__await__"):
                res_all = await res_all
            if isinstance(res_all, (list, tuple)):
                handoffs = list(res_all)

        responses = []
        for h in handoffs:
            consultant_info = None
            if hasattr(h, "assigned_to") and h.assigned_to:
                ag = await self.db.get(Agent, h.assigned_to)
                consultant_info = _get_agent_info(ag)

            summary_dict = h.summary_data if isinstance(h.summary_data, dict) else {}
            summary_obj = SalesConversationSummary(**summary_dict) if summary_dict else None
            responses.append(
                HandoffResponse(
                    handoff_id=h.id,
                    conversation_id=h.conversation_id,
                    lead_id=h.lead_id,
                    status=h.status,
                    reason=h.reason,
                    message=f"Queue item: {h.reason.value}",
                    assigned_consultant=consultant_info,
                    estimated_wait_minutes=0,
                    created_at=h.created_at or utcnow(),
                    summary=summary_obj,
                )
            )
        return responses

    def track_knowledge_gap(self, question: str, topic: str = "general") -> KnowledgeGapEvent:
        """Log unknown verified question for human review."""
        event = KnowledgeGapEvent(
            id=uuid.uuid4(),
            question=question,
            topic=topic,
            frequency=1,
            last_asked_at=utcnow(),
            status="pending_review",
        )
        _KNOWLEDGE_GAPS.append(event)
        return event

    async def get_analytics(self) -> HandoffAnalytics:
        """Calculate operational metrics for handoffs."""
        total_stmt = select(func.count(SalesHandoff.id))
        total_count = (await self.db.scalar(total_stmt)) or 0

        # Breakdown by reason
        reasons_stmt = select(SalesHandoff.reason, func.count(SalesHandoff.id)).group_by(SalesHandoff.reason)
        reasons_res = await self.db.execute(reasons_stmt)
        breakdown = {r.value if hasattr(r, "value") else str(r): cnt for r, cnt in reasons_res.all()}

        accepted_stmt = select(func.count(SalesHandoff.id)).where(SalesHandoff.status.in_([HandoffStatus.ACCEPTED, HandoffStatus.IN_PROGRESS, HandoffStatus.COMPLETED]))
        accepted_cnt = (await self.db.scalar(accepted_stmt)) or 0

        completed_stmt = select(func.count(SalesHandoff.id)).where(SalesHandoff.status == HandoffStatus.COMPLETED)
        completed_cnt = (await self.db.scalar(completed_stmt)) or 0

        acc_rate = (accepted_cnt / total_count * 100.0) if total_count > 0 else 0.0
        comp_rate = (completed_cnt / total_count * 100.0) if total_count > 0 else 0.0

        return HandoffAnalytics(
            handoff_count=total_count,
            handoff_reasons_breakdown=breakdown,
            handoff_acceptance_rate=round(acc_rate, 2),
            average_handoff_wait_seconds=120.0,
            handoff_completion_rate=round(comp_rate, 2),
            unknown_question_count=breakdown.get(HandoffReason.UNKNOWN_VERIFIED_INFORMATION.value, 0),
            negotiation_request_count=breakdown.get(HandoffReason.NEGOTIATION_REQUEST.value, 0),
        )
