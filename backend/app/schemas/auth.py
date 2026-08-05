"""Authentication schemas."""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.schemas.user import UserResponse


class RegisterRequest(BaseModel):
    """Payload for POST /api/v1/auth/register."""

    email: EmailStr = Field(..., description="User email address.")
    password: str = Field(..., min_length=8, max_length=128, description="Strong password (min 8 chars).")
    full_name: str = Field(..., min_length=1, max_length=150, description="Display name.")
    phone: str | None = Field(None, max_length=20, description="Optional contact number.")

    model_config = ConfigDict(json_schema_extra={"example": {
        "email": "customer@example.com",
        "password": "StrongPass123",
        "full_name": "Aarav Sharma",
        "phone": "+919876543210",
    }})


class LoginRequest(BaseModel):
    """Payload for POST /api/v1/auth/login."""

    email: EmailStr = Field(..., description="Registered email address.")
    password: str = Field(..., description="Account password.")

    model_config = ConfigDict(json_schema_extra={"example": {
        "email": "customer@example.com",
        "password": "StrongPass123",
    }})


class RefreshRequest(BaseModel):
    """Payload for POST /api/v1/auth/refresh."""

    refresh_token: str = Field(..., description="Opaque refresh token issued at login.")

    model_config = ConfigDict(json_schema_extra={"example": {"refresh_token": "..."}})


class LogoutRequest(BaseModel):
    """Payload for POST /api/v1/auth/logout."""

    refresh_token: str | None = Field(None, description="Revoke this refresh token; omitting revokes all sessions.")


class ForgotPasswordRequest(BaseModel):
    """Payload for POST /api/v1/auth/forgot-password."""

    email: EmailStr = Field(..., description="Registered email address.")


class ResetPasswordRequest(BaseModel):
    """Payload for POST /api/v1/auth/reset-password."""

    token: str = Field(..., description="Password-reset token from the email link.")
    new_password: str = Field(..., min_length=8, max_length=128, description="New password.")


class VerifyEmailRequest(BaseModel):
    """Payload for POST /api/v1/auth/verify-email."""

    token: str = Field(..., description="Email-verification token from the email link.")


class TokenPair(BaseModel):
    """Access + refresh token pair returned by auth endpoints."""

    access_token: str = Field(..., description="Short-lived JWT bearer token.")
    refresh_token: str = Field(..., description="Opaque refresh token (store server-side, rotate on use).")
    token_type: str = "bearer"
    expires_in: int = Field(..., description="Access token lifetime in seconds.")


class AuthResponse(BaseModel):
    """Envelope returned after successful authentication."""

    token: TokenPair
    user: UserResponse
