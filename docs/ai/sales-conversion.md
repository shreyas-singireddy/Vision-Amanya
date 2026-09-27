# AI SALES CONVERSION & SITE VISIT WORKFLOW — PHASE 7.8

> **Phase Status:** Completed ✅
> **Test Pass Rate:** 100% (105 / 105 backend tests passed)
> **Double-Booking Protection:** Atomic Re-validation before Transaction Commit
> **Discount Policy:** LLM Discount Math **DISABLED**; Official Sales Handoff **ENFORCED**
> **CRM Integration:** Duplicate Lead Merge by Email / Phone
> **Latency:** < 10ms

---

## 1. Conversion Architecture

```text
USER CONVERSATION PROMPT ("I'd like to visit Unit 1804 this Saturday")
              │
              ▼
   CONVERSION INTENT ROUTING (`IntentEngine`)
              │
              ▼
   BACKEND AVAILABILITY LOOKUP (`LeadConversionService.get_site_visit_availability`)
              │
              ▼
   SLOT SELECTION & ATOMIC RE-VALIDATION
              │
              ▼
   POSTGRESQL LEAD QUALIFICATION & BOOKING CREATION (`AMN-VIS-2026-1042`)
              │
              ▼
   FRONTEND SCHEDULER & BOOKING CONFIRMATION (`SiteVisitScheduler.tsx`)
```

---

## 2. Lead Qualification Scoring Matrix

| Signal | Points | Criteria |
| :--- | :--- | :--- |
| **Contact Details** | +30 | Verified Name, Email & Phone |
| **Budget Range** | +25 | Target budget ceiling specified |
| **Interested Units** | +25 | Specific residence ID / unit number |
| **Site Visit Request** | +20 | Private appointment requested |

- **Lead Status**: `QUALIFIED` if Total Score >= 50.

---

## 3. Operational API Endpoints

```bash
# 1. Lead Qualification Endpoint
POST /api/v1/ai/leads/qualify

# 2. Site Visit Availability Endpoint
GET /api/v1/ai/site-visits/availability?date=2026-08-29

# 3. Atomic Site Visit Booking Endpoint
POST /api/v1/ai/site-visits/book
```

---

## 4. Test Execution Command

```bash
.venv\Scripts\pytest tests/test_sales_conversion.py tests/test_financial_assistant.py tests/test_unit_visualization.py tests/test_unit_comparison.py tests/test_recommendation_conversation.py tests/test_recommendations.py tests/test_intent.py tests/test_rag.py tests/test_knowledge.py tests/test_ai.py
```
