"""Custom application exceptions and error taxonomy.

Every expected failure mode in the application maps to a subclass of
:class:`AppException` carrying an HTTP status code, a stable machine-readable
``error_code`` and an optional structured ``details`` payload. The global
exception handlers in ``main.py`` translate these into the standard error
envelope without leaking stack traces or internal error messages.
"""

from __future__ import annotations

from typing import Any


class AppException(Exception):
    """Base class for all application-level errors.

    Attributes:
        status_code: HTTP status code returned to the client.
        error_code: Stable machine-readable identifier (e.g. ``user_not_found``).
        message: Human-readable description safe to return to the client.
        details: Optional structured payload (field errors, extra context).
    """

    status_code: int = 500
    error_code: str = "internal_error"
    message: str = "An unexpected error occurred."

    def __init__(
        self,
        message: str | None = None,
        *,
        error_code: str | None = None,
        details: Any | None = None,
    ) -> None:
        if message is not None:
            self.message = message
        if error_code is not None:
            self.error_code = error_code
        self.details = details
        super().__init__(self.message)


class NotFoundException(AppException):
    """Raised when a requested resource does not exist."""

    status_code = 404
    error_code = "not_found"


class ConflictException(AppException):
    """Raised when a state conflict prevents the operation (e.g. duplicates)."""

    status_code = 409
    error_code = "conflict"


class AuthenticationException(AppException):
    """Raised when credentials are missing, invalid or expired."""

    status_code = 401
    error_code = "authentication_failed"


class PermissionDeniedException(AppException):
    """Raised when the caller is authenticated but not authorized."""

    status_code = 403
    error_code = "permission_denied"


class ValidationException(AppException):
    """Raised when business-rule validation fails (not schema-level 422)."""

    status_code = 422
    error_code = "validation_error"


class BusinessException(AppException):
    """Raised when a business rule prohibits the operation."""

    status_code = 400
    error_code = "business_rule_violation"


class DatabaseException(AppException):
    """Raised when a database operation fails at the infrastructure layer."""

    status_code = 500
    error_code = "database_error"


class RateLimitExceededException(AppException):
    """Raised when a client exceeds the configured request rate limit."""

    status_code = 429
    error_code = "rate_limit_exceeded"
