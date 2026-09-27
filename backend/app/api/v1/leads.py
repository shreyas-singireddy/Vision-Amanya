"""Lead pipeline endpoints."""

from __future__ import annotations

import asyncio
import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import ActiveUser, OptionalUser, Pagination, require_permission
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


# ── Phase 7.5 endpoints ────────────────────────────────────────────────────────

@router.post("/{lead_id}/whatsapp/consent", dependencies=[Depends(require_permission(LEAD_UPDATE))])
async def record_whatsapp_consent(
    lead_id: uuid.UUID,
    payload: dict,
    actor: ActiveUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Record WhatsApp contact consent (or declination) for a lead."""
    consent = bool(payload.get("consent", False))
    source = payload.get("source", "ai_consultant")
    service = LeadService(db)
    lead = await service.record_whatsapp_consent(lead_id, consent, source=source)
    return success_response(
        LeadResponse.model_validate(lead).model_dump(),
        message="WhatsApp consent recorded.",
    )


@router.post("/{lead_id}/whatsapp/send", dependencies=[Depends(require_permission(LEAD_UPDATE))])
async def send_whatsapp_message(
    lead_id: uuid.UUID,
    payload: dict,
    actor: ActiveUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Send a WhatsApp message to a lead (requires whatsapp_consent=True)."""
    from app.core.exceptions import ValidationException
    from app.services.whatsapp_service import WhatsAppService

    service = LeadService(db)
    lead = await service.get(lead_id)
    if not lead.whatsapp_consent:
        raise ValidationException(
            "WhatsApp consent not given for this lead.",
            error_code="whatsapp_consent_required",
        )
    phone = lead.whatsapp_number or lead.phone
    if not phone:
        raise ValidationException("No phone number on lead.", error_code="phone_missing")

    units = payload.get("units", lead.interested_unit_ids or [])
    wa_service = WhatsAppService(db)
    wa_msg = await wa_service.send_shortlist(
        lead_id=lead.id,
        phone=phone,
        name=lead.name,
        units=units,
        configuration=lead.configuration,
        view=lead.preferred_view,
    )
    return success_response(
        {"status": str(wa_msg.status), "provider_message_id": wa_msg.provider_message_id},
        message="WhatsApp message dispatched.",
    )


@router.post("/{lead_id}/sales-handoff", dependencies=[Depends(require_permission(LEAD_UPDATE))])
async def trigger_sales_handoff(
    lead_id: uuid.UUID,
    payload: dict,
    actor: ActiveUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Trigger the complete sales handoff: update lead status, send WhatsApp, email sales team."""
    from app.services.sales_notification_service import SalesNotificationService
    from app.services.whatsapp_service import WhatsAppService

    service = LeadService(db)
    lead = await service.get(lead_id)

    # Update status to QUALIFIED
    if lead.status == LeadStatus.NEW:
        lead = await service.transition(lead_id, LeadStatus.QUALIFIED, actor_id=actor.id)

    # Async: WhatsApp + sales email (fire-and-forget; lead already saved)
    async def _async_tasks() -> None:
        if lead.whatsapp_consent and (lead.whatsapp_number or lead.phone):
            wa = WhatsAppService(db)
            await wa.send_shortlist(
                lead_id=lead.id,
                phone=lead.whatsapp_number or lead.phone,
                name=lead.name,
                units=lead.interested_unit_ids or [],
                configuration=lead.configuration,
                view=lead.preferred_view,
            )
        notif_svc = SalesNotificationService(db)
        await notif_svc.notify_new_lead(lead)

    asyncio.create_task(_async_tasks())

    return success_response(
        LeadResponse.model_validate(lead).model_dump(),
        message="Sales handoff initiated.",
    )


@router.get("/{lead_id}/export", dependencies=[Depends(require_permission(LEAD_READ))])
async def export_lead_excel(
    lead_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Response:
    """Download a single lead as a styled Excel (.xlsx) file."""
    from app.services.excel_export_service import ExcelExportService

    svc = ExcelExportService(db)
    xlsx_bytes = await svc.export_lead(lead_id)
    return Response(
        content=xlsx_bytes,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="amnaya_lead_{lead_id}.xlsx"'},
    )


@router.get("/export", dependencies=[Depends(require_permission(LEAD_READ))])
async def export_leads_excel(
    db: Annotated[AsyncSession, Depends(get_db)],
    status: Annotated[str | None, Query()] = None,
    limit: Annotated[int, Query(ge=1, le=2000)] = 500,
) -> Response:
    """Bulk export leads as Excel. PostgreSQL is the source of truth — Excel is derived only."""
    from app.services.excel_export_service import ExcelExportService

    svc = ExcelExportService(db)
    xlsx_bytes = await svc.export_all_leads(status=status, limit=limit)
    return Response(
        content=xlsx_bytes,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": 'attachment; filename="amnaya_leads_export.xlsx"'},
    )
