"""Phase 7.5: Deterministic profile extractor for the AI Consultant.

Extracts visitor profile data from natural language messages using only
rule-based regex patterns. The LLM is never involved in data extraction —
all profile fields come from deterministic code.

Supported extractions:
- Name (from "I'm Rahul", "My name is Priya", etc.)
- Location (city mentions)
- Budget (₹3 Cr, 2.5 crore, under 3 crore, 2–3 Cr)
- Configuration (3BHK, 3 bedroom, 4BHK)
- Buying purpose (self use, investment, family, second home)
- Buying timeline (immediately, 3 months, 6 months, just exploring)
- Phone / WhatsApp number (Indian E.164 normalization)
- WhatsApp consent (yes/no)
- Unit interest (I like A-1203, interested in unit B-1402)
- Site visit interest
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Optional


# ── Indian city list (common metro + tier-2) ──────────────────────────────────
_INDIAN_CITIES = {
    "hyderabad", "bangalore", "bengaluru", "mumbai", "delhi", "chennai",
    "kolkata", "pune", "ahmedabad", "jaipur", "surat", "lucknow", "kanpur",
    "nagpur", "indore", "bhopal", "visakhapatnam", "vizag", "patna", "vadodara",
    "ghaziabad", "ludhiana", "agra", "nashik", "faridabad", "meerut", "rajkot",
    "kalyan", "vasai", "varanasi", "srinagar", "aurangabad", "dhanbad",
    "amritsar", "navi mumbai", "allahabad", "prayagraj", "howrah", "ranchi",
    "gwalior", "jabalpur", "coimbatore", "vijayawada", "jodhpur", "madurai",
    "raipur", "kota", "chandigarh", "guwahati", "solapur", "hubli", "dharwad",
    "bareilly", "moradabad", "mysore", "mysuru", "tiruchirappalli", "tirupur",
    "noida", "gurugram", "gurgaon", "nri", "usa", "uk", "uae", "dubai",
    "singapore", "australia", "canada", "germany",
}

# ── Budget parsing patterns ───────────────────────────────────────────────────
_BUDGET_PATTERNS = [
    # "2.5 to 3 crore" / "2.5–3 Cr"
    r"(?:₹\s*)?(\d+(?:\.\d+)?)\s*(?:to|-|–)\s*(\d+(?:\.\d+)?)\s*(?:crore|cr|crores)\b",
    # "under 3 crore" / "up to 3 Cr" / "within 3 Cr"
    r"(?:under|upto|up\s+to|within|below|max|maximum)\s+(?:₹\s*)?(\d+(?:\.\d+)?)\s*(?:crore|cr|crores)\b",
    # "around 3 crore" / "₹3 Cr" / "3.5 crore"
    r"(?:around|about|approximately|roughly|~)?\s*(?:₹\s*)?(\d+(?:\.\d+)?)\s*(?:crore|cr|crores)\b",
    # lakh patterns for smaller budgets
    r"(?:₹\s*)?(\d+(?:\.\d+)?)\s*(?:lakh|l|lakhs)\b",
]

# ── Configuration patterns ────────────────────────────────────────────────────
_CONFIG_PATTERN = re.compile(
    r"\b([2-6])\s*(?:bhk|bedroom|bed\s*room|br)\b"
    r"|\b([2-6])BHK\b"
    r"|\b(studio|1rk|1\s*rk)\b",
    re.IGNORECASE,
)

# ── Name extraction patterns ──────────────────────────────────────────────────
_NAME_PATTERNS = [
    re.compile(r"\bi(?:'m|\s+am)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)", re.IGNORECASE),
    re.compile(r"\bmy\s+name\s+is\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)", re.IGNORECASE),
    re.compile(r"\bcall\s+me\s+([A-Z][a-z]+)\b", re.IGNORECASE),
    re.compile(r"^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s*(?:here|speaking|this\s+side)?\s*[.,!]?\s*$"),
    re.compile(r"^([A-Z][a-z]+)\s*$"),  # single-word message that is a name
]

# ── Phone/WhatsApp number patterns ───────────────────────────────────────────
_PHONE_PATTERN = re.compile(
    r"\b(?:\+91[-\s]?|91[-\s]?|0)?([6-9]\d{9})\b"
)

# ── Consent patterns ─────────────────────────────────────────────────────────
_CONSENT_YES = re.compile(
    r"\b(?:yes|yeah|sure|of\s+course|please\s+do|go\s+ahead|ok|okay|definitely|absolutely)\b",
    re.IGNORECASE,
)
_CONSENT_NO = re.compile(
    r"\b(?:no|nope|not\s+now|not\s+interested|skip|don.?t|prefer\s+not|no\s+thanks)\b",
    re.IGNORECASE,
)

# ── Unit interest patterns ────────────────────────────────────────────────────
_UNIT_INTEREST_PATTERN = re.compile(
    r"(?:unit|residence|flat|apartment)?\s*([A-Z]-?\d{3,4}|[A-Z]\d{3,4})\b",
    re.IGNORECASE,
)
_UNIT_LIKE_PATTERN = re.compile(
    r"\b(?:i\s+like|i\s+love|interested\s+in|prefer|that\s+one|first\s+one|second\s+one|third\s+one|book\s+this|want\s+this)\b",
    re.IGNORECASE,
)

# ── Buying purpose patterns ───────────────────────────────────────────────────
_PURPOSE_SELF_USE = re.compile(
    r"\b(?:family|self[\s-]use|self\s+use|end[\s-]use|live\s+in|to\s+live|personal|my\s+home|our\s+home|children|parents)\b",
    re.IGNORECASE,
)
_PURPOSE_INVESTMENT = re.compile(
    r"\b(?:investment|invest|rental\s+yield|rental\s+income|portfolio|return|roi)\b",
    re.IGNORECASE,
)
_PURPOSE_SECOND_HOME = re.compile(
    r"\b(?:second\s+home|holiday\s+home|weekend\s+home|vacation\s+home)\b",
    re.IGNORECASE,
)

# ── Timeline patterns ─────────────────────────────────────────────────────────
_TIMELINE_PATTERNS = {
    "immediately": re.compile(r"\b(?:immediately|asap|right\s+away|urgently)\b", re.IGNORECASE),
    "1-3 months": re.compile(r"\b(?:1|2|3)\s*(?:-|to)\s*(?:3|4)\s*month", re.IGNORECASE),
    "3-6 months": re.compile(r"\b(?:3|4|5|6)\s*(?:-|to)\s*(?:6|7|8)\s*month", re.IGNORECASE),
    "6-12 months": re.compile(r"\b(?:6|7|8|9|10|11|12)\s*month|\b(?:half|one)\s*year\b", re.IGNORECASE),
    "just exploring": re.compile(r"\b(?:exploring|researching|just\s+looking|not\s+sure|no\s+rush|sometime|later|future|right\s+now)\b", re.IGNORECASE),
}

# ── Site visit patterns ───────────────────────────────────────────────────────
_SITE_VISIT_PATTERN = re.compile(
    r"\b(?:visit|site\s+visit|come\s+and\s+see|would\s+like\s+to\s+visit|schedule\s+a\s+visit|tour)\b",
    re.IGNORECASE,
)


@dataclass
class ExtractionResult:
    """All profile fields that could be extracted from a single message."""

    name: Optional[str] = None
    location: Optional[str] = None
    budget_min: Optional[float] = None
    budget_max: Optional[float] = None
    configuration: Optional[str] = None
    buying_purpose: Optional[str] = None
    buying_timeline: Optional[str] = None
    phone: Optional[str] = None
    whatsapp_consent: Optional[bool] = None
    interested_unit_ids: list[str] = field(default_factory=list)
    site_visit_interest: Optional[bool] = None
    raw_text: str = ""


class ProfileExtractor:
    """Deterministic, regex-based profile extractor.

    Every field is extracted by rule — never by LLM inference.
    Returns an ExtractionResult with only the fields present in the text.
    """

    # ── Name ──────────────────────────────────────────────────────────────────

    @staticmethod
    def extract_name(text: str) -> Optional[str]:
        """Extract a person name from natural language. Returns None if not found."""
        t = text.strip()
        for pattern in _NAME_PATTERNS:
            m = pattern.search(t)
            if m:
                name = m.group(1).strip()
                # Filter out common non-name words
                if name.lower() not in {
                    "looking", "interested", "amnaya", "okay", "sure",
                    "bangalore", "hyderabad", "mumbai", "delhi", "pune",
                }:
                    return name.title()
        return None

    # ── Location ──────────────────────────────────────────────────────────────

    @staticmethod
    def extract_location(text: str) -> Optional[str]:
        """Extract city/location. Checks against known Indian city list."""
        lower = text.lower()
        # "based in", "from", "currently in", "living in" patterns
        loc_patterns = [
            re.compile(r"\b(?:based\s+in|from|currently\s+in|living\s+in|i(?:'m|\s+am)\s+in)\s+([a-z\s]+?)(?:\s*[.,!?]|$)", re.IGNORECASE),
            re.compile(r"\b(?:in|at)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:right\s+now|currently|now)", re.IGNORECASE),
        ]
        for pattern in loc_patterns:
            m = pattern.search(text)
            if m:
                city = m.group(1).strip().rstrip(",.!?").lower()
                if city in _INDIAN_CITIES or any(c in city for c in _INDIAN_CITIES):
                    return city.title()

        # Direct city mention
        for city in sorted(_INDIAN_CITIES, key=len, reverse=True):  # longest first
            if re.search(r"\b" + re.escape(city) + r"\b", lower):
                return city.title()
        return None

    # ── Budget ────────────────────────────────────────────────────────────────

    @staticmethod
    def extract_budget(text: str) -> tuple[Optional[float], Optional[float]]:
        """Extract budget range in INR. Returns (min_inr, max_inr)."""
        lower = text.lower()

        # Range pattern: "2.5 to 3 crore"
        range_match = re.search(
            r"(?:₹\s*)?(\d+(?:\.\d+)?)\s*(?:to|-|–)\s*(\d+(?:\.\d+)?)\s*(?:crore|cr|crores)\b",
            lower,
        )
        if range_match:
            lo = float(range_match.group(1)) * 10_000_000
            hi = float(range_match.group(2)) * 10_000_000
            return lo, hi

        # Upper-bound pattern: "under 3 crore", "up to 3 Cr", "max 3 Cr"
        upper_match = re.search(
            r"(?:under|upto|up\s+to|within|below|max|maximum)\s+(?:₹\s*)?(\d+(?:\.\d+)?)\s*(?:crore|cr|crores)\b",
            lower,
        )
        if upper_match:
            return None, float(upper_match.group(1)) * 10_000_000

        # Approximate/exact: "around 3 crore", "₹3 Cr", "3.5 crore"
        approx_match = re.search(
            r"(?:around|about|approximately|roughly|~)?\s*(?:₹\s*)?(\d+(?:\.\d+)?)\s*(?:crore|cr|crores)\b",
            lower,
        )
        if approx_match:
            val = float(approx_match.group(1)) * 10_000_000
            # Return as upper bound only (exact value from user)
            return None, val

        # Lakh amounts
        lakh_match = re.search(
            r"(?:₹\s*)?(\d+(?:\.\d+)?)\s*(?:lakh|l|lakhs)\b",
            lower,
        )
        if lakh_match:
            val = float(lakh_match.group(1)) * 100_000
            return val * 0.9, val * 1.1

        return None, None

    # ── Configuration ─────────────────────────────────────────────────────────

    @staticmethod
    def extract_configuration(text: str) -> Optional[str]:
        """Extract BHK configuration. Returns normalized string like '3BHK'."""
        m = _CONFIG_PATTERN.search(text)
        if not m:
            return None
        if m.group(3):
            return m.group(3).upper().replace(" ", "")
        beds = m.group(1) or m.group(2)
        return f"{beds}BHK"

    # ── Buying purpose ────────────────────────────────────────────────────────

    @staticmethod
    def extract_purpose(text: str) -> Optional[str]:
        """Extract buying purpose: self_use, investment, or second_home."""
        if _PURPOSE_SECOND_HOME.search(text):
            return "second_home"
        if _PURPOSE_INVESTMENT.search(text):
            return "investment"
        if _PURPOSE_SELF_USE.search(text):
            return "self_use"
        return None

    # ── Timeline ──────────────────────────────────────────────────────────────

    @staticmethod
    def extract_timeline(text: str) -> Optional[str]:
        """Extract buying timeline."""
        for label, pattern in _TIMELINE_PATTERNS.items():
            if pattern.search(text):
                return label
        return None

    # ── Phone ─────────────────────────────────────────────────────────────────

    @staticmethod
    def extract_phone(text: str) -> Optional[str]:
        """Extract and normalize Indian phone number to E.164 format (+91XXXXXXXXXX)."""
        # First try phonenumbers library for most robust parsing
        try:
            import phonenumbers
            for match in phonenumbers.PhoneNumberMatcher(text, "IN"):
                num = match.number
                if phonenumbers.is_valid_number(num):
                    return phonenumbers.format_number(num, phonenumbers.PhoneNumberFormat.E164)
        except Exception:
            pass
        # Fallback: regex on cleaned text
        cleaned = re.sub(r"[\s\-\(\)]", "", text)
        m = _PHONE_PATTERN.search(cleaned)
        if m:
            digits = m.group(1)
            if len(digits) == 10 and digits[0] in "6789":
                return f"+91{digits}"
        return None

    @staticmethod
    def normalize_phone(raw: str, default_region: str = "IN") -> Optional[str]:
        """Normalize any phone string to E.164. Returns None if invalid."""
        try:
            import phonenumbers
            num = phonenumbers.parse(raw, default_region)
            if phonenumbers.is_valid_number(num):
                return phonenumbers.format_number(num, phonenumbers.PhoneNumberFormat.E164)
        except Exception:
            pass
        # Fallback regex for plain Indian numbers
        digits = re.sub(r"\D", "", raw)
        if len(digits) == 10 and digits[0] in "6789":
            return f"+91{digits}"
        if len(digits) == 12 and digits.startswith("91") and digits[2] in "6789":
            return f"+{digits}"
        return None

    @staticmethod
    def is_valid_indian_phone(phone: str) -> bool:
        """Validate an E.164 Indian phone number."""
        try:
            import phonenumbers
            num = phonenumbers.parse(phone, "IN")
            return phonenumbers.is_valid_number(num)
        except Exception:
            pass
        return bool(re.match(r"^\+91[6-9]\d{9}$", phone))

    # ── WhatsApp consent ──────────────────────────────────────────────────────

    @staticmethod
    def extract_whatsapp_consent(text: str) -> Optional[bool]:
        """Extract explicit WhatsApp consent from the message."""
        if _CONSENT_NO.search(text):
            return False
        if _CONSENT_YES.search(text):
            return True
        return None

    # ── Unit interest ─────────────────────────────────────────────────────────

    @staticmethod
    def extract_unit_interest(text: str, recommendations: list[str] | None = None) -> list[str]:
        """Extract unit IDs that the visitor shows interest in.

        Also resolves ordinal references ("first one", "the first") against
        the current recommendation list.
        """
        interested: list[str] = []
        lower = text.lower()

        # Direct unit code mentions (A-1203, B1402, etc.)
        for m in _UNIT_INTEREST_PATTERN.finditer(text):
            uid = m.group(1).upper().replace("-", "")
            # Normalize: add dash if pattern is LetterDigits (e.g. A1203 → A-1203)
            if len(uid) >= 4 and uid[0].isalpha() and uid[1].isdigit():
                uid = f"{uid[0]}-{uid[1:]}"
            interested.append(uid)

        # Ordinal resolution against recommendations
        if recommendations and _UNIT_LIKE_PATTERN.search(text):
            ordinals = {
                "first": 0, "1st": 0,
                "second": 1, "2nd": 1,
                "third": 2, "3rd": 2,
                "that": 0,  # "that one" → first shown
            }
            for word, idx in ordinals.items():
                if word in lower and idx < len(recommendations):
                    uid = recommendations[idx]
                    if uid not in interested:
                        interested.append(uid)

        return list(dict.fromkeys(interested))  # deduplicate preserving order

    # ── Site visit ────────────────────────────────────────────────────────────

    @staticmethod
    def extract_site_visit_interest(text: str) -> bool:
        """Return True if the message expresses site visit interest."""
        return bool(_SITE_VISIT_PATTERN.search(text))

    # ── Full extraction ───────────────────────────────────────────────────────

    def extract(
        self,
        text: str,
        recommendations: list[str] | None = None,
        awaiting_consent: bool = False,
        awaiting_phone: bool = False,
    ) -> ExtractionResult:
        """Run all extractors on a single message and return aggregated result."""
        result = ExtractionResult(raw_text=text)

        result.name = self.extract_name(text)
        result.location = self.extract_location(text)
        result.configuration = self.extract_configuration(text)
        result.buying_purpose = self.extract_purpose(text)
        result.buying_timeline = self.extract_timeline(text)
        result.interested_unit_ids = self.extract_unit_interest(text, recommendations)
        result.site_visit_interest = self.extract_site_visit_interest(text) or None

        bmin, bmax = self.extract_budget(text)
        result.budget_min = bmin
        result.budget_max = bmax

        # Phone extraction: only run when actively waiting for phone
        if awaiting_phone:
            result.phone = self.extract_phone(text)

        # WhatsApp consent: run when actively waiting for consent, or if explicit
        result.whatsapp_consent = self.extract_whatsapp_consent(text)

        return result


# Module-level singleton
profile_extractor = ProfileExtractor()
