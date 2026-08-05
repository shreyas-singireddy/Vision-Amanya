"""Canonical permission codes used across routers and the RBAC seed.

These strings are stored in ``permissions.code`` and referenced by the
``require_permission`` dependency. Roles map to them in ``scripts/seed_rbac``.
"""

# user management
USER_READ = "user:read"
USER_UPDATE = "user:update"
USER_DELETE = "user:delete"

# project catalog
PROJECT_READ = "project:read"
PROJECT_CREATE = "project:create"
PROJECT_UPDATE = "project:update"
PROJECT_DELETE = "project:delete"

# property catalog
PROPERTY_READ = "property:read"
PROPERTY_CREATE = "property:create"
PROPERTY_UPDATE = "property:update"
PROPERTY_DELETE = "property:delete"

# CRM: enquiries
ENQUIRY_READ = "enquiry:read"
ENQUIRY_UPDATE = "enquiry:update"

# CRM: leads
LEAD_READ = "lead:read"
LEAD_CREATE = "lead:create"
LEAD_UPDATE = "lead:update"
LEAD_ASSIGN = "lead:assign"

# CRM: bookings
BOOKING_READ = "booking:read"
BOOKING_CREATE = "booking:create"
BOOKING_UPDATE = "booking:update"

# reviews
REVIEW_READ = "review:read"
REVIEW_MODERATE = "review:moderate"

# notifications
NOTIFICATION_READ = "notification:read"

# analytics / admin
ANALYTICS_READ = "analytics:read"
ADMIN_MANAGE = "admin:manage"

ALL_PERMISSIONS: list[str] = [
    USER_READ,
    USER_UPDATE,
    USER_DELETE,
    PROJECT_READ,
    PROJECT_CREATE,
    PROJECT_UPDATE,
    PROJECT_DELETE,
    PROPERTY_READ,
    PROPERTY_CREATE,
    PROPERTY_UPDATE,
    PROPERTY_DELETE,
    ENQUIRY_READ,
    ENQUIRY_UPDATE,
    LEAD_READ,
    LEAD_CREATE,
    LEAD_UPDATE,
    LEAD_ASSIGN,
    BOOKING_READ,
    BOOKING_CREATE,
    BOOKING_UPDATE,
    REVIEW_READ,
    REVIEW_MODERATE,
    NOTIFICATION_READ,
    ANALYTICS_READ,
    ADMIN_MANAGE,
]
