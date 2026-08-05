"""Lead pipeline endpoints."""

from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import ActiveUser, Pagination, require_permission
from app.core.database import get_db
from app.core.response import success_response
from app.models.enums import LeadPriority, LeadStatus
from app.permissions import (
    LEAD_ASSIGN,
    LEAD_CREATE,
    LEAD_READ,
    LEAD_UPDATE,
)
from app.schemas.lead import LeadAssign, LeadCreate, LeadResponse, LeadUpdate
from app.services.lead_service import LeadService

router = APIRouter(prefix="/leads", tags=["leads"])


def _serialize_page(result) -> dict:
    return {
        "items": [LeadResponse.model_validate(lead).model_dump() for lead in result.items],
        "meta": result.as_dict(),
    }


@router.post("", dependencies=[Depends(require_permission(LEAD_CREATE))])
async def create_lead(
    payload: LeadCreate,
    actor: ActiveUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Create a lead (agent/admin)."""
    service = LeadService(db)
    lead = await service.create(payload, actor_id=actor.id)
    return success_response(LeadResponse.model_validate(lead).model_dump(), message="Lead created.")


@router.get("", dependencies=[Depends(require_permission(LEAD_READ))])
async def list_leads(
    db: Annotated[AsyncSession, Depends(get_db)],
    pagination: Pagination,
    status: Annotated[LeadStatus | None, Query()] = None,
    priority: Annotated[LeadPriority | None, Query()] = None,
    assigned_to: Annotated[uuid.UUID | None, Query()] = None,
    user_id: Annotated[uuid.UUID | None, Query()] = None,
    email: Annotated[str | None, Query(max_length=255)] = None,
    search: Annotated[str | None, Query(max_length=150)] = None,
) -> dict:
    """List leads with optional filters (agent/admin)."""
    service = LeadService(db)
    page, page_size = pagination
    result = await service.list(
        page=page,
        page_size=page_size,
        status=status,
        priority=priority,
        assigned_to=assigned_to,
        user_id=user_id,
        email=email,
        search=search,
    )
    return success_response(_serialize_page(result))


@router.get("/follow-ups", dependencies=[Depends(require_permission(LEAD_READ))])
async def list_due_follow_ups(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Leads whose next follow-up is due (agent/admin)."""
    service = LeadService(db)
    leads = await service.list_due_follow_ups(limit=50)
    return success_response([LeadResponse.model_validate(lead).model_dump() for lead in leads])


@router.get("/{lead_id}", dependencies=[Depends(require_permission(LEAD_READ))])
async def get_lead(
    lead_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Fetch a lead (agent/admin)."""
    service = LeadService(db)
    lead = await service.get(lead_id)
    return success_response(LeadResponse.model_validate(lead).model_dump())


@router.patch("/{lead_id}", dependencies=[Depends(require_permission(LEAD_UPDATE))])
async def update_lead(
    lead_id: uuid.UUID,
    payload: LeadUpdate,
    actor: ActiveUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Update a lead (agent/admin)."""
    service = LeadService(db)
    lead = await service.update(lead_id, payload, actor_id=actor.id)
    return success_response(LeadResponse.model_validate(lead).model_dump(), message="Lead updated.")


@router.post("/{lead_id}/assign", dependencies=[Depends(require_permission(LEAD_ASSIGN))])
async def assign_lead(
    lead_id: uuid.UUID,
    payload: LeadAssign,
    actor: ActiveUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Assign a lead to an agent (agent/admin)."""
    service = LeadService(db)
    lead = await service.assign(lead_id, payload, actor_id=actor.id)
    return success_response(LeadResponse.model_validate(lead).model_dump(), message="Lead assigned.")


@router.post("/{lead_id}/transition", dependencies=[Depends(require_permission(LEAD_UPDATE))])
async def transition_lead(
    lead_id: uuid.UUID,
    payload: dict,
    actor: ActiveUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Move a lead through the pipeline (agent/admin)."""
    from app.core.exceptions import ValidationException

    raw = payload.get("status")
    try:
        status = LeadStatus(raw)
    except (ValueError, TypeError) as exc:
        raise ValidationException("Invalid lead status.", error_code="invalid_lead_status", details={"valid": [s.value for s in LeadStatus]}) from exc
    service = LeadService(db)
    lead = await service.transition(lead_id, status, reason=payload.get("reason"), actor_id=actor.id)
    return success_response(LeadResponse.model_validate(lead).model_dump(), message="Lead status updated.")
