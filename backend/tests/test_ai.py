"""Unit test suite for AI Consultant foundation schemas, orchestrator, guardrails, and endpoints."""

import uuid
from unittest.mock import AsyncMock, patch
from fastapi.testclient import TestClient

from app.ai.guardrails import guardrails
from app.ai.orchestrator import orchestrator
from app.api.deps import get_db, get_optional_user
from app.models.enums import ChatMessageRole, ChatSessionStatus
from app.schemas.ai import (
    AIChatContext,
    AIChatRequest,
    AIResponseType,
    AIStructuredResponse,
)
from main import app


def test_ai_guardrails_input_sanitization():
    """Test AIGuardrails input sanitization."""
    raw_input = "   Can you tell me about Amnaya lake view residences?   "
    cleaned = guardrails.sanitize_input(raw_input)
    assert cleaned == "Can you tell me about Amnaya lake view residences?"


def test_ai_guardrails_fact_validation():
    """Test AIGuardrails fact check rejects disallowed promotional terms."""
    valid, text = guardrails.validate_facts("Guaranteed ROI discount offer")
    assert not valid
    assert "official pricing" in text.lower()


def test_ai_orchestrator_intent_classification():
    """Test AIOrchestrator intent classification logic."""
    intent_visit = orchestrator.classify_intent("I want to schedule a visit to the site")
    assert intent_visit == "site_visit"

    intent_recommend = orchestrator.classify_intent("Recommend a 3 BHK lake-facing residence")
    assert intent_recommend == "unit_recommendation"

    intent_floorplan = orchestrator.classify_intent("Show me the floor plan for 1804")
    assert intent_floorplan in ("floor_plan", "floor_plan_information")


async def test_ai_orchestrator_process_query():
    """Test AIOrchestrator process_query produces structured response."""
    conv_id = uuid.uuid4()
    context = AIChatContext(current_page="/residences", current_unit_id="1804")

    response: AIStructuredResponse = await orchestrator.process_query(
        conversation_id=conv_id,
        user_message="Recommend a 3 BHK residence",
        context=context,
    )

    assert response.conversation_id == conv_id
    assert response.response_type == AIResponseType.UNIT_RECOMMENDATION
    assert len(response.units) > 0
    assert len(response.suggested_actions) > 0


def test_ai_chat_endpoint_mocked():
    """Test POST /api/v1/ai/chat endpoint with mocked database dependencies."""
    mock_db = AsyncMock()

    # Mock get_db and get_optional_user
    app.dependency_overrides[get_db] = lambda: mock_db
    app.dependency_overrides[get_optional_user] = lambda: None

    client = TestClient(app)

    with patch("app.services.ai_service.AIService.chat", new_callable=AsyncMock) as mock_chat:
        conv_id = uuid.uuid4()
        mock_chat.return_value = AIStructuredResponse(
            conversation_id=conv_id,
            message="Welcome to Amnaya Intelligence",
            response_type=AIResponseType.TEXT,
            intent="general_inquiry",
            confidence=1.0,
        )

        response = client.post(
            "/api/v1/ai/chat",
            json={"message": "Hello Amnaya AI", "guest_id": "mock_guest_1"},
        )

        assert response.status_code == 200, response.text
        data = response.json()["data"]
        assert data["conversation_id"] == str(conv_id)
        assert data["message"] == "Welcome to Amnaya Intelligence"

    app.dependency_overrides.clear()
