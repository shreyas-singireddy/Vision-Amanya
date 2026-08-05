"""Review service: submission, moderation and verified-purchase detection."""

from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import BusinessException
from app.models.crm import Booking, Review
from app.models.enums import BookingStatus, ReviewStatus
from app.repositories.review import ReviewRepository
from app.schemas.review import ReviewCreate, ReviewModerate, ReviewUpdate
from app.services.base import BaseService
from app.utils.audit import write_audit_log
from app.utils.pagination import Page


class ReviewService(BaseService):
    """Owns review submission and the moderation workflow."""

    def __init__(self, db: AsyncSession) -> None:
        super().__init__(db)
        self.reviews = self._repo("reviews", ReviewRepository)

    async def create(self, payload: ReviewCreate, *, user_id: uuid.UUID) -> Review:
        """Create a review, flagging verified-purchase from a completed booking."""
        if payload.property_id is None and payload.project_id is None:
            raise BusinessException("A review must reference a property or project.", error_code="review_reference_required")
        if payload.property_id and await self.reviews.user_reviewed(user_id, payload.property_id):
            raise BusinessException("You have already reviewed this property.", error_code="review_already_exists")

        review = Review(
            user_id=user_id,
            property_id=payload.property_id,
            project_id=payload.project_id,
            rating=payload.rating,
            title=payload.title,
            body=payload.body,
            pros=payload.pros,
            cons=payload.cons,
            status=ReviewStatus.PENDING,
            is_verified_purchase=await self._has_completed_booking(user_id, payload.property_id),
        )
        await self.reviews.add(review)
        await write_audit_log(
            self.db,
            action="review.created",
            resource_type="review",
            resource_id=review.id,
            actor_user_id=user_id,
            new_value={"property_id": str(payload.property_id), "rating": payload.rating},
        )
        await self.commit()
        return review

    async def get(self, review_id: uuid.UUID) -> Review:
        """Fetch a review or raise 404."""
        return await self.reviews.get_or_404(review_id)

    async def update(self, review_id: uuid.UUID, payload: ReviewUpdate, *, user_id: uuid.UUID) -> Review:
        """Update a review (author only; not allowed after approval)."""
        review = await self.reviews.get_or_404(review_id)
        if review.user_id != user_id:
            raise BusinessException("You can only edit your own reviews.", error_code="review_not_owned")
        if review.status != ReviewStatus.PENDING:
            raise BusinessException("A moderated review cannot be edited.", error_code="review_not_editable")
        data = payload.model_dump(exclude_unset=True)
        for field, value in data.items():
            setattr(review, field, value)
        await self.commit()
        return review

    async def moderate(self, review_id: uuid.UUID, payload: ReviewModerate, *, actor_id: uuid.UUID | None = None) -> Review:
        """Approve or reject a review (admin/agent)."""
        review = await self.reviews.get_or_404(review_id)
        if payload.status not in {ReviewStatus.APPROVED, ReviewStatus.REJECTED}:
            raise BusinessException("Moderation must approve or reject.", error_code="review_moderation_status")
        review.status = payload.status
        review.admin_note = payload.admin_note
        await write_audit_log(
            self.db,
            action="review.moderated",
            resource_type="review",
            resource_id=review.id,
            actor_user_id=actor_id,
            old_value={"status": review.status.value},
            new_value={"status": payload.status.value, "admin_note": payload.admin_note},
        )
        await self.commit()
        return review

    async def list(
        self,
        *,
        page: int = 1,
        page_size: int = 20,
        property_id: uuid.UUID | None = None,
        project_id: uuid.UUID | None = None,
        user_id: uuid.UUID | None = None,
        status: ReviewStatus | None = None,
        approved_only: bool = False,
    ) -> Page[Review]:
        """Paginate reviews with optional filters."""
        return await self.reviews.list_reviews(
            page=page,
            page_size=page_size,
            property_id=property_id,
            project_id=project_id,
            user_id=user_id,
            status=status,
            approved_only=approved_only,
        )

    async def count_pending(self) -> int:
        """Count reviews awaiting moderation."""
        return await self.reviews.count_pending()

    async def _has_completed_booking(self, user_id: uuid.UUID, property_id: uuid.UUID | None) -> bool:
        if property_id is None:
            return False
        stmt = select(Booking.id).where(
            Booking.user_id == user_id,
            Booking.property_id == property_id,
            Booking.status == BookingStatus.COMPLETED,
        )
        return await self.db.scalar(stmt) is not None
