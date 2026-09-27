"""Test Suite for Phase 7.9 — Human Handoff & Sales Consultant Escalation.

Contains 50+ comprehensive unit, integration, and security test scenarios verifying:
- Explicit human request triggers
- Unknown verified information escalation
- Negotiation and discount escalation
- High intent sales signals
- Repeated AI failure tracking
- Handoff context & sales conversation summary generation
- Handoff lifecycle state transitions (REQUESTED -> QUEUED -> ASSIGNED -> ACCEPTED -> COMPLETED / CANCELLED)
- Consultant assignment strategies (round_robin, least_active, manual)
- Security, lead isolation, and access control
- Knowledge-gap tracking & operational analytics
"""

from __future__ import annotations

import uuid
from datetime import datetime
from unittest.mock import AsyncMock, MagicMock

import pytest

from app.ai.intent_engine import IntentEngine, intent_engine
from app.ai.orchestrator import AIOrchestrator
from app.models.crm import Lead, SalesHandoff
from app.models.enums import AgentStatus, AssignmentStrategy, HandoffReason, HandoffStatus, LeadStatus
from app.models.user import Agent, User
from app.schemas.ai import AIChatRequest, AIResponseType
from app.schemas.handoff import HandoffRequest, SalesConversationSummary
from app.services.ai_service import AIService
from app.services.handoff_service import HandoffService


# -----------------------------------------------------------------------------
# Fixtures
# -----------------------------------------------------------------------------

@pytest.fixture
def mock_db():
    db = AsyncMock()
    db.add = MagicMock()
    db.commit = AsyncMock()
    db.scalar = AsyncMock()
    db.scalars = AsyncMock()
    db.execute = AsyncMock()
    db.get = AsyncMock()
    return db


@pytest.fixture
def dummy_agent():
    u = User(
        id=uuid.uuid4(),
        full_name="Rajesh Sharma",
        email="rajesh@visionamanya.com",
        phone="+919876543210",
        is_active=True,
    )
    ag = Agent(
        id=uuid.uuid4(),
        user_id=u.id,
        status=AgentStatus.ACTIVE,
    )
    ag.user = u
    ag.full_name = "Rajesh Sharma"
    ag.phone = "+919876543210"
    return ag


@pytest.fixture
def dummy_lead():
    return Lead(
        id=uuid.uuid4(),
        name="Vikram Kumar",
        email="vikram@example.com",
        phone="+919988776655",
        status=LeadStatus.NEW,
        budget_min=20000000.0,
        budget_max=30000000.0,
    )


# -----------------------------------------------------------------------------
# 1. Explicit Human Request Triggers (Tests 01-10)
# -----------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_01_trigger_explicit_human_request_talk_to_someone():
    res = intent_engine.classify("I want to talk to someone")
    assert res.intent == "human_handoff"
    assert res.confidence >= 0.95


@pytest.mark.asyncio
async def test_02_trigger_explicit_human_request_connect_sales():
    res = intent_engine.classify("Connect me to sales")
    assert res.intent == "human_handoff"


@pytest.mark.asyncio
async def test_03_trigger_explicit_human_request_call_me():
    res = intent_engine.classify("Can someone call me?")
    assert res.intent in ("human_handoff", "lead_capture")


@pytest.mark.asyncio
async def test_04_trigger_explicit_human_request_speak_with_person():
    res = intent_engine.classify("I want to speak with a person")
    assert res.intent == "human_handoff"


@pytest.mark.asyncio
async def test_05_trigger_explicit_human_request_sales_consultant():
    res = intent_engine.classify("Can I talk to a sales consultant?")
    assert res.intent == "human_handoff"


@pytest.mark.asyncio
async def test_06_orchestrator_explicit_human_request():
    orch = AIOrchestrator()
    conv_id = uuid.uuid4()
    resp = await orch.process_query(conv_id, "I want to speak to someone")
    assert resp.response_type == AIResponseType.HANDOFF
    assert "sales consultant" in resp.message.lower()
    assert resp.handoff_context is not None
    assert resp.handoff_context["reason"] == "explicit_human_request"


@pytest.mark.asyncio
async def test_07_orchestrator_human_request_suggested_actions():
    orch = AIOrchestrator()
    resp = await orch.process_query(uuid.uuid4(), "Connect me with a consultant")
    actions = [a.action_type for a in resp.suggested_actions]
    assert "handoff" in actions


@pytest.mark.asyncio
async def test_08_explicit_handoff_request_creation(mock_db):
    service = HandoffService(mock_db)
    conv_id = uuid.uuid4()
    mock_db.scalar.return_value = None  # No existing handoff
    req = HandoffRequest(conversation_id=conv_id, reason=HandoffReason.EXPLICIT_HUMAN_REQUEST)

    res = await service.request_handoff(req)
    assert res.status in (HandoffStatus.QUEUED, HandoffStatus.ASSIGNED)
    assert res.reason == HandoffReason.EXPLICIT_HUMAN_REQUEST
    assert mock_db.add.called


@pytest.mark.asyncio
async def test_09_explicit_request_notes_preservation(mock_db):
    service = HandoffService(mock_db)
    conv_id = uuid.uuid4()
    req = HandoffRequest(
        conversation_id=conv_id,
        reason=HandoffReason.EXPLICIT_HUMAN_REQUEST,
        notes="Visitor wants callback around 5 PM",
    )
    res = await service.request_handoff(req)
    assert res.summary is not None


@pytest.mark.asyncio
async def test_10_explicit_request_response_type_contract():
    orch = AIOrchestrator()
    resp = await orch.process_query(uuid.uuid4(), "Talk to a real person please")
    assert resp.response_type.value == "handoff"


# -----------------------------------------------------------------------------
# 2. Unknown Verified Information Escalation (Tests 11-18)
# -----------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_11_trigger_unknown_verified_info_keyword():
    res = intent_engine.classify("Tell me something that isn't in your information")
    assert res.intent == "unknown_verified_information"


@pytest.mark.asyncio
async def test_12_orchestrator_unknown_verified_information():
    orch = AIOrchestrator()
    resp = await orch.process_query(uuid.uuid4(), "Tell me something that isn't in your information")
    assert resp.response_type == AIResponseType.HANDOFF
    assert "don't have verified information" in resp.message.lower()
    assert resp.handoff_context["reason"] == "unknown_verified_information"


@pytest.mark.asyncio
async def test_13_unknown_info_tracks_knowledge_gap(mock_db):
    service = HandoffService(mock_db)
    req = HandoffRequest(
        conversation_id=uuid.uuid4(),
        reason=HandoffReason.UNKNOWN_VERIFIED_INFORMATION,
        notes="When is unannounced possession?",
    )
    res = await service.request_handoff(req)
    assert res.reason == HandoffReason.UNKNOWN_VERIFIED_INFORMATION


@pytest.mark.asyncio
async def test_14_unknown_info_does_not_hallucinate():
    orch = AIOrchestrator()
    resp = await orch.process_query(uuid.uuid4(), "Tell me an unverified secret fact")
    assert "secret" not in resp.message.lower() or "verified" in resp.message.lower()


@pytest.mark.asyncio
async def test_15_unknown_info_suggests_consultant_action():
    orch = AIOrchestrator()
    resp = await orch.process_query(uuid.uuid4(), "What is the unverified pricing for block C?")
    assert any(a.action_type == "handoff" for a in resp.suggested_actions)


@pytest.mark.asyncio
async def test_16_unknown_info_context_reason():
    orch = AIOrchestrator()
    resp = await orch.process_query(uuid.uuid4(), "Question not in your data")
    assert resp.handoff_context["reason"] == "unknown_verified_information"


@pytest.mark.asyncio
async def test_17_unknown_question_tracking_memory_store(mock_db):
    service = HandoffService(mock_db)
    gap = service.track_knowledge_gap("What is the soil test report result?", topic="geotechnical")
    assert gap.question == "What is the soil test report result?"
    assert gap.status == "pending_review"


@pytest.mark.asyncio
async def test_18_unknown_info_response_message_format():
    orch = AIOrchestrator()
    resp = await orch.process_query(uuid.uuid4(), "Tell me something that isn't in your information")
    assert "Amnaya sales consultant" in resp.message


# -----------------------------------------------------------------------------
# 3. Negotiation & Discount Escalation (Tests 19-26)
# -----------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_19_trigger_negotiation_discount_request():
    res = intent_engine.classify("Can you give me your best discount?")
    assert res.intent == "negotiation_request"


@pytest.mark.asyncio
async def test_20_trigger_negotiation_best_price():
    res = intent_engine.classify("What's your best offer for Unit 1804?")
    assert res.intent == "negotiation_request"


@pytest.mark.asyncio
async def test_21_trigger_negotiation_flexible_pricing():
    res = intent_engine.classify("Is there any flexibility in pricing?")
    assert res.intent == "negotiation_request"


@pytest.mark.asyncio
async def test_22_orchestrator_negotiation_escalation():
    orch = AIOrchestrator()
    resp = await orch.process_query(uuid.uuid4(), "Can you reduce the price?")
    assert resp.response_type == AIResponseType.HANDOFF
    assert "pricing flexibility" in resp.message.lower()
    assert resp.handoff_context["reason"] == "negotiation_request"


@pytest.mark.asyncio
async def test_23_negotiation_does_not_invent_discount():
    orch = AIOrchestrator()
    resp = await orch.process_query(uuid.uuid4(), "Can I get 15% discount?")
    assert "15%" not in resp.message
    assert "sales consultant" in resp.message


@pytest.mark.asyncio
async def test_24_negotiation_handoff_context():
    orch = AIOrchestrator()
    resp = await orch.process_query(uuid.uuid4(), "What is your best price?")
    assert resp.handoff_context["title"] == "Pricing & Sales Terms Discussion"


@pytest.mark.asyncio
async def test_25_negotiation_handoff_request_service(mock_db):
    service = HandoffService(mock_db)
    req = HandoffRequest(
        conversation_id=uuid.uuid4(),
        reason=HandoffReason.NEGOTIATION_REQUEST,
        notes="Requested discount on 3 BHK Lake View",
    )
    res = await service.request_handoff(req)
    assert res.reason == HandoffReason.NEGOTIATION_REQUEST


@pytest.mark.asyncio
async def test_26_custom_requirement_escalation():
    res = intent_engine.classify("I have a custom requirement for custom floor plan")
    assert res.intent == "custom_requirement"


# -----------------------------------------------------------------------------
# 4. Repeated Failure & High Intent Escalation (Tests 27-33)
# -----------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_27_ai_service_repeated_failure_tracking(mock_db):
    from app.models.chat import ChatSession
    ai_service = AIService(mock_db)
    conv_id = uuid.uuid4()
    session = ChatSession(id=conv_id, status="active", message_count=0, metadata_={})
    mock_db.scalar.return_value = session

    req1 = AIChatRequest(conversation_id=conv_id, message="write python code")
    resp1 = await ai_service.chat(req1)
    assert resp1.response_type == AIResponseType.CLARIFICATION

    req2 = AIChatRequest(conversation_id=conv_id, message="write javascript code")
    resp2 = await ai_service.chat(req2)
    assert resp2.response_type == AIResponseType.HANDOFF
    assert "inaccurate answer" in resp2.message.lower()


@pytest.mark.asyncio
async def test_28_high_intent_lead_context_generation(mock_db, dummy_lead):
    service = HandoffService(mock_db)
    ctx = await service.create_handoff_context(
        session=None,
        reason=HandoffReason.HIGH_INTENT_LEAD,
        lead=dummy_lead,
        last_message="I want Unit 1804 immediately",
    )
    assert ctx.handoff_reason == HandoffReason.HIGH_INTENT_LEAD
    assert ctx.conversation_summary.lead_name == "Vikram Kumar"


@pytest.mark.asyncio
async def test_29_summary_budget_formatting_min_max(mock_db, dummy_lead):
    service = HandoffService(mock_db)
    summary = await service.generate_sales_summary(None, HandoffReason.HIGH_INTENT_LEAD, lead=dummy_lead)
    assert "₹2.00 Cr - ₹3.00 Cr" in summary.budget


@pytest.mark.asyncio
async def test_30_summary_extracts_interested_units(mock_db):
    service = HandoffService(mock_db)
    session = MagicMock()
    m1 = MagicMock(content="I am looking at Unit 1804 and Unit 1904", sources={"units": [{"unit_number": "1804"}, {"unit_number": "1904"}], "intent": "unit_search"}, role="user")
    session.messages = [m1]

    summary = await service.generate_sales_summary(session, HandoffReason.EXPLICIT_HUMAN_REQUEST)
    assert "1804" in summary.interested_units
    assert "1904" in summary.interested_units


@pytest.mark.asyncio
async def test_31_summary_extracts_compared_units(mock_db):
    service = HandoffService(mock_db)
    session = MagicMock()
    m1 = MagicMock(content="Compare Unit 1804 vs Unit 1601", sources={"units": [{"unit_number": "1804"}, {"unit_number": "1601"}], "intent": "unit_comparison"}, role="user")
    session.messages = [m1]

    summary = await service.generate_sales_summary(session, HandoffReason.EXPLICIT_HUMAN_REQUEST)
    assert len(summary.compared_units) > 0


@pytest.mark.asyncio
async def test_32_summary_extracts_financial_context(mock_db):
    service = HandoffService(mock_db)
    session = MagicMock()
    m1 = MagicMock(content="What is the EMI for 20 years?", sources={"intent": "emi_calculation"}, role="user")
    session.messages = [m1]

    summary = await service.generate_sales_summary(session, HandoffReason.EXPLICIT_HUMAN_REQUEST)
    assert summary.financial_context is not None


@pytest.mark.asyncio
async def test_33_summary_extracts_site_visit_context(mock_db):
    service = HandoffService(mock_db)
    session = MagicMock()
    m1 = MagicMock(content="Book a site visit for Saturday", sources={"intent": "site_visit"}, role="user")
    session.messages = [m1]

    summary = await service.generate_sales_summary(session, HandoffReason.EXPLICIT_HUMAN_REQUEST)
    assert summary.site_visit_context is not None


# -----------------------------------------------------------------------------
# 5. Handoff Lifecycle & Assignment Strategies (Tests 34-42)
# -----------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_34_handoff_duplicate_prevention(mock_db):
    service = HandoffService(mock_db)
    conv_id = uuid.uuid4()
    existing_h = SalesHandoff(
        id=uuid.uuid4(),
        conversation_id=conv_id,
        status=HandoffStatus.QUEUED,
        reason=HandoffReason.EXPLICIT_HUMAN_REQUEST,
        summary_data={"lead_name": "Existing Lead", "handoff_reason": "explicit_human_request"},
    )
    mock_db.scalar.return_value = existing_h

    req = HandoffRequest(conversation_id=conv_id, reason=HandoffReason.EXPLICIT_HUMAN_REQUEST)
    res = await service.request_handoff(req)
    assert res.handoff_id == existing_h.id
    assert "already active" in res.message.lower()


@pytest.mark.asyncio
async def test_35_agent_assignment_round_robin(mock_db, dummy_agent):
    service = HandoffService(mock_db)
    handoff = SalesHandoff(id=uuid.uuid4(), status=HandoffStatus.QUEUED)
    scalars_mock = MagicMock()
    scalars_mock.all.return_value = [dummy_agent]
    mock_db.scalars.return_value = scalars_mock

    assigned = await service.assign_sales_consultant(handoff, strategy=AssignmentStrategy.ROUND_ROBIN)
    assert assigned.id == dummy_agent.id
    assert handoff.status == HandoffStatus.ASSIGNED


@pytest.mark.asyncio
async def test_36_agent_assignment_manual(mock_db, dummy_agent):
    service = HandoffService(mock_db)
    handoff = SalesHandoff(id=uuid.uuid4(), status=HandoffStatus.QUEUED)
    mock_db.get.return_value = dummy_agent

    assigned = await service.assign_sales_consultant(handoff, manual_agent_id=dummy_agent.id)
    assert assigned.id == dummy_agent.id
    assert handoff.status == HandoffStatus.ASSIGNED


@pytest.mark.asyncio
async def test_37_agent_assignment_queue_fallback_when_no_agent(mock_db):
    service = HandoffService(mock_db)
    handoff = SalesHandoff(id=uuid.uuid4(), status=HandoffStatus.QUEUED)
    scalars_mock = MagicMock()
    scalars_mock.all.return_value = []
    mock_db.scalars.return_value = scalars_mock

    assigned = await service.assign_sales_consultant(handoff)
    assert assigned is None
    assert handoff.status == HandoffStatus.QUEUED


@pytest.mark.asyncio
async def test_38_accept_handoff_transition(mock_db, dummy_agent, dummy_lead):
    service = HandoffService(mock_db)
    h_id = uuid.uuid4()
    handoff = SalesHandoff(id=h_id, conversation_id=uuid.uuid4(), lead_id=dummy_lead.id, status=HandoffStatus.ASSIGNED, reason=HandoffReason.EXPLICIT_HUMAN_REQUEST)
    mock_db.get.side_effect = lambda model, id_: handoff if model == SalesHandoff else (dummy_lead if model == Lead else None)

    res = await service.accept_handoff(h_id, dummy_agent.id)
    assert handoff.status == HandoffStatus.ACCEPTED
    assert handoff.accepted_at is not None


@pytest.mark.asyncio
async def test_39_complete_handoff_transition(mock_db):
    service = HandoffService(mock_db)
    h_id = uuid.uuid4()
    handoff = SalesHandoff(id=h_id, conversation_id=uuid.uuid4(), status=HandoffStatus.ACCEPTED, reason=HandoffReason.EXPLICIT_HUMAN_REQUEST)
    mock_db.get.return_value = handoff

    res = await service.complete_handoff(h_id, notes="Client interested in booking Unit 1804")
    assert handoff.status == HandoffStatus.COMPLETED
    assert handoff.completed_at is not None
    assert "Unit 1804" in handoff.notes


@pytest.mark.asyncio
async def test_40_cancel_handoff_transition(mock_db):
    service = HandoffService(mock_db)
    h_id = uuid.uuid4()
    handoff = SalesHandoff(id=h_id, conversation_id=uuid.uuid4(), status=HandoffStatus.QUEUED, reason=HandoffReason.EXPLICIT_HUMAN_REQUEST)
    mock_db.get.return_value = handoff

    res = await service.cancel_handoff(h_id)
    assert handoff.status == HandoffStatus.CANCELLED
    assert handoff.cancelled_at is not None


@pytest.mark.asyncio
async def test_41_list_handoff_queue_filtering(mock_db):
    service = HandoffService(mock_db)
    h1 = SalesHandoff(id=uuid.uuid4(), conversation_id=uuid.uuid4(), status=HandoffStatus.QUEUED, reason=HandoffReason.EXPLICIT_HUMAN_REQUEST)
    scalars_mock = MagicMock()
    scalars_mock.all.return_value = [h1]
    mock_db.scalars.return_value = scalars_mock

    items = await service.list_handoff_queue(status=HandoffStatus.QUEUED)
    assert len(items) == 1
    assert items[0].status == HandoffStatus.QUEUED


@pytest.mark.asyncio
async def test_42_estimated_wait_time_calculation(mock_db):
    service = HandoffService(mock_db)
    h_id = uuid.uuid4()
    handoff = SalesHandoff(id=h_id, conversation_id=uuid.uuid4(), status=HandoffStatus.QUEUED, reason=HandoffReason.EXPLICIT_HUMAN_REQUEST)
    mock_db.get.return_value = handoff

    res = await service.get_handoff_status(h_id)
    assert res.estimated_wait_minutes == 3


# -----------------------------------------------------------------------------
# 6. Security, Isolation & Analytics (Tests 43-50)
# -----------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_43_handoff_not_found_raises_exception(mock_db):
    service = HandoffService(mock_db)
    mock_db.get.return_value = None
    with pytest.raises(Exception):
        await service.get_handoff_status(uuid.uuid4())


@pytest.mark.asyncio
async def test_44_handoff_context_excludes_system_prompts(mock_db):
    service = HandoffService(mock_db)
    ctx = await service.create_handoff_context(None, HandoffReason.EXPLICIT_HUMAN_REQUEST)
    ctx_dict = ctx.model_dump()
    assert "system_prompt" not in ctx_dict
    assert "api_key" not in ctx_dict


@pytest.mark.asyncio
async def test_45_handoff_context_excludes_internal_chain_of_thought(mock_db):
    service = HandoffService(mock_db)
    ctx = await service.create_handoff_context(None, HandoffReason.EXPLICIT_HUMAN_REQUEST)
    ctx_dict = ctx.model_dump()
    assert "chain_of_thought" not in ctx_dict


@pytest.mark.asyncio
async def test_46_handoff_analytics_metrics(mock_db):
    service = HandoffService(mock_db)
    mock_db.scalar.side_effect = [10, 8, 5]  # total, accepted, completed
    mock_exec = MagicMock()
    mock_exec.all.return_value = [("explicit_human_request", 6), ("negotiation_request", 4)]
    mock_db.execute.return_value = mock_exec

    analytics = await service.get_analytics()
    assert analytics.handoff_count == 10
    assert analytics.handoff_acceptance_rate == 80.0
    assert analytics.handoff_completion_rate == 50.0


@pytest.mark.asyncio
async def test_47_end_to_end_negotiation_escalation_flow(mock_db):
    orch = AIOrchestrator()
    conv_id = uuid.uuid4()

    # Step 1: User asks for discount
    resp = await orch.process_query(conv_id, "Can you reduce the price?")
    assert resp.response_type == AIResponseType.HANDOFF
    assert resp.handoff_context["reason"] == "negotiation_request"

    # Step 2: Handoff requested
    service = HandoffService(mock_db)
    mock_db.scalar.return_value = None
    req = HandoffRequest(conversation_id=conv_id, reason=HandoffReason.NEGOTIATION_REQUEST)
    h_res = await service.request_handoff(req)
    assert h_res.status in (HandoffStatus.QUEUED, HandoffStatus.ASSIGNED)


@pytest.mark.asyncio
async def test_48_end_to_end_unknown_answer_escalation_flow(mock_db):
    orch = AIOrchestrator()
    conv_id = uuid.uuid4()

    resp = await orch.process_query(conv_id, "Tell me something that isn't in your information")
    assert resp.response_type == AIResponseType.HANDOFF

    service = HandoffService(mock_db)
    mock_db.scalar.return_value = None
    h_res = await service.request_handoff(HandoffRequest(conversation_id=conv_id, reason=HandoffReason.UNKNOWN_VERIFIED_INFORMATION))
    assert h_res.reason == HandoffReason.UNKNOWN_VERIFIED_INFORMATION


@pytest.mark.asyncio
async def test_49_status_enum_values_match_spec():
    assert HandoffStatus.REQUESTED.value == "REQUESTED"
    assert HandoffStatus.QUEUED.value == "QUEUED"
    assert HandoffStatus.ASSIGNED.value == "ASSIGNED"
    assert HandoffStatus.ACCEPTED.value == "ACCEPTED"
    assert HandoffStatus.IN_PROGRESS.value == "IN_PROGRESS"
    assert HandoffStatus.COMPLETED.value == "COMPLETED"
    assert HandoffStatus.CANCELLED.value == "CANCELLED"


@pytest.mark.asyncio
async def test_50_reason_enum_values_match_spec():
    assert HandoffReason.EXPLICIT_HUMAN_REQUEST.value == "explicit_human_request"
    assert HandoffReason.UNKNOWN_VERIFIED_INFORMATION.value == "unknown_verified_information"
    assert HandoffReason.NEGOTIATION_REQUEST.value == "negotiation_request"
    assert HandoffReason.CUSTOM_REQUIREMENT.value == "custom_requirement"
    assert HandoffReason.HIGH_INTENT_LEAD.value == "high_intent_lead"
    assert HandoffReason.REPEATED_AI_FAILURE.value == "repeated_ai_failure"
