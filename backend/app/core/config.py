"""Application settings.

Central configuration for the Vision Amanya backend. Values are loaded from
environment variables and the ``.env`` file in the backend workspace.
"""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Any

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

_BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
_DEFAULT_CORS_ORIGINS: list[str] = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:8000",
]


class Settings(BaseSettings):
    """Typed application settings with secure defaults."""

    model_config = SettingsConfigDict(
        env_file=_BACKEND_DIR / ".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # --- General -----------------------------------------------------------
    PROJECT_NAME: str = "Vision Infra - Vision Amanya API"
    PROJECT_VERSION: str = "0.1.0"
    ENVIRONMENT: str = "development"
    API_V1_STR: str = "/api/v1"
    DEBUG: bool = False

    # --- Security / JWT ----------------------------------------------------
    JWT_SECRET_KEY: str = "supersecretjwtkeyplaceholderchangeinproduction"
    JWT_ALGORITHM: str = "HS256"
    JWT_ISSUER: str = "vision-amanya"
    JWT_AUDIENCE: str = "vision-amanya-client"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 11520  # 8 days
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 43200  # 30 days
    EMAIL_VERIFICATION_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    PASSWORD_RESET_TOKEN_EXPIRE_MINUTES: int = 30
    JWT_REFRESH_TOKEN_LENGTH: int = 48

    # --- Frontend ----------------------------------------------------------
    FRONTEND_URL: str = "http://localhost:3000"

    # --- CORS --------------------------------------------------------------
    BACKEND_CORS_ORIGINS: list[str] = _DEFAULT_CORS_ORIGINS

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def _assemble_cors_origins(cls, value: str | list[str]) -> list[str]:
        """Accept a JSON list or comma-separated string of origins."""
        if isinstance(value, str) and not value.startswith("["):
            origins = [origin.strip() for origin in value.split(",") if origin.strip()]
        elif isinstance(value, str):
            import json

            origins = json.loads(value)
        else:
            origins = list(value)
        if "*" in origins:
            raise ValueError(
                "BACKEND_CORS_ORIGINS must not contain '*' because the API "
                "uses allow_credentials=True (credentialed CORS forbids wildcard origins)."
            )
        return origins

    # --- Databases ---------------------------------------------------------
    DATABASE_URL: str = (
        "postgresql+psycopg2://postgres:postgrespassword@localhost:5432/vision_amanya"
    )
    ASYNC_DATABASE_URL: str = (
        "postgresql+asyncpg://postgres:postgrespassword@localhost:5432/vision_amanya"
    )

    # --- Redis -------------------------------------------------------------
    REDIS_URL: str = "redis://localhost:6379/0"

    # --- Rate limiting -----------------------------------------------------
    RATE_LIMIT_ENABLED: bool = False
    RATE_LIMIT_DEFAULT_LIMIT: int = 120
    RATE_LIMIT_DEFAULT_PERIOD_SECONDS: int = 60
    RATE_LIMIT_AUTH_ENDPOINTS_LIMIT: int = 10
    RATE_LIMIT_AUTH_ENDPOINTS_PERIOD_SECONDS: int = 300

    # --- File uploads ------------------------------------------------------
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE_MB: int = 25
    ALLOWED_IMAGE_EXTENSIONS: list[str] = ["jpg", "jpeg", "png", "webp", "gif"]
    ALLOWED_DOCUMENT_EXTENSIONS: list[str] = ["pdf", "doc", "docx", "xls", "xlsx"]

    # --- Email (future feature wiring) -------------------------------------
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = "no-reply@visionamanya.in"

    # --- AI / Chatbot ------------------------------------------------------
    OPENAI_API_KEY: str = ""
    OPENAI_API_BASE: str = "https://api.openai.com/v1"
    LLM_MODEL: str = "gpt-4o"
    VECTOR_DB_TYPE: str = "chroma"
    PERSIST_DIRECTORY: str = "./chromadb_store"

    # --- Derived helpers ---------------------------------------------------
    @property
    def is_production(self) -> bool:
        """True when running in a production environment."""
        return self.ENVIRONMENT.lower() in {"production", "prod"}

    @property
    def is_development(self) -> bool:
        """True when running in a development environment."""
        return self.ENVIRONMENT.lower() in {"development", "dev", "test"}

    @field_validator("JWT_SECRET_KEY")
    @classmethod
    def _validate_jwt_secret(cls, value: str, info: Any) -> str:
        """Fail fast when a placeholder/weak JWT secret is configured."""
        if cls._is_placeholder(value):
            raise ValueError(
                "JWT_SECRET_KEY is missing or a known placeholder. "
                "Generate a strong one with: openssl rand -hex 32"
            )
        return value

    @staticmethod
    def _is_placeholder(value: str) -> bool:
        placeholders = {
            "supersecretjwtkeyplaceholderchangeinproduction",
            "change-me",
            "secret",
            "",
        }
        return value in placeholders or len(value) < 32


@lru_cache
def get_settings() -> Settings:
    """Return a cached Settings instance (avoids repeated env parsing)."""
    return Settings()
