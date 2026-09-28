"""Internal CRM endpoints: sales notifications and CRM tasks.

Everything in this router is **internal sales tooling**. Access is gated by the
existing CRM permissions (``lead:read`` / ``lead:update`` / ``lead:assign``),
which customer accounts do not hold — so lead scores, sales notifications and
task information can never leak through a customer-facing API.

The sales-trigger endpoint is also the HTTP integration point Agent 8's
automation/orchestration layer can call once a conversation turn changes a
lead's canonical qualification.
"""

from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import ActiveUser, Pagination, require_permission
from app.core.database import get_db
from app.core.response import success_response
from app.models.enums import CrmTaskStatus, LeadPriority, SalesNotificationStatus
from app.permissions import LEAD_ASSIGN, LEAD_READ, LEAD_UPDATE
from app.schemas.crm_task import (
    CrmTaskAssign,
    CrmTaskCreate,
    CrmTaskResponse,
    CrmTaskUpdate,
    SalesNotificationResponse,
    SalesTriggerRequest,
)
from app.services.sales_task_service import SalesTaskService

router = APIRouter(prefix="/crm", tags=["crm"])


def _serialize_task(task) -> dict:
    return CrmTaskResponse.model_validate(task).model_dump()


@router.get("/tasks", dependencies=[Depends(require_permission(LEAD_READ))])
async def list_crm_tasks(
    db: Annotated[AsyncSession, Depends(get_db)],
    pagination: Pagination,
    lead_id: Annotated[uuid.UUID | None, Query()] = None,
    assigned_to: Annotated[uuid.UUID | None, Query()] = None,
    status: Annotated[CrmTaskStatus | None, Query()] = None,
    priority: Annotated[LeadPriority | None, Query()] = None,
) -> dict:
    """List internal CRM tasks (agent/admin)."""
    service = SalesTaskService(db)
    page, page_size = pagination
    result = await service.list_tasks(
        page=page,
        page_size=page_size,
        lead_id=lead_id,
        assigned_to=assigned_to,
        status=status,
        priority=priority,
    )
    return success_response(
        {"items": [_serialize_task(task) for task in result.items], "meta": result.as_dict()}
    )


@router.post("/tasks", dependencies=[Depends(require_permission(LEAD_UPDATE))])
async def create_crm_task(
    payload: CrmTaskCreate,
    actor: ActiveUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Create a CRM task manually (agent/admin). Not deduplicated by design."""
    service = SalesTaskService(db)
    task = await service.create_manual_task(payload, actor_id=actor.id)
    return success_response(_serialize_task(task), message="CRM task created.")


@router.get("/tasks/{task_id}", dependencies=[Depends(require_permission(LEAD_READ))])
async def get_crm_task(
    task_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Fetch one internal CRM task (agent/admin)."""
    service = SalesTaskService(db)
    task = await service.get_task(task_id)
    return success_response(_serialize_task(task))


@router.patch("/tasks/{task_id}", dependencies=[Depends(require_permission(LEAD_UPDATE))])
async def update_crm_task(
    task_id: uuid.UUID,
    payload: CrmTaskUpdate,
    actor: ActiveUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Update task status, priority, due date or notes (agent/admin)."""
    service = SalesTaskService(db)
    task = await service.update_task(task_id, payload, actor_id=actor.id)
    return success_response(_serialize_task(task), message="CRM task updated.")


@router.post("/tasks/{task_id}/assign", dependencies=[Depends(require_permission(LEAD_ASSIGN))])
async def assign_crm_task(
    task_id: uuid.UUID,
    payload: CrmTaskAssign,
    actor: ActiveUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Reassign a CRM task to a sales agent (agent/admin, ``lead:assign``)."""
    service = SalesTaskService(db)
    task = await service.update_task(
        task_id, CrmTaskUpdate(assigned_to=payload.agent_id), actor_id=actor.id
    )
    return success_response(_serialize_task(task), message="CRM task assigned.")


@router.get("/leads/{lead_id}/tasks", dependencies=[Depends(require_permission(LEAD_READ))])
async def list_lead_crm_tasks(
    lead_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Every internal CRM task raised for one lead (agent/admin)."""
    service = SalesTaskService(db)
    tasks = await service.list_for_lead(lead_id)
    return success_response([_serialize_task(task) for task in tasks])


@router.post("/leads/{lead_id}/sales-trigger", dependencies=[Depends(require_permission(LEAD_UPDATE))])
async def evaluate_lead_sales_trigger(
    lead_id: uuid.UUID,
    payload: SalesTriggerRequest,
    actor: ActiveUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Evaluate a lead's canonical qualification and escalate it once.

    Idempotent: repeating the call for an unchanged state creates no second
    notification or task. Optional ``trigger`` allows an authorized escalation
    flow (for example an explicit human-assistance request) to bypass the score
    floor without altering the Phase 4 qualification.
    """
    service = SalesTaskService(db)
    result = await service.run_for_lead_id(
        lead_id,
        actor_id=actor.id,
        explicit_trigger=payload.trigger,
        note=payload.note,
    )
    return success_response(result.as_dict(), message=result.reason)


@router.get("/sales-notifications", dependencies=[Depends(require_permission(LEAD_READ))])
async def list_sales_notifications(
    db: Annotated[AsyncSession, Depends(get_db)],
    pagination: Pagination,
    lead_id: Annotated[uuid.UUID | None, Query()] = None,
    status: Annotated[SalesNotificationStatus | None, Query()] = None,
) -> dict:
    """List internal sales-team notifications (agent/admin only)."""
    service = SalesTaskService(db)
    page, page_size = pagination
    result = await service.list_sales_notifications(
        page=page, page_size=page_size, lead_id=lead_id, status=status
    )
    return success_response(
        {
            "items": [
                SalesNotificationResponse.model_validate(item).model_dump()
                for item in result.items
            ],
            "meta": result.as_dict(),
        }
    )

