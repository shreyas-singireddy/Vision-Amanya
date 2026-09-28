"""Phase 4: Comprehensive test suite for Automatic Lead Scoring + Intent / Qualification.

Tests cover:
1. Deterministic lead scoring engine integration with LeadContext and LeadService.
2. Score recalculation on progressive information updates.
3. Strict double-counting protection / idempotency.
4. Missing / minimal information resilience (no crash, valid COLD score).
5. Qualification boundary tests (thresholds for temperature & status).
6. Intent separation from score (score != intent, intent recorded in notes/context).
7. Malformed / invalid extraction safety.
8. Unauthorized score mutation protection.
"""

from __future__ import annotations

import uuid
import pytest
from unittest.mock import AsyncMock

from app.ai.lead_scoring import (
    LeadScoringEngine,
    ScoreBreakdown,
    lead_scoring_engine,
    temperature_from_score,
)
from app.models.crm import Lead
from app.models.enums import LeadPriority, LeadStatus, LeadTemperature
from app.schemas.lead import (
    LeadContext,
    LeadContextProcessResponse,
    LeadCreate,
    LeadUpdate,
)
from app.services.lead_service import LeadService


class TestPhase4DeterministicScoring:
    """Test 1: New qualified information & scoring calculation."""

    def test_existing_scoring_engine_dimensions(self):
        engine = LeadScoringEngine()
        # Contact signals
        res_contact = engine.score({"name": "Rahul", "phone": "+919876543210", "whatsapp_consent": True})
        assert res_contact.contact == 5 + 10 + 5  # name(5) + phone(10) + consent(5) = 20

        # Property fit signals
        res_fit = engine.score({"budget_max": 25_000_000, "configuration": "3BHK", "preferred_view": "lake"})
        assert res_fit.property_fit == 15 + 10 + 5  # budget(15) + config(10) + view(5) = 30

        # Intent signals
        res_intent = engine.score({"buying_purpose": "investment", "buying_timeline": "1-3 months"})
        assert res_intent.intent == 10 + 8  # investment(10) + 1-3mo(8) = 18

        # Action signals
        res_action = engine.score({"site_visit_interest": True})
        assert res_action.action == 10

    def test_full_qualified_lead_score_calculation(self):
        profile = {
            "name": "Priya Sharma",
            "phone": "+919876543210",
            "whatsapp_number": "+919876543210",
            "whatsapp_consent": True,
            "buying_purpose": "self_use",      # 5
            "buying_timeline": "immediately",   # 10
            "configuration": "3BHK",           # 10
            "budget_max": 30_000_000,           # 15
            "preferred_view": "lake",          # 5
            "preferred_floor": "high",         # 5
            "site_visit_interest": True,        # 10
            "interested_unit_ids": ["A-1203"], # 10 (unit_shortlisted)
            "interaction_count": 4,             # 5 (multi_interaction > 3)
        }
        breakdown = lead_scoring_engine.score(profile)
        # contact: name(5) + phone(10) + whatsapp(10) + consent(5) = 30
        # intent: self_use(5) + immediately(10) = 15
        # property_fit: budget(15) + config(10) + view(5) + floor(5) = 35
        # engagement: shortlisted(10) + multi_interaction(5) = 15
        # action: site_visit(10) = 10
        # total = 30 + 15 + 35 + 15 + 10 = 105 -> capped at 100
        assert breakdown.total == 100
        assert breakdown.temperature == LeadTemperature.HIGH_INTENT


class TestPhase4ScoreRecalculation:
    """Test 2: Score recalculation on progressive information updates."""

    @pytest.mark.asyncio
    async def test_recalculation_on_new_facts(self):
        mock_session = AsyncMock()
        mock_session.scalar.return_value = None  # New lead first
        mock_session.flush = AsyncMock()
        mock_session.commit = AsyncMock()
        mock_session.refresh = AsyncMock()

        service = LeadService(mock_session)

        # Step 1: Initial minimal context
        ctx1 = LeadContext(
            name="Vikram",
            phone="+919876543210",
            conversation_id=uuid.uuid4(),
        )
        res1 = await service.process_lead_context(ctx1)
        score1 = res1.score_breakdown.total
        # name(5) + phone(10) = 15
        assert score1 == 15
        assert res1.temperature == "cold"
        assert res1.status == LeadStatus.NEW

        # Step 2: User provides budget and configuration
        # Mock finding the existing lead
        existing_lead = Lead(
            id=res1.lead_id,
            name="Vikram",
            phone="+919876543210",
            lead_score=score1,
            status=LeadStatus.NEW,
        )
        mock_session.scalar.return_value = existing_lead

        ctx2 = LeadContext(
            phone="+919876543210",
            configuration="3BHK",
            budget_max=25_000_000,
            conversation_id=ctx1.conversation_id,
        )
        res2 = await service.process_lead_context(ctx2)
        score2 = res2.score_breakdown.total
        # name(5) + phone(10) + config(10) + budget(15) = 40
        assert score2 == 40
        assert score2 > score1
        assert res2.temperature == "warm"

        # Step 3: User expresses site visit interest & timeline
        ctx3 = LeadContext(
            phone="+919876543210",
            site_visit_interest=True,
            buying_timeline="1-3 months",
            conversation_id=ctx1.conversation_id,
        )
        res3 = await service.process_lead_context(ctx3)
        score3 = res3.score_breakdown.total
        # name(5) + phone(10) + config(10) + budget(15) + site_visit(10) + timeline(8) = 58
        assert score3 == 58
        assert score3 > score2
        assert res3.temperature == "warm"
        assert res3.status == LeadStatus.QUALIFIED  # Qualified because score >= 50


class TestPhase4DoubleCountingProtection:
    """Test 3 & 4: Strict double-counting protection & idempotency."""

    @pytest.mark.asyncio
    async def test_idempotent_processing_no_score_inflation(self):
        mock_session = AsyncMock()
        mock_session.flush = AsyncMock()
        mock_session.commit = AsyncMock()
        mock_session.refresh = AsyncMock()

        service = LeadService(mock_session)

        ctx = LeadContext(
            name="Ananya",
            phone="+919876543210",
            configuration="3BHK",
            budget_max=30_000_000,
            site_visit_interest=True,
            viewed_unit_ids=["A-1203"],
            interested_unit_ids=["A-1203"],
        )

        lead = Lead(
            id=uuid.uuid4(),
            name=ctx.name,
            phone=ctx.phone,
            configuration=ctx.configuration,
            budget_max=ctx.budget_max,
            site_visit_interest=ctx.site_visit_interest,
            viewed_unit_ids=["A-1203"],
            interested_unit_ids=["A-1203"],
            status=LeadStatus.NEW,
        )
        mock_session.scalar.return_value = lead

        # First run
        res1 = await service.process_lead_context(ctx)
        score1 = res1.score_breakdown.total

        # Second identical run
        res2 = await service.process_lead_context(ctx)
        score2 = res2.score_breakdown.total

        # Third identical run
        res3 = await service.process_lead_context(ctx)
        score3 = res3.score_breakdown.total

        assert score1 == score2 == score3
        # Ensure unit lists remain deduplicated
        assert lead.viewed_unit_ids == ["A-1203"]
        assert lead.interested_unit_ids == ["A-1203"]


class TestPhase4MissingAndMinimalInformation:
    """Test 4: Resilience when data is minimal or missing."""

    def test_empty_profile_does_not_crash(self):
        breakdown = lead_scoring_engine.score({})
        assert isinstance(breakdown, ScoreBreakdown)
        assert breakdown.total == 0
        assert breakdown.temperature == LeadTemperature.COLD
        assert breakdown.contact == 0
        assert breakdown.intent == 0
        assert breakdown.property_fit == 0
        assert breakdown.engagement == 0
        assert breakdown.action == 0

    def test_none_values_handled_gracefully(self):
        profile = {
            "name": None,
            "phone": None,
            "whatsapp_number": None,
            "whatsapp_consent": None,
            "budget_min": None,
            "budget_max": None,
            "configuration": None,
            "preferred_view": None,
            "preferred_floor": None,
            "preferred_orientation": None,
            "buying_purpose": None,
            "buying_timeline": None,
            "site_visit_interest": None,
            "interested_unit_ids": None,
            "viewed_unit_ids": None,
            "compared_unit_ids": None,
            "interaction_count": None,
        }
        breakdown = lead_scoring_engine.score(profile)
        assert breakdown.total == 0
        assert breakdown.temperature == LeadTemperature.COLD


class TestPhase4QualificationBoundaries:
    """Test 5: Lead temperature and status qualification boundaries."""

    def test_temperature_threshold_boundaries(self):
        assert temperature_from_score(0) == LeadTemperature.COLD
        assert temperature_from_score(30) == LeadTemperature.COLD
        assert temperature_from_score(31) == LeadTemperature.WARM
        assert temperature_from_score(60) == LeadTemperature.WARM
        assert temperature_from_score(61) == LeadTemperature.HOT
        assert temperature_from_score(80) == LeadTemperature.HOT
        assert temperature_from_score(81) == LeadTemperature.HIGH_INTENT
        assert temperature_from_score(100) == LeadTemperature.HIGH_INTENT

    @pytest.mark.asyncio
    async def test_lead_qualification_status_transition_at_50_points(self):
        mock_session = AsyncMock()
        mock_session.flush = AsyncMock()
        mock_session.commit = AsyncMock()
        mock_session.refresh = AsyncMock()
        service = LeadService(mock_session)

        # 1. Under 50 points: status remains NEW
        lead_sub_50 = Lead(
            id=uuid.uuid4(),
            name="SubFifty",
            phone="+919876543210",  # contact: 15
            configuration="3BHK",   # fit: 10
            status=LeadStatus.NEW,
        )
        mock_session.scalar.return_value = lead_sub_50
        ctx_sub_50 = LeadContext(phone="+919876543210", name="SubFifty", configuration="3BHK")
        res_sub_50 = await service.process_lead_context(ctx_sub_50)
        assert res_sub_50.score_breakdown.total == 25
        assert res_sub_50.status == LeadStatus.NEW

        # 2. At / Over 50 points: status automatically moves from NEW to QUALIFIED
        lead_over_50 = Lead(
            id=uuid.uuid4(),
            name="OverFifty",
            phone="+919876543210",
            whatsapp_consent=True,
            configuration="3BHK",
            budget_max=30_000_000,
            site_visit_interest=True,
            status=LeadStatus.NEW,
        )
        mock_session.scalar.return_value = lead_over_50
        ctx_over_50 = LeadContext(
            phone="+919876543210",
            whatsapp_consent=True,
            name="OverFifty",
            configuration="3BHK",
            budget_max=30_000_000,
            site_visit_interest=True,
        )
        res_over_50 = await service.process_lead_context(ctx_over_50)
        # contact(20) + config(10) + budget(15) + action(10) = 55
        assert res_over_50.score_breakdown.total == 55
        assert res_over_50.status == LeadStatus.QUALIFIED


class TestPhase4IntentSeparation:
    """Test 6: Separate score from intent (score != intent, intent attached to context/notes)."""

    @pytest.mark.asyncio
    async def test_intent_stored_and_returned_without_distorting_score(self):
        mock_session = AsyncMock()
        mock_session.scalar.return_value = None
        mock_session.flush = AsyncMock()
        mock_session.commit = AsyncMock()
        mock_session.refresh = AsyncMock()

        service = LeadService(mock_session)

        # Context with explicit intent: site_visit
        ctx = LeadContext(
            name="Rohan",
            phone="+919876543210",
            intent="site_visit",
            secondary_intent="pricing_enquiry",
            conversation_summary="User asked for Sunday site visit and 3BHK prices.",
        )
        res = await service.process_lead_context(ctx)

        # Verify intent is returned cleanly in the response
        assert res.intent == "site_visit"
        assert res.secondary_intent == "pricing_enquiry"
        # Verify score is deterministically calculated purely from facts (name + phone = 15)
        assert res.score_breakdown.total == 15
        assert res.temperature == "cold"

        # Verify intent was preserved in the lead notes history
        saved_lead = mock_session.add.call_args_list[0][0][0]
        assert "Intent: site_visit (Secondary: pricing_enquiry)" in saved_lead.notes
        assert "User asked for Sunday site visit" in saved_lead.notes


class TestPhase4MalformedDataSafety:
    """Test 7: Incomplete / malformed optional data safety."""

    @pytest.mark.asyncio
    async def test_malformed_fields_do_not_crash(self):
        mock_session = AsyncMock()
        mock_session.scalar.return_value = None
        mock_session.flush = AsyncMock()
        mock_session.commit = AsyncMock()
        mock_session.refresh = AsyncMock()

        service = LeadService(mock_session)

        ctx = LeadContext(
            name=None,
            phone=None,
            buying_purpose="invalid_purpose_string",
            buying_timeline="unknown_timeline",
            configuration=None,
            interested_unit_ids=[],
            viewed_unit_ids=[],
        )
        # Should not raise exception
        res = await service.process_lead_context(ctx)
        assert res.lead_id is not None
        # Name defaults to 'Amnaya Visitor' (contact=5), no other points given
        assert res.score_breakdown.total == 5
        assert res.temperature == "cold"


class TestPhase4SecurityAndUnauthorizedMutation:
    """Test 8: Ensure score cannot be directly dictated by user / client input."""

    def test_lead_update_schema_does_not_permit_direct_score_override(self):
        # LeadUpdate does not expose lead_score field
        assert "lead_score" not in LeadUpdate.model_fields
        assert "lead_score" not in LeadCreate.model_fields

