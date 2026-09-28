"""Repository pattern: repositories own database access only.

Repositories are thin data-access objects over :class:`AsyncSession`. They
return ORM instances and never contain business rules. Services coordinate
repositories and enforce domain logic.

A shared :class:`BaseRepository` provides the common CRUD surface and safe
ordering/pagination primitives; domain repositories extend it with the typed
queries their services need.
"""

from app.repositories.admin_stats import AdminStatsRepository
from app.repositories.analytics_event import AnalyticsEventRepository
from app.repositories.app_setting import AppSettingRepository
from app.repositories.auth_token import AuthTokenRepository
from app.repositories.booking import BookingRepository
from app.repositories.crm_task import CrmTaskRepository
from app.repositories.enquiry import EnquiryRepository
from app.repositories.favorite import FavoriteRepository
from app.repositories.lead import LeadRepository
from app.repositories.notification import NotificationRepository
from app.repositories.project import ProjectRepository
from app.repositories.property import PropertyRepository
from app.repositories.rbac import RbacRepository
from app.repositories.review import ReviewRepository
from app.repositories.sales_notification import SalesNotificationRepository
from app.repositories.user import UserRepository

__all__ = [
    "AdminStatsRepository",
    "AnalyticsEventRepository",
    "AppSettingRepository",
    "AuthTokenRepository",
    "BookingRepository",
    "CrmTaskRepository",
    "EnquiryRepository",
    "FavoriteRepository",
    "LeadRepository",
    "NotificationRepository",
    "ProjectRepository",
    "PropertyRepository",
    "RbacRepository",
    "ReviewRepository",
    "SalesNotificationRepository",
    "UserRepository",
]
