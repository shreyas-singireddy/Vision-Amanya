"""Authentication and account-recovery endpoints."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import CurrentUser
from app.core.database import get_db
from app.core.response import success_response
from app.schemas.auth import (
    AuthResponse,
    ForgotPasswordRequest,
    LoginRequest,
    LogoutRequest,
    RefreshRequest,
    RegisterRequest,
    ResetPasswordRequest,
    TokenPair,
    VerifyEmailRequest,
)
from app.schemas.user import UserResponse
from app.services.auth_service import AuthService
from app.utils.validators import sanitize_ip

router = APIRouter(prefix="/auth", tags=["auth"])


async def _client_context(request: Request) -> tuple[str | None, str | None]:
    host = request.client.host if request.client else None
    return sanitize_ip(host), request.headers.get("user-agent")


@router.post("/register")
async def register(
    payload: RegisterRequest,
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Create an account and return a token pair."""
    service = AuthService(db)
    ip, ua = await _client_context(request)
    user, access_token, refresh_token, expires_in = await service.register_with_tokens(
        payload, ip_address=ip, user_agent=ua
    )
    return success_response(
        AuthResponse(
            token=TokenPair(
                access_token=access_token,
                refresh_token=refresh_token,
                expires_in=expires_in,
            ),
            user=UserResponse.model_validate(user),
        ).model_dump(mode="json"),
        message="Account created.",
    )


@router.post("/login")
async def login(
    payload: LoginRequest,
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Exchange credentials for a token pair."""
    service = AuthService(db)
    ip, ua = await _client_context(request)
    user, access_token, refresh_token, expires_in = await service.login(
        payload, ip_address=ip, user_agent=ua
    )
    return success_response(
        AuthResponse(
            token=TokenPair(
                access_token=access_token,
                refresh_token=refresh_token,
                expires_in=expires_in,
            ),
            user=UserResponse.model_validate(user),
        ).model_dump(mode="json"),
        message="Logged in.",
    )


@router.post("/refresh")
async def refresh(
    payload: RefreshRequest,
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Rotate a refresh token into a fresh token pair."""
    service = AuthService(db)
    ip, ua = await _client_context(request)
    user, access_token, refresh_token, expires_in = await service.refresh(
        payload.refresh_token, ip_address=ip, user_agent=ua
    )
    return success_response(
        AuthResponse(
            token=TokenPair(
                access_token=access_token,
                refresh_token=refresh_token,
                expires_in=expires_in,
            ),
            user=UserResponse.model_validate(user),
        ).model_dump(mode="json"),
        message="Token refreshed.",
    )


@router.post("/logout")
async def logout(
    payload: LogoutRequest,
    user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Revoke the current (or all) refresh token(s)."""
    service = AuthService(db)
    revoked = await service.logout(user.id, payload.refresh_token)
    return success_response({"revoked": revoked}, message="Logged out.")


@router.post("/verify-email")
async def verify_email(
    payload: VerifyEmailRequest,
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Consume a verification token to confirm the email address."""
    service = AuthService(db)
    ip, ua = await _client_context(request)
    user = await service.verify_email(payload, ip_address=ip, user_agent=ua)
    return success_response(
        UserResponse.model_validate(user).model_dump(),
        message="Email verified.",
    )


@router.post("/forgot-password")
async def forgot_password(
    payload: ForgotPasswordRequest,
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Request a password-reset token (sent via email)."""
    service = AuthService(db)
    ip, ua = await _client_context(request)
    status, _token = await service.issue_password_reset(payload.email, ip_address=ip, user_agent=ua)
    return success_response({"status": status}, message="If the account exists, a reset link was sent.")


@router.post("/reset-password")
async def reset_password(
    payload: ResetPasswordRequest,
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Consume a reset token and set a new password."""
    service = AuthService(db)
    ip, ua = await _client_context(request)
    user = await service.reset_password(payload, ip_address=ip, user_agent=ua)
    return success_response({"email": user.email}, message="Password updated.")
