"""Service layer: business logic, transaction ownership and domain rules.

Services coordinate repositories, own the unit of work (they are the only layer
that commits) and expose use-case shaped methods consumed by API routers.
"""

from app.services.admin_service import AdminService
from app.services.analytics_service import AnalyticsService
from app.services.auth_service import AuthService
from app.services.booking_service import BookingService
from app.services.enquiry_service import EnquiryService
from app.services.favorite_service import FavoriteService
from app.services.lead_service import LeadService
from app.services.notification_service import NotificationService
from app.services.project_service import ProjectService
from app.services.property_service import PropertyService
from app.services.review_service import ReviewService
from app.services.shortlist_service import ShortlistService
from app.services.user_service import UserService
from app.services.handoff_service import HandoffService

__all__ = [
    "AdminService",
    "AnalyticsService",
    "AuthService",
    "BookingService",
    "EnquiryService",
    "FavoriteService",
    "HandoffService",
    "LeadService",
    "NotificationService",
    "ProjectService",
    "PropertyService",
    "ReviewService",
    "ShortlistService",
    "UserService",
]
