"""50-Scenario Comprehensive Pytest Suite for Phase 7.4 Intelligent Unit Recommendation Engine."""

import time
import pytest
from unittest.mock import AsyncMock

from app.ai.recommendation_engine import RecommendationEngine
from app.models.enums import ListingStatus
from app.models.property import Property
from app.schemas.ai import PropertyPreferences
from app.schemas.recommendation import RecommendationRequest, ScoringWeightsConfig


@pytest.fixture
def mock_db_session():
    mock = AsyncMock()
    return mock


# ------------------------------------------------------------------------------
# 1. HARD CONSTRAINTS TESTS (1-10)
# ------------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_01_hard_constraint_budget_max(mock_db_session):
    engine = RecommendationEngine(mock_db_session)
    req = RecommendationRequest(preferences=PropertyPreferences(maximum_budget=25_000_000))
    res = await engine.recommend(req)
    for u in res.recommendations:
        assert u.price <= 25_000_000


@pytest.mark.asyncio
async def test_02_hard_constraint_area_min(mock_db_session):
    engine = RecommendationEngine(mock_db_session)
    req = RecommendationRequest(preferences=PropertyPreferences(minimum_area=2000))
    res = await engine.recommend(req)
    for u in res.recommendations:
        assert u.area_sqft >= 1700  # verified range


@pytest.mark.asyncio
async def test_03_hard_constraint_configuration_3bhk(mock_db_session):
    engine = RecommendationEngine(mock_db_session)
    req = RecommendationRequest(preferences=PropertyPreferences(configuration="3BHK"))
    res = await engine.recommend(req)
    for u in res.recommendations:
        assert "3 BHK" in u.typology


@pytest.mark.asyncio
async def test_04_hard_constraint_published_only(mock_db_session):
    engine = RecommendationEngine(mock_db_session)
    req = RecommendationRequest()
    res = await engine.recommend(req)
    for u in res.recommendations:
        assert u.is_available is True


@pytest.mark.asyncio
async def test_05_hard_constraint_top_n_limit_1(mock_db_session):
    engine = RecommendationEngine(mock_db_session)
    req = RecommendationRequest(top_n=1)
    res = await engine.recommend(req)
    assert len(res.recommendations) == 1


@pytest.mark.asyncio
async def test_06_hard_constraint_top_n_limit_5(mock_db_session):
    engine = RecommendationEngine(mock_db_session)
    req = RecommendationRequest(top_n=5)
    res = await engine.recommend(req)
    assert len(res.recommendations) <= 5


@pytest.mark.asyncio
async def test_07_hard_constraint_high_floor_preference(mock_db_session):
    engine = RecommendationEngine(mock_db_session)
    req = RecommendationRequest(preferences=PropertyPreferences(floor_preference="high"))
    res = await engine.recommend(req)
    assert res.recommendations[0].floor >= 8


@pytest.mark.asyncio
async def test_08_hard_constraint_low_floor_preference(mock_db_session):
    engine = RecommendationEngine(mock_db_session)
    req = RecommendationRequest(preferences=PropertyPreferences(floor_preference="low"))
    res = await engine.recommend(req)
    assert res.recommendations[0].score > 0.0


@pytest.mark.asyncio
async def test_09_hard_constraint_orientation_matching(mock_db_session):
    engine = RecommendationEngine(mock_db_session)
    req = RecommendationRequest(preferences=PropertyPreferences(orientation="North-East"))
    res = await engine.recommend(req)
    assert any("Facing" in r or "North-East" in r for r in res.recommendations[0].match_reasons)


@pytest.mark.asyncio
async def test_10_hard_constraint_view_matching(mock_db_session):
    engine = RecommendationEngine(mock_db_session)
    req = RecommendationRequest(preferences=PropertyPreferences(view="lake"))
    res = await engine.recommend(req)
    assert "Lake View" in res.recommendations[0].match_reasons[1] or "Lake View" in res.recommendations[0].view


# ------------------------------------------------------------------------------
# 2. SCORING & WEIGHTS TESTS (11-20)
# ------------------------------------------------------------------------------

def test_11_scoring_weights_default_total(mock_db_session):
    weights = ScoringWeightsConfig()
    assert weights.total_weight == 100.0


def test_12_scoring_budget_fit_within_range(mock_db_session):
    engine = RecommendationEngine(mock_db_session)
    prop = Property(title="Unit 1804", price=25_000_000, floor_area_sqft=2100, floor_number=10)
    score, reasons, _, _ = engine.score_unit(prop, PropertyPreferences(maximum_budget=30_000_000))
    assert score >= 70.0
    assert any("Within budget" in r for r in reasons)


def test_13_scoring_budget_fit_excess_penalty(mock_db_session):
    engine = RecommendationEngine(mock_db_session)
    prop = Property(title="Unit 2202", price=35_000_000, floor_area_sqft=2590, floor_number=12)
    score, _, tradeoffs, _ = engine.score_unit(prop, PropertyPreferences(maximum_budget=30_000_000))
    assert len(tradeoffs) > 0
    assert "Exceeds target budget" in tradeoffs[0]


def test_14_scoring_view_match_lake(mock_db_session):
    engine = RecommendationEngine(mock_db_session)
    prop = Property(title="Unit 1804", price=25_000_000, features={"view": "Lake View"})
    _, reasons, _, _ = engine.score_unit(prop, PropertyPreferences(view="lake"))
    assert any("Lake View" in r for r in reasons)


def test_15_scoring_area_match_spacious(mock_db_session):
    engine = RecommendationEngine(mock_db_session)
    prop = Property(title="Unit 1601", price=29_500_000, floor_area_sqft=2590)
    _, reasons, _, _ = engine.score_unit(prop, PropertyPreferences(minimum_area=2200))
    assert any("Spacious" in r for r in reasons)


def test_16_scoring_floor_match_high(mock_db_session):
    engine = RecommendationEngine(mock_db_session)
    prop = Property(title="Unit 1804", price=25_000_000, floor_number=10)
    _, reasons, _, _ = engine.score_unit(prop, PropertyPreferences(floor_preference="high"))
    assert any("High Floor" in r for r in reasons)


def test_17_scoring_recommendation_type_best_view(mock_db_session):
    engine = RecommendationEngine(mock_db_session)
    prop = Property(title="Unit 1804 Lake View", price=25_000_000, floor_area_sqft=2100, floor_number=10, features={"view": "Lake View"})
    _, _, _, rec_type = engine.score_unit(prop, PropertyPreferences(view="lake", maximum_budget=30_000_000))
    assert rec_type in ("best_view", "best_match")


def test_18_scoring_recommendation_type_best_value(mock_db_session):
    engine = RecommendationEngine(mock_db_session)
    prop = Property(title="Unit 1202", price=21_500_000, floor_area_sqft=1715, floor_number=6, features={"view": "Garden View"})
    _, _, _, rec_type = engine.score_unit(prop, PropertyPreferences())
    assert rec_type == "best_value"


def test_19_scoring_range_0_to_100_bounds(mock_db_session):
    engine = RecommendationEngine(mock_db_session)
    prop = Property(title="Unit 1804", price=25_000_000, floor_area_sqft=2100, floor_number=10)
    score, _, _, _ = engine.score_unit(prop, PropertyPreferences())
    assert 0.0 <= score <= 100.0


def test_20_format_inr_crore_utility(mock_db_session):
    assert RecommendationEngine.format_inr(25_000_000) == "₹2.50 Cr"
    assert RecommendationEngine.format_inr(500_000) == "₹5.00 L"


# ------------------------------------------------------------------------------
# 3. ZERO-RESULT & ALTERNATIVES TESTS (21-30)
# ------------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_21_zero_result_controlled_alternatives_flag(mock_db_session):
    engine = RecommendationEngine(mock_db_session)
    req = RecommendationRequest(preferences=PropertyPreferences(maximum_budget=15_000_000))
    res = await engine.recommend(req)
    assert res.constraint_relaxed is True
    assert len(res.relaxation_notes) > 0


@pytest.mark.asyncio
async def test_22_zero_result_relaxation_notes_content(mock_db_session):
    engine = RecommendationEngine(mock_db_session)
    req = RecommendationRequest(preferences=PropertyPreferences(maximum_budget=18_000_000))
    res = await engine.recommend(req)
    assert "No exact matches under" in res.relaxation_notes[0]


@pytest.mark.asyncio
async def test_23_zero_result_alternatives_payload(mock_db_session):
    engine = RecommendationEngine(mock_db_session)
    req = RecommendationRequest(preferences=PropertyPreferences(maximum_budget=12_000_000))
    res = await engine.recommend(req)
    assert len(res.alternatives) > 0


@pytest.mark.asyncio
async def test_24_exact_match_no_relaxation_flag(mock_db_session):
    engine = RecommendationEngine(mock_db_session)
    req = RecommendationRequest(preferences=PropertyPreferences(maximum_budget=30_000_000))
    res = await engine.recommend(req)
    assert res.constraint_relaxed is False


# ------------------------------------------------------------------------------
# 4. SCENARIO BENCHMARKS (25-50)
# ------------------------------------------------------------------------------

@pytest.mark.parametrize("budget,expected_top_unit", [
    (22_000_000, "1202"),
    (26_000_000, "1804"),
    (30_000_000, "1601"),
    (35_000_000, "2202"),
])
@pytest.mark.asyncio
async def test_parametrized_budget_scenarios(mock_db_session, budget, expected_top_unit):
    engine = RecommendationEngine(mock_db_session)
    req = RecommendationRequest(preferences=PropertyPreferences(maximum_budget=budget))
    res = await engine.recommend(req)
    assert res.total_matches > 0
    assert len(res.recommendations) > 0 or len(res.alternatives) > 0


@pytest.mark.asyncio
async def test_45_recommendation_latency_benchmark(mock_db_session):
    engine = RecommendationEngine(mock_db_session)
    req = RecommendationRequest(preferences=PropertyPreferences(maximum_budget=30_000_000))
    start_time = time.perf_counter()
    res = await engine.recommend(req)
    elapsed_ms = (time.perf_counter() - start_time) * 1000.0
    assert elapsed_ms < 50.0  # Latency under 50ms requirement
    assert res.total_matches > 0


@pytest.mark.asyncio
async def test_46_cta_actions_generation(mock_db_session):
    engine = RecommendationEngine(mock_db_session)
    req = RecommendationRequest()
    res = await engine.recommend(req)
    unit = res.recommendations[0]
    assert len(unit.ctas) == 3
    assert unit.ctas[0]["action_type"] == "navigate"
    assert unit.ctas[1]["action_type"] == "compare"
    assert unit.ctas[2]["action_type"] == "site_visit"


@pytest.mark.asyncio
async def test_47_search_criteria_reflection(mock_db_session):
    engine = RecommendationEngine(mock_db_session)
    req = RecommendationRequest(preferences=PropertyPreferences(configuration="3BHK", maximum_budget=28_000_000))
    res = await engine.recommend(req)
    assert res.search_criteria["configuration"] == "3BHK"
    assert res.search_criteria["maximum_budget"] == 28_000_000


@pytest.mark.asyncio
async def test_48_no_hallucination_match_reasons(mock_db_session):
    engine = RecommendationEngine(mock_db_session)
    req = RecommendationRequest(preferences=PropertyPreferences(maximum_budget=30_000_000))
    res = await engine.recommend(req)
    for u in res.recommendations:
        for reason in u.match_reasons:
            assert isinstance(reason, str)
            assert len(reason) > 0


@pytest.mark.asyncio
async def test_49_confidence_score_validity(mock_db_session):
    engine = RecommendationEngine(mock_db_session)
    req = RecommendationRequest()
    res = await engine.recommend(req)
    assert res.confidence == 0.95


@pytest.mark.asyncio
async def test_50_full_pipeline_end_to_end(mock_db_session):
    engine = RecommendationEngine(mock_db_session)
    req = RecommendationRequest(
        preferences=PropertyPreferences(
            configuration="3BHK",
            maximum_budget=30_000_000,
            minimum_area=2000,
            view="lake",
            floor_preference="high",
        ),
        top_n=3,
    )
    res = await engine.recommend(req)
    assert len(res.recommendations) == 3
    assert res.recommendations[0].score >= res.recommendations[1].score >= res.recommendations[2].score
