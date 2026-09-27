# AI ORCHESTRATOR & INTENT DETECTION SPECIFICATION — PHASE 7.3

> **Phase Status:** Completed ✅
> **Controlled Intents:** 21 Taxonomy Categories
> **Intent Classification Accuracy:** >= 95%
> **Entity Extraction Accuracy:** >= 95%

---

## 1. End-to-End Orchestrator Flow

```text
USER MESSAGE + MULTI-TURN HISTORY
              │
              ▼
        INTENT ENGINE
(Taxonomy Classification & Confidence)
              │
              ▼
   ENTITY & PREFERENCE EXTRACTOR
 (Budget INR Normalizer & Area SqFt Normalizer)
              │
              ▼
      MULTI-TURN ACCUMULATOR
 (Combines Preferences Across Turn History)
              │
              ▼
       AI ORCHESTRATOR ROUTER
              │
  ┌───────────┼───────────┬───────────┐
  ▼           ▼           ▼           ▼
 RAG      PROPERTY     OUT-OF-SCOPE  CLARIFICATION
 (7.2)    DATA (7.4)   REDIRECTION    RESPONSE
```

---

## 2. Controlled Intent Taxonomy (21 Intents)

| Intent Tag | Category | Handler |
| :--- | :--- | :--- |
| `project_information` | Knowledge | RAG Retriever (`ai_knowledge_items`) |
| `location_information` | Knowledge | RAG Retriever |
| `amenity_information` | Knowledge | RAG Retriever |
| `specification_information` | Knowledge | RAG Retriever |
| `unit_search` | Property Data | Property Service / Unit Search |
| `unit_recommendation` | Recommendation | Phase 7.4 Unit Recommendation Service |
| `unit_details` | Property Data | Property Service |
| `unit_comparison` | Comparison | Phase 7.5 Comparison Service |
| `floor_plan_information` | Floor Plan | Interactive Floor Plan Viewer |
| `floor_plan_navigation` | Floor Plan | Navigation Router |
| `pricing_information` | Pricing | RAG + Verified Property Price Sheet |
| `availability_information` | Inventory | Real-Time Unit Availability Registry |
| `investment_information` | Finance | RAG |
| `financing_information` | Finance | Financial Service |
| `emi_calculation` | Finance | EMI Calculator |
| `site_visit` | Lead / Visit | Site Visit Booking Flow |
| `lead_capture` | Lead / Visit | Sales Callback / Lead Flow |
| `human_handoff` | Sales Handoff | Human Relationship Manager Handoff |
| `general_conversation` | Dialogue | AI Provider Dialogue Generator |
| `unsupported_request` | Guardrail | Amnaya Focus Redirection |
| `unknown` | Fallback | Clarification Engine |

---

## 3. Budget & Area Normalization Engine

### Budget Normalization Rules

| User Input String | Normalized Representation |
| :--- | :--- |
| `"under 3 crore"` / `"under ₹3 cr"` | `maximum_budget = 30000000.0` (INR) |
| `"around 2.5 crore"` / `"250 lakhs"` | `budget = 25000000.0` (INR) |
| `"between 2 and 3 crore"` | `minimum_budget = 20000000.0`, `maximum_budget = 30000000.0` |

### Area Normalization Rules

| User Input String | Normalized Representation |
| :--- | :--- |
| `"around 2000 sq ft"` / `"2000 sqft"` | `area = 2000.0` (sq ft) |
| `"at least 2200 sqft"` | `minimum_area = 2200.0` (sq ft) |
| `"between 1800 and 2500 sqft"` | `minimum_area = 1800.0`, `maximum_area = 2500.0` |

---

## 4. Evaluation Benchmarks

```text
Intent Classification Accuracy: 97.6% (41/42)
Entity Extraction Accuracy: 100.0%
Routing Accuracy: 100.0%
Clarification Accuracy: 100.0%
```
