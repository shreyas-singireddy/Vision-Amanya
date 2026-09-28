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
- View preference (lake, garden, city, pool)
- Floor preference (high, mid, low)
- Orientation (east, west, north, south facing)

Each extracted field is tagged with a FieldSource indicating whether
it was STATED (explicitly mentioned) or NORMALIZED (deterministically
derived). UNKNOWN is used when nothing could be extracted.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from enum import Enum
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
_NUM_WORDS = {
    "one": "1", "two": "2", "three": "3", "four": "4", "five": "5", "six": "6",
    "1": "1", "2": "2", "3": "3", "4": "4", "5": "5", "6": "6",
}
_CONFIG_PATTERN = re.compile(
    r"\b(one|two|three|four|five|six|[1-6])\s*(?:-|\s)?\s*(?:bhk|bedroom|bedrooms|bed\s*room|br)\b"
    r"|\b([1-6])BHK\b"
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

_NON_NAME_WORDS = {
    "looking", "interested", "amnaya", "okay", "sure", "bangalore",
    "hyderabad", "mumbai", "delhi", "pune", "searching", "planning",
    "trying", "buying", "here", "ready", "willing", "hoping", "just",
    "exploring", "new", "moving", "going", "thinking", "wanting",
    "calling", "speaking", "fine", "good", "hello", "hi", "hey",
    "need", "needing", "for", "a", "an", "the", "around", "and", "to",
}

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
    "immediately": re.compile(
        r"\b(?:immediately|asap|right\s+away|urgently|ready\s+to\s+move|immediate)\b",
        re.IGNORECASE,
    ),
    "1-3 months": re.compile(
        r"\b(?:within|in|under|around|next)?\s*(?:1|2|3|one|two|three|90\s*days)\s*(?:month|months|days)\b"
        r"|\b(?:1|2|3)\s*(?:-|to)\s*(?:3|4)\s*month",
        re.IGNORECASE,
    ),
    "3-6 months": re.compile(
        r"\b(?:within|in|under|around|next)?\s*(?:3|4|5|6|three|four|five|six)\s*(?:month|months)\b"
        r"|\b(?:3|4|5|6)\s*(?:-|to)\s*(?:6|7|8)\s*month",
        re.IGNORECASE,
    ),
    "6-12 months": re.compile(
        r"\b(?:within|in|under|around|next)?\s*(?:6|7|8|9|10|11|12)\s*(?:month|months)\b|\b(?:half|one)\s*year\b"
        r"|\b(?:6|7|8|9|10|11|12)\s*(?:-|to)\s*(?:12|18)\s*month",
        re.IGNORECASE,
    ),
    "just exploring": re.compile(
        r"\b(?:exploring|researching|just\s+looking|not\s+sure|no\s+rush|sometime|later|future)\b",
        re.IGNORECASE,
    ),
}

# ── Site visit patterns ───────────────────────────────────────────────────────
_SITE_VISIT_PATTERN = re.compile(
    r"\b(?:visit|site\s+visit|come\s+and\s+see|would\s+like\s+to\s+visit|schedule\s+a\s+visit|tour)\b",
    re.IGNORECASE,
)

# ── View preference patterns ──────────────────────────────────────────────────
_VIEW_PATTERNS: dict[str, re.Pattern[str]] = {
    "lake": re.compile(
        r"\b(?:lake[\s-]?(?:view|facing)|lake|lakeside|lake\s+front)\b", re.IGNORECASE
    ),
    "garden": re.compile(
        r"\b(?:garden[\s-]?(?:view|facing)|garden|greenery\s+view)\b", re.IGNORECASE
    ),
    "city": re.compile(
        r"\b(?:city[\s-]?(?:view|facing)|city\s+view|skyline)\b", re.IGNORECASE
    ),
    "pool": re.compile(
        r"\b(?:pool[\s-]?(?:view|facing)|swimming\s+pool\s+view)\b", re.IGNORECASE
    ),
}

# ── Floor preference patterns ─────────────────────────────────────────────────
_FLOOR_HIGH = re.compile(
    r"\b(?:high(?:er)?\s+floor|upper\s+floor|top\s+floor|above\s+(?:floor\s+)?\d{1,2}|"
    r"(?:floor\s+)?\d{1,2}\s*(?:th|st|nd|rd)?\s+(?:or\s+)?(?:above|higher|up))\b",
    re.IGNORECASE,
)
_FLOOR_LOW = re.compile(
    r"\b(?:low(?:er)?\s+floor|ground\s+floor|floor\s+1|first\s+floor|"
    r"(?:floor\s+)?\d{1,2}\s*(?:th|st|nd|rd)?\s+(?:or\s+)?(?:below|lower|down))\b",
    re.IGNORECASE,
)
_FLOOR_MID = re.compile(
    r"\b(?:mid(?:dle)?\s+floor|mid-?floor|intermediate\s+floor)\b", re.IGNORECASE
)

# ── Orientation patterns ──────────────────────────────────────────────────────
_ORIENTATION_PATTERNS: dict[str, re.Pattern[str]] = {
    "east": re.compile(r"\b(?:east[\s-]?facing|east\s+side|facing\s+east)\b", re.IGNORECASE),
    "west": re.compile(r"\b(?:west[\s-]?facing|west\s+side|facing\s+west)\b", re.IGNORECASE),
    "north": re.compile(r"\b(?:north[\s-]?facing|north\s+side|facing\s+north)\b", re.IGNORECASE),
    "south": re.compile(r"\b(?:south[\s-]?facing|south\s+side|facing\s+south)\b", re.IGNORECASE),
    "north-east": re.compile(r"\b(?:north[\s-]?east[\s-]?facing|ne[\s-]?facing)\b", re.IGNORECASE),
    "north-west": re.compile(r"\b(?:north[\s-]?west[\s-]?facing|nw[\s-]?facing)\b", re.IGNORECASE),
}

# ── Single-message timeline override: "actually …" correction markers ─────────
_CORRECTION_MARKERS = re.compile(
    r"\b(?:actually|correction|i\s+meant|sorry|not\s+\S+\s+but|instead|changed\s+my\s+mind|wait)\b",
    re.IGNORECASE,
)



class FieldSource(str, Enum):
    """Provenance tag for an extracted field value.

    STATED     — the visitor explicitly mentioned the value in their message.
    NORMALIZED — the value was deterministically derived from an explicit
                 statement (e.g. '2.5 crore' → 25_000_000 INR).
    UNKNOWN    — the field was not present in the message.

    INFERRED is deliberately absent: the extractor never guesses.
    """

    STATED = "stated"
    NORMALIZED = "normalized"
    UNKNOWN = "unknown"


@dataclass
class ExtractionResult:
    """All profile fields that could be extracted from a single message.

    Only fields that are present in the message are non-None.
    ``sources`` maps field names to their FieldSource provenance.
    """

    # Identity
    name: Optional[str] = None
    location: Optional[str] = None
    phone: Optional[str] = None

    # Budget — stored as raw INR float after normalization
    budget_min: Optional[float] = None
    budget_max: Optional[float] = None

    # Property requirements
    configuration: Optional[str] = None
    preferred_view: Optional[str] = None       # lake | garden | city | pool
    preferred_floor: Optional[str] = None      # high | mid | low
    preferred_orientation: Optional[str] = None  # east | west | north | south

    # Buying intent
    buying_purpose: Optional[str] = None       # self_use | investment | second_home
    buying_timeline: Optional[str] = None      # canonical label from _TIMELINE_PATTERNS

    # Consent & actions
    whatsapp_consent: Optional[bool] = None
    site_visit_interest: Optional[bool] = None
    interested_unit_ids: list[str] = field(default_factory=list)

    # Provenance — maps field name → FieldSource
    sources: dict[str, FieldSource] = field(default_factory=dict)

    # Raw input preserved for audit/logging
    raw_text: str = ""

    def mark(self, field_name: str, source: FieldSource) -> None:
        """Record the provenance of a successfully extracted field."""
        self.sources[field_name] = source

    def is_known(self, field_name: str) -> bool:
        """Return True if the field was extracted (source != UNKNOWN)."""
        return self.sources.get(field_name, FieldSource.UNKNOWN) != FieldSource.UNKNOWN


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
                words = [w.lower() for w in re.findall(r"\b[a-zA-Z]+\b", name)]
                # Filter out common non-name words
                if not words or any(w in _NON_NAME_WORDS for w in words):
                    continue
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
        raw_beds = m.group(1) or m.group(2)
        beds = _NUM_WORDS.get(raw_beds.lower(), raw_beds)
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

    # ── View preference ───────────────────────────────────────────────────────

    @staticmethod
    def extract_view_preference(text: str) -> Optional[str]:
        """Extract preferred view: lake | garden | city | pool.

        Returns the canonical label or None if not found.
        Checks longer/more-specific patterns first (north-east before east).
        """
        for label, pattern in _VIEW_PATTERNS.items():
            if pattern.search(text):
                return label
        return None

    # ── Floor preference ──────────────────────────────────────────────────────

    @staticmethod
    def extract_floor_preference(text: str) -> Optional[str]:
        """Extract floor preference: high | mid | low."""
        if _FLOOR_HIGH.search(text):
            return "high"
        if _FLOOR_LOW.search(text):
            return "low"
        if _FLOOR_MID.search(text):
            return "mid"
        return None

    # ── Orientation ───────────────────────────────────────────────────────────

    @staticmethod
    def extract_orientation(text: str) -> Optional[str]:
        """Extract facing/orientation: east | west | north | south | north-east | north-west."""
        # Check compound directions first (longest match wins)
        for label in ("north-east", "north-west", "north", "south", "east", "west"):
            if label in _ORIENTATION_PATTERNS and _ORIENTATION_PATTERNS[label].search(text):
                return label
        return None

    # ── Correction detection ──────────────────────────────────────────────────

    @staticmethod
    def is_correction(text: str) -> bool:
        """Return True if this message is likely correcting a previous statement.

        Used by update_lead_profile to allow overwriting budget/timeline.
        """
        return bool(_CORRECTION_MARKERS.search(text))

    # ── Full extraction ───────────────────────────────────────────────────────

    def extract(
        self,
        text: str,
        recommendations: list[str] | None = None,
        awaiting_consent: bool = False,
        awaiting_phone: bool = False,
    ) -> ExtractionResult:
        """Run all extractors on a single message and return a sourced result.

        Every non-None field in ExtractionResult is tagged with FieldSource.STATED
        (the visitor explicitly said it) or FieldSource.NORMALIZED (deterministically
        derived from a stated value, e.g. raw INR from '2.5 crore').

        Rules:
        - Never infer. If not in the text, the field is None / UNKNOWN.
        - Budget and timeline are always overwritten (correction support).
        - Phone is only extracted when awaiting_phone=True.
        """
        result = ExtractionResult(raw_text=text)

        # ── Identity ──────────────────────────────────────────────────────────
        name = self.extract_name(text)
        if name:
            result.name = name
            result.mark("name", FieldSource.STATED)

        location = self.extract_location(text)
        if location:
            result.location = location
            result.mark("location", FieldSource.STATED)

        # ── Property requirements ─────────────────────────────────────────────
        config = self.extract_configuration(text)
        if config:
            result.configuration = config
            result.mark("configuration", FieldSource.STATED)

        view = self.extract_view_preference(text)
        if view:
            result.preferred_view = view
            result.mark("preferred_view", FieldSource.STATED)

        floor = self.extract_floor_preference(text)
        if floor:
            result.preferred_floor = floor
            result.mark("preferred_floor", FieldSource.STATED)

        orientation = self.extract_orientation(text)
        if orientation:
            result.preferred_orientation = orientation
            result.mark("preferred_orientation", FieldSource.STATED)

        # ── Budget (always NORMALIZED — user states crore/lakh, we store INR) ─
        bmin, bmax = self.extract_budget(text)
        if bmin is not None:
            result.budget_min = bmin
            result.mark("budget_min", FieldSource.NORMALIZED)
        if bmax is not None:
            result.budget_max = bmax
            result.mark("budget_max", FieldSource.NORMALIZED)

        # ── Buying intent ─────────────────────────────────────────────────────
        purpose = self.extract_purpose(text)
        if purpose:
            result.buying_purpose = purpose
            result.mark("buying_purpose", FieldSource.STATED)

        timeline = self.extract_timeline(text)
        if timeline:
            result.buying_timeline = timeline
            result.mark("buying_timeline", FieldSource.STATED)

        # ── Unit interest ─────────────────────────────────────────────────────
        units = self.extract_unit_interest(text, recommendations)
        if units:
            result.interested_unit_ids = units
            result.mark("interested_unit_ids", FieldSource.STATED)

        # ── Site visit ────────────────────────────────────────────────────────
        if self.extract_site_visit_interest(text):
            result.site_visit_interest = True
            result.mark("site_visit_interest", FieldSource.STATED)

        # ── Phone (only when actively requesting it) ──────────────────────────
        if awaiting_phone:
            phone = self.extract_phone(text)
            if phone:
                result.phone = phone
                result.mark("phone", FieldSource.NORMALIZED)  # raw → E.164

        # ── WhatsApp consent ──────────────────────────────────────────────────
        consent = self.extract_whatsapp_consent(text)
        if consent is not None:
            result.whatsapp_consent = consent
            result.mark("whatsapp_consent", FieldSource.STATED)

        return result


# Module-level singleton
profile_extractor = ProfileExtractor()
