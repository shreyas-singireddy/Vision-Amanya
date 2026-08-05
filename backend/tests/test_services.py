"""Service-layer rule tests executed against the live database.

Entities are created through the repositories/services and registered with the
``db`` fixture's tracker, which removes them in FK-safe order at teardown.
"""

from __future__ import annotations

import re
import uuid
from datetime import UTC, datetime, timedelta
from decimal import Decimal

import pytest

from app.core.database import AsyncSessionLocal
from app.core.exceptions import BusinessException, NotFoundException
from app.core.security import hash_password
from app.models.enums import LeadPriority, LeadStatus, VisitType
from app.models.property import Project, Property
from app.models.user import User
from app.schemas.booking import BookingCreate, BookingUpdate
from app.schemas.lead import LeadCreate
from app.services.booking_service import BookingService
from app.services.favorite_service import FavoriteService
from app.services.lead_service import LeadService

BOOKING_NUMBER_RE = re.compile(r"^BK-\d{8}-[A-Z0-9]{6}$")


async def _make_user(db, session) -> User:
    user = db["track"](
        User(
            email=f"svc.{uuid.uuid4().hex[:10]}@example.com",
            password_hash=hash_password("Str0ng!Pass1"),
            full_name="Service User",
        )
    )
    session.add(user)
    await session.flush()
    return user


async def _make_project(db, session) -> Project:
    project = db["track"](
        Project(slug=f"svc-{uuid.uuid4().hex[:8]}", name="Svc Project")
    )
    session.add(project)
    await session.flush()
    return project


async def _make_property(db, session) -> Property:
    prop = db["track"](
        Property(
            slug=f"svc-prop-{uuid.uuid4().hex[:8]}",
            title="Svc Property",
            price=Decimal("2500000.00"),
        )
    )
    session.add(prop)
    await session.flush()
    return prop


async def test_booking_number_format_and_uniqueness(db):
    async with AsyncSessionLocal() as session:
        user = await _make_user(db, session)
        project = await _make_project(db, session)
        await session.commit()
        svc = BookingService(session)
        base = datetime.now(UTC).replace(microsecond=0) + timedelta(days=1)
        numbers = set()
        for i in range(5):
            booking = await svc.create(
                BookingCreate(
                    project_id=project.id,
                    scheduled_at=base + timedelta(hours=i * 2),
                    duration_minutes=60,
                    visit_type=VisitType.SITE_VISIT,
                    attendee_count=1,
                ),
                user_id=user.id,
            )
            db["track"](booking)
            assert BOOKING_NUMBER_RE.match(booking.booking_number)
            numbers.add(booking.booking_number)
        assert len(numbers) == 5


async def test_booking_overlap_is_rejected(db):
    async with AsyncSessionLocal() as session:
        await _make_user(db, session)
        project = await _make_project(db, session)
        await session.commit()
        svc = BookingService(session)
        start = datetime.now(UTC).replace(microsecond=0) + timedelta(days=2)
        first = await svc.create(
            BookingCreate(
                project_id=project.id,
                scheduled_at=start,
                duration_minutes=90,
                visit_type=VisitType.SITE_VISIT,
                attendee_count=1,
            )
        )
        db["track"](first)
        assert first.status.value == "requested"
        with pytest.raises(BusinessException) as exc:
            await svc.create(
                BookingCreate(
                    project_id=project.id,
                    scheduled_at=start + timedelta(minutes=30),
                    duration_minutes=60,
                    visit_type=VisitType.SITE_VISIT,
                    attendee_count=1,
                )
            )
        assert exc.value.error_code == "booking_slot_conflict"


async def test_booking_without_reference_rejected(db):
    async with AsyncSessionLocal() as session:
        await _make_user(db, session)
        await session.commit()
        svc = BookingService(session)
        with pytest.raises(BusinessException) as exc:
            await svc.create(
                BookingCreate(
                    scheduled_at=datetime.now(UTC) + timedelta(days=3),
                    duration_minutes=60,
                    visit_type=VisitType.VIRTUAL_TOUR,
                    attendee_count=1,
                )
            )
        assert exc.value.error_code == "booking_reference_required"


async def test_cancelled_booking_cannot_be_reopened(db):
    async with AsyncSessionLocal() as session:
        await _make_user(db, session)
        project = await _make_project(db, session)
        await session.commit()
        svc = BookingService(session)
        booking = await svc.create(
            BookingCreate(
                project_id=project.id,
                scheduled_at=datetime.now(UTC) + timedelta(days=4),
                duration_minutes=60,
                visit_type=VisitType.SITE_VISIT,
                attendee_count=1,
            )
        )
        db["track"](booking)
        await svc.cancel(booking.id, reason="changed mind")
        with pytest.raises(BusinessException) as exc:
            await svc.update(
                booking.id, BookingUpdate(status="confirmed")
            )
        assert exc.value.error_code == "booking_closed"


async def test_favorite_toggle_is_idempotent(db):
    async with AsyncSessionLocal() as session:
        user = await _make_user(db, session)
        prop = await _make_property(db, session)
        await session.commit()
        svc = FavoriteService(session)
        _, now = await svc.toggle(user.id, prop.id)
        assert now is True
        assert await svc.is_favorite(user.id, prop.id) is True
        _, now = await svc.toggle(user.id, prop.id)
        assert now is False
        assert await svc.is_favorite(user.id, prop.id) is False


async def test_favorite_unknown_property_not_found(db):
    async with AsyncSessionLocal() as session:
        user = await _make_user(db, session)
        await session.commit()
        svc = FavoriteService(session)
        with pytest.raises(NotFoundException) as exc:
            await svc.toggle(user.id, uuid.uuid4())
        assert exc.value.error_code == "property_not_found"


async def test_lead_won_sets_converted_at_and_cannot_reopen(db):
    async with AsyncSessionLocal() as session:
        user = await _make_user(db, session)
        await session.commit()
        svc = LeadService(session)
        lead = await svc.create(
            LeadCreate(
                name="Prospect",
                email=f"prospect.{uuid.uuid4().hex[:8]}@example.com",
                phone="+15550000000",
                priority=LeadPriority.HIGH,
            ),
            actor_id=user.id,
        )
        db["track"](lead)
        assert lead.converted_at is None
        await svc.transition(lead.id, LeadStatus.WON, actor_id=user.id)
        assert lead.converted_at is not None
        with pytest.raises(BusinessException) as exc:
            await svc.transition(lead.id, LeadStatus.NEW, actor_id=user.id)
        assert exc.value.error_code == "lead_closed"
