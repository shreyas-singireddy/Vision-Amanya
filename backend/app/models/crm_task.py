"""Phase 7: internal CRM task model for sales follow-up work.

A sales notification tells the team *that* a lead became sales-ready; a CRM
task tells an owner *what* to do about it. Tasks reuse the existing ``Lead``,
``Agent``, ``User`` and ``LeadPriority`` concepts — no parallel sales-pipeline
model is introduced, and nothing here is ever exposed through customer-facing
APIs.

Idempotency: ``dedupe_key`` carries the canonical
``lead:<lead_id>:<trigger>:<qualification>`` fingerprint of the business state
that produced the task, so re-processing the same state never creates a second
task (and therefore never a second notification). It is nullable because
human-created tasks are intentionally not deduplicated.
"""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Index,
    SmallInteger,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import (
    CrmTaskStatus,
    CrmTaskType,
    LeadPriority,
    SalesTrigger,
    enum_column,
)

if TYPE_CHECKING:
    from app.models.crm import Lead
    from app.models.user import Agent, User


class CrmTask(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """An internal sales follow-up task owned by the CRM team."""

    __tablename__ = "crm_tasks"
    __table_args__ = (
        Index("ix_crm_tasks_status_due", "status", "due_at"),
        Index("ix_crm_tasks_assignee_status", "assigned_to", "status"),
    )

    lead_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("leads.id", ondelete="SET NULL"), nullable=True, index=True
    )
    assigned_to: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("agents.id", ondelete="SET NULL"), nullable=True, index=True
    )
    created_by: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    task_type: Mapped[CrmTaskType] = mapped_column(
        enum_column(CrmTaskType, 40), nullable=False, default=CrmTaskType.CONTACT_QUALIFIED_LEAD, index=True
    )
    status: Mapped[CrmTaskStatus] = mapped_column(
        enum_column(CrmTaskStatus, 20), nullable=False, default=CrmTaskStatus.OPEN, index=True
    )
    priority: Mapped[LeadPriority] = mapped_column(
        enum_column(LeadPriority, 20), nullable=False, default=LeadPriority.MEDIUM, index=True
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    # --- Provenance of the automated task (nullable for human-created tasks) --
    trigger: Mapped[SalesTrigger | None] = mapped_column(
        enum_column(SalesTrigger, 40), nullable=True, index=True
    )
    qualification: Mapped[str | None] = mapped_column(String(30), nullable=True)
    lead_score: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)
    dedupe_key: Mapped[str | None] = mapped_column(String(200), nullable=True, unique=True)
    context_data: Mapped[dict | None] = mapped_column("context_data", JSONB, nullable=True)
    # --- Scheduling / lifecycle ---------------------------------------------
    due_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True, index=True)
    reminder_sent: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default="false"
    )
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    cancelled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    lead: Mapped[Lead | None] = relationship(foreign_keys=[lead_id])
    assignee: Mapped[Agent | None] = relationship(foreign_keys=[assigned_to])
    creator: Mapped[User | None] = relationship(foreign_keys=[created_by])
