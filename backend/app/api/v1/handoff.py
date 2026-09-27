"""API endpoints for AI-to-Human Sales Consultant Handoff & Escalation."""

from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import OptionalUser, get_db
from app.core.response import success_response
from app.models.enums import HandoffStatus
from app.schemas.handoff import HandoffRequest, HandoffStatusUpdate
from app.services.handoff_service import HandoffService

router = APIRouter(prefix="/ai/handoff", tags=["ai_handoff"])


@router.post("")
@router.post("/")
async def create_handoff(
    payload: HandoffRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: OptionalUser = None,
) -> dict:
    """Request or initiate an AI-to-human sales consultant handoff."""
    service = HandoffService(db)
    user_id = user.id if user else None
    res = await service.request_handoff(payload, user_id=user_id)
    return success_response(res.model_dump(), message=res.message)


@router.get("/queue")
async def list_handoff_queue(
    db: Annotated[AsyncSession, Depends(get_db)],
    status: HandoffStatus | None = Query(None, description="Filter by handoff status"),
    agent_id: uuid.UUID | None = Query(None, description="Filter by assigned agent ID"),
    user: OptionalUser = None,
) -> dict:
    """List active handoff queue for sales consultants and administrators."""
    service = HandoffService(db)
    items = await service.list_handoff_queue(status=status, agent_id=agent_id)
    return success_response([i.model_dump() for i in items], message="Handoff queue retrieved.")


@router.get("/analytics/metrics")
async def get_handoff_analytics(
    db: Annotated[AsyncSession, Depends(get_db)],
    user: OptionalUser = None,
) -> dict:
    """Retrieve operational performance metrics for sales handoffs."""
    service = HandoffService(db)
    metrics = await service.get_analytics()
    return success_response(metrics.model_dump(), message="Handoff analytics retrieved.")


@router.get("/{handoff_id}")
async def get_handoff_status(
    handoff_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: OptionalUser = None,
) -> dict:
    """Retrieve status and estimated wait time for a handoff request."""
    service = HandoffService(db)
    user_id = user.id if user else None
    res = await service.get_handoff_status(handoff_id, user_id=user_id)
    return success_response(res.model_dump(), message="Handoff status retrieved.")


@router.post("/{handoff_id}/accept")
async def accept_handoff(
    handoff_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    agent_id: uuid.UUID | None = Query(None, description="Assigned agent ID"),
    user: OptionalUser = None,
) -> dict:
    """Sales consultant accepts an active handoff."""
    service = HandoffService(db)
    effective_agent = agent_id or (user.id if user else uuid.uuid4())
    res = await service.accept_handoff(handoff_id, agent_id=effective_agent)
    return success_response(res.model_dump(), message="Handoff accepted.")


@router.post("/{handoff_id}/complete")
async def complete_handoff(
    handoff_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    payload: HandoffStatusUpdate | None = None,
    user: OptionalUser = None,
) -> dict:
    """Mark a sales handoff as completed."""
    service = HandoffService(db)
    notes = payload.notes if payload else None
    res = await service.complete_handoff(handoff_id, notes=notes)
    return success_response(res.model_dump(), message="Handoff completed.")


@router.post("/{handoff_id}/cancel")
async def cancel_handoff(
    handoff_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: OptionalUser = None,
) -> dict:
    """Cancel a handoff request."""
    service = HandoffService(db)
    user_id = user.id if user else None
    res = await service.cancel_handoff(handoff_id, user_id=user_id)
    return success_response(res.model_dump(), message="Handoff cancelled.")
