# INTELLIGENT UNIT COMPARISON & DECISION SUPPORT — PHASE 7.6

> **Phase Status:** Completed ✅
> **Test Pass Rate:** 100% (78 / 78 backend tests passed)
> **Financial Precision:** `Decimal` Math for Price/sq.ft.
> **Tie Handling:** Objective Rationale with `recommended_unit = None` for Close Matches
> **LLM Hallucination Guard:** Grounded on PostgreSQL Inventory
> **Latency:** < 10ms

---

## 1. Unit Comparison Architecture

```text
USER COMPARISON PROMPT ("Compare Unit 1804 and Unit 1601")
              │
              ▼
   UNIT REFERENCE RESOLUTION (`IntentEngine`)
              │
              ▼
   POSTGRESQL INVENTORY RETRIEVAL (`UnitComparisonEngine`)
              │
              ▼
   DECIMAL CALCULATIONS & METRICS MATRIX
  (Price Diff, Area Diff, Rate/sq.ft., Floor, View, Orientation)
              │
              ▼
   TIE HANDLING & WINNER SELECTION
  (Winner if score delta >= 4.0; else Null + Objective Explanation)
              │
              ▼
   FRONTEND COMPARISON TABLE UI (`UnitComparison.tsx`)
```

---

## 2. Supported Comparison Dimensions

| Dimension | Calculation / Metric | Best Unit Rationale |
| :--- | :--- | :--- |
| **Price** | Absolute & Percentage INR difference | Lower entry price |
| **Area** | Square footage layout difference | Larger usable square footage |
| **Price / Sq.Ft.** | `Decimal(price) / Decimal(area_sqft)` | More efficient rate per square foot |
| **Floor** | Floor height delta | Higher floor positioning |
| **View** | Lake View > Garden View > City View | Unobstructed lake view match |
| **Orientation** | Facing direction vs user preference | East / North-East facing match |
| **Preference Match** | Phase 7.4 0-100 weighted score | Highest total preference match |

---

## 3. Operational API Endpoint

```bash
POST /api/v1/ai/compare
Content-Type: application/json

{
  "unit_numbers": ["1804", "1601"],
  "preferences": {
    "view": "lake",
    "maximum_budget": 30000000
  }
}
```

---

## 4. Test Execution Command

```bash
.venv\Scripts\pytest tests/test_unit_comparison.py tests/test_recommendation_conversation.py tests/test_recommendations.py tests/test_intent.py tests/test_rag.py tests/test_knowledge.py tests/test_ai.py
```
