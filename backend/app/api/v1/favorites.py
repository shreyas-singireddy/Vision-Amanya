"""Favorite (saved-property) endpoints."""

from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import CurrentUser, Pagination
from app.core.database import get_db
from app.core.response import success_response
from app.schemas.favorite import FavoriteCreate, FavoriteResponse
from app.services.favorite_service import FavoriteService

router = APIRouter(prefix="/favorites", tags=["favorites"])


@router.post("/toggle")
async def toggle_favorite(
    payload: FavoriteCreate,
    user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Add or remove a favorite for the caller."""
    service = FavoriteService(db)
    _favorite, is_favorite = await service.toggle(user.id, payload.property_id)
    return success_response(
        {"property_id": str(payload.property_id), "is_favorite": is_favorite},
        message="Saved." if is_favorite else "Removed from saved.",
    )


@router.get("/me/status/{property_id}")
async def favorite_status(
    property_id: uuid.UUID,
    user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Return whether the caller has saved a property."""
    service = FavoriteService(db)
    is_favorite = await service.is_favorite(user.id, property_id)
    return success_response({"property_id": str(property_id), "is_favorite": is_favorite})


@router.get("/me")
async def my_favorites(
    user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
    pagination: Pagination,
) -> dict:
    """List the caller's saved properties."""
    service = FavoriteService(db)
    page, page_size = pagination
    result = await service.list(user.id, page=page, page_size=page_size)
    return success_response({
        "items": [FavoriteResponse.model_validate(f).model_dump() for f in result.items],
        "meta": result.as_dict(),
    })


@router.get("/me/count")
async def favorite_count(
    user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Return the caller's saved-property count."""
    service = FavoriteService(db)
    count = await service.count(user.id)
    return success_response({"count": count})
