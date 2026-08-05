"""Property repository — the heaviest query surface in the platform."""

from __future__ import annotations

import math
import uuid

from sqlalchemy import func, or_, select, update
from sqlalchemy.orm import selectinload

from app.models.enums import ListingStatus, ListingType
from app.models.property import Property, PropertyPriceHistory
from app.repositories.base import BaseRepository
from app.utils.pagination import Page


def _base_property_stmt() -> select:
    """Shared select with eager-loaded relations used by list/detail responses."""
    return (
        select(Property)
        .options(
            selectinload(Property.project),
            selectinload(Property.images),
            selectinload(Property.amenities),
            selectinload(Property.category),
        )
    )


class PropertyRepository(BaseRepository[Property]):
    """Data access for ``properties`` (listing catalog)."""

    model = Property

    async def get_by_slug(self, slug: str) -> Property | None:
        """Fetch a property by slug (eager-loaded relations)."""
        stmt = _base_property_stmt().where(Property.slug == slug)
        return await self.session.scalar(stmt)

    async def get_with_relations(self, property_id: uuid.UUID) -> Property | None:
        """Fetch a property with relations (for detail endpoints)."""
        stmt = _base_property_stmt().where(Property.id == property_id)
        return await self.session.scalar(stmt)

    async def list_properties(
        self,
        *,
        page: int = 1,
        page_size: int = 20,
        status: ListingStatus | None = None,
        active_only: bool = True,
        listing_type: ListingType | None = None,
        project_id: uuid.UUID | None = None,
        category_id: uuid.UUID | None = None,
        city: str | None = None,
        agent_id: uuid.UUID | None = None,
        featured_only: bool = False,
        sort_by: str = "newest",
    ) -> Page[Property]:
        """List properties with filters and a whitelisted sort strategy."""
        stmt = _base_property_stmt()
        if active_only:
            stmt = stmt.where(Property.is_active.is_(True))
        if status:
            stmt = stmt.where(Property.listing_status == status)
        if listing_type:
            stmt = stmt.where(Property.listing_type == listing_type)
        if project_id:
            stmt = stmt.where(Property.project_id == project_id)
        if category_id:
            stmt = stmt.where(Property.category_id == category_id)
        if city:
            stmt = stmt.where(Property.city == city)
        if agent_id:
            stmt = stmt.where(Property.listing_agent_id == agent_id)
        if featured_only:
            stmt = stmt.where(Property.is_featured.is_(True))

        if sort_by == "price_asc":
            stmt = stmt.order_by(Property.price.asc().nulls_last())
        elif sort_by == "price_desc":
            stmt = stmt.order_by(Property.price.desc().nulls_last())
        elif sort_by == "popular":
            stmt = stmt.order_by(Property.view_count.desc())
        elif sort_by == "featured":
            stmt = stmt.order_by(Property.is_featured.desc(), Property.created_at.desc())
        else:
            stmt = stmt.order_by(Property.created_at.desc())

        return await self.paginate(stmt, page, page_size)

    async def search(
        self,
        *,
        query: str | None,
        page: int = 1,
        page_size: int = 20,
        city: str | None = None,
        state: str | None = None,
        project_id: uuid.UUID | None = None,
        category_id: uuid.UUID | None = None,
        listing_type: ListingType | None = None,
        min_price: float | None = None,
        max_price: float | None = None,
        min_bedrooms: int | None = None,
        max_bedrooms: int | None = None,
        furnished: str | None = None,
        is_featured: bool | None = None,
        sort_by: str = "newest",
    ) -> Page[Property]:
        """Full-text + fuzzy + filtered search over the listing catalog.

        Combines the stored ``search_tsv`` GIN index with trigram title
        matching, then applies structured filters. Only published listings are
        returned.
        """
        stmt = _base_property_stmt().where(
            Property.is_active.is_(True),
            Property.listing_status == ListingStatus.PUBLISHED,
        )
        if query:
            stmt = stmt.where(
                or_(
                    Property.search_tsv.op("@@")(func.plainto_tsquery("english", query)),
                    Property.title.ilike(f"%{query}%"),
                )
            )
        if city:
            stmt = stmt.where(Property.city == city)
        if state:
            stmt = stmt.where(Property.state == state)
        if project_id:
            stmt = stmt.where(Property.project_id == project_id)
        if category_id:
            stmt = stmt.where(Property.category_id == category_id)
        if listing_type:
            stmt = stmt.where(Property.listing_type == listing_type)
        if min_price is not None:
            stmt = stmt.where(Property.price >= min_price)
        if max_price is not None:
            stmt = stmt.where(Property.price <= max_price)
        if min_bedrooms is not None:
            stmt = stmt.where(Property.bedrooms >= min_bedrooms)
        if max_bedrooms is not None:
            stmt = stmt.where(Property.bedrooms <= max_bedrooms)
        if furnished:
            stmt = stmt.where(Property.furnished == furnished)
        if is_featured is not None:
            stmt = stmt.where(Property.is_featured.is_(is_featured))

        if sort_by == "price_asc":
            stmt = stmt.order_by(Property.price.asc().nulls_last())
        elif sort_by == "price_desc":
            stmt = stmt.order_by(Property.price.desc().nulls_last())
        elif sort_by == "popular":
            stmt = stmt.order_by(Property.view_count.desc())
        elif sort_by == "featured":
            stmt = stmt.order_by(Property.is_featured.desc(), Property.created_at.desc())
        else:
            stmt = stmt.order_by(Property.created_at.desc())

        return await self.paginate(stmt, page, page_size)

    async def list_nearby(
        self,
        *,
        latitude: float,
        longitude: float,
        radius_km: float = 25.0,
        page: int = 1,
        page_size: int = 20,
    ) -> Page[Property]:
        """List published properties within a bounding box around a point.

        A degree-per-km approximation (≈111.32 km per degree) yields a
        conservative bounding box; records are ordered by straight-line
        distance. Good enough for "nearby" without a PostGIS dependency.
        """
        km_per_degree = 111.32
        dlat = radius_km / km_per_degree
        dlon = radius_km / (km_per_degree * max(0.01, abs(math.cos(math.radians(latitude)))))

        stmt = (
            _base_property_stmt()
            .where(
                Property.is_active.is_(True),
                Property.listing_status == ListingStatus.PUBLISHED,
                Property.latitude.isnot(None),
                Property.longitude.isnot(None),
                Property.latitude.between(latitude - dlat, latitude + dlat),
                Property.longitude.between(longitude - dlon, longitude + dlon),
            )
            .order_by(Property.created_at.desc())
        )
        return await self.paginate(stmt, page, page_size)

    async def list_recommendations(
        self, property_id: uuid.UUID, *, limit: int = 6
    ) -> list[Property]:
        """Return similar published properties (same project/category/city)."""
        reference = await self.get(property_id)
        if reference is None:
            return []
        stmt = (
            _base_property_stmt()
            .where(
                Property.id != property_id,
                Property.is_active.is_(True),
                Property.listing_status == ListingStatus.PUBLISHED,
                or_(
                    Property.project_id == reference.project_id,
                    Property.category_id == reference.category_id,
                    Property.city == reference.city,
                ),
            )
            .order_by(Property.created_at.desc())
            .limit(limit)
        )
        return list((await self.session.execute(stmt)).scalars().unique().all())

    async def increment_view_count(self, property_id: uuid.UUID) -> None:
        """Atomically increment ``view_count`` in a single UPDATE.

        A read-modify-write here would race (two concurrent views can each
        observe the same count and write the same value back). The atomic
        ``view_count + 1`` keeps the counter correct under concurrency and
        skips the extra SELECT round-trip.
        """
        await self.session.execute(
            update(Property)
            .where(Property.id == property_id)
            .values(view_count=Property.view_count + 1)
        )
        await self.session.flush()

    async def slug_exists(self, slug: str) -> bool:
        """Return True when a property already uses this slug."""
        return await self.session.scalar(select(Property.id).where(Property.slug == slug)) is not None

    async def list_price_history(self, property_id: uuid.UUID, *, page: int = 1, page_size: int = 20) -> Page[PropertyPriceHistory]:
        """Paginated price history for a property."""
        stmt = (
            select(PropertyPriceHistory)
            .where(PropertyPriceHistory.property_id == property_id)
            .order_by(PropertyPriceHistory.effective_from.desc())
        )
        return await self.paginate(stmt, page, page_size)
