"""ORM models package.

Importing this package registers every model on :data:`app.models.base.Base`
metadata, which is required by both the application and Alembic autogenerate.
"""

from app.models.auth import AuthToken
from app.models.base import Base
from app.models.chat import (
    ChatMessage,
    ChatSession,
    KnowledgeChunk,
    KnowledgeDocument,
)
from app.models.crm import Booking, Enquiry, Lead, Review
from app.models.property import (
    Amenity,
    Favorite,
    Project,
    Property,
    PropertyAmenity,
    PropertyCategory,
    PropertyImage,
    PropertyPriceHistory,
)
from app.models.rbac import (
    Permission,
    Role,
    RolePermission,
    UserRole,
)
from app.models.system import (
    AnalyticsEvent,
    AppSetting,
    AuditLog,
    FileUpload,
    Notification,
)
from app.models.user import Agent, User

__all__ = [
    "Agent",
    "Amenity",
    "AnalyticsEvent",
    "AppSetting",
    "AuditLog",
    "AuthToken",
    "Base",
    "Booking",
    "ChatMessage",
    "ChatSession",
    "Enquiry",
    "Favorite",
    "FileUpload",
    "KnowledgeChunk",
    "KnowledgeDocument",
    "Lead",
    "Notification",
    "Permission",
    "Project",
    "Property",
    "PropertyAmenity",
    "PropertyCategory",
    "PropertyImage",
    "PropertyPriceHistory",
    "Review",
    "Role",
    "RolePermission",
    "User",
    "UserRole",
]
