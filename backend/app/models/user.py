"""User and agent models.

``User`` is the identity root. ``Agent`` is a 1:1 profile extension used by
sales staff — it carries license, experience and marketing data that does not
belong on the identity record.
"""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, ForeignKey, Numeric, SmallInteger, String, Text
from sqlalchemy.dialects.postgresql import INET, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, SoftDeleteMixin, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import AgentStatus, enum_column
from app.models.rbac import UserRole

if TYPE_CHECKING:
    from app.models.auth import AuthToken
    from app.models.chat import ChatSession
    from app.models.crm import Booking, Enquiry, Lead, Review
    from app.models.property import Favorite, Property, PropertyPriceHistory
    from app.models.rbac import Role
    from app.models.system import AnalyticsEvent, AppSetting, AuditLog, FileUpload, Notification


class User(UUIDPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin, Base):
    """A registered account on the platform (customer, agent or admin)."""

    __tablename__ = "users"

    email: Mapped[str] = mapped_column(
        String(255), unique=True, nullable=False, index=True
    )
    phone: Mapped[str | None] = mapped_column(
        String(20), unique=True, nullable=True
    )
    password_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)
    full_name: Mapped[str] = mapped_column(String(150), nullable=False)
    avatar_file_upload_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("file_uploads.id", ondelete="SET NULL"), nullable=True
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=True, server_default="true"
    )
    is_email_verified: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default="false"
    )
    email_verified_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    last_login_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    last_login_ip: Mapped[str | None] = mapped_column(INET, nullable=True)
    preferred_locale: Mapped[str] = mapped_column(
        String(10), nullable=False, default="en", server_default="en"
    )
    timezone: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="Asia/Kolkata",
        server_default="Asia/Kolkata",
    )

    # --- Relationships -----------------------------------------------------
    roles: Mapped[list[Role]] = relationship(
        secondary="user_roles",
        back_populates="users",
        foreign_keys=[UserRole.role_id, UserRole.user_id],
    )
    agent: Mapped[Agent | None] = relationship(back_populates="user", uselist=False)
    auth_tokens: Mapped[list[AuthToken]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )
    avatar_file_upload: Mapped[FileUpload | None] = relationship(
        foreign_keys=[avatar_file_upload_id]
    )
    notifications: Mapped[list[Notification]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )
    favorites: Mapped[list[Favorite]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )
    reviews: Mapped[list[Review]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )
    chat_sessions: Mapped[list[ChatSession]] = relationship(back_populates="user")
    enquiries_created: Mapped[list[Enquiry]] = relationship(
        foreign_keys="Enquiry.created_by",
        back_populates="creator",
    )
    leads: Mapped[list[Lead]] = relationship(
        foreign_keys="Lead.user_id",
        back_populates="user",
    )
    bookings: Mapped[list[Booking]] = relationship(
        foreign_keys="Booking.user_id",
        back_populates="user",
    )
    property_price_changes: Mapped[list[PropertyPriceHistory]] = relationship(
        foreign_keys="PropertyPriceHistory.changed_by",
        back_populates="changed_by_user",
    )
    app_settings_updated: Mapped[list[AppSetting]] = relationship(
        foreign_keys="AppSetting.updated_by",
        back_populates="updated_by_user",
    )
    analytics_events: Mapped[list[AnalyticsEvent]] = relationship(
        foreign_keys="AnalyticsEvent.user_id",
        back_populates="user",
    )
    audit_logs: Mapped[list[AuditLog]] = relationship(
        foreign_keys="AuditLog.actor_user_id",
        back_populates="actor",
    )


class Agent(UUIDPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin, Base):
    """Sales-staff profile extending a user record 1:1."""

    __tablename__ = "agents"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    license_number: Mapped[str | None] = mapped_column(
        String(50), unique=True, nullable=True
    )
    designation: Mapped[str | None] = mapped_column(String(100), nullable=True)
    years_experience: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    languages: Mapped[list | None] = mapped_column(JSONB, nullable=True)
    specializations: Mapped[list | None] = mapped_column(JSONB, nullable=True)
    social_links: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    rating: Mapped[float | None] = mapped_column(Numeric(3, 2), nullable=True)
    is_verified: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default="false"
    )
    status: Mapped[AgentStatus] = mapped_column(enum_column(AgentStatus, 20), nullable=False, default=AgentStatus.ACTIVE
    )

    user: Mapped[User] = relationship(back_populates="agent")
    properties_listed: Mapped[list[Property]] = relationship(
        foreign_keys="Property.listing_agent_id",
        back_populates="listing_agent",
    )
    leads_assigned: Mapped[list[Lead]] = relationship(
        foreign_keys="Lead.assigned_to",
        back_populates="assigned_agent",
    )
    bookings: Mapped[list[Booking]] = relationship(
        foreign_keys="Booking.agent_id",
        back_populates="agent",
    )
