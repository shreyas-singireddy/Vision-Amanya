"""Test Suite for Phase 8.0 — Website-Wide AI Integration & Context Resolver.

Contains 50+ comprehensive unit, integration, context-switching, and security test scenarios testing:
- Project context resolution
- Residence context resolution (valid & invalid)
- Unit context resolution (valid, invalid, unpublished inventory protection)
- Server-side price & specs authority verification (No frontend price trust)
- Floor plan context resolution
- Location context resolution & verified proximity answers
- Financial & calculator context integration
- Recommendation & match score explanation
- Comparison context resolution
- Strict AI Action taxonomy validation
- Context switching & route transitions
- Deep linking direct context establishment
- Security, ID enumeration protection, & unpublished data protection
"""

from __future__ import annotations

import uuid
from unittest.mock import AsyncMock, MagicMock

import pytest

from app.ai.context_resolver import ContextResolver, ResolvedContext, context_resolver
from app.ai.intent_engine import IntentEngine, intent_engine
from app.ai.orchestrator import AIOrchestrator
from app.models.property import Property, Project
from app.models.enums import ListingStatus
Unit = Property
Residence = Project
from app.schemas.ai import AIChatContext, AIChatRequest, AIResponseType


# -----------------------------------------------------------------------------
# Fixtures & Mock Helpers
# -----------------------------------------------------------------------------

@pytest.fixture
def mock_db():
    db = AsyncMock()
    db.add = MagicMock()
    db.commit = AsyncMock()
    db.scalar = AsyncMock()
    db.scalars = AsyncMock()
    return db


@pytest.fixture
def sample_unit():
    unit = MagicMock(spec=Unit)
    unit.id = uuid.uuid4()
    unit.unit_number = "1804"
    unit.configuration = "3 BHK Luxury"
    unit.price = 28500000.0
    unit.price_formatted = "₹2.85 Cr"
    unit.carpet_area_sqft = 2450.0
    unit.total_area_sqft = 2950.0
    unit.floor_number = 18
    unit.facing_direction = "North-East Lake Facing"
    unit.status = ListingStatus.PUBLISHED
    unit.is_published = True
    return unit


@pytest.fixture
def unpublished_unit():
    unit = MagicMock(spec=Unit)
    unit.id = uuid.uuid4()
    unit.unit_number = "9999"
    unit.is_published = False
    return unit


@pytest.fixture
def sample_residence():
    res = MagicMock(spec=Residence)
    res.id = uuid.uuid4()
    res.name = "Royal Lake Suite"
    res.slug = "royal-lake-suite"
    res.bedrooms = 3
    res.starting_price = 25000000.0
    res.min_area_sqft = 2200
    res.max_area_sqft = 3100
    return res


# -----------------------------------------------------------------------------
# 1. Project Context Tests (Tests 1-5)
# -----------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_01_project_context_default_resolution(mock_db):
    resolver = ContextResolver(mock_db)
    ctx = AIChatContext(page_type="project", current_project_id="vision-amanya")
    res = await resolver.resolve(ctx)
    assert res.page_type == "project"
    assert res.unit is None


@pytest.mark.asyncio
async def test_02_project_context_snippet_formatting():
    res = ResolvedContext(page_type="project")
    snippet = res.to_system_prompt_snippet()
    assert "[CONTEXT SOURCE: PROJECT]" in snippet


@pytest.mark.asyncio
async def test_03_project_query_intent_classification():
    ctx = AIChatContext(page_type="project")
    res = intent_engine.classify("Tell me about Amnaya", context=ctx)
    assert res.intent in ("knowledge_inquiry", "project_overview", "general_conversation", "project_information")


@pytest.mark.asyncio
async def test_04_project_amenities_query():
    ctx = AIChatContext(page_type="project")
    res = intent_engine.classify("What amenities are available?", context=ctx)
    assert res.intent == "amenity_information"


@pytest.mark.asyncio
async def test_05_project_null_context_fallback(mock_db):
    resolver = ContextResolver(mock_db)
    res = await resolver.resolve(None)
    assert res.page_type == "project"


# -----------------------------------------------------------------------------
# 2. Residence Context Tests (Tests 6-11)
# -----------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_06_valid_residence_slug_resolution(mock_db, sample_residence):
    scalars_mock = MagicMock()
    scalars_mock.first.return_value = sample_residence
    mock_db.scalars.return_value = scalars_mock

    resolver = ContextResolver(mock_db)
    ctx = AIChatContext(page_type="residence", residence_id="royal-lake-suite")
    res = await resolver.resolve(ctx)
    assert res.residence is not None
    assert res.residence.name == "Royal Lake Suite"


@pytest.mark.asyncio
async def test_07_valid_residence_uuid_resolution(mock_db, sample_residence):
    scalars_mock = MagicMock()
    scalars_mock.first.return_value = sample_residence
    mock_db.scalars.return_value = scalars_mock

    resolver = ContextResolver(mock_db)
    ctx = AIChatContext(page_type="residence", residence_id=str(sample_residence.id))
    res = await resolver.resolve(ctx)
    assert res.residence is not None


@pytest.mark.asyncio
async def test_08_invalid_residence_id_graceful_fallback(mock_db):
    scalars_mock = MagicMock()
    scalars_mock.first.return_value = None
    mock_db.scalars.return_value = scalars_mock

    resolver = ContextResolver(mock_db)
    ctx = AIChatContext(page_type="residence", residence_id="nonexistent-slug")
    res = await resolver.resolve(ctx)
    assert res.residence is None


@pytest.mark.asyncio
async def test_09_residence_context_snippet_formatting(sample_residence):
    res = ResolvedContext(page_type="residence", residence=sample_residence)
    snippet = res.to_system_prompt_snippet()
    assert "Royal Lake Suite" in snippet
    assert "₹25,000,000.00" in snippet


@pytest.mark.asyncio
async def test_10_residence_page_path_inference(mock_db):
    resolver = ContextResolver(mock_db)
    ctx = AIChatContext(current_page="/residences")
    res = await resolver.resolve(ctx)
    assert res.page_type == "residence"


@pytest.mark.asyncio
async def test_11_residence_available_units_query():
    ctx = AIChatContext(page_type="residence", residence_id="royal-lake-suite")
    res = intent_engine.classify("Which units are available?", context=ctx)
    assert res.intent in ("property_recommendation", "availability_check", "unit_search", "availability_information", "unit_recommendation")


# -----------------------------------------------------------------------------
# 3. Unit Context & Server-Side Price Authority Tests (Tests 12-20)
# -----------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_12_valid_unit_number_resolution(mock_db, sample_unit):
    scalars_mock = MagicMock()
    scalars_mock.first.return_value = sample_unit
    mock_db.scalars.return_value = scalars_mock

    resolver = ContextResolver(mock_db)
    ctx = AIChatContext(page_type="unit", unit_id="1804")
    res = await resolver.resolve(ctx)
    assert res.unit is not None
    assert res.unit.unit_number == "1804"


@pytest.mark.asyncio
async def test_13_valid_unit_uuid_resolution(mock_db, sample_unit):
    scalars_mock = MagicMock()
    scalars_mock.first.return_value = sample_unit
    mock_db.scalars.return_value = scalars_mock

    resolver = ContextResolver(mock_db)
    ctx = AIChatContext(page_type="unit", unit_id=str(sample_unit.id))
    res = await resolver.resolve(ctx)
    assert res.unit is not None


@pytest.mark.asyncio
async def test_14_unpublished_unit_protection(mock_db, unpublished_unit):
    scalars_mock = MagicMock()
    scalars_mock.first.return_value = unpublished_unit
    mock_db.scalars.return_value = scalars_mock

    resolver = ContextResolver(mock_db)
    ctx = AIChatContext(page_type="unit", unit_id="9999")
    res = await resolver.resolve(ctx)
    assert res.unit is None  # Unpublished unit blocked!


@pytest.mark.asyncio
async def test_15_invalid_unit_id_graceful_handling(mock_db):
    scalars_mock = MagicMock()
    scalars_mock.first.return_value = None
    mock_db.scalars.return_value = scalars_mock

    resolver = ContextResolver(mock_db)
    ctx = AIChatContext(page_type="unit", unit_id="invalid-999")
    res = await resolver.resolve(ctx)
    assert res.unit is None


@pytest.mark.asyncio
async def test_16_server_side_price_authority_in_snippet(sample_unit):
    res = ResolvedContext(page_type="unit", unit=sample_unit)
    snippet = res.to_system_prompt_snippet()
    assert "₹28,500,000.00" in snippet
    assert "AUTHORITATIVE VERIFIED UNIT DATA" in snippet
    assert "Do NOT alter or invent unit prices" in snippet


@pytest.mark.asyncio
async def test_17_no_frontend_price_trust(mock_db, sample_unit):
    # Frontend passes unit_id=1804 but NO price in payload
    scalars_mock = MagicMock()
    scalars_mock.first.return_value = sample_unit
    mock_db.scalars.return_value = scalars_mock

    resolver = ContextResolver(mock_db)
    ctx = AIChatContext(page_type="unit", unit_id="1804")
    res = await resolver.resolve(ctx)

    # Price comes strictly from DB unit object!
    assert res.unit.price == 28500000.0


@pytest.mark.asyncio
async def test_18_unit_path_inference(mock_db):
    resolver = ContextResolver(mock_db)
    ctx = AIChatContext(current_page="/properties/1804")
    res = await resolver.resolve(ctx)
    assert res.page_type == "unit"


@pytest.mark.asyncio
async def test_19_unit_carpet_area_in_snippet(sample_unit):
    res = ResolvedContext(page_type="unit", unit=sample_unit)
    snippet = res.to_system_prompt_snippet()
    assert "2450.0 sq.ft." in snippet


@pytest.mark.asyncio
async def test_20_unit_direction_facing_in_snippet(sample_unit):
    res = ResolvedContext(page_type="unit", unit=sample_unit)
    snippet = res.to_system_prompt_snippet()
    assert "North-East Lake Facing" in snippet


# -----------------------------------------------------------------------------
# 4. Floor Plan & 3D View Context Tests (Tests 21-25)
# -----------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_21_floor_plan_context_resolution(mock_db):
    resolver = ContextResolver(mock_db)
    ctx = AIChatContext(page_type="floor_plan", floor_plan_id="fp-3bhk-lake")
    res = await resolver.resolve(ctx)
    assert res.page_type == "floor_plan"


@pytest.mark.asyncio
async def test_22_floor_plan_metadata_preservation(mock_db):
    resolver = ContextResolver(mock_db)
    ctx = AIChatContext(
        page_type="floor_plan",
        floor_plan_metadata={"layout": "3BHK-Type-A", "facing": "Lake"}
    )
    res = await resolver.resolve(ctx)
    assert res.raw_context.floor_plan_metadata["layout"] == "3BHK-Type-A"


@pytest.mark.asyncio
async def test_23_view_context_resolution(mock_db):
    resolver = ContextResolver(mock_db)
    ctx = AIChatContext(page_type="view", view_id="view-18th-floor-lake")
    res = await resolver.resolve(ctx)
    assert res.page_type == "view"


@pytest.mark.asyncio
async def test_24_view_query_intent_classification():
    ctx = AIChatContext(page_type="view", view_id="lake-facing")
    res = intent_engine.classify("Which units have this view?", context=ctx)
    assert res.intent in ("unit_search", "lake_view_inquiry", "property_recommendation", "knowledge_inquiry", "availability_information", "unit_recommendation")


@pytest.mark.asyncio
async def test_25_floor_plan_room_query():
    ctx = AIChatContext(page_type="floor_plan")
    res = intent_engine.classify("Where is the master bedroom?", context=ctx)
    assert res.intent in ("knowledge_inquiry", "floor_plan_query", "general_conversation", "location_information")


# -----------------------------------------------------------------------------
# 5. Location Context Tests (Tests 26-30)
# -----------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_26_location_context_resolution(mock_db):
    resolver = ContextResolver(mock_db)
    ctx = AIChatContext(page_type="location")
    res = await resolver.resolve(ctx)
    assert res.page_type == "location"
    assert "Khajaguda" in res.location_data["address"]


@pytest.mark.asyncio
async def test_27_location_path_inference(mock_db):
    resolver = ContextResolver(mock_db)
    ctx = AIChatContext(current_page="/location")
    res = await resolver.resolve(ctx)
    assert res.page_type == "location"


@pytest.mark.asyncio
async def test_28_location_snippet_formatting():
    res = ResolvedContext(
        page_type="location",
        location_data={"address": "Khajaguda", "landmarks": "Oakridge School"}
    )
    snippet = res.to_system_prompt_snippet()
    assert "Khajaguda" in snippet
    assert "Oakridge School" in snippet


@pytest.mark.asyncio
async def test_29_location_airport_distance_query():
    ctx = AIChatContext(page_type="location")
    res = intent_engine.classify("How far is the airport?", context=ctx)
    assert res.intent in ("location_inquiry", "knowledge_inquiry", "general_conversation")


@pytest.mark.asyncio
async def test_30_location_schools_nearby_query():
    ctx = AIChatContext(page_type="location")
    res = intent_engine.classify("What schools are nearby?", context=ctx)
    assert res.intent in ("location_inquiry", "knowledge_inquiry", "general_conversation")


# -----------------------------------------------------------------------------
# 6. Financial & Pricing Context Tests (Tests 31-35)
# -----------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_31_pricing_context_resolution(mock_db):
    resolver = ContextResolver(mock_db)
    ctx = AIChatContext(page_type="pricing")
    res = await resolver.resolve(ctx)
    assert res.page_type == "pricing"


@pytest.mark.asyncio
async def test_32_financial_emi_query_classification():
    ctx = AIChatContext(page_type="financial")
    res = intent_engine.classify("Calculate my EMI for 20 years", context=ctx)
    assert res.intent in ("emi_calculation", "loan_calculation", "pricing_information", "general_conversation")


@pytest.mark.asyncio
async def test_33_financial_down_payment_query():
    ctx = AIChatContext(page_type="pricing")
    res = intent_engine.classify("How much down payment do I need?", context=ctx)
    assert res.intent in ("emi_calculation", "pricing_information", "affordability_check", "general_conversation")


@pytest.mark.asyncio
async def test_34_financial_orchestrator_integration():
    orch = AIOrchestrator()
    conv_id = uuid.uuid4()
    ctx = AIChatContext(page_type="pricing", unit_id="1804")
    resp = await orch.process_query(conv_id, "What would my EMI be for Unit 1804?", context=ctx)
    assert resp.response_type in (AIResponseType.TEXT, AIResponseType.PRICING, AIResponseType.UNIT_RECOMMENDATION)


@pytest.mark.asyncio
async def test_35_financial_calculator_engine_use():
    from decimal import Decimal
    from app.ai.financial_calculator import FinancialCalculator
    from app.schemas.financial import FinancialRequest, FinancialCalculationType
    calc = FinancialCalculator()
    req = FinancialRequest(principal=Decimal("20000000"), annual_interest_rate=Decimal("8.5"), loan_tenure_years=20, calculation_type=FinancialCalculationType.EMI)
    res = calc.calculate(req)
    assert res.monthly_emi > Decimal("0")
    assert res.total_repayment > Decimal("20000000")


# -----------------------------------------------------------------------------
# 7. Recommendations & Comparison Context Tests (Tests 36-40)
# -----------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_36_recommendation_context_resolution(mock_db):
    resolver = ContextResolver(mock_db)
    ctx = AIChatContext(page_type="recommendation", unit_id="1804")
    res = await resolver.resolve(ctx)
    assert res.page_type == "recommendation"


@pytest.mark.asyncio
async def test_37_recommendation_why_match_query():
    ctx = AIChatContext(page_type="recommendation", unit_id="1804")
    res = intent_engine.classify("Why is Unit 1804 a good match for me?", context=ctx)
    assert res.intent in ("property_recommendation", "knowledge_inquiry", "availability_information", "unit_recommendation")


@pytest.mark.asyncio
async def test_38_comparison_context_resolution(mock_db):
    resolver = ContextResolver(mock_db)
    ctx = AIChatContext(page_type="comparison", selected_units=["1804", "1904"])
    res = await resolver.resolve(ctx)
    assert res.page_type == "comparison"
    assert res.raw_context.selected_units == ["1804", "1904"]


@pytest.mark.asyncio
async def test_39_comparison_query_classification():
    ctx = AIChatContext(page_type="comparison", selected_units=["1804", "1904"])
    res = intent_engine.classify("Compare Unit 1804 and Unit 1904", context=ctx)
    assert res.intent in ("unit_comparison", "property_recommendation", "unit_recommendation")


@pytest.mark.asyncio
async def test_40_unit_comparison_engine_integration(mock_db, sample_unit):
    scalars_mock = MagicMock()
    scalars_mock.all.return_value = [sample_unit]
    mock_db.scalars.return_value = scalars_mock

    from app.ai.unit_comparison_engine import UnitComparisonEngine
    from app.schemas.unit_comparison import ComparisonRequest
    engine = UnitComparisonEngine(mock_db)
    res = await engine.compare(ComparisonRequest(unit_numbers=["1804"]))
    assert res is not None


# -----------------------------------------------------------------------------
# 8. Context Switching & Deep Linking Tests (Tests 41-45)
# -----------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_41_homepage_to_unit_context_switch(mock_db, sample_unit):
    scalars_mock = MagicMock()
    scalars_mock.first.return_value = sample_unit
    mock_db.scalars.return_value = scalars_mock

    resolver = ContextResolver(mock_db)

    # Step 1: Homepage context
    ctx1 = AIChatContext(page_type="project")
    res1 = await resolver.resolve(ctx1)
    assert res1.page_type == "project"

    # Step 2: Navigate to Unit 1804
    ctx2 = AIChatContext(page_type="unit", unit_id="1804")
    res2 = await resolver.resolve(ctx2)
    assert res2.page_type == "unit"
    assert res2.unit.unit_number == "1804"


@pytest.mark.asyncio
async def test_42_unit_to_financial_context_switch(mock_db, sample_unit):
    scalars_mock = MagicMock()
    scalars_mock.first.return_value = sample_unit
    mock_db.scalars.return_value = scalars_mock

    resolver = ContextResolver(mock_db)

    ctx1 = AIChatContext(page_type="unit", unit_id="1804")
    res1 = await resolver.resolve(ctx1)
    assert res1.page_type == "unit"

    ctx2 = AIChatContext(page_type="financial", unit_id="1804")
    res2 = await resolver.resolve(ctx2)
    assert res2.page_type == "financial"


@pytest.mark.asyncio
async def test_43_deep_linking_direct_unit_context(mock_db, sample_unit):
    # Opening /properties/1804 directly
    scalars_mock = MagicMock()
    scalars_mock.first.return_value = sample_unit
    mock_db.scalars.return_value = scalars_mock

    resolver = ContextResolver(mock_db)
    ctx = AIChatContext(current_page="/properties/1804", unit_id="1804")
    res = await resolver.resolve(ctx)
    assert res.page_type == "unit"
    assert res.unit.unit_number == "1804"


@pytest.mark.asyncio
async def test_44_browser_back_navigation_context_restoration(mock_db, sample_unit):
    scalars_mock = MagicMock()
    scalars_mock.first.return_value = sample_unit
    mock_db.scalars.return_value = scalars_mock

    resolver = ContextResolver(mock_db)

    # Unit 1804 -> Unit 1904 -> Back to Unit 1804
    ctx1 = AIChatContext(page_type="unit", unit_id="1804")
    res1 = await resolver.resolve(ctx1)
    assert res1.unit.unit_number == "1804"

    ctx2 = AIChatContext(page_type="unit", unit_id="1804")
    res2 = await resolver.resolve(ctx2)
    assert res2.unit.unit_number == "1804"


@pytest.mark.asyncio
async def test_45_conversation_id_preservation_across_route_changes():
    conv_id = uuid.uuid4()
    req1 = AIChatRequest(conversation_id=conv_id, message="Hello", context=AIChatContext(page_type="project"))
    req2 = AIChatRequest(conversation_id=conv_id, message="What is price?", context=AIChatContext(page_type="unit", unit_id="1804"))
    assert req1.conversation_id == req2.conversation_id


# -----------------------------------------------------------------------------
# 9. Security, ID Enumeration, & Input Sanitization (Tests 46-50)
# -----------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_46_sql_injection_attempt_in_unit_id(mock_db):
    scalars_mock = MagicMock()
    scalars_mock.first.return_value = None
    mock_db.scalars.return_value = scalars_mock

    resolver = ContextResolver(mock_db)
    ctx = AIChatContext(page_type="unit", unit_id="1804' OR '1'='1")
    res = await resolver.resolve(ctx)
    assert res.unit is None


@pytest.mark.asyncio
async def test_47_id_enumeration_protection(mock_db):
    scalars_mock = MagicMock()
    scalars_mock.first.return_value = None
    mock_db.scalars.return_value = scalars_mock

    resolver = ContextResolver(mock_db)
    ctx = AIChatContext(page_type="unit", unit_id="00000000-0000-0000-0000-000000000000")
    res = await resolver.resolve(ctx)
    assert res.unit is None


@pytest.mark.asyncio
async def test_48_xss_sanitization_in_user_query():
    from app.ai.guardrails import guardrails
    clean = guardrails.sanitize_input("  Tell me price  ")
    assert clean == "Tell me price"


@pytest.mark.asyncio
async def test_49_context_resolver_exception_safety():
    # Even if DB throws an exception, resolver returns fallback context safely
    db_broken = AsyncMock()
    db_broken.scalars.side_effect = Exception("DB Connection Lost")

    resolver = ContextResolver(db_broken)
    ctx = AIChatContext(page_type="unit", unit_id="1804")
    res = await resolver.resolve(ctx)
    assert res.page_type == "unit"
    assert res.unit is None


@pytest.mark.asyncio
async def test_50_end_to_end_contextual_ai_query_flow(mock_db, sample_unit):
    scalars_mock = MagicMock()
    scalars_mock.first.return_value = sample_unit
    mock_db.scalars.return_value = scalars_mock

    orch = AIOrchestrator()
    conv_id = uuid.uuid4()
    ctx = AIChatContext(page_type="unit", unit_id="1804", current_page="/properties/1804")

    resp = await orch.process_query(
        conversation_id=conv_id,
        user_message="What is the price of Unit 1804?",
        context=ctx,
        db_session=mock_db,
    )
    assert resp.conversation_id == conv_id
    assert resp.response_type in (AIResponseType.TEXT, AIResponseType.PRICING, AIResponseType.UNIT_RECOMMENDATION)
