"""Shared pytest fixtures.

These tests run against the live development database. Every test that
creates users does so through the API with unique emails and is cleaned up
in the ``user_factory`` teardown so the schema stays pristine.
"""

from __future__ import annotations

import asyncio
import os
import uuid

# Test mode must be set before any app import: it flips the async engine to
# NullPool (see app/core/database.py) which prevents asyncpg connections from
# leaking across pytest's per-test event loops.
os.environ["ENVIRONMENT"] = "test"

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import delete, select

from app.core.database import AsyncSessionLocal
from app.models.rbac import Role, UserRole
from app.models.user import User
from main import app

PASSWORD = "Str0ng!Pass1"


def random_email() -> str:
    return f"pytest.{uuid.uuid4().hex[:10]}@example.com"


def _assign_role_sync(user_id: str, role_code: str) -> None:
    async def _do() -> None:
        async with AsyncSessionLocal() as db:
            role = await db.scalar(select(Role).where(Role.code == role_code))
            if role is None:
                raise RuntimeError(f"Role {role_code} not found — run scripts/seed_rbac.py")
            await db.execute(
                delete(UserRole).where(UserRole.user_id == user_id)
            )
            db.add(UserRole(user_id=user_id, role_id=role.id, granted_by=None))
            await db.commit()

    asyncio.run(_do())


def _delete_users_sync(user_ids: list[str]) -> None:
    """Remove test users and their role links; FKs cascade the rest."""
    async def _do() -> None:
        async with AsyncSessionLocal() as db:
            await db.execute(delete(UserRole).where(UserRole.user_id.in_(user_ids)))
            await db.execute(
                User.__table__.delete().where(User.id.in_(user_ids))
            )
            await db.commit()

    asyncio.run(_do())


@pytest.fixture
def client() -> TestClient:
    """A live TestClient with lifespan (Redis + app state) running."""
    with TestClient(app) as c:
        yield c


@pytest.fixture
def user_factory(client: TestClient):
    """Register fresh users through the API and clean them up afterwards.

    Returns a callable ``make(role=None, **body)`` whose result carries
    ``id``, ``email``, ``password``, ``token`` and ``refresh``.
    """
    created: list[str] = []

    def _make(role: str | None = None, **body) -> dict:
        email = random_email()
        payload = {
            "email": email,
            "password": PASSWORD,
            "full_name": body.pop("full_name", "Pytest User"),
            "phone": body.pop("phone", f"+1555{uuid.uuid4().hex[:6]}"),
        }
        payload.update(body)
        response = client.post("/api/v1/auth/register", json=payload)
        assert response.status_code == 200, response.text
        data = response.json()["data"]
        user_id = data["user"]["id"]
        if role:
            _assign_role_sync(user_id, role)
        created.append(user_id)
        return {
            "id": user_id,
            "email": payload["email"],
            "password": PASSWORD,
            "token": data["token"]["access_token"],
            "refresh": data["token"]["refresh_token"],
        }

    yield _make

    _delete_users_sync(created)


@pytest.fixture
async def db():
    """Async DB session plus a dependency-ordered registry of created rows.

    Every object created via ``track`` is deleted in FK-safe order at
    teardown, so failed tests never leave test data behind.
    """
    from app.models.crm import Booking, Lead
    from app.models.property import Favorite, Project, Property

    tracked: list[object] = []

    def _track(obj) -> object:
        tracked.append(obj)
        return obj

    # Deletion order matters: children before parents.
    _models_by_table = {
        "bookings": Booking,
        "favorites": Favorite,
        "leads": Lead,
        "properties": Property,
        "projects": Project,
        "users": User,
    }
    _order = ["bookings", "favorites", "leads", "properties", "projects", "users"]

    async def _cleanup() -> None:
        async with AsyncSessionLocal() as session:
            for table in _order:
                model = _models_by_table[table]
                ids = [
                    getattr(obj, "id", None)
                    for obj in tracked
                    if getattr(obj, "__tablename__", None) == table and getattr(obj, "id", None)
                ]
                if ids:
                    await session.execute(
                        delete(model).where(model.id.in_(ids))
                    )
            await session.commit()

    try:
        yield {"track": _track, "cleanup": _cleanup}
    finally:
        await _cleanup()
