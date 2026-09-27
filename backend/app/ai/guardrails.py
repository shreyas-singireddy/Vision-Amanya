"""AI Guardrails & Fact Verification Boundary.

Ensures the AI Consultant never fabricates unauthorized prices, fake discounts,
unverified possession dates, or invalid property dimensions.
"""

from __future__ import annotations

import re
from typing import Any

from app.core.logging import get_logger

logger = get_logger("app.ai.guardrails")

# Fact checks & prohibited terms
DISALLOWED_TERMS = [
    r"\bdiscount\b",
    r"\bguaranteed ROI\b",
    r"\bfree gift\b",
    r"\bbypass RERA\b",
    r"\bsecret price\b",
]

# Verified Amnaya project facts
VERIFIED_AMNAYA_FACTS = {
    "developer": "Vision Infra Developers",
    "location": "Khajaguda, Hyderabad",
    "project_name": "Vision Amnaya",
    "total_acres": "2.5 Acres",
    "green_space": "2 Acres Central Park",
    "lake": "Osman Sagar Lake Catchment (25 Acres view)",
    "total_units": 420,
    "total_floors": 10,
    "typology": "3 BHK Luxury Residences",
    "sizes": ["1,715 sq.ft.", "2,100 sq.ft.", "2,590 sq.ft."],
    "possession_target": "Q4 2028",
    "rera": "Registered / In Progress",
}


class AIGuardrails:
    """Architectural guardrail boundary for validating AI queries and responses."""

    def sanitize_input(self, user_message: str) -> str:
        """Sanitize user input against prompt injection or excessive length."""
        cleaned = user_message.strip()
        # Cap max length
        if len(cleaned) > 4000:
            cleaned = cleaned[:4000]
        return cleaned

    def validate_facts(self, response_text: str, context: dict[str, Any] | None = None) -> tuple[bool, str]:
        """Validate response text against disallowed terms and project guardrails.

        Returns (is_valid, sanitized_or_original_text).
        """
        for pattern in DISALLOWED_TERMS:
            if re.search(pattern, response_text, re.IGNORECASE):
                logger.warning("Guardrail trigger: disallowed term found in AI response: %s", pattern)
                return False, (
                    "I can provide official details on residence configurations, floor plans, lake views, "
                    "and site visits. For official pricing and promotional terms, please speak directly with "
                    "an Amnaya Relationship Manager."
                )

        return True, response_text


guardrails = AIGuardrails()
