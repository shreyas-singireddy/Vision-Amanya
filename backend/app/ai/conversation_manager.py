"""Phase 7.5: Multi-turn Conversation State Manager — extended with Lead Qualification.

Adds to the existing ConversationManager:
- ConversationLeadProfile: progressive visitor profile built across turns
- ConvStage: state machine for lead qualification flow
- questions_asked: prevents re-asking the same question
- whatsapp_declined: respects user's no
- Methods for profile update, stage advancement, and field-collection tracking
"""

from __future__ import annotations

import uuid
from typing import Any, Dict, Optional

from pydantic import BaseModel, Field

from app.models.enums import ConvStage
from app.schemas.ai import PropertyPreferences
from app.schemas.recommendation import ScoringWeightsConfig


class ConversationLeadProfile(BaseModel):
    """Progressive visitor profile built through natural conversation."""

    # Identity
    name: Optional[str] = None
    phone: Optional[str] = None          # raw phone from user
    whatsapp_number: Optional[str] = None  # E.164 normalized
    location: Optional[str] = None

    # Buying profile
    buying_purpose: Optional[str] = None   # self_use | investment | second_home
    budget_min: Optional[float] = None
    budget_max: Optional[float] = None
    buying_timeline: Optional[str] = None
    family_size: Optional[int] = None

    # Property preferences
    configuration: Optional[str] = None
    preferred_floor: Optional[str] = None
    preferred_view: Optional[str] = None
    preferred_orientation: Optional[str] = None

    # Unit interest tracking
    recommended_unit_ids: list[str] = Field(default_factory=list)
    viewed_unit_ids: list[str] = Field(default_factory=list)
    interested_unit_ids: list[str] = Field(default_factory=list)
    compared_unit_ids: list[str] = Field(default_factory=list)

    # Engagement
    site_visit_interest: bool = False
    interaction_count: int = 0

    # WhatsApp consent
    whatsapp_consent: Optional[bool] = None
    consent_source: str = "ai_consultant"

    # Lead status
    lead_id: Optional[str] = None
    lead_score: int = 0


class ConversationState(BaseModel):
    """Serializable multi-turn conversation decision state."""

    conversation_id: uuid.UUID
    preferences: PropertyPreferences = Field(default_factory=PropertyPreferences)
    rejected_units: list[str] = Field(default_factory=list, description="Unit numbers rejected by visitor")
    selected_unit: Optional[str] = None
    last_recommendations: list[dict[str, Any]] = Field(default_factory=list)
    offset: int = Field(0, ge=0, description="Pagination offset for show-more")
    scoring_weights: ScoringWeightsConfig = Field(default_factory=ScoringWeightsConfig)

    # Phase 7.5: lead qualification state
    stage: ConvStage = ConvStage.DISCOVERY
    lead_profile: ConversationLeadProfile = Field(default_factory=ConversationLeadProfile)
    questions_asked: list[str] = Field(default_factory=list, description="Fields we have already asked about")
    whatsapp_declined: bool = False
    awaiting_phone: bool = False
    awaiting_consent: bool = False


class ConversationManager:
    """Manages stateful multi-turn preference accumulation, unit rejection, pagination,
    and Phase 7.5 lead qualification stage machine."""

    _sessions: Dict[uuid.UUID, ConversationState] = {}

    @classmethod
    def get_or_create(cls, conversation_id: uuid.UUID) -> ConversationState:
        """Fetch or initialize conversation decision state."""
        if conversation_id not in cls._sessions:
            cls._sessions[conversation_id] = ConversationState(conversation_id=conversation_id)
        return cls._sessions[conversation_id]

    @classmethod
    def update_preferences(
        cls,
        state: ConversationState,
        new_prefs: PropertyPreferences,
    ) -> ConversationState:
        """Merge new preferences into existing conversation state."""
        current = state.preferences

        if new_prefs.configuration and new_prefs.configuration != "3BHK":
            current.configuration = new_prefs.configuration
        if new_prefs.bedrooms:
            current.bedrooms = new_prefs.bedrooms
        if new_prefs.maximum_budget is not None:
            current.maximum_budget = new_prefs.maximum_budget
        if new_prefs.minimum_budget is not None:
            current.minimum_budget = new_prefs.minimum_budget
        if new_prefs.minimum_area is not None:
            current.minimum_area = new_prefs.minimum_area
        if new_prefs.maximum_area is not None:
            current.maximum_area = new_prefs.maximum_area
        if new_prefs.view:
            current.view = new_prefs.view
        if new_prefs.floor_preference:
            current.floor_preference = new_prefs.floor_preference
        if new_prefs.orientation:
            current.orientation = new_prefs.orientation

        state.offset = 0
        return state

    @classmethod
    def update_lead_profile(
        cls,
        state: ConversationState,
        extraction: Any,  # ExtractionResult from profile_extractor
    ) -> ConversationState:
        """Apply extraction results to the lead profile.

        Identity fields (name, location, purpose) are set once and kept.
        Correctable fields (budget, timeline, view, floor, orientation) are
        always overwritten when a new value is extracted from the message.
        This allows corrections such as:
            'My budget is 2 crore' → later 'Actually 2.5 crore'
        to update the active value.
        """
        lp = state.lead_profile
        lp.interaction_count += 1

        # Identity — set once, never overwrite
        if extraction.name and not lp.name:
            lp.name = extraction.name
        if extraction.location and not lp.location:
            lp.location = extraction.location
        if extraction.buying_purpose and not lp.buying_purpose:
            lp.buying_purpose = extraction.buying_purpose

        # Always overwrite correctable fields when a new value is present
        if extraction.buying_timeline:
            lp.buying_timeline = extraction.buying_timeline
        if extraction.configuration and not lp.configuration:
            lp.configuration = extraction.configuration

        # Budget: always overwrite (most recent stated budget wins)
        if extraction.budget_min is not None:
            lp.budget_min = extraction.budget_min
        if extraction.budget_max is not None:
            lp.budget_max = extraction.budget_max

        # View / floor / orientation — overwrite with latest explicit statement
        if extraction.preferred_view:
            lp.preferred_view = extraction.preferred_view
        if extraction.preferred_floor:
            lp.preferred_floor = extraction.preferred_floor
        if extraction.preferred_orientation:
            lp.preferred_orientation = extraction.preferred_orientation

        # Phone / WhatsApp
        if extraction.phone and not lp.phone:
            lp.phone = extraction.phone
            lp.whatsapp_number = extraction.phone  # treat as WhatsApp by default
        if extraction.whatsapp_consent is not None:
            lp.whatsapp_consent = extraction.whatsapp_consent
            if extraction.whatsapp_consent is False:
                state.whatsapp_declined = True
                state.awaiting_consent = False
                state.awaiting_phone = False
            elif extraction.whatsapp_consent is True:
                state.awaiting_consent = False
                if not lp.whatsapp_number:
                    state.awaiting_phone = True
        if extraction.site_visit_interest:
            lp.site_visit_interest = True

        # Unit interest
        for uid in extraction.interested_unit_ids:
            if uid not in lp.interested_unit_ids:
                lp.interested_unit_ids.append(uid)

        # Cross-sync: keep preferences ↔ lead_profile in step
        if lp.configuration and (not state.preferences.configuration or state.preferences.configuration == "3BHK"):
            state.preferences.configuration = lp.configuration
        if lp.preferred_view:
            state.preferences.view = lp.preferred_view
        if lp.preferred_floor:
            state.preferences.floor_preference = lp.preferred_floor
        if lp.budget_max is not None:
            state.preferences.maximum_budget = lp.budget_max
        if lp.budget_min is not None:
            state.preferences.minimum_budget = lp.budget_min

        return state

    @classmethod
    def mark_recommendations(cls, state: ConversationState, unit_ids: list[str]) -> None:
        """Record units that were shown as recommendations."""
        for uid in unit_ids:
            if uid not in state.lead_profile.recommended_unit_ids:
                state.lead_profile.recommended_unit_ids.append(uid)
        state.last_recommendations = [{"unit_id": u} for u in unit_ids]

    @classmethod
    def record_unit_view(cls, state: ConversationState, unit_id: str) -> None:
        """Record that a unit was viewed."""
        if unit_id not in state.lead_profile.viewed_unit_ids:
            state.lead_profile.viewed_unit_ids.append(unit_id)

    @classmethod
    def advance_stage(cls, state: ConversationState) -> ConversationState:
        """Advance to the next logical stage based on current profile completeness."""
        lp = state.lead_profile
        current = state.stage

        if current == ConvStage.DISCOVERY and lp.name:
            state.stage = ConvStage.PROFILE_BUILDING
        elif current == ConvStage.PROFILE_BUILDING and lp.location and lp.buying_purpose:
            state.stage = ConvStage.REQUIREMENT_DISCOVERY
        elif current == ConvStage.REQUIREMENT_DISCOVERY and lp.configuration and lp.budget_max:
            state.stage = ConvStage.UNIT_RECOMMENDATION
        elif current == ConvStage.UNIT_RECOMMENDATION and lp.interested_unit_ids:
            state.stage = ConvStage.INTEREST_IDENTIFICATION
        elif current == ConvStage.INTEREST_IDENTIFICATION and not state.whatsapp_declined:
            state.stage = ConvStage.CONTACT_PERMISSION
        elif current == ConvStage.CONTACT_PERMISSION and lp.whatsapp_consent is True:
            state.stage = ConvStage.CONTACT_CAPTURE
        elif current == ConvStage.CONTACT_CAPTURE and lp.whatsapp_number:
            state.stage = ConvStage.SALES_HANDOFF

        return state

    @classmethod
    def has_collected(cls, state: ConversationState, field: str) -> bool:
        """Check if a profile field has already been collected."""
        return bool(getattr(state.lead_profile, field, None))

    @classmethod
    def has_asked(cls, state: ConversationState, question_key: str) -> bool:
        """Check if we have already asked about this topic."""
        return question_key in state.questions_asked

    @classmethod
    def mark_asked(cls, state: ConversationState, question_key: str) -> None:
        """Record that we asked about this topic."""
        if question_key not in state.questions_asked:
            state.questions_asked.append(question_key)

    @classmethod
    def get_profile_summary(cls, state: ConversationState) -> dict[str, Any]:
        """Return a clean dict of collected profile fields for the frontend panel."""
        lp = state.lead_profile
        result: dict[str, Any] = {}
        if lp.name:
            result["name"] = lp.name
        if lp.location:
            result["location"] = lp.location
        if lp.buying_purpose:
            result["purpose"] = lp.buying_purpose
        if lp.configuration:
            result["configuration"] = lp.configuration
        if lp.budget_max is not None:
            crore = lp.budget_max / 10_000_000
            if lp.budget_min is not None:
                lo = lp.budget_min / 10_000_000
                result["budget"] = f"₹{lo:.1f}–{crore:.1f} Cr"
            else:
                result["budget"] = f"Up to ₹{crore:.1f} Cr"
        if lp.preferred_view:
            result["view"] = lp.preferred_view.replace("_", " ").title()
        if lp.preferred_floor:
            result["floor"] = lp.preferred_floor.replace("_", " ").title()
        if lp.buying_timeline:
            result["timeline"] = lp.buying_timeline
        if lp.interested_unit_ids:
            result["interested_units"] = lp.interested_unit_ids
        result["stage"] = state.stage.value
        result["lead_score"] = lp.lead_score
        return result

    # ── Legacy helpers (unchanged) ─────────────────────────────────────────────

    @classmethod
    def reject_unit(cls, state: ConversationState, unit_number: str) -> ConversationState:
        """Add unit number to rejected_units list."""
        if unit_number not in state.rejected_units:
            state.rejected_units.append(unit_number)
        return state

    @classmethod
    def next_page(cls, state: ConversationState, page_size: int = 3) -> ConversationState:
        """Increment recommendation pagination offset."""
        state.offset += page_size
        return state

    @classmethod
    def should_clarify(cls, user_message: str, state: ConversationState) -> bool:
        """Check if prompt is ambiguous and requires clarification before recommending."""
        msg_lower = user_message.lower()
        ambiguous_triggers = ["best apartment", "show me units", "recommend something", "what do you have"]
        is_ambiguous = any(t in msg_lower for t in ambiguous_triggers)
        has_no_prefs = (
            state.preferences.maximum_budget is None
            and state.preferences.view is None
            and state.preferences.minimum_area is None
        )
        return is_ambiguous and has_no_prefs

    @classmethod
    def refine_weights_from_text(cls, user_message: str, state: ConversationState) -> ConversationState:
        """Map user priority statements to validated ScoringWeightsConfig."""
        msg_lower = user_message.lower()
        weights = ScoringWeightsConfig()

        if "view is more important" in msg_lower or "prioritize view" in msg_lower:
            weights = ScoringWeightsConfig(
                budget_weight=25.0, view_weight=40.0, area_weight=15.0,
                floor_weight=10.0, orientation_weight=10.0,
            )
        elif "budget is more important" in msg_lower or "prioritize budget" in msg_lower or "cheaper" in msg_lower:
            weights = ScoringWeightsConfig(
                budget_weight=50.0, view_weight=20.0, area_weight=15.0,
                floor_weight=10.0, orientation_weight=5.0,
            )
        elif "higher floor" in msg_lower or "prioritize floor" in msg_lower:
            weights = ScoringWeightsConfig(
                budget_weight=25.0, view_weight=20.0, area_weight=15.0,
                floor_weight=30.0, orientation_weight=10.0,
            )

        state.scoring_weights = weights
        return state
