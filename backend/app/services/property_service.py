"""Property service: catalog, search, pricing and listing lifecycle."""

from __future__ import annotations

import uuid
from datetime import UTC, date, datetime

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import (
    BusinessException,
    ConflictException,
    NotFoundException,
)
from app.models.enums import ListingStatus
from app.models.property import Property, PropertyPriceHistory
from app.repositories.property import PropertyRepository
from app.schemas.property import PropertyCreate, PropertyUpdate
from app.services.base import BaseService
from app.utils.audit import write_audit_log
from app.utils.pagination import Page
from app.utils.slug import slugify


class PropertyService(BaseService):
    """Owns property CRUD, search and listing lifecycle rules."""

    def __init__(self, db: AsyncSession) -> None:
        super().__init__(db)
        self.properties = self._repo("properties", PropertyRepository)

    # --- CRUD -------------------------------------------------------------------

    async def create(self, payload: PropertyCreate, *, actor_id: uuid.UUID | None = None) -> Property:
        """Create a property, generating a unique slug from the title."""
        slug = payload.slug or slugify(payload.title)
        if await self.properties.slug_exists(slug):
            slug = await self._unique_slug(slug)

        data = payload.model_dump(exclude={"slug"})
        published = data.get("listing_status") == ListingStatus.PUBLISHED
        property_ = Property(**data, slug=slug)
        if published:
            from app.utils.dates import utcnow

            property_.published_at = utcnow()
        await self.properties.add(property_)
        await write_audit_log(
            self.db,
            action="property.created",
            resource_type="property",
            resource_id=property_.id,
            actor_user_id=actor_id,
            new_value={"title": property_.title, "slug": property_.slug},
        )
        await self.commit()
        return await self.properties.get_with_relations(property_.id) or property_

    async def get(self, property_id: uuid.UUID, *, increment_view: bool = False) -> Property:
        """Fetch a property (optionally bumping the view counter)."""
        property_ = await self.properties.get_with_relations(property_id)
        if property_ is None:
            raise NotFoundException("Property not found", error_code="property_not_found")
        if increment_view:
            await self.properties.increment_view_count(property_id)
            await self.commit()
        return property_

    async def get_by_slug(self, slug: str, *, increment_view: bool = False) -> Property:
        """Fetch a property by slug (optionally bumping the view counter)."""
        property_ = await self.properties.get_by_slug(slug)
        if property_ is None:
            raise NotFoundException("Property not found", error_code="property_not_found")
        if increment_view:
            await self.properties.increment_view_count(property_.id)
            await self.commit()
        return property_

    async def update(self, property_id: uuid.UUID, payload: PropertyUpdate, *, actor_id: uuid.UUID | None = None) -> Property:
        """Update a property; price changes are recorded in price history."""
        property_ = await self.properties.get_or_404(property_id)
        data = payload.model_dump(exclude_unset=True)
        old_price = property_.price

        if data.get("slug"):
            new_slug = data["slug"]
            if new_slug != property_.slug and await self.properties.slug_exists(new_slug):
                raise ConflictException("A property with this slug already exists.", error_code="slug_taken")
            property_.slug = new_slug

        for field, value in data.items():
            if field == "slug":
                continue
            setattr(property_, field, value)

        if "listing_status" in data and data["listing_status"] == ListingStatus.PUBLISHED and property_.published_at is None:
            from app.utils.dates import utcnow

            property_.published_at = utcnow()

        if "price" in data and data["price"] != old_price and property_.price is not None:
            await self._record_price_change(property_, old_price, property_.price, actor_id, "price.updated")

        await write_audit_log(
            self.db,
            action="property.updated",
            resource_type="property",
            resource_id=property_.id,
            actor_user_id=actor_id,
            new_value=data,
        )
        await self.commit()
        return await self.properties.get_with_relations(property_.id) or property_

    async def soft_delete(self, property_id: uuid.UUID, *, actor_id: uuid.UUID | None = None) -> None:
        """Soft-delete a property listing."""
        property_ = await self.properties.get_or_404(property_id)
        await self.properties.soft_delete(property_)
        await write_audit_log(
            self.db,
            action="property.deleted",
            resource_type="property",
            resource_id=property_.id,
            actor_user_id=actor_id,
        )
        await self.commit()

    # --- Lifecycle ---------------------------------------------------------------

    async def publish(self, property_id: uuid.UUID, *, actor_id: uuid.UUID | None = None) -> Property:
        """Mark a property published."""
        property_ = await self.properties.get_or_404(property_id)
        if property_.listing_status == ListingStatus.PUBLISHED:
            raise BusinessException("Property is already published.", error_code="already_published")
        property_.listing_status = ListingStatus.PUBLISHED
        from app.utils.dates import utcnow

        property_.published_at = utcnow()
        await write_audit_log(
            self.db,
            action="property.published",
            resource_type="property",
            resource_id=property_.id,
            actor_user_id=actor_id,
        )
        await self.commit()
        return property_

    async def change_price(
        self,
        property_id: uuid.UUID,
        new_price: float,
        *,
        reason: str | None = None,
        effective_from: date | None = None,
        actor_id: uuid.UUID | None = None,
    ) -> Property:
        """Set a new price and record the change in price history."""
        property_ = await self.properties.get_or_404(property_id)
        old_price = property_.price
        property_.price = new_price
        await self._record_price_change(property_, old_price, new_price, actor_id, reason)
        await write_audit_log(
            self.db,
            action="property.price_changed",
            resource_type="property",
            resource_id=property_.id,
            actor_user_id=actor_id,
            old_value={"price": old_price},
            new_value={"price": new_price, "reason": reason},
        )
        await self.commit()
        return property_

    async def list_price_history(self, property_id: uuid.UUID, *, page: int = 1, page_size: int = 20) -> Page[PropertyPriceHistory]:
        """Return paginated price history for a property."""
        await self.properties.get_or_404(property_id)
        return await self.properties.list_price_history(property_id, page=page, page_size=page_size)

    # --- Discovery ----------------------------------------------------------------

    async def list(
        self,
        *,
        page: int = 1,
        page_size: int = 20,
        status: ListingStatus | None = None,
        active_only: bool = True,
        listing_type=None,
        project_id: uuid.UUID | None = None,
        category_id: uuid.UUID | None = None,
        city: str | None = None,
        agent_id: uuid.UUID | None = None,
        featured_only: bool = False,
        sort_by: str = "newest",
    ) -> Page[Property]:
        """Paginate properties with filters."""
        return await self.properties.list_properties(
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

    async def search(
        self,
        *,
        query: str | None = None,
        page: int = 1,
        page_size: int = 20,
        city: str | None = None,
        state: str | None = None,
        project_id: uuid.UUID | None = None,
        category_id: uuid.UUID | None = None,
        listing_type=None,
        min_price: float | None = None,
        max_price: float | None = None,
        min_bedrooms: int | None = None,
        max_bedrooms: int | None = None,
        furnished: str | None = None,
        is_featured: bool | None = None,
        sort_by: str = "newest",
    ) -> Page[Property]:
        """Full-text + filtered search over published listings."""
        return await self.properties.search(
            query=query,
            page=page,
            page_size=page_size,
            city=city,
            state=state,
            project_id=project_id,
            category_id=category_id,
            listing_type=listing_type,
            min_price=min_price,
            max_price=max_price,
            min_bedrooms=min_bedrooms,
            max_bedrooms=max_bedrooms,
            furnished=furnished,
            is_featured=is_featured,
            sort_by=sort_by,
        )

    async def nearby(self, *, latitude: float, longitude: float, radius_km: float = 25.0, page: int = 1, page_size: int = 20) -> Page[Property]:
        """List published properties near a point (bounding-box approximation)."""
        return await self.properties.list_nearby(
            latitude=latitude,
            longitude=longitude,
            radius_km=radius_km,
            page=page,
            page_size=page_size,
        )

    async def recommendations(self, property_id: uuid.UUID, *, limit: int = 6) -> list[Property]:
        """Return similar published properties."""
        return await self.properties.list_recommendations(property_id, limit=limit)

    # --- Helpers ------------------------------------------------------------------

    async def _record_price_change(self, property_: Property, price_before: float | None, price_after: float, actor_id: uuid.UUID | None, reason: str | None) -> None:
        entry = PropertyPriceHistory(
            property_id=property_.id,
            price_before=price_before,
            price_after=price_after,
            change_reason=reason,
            changed_by=actor_id,
            effective_from=datetime.now(UTC).date(),
        )
        self.db.add(entry)
        await self.db.flush()

    async def _unique_slug(self, base: str) -> str:
        candidate = base
        index = 2
        while await self.properties.slug_exists(candidate):
            candidate = f"{base}-{index}"
            index += 1
        return candidate
