# Website-Wide AI Integration Architecture — Amnaya

## System Architecture

Phase 8.0 transforms Amnaya's AI Assistant from an isolated chat widget into a production-ready, website-wide contextual AI layer embedded across all pages and interactive components.

```text
Visitor Navigation (Homepage / Residence / Unit / Location / Pricing / 3D)
   ↓
AIContextProvider (React Context Provider & Route Listener)
   ↓
Contextual CTA Buttons (AskAmnaya / ContextualAIButton)
   ↓
AIChatDrawer (Slide-Over Dialogue, Citations & Actions)
   ↓
POST /api/v1/ai/chat
   ↓
ContextResolver (PostgreSQL Verified Entity Authority Engine)
   ↓
AI Orchestrator & RAG Retriever
   ↓
LLM Explanation & Validated Actions
   ↓
Frontend Action Dispatcher (VIEW_UNIT, COMPARE_UNITS, SCHEDULE_SITE_VISIT, REQUEST_HUMAN)
```

---

## Context Model Hierarchy

1. **PostgreSQL Verified Data**: Authoritative entity records (`Property`, `Project`, `Booking`, `SalesHandoff`).
2. **Approved Knowledge Base**: RAG vector database & chunks (`VERIFIED_AMNAYA_FACTS`).
3. **Deterministic Calculation Engines**: `FinancialCalculator` (Decimal EMI & tenure schedules).
4. **Structured Recommendation & Comparison Engines**: `RecommendationEngine` & `UnitComparisonEngine`.
5. **Conversation Context**: Session history & past message turns.
6. **LLM Natural Language Explanation**: Generates clear, non-hallucinated explanations based on verified context.

---

## Frontend Architecture

### 1. `AIContextProvider` (`frontend/src/providers/AIContextProvider.tsx`)
- Exposes: `setAIContext()`, `getAIContext()`, `updateAIContext()`, `clearAIContext()`, `openDrawer()`, `closeDrawer()`, `sendQuery()`.
- Automatically synchronizes page type (`PROJECT`, `RESIDENCE`, `UNIT`, `FLOOR_PLAN`, `VIEW`, `LOCATION`, `PRICING`, `RECOMMENDATION`, `COMPARISON`, `FINANCIAL`, `SITE_VISIT`) upon Next.js route navigation without destroying active conversation thread.

### 2. Suggested Prompts Registry (`frontend/src/lib/ai/suggested-prompts.ts`)
- Centralized contextual prompt registry mapping specific questions to page contexts (e.g. Unit: *"What is the price?"*, Location: *"How far is the airport?"*, Financial: *"Calculate my EMI"*).

### 3. Action Dispatcher (`frontend/src/lib/ai/ai-actions.ts`)
- Maps validated backend action types (`VIEW_UNIT`, `VIEW_RESIDENCE`, `COMPARE_UNITS`, `SCHEDULE_SITE_VISIT`, `REQUEST_HUMAN`) to UI navigation and modal triggers.

### 4. Components
- `AskAmnaya.tsx`: Global luxury floating launcher button & hero entry CTA.
- `ContextualAIButton.tsx`: Embedded contextual CTA button for cards, hero sections, and detail panels.
- `AIChatDrawer.tsx`: Slide-over chat drawer displaying context header, dialogue history, citations, recommended units, contextual suggested prompts, and action buttons.

---

## Backend Context Resolver

`ContextResolver` (`backend/app/ai/context_resolver.py`) validates identifiers server-side:
- Resolves `unit_id`, `residence_id`, `project_id`, `floor_plan_id`, `location_id`, `selected_units`.
- Enforces unpublished inventory protection (unpublished units are blocked from being returned to clients).
- Injects authoritative unit prices and specs into prompt system snippets (`[CONTEXT SOURCE: UNIT]`).
- Prevents frontend price tampering: backend fetches verified unit records from PostgreSQL.

---

## Verification & Testing

- **Backend Test Suite**: `backend/tests/test_ai_context.py` (50 test scenarios).
- **Full Regression Test Suite**: `199 / 199 passed` across all AI backend test modules.
- **Frontend Typecheck**: `tsc --noEmit` verified 0 errors.
