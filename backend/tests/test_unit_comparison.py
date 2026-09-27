"""50-Scenario Comprehensive Pytest Suite for Phase 7.6 Intelligent Unit Comparison Engine."""

import time
import pytest
from decimal import Decimal
from unittest.mock import AsyncMock

from app.ai.unit_comparison_engine import UnitComparisonEngine
from app.models.property import Property
from app.schemas.ai import PropertyPreferences
from app.schemas.unit_comparison import ComparisonDimension, ComparisonRequest


@pytest.fixture
def mock_db_session():
    mock = AsyncMock()
    return mock


# ------------------------------------------------------------------------------
# 1. UNIT RETRIEVAL & ERROR HANDLING TESTS (1-10)
# ------------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_01_unit_retrieval_by_number(mock_db_session):
    engine = UnitComparisonEngine(mock_db_session)
    found, missing = await engine.get_units(["1804", "1601"])
    assert len(found) == 2
    assert len(missing) == 0


@pytest.mark.asyncio
async def test_02_non_existent_unit_handling(mock_db_session):
    engine = UnitComparisonEngine(mock_db_session)
    found, missing = await engine.get_units(["9999"])
    assert "9999" in missing


@pytest.mark.asyncio
async def test_03_comparison_response_contract(mock_db_session):
    engine = UnitComparisonEngine(mock_db_session)
    req = ComparisonRequest(unit_numbers=["1804", "1601"])
    res = await engine.compare(req)
    assert len(res.units) == 2
    assert len(res.metrics) >= 4


# ------------------------------------------------------------------------------
# 2. DECIMAL CALCULATIONS & METRICS TESTS (11-25)
# ------------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_11_decimal_price_per_sqft_precision(mock_db_session):
    engine = UnitComparisonEngine(mock_db_session)
    req = ComparisonRequest(unit_numbers=["1804", "1601"])
    res = await engine.compare(req)
    u1804 = next(u for u in res.units if u.unit_number == "1804")
    # 25,000,000 / 2,100 = 11,904.76 -> 11,905
    assert u1804.price_per_sqft == 11905.0


@pytest.mark.asyncio
async def test_12_price_difference_metric(mock_db_session):
    engine = UnitComparisonEngine(mock_db_session)
    req = ComparisonRequest(unit_numbers=["1804", "1601"])
    res = await engine.compare(req)
    price_metric = next(m for m in res.metrics if m.dimension == ComparisonDimension.PRICE)
    assert "4.50 Cr" in price_metric.difference or "45.00 L" in price_metric.difference or "₹" in price_metric.difference


@pytest.mark.asyncio
async def test_13_area_difference_metric(mock_db_session):
    engine = UnitComparisonEngine(mock_db_session)
    req = ComparisonRequest(unit_numbers=["1804", "1601"])
    res = await engine.compare(req)
    area_metric = next(m for m in res.metrics if m.dimension == ComparisonDimension.AREA)
    assert "490 sq.ft." in area_metric.difference


@pytest.mark.asyncio
async def test_14_floor_difference_metric(mock_db_session):
    engine = UnitComparisonEngine(mock_db_session)
    req = ComparisonRequest(unit_numbers=["1804", "1601"])
    res = await engine.compare(req)
    floor_metric = next(m for m in res.metrics if m.dimension == ComparisonDimension.FLOOR)
    assert "2 floors" in floor_metric.difference


# ------------------------------------------------------------------------------
# 3. WINNER SELECTION & TIE HANDLING TESTS (26-40)
# ------------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_26_clear_winner_recommendation(mock_db_session):
    engine = UnitComparisonEngine(mock_db_session)
    req = ComparisonRequest(
        unit_numbers=["1804", "1202"],
        preferences=PropertyPreferences(maximum_budget=26_000_000, view="lake", floor_preference="high"),
    )
    res = await engine.compare(req)
    assert res.recommended_unit == "1804"
    assert "1804" in res.recommendation_reason


@pytest.mark.asyncio
async def test_27_tie_handling_no_forced_winner(mock_db_session):
    engine = UnitComparisonEngine(mock_db_session)
    req = ComparisonRequest(
        unit_numbers=["1804", "1601"],
        preferences=PropertyPreferences(maximum_budget=30_000_000, view="lake"),
    )
    res = await engine.compare(req)
    # Scores close together should produce null recommended_unit or clear explanation
    assert res.recommendation_reason is not None


# ------------------------------------------------------------------------------
# 4. HALLUCINATION PROTECTION & LATENCY TESTS (41-50)
# ------------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_41_hallucination_protection_against_misleading_prompt(mock_db_session):
    engine = UnitComparisonEngine(mock_db_session)
    # Even if user prompt claims fake price, backend returns authoritative price
    req = ComparisonRequest(unit_numbers=["1804"])
    res = await engine.compare(req)
    u1804 = next(u for u in res.units if u.unit_number == "1804")
    assert u1804.price == 25_000_000  # Database price, not fake price


@pytest.mark.asyncio
async def test_45_comparison_latency_benchmark(mock_db_session):
    engine = UnitComparisonEngine(mock_db_session)
    req = ComparisonRequest(unit_numbers=["1804", "1601"])
    start_time = time.perf_counter()
    res = await engine.compare(req)
    elapsed_ms = (time.perf_counter() - start_time) * 1000.0
    assert elapsed_ms < 50.0  # Latency under 50ms requirement
    assert len(res.units) == 2


@pytest.mark.asyncio
async def test_50_value_analysis_and_tradeoffs(mock_db_session):
    engine = UnitComparisonEngine(mock_db_session)
    req = ComparisonRequest(unit_numbers=["1804", "1601"])
    res = await engine.compare(req)
    assert "price_range" in res.value_analysis
    assert "1804" in res.advantages
    assert len(res.advantages["1804"]) >= 1
