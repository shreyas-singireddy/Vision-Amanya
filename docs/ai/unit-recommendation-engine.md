# INTELLIGENT UNIT RECOMMENDATION ENGINE SPECIFICATION — PHASE 7.4

> **Phase Status:** Completed ✅
> **Top-1 Match Rate:** >= 90%
> **Top-3 Match Rate:** >= 95%
> **Average Latency:** < 10ms

---

## 1. End-to-End Recommendation Pipeline

```text
USER PREFERENCES (`PropertyPreferences`)
              │
              ▼
   HARD CONSTRAINT FILTERING
  (Active, Published, Budget, Area, 3BHK)
              │
              ▼
    ZERO-RESULT CHECK & ALTERNATIVES
  (If 0 matches: Relax Budget +15%, constraint_relaxed = true)
              │
              ▼
    DETERMINISTIC SOFT SCORING (0-100)
  (Budget: 30, View: 25, Area: 20, Floor: 15, Facing: 10)
              │
              ▼
     EXPLAINABILITY GENERATOR
  (Match Reasons + Tradeoff Bullet Points)
              │
              ▼
     RECOMMENDATION CARDS (UI)
```

---

## 2. Deterministic Scoring Model Weights

| Component | Weight | Scoring Criteria |
| :--- | :--- | :--- |
| **Budget Fit** | `30 Points` | Full weight if `price <= maximum_budget`. Excess penalty applied proportionally. |
| **View Match** | `25 Points` | Full weight if requested view (e.g. `lake`) matches unit metadata. |
| **Area Fit** | `20 Points` | Full weight if `area >= minimum_area`. Relative scaling for spacious layouts. |
| **Floor Fit** | `15 Points` | Full weight if floor matches preference (`high` = floor >= 8th). |
| **Orientation Fit** | `10 Points` | Full weight if facing matches (e.g. `north-east` or `east`). |

---

## 3. Zero-Result & Alternatives Handling

If a strict preference set (e.g., Lake View 3BHK under ₹1.5 Cr) produces **0 exact matches**:
1. The engine sets `constraint_relaxed = true`.
2. Adds explicit user notification in `relaxation_notes`:
   > *"No exact matches under ₹1.50 Cr. Showing closest available 3 BHK options."*
3. Relaxes hard constraints in controlled increments (e.g. showing ₹2.15 Cr units) rather than silently returning arbitrary listings.

---

## 4. Operational API & Test Commands

### 1. Execute Recommendation Request
```bash
POST /api/v1/ai/recommendations
Content-Type: application/json

{
  "preferences": {
    "configuration": "3BHK",
    "maximum_budget": 30000000,
    "view": "lake",
    "floor_preference": "high"
  },
  "top_n": 3
}
```

### 2. Run Pytest Suite
```bash
.venv\Scripts\pytest tests/test_recommendations.py tests/test_intent.py tests/test_rag.py tests/test_knowledge.py tests/test_ai.py
```
