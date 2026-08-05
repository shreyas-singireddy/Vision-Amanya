"""Analytics endpoints: event capture and dashboard aggregates."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import Pagination, require_permission
from app.core.database import get_db
from app.core.response import success_response
from app.permissions import ANALYTICS_READ
from app.schemas.analytics import AnalyticsEventCreate
from app.services.analytics_service import AnalyticsService
from app.utils.validators import sanitize_ip

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.post("/events")
async def record_event(
    payload: AnalyticsEventCreate,
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Record a product-analytics event (public)."""
    service = AnalyticsService(db)
    ip = sanitize_ip(request.client.host if request.client else None)
    ua = request.headers.get("user-agent")
    referrer = request.headers.get("referer") or request.headers.get("referrer")
    event = await service.record(
        payload,
        ip_address=ip,
        user_agent=ua,
        referrer=referrer,
    )
    return success_response({"event_id": str(event.id)}, message="Event recorded.")


@router.get("/events", dependencies=[Depends(require_permission(ANALYTICS_READ))])
async def list_events(
    db: Annotated[AsyncSession, Depends(get_db)],
    pagination: Pagination,
    event_type: Annotated[str | None, Query(max_length=50)] = None,
    entity_type: Annotated[str | None, Query(max_length=50)] = None,
) -> dict:
    """List analytics events (agent/admin)."""
    service = AnalyticsService(db)
    page, page_size = pagination
    result = await service.list(
        page=page,
        page_size=page_size,
        event_type=event_type,
        entity_type=entity_type,
    )
    return success_response({
        "items": [{
            "id": str(e.id),
            "event_type": e.event_type,
            "entity_type": e.entity_type,
            "entity_id": str(e.entity_id) if e.entity_id else None,
            "session_id": e.session_id,
            "properties": e.properties,
            "created_at": e.created_at.isoformat(),
        } for e in result.items],
        "meta": result.as_dict(),
    })


@router.get("/dashboard", dependencies=[Depends(require_permission(ANALYTICS_READ))])
async def dashboard_stats(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Aggregate figures for the admin dashboard (agent/admin)."""
    service = AnalyticsService(db)
    stats = await service.dashboard_stats()
    return success_response(stats.model_dump(mode="json"))
