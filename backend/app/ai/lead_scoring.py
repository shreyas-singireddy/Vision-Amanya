"""Phase 7.5: Configurable, deterministic lead scoring engine.

Score is computed from 5 dimensions, each with configurable weights.
The LLM never influences the score.

Dimensions:
  CONTACT:       Known phone / WhatsApp / consent
  INTENT:        Explicit purpose / investment / buying timeline
  PROPERTY_FIT:  Configuration, budget, view, floor, orientation
  ENGAGEMENT:    Unit viewed, shortlisted, multiple interactions
  ACTION:        Site visit requested, WhatsApp sent, callback

Temperature thresholds (configurable via env):
  0–30   = COLD
  31–60  = WARM
  61–80  = HOT
  81–100 = HIGH_INTENT
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from app.models.enums import LeadTemperature


@dataclass
class ScoreBreakdown:
    """Per-dimension score breakdown for transparency."""

    contact: int = 0
    intent: int = 0
    property_fit: int = 0
    engagement: int = 0
    action: int = 0
    total: int = 0
    temperature: LeadTemperature = LeadTemperature.COLD
    details: dict[str, Any] = field(default_factory=dict)


# Default thresholds — overridden by env settings if present
_DEFAULT_THRESHOLDS = {
    "cold_max": 30,
    "warm_max": 60,
    "hot_max": 80,
    # 81–100 = HIGH_INTENT
}


def _load_thresholds() -> dict[str, int]:
    """Load score thresholds from environment/config, falling back to defaults."""
    try:
        from app.core.config import settings  # type: ignore[import-untyped]
        return {
            "cold_max": getattr(settings, "LEAD_SCORE_COLD_MAX", _DEFAULT_THRESHOLDS["cold_max"]),
            "warm_max": getattr(settings, "LEAD_SCORE_WARM_MAX", _DEFAULT_THRESHOLDS["warm_max"]),
            "hot_max": getattr(settings, "LEAD_SCORE_HOT_MAX", _DEFAULT_THRESHOLDS["hot_max"]),
        }
    except Exception:
        return _DEFAULT_THRESHOLDS


def temperature_from_score(score: int) -> LeadTemperature:
    """Convert numeric score to lead temperature using configured thresholds."""
    t = _load_thresholds()
    if score <= t["cold_max"]:
        return LeadTemperature.COLD
    if score <= t["warm_max"]:
        return LeadTemperature.WARM
    if score <= t["hot_max"]:
        return LeadTemperature.HOT
    return LeadTemperature.HIGH_INTENT


class LeadScoringEngine:
    """Multi-dimensional, deterministic lead scoring.

    Call ``score(profile_dict)`` where ``profile_dict`` is a flat mapping
    of profile field names to their current values.

    Expected keys (all optional):
        name, phone, whatsapp_number, whatsapp_consent,
        location, buying_purpose, buying_timeline, budget_min, budget_max,
        configuration, preferred_view, preferred_floor, preferred_orientation,
        interested_unit_ids, viewed_unit_ids, recommended_unit_ids,
        site_visit_interest, interaction_count.
    """

    # ── Scoring tables (max points per signal) ────────────────────────────────

    CONTACT_SIGNALS = {
        "name_known":          5,
        "phone_known":         10,
        "whatsapp_known":      10,
        "whatsapp_consent":    5,
    }

    INTENT_SIGNALS = {
        "purpose_self_use":    5,
        "purpose_investment":  10,
        "purpose_second_home": 7,
        "timeline_immediate":  10,
        "timeline_1_3mo":      8,
        "timeline_3_6mo":      5,
        "timeline_6_12mo":     3,
        "timeline_exploring":  0,
    }

    PROPERTY_FIT_SIGNALS = {
        "budget_known":        15,
        "configuration_known": 10,
        "view_preference":     5,
        "floor_preference":    5,
        "orientation_known":   3,
    }

    ENGAGEMENT_SIGNALS = {
        "unit_viewed":         5,
        "unit_shortlisted":    10,
        "unit_compared":       3,
        "multi_interaction":   5,   # >3 meaningful turns
    }

    ACTION_SIGNALS = {
        "site_visit_interest": 10,
        "whatsapp_sent":       5,
    }

    MAX_SCORE = 100

    def score(self, profile: dict[str, Any]) -> ScoreBreakdown:
        """Compute score from a profile dict. Never raises — always returns a valid result."""
        breakdown = ScoreBreakdown()
        details: dict[str, Any] = {}

        # CONTACT dimension
        c = 0
        if profile.get("name"):
            c += self.CONTACT_SIGNALS["name_known"]
            details["name_known"] = True
        if profile.get("phone") or profile.get("whatsapp_number"):
            c += self.CONTACT_SIGNALS["phone_known"]
            details["phone_known"] = True
        if profile.get("whatsapp_number"):
            c += self.CONTACT_SIGNALS["whatsapp_known"]
            details["whatsapp_known"] = True
        if profile.get("whatsapp_consent"):
            c += self.CONTACT_SIGNALS["whatsapp_consent"]
            details["whatsapp_consent"] = True
        breakdown.contact = c

        # INTENT dimension
        i = 0
        purpose = profile.get("buying_purpose", "")
        if purpose == "self_use":
            i += self.INTENT_SIGNALS["purpose_self_use"]
            details["purpose"] = "self_use"
        elif purpose == "investment":
            i += self.INTENT_SIGNALS["purpose_investment"]
            details["purpose"] = "investment"
        elif purpose == "second_home":
            i += self.INTENT_SIGNALS["purpose_second_home"]
            details["purpose"] = "second_home"

        timeline = profile.get("buying_timeline", "")
        if timeline == "immediately":
            i += self.INTENT_SIGNALS["timeline_immediate"]
        elif timeline == "1-3 months":
            i += self.INTENT_SIGNALS["timeline_1_3mo"]
        elif timeline == "3-6 months":
            i += self.INTENT_SIGNALS["timeline_3_6mo"]
        elif timeline == "6-12 months":
            i += self.INTENT_SIGNALS["timeline_6_12mo"]
        if timeline:
            details["timeline"] = timeline
        breakdown.intent = i

        # PROPERTY FIT dimension
        p = 0
        if profile.get("budget_min") is not None or profile.get("budget_max") is not None:
            p += self.PROPERTY_FIT_SIGNALS["budget_known"]
            details["budget_known"] = True
        if profile.get("configuration"):
            p += self.PROPERTY_FIT_SIGNALS["configuration_known"]
            details["configuration"] = profile["configuration"]
        if profile.get("preferred_view"):
            p += self.PROPERTY_FIT_SIGNALS["view_preference"]
        if profile.get("preferred_floor"):
            p += self.PROPERTY_FIT_SIGNALS["floor_preference"]
        if profile.get("preferred_orientation"):
            p += self.PROPERTY_FIT_SIGNALS["orientation_known"]
        breakdown.property_fit = p

        # ENGAGEMENT dimension
        e = 0
        viewed = profile.get("viewed_unit_ids") or []
        interested = profile.get("interested_unit_ids") or []
        compared = profile.get("compared_unit_ids") or []
        if viewed:
            e += self.ENGAGEMENT_SIGNALS["unit_viewed"]
            details["units_viewed"] = len(viewed)
        if interested:
            e += self.ENGAGEMENT_SIGNALS["unit_shortlisted"]
            details["units_shortlisted"] = len(interested)
        if compared:
            e += self.ENGAGEMENT_SIGNALS["unit_compared"]
        if (profile.get("interaction_count") or 0) > 3:
            e += self.ENGAGEMENT_SIGNALS["multi_interaction"]
        breakdown.engagement = e

        # ACTION dimension
        a = 0
        if profile.get("site_visit_interest"):
            a += self.ACTION_SIGNALS["site_visit_interest"]
            details["site_visit_interest"] = True
        if profile.get("whatsapp_sent"):
            a += self.ACTION_SIGNALS["whatsapp_sent"]
        breakdown.action = a

        # Total (capped at MAX_SCORE)
        total = min(self.MAX_SCORE, c + i + p + e + a)
        breakdown.total = total
        breakdown.temperature = temperature_from_score(total)
        breakdown.details = details
        return breakdown


# Module-level singleton
lead_scoring_engine = LeadScoringEngine()
