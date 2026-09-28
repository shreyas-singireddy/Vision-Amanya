"""Phase 2: Conversation → Structured Lead Information Extraction — Test Suite.

Covers all 9 test scenarios from the Phase 2 specification:
  T01  Configuration-only extraction
  T02  Budget-only extraction with INR normalization
  T03  Timeline-only extraction
  T04  Combined single-message extraction
  T05  Partial conversation — prior fields preserved
  T06  Correction — budget updated, prior config kept
  T07  Missing information — no fabricated fields
  T08  Malformed / None LLM output — extraction failure is safe
  T09  Security — lead context isolation between conversations

Additional Phase 2 coverage:
  T10  FieldSource provenance tagging
  T11  View preference extraction
  T12  Floor preference extraction
  T13  Orientation extraction
  T14  Timeline correction
  T15  is_correction() detection
  T16  All new fields flow into ConversationLeadProfile via update_lead_profile
"""

from __future__ import annotations

import uuid

import pytest

from app.ai.profile_extractor import ExtractionResult, FieldSource, ProfileExtractor
from app.ai.conversation_manager import ConversationManager, ConversationState

extractor = ProfileExtractor()


# ─── Helpers ─────────────────────────────────────────────────────────────────

def _new_state() -> ConversationState:
    return ConversationState(conversation_id=uuid.uuid4())


def _apply(state: ConversationState, text: str) -> ConversationState:
    """Extract from text and apply to state (simulates one chat turn)."""
    extraction = extractor.extract(
        text,
        awaiting_phone=state.awaiting_phone,
        awaiting_consent=state.awaiting_consent,
    )
    return ConversationManager.update_lead_profile(state, extraction)


# ─── T01: Configuration-only extraction ──────────────────────────────────────

class TestT01Configuration:
    """Phase 2 Test 1 — only configuration is present, nothing else fabricated."""

    def test_3bhk_extracted(self):
        r = extractor.extract("I'm looking for a 3BHK.")
        assert r.configuration == "3BHK"

    def test_no_budget_fabricated(self):
        r = extractor.extract("I'm looking for a 3BHK.")
        assert r.budget_min is None
        assert r.budget_max is None

    def test_no_timeline_fabricated(self):
        r = extractor.extract("I'm looking for a 3BHK.")
        assert r.buying_timeline is None

    def test_no_name_fabricated(self):
        r = extractor.extract("I'm looking for a 3BHK.")
        assert r.name is None

    def test_source_is_stated(self):
        r = extractor.extract("I'm looking for a 3BHK.")
        assert r.sources.get("configuration") == FieldSource.STATED

    def test_three_bedroom_normalizes_to_3bhk(self):
        r = extractor.extract("We need three bedroom flat.")
        assert r.configuration == "3BHK"

    def test_4bhk_variation(self):
        r = extractor.extract("Looking for a 4 BHK residence.")
        assert r.configuration == "4BHK"


# ─── T02: Budget-only extraction with INR normalization ──────────────────────

class TestT02Budget:
    """Phase 2 Test 2 — budget normalization to INR."""

    def test_crore_normalized(self):
        r = extractor.extract("My budget is around 2.5 crore.")
        assert r.budget_max == pytest.approx(25_000_000)

    def test_source_is_normalized(self):
        r = extractor.extract("My budget is around 2.5 crore.")
        assert r.sources.get("budget_max") == FieldSource.NORMALIZED

    def test_no_config_fabricated(self):
        r = extractor.extract("My budget is around 2.5 crore.")
        assert r.configuration is None

    def test_lakh_to_inr(self):
        r = extractor.extract("Budget 25 lakhs.")
        # 25 × 1_00_000 × 1.1 = 27_50_000 (upper bound for lakh amounts)
        assert r.budget_max == pytest.approx(25 * 100_000 * 1.1)

    def test_range_budget(self):
        r = extractor.extract("Somewhere between 2.5 to 3 crore.")
        assert r.budget_min == pytest.approx(25_000_000)
        assert r.budget_max == pytest.approx(30_000_000)

    def test_upper_bound_only(self):
        r = extractor.extract("Under 3 crore.")
        assert r.budget_min is None
        assert r.budget_max == pytest.approx(30_000_000)


# ─── T03: Timeline extraction ─────────────────────────────────────────────────

class TestT03Timeline:
    """Phase 2 Test 3 — timeline normalization."""

    def test_3_months_extracted(self):
        r = extractor.extract("I want to buy within 3 months.")
        assert r.buying_timeline is not None

    def test_immediately_extracted(self):
        r = extractor.extract("I need it asap.")
        assert r.buying_timeline == "immediately"

    def test_just_exploring_extracted(self):
        r = extractor.extract("I'm just exploring right now.")
        assert r.buying_timeline == "just exploring"

    def test_source_is_stated(self):
        r = extractor.extract("Within 3 months.")
        assert r.sources.get("buying_timeline") == FieldSource.STATED

    def test_no_budget_fabricated(self):
        r = extractor.extract("I want to buy within 3 months.")
        assert r.budget_max is None


# ─── T04: Combined single-message extraction ──────────────────────────────────

class TestT04Combined:
    """Phase 2 Test 4 — all three primary fields in one message."""

    MSG = "I'm looking for a 3BHK around ₹2.5 crore and want to move within 3 months."

    def test_configuration(self):
        r = extractor.extract(self.MSG)
        assert r.configuration == "3BHK"

    def test_budget(self):
        r = extractor.extract(self.MSG)
        assert r.budget_max == pytest.approx(25_000_000)

    def test_timeline(self):
        r = extractor.extract(self.MSG)
        assert r.buying_timeline is not None

    def test_all_sources_present(self):
        r = extractor.extract(self.MSG)
        assert "configuration" in r.sources
        assert "budget_max" in r.sources
        assert "buying_timeline" in r.sources

    def test_no_name_fabricated(self):
        r = extractor.extract(self.MSG)
        assert r.name is None

    def test_no_location_fabricated(self):
        r = extractor.extract(self.MSG)
        assert r.location is None


# ─── T05: Partial conversation — prior fields preserved ───────────────────────

class TestT05PartialConversation:
    """Phase 2 Test 5 — multi-turn accumulation without overwriting prior values."""

    def test_configuration_preserved_after_budget_message(self):
        state = _new_state()
        state = _apply(state, "I'm looking for a 3BHK.")
        assert state.lead_profile.configuration == "3BHK"

        # Second message only mentions budget
        state = _apply(state, "My budget is 2.5 crore.")
        assert state.lead_profile.configuration == "3BHK"  # still preserved
        assert state.lead_profile.budget_max == pytest.approx(25_000_000)

    def test_timeline_added_without_losing_config_or_budget(self):
        state = _new_state()
        state = _apply(state, "I'm looking for a 3BHK.")
        state = _apply(state, "My budget is 2.5 crore.")
        state = _apply(state, "I want to buy within three months.")
        lp = state.lead_profile
        assert lp.configuration == "3BHK"
        assert lp.budget_max == pytest.approx(25_000_000)
        assert lp.buying_timeline is not None

    def test_name_preserved_through_multiple_turns(self):
        state = _new_state()
        state = _apply(state, "I'm Rahul.")
        state = _apply(state, "I want 3BHK with lake view.")
        assert state.lead_profile.name == "Rahul"

    def test_interaction_count_increments(self):
        state = _new_state()
        state = _apply(state, "Hello.")
        state = _apply(state, "I want 3BHK.")
        assert state.lead_profile.interaction_count == 2


# ─── T06: Correction — budget updated, prior config kept ─────────────────────

class TestT06Correction:
    """Phase 2 Test 6 — user corrects budget; prior fields survive."""

    def test_budget_correction_updates_value(self):
        state = _new_state()
        state = _apply(state, "My budget is 2 crore.")
        assert state.lead_profile.budget_max == pytest.approx(20_000_000)

        # User corrects themselves
        state = _apply(state, "Actually, I can go up to 2.5 crore.")
        assert state.lead_profile.budget_max == pytest.approx(25_000_000)

    def test_config_not_erased_during_correction(self):
        state = _new_state()
        state = _apply(state, "I need a 3BHK. Budget is 2 crore.")
        state = _apply(state, "Actually 2.5 crore.")
        assert state.lead_profile.configuration == "3BHK"

    def test_timeline_correction(self):
        state = _new_state()
        state = _apply(state, "I want to buy in about 6 months.")
        assert state.lead_profile.buying_timeline is not None

        state = _apply(state, "Actually, I need it asap.")
        assert state.lead_profile.buying_timeline == "immediately"

    def test_is_correction_marker_detected(self):
        assert ProfileExtractor.is_correction("Actually, 2.5 crore.")
        assert ProfileExtractor.is_correction("Sorry, I meant 3 months.")
        assert not ProfileExtractor.is_correction("My budget is 2 crore.")


# ─── T07: Missing information — no fabricated fields ─────────────────────────

class TestT07MissingInformation:
    """Phase 2 Test 7 — generic question yields no extracted profile fields."""

    def test_generic_project_question_yields_empty(self):
        r = extractor.extract("Tell me about the project.")
        assert r.configuration is None
        assert r.budget_max is None
        assert r.buying_timeline is None
        assert r.name is None
        assert r.location is None

    def test_no_sources_on_empty_extraction(self):
        r = extractor.extract("Tell me about the project.")
        assert r.sources == {}

    def test_is_known_returns_false_for_unknown_fields(self):
        r = extractor.extract("Tell me about the project.")
        assert not r.is_known("configuration")
        assert not r.is_known("budget_max")


# ─── T08: Malformed extraction / failure safety ───────────────────────────────

class TestT08FailureSafety:
    """Phase 2 Test 8 — extraction errors don't corrupt state."""

    def test_none_text_handled(self):
        """Passing empty string (sentinel for failed LLM output) yields empty result."""
        r = extractor.extract("")
        assert r.configuration is None
        assert r.budget_max is None
        assert r.sources == {}

    def test_extraction_exception_does_not_propagate(self):
        """Even if text is garbage, extract() must return a valid ExtractionResult."""
        garbage = "!!@@##$$%%^^ None \x00 <script>alert(1)</script>"
        r = extractor.extract(garbage)
        assert isinstance(r, ExtractionResult)

    def test_partial_extraction_still_valid(self):
        """Valid config + broken budget text → config extracted, budget stays None."""
        r = extractor.extract("3BHK, budget is ₹₹₹ crore??")
        assert r.configuration == "3BHK"
        # INR amount cannot be parsed from '₹₹₹' — stays None
        assert r.budget_max is None

    def test_update_lead_profile_safe_with_empty_extraction(self):
        """Applying an empty ExtractionResult must not corrupt existing state."""
        state = _new_state()
        state = _apply(state, "I need 3BHK.")
        original_config = state.lead_profile.configuration

        # Apply empty extraction (simulates failed LLM extraction)
        empty = ExtractionResult(raw_text="")
        state = ConversationManager.update_lead_profile(state, empty)
        assert state.lead_profile.configuration == original_config


# ─── T09: Security — lead context isolation ───────────────────────────────────

class TestT09Security:
    """Phase 2 Test 9 — separate conversations have isolated lead profiles."""

    def test_separate_conversations_are_isolated(self):
        id_a = uuid.uuid4()
        id_b = uuid.uuid4()

        state_a = ConversationManager.get_or_create(id_a)
        state_b = ConversationManager.get_or_create(id_b)

        # Set profile on A only
        extraction = extractor.extract("I'm Rahul, need 3BHK, budget 3 crore.")
        ConversationManager.update_lead_profile(state_a, extraction)

        # B must have no knowledge of A's profile
        assert state_b.lead_profile.name is None
        assert state_b.lead_profile.configuration is None
        assert state_b.lead_profile.budget_max is None

    def test_modifying_b_does_not_affect_a(self):
        id_a = uuid.uuid4()
        id_b = uuid.uuid4()

        state_a = ConversationManager.get_or_create(id_a)
        state_b = ConversationManager.get_or_create(id_b)

        ext_a = extractor.extract("I'm Rahul, need 3BHK.")
        ext_b = extractor.extract("I'm Priya, need 4BHK.")
        ConversationManager.update_lead_profile(state_a, ext_a)
        ConversationManager.update_lead_profile(state_b, ext_b)

        assert state_a.lead_profile.name == "Rahul"
        assert state_b.lead_profile.name == "Priya"
        assert state_a.lead_profile.configuration == "3BHK"
        assert state_b.lead_profile.configuration == "4BHK"


# ─── T10: FieldSource provenance ─────────────────────────────────────────────

class TestT10FieldSource:
    def test_budget_is_normalized(self):
        r = extractor.extract("Budget 3 crore")
        assert r.sources.get("budget_max") == FieldSource.NORMALIZED

    def test_config_is_stated(self):
        r = extractor.extract("3BHK please")
        assert r.sources.get("configuration") == FieldSource.STATED

    def test_name_is_stated(self):
        r = extractor.extract("I'm Rahul")
        assert r.sources.get("name") == FieldSource.STATED

    def test_phone_is_normalized_when_awaiting(self):
        r = extractor.extract("9876543210", awaiting_phone=True)
        assert r.sources.get("phone") == FieldSource.NORMALIZED

    def test_unknown_field_returns_unknown(self):
        r = extractor.extract("Hello")
        assert r.sources.get("configuration", FieldSource.UNKNOWN) == FieldSource.UNKNOWN

    def test_is_known_true_for_extracted(self):
        r = extractor.extract("3BHK")
        assert r.is_known("configuration") is True

    def test_is_known_false_for_absent(self):
        r = extractor.extract("3BHK")
        assert r.is_known("budget_max") is False


# ─── T11: View preference extraction ─────────────────────────────────────────

class TestT11ViewPreference:
    def test_lake_view(self):
        r = extractor.extract("I want a lake view apartment.")
        assert r.preferred_view == "lake"

    def test_lake_facing(self):
        r = extractor.extract("Prefer a lake-facing unit.")
        assert r.preferred_view == "lake"

    def test_garden_view(self):
        r = extractor.extract("Garden view would be ideal.")
        assert r.preferred_view == "garden"

    def test_city_view(self):
        r = extractor.extract("Looking for a city view apartment with skyline.")
        assert r.preferred_view == "city"

    def test_no_view_if_not_mentioned(self):
        r = extractor.extract("I want 3BHK.")
        assert r.preferred_view is None

    def test_source_marked(self):
        r = extractor.extract("Lake view please.")
        assert r.sources.get("preferred_view") == FieldSource.STATED


# ─── T12: Floor preference extraction ────────────────────────────────────────

class TestT12FloorPreference:
    def test_high_floor(self):
        r = extractor.extract("I prefer a high floor unit.")
        assert r.preferred_floor == "high"

    def test_upper_floor_maps_to_high(self):
        r = extractor.extract("Upper floor please.")
        assert r.preferred_floor == "high"

    def test_low_floor(self):
        r = extractor.extract("Ground floor preferred.")
        assert r.preferred_floor == "low"

    def test_mid_floor(self):
        r = extractor.extract("Mid floor is fine.")
        assert r.preferred_floor == "mid"

    def test_no_floor_if_not_mentioned(self):
        r = extractor.extract("3BHK with lake view.")
        assert r.preferred_floor is None


# ─── T13: Orientation extraction ─────────────────────────────────────────────

class TestT13Orientation:
    def test_east_facing(self):
        r = extractor.extract("I want an east-facing apartment.")
        assert r.preferred_orientation == "east"

    def test_north_east_facing(self):
        r = extractor.extract("North-east facing is ideal.")
        assert r.preferred_orientation == "north-east"

    def test_no_orientation_if_absent(self):
        r = extractor.extract("I want 3BHK with lake view.")
        assert r.preferred_orientation is None


# ─── T14: Timeline correction via update_lead_profile ────────────────────────

class TestT14TimelineCorrection:
    def test_timeline_updates_on_new_extraction(self):
        """Timeline always overwrites (unlike name which is set once)."""
        state = _new_state()
        state = _apply(state, "Planning to buy in 6 months.")
        first_timeline = state.lead_profile.buying_timeline

        state = _apply(state, "Actually asap.")
        assert state.lead_profile.buying_timeline == "immediately"
        assert state.lead_profile.buying_timeline != first_timeline


# ─── T15: Correction marker detection ────────────────────────────────────────

class TestT15CorrectionMarker:
    def test_actually_detected(self):
        assert ProfileExtractor.is_correction("Actually 2.5 crore.")

    def test_i_meant_detected(self):
        assert ProfileExtractor.is_correction("I meant 3 months.")

    def test_sorry_detected(self):
        assert ProfileExtractor.is_correction("Sorry, 4BHK not 3BHK.")

    def test_normal_message_not_correction(self):
        assert not ProfileExtractor.is_correction("My budget is 3 crore.")


# ─── T16: New fields flow into ConversationLeadProfile ───────────────────────

class TestT16NewFieldsIntegration:
    def test_view_flows_into_lead_profile(self):
        state = _new_state()
        state = _apply(state, "I want a lake view unit.")
        assert state.lead_profile.preferred_view == "lake"

    def test_view_also_synced_to_preferences(self):
        state = _new_state()
        state = _apply(state, "Lake view preferred.")
        assert state.preferences.view == "lake"

    def test_floor_flows_into_lead_profile(self):
        state = _new_state()
        state = _apply(state, "High floor is important.")
        assert state.lead_profile.preferred_floor == "high"

    def test_floor_synced_to_preferences(self):
        state = _new_state()
        state = _apply(state, "High floor please.")
        assert state.preferences.floor_preference == "high"

    def test_orientation_flows_into_lead_profile(self):
        state = _new_state()
        state = _apply(state, "East-facing unit please.")
        assert state.lead_profile.preferred_orientation == "east"

    def test_combined_new_fields_in_one_message(self):
        state = _new_state()
        state = _apply(state, "3BHK with lake view, high floor, east-facing, under 3 crore.")
        lp = state.lead_profile
        assert lp.configuration == "3BHK"
        assert lp.preferred_view == "lake"
        assert lp.preferred_floor == "high"
        assert lp.preferred_orientation == "east"
        assert lp.budget_max == pytest.approx(30_000_000)
