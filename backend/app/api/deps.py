"""FastAPI dependencies: authentication, authorization and shared resources."""

from __future__ import annotations

import uuid
from typing import Annotated

import redis.asyncio as aioredis
from fastapi import Depends, Query, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.exceptions import AuthenticationException, PermissionDeniedException
from app.core.security import decode_access_token
from app.models.user import Agent, User
from app.repositories.user import UserRepository
from app.utils.pagination import DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE

_bearer = HTTPBearer(auto_error=False)


async def get_redis(request: Request) -> aioredis.Redis:
    """Return the shared Redis client from application state."""
    redis_client = getattr(request.app.state, "redis", None)
    if redis_client is None:
        raise AuthenticationException("Redis is not configured.", error_code="redis_unavailable")
    return redis_client


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> User:
    """Resolve the authenticated user from a bearer access token."""
    if credentials is None or credentials.credentials is None:
        raise AuthenticationException("Not authenticated.", error_code="authentication_required")
    try:
        claims = decode_access_token(credentials.credentials)
    except JWTError as exc:
        raise AuthenticationException("Invalid or expired access token.", error_code="invalid_access_token") from exc
    if claims.get("type") != "access":
        raise AuthenticationException("Not an access token.", error_code="invalid_token_type")
    try:
        user_id = uuid.UUID(claims["sub"])
    except (KeyError, ValueError) as exc:
        raise AuthenticationException("Invalid token subject.", error_code="invalid_token_subject") from exc

    user = await UserRepository(db).get_with_roles_and_permissions(user_id)
    if user is None:
        raise AuthenticationException("Account no longer exists.", error_code="user_not_found")
    if not user.is_active:
        raise AuthenticationException("This account has been deactivated.", error_code="account_inactive")
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]


async def require_active_user(user: CurrentUser) -> User:
    """Ensure the user is active (belt-and-braces with ``get_current_user``)."""
    if not user.is_active:
        raise PermissionDeniedException("Account is deactivated.", error_code="account_inactive")
    return user


ActiveUser = Annotated[User, Depends(require_active_user)]


def _permissions_of(user: User) -> set[str]:
    codes: set[str] = set()
    for role in user.roles:
        for permission in getattr(role, "permissions", []) or []:
            codes.add(permission.code)
    return codes


def require_permission(*required_codes: str):
    """Build a dependency that only passes users holding every permission."""

    async def _checker(user: ActiveUser) -> User:
        codes = _permissions_of(user)
        if not required_codes or not set(required_codes).issubset(codes):
            raise PermissionDeniedException(
                "You do not have permission to perform this action.",
                error_code="permission_denied",
                details={"required": list(required_codes)},
            )
        return user

    return _checker


def require_any_permission(*required_codes: str):
    """Build a dependency that passes users holding at least one permission."""

    async def _checker(user: ActiveUser) -> User:
        codes = _permissions_of(user)
        if not required_codes or not (codes & set(required_codes)):
            raise PermissionDeniedException(
                "You do not have permission to perform this action.",
                error_code="permission_denied",
                details={"required_any": list(required_codes)},
            )
        return user

    return _checker


async def get_current_agent(
    user: ActiveUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Agent:
    """Resolve the caller's agent profile, or reject when absent."""
    agent = await UserRepository(db).get_agent(user.id)
    if agent is None:
        raise PermissionDeniedException("An agent profile is required.", error_code="agent_profile_required")
    return agent


CurrentAgent = Annotated[Agent, Depends(get_current_agent)]


async def get_pagination(
    page: Annotated[int, Query(ge=1)] = DEFAULT_PAGE,
    page_size: Annotated[int, Query(ge=1, le=MAX_PAGE_SIZE)] = DEFAULT_PAGE_SIZE,
) -> tuple[int, int]:
    """Clamp and return safe pagination values."""
    return max(page, 1), min(max(page_size, 1), MAX_PAGE_SIZE)


Pagination = Annotated[tuple[int, int], Depends(get_pagination)]
