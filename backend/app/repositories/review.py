"""Review repository."""

from __future__ import annotations

import uuid

from sqlalchemy import select

from app.models.crm import Review
from app.models.enums import ReviewStatus
from app.repositories.base import BaseRepository
from app.utils.pagination import Page


class ReviewRepository(BaseRepository[Review]):
    """Data access for ``reviews``."""

    model = Review

    async def list_reviews(
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
        """List reviews with optional filters."""
        stmt = select(Review).order_by(Review.created_at.desc())
        if property_id:
            stmt = stmt.where(Review.property_id == property_id)
        if project_id:
            stmt = stmt.where(Review.project_id == project_id)
        if user_id:
            stmt = stmt.where(Review.user_id == user_id)
        if approved_only:
            stmt = stmt.where(Review.status == ReviewStatus.APPROVED)
        elif status:
            stmt = stmt.where(Review.status == status)
        return await self.paginate(stmt, page, page_size)

    async def count_pending(self) -> int:
        """Count reviews awaiting moderation."""
        return await self.count(select(Review).where(Review.status == ReviewStatus.PENDING))

    async def user_reviewed(self, user_id: uuid.UUID, property_id: uuid.UUID) -> bool:
        """Return True when the user already reviewed this property."""
        stmt = select(Review.id).where(
            Review.user_id == user_id,
            Review.property_id == property_id,
        )
        return await self.session.scalar(stmt) is not None
