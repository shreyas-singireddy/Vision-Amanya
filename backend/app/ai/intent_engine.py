"""Intent Engine & Entity Extractor for Amnaya AI Consultant."""

from __future__ import annotations

import re
from typing import Any

from app.schemas.ai import AIChatContext, IntentClassificationResult, PropertyPreferences


class IntentEngine:
    """Classifies user queries into 21 controlled intents and extracts normalized property preferences."""

    INTENTS = {
        "project_information",
        "location_information",
        "amenity_information",
        "specification_information",
        "unit_search",
        "unit_recommendation",
        "unit_details",
        "unit_comparison",
        "floor_plan_information",
        "floor_plan_navigation",
        "pricing_information",
        "availability_information",
        "investment_information",
        "financing_information",
        "emi_calculation",
        "site_visit",
        "lead_capture",
        "human_handoff",
        "general_conversation",
        "unsupported_request",
        "unknown",
    }

    @staticmethod
    def normalize_budget(text: str) -> tuple[float | None, float | None, float | None]:
        """Extract and normalize budget strings to numeric INR values.

        Returns (budget, minimum_budget, maximum_budget) in INR.
        """
        lower = text.lower()
        budget: float | None = None
        min_b: float | None = None
        max_b: float | None = None

        # Range: "between 2 and 3 crore", "2 to 3 cr"
        range_match = re.search(r"between\s+(\d+(?:\.\d+)?)\s*(?:and|to|-)\s*(\d+(?:\.\d+)?)\s*(?:cr|crore|crores)?", lower)
        if range_match:
            v1 = float(range_match.group(1)) * 10_000_000
            v2 = float(range_match.group(2)) * 10_000_000
            return (None, v1, v2)

        # Max budget: "under 3 crore", "less than 2.5 cr", "within 3 cr"
        max_match = re.search(r"(?:under|less than|within|below|max|maximum)\s*(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(?:cr|crore|crores)?", lower)
        if max_match:
            max_b = float(max_match.group(1)) * 10_000_000
            return (None, None, max_b)

        # Direct budget: "around 2.5 crore", "budget is 3 cr", "250 lakhs"
        cr_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:cr|crore|crores)", lower)
        if cr_match:
            budget = float(cr_match.group(1)) * 10_000_000
            return (budget, None, None)

        lakh_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:lakh|lakhs|l)", lower)
        if lakh_match:
            budget = float(lakh_match.group(1)) * 100_000
            return (budget, None, None)

        return (None, None, None)

    @staticmethod
    def normalize_area(text: str) -> tuple[float | None, float | None, float | None]:
        """Extract and normalize area strings to sq ft.

        Returns (area, minimum_area, maximum_area) in sq ft.
        """
        lower = text.lower()

        range_match = re.search(r"between\s+(\d+)\s*(?:and|to|-)\s*(\d+)\s*(?:sqft|sq\s*ft|square\s*feet)?", lower)
        if range_match:
            return (None, float(range_match.group(1)), float(range_match.group(2)))

        min_match = re.search(r"(?:at least|minimum|min|above)\s*(\d+)\s*(?:sqft|sq\s*ft|square\s*feet)?", lower)
        if min_match:
            return (None, float(min_match.group(1)), None)

        sqft_match = re.search(r"(\d{4})\s*(?:sqft|sq\s*ft|square\s*feet)?", lower)
        if sqft_match:
            return (float(sqft_match.group(1)), None, None)

        return (None, None, None)

    @staticmethod
    def extract_unit_ids(text: str) -> list[str]:
        """Extract 4-digit unit numbers (e.g. 1804, 1601, 2202)."""
        matches = re.findall(r"\b([1-9]\d{3})\b", text)
        return list(dict.fromkeys(matches))

    def extract_preferences(self, prompt: str, history: list[dict[str, Any]] | None = None) -> PropertyPreferences:
        """Extract and accumulate normalized property preferences across history."""
        prefs = PropertyPreferences()

        # Combine text across turn history for multi-turn preference accumulation
        combined_text = ""
        if history:
            for turn in history:
                if turn.get("role") == "user":
                    combined_text += f" {turn.get('content', '')}"
        combined_text += f" {prompt}"

        lower = combined_text.lower()

        # 1. Budget
        b, min_b, max_b = self.normalize_budget(combined_text)
        prefs.budget = b
        prefs.minimum_budget = min_b
        prefs.maximum_budget = max_b

        # 2. Area
        a, min_a, max_a = self.normalize_area(combined_text)
        prefs.area = a
        prefs.minimum_area = min_a
        prefs.maximum_area = max_a

        # 3. View
        if any(w in lower for w in ["lake", "lakefront", "lake-view", "lake facing", "water"]):
            prefs.view = "lake"
        elif any(w in lower for w in ["garden", "park", "green"]):
            prefs.view = "garden"

        # 4. Floor preference
        if any(w in lower for w in ["high", "higher", "top floor", "upper"]):
            prefs.floor_preference = "high"
        elif any(w in lower for w in ["low", "lower", "ground"]):
            prefs.floor_preference = "low"
        elif any(w in lower for w in ["mid", "middle"]):
            prefs.floor_preference = "mid"

        # 5. Unit IDs
        unit_ids = self.extract_unit_ids(combined_text)
        if unit_ids:
            prefs.unit_ids = unit_ids
            if len(unit_ids) == 1:
                prefs.unit_id = unit_ids[0]

        # 6. Orientation
        if "east" in lower and "north" in lower:
            prefs.orientation = "north-east"
        elif "east" in lower:
            prefs.orientation = "east"

        return prefs

    def classify(
        self,
        prompt: str,
        history: list[dict[str, Any]] | None = None,
        context: AIChatContext | None = None,
    ) -> IntentClassificationResult:
        """Classify prompt into intent taxonomy with confidence and extracted preferences."""
        lower = prompt.lower()
        prefs = self.extract_preferences(prompt, history)

        # 0. Deterministic Handoff Triggers
        if any(w in lower for w in [
            "speak to someone", "speak with someone", "talk to someone", "talk to a person", "talk to human",
            "sales consultant", "connect me", "human consultant", "talk to real person", "talk to a real person", "real person",
            "speak to a person", "speak with a person", "speak with a sales consultant", "talk to sales"
        ]):
            return IntentClassificationResult(intent="human_handoff", confidence=0.99, preferences=prefs)

        if any(w in lower for w in [
            "discount", "best price", "best offer", "reduce price", "reduce the price", "flexible in pricing",
            "flexibility in pricing", "special offer", "better price", "give me your best"
        ]):
            return IntentClassificationResult(intent="negotiation_request", confidence=0.98, preferences=prefs)

        if any(w in lower for w in ["custom requirement", "customization", "custom floor plan", "custom layout"]):
            return IntentClassificationResult(intent="custom_requirement", confidence=0.97, preferences=prefs)

        if any(w in lower for w in ["isn't in your information", "not in your data", "unverified", "unverified question", "unknown fact"]):
            return IntentClassificationResult(intent="unknown_verified_information", confidence=0.96, preferences=prefs)

        # 1. Out-of-Scope / Unsupported Requests (Code, Election, General AI)
        if any(w in lower for w in ["python", "code", "programming", "election", "who won", "write code", "javascript"]):
            return IntentClassificationResult(
                intent="unsupported_request",
                confidence=0.99,
                preferences=prefs,
                requires_clarification=False,
                clarification_prompt="I am the Amnaya Luxury Real-Estate Consultant. I can only assist with Amnaya residences, architecture, amenities, and site visits.",
            )

        # 2. Site Visit & Lead Capture
        if any(w in lower for w in ["visit", "schedule a visit", "tour", "book a visit", "see in person", "site visit"]):
            return IntentClassificationResult(intent="site_visit", confidence=0.98, preferences=prefs)

        if any(w in lower for w in ["contact", "call me", "phone", "sales manager", "agent call", "sales agent"]):
            return IntentClassificationResult(intent="lead_capture", confidence=0.97, preferences=prefs)

        # 3. Amenity Information (Checked before general availability)
        if any(w in lower for w in ["amenity", "amenities", "clubhouse", "pool", "gym", "garden"]):
            return IntentClassificationResult(intent="amenity_information", confidence=0.95, preferences=prefs)

        # 4. Location Information
        if any(w in lower for w in ["location", "khajaguda", "raidurg", "cyberabad", "where is"]):
            return IntentClassificationResult(intent="location_information", confidence=0.95, preferences=prefs)

        # 5. Specification Information
        if any(w in lower for w in ["specification", "specifications", "tile", "door", "window", "finish", "height"]):
            return IntentClassificationResult(intent="specification_information", confidence=0.95, preferences=prefs)

        # 6. Availability Check (Unit specific availability)
        if any(w in lower for w in ["currently available", "is unit", "availability"]):
            return IntentClassificationResult(intent="availability_information", confidence=0.94, preferences=prefs)

        # 7. Pricing & Finance
        if any(w in lower for w in ["price", "pricing", "cost", "payment schedule", "payment plan"]):
            return IntentClassificationResult(intent="pricing_information", confidence=0.92, preferences=prefs)

        if any(w in lower for w in ["emi", "loan", "financing", "calculator", "monthly payment"]):
            return IntentClassificationResult(intent="emi_calculation", confidence=0.91, preferences=prefs)

        # 8. Unit Comparison
        if len(prefs.unit_ids) >= 2 or any(w in lower for w in ["compare", "vs", "difference between"]):
            return IntentClassificationResult(intent="unit_comparison", confidence=0.95, preferences=prefs)

        # 9. Multi-turn Conversation & Recommendation Intents
        if any(w in lower for w in ["show more", "more options", "more units", "next page", "other options"]):
            return IntentClassificationResult(intent="show_more_units", confidence=0.97, preferences=prefs)

        if any(w in lower for w in ["don't like", "not interested", "hide unit", "reject"]):
            return IntentClassificationResult(intent="reject_unit", confidence=0.97, preferences=prefs)

        if any(w in lower for w in ["prioritize", "prefer", "cheaper", "more lake view", "higher floor"]):
            return IntentClassificationResult(intent="refine_recommendation", confidence=0.96, preferences=prefs)

        if any(w in lower for w in ["recommend", "ideal", "best for me", "suggest", "which unit", "best apartment"]):
            return IntentClassificationResult(intent="unit_recommendation", confidence=0.96, preferences=prefs)

        if any(w in lower for w in ["3bhk", "3 bhk", "apartments", "inventory", "search unit", "find unit", "show units"]):
            return IntentClassificationResult(intent="unit_search", confidence=0.94, preferences=prefs)

        # 9A. Explicit purchase constraints without a stronger intent signal
        # (e.g. "I want a lake-view residence under ₹3 crore") route to unit search.
        has_constraints = (
            prefs.maximum_budget is not None
            or prefs.minimum_budget is not None
            or (prefs.view is not None and any(w in lower for w in ["residence", "unit", "apartment", "flat", "bhk", "home"]))
        )
        if has_constraints and any(w in lower for w in ["want", "looking", "need", "show", "available", "residence", "unit", "apartment", "flat", "home"]):
            return IntentClassificationResult(intent="unit_search", confidence=0.93, preferences=prefs)

        # 10. Floor Plan & Visualization
        if any(w in lower for w in ["locate unit", "where is unit", "show unit", "show on floor plan", "see on map"]):
            return IntentClassificationResult(intent="locate_unit", confidence=0.98, preferences=prefs)

        if any(w in lower for w in ["3d", "3d model", "threejs", "virtual tour", "view in 3d"]):
            return IntentClassificationResult(intent="show_3d", confidence=0.97, preferences=prefs)

        if any(w in lower for w in ["floor plan", "layout", "dimensions", "room size", "balcony size"]):
            return IntentClassificationResult(intent="floor_plan_information", confidence=0.93, preferences=prefs)

        # 11. Project Overview & Facts
        if any(w in lower for w in ["project", "developer", "developing", "vision infra", "acres", "land area", "total units", "overview", "tell me about"]):
            return IntentClassificationResult(intent="project_information", confidence=0.96, preferences=prefs)

        # Default fallback
        return IntentClassificationResult(intent="general_conversation", confidence=0.85, preferences=prefs)


intent_engine = IntentEngine()
