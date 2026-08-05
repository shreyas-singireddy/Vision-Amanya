"""User account endpoints (self-service and admin)."""

from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import ActiveUser, CurrentUser, Pagination, require_permission
from app.core.database import get_db
from app.core.response import success_response
from app.permissions import USER_READ, USER_UPDATE
from app.schemas.user import (
    ChangePasswordRequest,
    UserAdminUpdate,
    UserResponse,
    UserRoleAssignment,
    UserUpdate,
)
from app.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me")
async def get_me(user: CurrentUser) -> dict:
    """Return the caller's profile."""
    return success_response(UserResponse.model_validate(user).model_dump())


@router.patch("/me")
async def update_me(
    payload: UserUpdate,
    user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Update the caller's profile."""
    service = UserService(db)
    updated = await service.update_profile(user, payload)
    return success_response(UserResponse.model_validate(updated).model_dump())


@router.patch("/me/password")
async def change_password(
    payload: ChangePasswordRequest,
    user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Change the caller's password."""
    service = UserService(db)
    await service.change_password(user, payload)
    return success_response(message="Password changed.")


@router.get("/me/agent")
async def get_my_agent(
    user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Return the caller's agent profile, if present."""
    service = UserService(db)
    agent = await service.get_agent(user.id)
    return success_response({"agent": agent})


# --- Admin endpoints ---------------------------------------------------------


@router.get("", dependencies=[Depends(require_permission(USER_READ))])
async def list_users(
    db: Annotated[AsyncSession, Depends(get_db)],
    pagination: Pagination,
    active_only: Annotated[bool, Query()] = False,
    role_code: Annotated[str | None, Query(max_length=50)] = None,
) -> dict:
    """List users (admin)."""
    service = UserService(db)
    page, page_size = pagination
    users, total = await service.list_users(
        page=page, page_size=page_size, active_only=active_only, role_code=role_code
    )
    return success_response(
        {
            "items": [UserResponse.model_validate(u).model_dump() for u in users],
            "meta": {"total": total, "page": page, "page_size": page_size},
        }
    )


@router.patch("/{user_id}", dependencies=[Depends(require_permission(USER_UPDATE))])
async def admin_update_user(
    user_id: uuid.UUID,
    payload: UserAdminUpdate,
    actor: ActiveUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Update another user's flags/roles (admin)."""
    service = UserService(db)
    updated = await service.admin_update_user(user_id, payload, actor)
    return success_response(
        UserResponse.model_validate(updated).model_dump(), message="User updated."
    )


@router.post("/{user_id}/roles", dependencies=[Depends(require_permission(USER_UPDATE))])
async def assign_role(
    user_id: uuid.UUID,
    payload: UserRoleAssignment,
    actor: ActiveUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Grant a role to a user (admin)."""
    service = UserService(db)
    updated = await service.assign_role(user_id, payload, actor)
    return success_response(
        UserResponse.model_validate(updated).model_dump(), message="Role assigned."
    )
