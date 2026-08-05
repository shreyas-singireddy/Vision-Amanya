"""Property listing endpoints: discovery, search and administration."""

from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import ActiveUser, Pagination, require_permission
from app.core.database import get_db
from app.core.response import success_response
from app.models.enums import ListingStatus, ListingType
from app.permissions import (
    PROPERTY_CREATE,
    PROPERTY_DELETE,
    PROPERTY_UPDATE,
)
from app.schemas.property import (
    PropertyCreate,
    PropertyResponse,
    PropertySearchParams,
    PropertyUpdate,
)
from app.services.property_service import PropertyService

router = APIRouter(prefix="/properties", tags=["properties"])


def _serialize_page(result) -> dict:
    return {
        "items": [PropertyResponse.model_validate(p).model_dump() for p in result.items],
        "meta": result.as_dict(),
    }


@router.get("/search")
async def search_properties(
    db: Annotated[AsyncSession, Depends(get_db)],
    params: Annotated[PropertySearchParams, Depends()],
) -> dict:
    """Full-text + filtered search over published listings (public)."""
    service = PropertyService(db)
    result = await service.search(
        query=params.q,
        page=params.page,
        page_size=params.page_size,
        city=params.city,
        state=params.state,
        project_id=params.project_id,
        category_id=params.category_id,
        listing_type=params.listing_type,
        min_price=params.min_price,
        max_price=params.max_price,
        min_bedrooms=params.min_bedrooms,
        max_bedrooms=params.max_bedrooms,
        furnished=params.furnished,
        is_featured=params.is_featured,
        sort_by=params.sort_by,
    )
    return success_response(_serialize_page(result))


@router.get("/nearby")
async def nearby_properties(
    db: Annotated[AsyncSession, Depends(get_db)],
    pagination: Pagination,
    latitude: Annotated[float, Query(ge=-90, le=90)],
    longitude: Annotated[float, Query(ge=-180, le=180)],
    radius_km: Annotated[float, Query(ge=1, le=500)] = 25.0,
) -> dict:
    """List published properties near a coordinate (public)."""
    service = PropertyService(db)
    page, page_size = pagination
    result = await service.nearby(
        latitude=latitude,
        longitude=longitude,
        radius_km=radius_km,
        page=page,
        page_size=page_size,
    )
    return success_response(_serialize_page(result))


@router.get("")
async def list_properties(
    db: Annotated[AsyncSession, Depends(get_db)],
    pagination: Pagination,
    status: Annotated[ListingStatus | None, Query()] = None,
    active_only: Annotated[bool, Query()] = True,
    listing_type: Annotated[ListingType | None, Query()] = None,
    project_id: Annotated[uuid.UUID | None, Query()] = None,
    category_id: Annotated[uuid.UUID | None, Query()] = None,
    city: Annotated[str | None, Query(max_length=100)] = None,
    agent_id: Annotated[uuid.UUID | None, Query()] = None,
    featured_only: Annotated[bool, Query()] = False,
    sort_by: Annotated[str, Query()] = "newest",
) -> dict:
    """List properties with filters (public)."""
    service = PropertyService(db)
    page, page_size = pagination
    result = await service.list(
        page=page,
        page_size=page_size,
        status=status,
        active_only=active_only,
        listing_type=listing_type,
        project_id=project_id,
        category_id=category_id,
        city=city,
        agent_id=agent_id,
        featured_only=featured_only,
        sort_by=sort_by,
    )
    return success_response(_serialize_page(result))


@router.get("/slug/{slug}")
async def get_property_by_slug(
    slug: str,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Fetch a property by slug (public; increments the view counter)."""
    service = PropertyService(db)
    property_ = await service.get_by_slug(slug, increment_view=True)
    return success_response(PropertyResponse.model_validate(property_).model_dump())


@router.get("/{property_id}")
async def get_property(
    property_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Fetch a property by id (public; increments the view counter)."""
    service = PropertyService(db)
    property_ = await service.get(property_id, increment_view=True)
    return success_response(PropertyResponse.model_validate(property_).model_dump())


@router.get("/{property_id}/recommendations")
async def get_recommendations(
    property_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Similar published properties (public)."""
    service = PropertyService(db)
    result = await service.recommendations(property_id, limit=6)
    return success_response([PropertyResponse.model_validate(p).model_dump() for p in result])


@router.get("/{property_id}/price-history")
async def get_price_history(
    property_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    pagination: Pagination,
) -> dict:
    """Paginated price history for a property."""
    service = PropertyService(db)
    page, page_size = pagination
    result = await service.list_price_history(property_id, page=page, page_size=page_size)
    return success_response({
        "items": [{
            "id": str(item.id),
            "price_before": float(item.price_before) if item.price_before is not None else None,
            "price_after": float(item.price_after),
            "change_reason": item.change_reason,
            "effective_from": item.effective_from.isoformat(),
            "created_at": item.created_at.isoformat(),
        } for item in result.items],
        "meta": result.as_dict(),
    })


@router.post("", dependencies=[Depends(require_permission(PROPERTY_CREATE))])
async def create_property(
    payload: PropertyCreate,
    actor: ActiveUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Create a property listing (agent/admin)."""
    service = PropertyService(db)
    property_ = await service.create(payload, actor_id=actor.id)
    return success_response(PropertyResponse.model_validate(property_).model_dump(), message="Property created.")


@router.patch("/{property_id}", dependencies=[Depends(require_permission(PROPERTY_UPDATE))])
async def update_property(
    property_id: uuid.UUID,
    payload: PropertyUpdate,
    actor: ActiveUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Update a property (agent/admin)."""
    service = PropertyService(db)
    property_ = await service.update(property_id, payload, actor_id=actor.id)
    return success_response(PropertyResponse.model_validate(property_).model_dump(), message="Property updated.")


@router.post("/{property_id}/publish", dependencies=[Depends(require_permission(PROPERTY_UPDATE))])
async def publish_property(
    property_id: uuid.UUID,
    actor: ActiveUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Publish a property listing (agent/admin)."""
    service = PropertyService(db)
    property_ = await service.publish(property_id, actor_id=actor.id)
    return success_response(PropertyResponse.model_validate(property_).model_dump(), message="Property published.")


@router.post("/{property_id}/price", dependencies=[Depends(require_permission(PROPERTY_UPDATE))])
async def change_price(
    property_id: uuid.UUID,
    payload: dict,
    actor: ActiveUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Change a property price and record it in price history."""
    service = PropertyService(db)
    new_price = payload.get("price")
    if new_price is None or not isinstance(new_price, (int, float)) or new_price < 0:
        from app.core.exceptions import ValidationException

        raise ValidationException("A non-negative 'price' is required.", error_code="invalid_price")
    property_ = await service.change_price(
        property_id,
        float(new_price),
        reason=payload.get("reason"),
        actor_id=actor.id,
    )
    return success_response(PropertyResponse.model_validate(property_).model_dump(), message="Price updated.")


@router.delete("/{property_id}", dependencies=[Depends(require_permission(PROPERTY_DELETE))])
async def delete_property(
    property_id: uuid.UUID,
    actor: ActiveUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Soft-delete a property listing (admin)."""
    service = PropertyService(db)
    await service.soft_delete(property_id, actor_id=actor.id)
    return success_response(message="Property deleted.")
