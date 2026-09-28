"""Domain enums shared across models, schemas and services.

Statuses are rendered as ``VARCHAR`` columns with ``CHECK`` constraints
(native PostgreSQL enums are deliberately avoided because they are painful
to evolve). The same enums are reused by Pydantic schemas so that the API
contract and the persistence layer never drift apart.
"""

from __future__ import annotations

from enum import Enum, StrEnum

from sqlalchemy import Enum as SAEnum


def enum_column(enum_cls: type[Enum], length: int) -> SAEnum:
    """Build a non-native VARCHAR enum column type with a CHECK constraint.

    Native PostgreSQL enums are deliberately avoided because they are painful
    to evolve. ``create_constraint=True`` emits a database-level CHECK so
    invalid values are rejected even outside the ORM. The same Python enum
    classes are reused by Pydantic schemas.
    """
    return SAEnum(
        enum_cls,
        native_enum=False,
        length=length,
        values_callable=lambda e: [x.value for x in e],
        create_constraint=True,
    )


class TokenType(StrEnum):
    """Kinds of one-time tokens stored in ``auth_tokens``."""

    REFRESH = "refresh"
    VERIFY_EMAIL = "verify_email"
    RESET_PASSWORD = "reset_password"


class AgentStatus(StrEnum):
    """Lifecycle of a sales agent profile."""

    ACTIVE = "active"
    INACTIVE = "inactive"


class ProjectType(StrEnum):
    """Nature of a real estate project."""

    RESIDENTIAL = "residential"
    COMMERCIAL = "commercial"
    MIXED_USE = "mixed_use"


class ProjectStatus(StrEnum):
    """Construction lifecycle of a project."""

    UPCOMING = "upcoming"
    UNDER_CONSTRUCTION = "under_construction"
    READY_TO_MOVE = "ready_to_move"


class ListingType(StrEnum):
    """How a property is being offered."""

    SALE = "sale"
    RENT = "rent"
    LEASE = "lease"


class ListingStatus(StrEnum):
    """Publishing/sales lifecycle of a property listing."""

    DRAFT = "draft"
    PUBLISHED = "published"
    UNDER_OFFER = "under_offer"
    RESERVED = "reserved"
    SOLD = "sold"
    RENTED = "rented"
    WITHDRAWN = "withdrawn"


class FurnishingStatus(StrEnum):
    """Furniture provision level for a property."""

    UNFURNISHED = "unfurnished"
    SEMI_FURNISHED = "semi_furnished"
    FURNISHED = "furnished"


class PropertyImageType(StrEnum):
    """Kind of media attached to a property listing."""

    IMAGE = "image"
    FLOOR_PLAN = "floor_plan"
    VIRTUAL_TOUR = "virtual_tour"
    OTHER = "other"


class EnquiryStatus(StrEnum):
    """Lifecycle of a visitor enquiry."""

    NEW = "new"
    IN_PROGRESS = "in_progress"
    CLOSED = "closed"
    CONVERTED = "converted"


class LeadStatus(StrEnum):
    """Sales pipeline stages for a lead."""

    NEW = "new"
    CONTACTED = "contacted"
    QUALIFIED = "qualified"
    SITE_VISIT = "site_visit"
    PROPOSAL = "proposal"
    NEGOTIATION = "negotiation"
    NURTURE = "nurture"
    WON = "won"
    LOST = "lost"


class LeadTemperature(StrEnum):
    """Lead heat classification derived from lead score."""

    COLD = "cold"          # 0–30
    WARM = "warm"          # 31–60
    HOT = "hot"            # 61–80
    HIGH_INTENT = "high_intent"  # 81–100


class ConvStage(StrEnum):
    """Conversational lead-qualification state machine stages."""

    DISCOVERY = "discovery"
    PROFILE_BUILDING = "profile_building"
    REQUIREMENT_DISCOVERY = "requirement_discovery"
    UNIT_RECOMMENDATION = "unit_recommendation"
    INTEREST_IDENTIFICATION = "interest_identification"
    CONTACT_PERMISSION = "contact_permission"
    CONTACT_CAPTURE = "contact_capture"
    SALES_HANDOFF = "sales_handoff"
    FOLLOW_UP = "follow_up"


class WhatsAppMessageStatus(StrEnum):
    """Delivery lifecycle of a WhatsApp message."""

    PENDING = "pending"
    SENT = "sent"
    DELIVERED = "delivered"
    FAILED = "failed"
    SIMULATED = "simulated"    # mock provider — not actually sent


class SalesNotificationStatus(StrEnum):
    """Delivery lifecycle of a sales team notification."""

    PENDING = "pending"
    SENT = "sent"
    FAILED = "failed"


class LeadPriority(StrEnum):
    """Priority weighting used for agent workload routing."""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class InterestType(StrEnum):
    """What a lead is interested in."""

    SALE = "sale"
    RENT = "rent"
    INVESTMENT = "investment"


class VisitType(StrEnum):
    """Mode of a scheduled booking."""

    SITE_VISIT = "site_visit"
    VIRTUAL_TOUR = "virtual_tour"
    CALL = "call"


class BookingStatus(StrEnum):
    """Lifecycle of a booking."""

    REQUESTED = "requested"
    CONFIRMED = "confirmed"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    NO_SHOW = "no_show"


class ReviewStatus(StrEnum):
    """Moderation state of a review."""

    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class NotificationType(StrEnum):
    """Delivery channel of a notification."""

    EMAIL = "email"
    PUSH = "push"
    SMS = "sms"
    IN_APP = "in_app"


class NotificationCategory(StrEnum):
    """Business reason a notification was created."""

    LEAD_ASSIGNED = "lead_assigned"
    PROPERTY_UPDATE = "property_update"
    ENQUIRY_REPLY = "enquiry_reply"
    BOOKING_CONFIRM = "booking_confirm"
    SYSTEM = "system"


class NotificationStatus(StrEnum):
    """Delivery lifecycle of a notification."""

    PENDING = "pending"
    SENT = "sent"
    FAILED = "failed"
    DELIVERED = "delivered"
    READ = "read"


class ChatSessionStatus(StrEnum):
    """Lifecycle of an AI chat session."""

    ACTIVE = "active"
    CLOSED = "closed"


class ChatMessageRole(StrEnum):
    """Sender role of a chat message."""

    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"
    TOOL = "tool"


class KnowledgeDocumentType(StrEnum):
    """Type of source document ingested by the AI knowledge base."""

    BROCHURE = "brochure"
    FLOOR_PLAN = "floor_plan"
    LEGAL = "legal"
    RERA = "rera"
    FAQ = "faq"
    WEBSITE_CONTENT = "website_content"


class KnowledgeDocumentStatus(StrEnum):
    """Ingestion lifecycle of a knowledge document."""

    PENDING = "pending"
    PROCESSING = "processing"
    READY = "ready"
    FAILED = "failed"


class StorageProvider(StrEnum):
    """Backing store for an uploaded file."""

    LOCAL = "local"
    S3 = "s3"
    GCS = "gcs"
    AZURE = "azure"


class FileCategory(StrEnum):
    """High-level kind of an uploaded file."""

    IMAGE = "image"
    DOCUMENT = "document"
    VIDEO = "video"
    AVATAR = "avatar"


class AccessLevel(StrEnum):
    """Visibility of an uploaded file."""

    PUBLIC = "public"
    PRIVATE = "private"


class KnowledgeCategory(StrEnum):
    """Domain classifications for AI knowledge items."""

    PROJECT = "project"
    LOCATION = "location"
    LANDSCAPE = "landscape"
    ARCHITECTURE = "architecture"
    PLANNING = "planning"
    RESIDENCE = "residence"
    SPECIFICATION = "specification"
    AMENITY = "amenity"
    CONNECTIVITY = "connectivity"
    DEVELOPER = "developer"
    PRICING = "pricing"
    AVAILABILITY = "availability"
    LEGAL = "legal"
    RERA = "rera"
    FINANCE = "finance"
    FAQ = "faq"
    MARKETING = "marketing"


class ClaimType(StrEnum):
    """Fact vs marketing claim taxonomy."""

    FACT = "fact"
    MARKETING_CLAIM = "marketing_claim"
    COMPARATIVE_CLAIM = "comparative_claim"
    LIFESTYLE_CLAIM = "lifestyle_claim"
    UNKNOWN = "unknown"


class VerificationStatus(StrEnum):
    """Verification provenance state of a knowledge item."""

    VERIFIED = "verified"
    PROVIDED_UNVERIFIED = "provided_unverified"
    REQUIRES_VERIFICATION = "requires_verification"
    DEPRECATED = "deprecated"


class HandoffStatus(StrEnum):
    """Lifecycle stages of a human sales consultant handoff."""

    REQUESTED = "REQUESTED"
    QUEUED = "QUEUED"
    ASSIGNED = "ASSIGNED"
    ACCEPTED = "ACCEPTED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class HandoffReason(StrEnum):
    """Business triggers for AI-to-human sales consultant handoff."""

    EXPLICIT_HUMAN_REQUEST = "explicit_human_request"
    UNKNOWN_VERIFIED_INFORMATION = "unknown_verified_information"
    NEGOTIATION_REQUEST = "negotiation_request"
    CUSTOM_REQUIREMENT = "custom_requirement"
    HIGH_INTENT_LEAD = "high_intent_lead"
    COMPLEX_FINANCIAL_QUESTION = "complex_financial_question"
    COMPLAINT = "complaint"
    REPEATED_AI_FAILURE = "repeated_ai_failure"
    SALES_FOLLOWUP_REQUEST = "sales_followup_request"


class AssignmentStrategy(StrEnum):
    """Routing strategies for assigning sales consultants."""

    ROUND_ROBIN = "round_robin"
    LEAST_ACTIVE = "least_active"
    AVAILABILITY_BASED = "availability_based"
    MANUAL_ASSIGNMENT = "manual_assignment"


class SalesTrigger(StrEnum):
    """Meaningful business states that escalate a lead to the sales team.

    These are *not* new thresholds: ``HIGH_INTENT_LEAD`` / ``HOT_LEAD`` are the
    canonical Phase 4 lead-temperature bands produced by
    :mod:`app.ai.lead_scoring`, while the remaining values mirror signals that
    already exist in the domain model (``Lead.site_visit_interest`` and
    ``HandoffReason``).
    """

    HIGH_INTENT_LEAD = "high_intent_lead"
    HOT_LEAD = "hot_lead"
    SITE_VISIT_REQUEST = "site_visit_request"
    HUMAN_ASSISTANCE_REQUEST = "human_assistance_request"
    MANUAL = "manual"


class CrmTaskType(StrEnum):
    """Kind of internal sales follow-up work created by the CRM."""

    CONTACT_QUALIFIED_LEAD = "contact_qualified_lead"
    HOT_LEAD_FOLLOW_UP = "hot_lead_follow_up"
    SITE_VISIT_COORDINATION = "site_visit_coordination"
    MANUAL = "manual"


class CrmTaskStatus(StrEnum):
    """Lifecycle of an internal CRM task (never customer-visible)."""

    OPEN = "open"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


