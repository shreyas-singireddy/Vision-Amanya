"""Schemas for the internal sales workflow: CRM tasks + sales notifications.

These are **internal** contracts. They are only reachable through RBAC-guarded
endpoints (``lead:read`` / ``lead:update`` / ``lead:assign``) and are never
embedded in customer-facing responses.
"""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import (
    CrmTaskStatus,
    CrmTaskType,
    LeadPriority,
    SalesNotificationStatus,
    SalesTrigger,
)


class CrmTaskCreate(BaseModel):
    """Payload for ``POST /api/v1/crm/tasks`` (manual task creation)."""

    lead_id: uuid.UUID = Field(..., description="Lead this task belongs to.")
    task_type: CrmTaskType = CrmTaskType.MANUAL
    priority: LeadPriority | None = Field(None, description="Defaults to the lead's score-derived priority.")
    title: str | None = Field(None, max_length=200, description="Defaults from the task type.")
    description: str | None = Field(None, max_length=2000)
    due_at: datetime | None = Field(None, description="Defaults to now + SALES_TASK_DUE_MINUTES.")
    assigned_to: uuid.UUID | None = Field(None, description="Agent id to own the task; auto-assigned when omitted.")


class CrmTaskUpdate(BaseModel):
    """Payload for ``PATCH /api/v1/crm/tasks/{task_id}`` (agents/admins)."""

    status: CrmTaskStatus | None = None
    priority: LeadPriority | None = None
    assigned_to: uuid.UUID | None = Field(None, description="Agent id to reassign the task to.")
    due_at: datetime | None = None
    description: str | None = Field(None, max_length=2000)


class CrmTaskAssign(BaseModel):
    """Payload for ``POST /api/v1/crm/tasks/{task_id}/assign`` (``lead:assign``)."""

    agent_id: uuid.UUID = Field(..., description="Agent id that should own the task.")


class CrmTaskResponse(BaseModel):
    """Internal CRM task representation."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    lead_id: uuid.UUID | None = None
    assigned_to: uuid.UUID | None = None
    created_by: uuid.UUID | None = None
    task_type: CrmTaskType
    status: CrmTaskStatus
    priority: LeadPriority
    title: str
    description: str | None = None
    trigger: SalesTrigger | None = None
    qualification: str | None = None
    lead_score: int | None = None
    due_at: datetime | None = None
    completed_at: datetime | None = None
    cancelled_at: datetime | None = None
    created_at: datetime
    updated_at: datetime


class SalesNotificationResponse(BaseModel):
    """Internal sales notification record (never returned to customers)."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    lead_id: uuid.UUID | None = None
    handoff_id: uuid.UUID | None = None
    channel: str
    status: SalesNotificationStatus
    recipient: str | None = None
    subject: str | None = None
    sent_at: datetime | None = None
    failed_reason: str | None = None
    created_at: datetime


class SalesTriggerRequest(BaseModel):
    """Payload for ``POST /api/v1/crm/leads/{lead_id}/sales-trigger``.

    Business rules stay server-side: this endpoint only *evaluates* the lead's
    canonical qualification and creates the sales notification / CRM task. An
    explicit ``trigger`` may be supplied by an authorized escalation flow (the
    AI handoff passes ``human_assistance_request``); it never changes scoring.
    """

    trigger: SalesTrigger | None = Field(
        None, description="Optional explicit escalation trigger (e.g. human_assistance_request)."
    )
    note: str | None = Field(None, max_length=500, description="Internal note stored on the CRM task.")


class SalesWorkflowResponse(BaseModel):
    """Outcome of a sales workflow evaluation (internal)."""

    lead_id: uuid.UUID
    triggered: bool
    trigger: SalesTrigger | None = None
    qualification: str | None = None
    reason: str
    task_id: uuid.UUID | None = None
    task_created: bool = False
    notification_id: uuid.UUID | None = None
    notification_status: str | None = None
    duplicate: bool = False
    errors: list[str] = Field(default_factory=list)


class CrmTaskListResponse(BaseModel):
    """Paginated CRM task collection."""

    items: list[CrmTaskResponse]
    meta: dict[str, Any]
