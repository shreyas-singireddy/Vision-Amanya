"""Enquiry endpoints (public capture + internal triage)."""

from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import ActiveUser, Pagination, require_permission
from app.core.database import get_db
from app.core.response import success_response
from app.models.enums import EnquiryStatus
from app.permissions import ENQUIRY_READ, ENQUIRY_UPDATE, LEAD_CREATE
from app.schemas.enquiry import (
    EnquiryCreate,
    EnquiryResponse,
    EnquiryStatusUpdate,
    EnquiryUpdate,
)
from app.services.enquiry_service import EnquiryService
from app.utils.validators import sanitize_ip

router = APIRouter(prefix="/enquiries", tags=["enquiries"])


@router.post("")
async def create_enquiry(
    payload: EnquiryCreate,
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Submit an enquiry (public)."""
    service = EnquiryService(db)
    ip = sanitize_ip(request.client.host if request.client else None)
    ua = request.headers.get("user-agent")
    enquiry = await service.create(
        payload,
        created_by=None,
        ip_address=ip,
        user_agent=ua,
    )
    return success_response(EnquiryResponse.model_validate(enquiry).model_dump(), message="Enquiry submitted.")


@router.get("", dependencies=[Depends(require_permission(ENQUIRY_READ))])
async def list_enquiries(
    db: Annotated[AsyncSession, Depends(get_db)],
    pagination: Pagination,
    status: Annotated[EnquiryStatus | None, Query()] = None,
    email: Annotated[str | None, Query(max_length=255)] = None,
    property_id: Annotated[uuid.UUID | None, Query()] = None,
) -> dict:
    """List enquiries (agent/admin)."""
    service = EnquiryService(db)
    page, page_size = pagination
    result = await service.list(
        page=page,
        page_size=page_size,
        status=status,
        email=email,
        property_id=property_id,
    )
    return success_response({
        "items": [EnquiryResponse.model_validate(e).model_dump() for e in result.items],
        "meta": result.as_dict(),
    })


@router.get("/{enquiry_id}", dependencies=[Depends(require_permission(ENQUIRY_READ))])
async def get_enquiry(
    enquiry_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Fetch an enquiry (agent/admin)."""
    service = EnquiryService(db)
    enquiry = await service.get(enquiry_id)
    return success_response(EnquiryResponse.model_validate(enquiry).model_dump())


@router.patch("/{enquiry_id}", dependencies=[Depends(require_permission(ENQUIRY_UPDATE))])
async def update_enquiry(
    enquiry_id: uuid.UUID,
    payload: EnquiryUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Update enquiry subject/message (agent/admin)."""
    service = EnquiryService(db)
    enquiry = await service.update(enquiry_id, payload)
    return success_response(EnquiryResponse.model_validate(enquiry).model_dump(), message="Enquiry updated.")


@router.patch("/{enquiry_id}/status", dependencies=[Depends(require_permission(ENQUIRY_UPDATE))])
async def update_enquiry_status(
    enquiry_id: uuid.UUID,
    payload: EnquiryStatusUpdate,
    actor: ActiveUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Transition an enquiry's status (agent/admin)."""
    service = EnquiryService(db)
    enquiry = await service.update_status(enquiry_id, payload, actor_id=actor.id)
    return success_response(EnquiryResponse.model_validate(enquiry).model_dump(), message="Enquiry status updated.")


@router.post("/{enquiry_id}/promote", dependencies=[Depends(require_permission(LEAD_CREATE))])
async def promote_enquiry(
    enquiry_id: uuid.UUID,
    actor: ActiveUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Promote an enquiry into a lead (agent/admin)."""
    service = EnquiryService(db)
    lead = await service.promote(enquiry_id, actor_id=actor.id)
    return success_response({"lead_id": str(lead.id), "lead_email": lead.email}, message="Enquiry promoted to lead.")
