"""Reusable helper utilities (domain-level, no framework dependencies).

Splitting helpers here (rather than in ``core``) keeps cross-cutting
infrastructure separate from domain conveniences. Every module in this package
is side-effect free except where explicitly documented (e.g. email/SMS/OTP).
"""

from app.utils.audit import write_audit_log
from app.utils.booking_number import generate_booking_number
from app.utils.dates import utcnow
from app.utils.email import EmailService
from app.utils.otp import OtpService
from app.utils.pagination import Page, paginate_orm, pagination_params
from app.utils.slug import slugify
from app.utils.validators import (
    is_valid_email,
    is_valid_phone,
    validate_password_strength,
)

__all__ = [
    "EmailService",
    "OtpService",
    "Page",
    "generate_booking_number",
    "is_valid_email",
    "is_valid_phone",
    "paginate_orm",
    "pagination_params",
    "slugify",
    "utcnow",
    "validate_password_strength",
    "write_audit_log",
]
