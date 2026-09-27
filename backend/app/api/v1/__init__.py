"""Version 1 API routers."""

from app.api.v1.admin import router as admin_router
from app.api.v1.ai import router as ai_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.auth import router as auth_router
from app.api.v1.bookings import router as bookings_router
from app.api.v1.enquiries import router as enquiries_router
from app.api.v1.favorites import router as favorites_router
from app.api.v1.leads import router as leads_router
from app.api.v1.notifications import router as notifications_router
from app.api.v1.projects import router as projects_router
from app.api.v1.properties import router as properties_router
from app.api.v1.reviews import router as reviews_router
from app.api.v1.users import router as users_router
from app.api.v1.handoff import router as handoff_router

__all__ = [
    "admin_router",
    "ai_router",
    "analytics_router",
    "auth_router",
    "bookings_router",
    "enquiries_router",
    "favorites_router",
    "handoff_router",
    "leads_router",
    "notifications_router",
    "projects_router",
    "properties_router",
    "reviews_router",
    "users_router",
]

