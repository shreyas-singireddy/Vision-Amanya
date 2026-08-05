"""Favorite service: save/remove properties for a user."""

from __future__ import annotations

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundException
from app.models.property import Favorite, Property
from app.repositories.favorite import FavoriteRepository
from app.services.base import BaseService
from app.utils.pagination import Page


class FavoriteService(BaseService):
    """Owns the user ↔ property bookmark relationship."""

    def __init__(self, db: AsyncSession) -> None:
        super().__init__(db)
        self.favorites = self._repo("favorites", FavoriteRepository)

    async def toggle(self, user_id: uuid.UUID, property_id: uuid.UUID) -> tuple[Favorite | None, bool]:
        """Add or remove a favorite; returns (favorite, is_favorite_now)."""
        property_ = await self.db.get(Property, property_id)
        if property_ is None:
            raise NotFoundException("Property not found", error_code="property_not_found")
        existing = await self.favorites.get_by_user_property(user_id, property_id)
        if existing is not None:
            await self.favorites.delete(existing)
            await self.commit()
            return None, False
        favorite = Favorite(user_id=user_id, property_id=property_id)
        await self.favorites.add(favorite)
        await self.commit()
        return favorite, True

    async def is_favorite(self, user_id: uuid.UUID, property_id: uuid.UUID) -> bool:
        """Return True when the user has saved this property."""
        return await self.favorites.get_by_user_property(user_id, property_id) is not None

    async def list(self, user_id: uuid.UUID, *, page: int = 1, page_size: int = 20) -> Page[Favorite]:
        """Paginate a user's favorites."""
        return await self.favorites.list_user_favorites(user_id, page=page, page_size=page_size)

    async def count(self, user_id: uuid.UUID) -> int:
        """Count a user's saved properties."""
        return await self.favorites.count_user_favorites(user_id)
