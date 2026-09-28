"""Phase 5 Comprehensive Test Suite — Personalized Residence Recommendation.

Validates deterministic residence recommendation, preference matching (configuration, budget,
view, floor, orientation), partial/missing info handling, update recalculation, zero-inventory
controlled relaxation, availability filtering, and CRM lead integration.
"""

import uuid
import pytest
from unittest.mock import AsyncMock

from app.ai.recommendation_engine import RecommendationEngine
from app.core.exceptions import NotFoundException
from app.models.crm import Lead
from app.models.enums import LeadPriority, LeadStatus, ListingStatus
from app.models.property import Property
from app.schemas.ai import PropertyPreferences
from app.schemas.lead import LeadContext
from app.schemas.recommendation import RecommendationRequest, ScoringWeightsConfig
from app.services.lead_service import LeadService


@pytest.fixture
def mock_db_session():
    mock = AsyncMock()
    return mock


# ==============================================================================
# 1. BASIC MATCHING (CONFIGURATION, BUDGET, MULTI-DIMENSIONAL PREFERENCES)
# ==============================================================================

@pytest.mark.asyncio
async def test_01_configuration_matching_3bhk(mock_db_session):
    """Lead specifying 3 BHK receives valid 3 BHK properties."""
    engine = RecommendationEngine(mock_db_session)
    req = RecommendationRequest(preferences=PropertyPreferences(configuration="3BHK", bedrooms=3))
    res = await engine.recommend(req)
    assert len(res.recommendations) > 0
    for unit in res.recommendations:
        assert "3 BHK" in unit.typology or unit.area_sqft >= 1700


@pytest.mark.asyncio
async def test_02_budget_matching_strict(mock_db_session):
    """Lead specifying max budget ₹2.5 Cr receives units within budget."""
    engine = RecommendationEngine(mock_db_session)
    req = RecommendationRequest(preferences=PropertyPreferences(maximum_budget=25_000_000))
    res = await engine.recommend(req)
    assert len(res.recommendations) > 0
    for unit in res.recommendations:
        assert unit.price <= 25_000_000
        assert any("Within budget" in r for r in unit.match_reasons)


@pytest.mark.asyncio
async def test_03_multi_preference_matching(mock_db_session):
    """Matches lake view, high floor, North-East orientation, and budget."""
    engine = RecommendationEngine(mock_db_session)
    req = RecommendationRequest(
        preferences=PropertyPreferences(
            configuration="3BHK",
            maximum_budget=26_000_000,
            view="lake",
            floor_preference="high",
            orientation="North-East",
        ),
        top_n=1,
    )
    res = await engine.recommend(req)
    assert len(res.recommendations) == 1
    top_unit = res.recommendations[0]
    assert top_unit.unit_number == "1804"
    assert top_unit.floor >= 8
    assert "Lake View" in top_unit.view
    assert top_unit.score >= 90.0


# ==============================================================================
# 2. PARTIAL INFORMATION RESILIENCE
# ==============================================================================

@pytest.mark.asyncio
async def test_04_partial_information_only_configuration(mock_db_session):
    """Engine works properly when only configuration is provided."""
    engine = RecommendationEngine(mock_db_session)
    req = RecommendationRequest(preferences=PropertyPreferences(configuration="3BHK"))
    res = await engine.recommend(req)
    assert res.total_matches > 0
    assert len(res.recommendations) > 0


@pytest.mark.asyncio
async def test_05_partial_information_only_budget(mock_db_session):
    """Engine works properly when only budget is provided."""
    engine = RecommendationEngine(mock_db_session)
    req = RecommendationRequest(preferences=PropertyPreferences(maximum_budget=30_000_000, bedrooms=None))
    res = await engine.recommend(req)
    assert res.total_matches > 0
    assert len(res.recommendations) > 0


@pytest.mark.asyncio
async def test_06_empty_preferences_safe_fallback(mock_db_session):
    """Engine produces safe default recommendations with completely empty preferences."""
    engine = RecommendationEngine(mock_db_session)
    req = RecommendationRequest(preferences=PropertyPreferences())
    res = await engine.recommend(req)
    assert res.total_matches > 0
    assert len(res.recommendations) > 0
    assert res.confidence == 0.95


# ==============================================================================
# 3. NO-MATCH AND CONTROLLED CONSTRAINT RELAXATION
# ==============================================================================

@pytest.mark.asyncio
async def test_07_no_exact_match_controlled_relaxation(mock_db_session):
    """When budget is below available units, returns controlled alternatives with notes."""
    engine = RecommendationEngine(mock_db_session)
    req = RecommendationRequest(preferences=PropertyPreferences(maximum_budget=15_000_000))
    res = await engine.recommend(req)
    assert res.constraint_relaxed is True
    assert len(res.recommendations) == 0
    assert len(res.alternatives) > 0
    assert len(res.relaxation_notes) > 0
    assert "No exact matches under" in res.relaxation_notes[0]


@pytest.mark.asyncio
async def test_08_empty_inventory_honest_response():
    """When DB has zero published units, returns honest empty state without fabricating units."""
    mock_empty_session = AsyncMock()
    # Explicitly return empty scalar result
    mock_result = AsyncMock()
    mock_result.all.return_value = []
    mock_empty_session.scalars.return_value = mock_result
    
    # Non-mock class simulation
    class RealDbSessionSimulation:
        async def scalars(self, stmt):
            class ScalarRes:
                def all(self):
                    return []
            return ScalarRes()

    engine = RecommendationEngine(RealDbSessionSimulation())
    req = RecommendationRequest(preferences=PropertyPreferences(configuration="3BHK"))
    res = await engine.recommend(req)
    assert res.total_matches == 0
    assert len(res.recommendations) == 0
    assert res.confidence == 0.0
    assert "No published Amnaya inventory is currently available." in res.relaxation_notes[0]


# ==============================================================================
# 4. DETERMINISM
# ==============================================================================

@pytest.mark.asyncio
async def test_09_deterministic_recommendation_results(mock_db_session):
    """Same preferences over same inventory always produce identical scores and rankings."""
    engine = RecommendationEngine(mock_db_session)
    req = RecommendationRequest(
        preferences=PropertyPreferences(
            configuration="3BHK",
            maximum_budget=28_000_000,
            view="lake",
            floor_preference="high",
        ),
        top_n=3,
    )
    res1 = await engine.recommend(req)
    res2 = await engine.recommend(req)

    assert [u.unit_number for u in res1.recommendations] == [u.unit_number for u in res2.recommendations]
    assert [u.score for u in res1.recommendations] == [u.score for u in res2.recommendations]
    assert [u.recommendation_type for u in res1.recommendations] == [u.recommendation_type for u in res2.recommendations]


# ==============================================================================
# 5. CRM LEAD INTEGRATION & PREFERENCE UPDATE RECALCULATION
# ==============================================================================

@pytest.mark.asyncio
async def test_10_lead_service_get_recommendations_integration(mock_db_session):
    """LeadService generates recommendations from canonical Lead record and updates lead score."""
    service = LeadService(mock_db_session)

    test_lead_id = uuid.uuid4()
    lead_model = Lead(
        id=test_lead_id,
        name="Vikram Sethi",
        phone="+919876543210",
        whatsapp_number="+919876543210",
        whatsapp_consent=True,
        configuration="3BHK",
        budget_max=26_000_000,
        preferred_view="lake",
        preferred_floor="high",
        status=LeadStatus.NEW,
    )

    # Mock repository get
    service.leads.get_or_404 = AsyncMock(return_value=lead_model)
    service.commit = AsyncMock()

    res = await service.get_recommendations_for_lead(test_lead_id, top_n=3)

    assert len(res.recommendations) > 0
    top_rec = res.recommendations[0]
    assert top_rec.unit_number == "1804"
    # Lead recommended units updated
    assert "1804" in lead_model.recommended_unit_ids
    # Score updated
    assert lead_model.lead_score > 0
    assert service.commit.called


@pytest.mark.asyncio
async def test_11_lead_preference_update_triggers_recalculation(mock_db_session):
    """When lead updates budget from 21M to 35M, recommendation shifts to higher tier unit."""
    service = LeadService(mock_db_session)
    test_lead_id = uuid.uuid4()

    # Step 1: Initial budget ₹22 Lakhs -> unit 1202
    lead_model = Lead(
        id=test_lead_id,
        name="Ananya Sharma",
        phone="+919876543210",
        configuration="3BHK",
        budget_max=22_000_000,
        status=LeadStatus.NEW,
    )
    service.leads.get_or_404 = AsyncMock(return_value=lead_model)
    service.commit = AsyncMock()

    res1 = await service.get_recommendations_for_lead(test_lead_id, top_n=1)
    assert res1.recommendations[0].unit_number == "1202"

    # Step 2: Lead updates budget to ₹35 Lakhs -> larger premium units become accessible
    lead_model.budget_max = 35_000_000
    res2 = await service.get_recommendations_for_lead(test_lead_id, top_n=3)
    assert res2.total_matches > res1.total_matches
    assert res2.recommendations[0].unit_number != "1202"
    # All recommended units across turns are preserved in lead record
    assert "1202" in lead_model.recommended_unit_ids
    assert res2.recommendations[0].unit_number in lead_model.recommended_unit_ids


@pytest.mark.asyncio
async def test_12_non_existent_lead_raises_not_found(mock_db_session):
    """Requesting recommendations for non-existent lead raises NotFoundException."""
    service = LeadService(mock_db_session)
    missing_id = uuid.uuid4()
    service.leads.get_or_404 = AsyncMock(side_effect=NotFoundException("Lead not found", error_code="lead_not_found"))

    with pytest.raises(NotFoundException):
        await service.get_recommendations_for_lead(missing_id)
