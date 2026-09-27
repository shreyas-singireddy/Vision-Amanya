"""CRM and engagement models: enquiries, leads, bookings and reviews.

The funnel is: an anonymous or authenticated visitor submits an ``enquiry``,
which may be promoted to exactly one ``lead`` (1:1), assigned to an agent and
moved through the sales pipeline. ``bookings`` capture scheduled site visits
and virtual tours. ``reviews`` collect moderated user feedback.
"""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Numeric,
    SmallInteger,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import INET, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, SoftDeleteMixin, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import (
    BookingStatus,
    EnquiryStatus,
    HandoffReason,
    HandoffStatus,
    InterestType,
    LeadPriority,
    LeadStatus,
    ReviewStatus,
    SalesNotificationStatus,
    VisitType,
    WhatsAppMessageStatus,
    enum_column,
)

if TYPE_CHECKING:
    from app.models.chat import ChatSession
    from app.models.property import Project, Property
    from app.models.user import Agent, User

from sqlalchemy.dialects.postgresql import ARRAY


class Enquiry(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """A visitor request about a property or project."""

    __tablename__ = "enquiries"
    __table_args__ = (
        CheckConstraint(
            "property_id IS NOT NULL OR project_id IS NOT NULL",
            name="chk_enquiries_reference",
        ),
    )

    property_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("properties.id", ondelete="SET NULL"), nullable=True, index=True
    )
    project_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("projects.id", ondelete="SET NULL"), nullable=True, index=True
    )
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    subject: Mapped[str | None] = mapped_column(String(200), nullable=True)
    message: Mapped[str | None] = mapped_column(Text, nullable=True)
    source: Mapped[str | None] = mapped_column(String(50), nullable=True)
    status: Mapped[EnquiryStatus] = mapped_column(enum_column(EnquiryStatus, 30), nullable=False, default=EnquiryStatus.NEW, index=True
    )
    ip_address: Mapped[str | None] = mapped_column(INET, nullable=True)
    user_agent: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_by: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )

    property: Mapped[Property | None] = relationship(
        back_populates="enquiries", foreign_keys=[property_id]
    )
    project: Mapped[Project | None] = relationship(
        back_populates="enquiries", foreign_keys=[project_id]
    )
    creator: Mapped[User | None] = relationship(
        foreign_keys=[created_by], back_populates="enquiries_created"
    )
    lead: Mapped[Lead | None] = relationship(back_populates="enquiry", uselist=False)


class Lead(UUIDPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin, Base):
    """A sales pipeline record, optionally promoted from an enquiry."""

    __tablename__ = "leads"

    enquiry_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("enquiries.id", ondelete="SET NULL"),
        nullable=True,
        unique=True,
    )
    assigned_to: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("agents.id", ondelete="SET NULL"), nullable=True, index=True
    )
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    property_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("properties.id", ondelete="SET NULL"), nullable=True, index=True
    )
    project_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("projects.id", ondelete="SET NULL"), nullable=True, index=True
    )
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    # Phase 7.5: email is nullable — AI consultant flow is WhatsApp-first
    email: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    # Phase 7.5: WhatsApp contact + consent
    whatsapp_number: Mapped[str | None] = mapped_column(String(20), nullable=True, index=True)
    whatsapp_consent: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")
    consent_timestamp: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    consent_source: Mapped[str | None] = mapped_column(String(50), nullable=True)
    # Phase 7.5: buyer profile
    location: Mapped[str | None] = mapped_column(String(100), nullable=True)
    buying_purpose: Mapped[str | None] = mapped_column(String(50), nullable=True)
    configuration: Mapped[str | None] = mapped_column(String(20), nullable=True)
    preferred_floor: Mapped[str | None] = mapped_column(String(20), nullable=True)
    preferred_view: Mapped[str | None] = mapped_column(String(50), nullable=True)
    preferred_orientation: Mapped[str | None] = mapped_column(String(30), nullable=True)
    family_size: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)
    buying_timeline: Mapped[str | None] = mapped_column(String(50), nullable=True)
    site_visit_interest: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")
    # Phase 7.5: unit tracking (JSONB lists)
    interested_unit_ids: Mapped[list | None] = mapped_column(JSONB, nullable=True)
    recommended_unit_ids: Mapped[list | None] = mapped_column(JSONB, nullable=True)
    viewed_unit_ids: Mapped[list | None] = mapped_column(JSONB, nullable=True)
    compared_unit_ids: Mapped[list | None] = mapped_column(JSONB, nullable=True)
    # Phase 7.5: conversation linkage
    conversation_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("chat_sessions.id", ondelete="SET NULL"), nullable=True, index=True
    )
    landing_page: Mapped[str | None] = mapped_column(String(500), nullable=True)
    last_contacted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[LeadStatus] = mapped_column(enum_column(LeadStatus, 30), nullable=False, default=LeadStatus.NEW, index=True
    )
    priority: Mapped[LeadPriority] = mapped_column(enum_column(LeadPriority, 20), nullable=False, default=LeadPriority.MEDIUM
    )
    source: Mapped[str | None] = mapped_column(String(50), nullable=True)
    lead_score: Mapped[int] = mapped_column(
        SmallInteger, nullable=False, default=0, server_default="0", index=True
    )
    budget_min: Mapped[float | None] = mapped_column(Numeric(15, 2), nullable=True)
    budget_max: Mapped[float | None] = mapped_column(Numeric(15, 2), nullable=True)
    interested_in: Mapped[InterestType | None] = mapped_column(enum_column(InterestType, 20), nullable=True
    )
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    next_follow_up_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True, index=True
    )
    converted_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    lost_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    lost_reason: Mapped[str | None] = mapped_column(String(200), nullable=True)

    enquiry: Mapped[Enquiry | None] = relationship(back_populates="lead")
    assigned_agent: Mapped[Agent | None] = relationship(
        back_populates="leads_assigned", foreign_keys=[assigned_to]
    )
    user: Mapped[User | None] = relationship(
        back_populates="leads", foreign_keys=[user_id]
    )
    property: Mapped[Property | None] = relationship(
        back_populates="leads", foreign_keys=[property_id]
    )
    project: Mapped[Project | None] = relationship(
        back_populates="leads", foreign_keys=[project_id]
    )
    whatsapp_messages: Mapped[list[WhatsAppMessage]] = relationship(
        back_populates="lead", foreign_keys="WhatsAppMessage.lead_id",
        cascade="all, delete-orphan",
    )
    sales_notifications: Mapped[list[SalesNotification]] = relationship(
        back_populates="lead", foreign_keys="SalesNotification.lead_id",
        cascade="all, delete-orphan",
    )


class Booking(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """A scheduled site visit, virtual tour or sales call."""

    __tablename__ = "bookings"

    booking_number: Mapped[str] = mapped_column(
        String(32), unique=True, nullable=False
    )
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    enquiry_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("enquiries.id", ondelete="SET NULL"), nullable=True
    )
    property_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("properties.id", ondelete="SET NULL"), nullable=True, index=True
    )
    project_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("projects.id", ondelete="SET NULL"), nullable=True, index=True
    )
    agent_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("agents.id", ondelete="SET NULL"), nullable=True, index=True
    )
    scheduled_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, index=True
    )
    duration_minutes: Mapped[int] = mapped_column(
        SmallInteger, nullable=False, default=60, server_default="60"
    )
    visit_type: Mapped[VisitType] = mapped_column(enum_column(VisitType, 30), nullable=False, default=VisitType.SITE_VISIT
    )
    status: Mapped[BookingStatus] = mapped_column(enum_column(BookingStatus, 30), nullable=False, default=BookingStatus.REQUESTED, index=True
    )
    cancellation_reason: Mapped[str | None] = mapped_column(String(200), nullable=True)
    attendee_count: Mapped[int] = mapped_column(
        SmallInteger, nullable=False, default=1, server_default="1"
    )
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    user: Mapped[User | None] = relationship(
        back_populates="bookings", foreign_keys=[user_id]
    )
    enquiry: Mapped[Enquiry | None] = relationship()
    property: Mapped[Property | None] = relationship(
        back_populates="bookings", foreign_keys=[property_id]
    )
    project: Mapped[Project | None] = relationship(
        back_populates="bookings", foreign_keys=[project_id]
    )
    agent: Mapped[Agent | None] = relationship(
        back_populates="bookings", foreign_keys=[agent_id]
    )


class Review(UUIDPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin, Base):
    """Moderated user feedback on a property or project."""

    __tablename__ = "reviews"
    __table_args__ = (
        CheckConstraint(
            "property_id IS NOT NULL OR project_id IS NOT NULL",
            name="chk_reviews_reference",
        ),
        CheckConstraint("rating BETWEEN 1 AND 5", name="chk_reviews_rating_range"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    property_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("properties.id", ondelete="SET NULL"), nullable=True, index=True
    )
    project_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("projects.id", ondelete="SET NULL"), nullable=True, index=True
    )
    booking_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("bookings.id", ondelete="SET NULL"), nullable=True
    )
    rating: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    title: Mapped[str | None] = mapped_column(String(150), nullable=True)
    body: Mapped[str | None] = mapped_column(Text, nullable=True)
    pros: Mapped[str | None] = mapped_column(Text, nullable=True)
    cons: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[ReviewStatus] = mapped_column(enum_column(ReviewStatus, 20), nullable=False, default=ReviewStatus.PENDING, index=True
    )
    admin_note: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_verified_purchase: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default="false"
    )

    user: Mapped[User] = relationship(back_populates="reviews")
    property: Mapped[Property | None] = relationship(
        back_populates="reviews", foreign_keys=[property_id]
    )
    project: Mapped[Project | None] = relationship(
        back_populates="reviews", foreign_keys=[project_id]
    )
    booking: Mapped[Booking | None] = relationship()


class SalesHandoff(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """AI-to-human sales consultant handoff escalation record."""

    __tablename__ = "sales_handoffs"

    lead_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("leads.id", ondelete="SET NULL"), nullable=True, index=True
    )
    conversation_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("chat_sessions.id", ondelete="SET NULL"), nullable=True, index=True
    )
    assigned_to: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("agents.id", ondelete="SET NULL"), nullable=True, index=True
    )
    reason: Mapped[HandoffReason] = mapped_column(
        enum_column(HandoffReason, 40), nullable=False, index=True
    )
    status: Mapped[HandoffStatus] = mapped_column(
        enum_column(HandoffStatus, 30),
        nullable=False,
        default=HandoffStatus.REQUESTED,
        index=True,
    )
    context_data: Mapped[dict | None] = mapped_column("context_data", JSONB, nullable=True)
    summary_data: Mapped[dict | None] = mapped_column("summary_data", JSONB, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    knowledge_gap_tracked: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default="false"
    )
    assigned_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    accepted_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    cancelled_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    lead: Mapped[Lead | None] = relationship()
    conversation: Mapped[ChatSession | None] = relationship()
    assigned_agent: Mapped[Agent | None] = relationship(foreign_keys=[assigned_to])


class WhatsAppMessage(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Tracks every WhatsApp message dispatched to a lead."""

    __tablename__ = "whatsapp_messages"

    lead_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("leads.id", ondelete="SET NULL"), nullable=True, index=True
    )
    conversation_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("chat_sessions.id", ondelete="SET NULL"), nullable=True, index=True
    )
    phone_number: Mapped[str] = mapped_column(String(20), nullable=False)
    message_body: Mapped[str] = mapped_column(Text, nullable=False)
    template_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    status: Mapped[WhatsAppMessageStatus] = mapped_column(
        enum_column(WhatsAppMessageStatus, 20),
        nullable=False,
        default=WhatsAppMessageStatus.PENDING,
        index=True,
    )
    provider_message_id: Mapped[str | None] = mapped_column(String(200), nullable=True)
    sent_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    delivered_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    failed_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    provider_name: Mapped[str | None] = mapped_column(String(50), nullable=True)

    lead: Mapped[Lead | None] = relationship(
        back_populates="whatsapp_messages", foreign_keys=[lead_id]
    )


class SalesNotification(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Tracks sales team notifications for new/hot leads."""

    __tablename__ = "sales_notifications"

    lead_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("leads.id", ondelete="SET NULL"), nullable=True, index=True
    )
    handoff_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("sales_handoffs.id", ondelete="SET NULL"), nullable=True, index=True
    )
    channel: Mapped[str] = mapped_column(String(30), nullable=False)
    status: Mapped[SalesNotificationStatus] = mapped_column(
        enum_column(SalesNotificationStatus, 20),
        nullable=False,
        default=SalesNotificationStatus.PENDING,
        index=True,
    )
    recipient: Mapped[str | None] = mapped_column(String(255), nullable=True)
    subject: Mapped[str | None] = mapped_column(String(300), nullable=True)
    body: Mapped[str | None] = mapped_column(Text, nullable=True)
    sent_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    failed_reason: Mapped[str | None] = mapped_column(Text, nullable=True)

    lead: Mapped[Lead | None] = relationship(
        back_populates="sales_notifications", foreign_keys=[lead_id]
    )
