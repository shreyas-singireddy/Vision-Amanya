"""RBAC repository: roles, permissions and user-role assignment."""

from __future__ import annotations

import uuid

from sqlalchemy import delete, select

from app.models.rbac import Permission, Role, UserRole
from app.repositories.base import BaseRepository


class RbacRepository(BaseRepository[Role]):
    """Data access for roles/permissions and the user↔role joins."""

    model = Role

    async def get_by_code(self, code: str) -> Role | None:
        """Fetch a role by its code."""
        return await self.session.scalar(select(Role).where(Role.code == code))

    async def get_permission(self, code: str) -> Permission | None:
        """Fetch a permission by its code."""
        return await self.session.scalar(select(Permission).where(Permission.code == code))

    async def list_role_codes(self) -> list[str]:
        """All role codes in the system."""
        rows = (await self.session.execute(select(Role.code))).scalars().all()
        return list(rows)

    async def list_user_role_codes(self, user_id: uuid.UUID) -> list[str]:
        """Role codes currently assigned to a user."""
        stmt = select(Role.code).join(UserRole, UserRole.role_id == Role.id).where(UserRole.user_id == user_id)
        return list((await self.session.execute(stmt)).scalars().all())

    async def assign_role(self, user_id: uuid.UUID, role: Role, granted_by: uuid.UUID | None = None) -> None:
        """Grant a role to a user (idempotent)."""
        stmt = select(UserRole).where(UserRole.user_id == user_id, UserRole.role_id == role.id)
        existing = await self.session.scalar(stmt)
        if existing is None:
            self.session.add(
                UserRole(user_id=user_id, role_id=role.id, granted_by=granted_by)
            )
            await self.session.flush()

    async def replace_roles(self, user_id: uuid.UUID, roles: list[Role], granted_by: uuid.UUID | None = None) -> None:
        """Replace a user's roles with the provided set."""
        await self.session.execute(delete(UserRole).where(UserRole.user_id == user_id))
        for role in roles:
            self.session.add(UserRole(user_id=user_id, role_id=role.id, granted_by=granted_by))
        await self.session.flush()
