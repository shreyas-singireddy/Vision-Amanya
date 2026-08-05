"""Auth-token repository (refresh / verification / reset tokens)."""

from __future__ import annotations

import uuid

from sqlalchemy import select

from app.models.auth import AuthToken
from app.models.enums import TokenType
from app.repositories.base import BaseRepository
from app.utils.dates import utcnow


class AuthTokenRepository(BaseRepository[AuthToken]):
    """Data access for ``auth_tokens`` (hashed opaque tokens)."""

    model = AuthToken

    async def get_by_hash(self, token_hash: str) -> AuthToken | None:
        """Fetch a token record by its SHA-256 hash."""
        stmt = select(AuthToken).where(AuthToken.token_hash == token_hash)
        return await self.session.scalar(stmt)

    async def list_active_for_user(
        self, user_id: uuid.UUID, token_type: TokenType | None = None
    ) -> list[AuthToken]:
        """List unrevoked, unexpired tokens for a user."""
        stmt = select(AuthToken).where(
            AuthToken.user_id == user_id,
            AuthToken.revoked_at.is_(None),
            AuthToken.expires_at > utcnow(),
        )
        if token_type is not None:
            stmt = stmt.where(AuthToken.token_type == token_type)
        return list((await self.session.execute(stmt)).scalars().all())

    async def revoke_all_for_user(self, user_id: uuid.UUID, *, exclude_token_id: uuid.UUID | None = None) -> int:
        """Revoke every unexpired token for a user (logout-all).

        Args:
            exclude_token_id: optionally keep one token active (the current one).

        Returns:
            Number of tokens revoked.
        """
        tokens = await self.list_active_for_user(user_id)
        revoked = 0
        for token in tokens:
            if exclude_token_id and token.id == exclude_token_id:
                continue
            token.revoked_at = utcnow()
            revoked += 1
        if tokens:
            await self.session.flush()
        return revoked
