"""User repository."""

from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.models.rbac import Role
from app.models.user import Agent, User
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    """Data access for the ``users`` table (and its agent profile)."""

    model = User

    async def get_by_email(self, email: str) -> User | None:
        """Fetch a user by normalized (lowercased) email."""
        stmt = select(User).where(User.email == email.strip().lower())
        return await self.session.scalar(stmt)

    async def get_by_phone(self, phone: str) -> User | None:
        """Fetch a user by phone number."""
        stmt = select(User).where(User.phone == phone)
        return await self.session.scalar(stmt)

    async def get_with_roles(self, user_id: uuid.UUID) -> User | None:
        """Fetch a user with their roles eagerly loaded."""
        stmt = (
            select(User)
            .options(selectinload(User.roles))
            .where(User.id == user_id)
        )
        return await self.session.scalar(stmt)

    async def get_with_roles_and_permissions(self, user_id: uuid.UUID) -> User | None:
        """Fetch a user with roles and role permissions eagerly loaded."""
        stmt = (
            select(User)
            .options(
                selectinload(User.roles).selectinload(Role.permissions),
                selectinload(User.agent),
            )
            .where(User.id == user_id)
        )
        return await self.session.scalar(stmt)

    async def list_users(
        self,
        *,
        offset: int,
        limit: int,
        active_only: bool = False,
        role_code: str | None = None,
    ) -> tuple[list[User], int]:
        """List users with optional role/activity filters (admin)."""
        from sqlalchemy import func

        base = select(User.id)
        if active_only:
            base = base.where(User.is_active.is_(True))
        if role_code:
            base = base.where(User.roles.any(Role.code == role_code))
        total = await self.session.scalar(select(func.count()).select_from(base.subquery())) or 0

        stmt = select(User).options(
            selectinload(User.roles),
            selectinload(User.agent),
        ).order_by(User.created_at.desc())
        if active_only:
            stmt = stmt.where(User.is_active.is_(True))
        if role_code:
            stmt = stmt.where(User.roles.any(Role.code == role_code))
        result = await self.session.execute(stmt.offset(offset).limit(limit))
        return list(result.scalars().unique().all()), total

    async def exists(self, email: str) -> bool:
        """Return True when a user with this email exists (soft-deleted included)."""
        stmt = select(User.id).where(User.email == email.strip().lower())
        return await self.session.scalar(stmt) is not None

    async def count_active(self) -> int:
        """Count users with ``is_active`` true."""
        stmt = select(User).where(User.is_active.is_(True))
        return await self.count(stmt)

    async def get_agent(self, user_id: uuid.UUID) -> Agent | None:
        """Fetch the agent profile for a user, if any."""
        stmt = select(Agent).where(Agent.user_id == user_id)
        return await self.session.scalar(stmt)

    async def list_agents(self) -> list[Agent]:
        """List all agent profiles (for lead-assignment dropdowns)."""
        stmt = select(Agent).where(Agent.status == "active").order_by(Agent.created_at.desc())
        return list((await self.session.execute(stmt)).scalars().all())
