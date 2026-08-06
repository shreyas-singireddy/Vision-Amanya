"""Generate a comprehensive PDF documentation of the Vision Amanya project."""

from fpdf import FPDF
import os

class ProjectPDF(FPDF):
    def __init__(self):
        super().__init__('P', 'mm', 'A4')
        self.set_auto_page_break(auto=True, margin=20)
        self.add_page()
        self.set_margins(15, 15, 15)
    
    def _sanitize(self, text):
        """Replace non-ASCII characters with ASCII equivalents."""
        replacements = {
            '\u2192': '->',  # →
            '\u2194': '<->',  # ↔
            '\u2265': '>=',  # ≥
            '\u2264': '<=',  # ≤
            '\u2022': '-',   # •
            '\u251c': '|',   # ├
            '\u2502': '|',   # │
            '\u2514': '`',   # └
            '\u2500': '-',   # ─
            '\u00b7': '.',   # ·
            '\u2013': '-',   # –
            '\u2014': '-',   # —
            '\u2018': "'",   # '
            '\u2019': "'",   # '
            '\u201c': '"',   # "
            '\u201d': '"',   # "
            '\u2026': '...', # …
            '\u00e9': 'e',   # é
            '\u00e8': 'e',   # è
            '\u00ed': 'i',   # í
            '\u00f3': 'o',   # ó
            '\u00fa': 'u',   # ú
            '\u00e1': 'a',   # á
            '\u00f1': 'n',   # ñ
            '\u00fc': 'u',   # ü
            '\u00df': 'ss',  # ß
        }
        result = []
        for ch in text:
            if ord(ch) < 128:
                result.append(ch)
            elif ch in replacements:
                result.append(replacements[ch])
            else:
                result.append('?')
        return ''.join(result)
        
    def header(self):
        if self.page_no() > 1:
            self.set_font('Helvetica', 'I', 8)
            self.set_text_color(120, 120, 120)
            self.cell(0, 8, 'Vision Amanya - Project Documentation', 0, 0, 'L')
            self.cell(0, 8, f'Page {self.page_no()}', 0, 1, 'R')
            self.ln(4)
    
    def footer(self):
        self.set_y(-15)
        self.set_font('Helvetica', 'I', 8)
        self.set_text_color(120, 120, 120)
        self.cell(0, 10, f'Vision Infra - Vision Amanya | Generated: 2026-08-06', 0, 0, 'C')
    
    def section_title(self, title):
        self.set_font('Helvetica', 'B', 16)
        self.set_text_color(0, 51, 102)
        self.cell(0, 10, self._sanitize(title), 0, 1, 'L')
        self.set_draw_color(0, 51, 102)
        self.set_line_width(0.8)
        self.line(15, self.get_y(), 195, self.get_y())
        self.ln(4)
    
    def subsection_title(self, title):
        self.set_font('Helvetica', 'B', 13)
        self.set_text_color(0, 102, 153)
        self.cell(0, 8, self._sanitize(title), 0, 1, 'L')
        self.ln(2)
    
    def subsubsection_title(self, title):
        self.set_font('Helvetica', 'B', 11)
        self.set_text_color(51, 51, 51)
        self.cell(0, 7, self._sanitize(title), 0, 1, 'L')
        self.ln(1)
    
    def body_text(self, text):
        self.set_font('Helvetica', '', 10)
        self.set_text_color(30, 30, 30)
        self.multi_cell(0, 5, self._sanitize(text))
        self.ln(2)
    
    def bullet(self, text):
        self.set_font('Helvetica', '', 10)
        self.set_text_color(30, 30, 30)
        x = self.get_x()
        self.cell(5, 5, '-')
        self.multi_cell(0, 5, self._sanitize(text))
        self.ln(1)
    
    def code_block(self, text):
        self.set_font('Courier', '', 8)
        self.set_fill_color(240, 240, 240)
        self.set_text_color(0, 0, 0)
        self.multi_cell(0, 4, self._sanitize(text), fill=True)
        self.ln(2)
    
    def table_header(self, headers):
        self.set_font('Helvetica', 'B', 9)
        self.set_fill_color(0, 51, 102)
        self.set_text_color(255, 255, 255)
        for h in headers:
            self.cell(0, 7, h, 0, 0, 'C', fill=True)
        self.ln()
    
    def table_row(self, cells, widths=None):
        self.set_font('Helvetica', '', 9)
        self.set_text_color(30, 30, 30)
        for i, c in enumerate(cells):
            self.cell(0, 6, c, 0, 0, 'L')
        self.ln()


def build_pdf():
    pdf = ProjectPDF()
    
    # ==================== COVER PAGE ====================
    pdf.set_fill_color(0, 51, 102)
    pdf.rect(0, 0, 210, 297, 'F')
    
    pdf.set_font('Helvetica', 'B', 28)
    pdf.set_text_color(255, 255, 255)
    pdf.ln(60)
    pdf.cell(0, 15, 'VISION AMANYA', 0, 1, 'C')
    
    pdf.set_font('Helvetica', '', 16)
    pdf.cell(0, 10, 'Complete Project Documentation', 0, 1, 'C')
    pdf.ln(10)
    
    pdf.set_font('Helvetica', '', 12)
    pdf.cell(0, 8, 'Vision Infra Developers - Premium Luxury Residential Development', 0, 1, 'C')
    pdf.cell(0, 8, 'Khajaguda, Hyderabad', 0, 1, 'C')
    pdf.ln(20)
    
    pdf.set_font('Helvetica', '', 11)
    pdf.cell(0, 7, 'Full-Stack AI-Powered Real Estate Portal', 0, 1, 'C')
    pdf.cell(0, 7, 'Documentation Date: August 6, 2026', 0, 1, 'C')
    pdf.ln(30)
    
    pdf.set_font('Helvetica', '', 10)
    pdf.cell(0, 6, 'Frontend (Next.js) | Backend (FastAPI) | AI Chatbot (LangChain) | Admin Portal', 0, 1, 'C')
    pdf.cell(0, 6, 'PostgreSQL | Redis | Nginx | Docker', 0, 1, 'C')
    
    # ==================== TABLE OF CONTENTS ====================
    pdf.add_page()
    pdf.section_title('Table of Contents')
    toc = [
        '1. Project Overview',
        '2. Architecture & Directory Structure',
        '3. Technology Stack',
        '4. Backend (FastAPI) - Detailed Analysis',
        '   4.1 Application Entry Point (main.py)',
        '   4.2 Core Configuration & Security',
        '   4.3 Database Models (28 Tables)',
        '   4.4 API Endpoints (12 Routers)',
        '   4.5 Services Layer',
        '   4.6 Repositories Layer',
        '   4.7 Middleware',
        '   4.8 RBAC & Permissions',
        '   4.9 Database Migrations (Alembic)',
        '   4.10 Testing & Audit',
        '5. Frontend (Next.js) - Analysis',
        '6. Admin Portal (Next.js) - Analysis',
        '7. AI Chatbot (LangChain) - Analysis',
        '8. Mobile Application',
        '9. Docker & Nginx Configuration',
        '10. Environment Variables',
        '11. How All Components Connect',
        '12. What Has Been Completed',
        '13. What Remains / Next Steps',
    ]
    for item in toc:
        pdf.set_font('Helvetica', '', 11)
        pdf.set_text_color(30, 30, 30)
        pdf.cell(0, 7, item, 0, 1, 'L')
    
    # ==================== 1. PROJECT OVERVIEW ====================
    pdf.add_page()
    pdf.section_title('1. Project Overview')
    pdf.body_text(
        "Vision Amanya is a premium luxury residential development by Vision Infra Developers, "
        "located in the prestigious Khajaguda area of Hyderabad. This repository hosts a "
        "production-ready, full-stack environment setup designed for an AI-powered real estate portal."
    )
    pdf.body_text(
        "The project is a complete real estate platform that includes a public-facing website for "
        "property discovery, an AI-powered chatbot for customer assistance, a comprehensive backend "
        "API with CRM functionality, and an admin dashboard for managing the entire platform."
    )
    
    pdf.subsection_title('Key Features')
    pdf.bullet('Property catalog with full-text search, filters, and geo-location search')
    pdf.bullet('User authentication with JWT access tokens and rotating refresh tokens')
    pdf.bullet('Role-Based Access Control (RBAC) with 3 roles: customer, agent, admin')
    pdf.bullet('CRM pipeline: enquiries -> leads -> bookings')
    pdf.bullet('AI chatbot with RAG (Retrieval-Augmented Generation) using LangChain')
    pdf.bullet('Admin dashboard for platform management')
    pdf.bullet('Analytics event tracking and dashboard statistics')
    pdf.bullet('Reviews with moderation workflow')
    pdf.bullet('Favorites/saved properties for users')
    pdf.bullet('Notifications system')
    pdf.bullet('Price history tracking for properties')
    pdf.bullet('Rate limiting, security headers, and audit logging')
    
    # ==================== 2. ARCHITECTURE ====================
    pdf.add_page()
    pdf.section_title('2. Architecture & Directory Structure')
    pdf.code_block(
        "Vision-Amanya/\n"
        "|-- frontend/          # Next.js App Router (TypeScript, Tailwind, Zustand, TanStack Query)\n"
        "|-- backend/           # FastAPI Application (Python 3.12, SQLAlchemy, PostgreSQL)\n"
        "|-- chatbot/           # LangChain AI Workspace (Python 3.12, Vector DBs)\n"
        "|-- admin/             # Admin Portal Dashboard (Next.js, TypeScript, Tailwind)\n"
        "|-- mobile/            # Mobile Application (Directory placeholder - empty)\n"
        "|-- docker/            # Docker configurations\n"
        "|   |-- nginx/         # Nginx reverse proxy configuration\n"
        "|-- docker-compose.yml # PostgreSQL, Redis, Nginx services\n"
        "|-- .env.example       # Environment variable templates\n"
        "`-- README.md          # Project documentation"
    )
    
    pdf.subsection_title('Architecture Flow')
    pdf.body_text(
        "The system follows a microservices-style architecture with clear separation of concerns:"
    )
    pdf.bullet('Frontend (port 3000) - Public-facing Next.js website for property browsing')
    pdf.bullet('Admin (port 3001) - Next.js admin dashboard for platform management')
    pdf.bullet('Backend (port 8000) - FastAPI REST API serving all business logic')
    pdf.bullet('Chatbot - Python workspace with LangChain for AI-powered assistance')
    pdf.bullet('PostgreSQL (port 5432) - Primary database with 28 tables')
    pdf.bullet('Redis (port 6379) - Caching, rate limiting, and session storage')
    pdf.bullet('Nginx (port 80) - Reverse proxy routing traffic to the correct service')
    
    # ==================== 3. TECHNOLOGY STACK ====================
    pdf.add_page()
    pdf.section_title('3. Technology Stack')
    
    pdf.subsection_title('Frontend & Admin')
    pdf.bullet('Next.js 16.2.12 (Latest Stable) with React 19.2.4 and TypeScript')
    pdf.bullet('Styling: Tailwind CSS 4')
    pdf.bullet('Animations: Framer Motion 12.43.0')
    pdf.bullet('API Client: Axios 1.19.0')
    pdf.bullet('Form & Validation: React Hook Form 7.84.0 + Zod 4.4.3')
    pdf.bullet('State Management: Zustand 5.0.14 + TanStack Query 5.101.4')
    pdf.bullet('Icons: Lucide React 1.28.0')
    pdf.bullet('Linting: ESLint 9 (Flat Config) + Prettier 3.9.6')
    
    pdf.subsection_title('Backend')
    pdf.bullet('Runtime: Python 3.12+ (CPython 3.12.13 environment)')
    pdf.bullet('Framework: FastAPI + Uvicorn')
    pdf.bullet('Database & ORM: SQLAlchemy 2.0 + Alembic migrations')
    pdf.bullet('Database: PostgreSQL 16 (via Docker)')
    pdf.bullet('Cache: Redis 7 (via Docker)')
    pdf.bullet('Authentication: JWT (python-jose) + passlib[bcrypt]')
    pdf.bullet('Settings: pydantic-settings')
    pdf.bullet('Async DB Driver: asyncpg')
    pdf.bullet('Sync DB Driver: psycopg2-binary')
    
    pdf.subsection_title('AI & Chatbot')
    pdf.bullet('Orchestrator: LangChain + LangChain Community')
    pdf.bullet('Local Database: FAISS + ChromaDB')
    pdf.bullet('Embeddings: Sentence Transformers (Local models) + OpenAI Embeddings')
    pdf.bullet('PDF Extraction: PyPDF')
    pdf.bullet('Data Processing: Pandas + NumPy')
    pdf.bullet('LLM: GPT-4o (OpenAI)')
    
    # ==================== 4. BACKEND ====================
    pdf.add_page()
    pdf.section_title('4. Backend (FastAPI) - Detailed Analysis')
    
    pdf.subsection_title('4.1 Application Entry Point (backend/main.py)')
    pdf.body_text(
        "The main.py file is the composition root of the FastAPI application. It builds the ASGI app, "
        "configures middleware and exception handlers, and mounts the versioned feature routers."
    )
    pdf.subsubsection_title('Key Responsibilities:')
    pdf.bullet('Creates the FastAPI application instance with project metadata')
    pdf.bullet('Configures lifespan management (Redis client initialization on startup, cleanup on shutdown)')
    pdf.bullet('Adds middleware stack: GZip -> Security Headers -> Rate Limit -> Request Context -> CORS')
    pdf.bullet('Registers 12 API routers under the /api/v1 prefix')
    pdf.bullet('Defines global exception handlers for AppException, validation errors, HTTP errors, integrity errors, and unhandled exceptions')
    pdf.bullet('Provides / (root) and /health endpoints')
    pdf.bullet('Disables docs/OpenAPI in production environment')
    
    pdf.subsection_title('4.2 Core Configuration & Security')
    pdf.subsubsection_title('app/core/config.py')
    pdf.body_text(
        "Central configuration using pydantic-settings. Loads from environment variables and .env file. "
        "Key settings include JWT configuration (8-day access tokens, 30-day refresh tokens), database URLs, "
        "Redis URL, CORS origins, rate limiting parameters, file upload limits, and AI/chatbot settings."
    )
    pdf.bullet('JWT_SECRET_KEY validation - fails fast on placeholder/weak secrets')
    pdf.bullet('CORS origins validator - rejects wildcard "*" for credentialed requests')
    pdf.bullet('Environment detection (production vs development)')
    
    pdf.subsubsection_title('app/core/security.py')
    pdf.body_text(
        "Security primitives for the entire platform:"
    )
    pdf.bullet('Password hashing with bcrypt (12 rounds) via passlib')
    pdf.bullet('JWT access token creation and validation (HS256 algorithm)')
    pdf.bullet('Opaque token generation for refresh/verify/reset tokens (secrets.token_urlsafe)')
    pdf.bullet('SHA-256 token hashing for database storage (tokens never stored in plaintext)')
    pdf.bullet('OTP generation for future SMS/email verification')
    
    pdf.subsubsection_title('app/core/database.py')
    pdf.body_text(
        "Dual-engine database setup:"
    )
    pdf.bullet('Async engine (asyncpg) for API requests with connection pooling (10 pool, 20 overflow)')
    pdf.bullet('Sync engine (psycopg2) for Alembic migrations and management scripts')
    pdf.bullet('NullPool in test environment to prevent connection leaks across pytest event loops')
    pdf.bullet('get_db() dependency for request-scoped sessions with automatic rollback on errors')
    
    pdf.subsubsection_title('app/core/response.py')
    pdf.body_text(
        "Standardized API response envelopes. Every endpoint returns either:"
    )
    pdf.code_block(
        "Success: {\"success\": true, \"message\": \"...\", \"data\": {...}, \"request_id\": \"...\", \"timestamp\": \"...\"}\n"
        "Error:   {\"success\": false, \"message\": \"...\", \"error_code\": \"...\", \"details\": {...}, \"request_id\": \"...\", \"timestamp\": \"...\"}"
    )
    
    # ==================== 4.3 DATABASE MODELS ====================
    pdf.add_page()
    pdf.subsection_title('4.3 Database Models (28 Tables)')
    pdf.body_text(
        "The database schema is defined using SQLAlchemy 2.0 ORM with 28 tables organized into logical groups."
    )
    
    pdf.subsubsection_title('User & Authentication Models')
    pdf.bullet('users - Registered accounts with email, phone, password hash, verification status, login tracking')
    pdf.bullet('agents - Sales staff profiles (1:1 with users) with license, experience, ratings')
    pdf.bullet('auth_tokens - Revocable tokens for refresh/email-verification/password-reset (SHA-256 hashed)')
    
    pdf.subsubsection_title('Property Catalog Models')
    pdf.bullet('projects - Developments (e.g., Vision Amanya) with location, RERA number, status')
    pdf.bullet('property_categories - Taxonomy of property types (nested parent/child)')
    pdf.bullet('properties - Individual listings with full-text search, geo data, pricing, features')
    pdf.bullet('property_images - Media attached to properties (with primary image constraint)')
    pdf.bullet('amenities - Features like swimming pool, gym, clubhouse')
    pdf.bullet('property_amenities - Join table between properties and amenities')
    pdf.bullet('property_price_history - Audited trail of price changes')
    pdf.bullet('favorites - User saved properties (bookmarks)')
    
    pdf.subsubsection_title('CRM Models')
    pdf.bullet('enquiries - Visitor requests about properties/projects (public submission)')
    pdf.bullet('leads - Sales pipeline records (promoted from enquiries, assigned to agents)')
    pdf.bullet('bookings - Scheduled site visits, virtual tours, or calls')
    pdf.bullet('reviews - User feedback with moderation workflow')
    
    pdf.subsubsection_title('RBAC Models')
    pdf.bullet('roles - Named permission collections (customer, agent, admin)')
    pdf.bullet('permissions - Granular capability strings (e.g., "property:create")')
    pdf.bullet('user_roles - Join table between users and roles')
    pdf.bullet('role_permissions - Join table between roles and permissions')
    
    pdf.subsubsection_title('System & Observability Models')
    pdf.bullet('file_uploads - Metadata for stored files (local/S3/GCS/Azure)')
    pdf.bullet('notifications - User-facing notifications (in-app, email, push, SMS)')
    pdf.bullet('analytics_events - Append-only product analytics stream')
    pdf.bullet('audit_logs - Immutable audit trail of sensitive operations')
    pdf.bullet('app_settings - Key/value store for admin-configurable settings')
    
    pdf.subsubsection_title('AI Chatbot Models')
    pdf.bullet('chat_sessions - Conversational threads with the AI assistant')
    pdf.bullet('chat_messages - Individual exchanges with token usage and feedback')
    pdf.bullet('ai_knowledge_documents - Source documents ingested into the knowledge base')
    pdf.bullet('ai_knowledge_chunks - Split segments of documents for RAG')
    
    pdf.subsubsection_title('Key Database Features')
    pdf.bullet('UUID primary keys (gen_random_uuid())')
    pdf.bullet('Timezone-aware timestamps (timestamptz)')
    pdf.bullet('Full-text search tsvector GIN index on properties')
    pdf.bullet('Trigram GIN index for fuzzy title matching')
    pdf.bullet('Composite indexes for common query patterns')
    pdf.bullet('Soft-delete support via deleted_at column')
    pdf.bullet('Check constraints for data integrity')
    
    # ==================== 4.4 API ENDPOINTS ====================
    pdf.add_page()
    pdf.subsection_title('4.4 API Endpoints (12 Routers)')
    pdf.body_text(
        "The API is versioned under /api/v1 and organized into 12 routers. All endpoints return the "
        "standard response envelope."
    )
    
    pdf.subsubsection_title('Auth Router (/api/v1/auth)')
    pdf.bullet('POST /register - Create account and return token pair')
    pdf.bullet('POST /login - Exchange credentials for token pair')
    pdf.bullet('POST /refresh - Rotate refresh token into fresh pair')
    pdf.bullet('POST /logout - Revoke refresh token(s)')
    pdf.bullet('POST /verify-email - Consume verification token')
    pdf.bullet('POST /forgot-password - Request password reset token')
    pdf.bullet('POST /reset-password - Consume reset token and set new password')
    
    pdf.subsubsection_title('Users Router (/api/v1/users)')
    pdf.bullet('GET /me - Return caller profile')
    pdf.bullet('PATCH /me - Update caller profile')
    pdf.bullet('PATCH /me/password - Change password')
    pdf.bullet('GET /me/agent - Get agent profile')
    pdf.bullet('GET / (admin) - List users with filters')
    pdf.bullet('PATCH /{user_id} (admin) - Update user flags/roles')
    pdf.bullet('POST /{user_id}/roles (admin) - Assign role to user')
    
    pdf.subsubsection_title('Properties Router (/api/v1/properties)')
    pdf.bullet('GET /search - Full-text + filtered search (public)')
    pdf.bullet('GET /nearby - Properties near coordinates (public)')
    pdf.bullet('GET / - List properties with filters (public)')
    pdf.bullet('GET /slug/{slug} - Fetch by slug (public, increments view count)')
    pdf.bullet('GET /{property_id} - Fetch by ID (public, increments view count)')
    pdf.bullet('GET /{property_id}/recommendations - Similar properties')
    pdf.bullet('GET /{property_id}/price-history - Price change history')
    pdf.bullet('POST / (agent/admin) - Create property')
    pdf.bullet('PATCH /{property_id} (agent/admin) - Update property')
    pdf.bullet('POST /{property_id}/publish (agent/admin) - Publish listing')
    pdf.bullet('POST /{property_id}/price (agent/admin) - Change price')
    pdf.bullet('DELETE /{property_id} (admin) - Soft-delete property')
    
    pdf.subsubsection_title('Projects Router (/api/v1/projects)')
    pdf.bullet('GET / - List projects (public)')
    pdf.bullet('GET /slug/{slug} - Fetch by slug (public)')
    pdf.bullet('GET /{project_id} (admin) - Fetch by ID')
    pdf.bullet('POST / (agent/admin) - Create project')
    pdf.bullet('PATCH /{project_id} (agent/admin) - Update project')
    pdf.bullet('DELETE /{project_id} (admin) - Soft-delete project')
    
    pdf.subsubsection_title('Enquiries Router (/api/v1/enquiries)')
    pdf.bullet('POST / - Submit enquiry (public)')
    pdf.bullet('GET / (agent/admin) - List enquiries')
    pdf.bullet('GET /{enquiry_id} (agent/admin) - Fetch enquiry')
    pdf.bullet('PATCH /{enquiry_id} (agent/admin) - Update enquiry')
    pdf.bullet('PATCH /{enquiry_id}/status (agent/admin) - Update status')
    pdf.bullet('POST /{enquiry_id}/promote (agent/admin) - Promote to lead')
    
    pdf.subsubsection_title('Leads Router (/api/v1/leads)')
    pdf.bullet('POST / (agent/admin) - Create lead')
    pdf.bullet('GET / (agent/admin) - List leads with filters')
    pdf.bullet('GET /follow-ups (agent/admin) - Due follow-ups')
    pdf.bullet('GET /{lead_id} (agent/admin) - Fetch lead')
    pdf.bullet('PATCH /{lead_id} (agent/admin) - Update lead')
    pdf.bullet('POST /{lead_id}/assign (agent/admin) - Assign to agent')
    pdf.bullet('POST /{lead_id}/transition (agent/admin) - Move through pipeline')
    
    pdf.subsubsection_title('Bookings Router (/api/v1/bookings)')
    pdf.bullet('POST / (authenticated) - Create booking')
    pdf.bullet('GET /my - List caller bookings')
    pdf.bullet('GET /number/{booking_number} (agent/admin) - Fetch by reference')
    pdf.bullet('GET / (agent/admin) - List bookings with filters')
    pdf.bullet('GET /{booking_id} - Fetch booking (owner or agent/admin)')
    pdf.bullet('PATCH /{booking_id} (agent/admin) - Update booking')
    pdf.bullet('POST /{booking_id}/cancel (agent/admin) - Cancel booking')
    
    pdf.subsubsection_title('Reviews Router (/api/v1/reviews)')
    pdf.bullet('POST / (authenticated) - Submit review')
    pdf.bullet('GET / - List reviews (public, approved only by default)')
    pdf.bullet('GET /pending (agent/admin) - Pending moderation')
    pdf.bullet('GET /{review_id} - Fetch review (public)')
    pdf.bullet('PATCH /{review_id} - Edit review (author only)')
    pdf.bullet('POST /{review_id}/moderate (agent/admin) - Approve/reject')
    
    pdf.subsubsection_title('Favorites Router (/api/v1/favorites)')
    pdf.bullet('POST /toggle - Add/remove favorite')
    pdf.bullet('GET /me/status/{property_id} - Check favorite status')
    pdf.bullet('GET /me - List saved properties')
    pdf.bullet('GET /me/count - Count saved properties')
    
    pdf.subsubsection_title('Notifications Router (/api/v1/notifications)')
    pdf.bullet('GET /me - List caller notifications')
    pdf.bullet('GET /me/unread-count - Unread count')
    pdf.bullet('PATCH /{notification_id}/read - Mark as read')
    pdf.bullet('POST /me/read-all - Mark all as read')
    
    pdf.subsubsection_title('Analytics Router (/api/v1/analytics)')
    pdf.bullet('POST /events - Record analytics event (public)')
    pdf.bullet('GET /events (agent/admin) - List events')
    pdf.bullet('GET /dashboard (agent/admin) - Dashboard statistics')
    
    pdf.subsubsection_title('Admin Router (/api/v1/admin)')
    pdf.bullet('GET /stats (admin) - System statistics')
    pdf.bullet('GET /settings (admin) - List app settings')
    pdf.bullet('GET /settings/{key} (admin) - Get setting')
    pdf.bullet('PUT /settings/{key} (admin) - Create/update setting')
    
    # ==================== 4.5 SERVICES ====================
    pdf.add_page()
    pdf.subsection_title('4.5 Services Layer')
    pdf.body_text(
        "Services own the unit of work: they coordinate repositories, enforce business rules, and are "
        "the only layer that commits the session. Repositories never commit."
    )
    
    pdf.subsubsection_title('AuthService')
    pdf.bullet('Registration with default customer role assignment')
    pdf.bullet('Login with credential verification and last-login tracking')
    pdf.bullet('Refresh token rotation (old token revoked, new pair issued)')
    pdf.bullet('Logout (single token or all sessions)')
    pdf.bullet('Email verification token issuance and consumption')
    pdf.bullet('Password reset with anti-enumeration (always returns success)')
    
    pdf.subsubsection_title('PropertyService')
    pdf.bullet('CRUD operations with unique slug generation')
    pdf.bullet('Publish workflow with published_at timestamp')
    pdf.bullet('Price changes recorded in price history')
    pdf.bullet('Full-text search with filters (city, price, bedrooms, furnished)')
    pdf.bullet('Nearby search using bounding-box approximation')
    pdf.bullet('Recommendations based on project/category/city similarity')
    pdf.bullet('Atomic view count increment')
    
    pdf.subsubsection_title('LeadService')
    pdf.bullet('Lead creation with automatic scoring (priority, budget, phone, interest)')
    pdf.bullet('Assignment to agents (validates agent profile exists)')
    pdf.bullet('Pipeline transitions with won/lost side effects')
    pdf.bullet('Due follow-up listing')
    
    pdf.subsubsection_title('BookingService')
    pdf.bullet('Booking creation with double-booking prevention')
    pdf.bullet('Unique booking number generation')
    pdf.bullet('Status transition validation')
    pdf.bullet('Rescheduling with availability re-check')
    
    pdf.subsubsection_title('EnquiryService')
    pdf.bullet('Public enquiry capture with IP/user-agent tracking')
    pdf.bullet('Status transitions with auto-promotion to lead on CONVERTED')
    pdf.bullet('Explicit promotion to lead (1:1 relationship)')
    
    pdf.subsubsection_title('ReviewService')
    pdf.bullet('Review submission with duplicate detection')
    pdf.bullet('Verified-purchase detection from completed bookings')
    pdf.bullet('Moderation workflow (approve/reject)')
    pdf.bullet('Author-only editing (not allowed after moderation)')
    
    pdf.subsubsection_title('UserService')
    pdf.bullet('Profile updates (name, phone, locale, timezone)')
    pdf.bullet('Password change with current password verification')
    pdf.bullet('Admin user management (activate/deactivate, verify email)')
    pdf.bullet('Role assignment and replacement')
    
    pdf.subsubsection_title('AnalyticsService')
    pdf.bullet('Event recording (public, unauthenticated allowed)')
    pdf.bullet('Dashboard statistics aggregation (users, properties, leads, bookings, etc.)')
    
    pdf.subsubsection_title('AdminService')
    pdf.bullet('System statistics computation')
    pdf.bullet('Application settings management (list, get, upsert)')
    
    # ==================== 4.6 REPOSITORIES ====================
    pdf.add_page()
    pdf.subsection_title('4.6 Repositories Layer')
    pdf.body_text(
        "Repositories provide data access with a clean separation from business logic. They never commit "
        "transactions - the service layer owns the unit of work."
    )
    
    pdf.subsubsection_title('BaseRepository')
    pdf.bullet('Generic CRUD: get, get_or_404, add, add_all, delete, soft_delete')
    pdf.bullet('Pagination helper with validated ORDER BY (whitelisted columns)')
    pdf.bullet('Count queries')
    
    pdf.subsubsection_title('PropertyRepository')
    pdf.bullet('Eager-loaded relations (project, images, amenities, category)')
    pdf.bullet('Full-text search using tsvector GIN index + trigram title matching')
    pdf.bullet('Nearby search with bounding-box approximation')
    pdf.bullet('Recommendations based on similarity')
    pdf.bullet('Atomic view count increment (single UPDATE)')
    pdf.bullet('Price history pagination')
    
    pdf.subsubsection_title('Other Repositories')
    pdf.bullet('UserRepository - User queries with roles/permissions eager loading')
    pdf.bullet('AuthTokenRepository - Token storage, revocation, rotation')
    pdf.bullet('RbacRepository - Role/permission management')
    pdf.bullet('LeadRepository - Lead pipeline queries with filters')
    pdf.bullet('BookingRepository - Booking queries with overlap detection')
    pdf.bullet('EnquiryRepository - Enquiry queries with lead linking')
    pdf.bullet('ReviewRepository - Review queries with moderation filters')
    pdf.bullet('NotificationRepository - Notification queries')
    pdf.bullet('AnalyticsEventRepository - Event stream queries')
    pdf.bullet('AdminStatsRepository - Statistics aggregation')
    pdf.bullet('AppSettingRepository - Settings key/value store')
    pdf.bullet('FavoriteRepository - Saved property queries')
    pdf.bullet('ProjectRepository - Project catalog queries')
    
    # ==================== 4.7 MIDDLEWARE ====================
    pdf.add_page()
    pdf.subsection_title('4.7 Middleware')
    
    pdf.subsubsection_title('RequestContextMiddleware')
    pdf.body_text(
        "Generates or honors an incoming X-Request-ID header and publishes it into a context variable. "
        "Records method, path, status, duration, client IP, user agent, and authenticated user for each "
        "request. Emits one structured log line per request and echoes the request ID back on the response."
    )
    
    pdf.subsubsection_title('RateLimitMiddleware')
    pdf.body_text(
        "Redis-backed fixed-window rate limiting. Enforces a per-IP default limit (120 requests/60s) "
        "across all routes and a tighter limit (10 requests/300s) for authentication routes. Uses Redis "
        "INCR + EXPIRE. Fails open on Redis outage to prevent cache failures from taking down the API."
    )
    
    pdf.subsubsection_title('SecurityHeadersMiddleware')
    pdf.body_text(
        "Applies security headers to every response: X-Content-Type-Options, X-Frame-Options, "
        "X-XSS-Protection, Referrer-Policy, Permissions-Policy, Content-Security-Policy, and "
        "Strict-Transport-Security (production only)."
    )
    
    pdf.subsubsection_title('CORS & GZip')
    pdf.bullet('CORS configured for localhost:3000, 3001, 8000 with credentials')
    pdf.bullet('GZip compression for responses over 1000 bytes')
    
    # ==================== 4.8 RBAC ====================
    pdf.add_page()
    pdf.subsection_title('4.8 RBAC & Permissions')
    pdf.body_text(
        "The platform implements a comprehensive Role-Based Access Control system with 25 granular "
        "permission codes organized into 3 system roles."
    )
    
    pdf.subsubsection_title('Permission Codes (25 total)')
    pdf.code_block(
        "user:read, user:update, user:delete\n"
        "project:read, project:create, project:update, project:delete\n"
        "property:read, property:create, property:update, property:delete\n"
        "enquiry:read, enquiry:update\n"
        "lead:read, lead:create, lead:update, lead:assign\n"
        "booking:read, booking:create, booking:update\n"
        "review:read, review:moderate\n"
        "notification:read\n"
        "analytics:read, admin:manage"
    )
    
    pdf.subsubsection_title('System Roles')
    pdf.bullet('customer - Registered buyer/seller: can read projects/properties, create leads/bookings, submit reviews')
    pdf.bullet('agent - Sales agent: full CRM access (enquiries, leads, bookings), property/project management')
    pdf.bullet('admin - Full platform administration: all permissions including user management and admin:manage')
    
    pdf.subsubsection_title('Seed Script (scripts/seed_rbac.py)')
    pdf.body_text(
        "Idempotent bootstrap script that creates all permissions and the three system roles with their "
        "permission sets. Safe to run repeatedly - existing rows are left untouched and role↔permission "
        "links are recomputed to match the definition."
    )
    
    # ==================== 4.9 MIGRATIONS ====================
    pdf.add_page()
    pdf.subsection_title('4.9 Database Migrations (Alembic)')
    pdf.body_text(
        "Three migration files manage the database schema evolution:"
    )
    pdf.bullet('20260805_0837_0b1bc8f5245f_initial_schema_28_tables.py - Creates the complete initial schema with all 28 tables')
    pdf.bullet('20260805_2211_8a073f6cecf9_add_booking_number_to_bookings.py - Adds the unique booking_number column')
    pdf.bullet('20260805_2218_f645703c7b34_convert_datetime_columns_to_timezone_.py - Converts 22 datetime columns to timezone-aware timestamptz')
    
    # ==================== 4.10 TESTING ====================
    pdf.add_page()
    pdf.subsection_title('4.10 Testing & Audit')
    pdf.body_text(
        "The backend has 21 passing tests across 4 test files:"
    )
    pdf.bullet('test_auth.py - Authentication flows (register, login, refresh, logout)')
    pdf.bullet('test_envelope.py - Response envelope consistency')
    pdf.bullet('test_rbac.py - Role-based access control enforcement')
    pdf.bullet('test_services.py - Service layer business logic')
    
    pdf.subsubsection_title('Production-Readiness Audit (AUDIT.md)')
    pdf.body_text(
        "A comprehensive audit was performed on 2026-08-05 with the following results:"
    )
    pdf.bullet('Architecture: 8/10 - Clean layered design (router -> service -> repository)')
    pdf.bullet('Code quality: 8/10 - Ruff clean (0 errors), black/isort configured')
    pdf.bullet('Database: 7/10 - Good types/indexing, soft-delete never enforced')
    pdf.bullet('API design: 8/10 - Consistent envelope, pagination clamps, typed schemas')
    pdf.bullet('Security: 6/10 - 2 HIGH issues fixed during audit')
    pdf.bullet('Performance: 6/10 - bcrypt offloaded to threads, atomic view counter')
    pdf.bullet('Testing: 5/10 - 21 tests passing, no CI integration yet')
    
    pdf.subsubsection_title('Fixes Applied During Audit')
    pdf.bullet('HIGH: GET /leads/follow-ups had no auth - added require_permission(LEAD_READ)')
    pdf.bullet('HIGH: POST /properties/{id}/price required only any authenticated user - added require_permission(PROPERTY_UPDATE)')
    pdf.bullet('MED: Rate-limit auth bucket was dead code - fixed prefix matching')
    pdf.bullet('MED: Validation errors echoed submitted payloads - stripped input/ctx fields')
    pdf.bullet('MED: Middleware order inverted - CORS now outermost')
    pdf.bullet('MED: Docs/OpenAPI exposed in every environment - disabled in production')
    pdf.bullet('MED: CORS wildcard risk - origins validator rejects "*"')
    pdf.bullet('MED: bcrypt ran synchronously on event loop - now uses asyncio.to_thread')
    pdf.bullet('MED: increment_view_count was racy - now atomic UPDATE')
    pdf.bullet('MED: Inbound X-Request-ID trusted verbatim - now validated')
    pdf.bullet('LOW: Dead query removed, unused vars cleaned')
    pdf.bullet('REAL BUG: logout-all would NameError - import hoisted')
    
    # ==================== 5. FRONTEND ====================
    pdf.add_page()
    pdf.section_title('5. Frontend (Next.js) - Analysis')
    pdf.body_text(
        "The frontend is a Next.js 16.2.12 application using the App Router with TypeScript, Tailwind CSS, "
        "and a modern state management stack."
    )
    
    pdf.subsection_title('Current State')
    pdf.body_text(
        "The frontend is currently in its initial scaffolded state. The package.json includes all the "
        "necessary dependencies for a full-featured real estate portal, but the page.tsx is still the "
        "default Next.js starter page."
    )
    
    pdf.subsection_title('Configured Dependencies')
    pdf.bullet('@tanstack/react-query 5.101.4 - Server state management for API data fetching')
    pdf.bullet('axios 1.19.0 - HTTP client for API calls')
    pdf.bullet('framer-motion 12.43.0 - Animations and transitions')
    pdf.bullet('lucide-react 1.28.0 - Icon library')
    pdf.bullet('react-hook-form 7.84.0 - Form handling')
    pdf.bullet('zod 4.4.3 - Schema validation')
    pdf.bullet('zustand 5.0.14 - Client state management')
    pdf.bullet('tailwindcss 4 - Utility-first CSS')
    
    pdf.subsection_title('File Structure')
    pdf.code_block(
        "frontend/\n"
        "|-- src/app/\n"
        "|   |-- globals.css      # Global styles\n"
        "|   |-- layout.tsx       # Root layout with fonts\n"
        "|   `-- page.tsx         # Home page (default starter)\n"
        "|-- public/              # Static assets\n"
        "|-- .env.local           # Environment variables\n"
        "|-- next.config.ts       # Next.js configuration\n"
        "|-- package.json         # Dependencies\n"
        "`-- tsconfig.json        # TypeScript configuration"
    )
    
    pdf.subsection_title('Planned Functionality (based on dependencies)')
    pdf.bullet('Property listing pages with search and filters')
    pdf.bullet('Property detail pages with images, amenities, and pricing')
    pdf.bullet('User authentication (login/register)')
    pdf.bullet('Favorites/saved properties')
    pdf.bullet('Enquiry submission forms')
    pdf.bullet('Booking scheduling')
    pdf.bullet('AI chatbot integration')
    pdf.bullet('Responsive design with Tailwind CSS')
    
    # ==================== 6. ADMIN PORTAL ====================
    pdf.add_page()
    pdf.section_title('6. Admin Portal (Next.js) - Analysis')
    pdf.body_text(
        "The admin portal is a separate Next.js application (port 3001) designed for platform management. "
        "It shares the same dependency stack as the frontend."
    )
    
    pdf.subsection_title('Current State')
    pdf.body_text(
        "Like the frontend, the admin portal is in its initial scaffolded state with the default Next.js "
        "starter page. The package.json includes all necessary dependencies for a full admin dashboard."
    )
    
    pdf.subsection_title('Configured Dependencies')
    pdf.bullet('Same stack as frontend: Next.js 16.2.12, React 19.2.4, TypeScript')
    pdf.bullet('@tanstack/react-query for data fetching')
    pdf.bullet('axios for API calls')
    pdf.bullet('framer-motion for animations')
    pdf.bullet('react-hook-form + zod for forms and validation')
    pdf.bullet('zustand for state management')
    pdf.bullet('lucide-react for icons')
    
    pdf.subsection_title('Planned Admin Functionality')
    pdf.bullet('Dashboard with platform statistics')
    pdf.bullet('Property management (CRUD, publish, pricing)')
    pdf.bullet('Project management')
    pdf.bullet('Lead pipeline management')
    pdf.bullet('Enquiry management')
    pdf.bullet('Booking management')
    pdf.bullet('Review moderation')
    pdf.bullet('User management (activate/deactivate, roles)')
    pdf.bullet('Analytics dashboard')
    pdf.bullet('Application settings management')
    
    # ==================== 7. AI CHATBOT ====================
    pdf.add_page()
    pdf.section_title('7. AI Chatbot (LangChain) - Analysis')
    pdf.body_text(
        "The chatbot workspace is a Python 3.12 environment configured for AI-powered customer assistance "
        "using LangChain with Retrieval-Augmented Generation (RAG)."
    )
    
    pdf.subsection_title('Current State')
    pdf.body_text(
        "The chatbot/main.py is currently a verification script that validates the AI environment is "
        "properly configured. It checks that all required AI libraries are installed and importable."
    )
    
    pdf.subsection_title('Verification Script (chatbot/main.py)')
    pdf.bullet('Verifies NumPy and Pandas for data processing')
    pdf.bullet('Verifies PyPDF for PDF extraction')
    pdf.bullet('Verifies LangChain core, community, and OpenAI integrations')
    pdf.bullet('Verifies FAISS and Chroma vector database drivers')
    pdf.bullet('Verifies SentenceTransformers for local embeddings')
    
    pdf.subsection_title('Configured AI Stack')
    pdf.bullet('LangChain + LangChain Community for orchestration')
    pdf.bullet('FAISS + ChromaDB for vector storage')
    pdf.bullet('Sentence Transformers (all-MiniLM-L6-v2) for local embeddings')
    pdf.bullet('OpenAI Embeddings for cloud embeddings')
    pdf.bullet('PyPDF for document extraction')
    pdf.bullet('GPT-4o as the LLM model')
    
    pdf.subsection_title('Planned Chatbot Functionality')
    pdf.bullet('RAG pipeline: documents chunked, embedded, and stored in vector DB')
    pdf.bullet('Answer questions about properties, projects, pricing, and amenities')
    pdf.bullet('Cite exact sources from knowledge documents')
    pdf.bullet('Persist chat sessions and messages in the database')
    pdf.bullet('Track token usage and latency for cost monitoring')
    pdf.bullet('User feedback collection on AI responses')
    
    # ==================== 8. MOBILE ====================
    pdf.add_page()
    pdf.section_title('8. Mobile Application')
    pdf.body_text(
        "The mobile/ directory is currently empty - it serves as a placeholder for a future mobile "
        "application. No mobile development has been started yet."
    )
    
    # ==================== 9. DOCKER & NGINX ====================
    pdf.add_page()
    pdf.section_title('9. Docker & Nginx Configuration')
    
    pdf.subsection_title('Docker Compose (docker-compose.yml)')
    pdf.body_text(
        "Three services are defined for local development:"
    )
    pdf.bullet('PostgreSQL 16 (port 5432) - Primary database with persistent volume and healthcheck')
    pdf.bullet('Redis 7 (port 6379) - Cache/rate-limiting with persistent volume and healthcheck')
    pdf.bullet('Nginx (port 80) - Reverse proxy routing to frontend, admin, and backend')
    
    pdf.subsection_title('Nginx Configuration (docker/nginx/nginx.conf)')
    pdf.body_text(
        "Routes incoming traffic to the appropriate service:"
    )
    pdf.code_block(
        "location /        -> http://host.docker.internal:3000  (Frontend)\n"
        "location /admin/  -> http://host.docker.internal:3001/ (Admin Portal)\n"
        "location /api/    -> http://host.docker.internal:8000/ (Backend API)"
    )
    pdf.body_text(
        "Includes gzip compression for text-based content types."
    )
    
    pdf.subsection_title('Known Issue (from Audit)')
    pdf.body_text(
        "The nginx location /api/ uses a trailing slash in proxy_pass which strips the /api prefix. "
        "This means requests to /api/v1/... become /v1/... at the backend, causing 404s. The fix is "
        "to remove the trailing slash: proxy_pass http://host.docker.internal:8000;"
    )
    
    # ==================== 10. ENVIRONMENT VARIABLES ====================
    pdf.add_page()
    pdf.section_title('10. Environment Variables')
    pdf.body_text(
        "The .env.example file in the root defines the standard variable schemas. Each workspace has "
        "its own environment file:"
    )
    pdf.bullet('backend/.env - Backend configuration (pre-configured)')
    pdf.bullet('chatbot/.env - Chatbot configuration (pre-configured)')
    pdf.bullet('frontend/.env.local - Frontend configuration (pre-configured)')
    pdf.bullet('admin/.env.local - Admin configuration (pre-configured)')
    
    pdf.subsection_title('Key Environment Variables')
    pdf.code_block(
        "PROJECT_NAME=\"Vision Infra - Vision Amanya\"\n"
        "ENVIRONMENT=development\n"
        "API_V1_STR=/api/v1\n"
        "FRONTEND_PORT=3000\n"
        "ADMIN_PORT=3001\n"
        "BACKEND_PORT=8000\n"
        "JWT_SECRET_KEY=<secure-key>\n"
        "JWT_ALGORITHM=HS256\n"
        "ACCESS_TOKEN_EXPIRE_MINUTES=11520\n"
        "DATABASE_URL=postgresql+psycopg2://postgres:postgrespassword@localhost:5432/vision_amanya\n"
        "ASYNC_DATABASE_URL=postgresql+asyncpg://postgres:postgrespassword@localhost:5432/vision_amanya\n"
        "REDIS_URL=redis://localhost:6379/0\n"
        "OPENAI_API_KEY=<your-key>\n"
        "LLM_MODEL=gpt-4o\n"
        "VECTOR_DB_TYPE=chroma\n"
        "PERSIST_DIRECTORY=./chromadb_store\n"
        "EMBEDDING_MODEL_NAME=all-MiniLM-L6-v2"
    )
    
    # ==================== 11. HOW COMPONENTS CONNECT ====================
    pdf.add_page()
    pdf.section_title('11. How All Components Connect')
    
    pdf.subsection_title('System Architecture Flow')
    pdf.body_text(
        "The system operates as follows:"
    )
    pdf.bullet('Users access the public website (frontend on port 3000) to browse properties')
    pdf.bullet('The frontend makes API calls to the backend (port 8000) via axios')
    pdf.bullet('The backend authenticates requests using JWT tokens and enforces RBAC permissions')
    pdf.bullet('The backend queries PostgreSQL for data and uses Redis for caching/rate-limiting')
    pdf.bullet('Admins access the admin portal (port 3001) to manage the platform')
    pdf.bullet('The AI chatbot (LangChain) provides customer assistance using RAG over knowledge documents')
    pdf.bullet('Nginx (port 80) routes all traffic to the appropriate service')
    
    pdf.subsection_title('Data Flow: Enquiry → Lead → Booking')
    pdf.body_text(
        "The CRM funnel works as follows:"
    )
    pdf.bullet('1. A visitor submits an enquiry about a property (public endpoint)')
    pdf.bullet('2. An agent reviews the enquiry and promotes it to a lead (1:1 relationship)')
    pdf.bullet('3. The lead is assigned to an agent and moves through the pipeline (new -> contacted -> qualified -> proposal -> negotiation -> won/lost)')
    pdf.bullet('4. The customer schedules a booking (site visit, virtual tour, or call)')
    pdf.bullet('5. After a completed booking, the customer can submit a review (verified purchase)')
    
    pdf.subsection_title('Authentication Flow')
    pdf.body_text(
        "The authentication system works as follows:"
    )
    pdf.bullet('1. User registers or logs in via /api/v1/auth/* endpoints')
    pdf.bullet('2. Backend verifies credentials and issues a JWT access token (8-day expiry) + refresh token (30-day expiry)')
    pdf.bullet('3. Refresh token is stored hashed (SHA-256) in the auth_tokens table')
    pdf.bullet('4. Frontend stores tokens and sends access token as Bearer header')
    pdf.bullet('5. When access token expires, frontend calls /refresh to rotate the refresh token')
    pdf.bullet('6. Old refresh token is revoked, new pair issued')
    pdf.bullet('7. Logout revokes the refresh token')
    
    pdf.subsection_title('AI Chatbot Flow (Planned)')
    pdf.body_text(
        "The AI chatbot will work as follows:"
    )
    pdf.bullet('1. Documents (brochures, floor plans, legal, RERA, FAQs) are uploaded')
    pdf.bullet('2. Documents are chunked and embedded using Sentence Transformers')
    pdf.bullet('3. Embeddings are stored in ChromaDB/FAISS vector database')
    pdf.bullet('4. User asks a question in a chat session')
    pdf.bullet('5. Question is embedded and similar chunks are retrieved from vector DB')
    pdf.bullet('6. Retrieved chunks + question are sent to GPT-4o with a prompt template')
    pdf.bullet('7. AI response includes citations to source documents')
    pdf.bullet('8. Chat messages and token usage are persisted in the database')
    
    # ==================== 12. WHAT HAS BEEN COMPLETED ====================
    pdf.add_page()
    pdf.section_title('12. What Has Been Completed')
    
    pdf.subsection_title('Fully Completed')
    pdf.bullet('Complete backend API with 12 routers and ~70 endpoints')
    pdf.bullet('28-table PostgreSQL database schema with migrations')
    pdf.bullet('Full authentication system (register, login, refresh, logout, email verification, password reset)')
    pdf.bullet('Role-Based Access Control with 3 roles and 25 permissions')
    pdf.bullet('Property catalog with full-text search, filters, geo-search, and recommendations')
    pdf.bullet('Project management')
    pdf.bullet('CRM pipeline (enquiries, leads, bookings)')
    pdf.bullet('Reviews with moderation workflow')
    pdf.bullet('Favorites/saved properties')
    pdf.bullet('Notifications system')
    pdf.bullet('Analytics event tracking and dashboard statistics')
    pdf.bullet('Admin settings management')
    pdf.bullet('Audit logging for sensitive operations')
    pdf.bullet('Rate limiting (Redis-backed)')
    pdf.bullet('Security headers middleware')
    pdf.bullet('Request context/correlation ID middleware')
    pdf.bullet('Standardized response envelopes')
    pdf.bullet('21 passing tests')
    pdf.bullet('Production-readiness audit with 13 fixes applied')
    pdf.bullet('Docker Compose for PostgreSQL, Redis, and Nginx')
    pdf.bullet('AI chatbot environment verification script')
    pdf.bullet('Frontend and Admin project scaffolding with all dependencies')
    
    pdf.subsection_title('Partially Completed')
    pdf.bullet('Frontend - Scaffolded with dependencies but no custom pages yet')
    pdf.bullet('Admin Portal - Scaffolded with dependencies but no custom pages yet')
    pdf.bullet('AI Chatbot - Environment verified but RAG pipeline not yet implemented')
    
    pdf.subsection_title('Not Started')
    pdf.bullet('Mobile application (empty directory)')
    
    # ==================== 13. NEXT STEPS ====================
    pdf.add_page()
    pdf.section_title('13. What Remains / Next Steps')
    
    pdf.subsection_title('Before Launch (Must)')
    pdf.bullet('Fix nginx /api/ prefix bug (remove trailing slash in proxy_pass)')
    pdf.bullet('Add X-Forwarded-For/X-Forwarded-Proto headers to nginx')
    pdf.bullet('Migrate from python-jose to PyJWT (or document ecdsa allowlist decision)')
    pdf.bullet('Enforce soft-delete across repositories')
    pdf.bullet('Fix alembic check drift (unique=True + index=True phantom constraint)')
    pdf.bullet('Fix reviews exposure (force approved_only for anonymous)')
    pdf.bullet('Add rate limits for public write endpoints (enquiries, analytics)')
    pdf.bullet('Add login brute-force protection')
    pdf.bullet('Commit the backend to version control')
    pdf.bullet('Wire CI pipeline (ruff, bandit, pip-audit, pytest on Linux)')
    
    pdf.subsection_title('Build Frontend Pages')
    pdf.bullet('Home page with featured properties')
    pdf.bullet('Property listing page with search/filters')
    pdf.bullet('Property detail page')
    pdf.bullet('Login/Register pages')
    pdf.bullet('User dashboard (favorites, bookings, profile)')
    pdf.bullet('Enquiry/Booking forms')
    pdf.bullet('AI chatbot widget')
    
    pdf.subsection_title('Build Admin Pages')
    pdf.bullet('Dashboard with statistics')
    pdf.bullet('Property/Project management CRUD')
    pdf.bullet('Lead pipeline board')
    pdf.bullet('Enquiry management')
    pdf.bullet('Booking management')
    pdf.bullet('Review moderation')
    pdf.bullet('User management')
    pdf.bullet('Analytics dashboard')
    pdf.bullet('Settings management')
    
    pdf.subsection_title('Implement AI Chatbot')
    pdf.bullet('Build RAG pipeline (document ingestion, chunking, embedding)')
    pdf.bullet('Create chat API endpoints')
    pdf.bullet('Integrate with frontend chatbot widget')
    pdf.bullet('Implement source citation in responses')
    pdf.bullet('Add feedback collection')
    
    pdf.subsection_title('Database Hardening')
    pdf.bullet('Add missing FK indexes (10 columns)')
    pdf.bullet('Add join-table reverse indexes')
    pdf.bullet('Add statement_timeout/pool_timeout/pool_recycle')
    pdf.bullet('Convert bulk operations to single UPDATE statements')
    pdf.bullet('Push booking overlap detection into SQL')
    pdf.bullet('Convert money from float to Numeric')
    pdf.bullet('Add CHECK constraints (price >= 0, rating 0-5, budget_min <= budget_max)')
    pdf.bullet('Add token purge job')
    
    pdf.subsection_title('Security Hardening')
    pdf.bullet('Restrict /health endpoint to probe IPs/keys in production')
    pdf.bullet('Shorter access-token lifetime')
    pdf.bullet('Revoke refresh tokens on password change')
    pdf.bullet('Enforce email verification')
    pdf.bullet('Add password strength validation')
    pdf.bullet('Cache token->user in Redis to reduce per-request queries')
    
    pdf.subsection_title('DevOps')
    pdf.bullet('Add backend service to Docker Compose')
    pdf.bullet('Use environment variables for database credentials')
    pdf.bullet('Add TLS/HTTPS support')
    pdf.bullet('Set up CI/CD pipeline')
    pdf.bullet('Deploy to production')
    
    # ==================== FINAL SUMMARY ====================
    pdf.add_page()
    pdf.section_title('Final Summary')
    pdf.body_text(
        "The Vision Amanya project has a robust, production-plausible backend with a complete API, "
        "database schema, authentication system, RBAC, and CRM functionality. The frontend and admin "
        "portals are scaffolded with all necessary dependencies but need custom pages built. The AI "
        "chatbot environment is verified but the RAG pipeline needs implementation. The mobile "
        "application has not been started."
    )
    pdf.body_text(
        "The backend has undergone a comprehensive production-readiness audit with 13 fixes applied, "
        "including 2 HIGH-severity authorization vulnerabilities. The audit concluded with a "
        "'Conditional GO' verdict - the backend is deployable once the 'Before Launch' items are "
        "addressed."
    )
    pdf.body_text(
        "The next major phase of work is building the frontend and admin portal pages to bring the "
        "platform to life, followed by implementing the AI chatbot RAG pipeline."
    )
    
    # Save the PDF
    output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'Vision_Amanya_Project_Documentation.pdf')
    pdf.output(output_path)
    print(f"PDF generated successfully at: {output_path}")
    return output_path

if __name__ == '__main__':
    build_pdf()