"""Analytics service: event capture and dashboard aggregation."""

from __future__ import annotations

import uuid
from datetime import UTC, datetime

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.crm import Booking, Enquiry, Lead, Review
from app.models.enums import BookingStatus, ListingStatus, ReviewStatus
from app.models.property import Project, Property
from app.models.system import AnalyticsEvent
from app.models.user import Agent, User
from app.repositories.analytics_event import AnalyticsEventRepository
from app.schemas.analytics import AnalyticsEventCreate, DashboardStats
from app.services.base import BaseService
from app.utils.pagination import Page


class AnalyticsService(BaseService):
    """Owns the append-only analytics stream and dashboard metrics."""

    def __init__(self, db: AsyncSession) -> None:
        super().__init__(db)
        self.events = self._repo("events", AnalyticsEventRepository)

    async def record(
        self,
        payload: AnalyticsEventCreate,
        *,
        user_id: uuid.UUID | None = None,
        ip_address: str | None = None,
        user_agent: str | None = None,
        referrer: str | None = None,
    ) -> AnalyticsEvent:
        """Record a product-analytics event (public, unauthenticated allowed)."""
        event = AnalyticsEvent(
            user_id=user_id,
            session_id=payload.session_id,
            event_type=payload.event_type,
            entity_type=payload.entity_type,
            entity_id=payload.entity_id,
            properties=payload.properties,
            ip_address=ip_address,
            user_agent=user_agent,
            referrer=referrer,
        )
        await self.events.add(event)
        await self.commit()
        return event

    async def list(
        self,
        *,
        page: int = 1,
        page_size: int = 20,
        event_type: str | None = None,
        entity_type: str | None = None,
        from_date: datetime | None = None,
    ) -> Page[AnalyticsEvent]:
        """Paginate analytics events with optional filters."""
        return await self.events.list_events(
            page=page,
            page_size=page_size,
            event_type=event_type,
            entity_type=entity_type,
            from_date=from_date,
        )

    async def dashboard_stats(self) -> DashboardStats:
        """Compute aggregate figures for the admin dashboard."""
        now = datetime.now(UTC)
        total_users = await self.db.scalar(select(func.count()).select_from(User)) or 0
        total_agents = await self.db.scalar(select(func.count()).select_from(Agent)) or 0
        total_properties = await self.db.scalar(select(func.count()).select_from(Property)) or 0
        published = await self.db.scalar(
            select(func.count()).select_from(Property).where(
                Property.listing_status == ListingStatus.PUBLISHED,
                Property.is_active.is_(True),
            )
        ) or 0
        total_projects = await self.db.scalar(select(func.count()).select_from(Project)) or 0
        total_leads = await self.db.scalar(select(func.count()).select_from(Lead)) or 0
        open_leads = await self.db.scalar(
            select(func.count()).select_from(Lead).where(Lead.status.notin_(["won", "lost"]))
        ) or 0
        total_bookings = await self.db.scalar(select(func.count()).select_from(Booking)) or 0
        confirmed_bookings = await self.db.scalar(
            select(func.count()).select_from(Booking).where(Booking.status == BookingStatus.CONFIRMED)
        ) or 0
        total_enquiries = await self.db.scalar(select(func.count()).select_from(Enquiry)) or 0
        pending_reviews = await self.db.scalar(
            select(func.count()).select_from(Review).where(Review.status == ReviewStatus.PENDING)
        ) or 0
        active_value = await self.db.scalar(
            select(func.coalesce(func.sum(Property.price), 0)).where(
                Property.listing_status == ListingStatus.PUBLISHED,
                Property.is_active.is_(True),
            )
        ) or 0

        return DashboardStats(
            total_users=total_users,
            total_agents=total_agents,
            total_properties=total_properties,
            published_properties=published,
            total_projects=total_projects,
            total_leads=total_leads,
            open_leads=open_leads,
            total_bookings=total_bookings,
            confirmed_bookings=confirmed_bookings,
            total_enquiries=total_enquiries,
            pending_reviews=pending_reviews,
            active_listings_value=float(active_value),
            generated_at=now,
        )

    async def count_events_since(self, since: datetime) -> int:
        """Count analytics events recorded since a timestamp."""
        return await self.events.count_since(since)
