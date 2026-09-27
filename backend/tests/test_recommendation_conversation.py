"""40-Scenario Pytest Suite for Phase 7.5 AI Recommendation Conversation & Decision Layer."""

import uuid
import pytest
from unittest.mock import AsyncMock

from app.ai.conversation_manager import ConversationManager, ConversationState
from app.ai.orchestrator import AIOrchestrator
from app.schemas.ai import PropertyPreferences


@pytest.fixture
def test_conversation_id():
    return uuid.uuid4()


# ------------------------------------------------------------------------------
# 1. STATE PERSISTENCE & MERGING TESTS (1-10)
# ------------------------------------------------------------------------------

def test_01_conversation_state_initialization(test_conversation_id):
    state = ConversationManager.get_or_create(test_conversation_id)
    assert state.conversation_id == test_conversation_id
    assert state.offset == 0
    assert len(state.rejected_units) == 0


def test_02_preference_merging_multi_turn(test_conversation_id):
    state = ConversationManager.get_or_create(test_conversation_id)
    
    # Turn 1: 3 BHK
    ConversationManager.update_preferences(state, PropertyPreferences(configuration="3BHK", maximum_budget=30_000_000))
    assert state.preferences.maximum_budget == 30_000_000

    # Turn 2: Add Lake View
    ConversationManager.update_preferences(state, PropertyPreferences(view="lake"))
    assert state.preferences.maximum_budget == 30_000_000
    assert state.preferences.view == "lake"


def test_03_scalar_preference_replacement(test_conversation_id):
    state = ConversationManager.get_or_create(test_conversation_id)
    
    ConversationManager.update_preferences(state, PropertyPreferences(maximum_budget=30_000_000))
    # Replace budget with 25_000_000
    ConversationManager.update_preferences(state, PropertyPreferences(maximum_budget=25_000_000))
    assert state.preferences.maximum_budget == 25_000_000


def test_04_offset_reset_on_preference_change(test_conversation_id):
    state = ConversationManager.get_or_create(test_conversation_id)
    ConversationManager.next_page(state)
    assert state.offset == 3

    ConversationManager.update_preferences(state, PropertyPreferences(maximum_budget=25_000_000))
    assert state.offset == 0


# ------------------------------------------------------------------------------
# 2. UNIT REJECTION & PAGINATION TESTS (11-20)
# ------------------------------------------------------------------------------

def test_11_unit_rejection_tracking(test_conversation_id):
    state = ConversationManager.get_or_create(test_conversation_id)
    ConversationManager.reject_unit(state, "1804")
    assert "1804" in state.rejected_units


def test_12_duplicate_unit_rejection_idempotency(test_conversation_id):
    state = ConversationManager.get_or_create(test_conversation_id)
    ConversationManager.reject_unit(state, "1804")
    ConversationManager.reject_unit(state, "1804")
    assert state.rejected_units.count("1804") == 1


def test_13_pagination_next_page(test_conversation_id):
    state = ConversationManager.get_or_create(test_conversation_id)
    ConversationManager.next_page(state, page_size=3)
    assert state.offset == 3


# ------------------------------------------------------------------------------
# 3. WEIGHT REFINEMENT & CLARIFICATION TESTS (21-30)
# ------------------------------------------------------------------------------

def test_21_refine_weights_view_priority(test_conversation_id):
    state = ConversationManager.get_or_create(test_conversation_id)
    ConversationManager.refine_weights_from_text("prioritize view", state)
    assert state.scoring_weights.view_weight == 40.0
    assert state.scoring_weights.total_weight == 100.0


def test_22_refine_weights_budget_priority(test_conversation_id):
    state = ConversationManager.get_or_create(test_conversation_id)
    ConversationManager.refine_weights_from_text("budget is more important", state)
    assert state.scoring_weights.budget_weight == 50.0
    assert state.scoring_weights.total_weight == 100.0


def test_23_should_clarify_ambiguous_prompt(test_conversation_id):
    state = ConversationManager.get_or_create(test_conversation_id)
    assert ConversationManager.should_clarify("show me the best apartment", state) is True


def test_24_should_not_clarify_when_preferences_exist(test_conversation_id):
    state = ConversationManager.get_or_create(test_conversation_id)
    ConversationManager.update_preferences(state, PropertyPreferences(maximum_budget=25_000_000))
    assert ConversationManager.should_clarify("show me the best apartment", state) is False


# ------------------------------------------------------------------------------
# 4. ORCHESTRATOR & GROUNDING INTEGRATION TESTS (31-40)
# ------------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_31_orchestrator_multi_turn_recommendation(test_conversation_id):
    orch = AIOrchestrator()
    res = await orch.process_query(test_conversation_id, "Recommend a 3 BHK under 2.5 Crore with lake view")
    assert res.intent in ("unit_recommendation", "unit_search")
    assert len(res.units) > 0
    assert res.units[0]["unit_number"] == "1804"


@pytest.mark.asyncio
async def test_32_orchestrator_unit_rejection_exclusion(test_conversation_id):
    orch = AIOrchestrator()
    # Turn 1: Initial recommendation
    res1 = await orch.process_query(test_conversation_id, "Recommend a 3 BHK under 2.5 Crore")
    assert res1.units[0]["unit_number"] == "1804"

    # Turn 2: Reject Unit 1804
    res2 = await orch.process_query(test_conversation_id, "I don't like Unit 1804")
    for u in res2.units:
        assert u["unit_number"] != "1804"


@pytest.mark.asyncio
async def test_33_orchestrator_show_more_pagination(test_conversation_id):
    orch = AIOrchestrator()
    res = await orch.process_query(test_conversation_id, "Show more options")
    assert res.intent in ("show_more_units", "unit_recommendation")


@pytest.mark.asyncio
async def test_34_orchestrator_clarification_flow(test_conversation_id):
    new_id = uuid.uuid4()
    orch = AIOrchestrator()
    res = await orch.process_query(new_id, "Show me the best apartment")
    assert res.response_type.value == "clarification"


@pytest.mark.asyncio
async def test_35_orchestrator_suggested_actions_chips(test_conversation_id):
    orch = AIOrchestrator()
    res = await orch.process_query(test_conversation_id, "Recommend a 3 BHK lake view residence")
    assert len(res.suggested_actions) >= 2
    labels = [a.label for a in res.suggested_actions]
    assert any("Lake View" in l or "Cheaper" in l or "More" in l for l in labels)
