"""User service: profile management, password change and admin user ops."""

from __future__ import annotations

import asyncio
import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import (
    AuthenticationException,
    BusinessException,
    NotFoundException,
)
from app.core.security import hash_password, verify_password
from app.models.rbac import Role
from app.models.user import Agent, User
from app.repositories.rbac import RbacRepository
from app.repositories.user import UserRepository
from app.schemas.user import (
    ChangePasswordRequest,
    UserAdminUpdate,
    UserRoleAssignment,
    UserUpdate,
)
from app.services.base import BaseService
from app.utils.audit import write_audit_log
from app.utils.dates import utcnow


class UserService(BaseService):
    """Owns user-profile and account-management rules."""

    def __init__(self, db: AsyncSession) -> None:
        super().__init__(db)
        self.users = self._repo("users", UserRepository)
        self.rbac = self._repo("rbac", RbacRepository)

    # --- Self-service ---------------------------------------------------------

    async def get_profile(self, user_id: uuid.UUID) -> User:
        """Return a user with roles/permissions eagerly loaded."""
        user = await self.users.get_with_roles_and_permissions(user_id)
        if user is None:
            raise NotFoundException("User not found", error_code="user_not_found")
        return user

    async def update_profile(self, user: User, payload: UserUpdate) -> User:
        """Update a user's own profile fields (email/phone changes excluded)."""
        changes: dict = {}
        if payload.full_name is not None and payload.full_name.strip() != user.full_name:
            user.full_name = payload.full_name.strip()
            changes["full_name"] = user.full_name
        if payload.phone is not None:
            existing = await self.users.get_by_phone(payload.phone)
            if existing is not None and existing.id != user.id:
                raise BusinessException("This phone number is already in use.", error_code="phone_already_registered")
            if payload.phone != user.phone:
                user.phone = payload.phone
                changes["phone"] = user.phone
        if payload.preferred_locale is not None:
            user.preferred_locale = payload.preferred_locale
            changes["preferred_locale"] = user.preferred_locale
        if payload.timezone is not None:
            user.timezone = payload.timezone
            changes["timezone"] = user.timezone

        if changes:
            await write_audit_log(
                self.db,
                action="user.profile_updated",
                resource_type="user",
                resource_id=user.id,
                actor_user_id=user.id,
                new_value=changes,
            )
            await self.commit()
        return await self.users.get_with_roles_and_permissions(user.id) or user

    async def change_password(self, user: User, payload: ChangePasswordRequest) -> None:
        """Verify the current password and set a new one."""
        if not user.password_hash or not await asyncio.to_thread(verify_password, payload.current_password, user.password_hash):
            raise AuthenticationException("Current password is incorrect.", error_code="incorrect_password")
        user.password_hash = await asyncio.to_thread(hash_password, payload.new_password)
        await write_audit_log(
            self.db,
            action="user.password_changed",
            resource_type="user",
            resource_id=user.id,
            actor_user_id=user.id,
        )
        await self.commit()

    # --- Admin -----------------------------------------------------------------

    async def list_users(self, *, page: int = 1, page_size: int = 20, active_only: bool = False, role_code: str | None = None) -> tuple[list[User], int]:
        """Paginate all users (admin)."""
        offset = (page - 1) * page_size
        return await self.users.list_users(offset=offset, limit=page_size, active_only=active_only, role_code=role_code)

    async def admin_update_user(self, target_id: uuid.UUID, payload: UserAdminUpdate, actor: User) -> User:
        """Update another user's flags/roles (admin)."""
        target = await self.users.get_with_roles(target_id)
        if target is None:
            raise NotFoundException("User not found", error_code="user_not_found")
        changes: dict = {}
        if payload.is_active is not None and payload.is_active != target.is_active:
            target.is_active = payload.is_active
            changes["is_active"] = target.is_active
        if payload.is_email_verified is not None and payload.is_email_verified != target.is_email_verified:
            target.is_email_verified = payload.is_email_verified
            if target.is_email_verified:
                target.email_verified_at = utcnow()
            changes["is_email_verified"] = target.is_email_verified
        if payload.roles is not None:
            roles = await self._resolve_roles(payload.roles)
            await self.rbac.replace_roles(target.id, roles, granted_by=actor.id)
            changes["roles"] = payload.roles
        if changes:
            await write_audit_log(
                self.db,
                action="admin.user_updated",
                resource_type="user",
                resource_id=target.id,
                actor_user_id=actor.id,
                new_value=changes,
            )
            await self.commit()
        return await self.users.get_with_roles_and_permissions(target.id) or target

    async def assign_role(self, target_id: uuid.UUID, payload: UserRoleAssignment, actor: User) -> User:
        """Grant a single role to a user (idempotent)."""
        target = await self.users.get_with_roles(target_id)
        if target is None:
            raise NotFoundException("User not found", error_code="user_not_found")
        role = await self.rbac.get_by_code(payload.role_code)
        if role is None:
            raise NotFoundException(f"Unknown role: {payload.role_code}", error_code="role_not_found")
        await self.rbac.assign_role(target.id, role, granted_by=actor.id)
        await write_audit_log(
            self.db,
            action="admin.role_assigned",
            resource_type="user",
            resource_id=target.id,
            actor_user_id=actor.id,
            new_value={"role": role.code},
        )
        await self.commit()
        return await self.users.get_with_roles_and_permissions(target.id) or target

    async def get_agent(self, user_id: uuid.UUID) -> Agent | None:
        """Return the agent profile for a user, if one exists."""
        return await self.users.get_agent(user_id)

    # --- Helpers -----------------------------------------------------------------

    async def _resolve_roles(self, codes: list[str]) -> list[Role]:
        roles: list[Role] = []
        for code in codes:
            role = await self.rbac.get_by_code(code)
            if role is None:
                raise NotFoundException(f"Unknown role: {code}", error_code="role_not_found")
            roles.append(role)
        return roles
