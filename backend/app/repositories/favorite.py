"""Favorite repository."""

from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.models.property import Favorite
from app.repositories.base import BaseRepository
from app.utils.pagination import Page


class FavoriteRepository(BaseRepository[Favorite]):
    """Data access for ``favorites`` (saved properties)."""

    model = Favorite

    async def get_by_user_property(self, user_id: uuid.UUID, property_id: uuid.UUID) -> Favorite | None:
        """Fetch a specific favorite pair."""
        stmt = select(Favorite).where(
            Favorite.user_id == user_id,
            Favorite.property_id == property_id,
        )
        return await self.session.scalar(stmt)

    async def list_user_favorites(
        self, user_id: uuid.UUID, *, page: int = 1, page_size: int = 20
    ) -> Page[Favorite]:
        """List a user's favorites, newest first."""
        stmt = (
            select(Favorite)
            .options(selectinload(Favorite.property))
            .where(Favorite.user_id == user_id)
            .order_by(Favorite.created_at.desc())
        )
        return await self.paginate(stmt, page, page_size)

    async def count_user_favorites(self, user_id: uuid.UUID) -> int:
        """Count how many properties a user has saved."""
        return await self.count(select(Favorite).where(Favorite.user_id == user_id))
