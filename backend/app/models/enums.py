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
    PROPOSAL = "proposal"
    NEGOTIATION = "negotiation"
    WON = "won"
    LOST = "lost"


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
