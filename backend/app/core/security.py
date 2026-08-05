"""Security primitives: password hashing, JWT issuance and token utilities.

Design notes:

* **Passwords** are hashed with bcrypt (via passlib). The dependency pin
  ``bcrypt>=4.0.1,<4.1`` in ``requirements.txt`` is mandatory — passlib 1.7.4
  is incompatible with bcrypt >= 4.1.
* **Access tokens** are short-lived, stateless JWTs containing only the user
  subject and a type claim. They can be validated without a database hit.
* **Refresh / email-verification / password-reset tokens** are opaque random
  strings. Only their SHA-256 hashes are persisted in ``auth_tokens``, so a
  database leak cannot be replayed. Refresh tokens are rotated on use.
"""

from __future__ import annotations

import hashlib
import secrets
import uuid
from datetime import UTC, datetime, timedelta
from typing import Any

from jose import jwt
from passlib.context import CryptContext

from app.core.config import get_settings

_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
settings = get_settings()


def hash_password(password: str) -> str:
    """Hash a plaintext password with bcrypt (12 rounds)."""
    return _pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plaintext password against a bcrypt hash."""
    try:
        return _pwd_context.verify(plain_password, hashed_password)
    except ValueError:
        return False


def _create_token(subject: str, token_type: str, expires_delta: timedelta) -> str:
    now = datetime.now(UTC)
    claims: dict[str, Any] = {
        "sub": subject,
        "type": token_type,
        "iat": now,
        "exp": now + expires_delta,
        "iss": settings.JWT_ISSUER,
        "aud": settings.JWT_AUDIENCE,
    }
    return jwt.encode(claims, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_access_token(user_id: uuid.UUID) -> str:
    """Issue a short-lived JWT access token for a user."""
    return _create_token(
        str(user_id),
        "access",
        timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )


def decode_access_token(token: str) -> dict[str, Any]:
    """Decode and validate an access token.

    Raises:
        JWTError: when the token is malformed, expired, or has a wrong
            issuer/audience. Callers translate this into a 401 response.
    """
    return jwt.decode(
        token,
        settings.JWT_SECRET_KEY,
        algorithms=[settings.JWT_ALGORITHM],
        audience=settings.JWT_AUDIENCE,
        issuer=settings.JWT_ISSUER,
    )


def create_opaque_token() -> str:
    """Generate a cryptographically secure opaque token for refresh/verify/reset."""
    return secrets.token_urlsafe(settings.JWT_REFRESH_TOKEN_LENGTH)


def hash_token(token: str) -> str:
    """Return the SHA-256 hex digest of an opaque token (stored in the DB)."""
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def generate_otp(length: int = 6) -> str:
    """Generate a numeric OTP using a cryptographically secure source."""
    if length <= 0:
        raise ValueError("OTP length must be positive")
    return "".join(str(secrets.randbelow(10)) for _ in range(length))
