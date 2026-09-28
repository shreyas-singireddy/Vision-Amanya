"""Pydantic request/response schemas.

Every schema validates input, hides internal fields, supports ORM
serialization (``from_attributes=True``) and carries realistic examples for
OpenAPI documentation. Enum values reuse the model enums so the API contract
and persistence layer cannot drift.
"""

from app.schemas.admin import AdminUserUpdate, AppSettingUpdate, SystemStats
from app.schemas.analytics import AnalyticsEventCreate, DashboardStats
from app.schemas.auth import (
    AuthResponse,
    ForgotPasswordRequest,
    LoginRequest,
    LogoutRequest,
    RefreshRequest,
    RegisterRequest,
    ResetPasswordRequest,
    TokenPair,
    VerifyEmailRequest,
)
from app.schemas.booking import BookingCreate, BookingListResponse, BookingResponse, BookingUpdate
from app.schemas.crm_task import (
    CrmTaskAssign,
    CrmTaskCreate,
    CrmTaskListResponse,
    CrmTaskResponse,
    CrmTaskUpdate,
    SalesNotificationResponse,
    SalesTriggerRequest,
    SalesWorkflowResponse,
)
from app.schemas.enquiry import (
    EnquiryCreate,
    EnquiryListResponse,
    EnquiryResponse,
    EnquiryStatusUpdate,
    EnquiryUpdate,
)
from app.schemas.favorite import (
    FavoriteCreate,
    FavoriteListResponse,
    FavoriteResponse,
    FavoriteToggleResponse,
)
from app.schemas.lead import LeadAssign, LeadCreate, LeadListResponse, LeadResponse, LeadUpdate
from app.schemas.notification import NotificationListResponse, NotificationResponse
from app.schemas.project import ProjectCreate, ProjectListResponse, ProjectResponse, ProjectUpdate
from app.schemas.property import (
    PriceHistoryResponse,
    PropertyCreate,
    PropertyImageResponse,
    PropertyListResponse,
    PropertyResponse,
    PropertySearchParams,
    PropertyUpdate,
)
from app.schemas.review import (
    ReviewCreate,
    ReviewListResponse,
    ReviewModerate,
    ReviewResponse,
    ReviewUpdate,
)
from app.schemas.user import (
    ChangePasswordRequest,
    UserAdminUpdate,
    UserResponse,
    UserRoleAssignment,
    UserUpdate,
)
from app.schemas.handoff import (
    HandoffAnalytics,
    HandoffContext,
    HandoffRequest,
    HandoffResponse,
    HandoffStatusUpdate,
    KnowledgeGapEvent,
    SalesAssignment,
    SalesConversationSummary,
)

__all__ = [
    "AdminUserUpdate",
    "AnalyticsEventCreate",
    "AppSettingUpdate",
    "AuthResponse",
    "BookingCreate",
    "BookingListResponse",
    "BookingResponse",
    "BookingUpdate",
    "ChangePasswordRequest",
    "CrmTaskAssign",
    "CrmTaskCreate",
    "CrmTaskListResponse",
    "CrmTaskResponse",
    "CrmTaskUpdate",
    "DashboardStats",
    "EnquiryCreate",
    "EnquiryListResponse",
    "EnquiryResponse",
    "EnquiryStatusUpdate",
    "EnquiryUpdate",
    "FavoriteCreate",
    "FavoriteListResponse",
    "FavoriteResponse",
    "FavoriteToggleResponse",
    "ForgotPasswordRequest",
    "LeadAssign",
    "LeadCreate",
    "LeadListResponse",
    "LeadResponse",
    "LeadUpdate",
    "LoginRequest",
    "LogoutRequest",
    "NotificationListResponse",
    "NotificationResponse",
    "PriceHistoryResponse",
    "ProjectCreate",
    "ProjectListResponse",
    "ProjectResponse",
    "ProjectUpdate",
    "PropertyCreate",
    "PropertyImageResponse",
    "PropertyListResponse",
    "PropertyResponse",
    "PropertySearchParams",
    "PropertyUpdate",
    "RefreshRequest",
    "RegisterRequest",
    "ResetPasswordRequest",
    "ReviewCreate",
    "ReviewListResponse",
    "ReviewModerate",
    "ReviewResponse",
    "ReviewUpdate",
    "SalesNotificationResponse",
    "SalesTriggerRequest",
    "SalesWorkflowResponse",
    "SystemStats",
    "TokenPair",
    "UserAdminUpdate",
    "UserResponse",
    "UserRoleAssignment",
    "UserUpdate",
    "VerifyEmailRequest",
]
