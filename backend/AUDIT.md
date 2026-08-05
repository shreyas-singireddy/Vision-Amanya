# Vision Amanya Backend — Production-Readiness Audit

**Date:** 2026-08-05 · **Scope:** `backend/` (FastAPI) only — no frontend/chatbot/mobile
**Tooling:** ruff 0.16.1 · black 26.5.1 · isort 8.0.1 · bandit 1.9.4 · pip-audit 2.10.1 · pytest (21 tests) · coverage 7.15.3 · manual code review

---

## 1. Executive Summary

The backend is **well-architected and production-plausible, but NOT yet production-ready.**

Strengths: clean layered design (router → service → repository), strict RBAC enforced on nearly every route, opaque hashed refresh tokens with rotation and replay detection, fail-fast JWT secret validation, consistent error envelope, timezone-aware timestamps, UUID PKs, eager-loading discipline, and a tidy Alembic migration chain.

Two exploitable authorization gaps (HIGH) and several security/perf weaknesses were found. **Both HIGHs were fixed during this audit**, along with 8 other safe improvements. Remaining issues are mostly MED hardening items requiring design decisions, plus two environment-specific tooling blocks (mypy, coverage) that must be re-run in CI/Linux.

**Verdict:** address the MED items in the "Needs decision" list before launch; the code is otherwise deployable.

## 2. Scores (1–10)

| Area | Score | Notes |
|---|---|---|
| Architecture | 8 | Clean layering; only minor overlap between services/repos |
| Code quality | 8 | Ruff clean (0 errors), black/isort configured; mypy blocked by host policy |
| Database | 7 | Good types/indexing; soft-delete never enforced; several missing FK indexes |
| API design | 8 | Consistent envelope; pagination clamps; schema-typed bodies (2 raw-`dict` exceptions) |
| Security | 6 | 2 HIGH fixed in audit; MED gaps remain (login throttling, public write endpoints, docs/health exposure) |
| Performance | 6 | bcrypt offloaded to threads (fixed); N+1 audit clean; hot-path fixes applied; view-count atomic |
| Testing | 5 | 21 tests passing; coverage blocked on this host; no CI integration yet |
| Documentation | 6 | README/env-doc good; no API contract doc; `docs` disabled in prod |
| DevOps | 5 | nginx `location /api/` strips the `/api` prefix (deployment-breaking); hardcoded creds; no backend container |

## 3. What Was Fixed During This Audit (safe, verified, 21/21 tests pass)

1. **HIGH — `GET /api/v1/leads/follow-ups` had no auth** (`app/api/v1/leads.py:73`). Any caller could read up to 50 leads (name/email/phone/budget). Added `require_permission(LEAD_READ)`.
2. **HIGH — `POST /api/v1/properties/{id}/price` required only any authenticated user** (`app/api/v1/properties.py:212`). Any customer could overwrite any property price. Added `require_permission(PROPERTY_UPDATE)`.
3. **MED — Rate-limit auth bucket was dead code** (`app/middleware/rate_limit.py:47`). `endswith("/auth")` never matched `/api/v1/auth/login`. Now a prefix match so the 10/300s auth window actually applies.
4. **MED — Validation errors echoed submitted payloads** (`main.py` validation handler). Stripped `input`/`ctx` so a mistyped `password` is never returned to the client.
5. **MED — Middleware order inverted vs stated intent** (`main.py`). CORS is now added last (outermost), so pre-flight OPTIONS short-circuits before rate limiting/logging, matching the comment's design.
6. **MED — Docs/OpenAPI exposed in every environment** (`main.py`). `/docs`, `/redoc`, `openapi.json` now disabled under `ENVIRONMENT=production`.
7. **MED — CORS `allow_credentials=True` + wildcard risk** (`app/core/config.py`). Origins validator now rejects `"*"` outright.
8. **MED — bcrypt ran synchronously on the event loop** (register/login/reset/change-password, ~100–250 ms blocking). All call sites in `auth_service.py`/`user_service.py` now use `asyncio.to_thread`.
9. **MED — `increment_view_count` was a racy read-modify-write** (`app/repositories/property.py`). Now a single atomic `UPDATE ... view_count + 1`.
10. **MED — Inbound `X-Request-ID` trusted verbatim** (`app/middleware/request_context.py`). Now validated (≤64 chars, URL-safe) or replaced with a generated ID.
11. **LOW — `recent_activity` dead query removed** (`analytics_service.py`); unused vars and ambiguous identifiers cleaned across the codebase (ruff `--fix`).
12. **REAL BUG FIXED — logout-all would `NameError`** (`app/repositories/auth_token.py`): `utcnow` import hoisted from a local scope to module top (F821).
13. **Tooling config** — `backend/pyproject.toml` added (ruff/black/isort/bandit/coverage); bandit runs **clean** (`bandit -c pyproject.toml -r app main.py` → 0 issues; B104 `# nosec` on the dev bind-all, B105 false positives skipped with rationale).

## 4. Static Analysis

- **ruff:** baseline 97 errors → **0**. 122 auto-fixes + 39 unsafe-fixes applied; remaining manually resolved (BLE001 narrowed, F821 imports, S110, DTZ011, E741, PERF401, RUF059).
- **black/isort:** configured at 120 cols. **56 files would still be reformatted** — deliberately left as a documented recommendation (diff noise; run `black . && isort .` in a dedicated commit + CI gate).
- **mypy: BLOCKED on this host.** Compiled `mypyc` DLL is denied by the Windows Application Control policy (`ImportError: DLL load failed`), including `MYPY_USE_MYPYC=0`. Run `python -m mypy app main.py --ignore-missing-imports` in CI/Linux.

## 5. Security Scanning

- **bandit:** 0 issues (after fixes; see §3.13).
- **pip-audit:** **1 known vulnerability — `ecdsa 0.19.2` (PYSEC-2026-1325), HIGH**, pulled in by `python-jose 3.5.0` (`requirements.txt:11`). No safe fix without upgrading python-jose (breaking). **Needs dependency-approval decision** — migrate to PyJWT (recommended) or allowlist `pip-audit --ignore-vuln PYSEC-2026-1325` in CI with this rationale.

## 6. Testing

- 21/21 pytest tests pass against the live dev DB (NullPool in test mode; FK-safe cleanup fixtures; `TestClient` with lifespan).
- **Coverage: BLOCKED on this host.** Any coverage tracing (C tracer, sysmon, `--timid`) triggers a Windows access violation in asyncpg's threaded connection code (same host policy environment as mypy). Run `coverage run -m pytest` in CI/Linux.
- Test gaps to close before launch: no tests for admin/projects/reviews/bookings flows, no upload/body-limit tests, no negative-path rate-limit tests, no E2E migration test.

## 7. Database Audit

Good: UUID PKs (`gen_random_uuid()`), `timestamptz` everywhere, `StrEnum` + `values_callable` CHECKs, `pg_trgm`/`tsvector`/partial/composite indexes, correct `ondelete` semantics, `pool_pre_ping`, `NullPool` in tests, clean transaction ownership (repos never commit).

Needs decision (breaking/migration work):
- **MED — Soft delete is never enforced** (`models/base.py` SoftDeleteMixin vs `repositories/base.py`): deleted rows still returned and can authenticate. Inject `deleted_at IS NULL` across repositories + `get_current_user`.
- **MED — `alembic check` drift**: `unique=True, index=True` on `users.email`/`permissions.code`/`roles.code` creates a phantom unnamed constraint not in the DB (verified in initial migration). Drop `unique=True` or rename the constraint.
- **MED — Missing FK indexes** (10 cols): `bookings.enquiry_id`, `property_images.file_upload_id`, `enquiries.created_by`, `property_price_history.changed_by`, `app_settings.updated_by`, `ai_knowledge_documents.file_upload_id`, `users.avatar_file_upload_id`, `user_roles.granted_by`, `property_categories.parent_id`, `reviews.booking_id`. Add `index=True`.
- **MED — Join-table reverse indexes** (`user_roles.role_id`, `role_permissions.permission_id`).
- **MED — No `statement_timeout`/`pool_timeout`/`pool_recycle`** on engines (`app/core/database.py`).
- **MED — Migration 3 rewrites 22 columns** to `timestamptz` in one transaction → schedule a maintenance window with lock timeouts.
- **MED — Auth/notification bulk ops load-then-mutate** (`auth_token.revoke_all_for_user`, `notification.mark_all_read`); convert to single UPDATE.
- **MED — `find_overlap` filters in Python after unbounded SELECT** (`repositories/booking.py`); push range overlap into SQL + indexes.
- **LOW — Money as `float`** (`price`, `budget_*`, `price_per_sqft`) → `Numeric(15,2)`.
- **LOW — Missing CHECKs** (price ≥ 0, rating 0–5, budget_min ≤ budget_max); redundant single-column indexes; no `users.is_active` index; auth tokens never purged; search/geo trigram/GiST indexes; `file_uploads.is_deleted` vs `deleted_at` inconsistency; `compare_server_default` off in `alembic/env.py`.

## 8. API Audit

Endpoint inventory audited (≈70 routes). Well: envelope on all responses, `MAX_PAGE_SIZE` clamp, typed schemas, ownership checks on `/bookings/{id}`, uniform forgot-password anti-enumeration.

Needs decision:
- **MED — Unauthenticated review leaks** (`reviews.py`): public `GET /reviews` lets callers pass `approved_only=false&status=pending`; `GET /reviews/{id}` returns any status. Force `approved_only=True` for anonymous or gate behind `REVIEW_MODERATE`.
- **MED — Public unbounded writes**: `POST /enquiries` and `POST /analytics/events` have no per-IP rate limit or payload cap.
- **MED — No login/register brute-force protection**: intended auth limit now works, but no per-account lockout/attempt tracking.
- **MED — `/health` and root disclose internals** (Postgres/Redis status, `ENVIRONMENT`); restrict to probe IPs/keys in prod.
- **LOW — Raw `dict` bodies** at `leads.py` transition and `bookings.py` cancel → typed schemas.
- **LOW — `change_password` doesn't revoke refresh tokens**; refresh-token replay not alerted; `validate_password_strength` never called (only `min_length=8` enforced); `is_email_verified` never enforced; 8-day access tokens (`config.py:46`); `CurrentAgent` dep unused.
- **LOW — No global request-body size limit** (nginx `client_max_body_size` defaults to 1 MB, conflicting with `MAX_UPLOAD_SIZE_MB=25`).

## 9. Security

- **Good:** opaque hashed refresh/verify/reset tokens + rotation + replay detection; centralized 24-code RBAC; CSP/security headers + HSTS in prod; secrets outside repo; fail-fast JWT validation; catch-all handler never leaks internals.
- **Fixed in audit:** see §3 (2 HIGH, plus CORS, docs, error echo, request-id).
- **Remaining:** JWT secret placeholder in `.env.example` (intentional fail-fast — copying it verbatim won't boot, which is by design); `python-jose`/`ecdsa` CVE (see §5); rate-limit keys on proxy IP (honor `X-Forwarded-For` only from trusted proxies); rate limiter fails open on Redis outage.

## 10. Performance

- **Fixed:** bcrypt off the event loop; atomic view counter; dead query removed.
- **Remaining MED:** per-request role/permission queries in `get_current_user` (3–4 queries; cache token→user in Redis); `mark_all_read`/`revoke_all` bulk updates; `find_overlap` SQL pushdown; missing statement timeouts.
- **N+1:** no confirmed N+1 in hot paths after Phase-3 eager-loading fixes; recommend `lazy="raise_on_sql"` as a global relationship default to make future ones loud.

## 11. DevOps / Docs

- **HIGH (deployment) — nginx strips `/api`:** `docker/nginx/nginx.conf:52-59` `location /api/ { proxy_pass http://host.docker.internal:8000/; }` — the trailing `/` rewrites `/api/v1/...` to `/v1/...` and the backend mounts at `/api/v1`, so **the API 404s behind nginx**. Use `proxy_pass http://host.docker.internal:8000;` (no URI). Also missing `X-Forwarded-For`/`X-Forwarded-Proto` headers (needed for correct client IPs and rate limiting).
- **MED — `docker-compose.yml`:** no backend service (app runs on host); hardcoded `POSTGRES_PASSWORD`/dev creds; DB and Redis ports exposed; no TLS (port 80 only).
- **MED — Version control:** the **entire `backend/` tree is uncommitted** (only root README/compose/env committed). No history, no revert safety — commit the backend before going further.
- **LOW — README** `uvicorn backend.main:app` relies on namespace-package import; update to `cd backend && uvicorn main:app` or add `backend/__init__.py`.

## 12. Prioritized Roadmap

**Before launch (must):**
1. nginx `/api/` prefix bug + `X-Forwarded-*` headers.
2. `python-jose` → PyJWT (or document the `ecdsa` allowlist decision).
3. Soft-delete enforcement + `alembic check` drift fix.
4. Reviews exposure fixes; enquiry/analytics rate limits; login brute-force throttling.
5. Commit the backend + wire CI (ruff/bandit/pip-audit/pytest on Linux, where mypy+coverage also run).

**Soon after:**
6. Missing FK/reverse indexes, bulk UPDATEs, statement timeouts, token purge job.
7. Money → `Numeric`; CHECK constraints; body-size limit alignment.
8. Shorter access-token lifetime + refresh revocation on password change.

**Optional hardening:** `/health` gating, docs already gated, black repo-wide, `lazy="raise_on_sql"`, password-strength enforcement, email-verification enforcement.

## 13. Final Recommendation

**Conditional GO.** The two exploitable authorization holes are closed and all tests pass. Complete the "Before launch" list (none require architectural change — they are configuration, dependency, and migration work) and re-run the toolchain on Linux CI. At that point the backend is production-ready.
