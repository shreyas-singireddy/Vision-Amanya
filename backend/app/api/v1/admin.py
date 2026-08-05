"""Admin endpoints: system statistics and application settings."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import ActiveUser, require_permission
from app.core.database import get_db
from app.core.response import success_response
from app.permissions import ADMIN_MANAGE
from app.schemas.admin import AppSettingResponse, AppSettingUpdate
from app.services.admin_service import AdminService

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/stats", dependencies=[Depends(require_permission(ADMIN_MANAGE))])
async def system_stats(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Headline platform statistics (admin)."""
    service = AdminService(db)
    stats = await service.system_stats()
    return success_response(stats.model_dump(mode="json"))


@router.get("/settings", dependencies=[Depends(require_permission(ADMIN_MANAGE))])
async def list_settings(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """List all application settings (admin)."""
    service = AdminService(db)
    settings = await service.list_settings()
    return success_response([AppSettingResponse.model_validate(s).model_dump() for s in settings])


@router.get("/settings/{key}", dependencies=[Depends(require_permission(ADMIN_MANAGE))])
async def get_setting(
    key: str,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Fetch one application setting (admin)."""
    service = AdminService(db)
    setting = await service.get_setting(key)
    return success_response(AppSettingResponse.model_validate(setting).model_dump())


@router.put("/settings/{key}", dependencies=[Depends(require_permission(ADMIN_MANAGE))])
async def upsert_setting(
    key: str,
    payload: AppSettingUpdate,
    actor: ActiveUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Create or update an application setting (admin)."""
    service = AdminService(db)
    setting = await service.upsert_setting(key, payload, actor_id=actor.id)
    return success_response(AppSettingResponse.model_validate(setting).model_dump(), message="Setting saved.")
