"""Pytest suite for Phase 7.3 AI Orchestrator & Intent Detection Layer."""

import uuid
import pytest
from unittest.mock import AsyncMock

from app.ai.intent_engine import IntentEngine, intent_engine
from app.ai.orchestrator import AIOrchestrator
from app.schemas.ai import AIResponseType


# ── 50+ Query Evaluation Dataset ──────────────────────────────────────────────
EVALUATION_QUERIES = [
    # 1. Project Information
    ("Tell me about Amnaya.", "project_information"),
    ("Who is developing Vision Amnaya?", "project_information"),
    ("How large is the land area of Amnaya?", "project_information"),
    ("How many total units are planned in the project?", "project_information"),
    ("What is the overview of Vision Amnaya?", "project_information"),

    # 2. Location Information
    ("Where is Amnaya located?", "location_information"),
    ("Is Khajaguda close to Raidurg IT corridor?", "location_information"),
    ("Show me the location details of Cyberabad.", "location_information"),

    # 3. Amenity Information
    ("What amenities are available?", "amenity_information"),
    ("Does Amnaya have a swimming pool and clubhouse?", "amenity_information"),
    ("Is there a 2-acre central park garden?", "amenity_information"),

    # 4. Specification Information
    ("What are the main door specifications?", "specification_information"),
    ("What flooring tiles are used in living rooms?", "specification_information"),
    ("Are the windows high-grade aluminium?", "specification_information"),

    # 5. Unit Search & Recommendation
    ("Do you have 3BHK apartments?", "unit_search"),
    ("Which 3BHK would you recommend for me?", "unit_recommendation"),
    ("Show me available lake-facing 3 BHK units.", "unit_search"),
    ("Recommend a spacious 3BHK with a high floor view.", "unit_recommendation"),
    ("Suggest the best apartment for a family.", "unit_recommendation"),

    # 6. Unit Comparison
    ("Compare 1804 and 1601.", "unit_comparison"),
    ("What is the difference between 1804 vs 1601?", "unit_comparison"),
    ("Compare unit 2202 and unit 1802.", "unit_comparison"),

    # 7. Floor Plan Information & Navigation
    ("Show me the floor plan for 3 BHK Type B.", "floor_plan_information"),
    ("What are the dimensions of the master bedroom?", "floor_plan_information"),
    ("Navigate to interactive floor plan viewer.", "floor_plan_information"),

    # 8. Pricing & Availability
    ("What is the price of a 3 BHK?", "pricing_information"),
    ("How much does a 2100 sqft apartment cost?", "pricing_information"),
    ("Is unit 1804 currently available?", "availability_information"),

    # 9. Finance & EMI Calculation
    ("Can I get an EMI estimate?", "emi_calculation"),
    ("Calculate monthly payment for home loan.", "emi_calculation"),
    ("What is the payment schedule?", "pricing_information"),

    # 10. Site Visit & Lead Capture
    ("I would like to visit the property this Sunday.", "site_visit"),
    ("Schedule a private site visit for me.", "site_visit"),
    ("Can someone call me back regarding sales?", "lead_capture"),
    ("Have a sales agent contact my phone.", "lead_capture"),

    # 11. Unsupported & Out-of-Scope Requests
    ("Write a Python program for me.", "unsupported_request"),
    ("Who won the recent election?", "unsupported_request"),
    ("Can you code a JavaScript script?", "unsupported_request"),

    # 12. General Conversation & Ambiguous
    ("Hello there!", "general_conversation"),
    ("Good morning AI consultant.", "general_conversation"),
]


def test_intent_classification_accuracy():
    """Evaluate intent classification accuracy over the 40+ query test suite."""
    correct = 0
    total = len(EVALUATION_QUERIES)

    for query, expected_intent in EVALUATION_QUERIES:
        res = intent_engine.classify(query)
        if res.intent == expected_intent:
            correct += 1
        else:
            print(f"Mismatch: '{query}' -> got '{res.intent}', expected '{expected_intent}'")

    accuracy = correct / total
    print(f"Intent Classification Accuracy: {accuracy * 100:.1f}% ({correct}/{total})")
    assert accuracy >= 0.95


def test_budget_normalization_engine():
    """Verify budget strings normalize to exact INR values."""
    b1, min1, max1 = IntentEngine.normalize_budget("My budget is under 3 crore")
    assert max1 == 30_000_000

    b2, min2, max2 = IntentEngine.normalize_budget("Around 2.5 crore")
    assert b2 == 25_000_000

    b3, min3, max3 = IntentEngine.normalize_budget("Looking for 250 lakhs")
    assert b3 == 25_000_000

    b4, min4, max4 = IntentEngine.normalize_budget("Between 2 and 3 crore")
    assert min4 == 20_000_000
    assert max4 == 30_000_000


def test_area_normalization_engine():
    """Verify area strings normalize to sq ft values."""
    a1, min1, max1 = IntentEngine.normalize_area("Around 2000 sq ft")
    assert a1 == 2000

    a2, min2, max2 = IntentEngine.normalize_area("At least 2200 sqft")
    assert min2 == 2200

    a3, min3, max3 = IntentEngine.normalize_area("Between 1800 and 2500 sq ft")
    assert min3 == 1800
    assert max3 == 2500


def test_unit_id_extraction():
    """Verify 4-digit unit IDs are extracted accurately."""
    u_ids = IntentEngine.extract_unit_ids("Compare residence 1804 and unit 1601")
    assert "1804" in u_ids
    assert "1601" in u_ids


def test_multi_turn_preference_accumulation():
    """Verify preferences accumulate across multi-turn conversation history."""
    history = [
        {"role": "user", "content": "I am looking for a 3 BHK apartment"},
        {"role": "assistant", "content": "Would you prefer a lake view?"},
        {"role": "user", "content": "Yes, lake view and under 3 crore budget"},
    ]

    prefs = intent_engine.extract_preferences("Preferably a higher floor", history=history)
    assert prefs.configuration == "3BHK"
    assert prefs.view == "lake"
    assert prefs.maximum_budget == 30_000_000
    assert prefs.floor_preference == "high"


@pytest.mark.asyncio
async def test_orchestrator_routing_and_unsupported_redirection():
    """Verify AIOrchestrator routes unsupported queries to polite redirection."""
    orchestrator = AIOrchestrator()
    conv_id = uuid.uuid4()

    # Out-of-scope query
    res = await orchestrator.process_query(conv_id, "Write a Python script for me")
    assert res.intent == "unsupported_request"
    assert res.response_type == AIResponseType.CLARIFICATION
    assert "Amnaya" in res.message

    # Site visit query
    visit_res = await orchestrator.process_query(conv_id, "I would like to visit the property this Sunday")
    assert visit_res.intent == "site_visit"
    assert visit_res.response_type == AIResponseType.SITE_VISIT
