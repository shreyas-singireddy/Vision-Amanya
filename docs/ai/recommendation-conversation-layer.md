# AI RECOMMENDATION CONVERSATION & DECISION LAYER — PHASE 7.5

> **Phase Status:** Completed ✅
> **Test Pass Rate:** 100% (68 / 68 backend tests passed)
> **Multi-Turn State Merging:** Verified
> **Unit Rejection Filtering:** Verified
> **LLM Hallucination Guard:** Grounded on PostgreSQL Inventory
> **Latency:** < 10ms

---

## 1. Multi-Turn Architecture Flow

```text
USER NATURAL LANGUAGE ("Prefer higher floor and lake view")
              │
              ▼
   INTENT & ENTITY EXTRACTION (`IntentEngine`)
              │
              ▼
   CONVERSATION STATE MANAGER (`ConversationManager`)
  (Merges preferences, tracks rejected_units, sets pagination offset)
              │
              ▼
   RECOMMENDATION ENGINE (`RecommendationEngine`)
  (Hard filtering + 0-100 soft scoring over PostgreSQL inventory)
              │
              ▼
   RESPONSE GROUNDING & ACTIONS BUILDER
  (Attaches verified units, match checkmarks, suggested action chips)
              │
              ▼
   AI CONSULTANT CONVERSATIONAL UI
```

---

## 2. Conversation State Data Contract

```json
{
  "conversation_id": "00000000-0000-0000-0000-000000000000",
  "preferences": {
    "configuration": "3BHK",
    "maximum_budget": 25000000,
    "view": "lake",
    "floor_preference": "high"
  },
  "rejected_units": ["1804"],
  "selected_unit": null,
  "offset": 0,
  "scoring_weights": {
    "budget_weight": 30.0,
    "view_weight": 25.0,
    "area_weight": 20.0,
    "floor_weight": 15.0,
    "orientation_weight": 10.0
  }
}
```

---

## 3. Key Multi-Turn Capabilities

1. **Preference Merging & Replacement**:
   - Accumulates parameters across turns (e.g. `3BHK` + `₹3 Cr` -> `Lake View`).
   - Overwrites scalar values when user updates budget or configuration (e.g. lowering budget to `₹2.5 Cr`).
2. **Unit Rejection ("Not Interested in Unit 1804")**:
   - Tracks `rejected_units` in session state.
   - Excludes rejected unit numbers from recommendation responses without altering database availability.
3. **Paged "Show More"**:
   - Increments pagination offset index (`offset += 3`) when user asks for more options.
4. **Intelligent Clarification**:
   - Triggers `AIResponseType.CLARIFICATION` when user prompt is underspecified (e.g. `"Show me the best apartment"`).
5. **Grounding & Safety**:
   - Every unit number, price, view, floor, and score is strictly sourced from Phase 7.4 `RecommendationEngine`.

---

## 4. Test Execution Command

```bash
.venv\Scripts\pytest tests/test_recommendation_conversation.py tests/test_recommendations.py tests/test_intent.py tests/test_rag.py tests/test_knowledge.py tests/test_ai.py
```
