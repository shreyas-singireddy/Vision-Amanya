"""Review endpoints (submission, listing, moderation)."""

from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import ActiveUser, CurrentUser, Pagination, require_permission
from app.core.database import get_db
from app.core.response import success_response
from app.models.enums import ReviewStatus
from app.permissions import REVIEW_MODERATE
from app.schemas.review import (
    ReviewCreate,
    ReviewModerate,
    ReviewResponse,
    ReviewUpdate,
)
from app.services.review_service import ReviewService

router = APIRouter(prefix="/reviews", tags=["reviews"])


@router.post("")
async def create_review(
    payload: ReviewCreate,
    user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Submit a review (authenticated user)."""
    service = ReviewService(db)
    review = await service.create(payload, user_id=user.id)
    return success_response(ReviewResponse.model_validate(review).model_dump(), message="Review submitted for moderation.")


@router.get("")
async def list_reviews(
    db: Annotated[AsyncSession, Depends(get_db)],
    pagination: Pagination,
    property_id: Annotated[uuid.UUID | None, Query()] = None,
    project_id: Annotated[uuid.UUID | None, Query()] = None,
    user_id: Annotated[uuid.UUID | None, Query()] = None,
    status: Annotated[ReviewStatus | None, Query()] = None,
    approved_only: Annotated[bool, Query()] = True,
) -> dict:
    """List reviews; defaults to approved only (public)."""
    service = ReviewService(db)
    page, page_size = pagination
    result = await service.list(
        page=page,
        page_size=page_size,
        property_id=property_id,
        project_id=project_id,
        user_id=user_id,
        status=status,
        approved_only=approved_only,
    )
    return success_response({
        "items": [ReviewResponse.model_validate(r).model_dump() for r in result.items],
        "meta": result.as_dict(),
    })


@router.get("/pending", dependencies=[Depends(require_permission(REVIEW_MODERATE))])
async def pending_reviews(
    db: Annotated[AsyncSession, Depends(get_db)],
    pagination: Pagination,
) -> dict:
    """List reviews awaiting moderation (agent/admin)."""
    service = ReviewService(db)
    page, page_size = pagination
    result = await service.list(page=page, page_size=page_size, status=ReviewStatus.PENDING, approved_only=False)
    return success_response({
        "items": [ReviewResponse.model_validate(r).model_dump() for r in result.items],
        "meta": result.as_dict(),
    })


@router.get("/{review_id}")
async def get_review(
    review_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Fetch a review (public)."""
    service = ReviewService(db)
    review = await service.get(review_id)
    return success_response(ReviewResponse.model_validate(review).model_dump())


@router.patch("/{review_id}")
async def update_review(
    review_id: uuid.UUID,
    payload: ReviewUpdate,
    user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Edit a review (author only)."""
    service = ReviewService(db)
    review = await service.update(review_id, payload, user_id=user.id)
    return success_response(ReviewResponse.model_validate(review).model_dump(), message="Review updated.")


@router.post("/{review_id}/moderate", dependencies=[Depends(require_permission(REVIEW_MODERATE))])
async def moderate_review(
    review_id: uuid.UUID,
    payload: ReviewModerate,
    actor: ActiveUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Approve or reject a review (agent/admin)."""
    service = ReviewService(db)
    review = await service.moderate(review_id, payload, actor_id=actor.id)
    return success_response(ReviewResponse.model_validate(review).model_dump(), message="Review moderated.")
