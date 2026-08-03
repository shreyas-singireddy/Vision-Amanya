# Vision Infra – Vision Amanya

Vision's Amanya is a premium luxury residential development by Vision Infra Developers, located in the prestigious Khajaguda area of Hyderabad.

This repository hosts a production-ready, full-stack environment setup designed for an AI-powered real estate portal.

---

## 🏗️ Project Architecture & Directory Structure

```text
Vision-Amanya/
├── frontend/             # Next.js App Router (TypeScript, Tailwind, React Hook Form, Zustand, TanStack Query)
├── backend/              # FastAPI Application (Python 3.12, SQLAlchemy, Uvicorn, PostgreSQL)
├── chatbot/              # LangChain AI Workspace (Python 3.12, Vector DBs, SentenceTransformers)
├── admin/                # Admin Portal Dashboard (Next.js, TypeScript, Tailwind CSS)
├── mobile/               # Mobile Application (Directory placeholder)
└── docker/               # Docker configurations
    └── nginx/            # Nginx reverse proxy configuration
        └── nginx.conf    # Route mapping (localhost -> Next.js, localhost/admin -> Admin, localhost/api -> FastAPI)
```

---

## 🛠️ Technology Stack

### Frontend & Admin
* **Next.js** (Latest Stable) with React and TypeScript
* **Styling**: Tailwind CSS
* **Animations**: Framer Motion
* **API Client**: Axios
* **Form & Validation**: React Hook Form + Zod
* **State Management**: Zustand + TanStack Query (React Query)
* **Linting & Formatting**: ESLint (Flat Config) + Prettier

### Backend
* **Runtime**: Python 3.12+ (CPython 3.12.13 environment)
* **Framework**: FastAPI + Uvicorn
* **Database & ORM**: SQLAlchemy 2.0 + Alembic migrations
* **Authentication**: JWT (`python-jose`) + `passlib[bcrypt]`
* **Settings**: `pydantic-settings`

### AI & Chatbot
* **Orchestrator**: LangChain + LangChain Community
* **Local Database**: FAISS + ChromaDB
* **Embeddings**: Sentence Transformers (Local models) + OpenAI Embeddings
* **PDF Extraction**: PyPDF
* **Data Processing**: Pandas + NumPy

---

## 🚦 Startup & Development Instructions

### 1. Database & Cache Services (Docker)
Ensure **Docker Desktop** is installed and running. Start the core database and caching services using Docker Compose:
```bash
# From the root directory
docker compose up -d
```
This spins up:
* **PostgreSQL 16** (Database) on port `5432`
* **Redis 7** (Cache) on port `6379`
* **Nginx** (Reverse Proxy) on port `80`

### 2. Backend Startup
Activate the virtual environment and run the Uvicorn hot-reloader:
```powershell
# Windows PowerShell
& "backend/.venv/Scripts/python.exe" -m uvicorn backend.main:app --reload --port 8000
```
API endpoints will be served at `http://localhost:8000`. You can visit `http://localhost:8000/docs` to view Swagger documentation or `http://localhost:8000/health` to view PostgreSQL/Redis connectivity health.

### 3. Chatbot Workspace
Run the validation script or execution scripts inside the chatbot virtual environment:
```powershell
# Run verification
& "chatbot/.venv/Scripts/python.exe" chatbot/main.py
```

### 4. Frontend Startup
Install project packages (already done) and run the Next.js development server:
```bash
cd frontend
npm run dev
```
Exposed locally on `http://localhost:3000`.

### 5. Admin Portal Startup
Start the admin dashboard Next.js environment:
```bash
cd admin
npm run dev -- -p 3001
```
Exposed locally on `http://localhost:3001`.

---

## 🔐 Environment Variables Configuration

Copy `.env.example` to create local configuration profiles inside each workspace:

1. **Backend**: Create `backend/.env` (pre-configured)
2. **Chatbot**: Create `chatbot/.env` (pre-configured)
3. **Frontend**: Create `frontend/.env.local` (pre-configured)
4. **Admin**: Create `admin/.env.local` (pre-configured)

Refer to `.env.example` in the root directory for standard variable schemas.
