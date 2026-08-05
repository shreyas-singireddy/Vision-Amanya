"""Database engines, session factories and dependency helpers.

Two engines are provided:

* ``engine`` / ``AsyncSessionLocal`` — async (asyncpg) engine used by the API.
* ``sync_engine`` / ``SyncSessionLocal`` — sync (psycopg2) engine used by
  Alembic migrations and management/seed scripts.

Business code must never import ``engine`` directly; it should depend on
:func:`get_db` (async) or :func:`get_sync_db` (sync) so sessions are scoped
and closed deterministically.
"""

from __future__ import annotations

from collections.abc import AsyncIterator, Iterator
from typing import Any

from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import NullPool

from app.core.config import get_settings

settings = get_settings()

_pool_kwargs: dict[str, Any]
if settings.ENVIRONMENT.lower() == "test":
    # One connection per checkout, closed immediately afterwards. This keeps
    # asyncpg connections from leaking across pytest event loops (each test
    # may run on its own loop, and pooled connections are loop-bound).
    _pool_kwargs = {"poolclass": NullPool}
else:
    _pool_kwargs = {"pool_size": 10, "max_overflow": 20}

engine = create_async_engine(
    settings.ASYNC_DATABASE_URL,
    pool_pre_ping=True,
    echo=False,
    **_pool_kwargs,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    autoflush=False,
    expire_on_commit=False,
)

sync_engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
    echo=False,
)

SyncSessionLocal = sessionmaker(
    bind=sync_engine,
    autoflush=False,
    expire_on_commit=False,
)


async def get_db() -> AsyncIterator[AsyncSession]:
    """FastAPI dependency that yields an async database session.

    The session is always closed, even when the endpoint raises.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise


def get_sync_db() -> Iterator[Session]:
    """Yield a sync session for scripts and non-request contexts."""
    with SyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            session.rollback()
            raise


async def dispose_engines() -> None:
    """Dispose all engine pools (used during application shutdown)."""
    await engine.dispose()
    sync_engine.dispose()
