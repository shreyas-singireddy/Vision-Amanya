"""System, observability and operations models.

``file_uploads`` is the canonical record of stored files (physical bytes live
in local disk or object storage). ``analytics_events`` and ``audit_logs`` are
write-heavy append-only streams, indexed for time-range scans. ``notifications``
and ``app_settings`` support the admin portal.
"""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    BigInteger,
    Boolean,
    DateTime,
    ForeignKey,
    Index,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import INET, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import (
    AccessLevel,
    FileCategory,
    NotificationCategory,
    NotificationStatus,
    NotificationType,
    StorageProvider,
    enum_column,
)

if TYPE_CHECKING:
    from app.models.crm import Notification
    from app.models.user import User


class FileUpload(UUIDPrimaryKeyMixin, Base):
    """Metadata record for a stored file.

    ``uploader_user_id`` intentionally has no hard foreign key: it references
    ``users`` while ``users.avatar_file_upload_id`` references this table, and
    a bidirectional FK pair between two tables is not expressible as a simple
    ``CREATE TABLE`` in PostgreSQL. The application layer enforces integrity.
    """

    __tablename__ = "file_uploads"

    uploader_user_id: Mapped[uuid.UUID | None] = mapped_column(
        nullable=True, index=True
    )
    storage_provider: Mapped[StorageProvider] = mapped_column(enum_column(StorageProvider, 20), nullable=False, default=StorageProvider.LOCAL
    )
    storage_key: Mapped[str] = mapped_column(String(500), unique=True, nullable=False)
    bucket: Mapped[str | None] = mapped_column(String(100), nullable=True)
    original_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    stored_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    mime_type: Mapped[str] = mapped_column(String(127), nullable=False)
    size_bytes: Mapped[int] = mapped_column(BigInteger, nullable=False)
    checksum_sha256: Mapped[str | None] = mapped_column(String(64), nullable=True)
    file_category: Mapped[FileCategory] = mapped_column(enum_column(FileCategory, 20), nullable=False
    )
    entity_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    entity_id: Mapped[uuid.UUID | None] = mapped_column(nullable=True)
    access_level: Mapped[AccessLevel] = mapped_column(enum_column(AccessLevel, 20), nullable=False, default=AccessLevel.PUBLIC
    )
    is_deleted: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default="false"
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    __table_args__ = (
        Index("ix_file_uploads_entity", "entity_type", "entity_id"),
    )


class Notification(UUIDPrimaryKeyMixin, Base):
    """A user-facing notification (in-app, email, push or SMS)."""

    __tablename__ = "notifications"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    type: Mapped[NotificationType] = mapped_column(enum_column(NotificationType, 20), nullable=False
    )
    category: Mapped[NotificationCategory] = mapped_column(enum_column(NotificationCategory, 30), nullable=False
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    body: Mapped[str | None] = mapped_column(Text, nullable=True)
    data: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    status: Mapped[NotificationStatus] = mapped_column(enum_column(NotificationStatus, 20), nullable=False, default=NotificationStatus.PENDING
    )
    read_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    sent_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    failure_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), index=True
    )

    user: Mapped[User] = relationship(back_populates="notifications")


class AnalyticsEvent(UUIDPrimaryKeyMixin, Base):
    """Append-only product analytics event (page views, searches, actions)."""

    __tablename__ = "analytics_events"

    user_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    session_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    event_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    entity_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    entity_id: Mapped[uuid.UUID | None] = mapped_column(nullable=True)
    properties: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    ip_address: Mapped[str | None] = mapped_column(INET, nullable=True)
    user_agent: Mapped[str | None] = mapped_column(Text, nullable=True)
    referrer: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), index=True
    )

    __table_args__ = (
        Index("ix_analytics_events_type_created", "event_type", "created_at"),
        Index(
            "ix_analytics_events_created_brin",
            "created_at",
            postgresql_using="brin",
        ),
        Index("ix_analytics_events_entity", "entity_type", "entity_id"),
    )

    user: Mapped[User | None] = relationship(
        foreign_keys=[user_id], back_populates="analytics_events"
    )


class AuditLog(UUIDPrimaryKeyMixin, Base):
    """Immutable audit trail of sensitive write operations."""

    __tablename__ = "audit_logs"

    actor_user_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    action: Mapped[str] = mapped_column(String(50), nullable=False)
    resource_type: Mapped[str] = mapped_column(String(50), nullable=False)
    resource_id: Mapped[uuid.UUID | None] = mapped_column(nullable=True)
    old_value: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    new_value: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    ip_address: Mapped[str | None] = mapped_column(INET, nullable=True)
    user_agent: Mapped[str | None] = mapped_column(Text, nullable=True)
    request_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    __table_args__ = (
        Index("ix_audit_logs_resource", "resource_type", "resource_id"),
        Index("ix_audit_logs_created", "created_at"),
    )

    actor: Mapped[User | None] = relationship(
        foreign_keys=[actor_user_id], back_populates="audit_logs"
    )


class AppSetting(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Key/value store for admin-configurable application settings."""

    __tablename__ = "app_settings"

    key: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    value: Mapped[dict] = mapped_column(JSONB, nullable=False)
    value_type: Mapped[str] = mapped_column(
        String(20), nullable=False, default="string", server_default="string"
    )
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_public: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default="false"
    )
    updated_by: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )

    updated_by_user: Mapped[User | None] = relationship(
        foreign_keys=[updated_by], back_populates="app_settings_updated"
    )
