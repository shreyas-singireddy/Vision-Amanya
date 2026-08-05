"""Auth service: registration, login, token rotation, recovery.

The token lifecycle:
* **Access token** — short-lived stateless JWT validated by ``deps``.
* **Refresh token** — opaque random string stored (hashed) in ``auth_tokens``
  and **rotated on every refresh** so replaying an old token fails.
* **Email-verification / password-reset tokens** — opaque one-time tokens
  stored the same way and consumed on use.
"""

from __future__ import annotations

import asyncio
import logging
import uuid
from datetime import UTC, datetime, timedelta

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.exceptions import (
    AuthenticationException,
    BusinessException,
    ConflictException,
    NotFoundException,
)
from app.core.security import (
    create_access_token,
    create_opaque_token,
    hash_password,
    hash_token,
    verify_password,
)
from app.models.auth import AuthToken
from app.models.enums import TokenType
from app.models.user import User
from app.repositories.auth_token import AuthTokenRepository
from app.repositories.rbac import RbacRepository
from app.repositories.user import UserRepository
from app.schemas.auth import (
    LoginRequest,
    RegisterRequest,
    ResetPasswordRequest,
    VerifyEmailRequest,
)
from app.services.base import BaseService
from app.utils.audit import write_audit_log
from app.utils.email import EmailService

logger = logging.getLogger("app.services.auth")
settings = get_settings()


class AuthService(BaseService):
    """Owns registration, authentication and token lifecycle."""

    def __init__(self, db: AsyncSession, *, email_service: EmailService | None = None) -> None:
        super().__init__(db)
        self.users = self._repo("users", UserRepository)
        self.tokens = self._repo("tokens", AuthTokenRepository)
        self.rbac = self._repo("rbac", RbacRepository)
        self.email_service = email_service or EmailService()

    # --- Registration -------------------------------------------------------

    async def register(self, payload: RegisterRequest, *, ip_address: str | None = None, user_agent: str | None = None) -> User:
        """Create a user with the default ``customer`` role."""
        email = payload.email.strip().lower()
        if await self.users.exists(email):
            raise ConflictException("An account with this email already exists.", error_code="email_already_registered")
        if payload.phone and await self.users.get_by_phone(payload.phone):
            raise ConflictException("An account with this phone number already exists.", error_code="phone_already_registered")

        user = User(
            email=email,
            phone=payload.phone,
            password_hash=await asyncio.to_thread(hash_password, payload.password),
            full_name=payload.full_name.strip(),
        )
        await self.users.add(user)

        role = await self.rbac.get_by_code("customer")
        if role is not None:
            await self.rbac.assign_role(user.id, role, granted_by=None)

        await write_audit_log(
            self.db,
            action="user.register",
            resource_type="user",
            resource_id=user.id,
            actor_user_id=user.id,
            new_value={"email": email},
            ip_address=ip_address,
            user_agent=user_agent,
        )
        await self.commit()
        logger.info("New user registered: %s", email)
        return await self.users.get_with_roles_and_permissions(user.id) or user

    async def register_with_tokens(
        self, payload: RegisterRequest, *, ip_address: str | None = None, user_agent: str | None = None
    ) -> tuple[User, str, str, int]:
        """Register a user and issue an access/refresh token pair immediately."""
        user = await self.register(payload, ip_address=ip_address, user_agent=user_agent)
        access_token = create_access_token(user.id)
        refresh_token, expires_in = await self._issue_refresh_token(user, ip_address, user_agent)
        await self.commit()
        return user, access_token, refresh_token, expires_in

    # --- Login ---------------------------------------------------------------

    async def login(self, payload: LoginRequest, *, ip_address: str | None = None, user_agent: str | None = None) -> tuple[User, str, str, int]:
        """Verify credentials and issue an access/refresh token pair."""
        user = await self.users.get_by_email(payload.email)
        if user is None or not user.password_hash or not await asyncio.to_thread(verify_password, payload.password, user.password_hash):
            raise AuthenticationException("Invalid email or password.", error_code="invalid_credentials")
        if not user.is_active:
            raise AuthenticationException("This account has been deactivated.", error_code="account_inactive")

        user.last_login_at = datetime.now(UTC)
        user.last_login_ip = ip_address

        access_token = create_access_token(user.id)
        refresh_token, expires_in = await self._issue_refresh_token(user, ip_address, user_agent)

        await self.commit()
        logger.info("User logged in: %s", user.email)
        return await self.users.get_with_roles_and_permissions(user.id) or user, access_token, refresh_token, expires_in

    # --- Token lifecycle -----------------------------------------------------

    async def refresh(self, refresh_token: str, *, ip_address: str | None = None, user_agent: str | None = None) -> tuple[User, str, str, int]:
        """Rotate a refresh token: revoke it and issue a fresh pair."""
        hashed = hash_token(refresh_token)
        stored = await self.tokens.get_by_hash(hashed)
        if stored is None or stored.revoked_at is not None or stored.used_at is not None:
            raise AuthenticationException("Invalid or expired refresh token.", error_code="invalid_refresh_token")
        stored_expiry = stored.expires_at.replace(tzinfo=UTC) if stored.expires_at.tzinfo is None else stored.expires_at
        if stored_expiry < datetime.now(UTC):
            raise AuthenticationException("Refresh token has expired.", error_code="refresh_token_expired")

        user = await self.users.get_with_roles_and_permissions(stored.user_id)
        if user is None or not user.is_active:
            raise AuthenticationException("Account is no longer active.", error_code="account_inactive")

        stored.revoked_at = datetime.now(UTC)
        stored.used_at = datetime.now(UTC)

        access_token = create_access_token(user.id)
        new_refresh, expires_in = await self._issue_refresh_token(user, ip_address, user_agent)
        await self.commit()
        return user, access_token, new_refresh, expires_in

    async def logout(self, user_id: uuid.UUID, refresh_token: str | None = None) -> int:
        """Revoke one refresh token, or all sessions when ``refresh_token`` is None."""
        if refresh_token:
            hashed = hash_token(refresh_token)
            stored = await self.tokens.get_by_hash(hashed)
            if stored is not None and stored.user_id == user_id:
                stored.revoked_at = datetime.now(UTC)
                await self.commit()
                return 1
            return 0
        count = await self.tokens.revoke_all_for_user(user_id)
        await self.commit()
        return count

    # --- Email verification ----------------------------------------------------

    async def issue_verification_token(self, user_id: uuid.UUID, *, ip_address: str | None = None, user_agent: str | None = None) -> tuple[str, str]:
        """Create an email-verification token and return ``(token, email)``."""
        user = await self.users.get(user_id)
        if user is None:
            raise NotFoundException("User not found", error_code="user_not_found")
        if user.is_email_verified:
            raise BusinessException("Email is already verified.", error_code="email_already_verified")
        token = await self._issue_onetime_token(user, TokenType.VERIFY_EMAIL, ip_address, user_agent)
        return token, user.email

    async def verify_email(self, payload: VerifyEmailRequest, *, ip_address: str | None = None, user_agent: str | None = None) -> User:
        """Consume a verification token and mark the email verified."""
        hashed = hash_token(payload.token)
        stored = await self.tokens.get_by_hash(hashed)
        if stored is None or stored.token_type != TokenType.VERIFY_EMAIL or stored.revoked_at is not None or stored.used_at is not None:
            raise AuthenticationException("Invalid or expired verification token.", error_code="invalid_verification_token")
        stored_expiry = stored.expires_at.replace(tzinfo=UTC) if stored.expires_at.tzinfo is None else stored.expires_at
        if stored_expiry < datetime.now(UTC):
            raise AuthenticationException("Verification token has expired.", error_code="verification_token_expired")

        user = await self.users.get(stored.user_id)
        if user is None:
            raise NotFoundException("User not found", error_code="user_not_found")
        user.is_email_verified = True
        user.email_verified_at = datetime.now(UTC)
        stored.used_at = datetime.now(UTC)
        stored.revoked_at = datetime.now(UTC)

        await write_audit_log(
            self.db,
            action="user.email_verified",
            resource_type="user",
            resource_id=user.id,
            actor_user_id=user.id,
            new_value={"is_email_verified": True},
            ip_address=ip_address,
            user_agent=user_agent,
        )
        await self.commit()
        return await self.users.get_with_roles_and_permissions(user.id) or user

    # --- Password reset ---------------------------------------------------------

    async def issue_password_reset(self, email: str, *, ip_address: str | None = None, user_agent: str | None = None) -> tuple[str, str | None]:
        """Create a reset token for the user (always succeeds to avoid probing)."""
        user = await self.users.get_by_email(email)
        if user is None or not user.is_active:
            return "reset", None
        token = await self._issue_onetime_token(user, TokenType.RESET_PASSWORD, ip_address, user_agent)
        return "reset", token

    async def reset_password(self, payload: ResetPasswordRequest, *, ip_address: str | None = None, user_agent: str | None = None) -> User:
        """Consume a reset token and set a new password."""
        hashed = hash_token(payload.token)
        stored = await self.tokens.get_by_hash(hashed)
        if stored is None or stored.token_type != TokenType.RESET_PASSWORD or stored.revoked_at is not None or stored.used_at is not None:
            raise AuthenticationException("Invalid or expired reset token.", error_code="invalid_reset_token")
        stored_expiry = stored.expires_at.replace(tzinfo=UTC) if stored.expires_at.tzinfo is None else stored.expires_at
        if stored_expiry < datetime.now(UTC):
            raise AuthenticationException("Reset token has expired.", error_code="reset_token_expired")

        user = await self.users.get(stored.user_id)
        if user is None or not user.is_active:
            raise NotFoundException("User not found", error_code="user_not_found")
        user.password_hash = await asyncio.to_thread(hash_password, payload.new_password)
        stored.used_at = datetime.now(UTC)
        stored.revoked_at = datetime.now(UTC)
        await self.tokens.revoke_all_for_user(user.id, exclude_token_id=stored.id)

        await write_audit_log(
            self.db,
            action="user.password_reset",
            resource_type="user",
            resource_id=user.id,
            actor_user_id=user.id,
            ip_address=ip_address,
            user_agent=user_agent,
        )
        await self.commit()
        return await self.users.get_with_roles_and_permissions(user.id) or user

    # --- Helpers ----------------------------------------------------------------

    async def _issue_refresh_token(self, user: User, ip_address: str | None, user_agent: str | None) -> tuple[str, int]:
        """Store a hashed refresh token; returns (token, expires_in_seconds)."""
        token = create_opaque_token()
        token_type = TokenType.REFRESH
        ttl_minutes = settings.REFRESH_TOKEN_EXPIRE_MINUTES
        entry = AuthToken(
            user_id=user.id,
            token_type=token_type,
            token_hash=hash_token(token),
            expires_at=datetime.now(UTC) + timedelta(minutes=ttl_minutes),
            ip_address=ip_address,
            user_agent=user_agent,
        )
        await self.tokens.add(entry)
        return token, ttl_minutes * 60

    async def _issue_onetime_token(self, user: User, token_type: TokenType, ip_address: str | None, user_agent: str | None) -> str:
        """Store a hashed one-time token; returns the raw token."""
        token = create_opaque_token()
        ttl_minutes = settings.EMAIL_VERIFICATION_TOKEN_EXPIRE_MINUTES if token_type == TokenType.VERIFY_EMAIL else settings.PASSWORD_RESET_TOKEN_EXPIRE_MINUTES
        entry = AuthToken(
            user_id=user.id,
            token_type=token_type,
            token_hash=hash_token(token),
            expires_at=datetime.now(UTC) + timedelta(minutes=ttl_minutes),
            ip_address=ip_address,
            user_agent=user_agent,
        )
        await self.tokens.add(entry)
        await self.commit()
        return token
