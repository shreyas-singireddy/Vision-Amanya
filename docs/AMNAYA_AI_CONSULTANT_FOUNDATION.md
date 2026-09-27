# AMNAYA AI CONSULTANT FOUNDATION — PHASE 6.6 SPECIFICATION

> **Status:** Completed ✅
> **Last Updated:** 2026-08-25

---

## 1. Executive Overview

Phase 6.6 establishes the production-grade architecture, API contracts, persistence layer, AI orchestrator & provider abstractions, guardrail boundaries, and luxury UI experience for the **Vision Amnaya AI Property Consultant**.

This foundation is designed to seamlessly integrate with Phase 7 RAG (Retrieval-Augmented Generation), vector databases (Chroma/FAISS), LangChain agent tool-calling, and live LLM model providers without modifying the frontend or API router contracts.

---

## 2. Conceptual Architecture

```
[ Frontend: AIConsultantWidget / AIConsultantTrigger ]
                      ↓
        [ Zustand: useAssistantStore ]
                      ↓
        [ Service: AssistantService ]
                      ↓
         [ FastAPI: POST /api/v1/ai/chat ]
                      ↓
       [ AIService (DB Sessions / Messages) ]
                      ↓
        [ AIOrchestrator (Intent Router) ]
                      ↓
  [ Guardrails: AIGuardrails (Fact Checking) ]
                      ↓
  [ Provider: BaseAIProvider / ConfigurableAIProvider ]
                      ↓
    (Phase 7: Vector DB RAG + LLM Agent Tool Routing)
```

---

## 3. Backend API Contracts

### `POST /api/v1/ai/chat`
Sends a user query with contextual page/residence parameters and returns a structured AI response.

**Request Schema (`AIChatRequest`):**
```json
{
  "conversation_id": "00000000-0000-0000-0000-000000000000",
  "message": "Can you recommend a 3 BHK residence with lake view?",
  "context": {
    "current_page": "/residences",
    "current_unit_id": "1804",
    "current_project_id": "vision-amanya"
  },
  "guest_id": "guest_abc123"
}
```

**Response Schema (`AIStructuredResponse`):**
```json
{
  "conversation_id": "00000000-0000-0000-0000-000000000000",
  "message": "Based on your interest in luxury living at Amnaya, here are our recommended 3 BHK Lake-Facing Residences:",
  "response_type": "unit_recommendation",
  "intent": "unit_recommendation",
  "confidence": 0.95,
  "citations": [
    {
      "document_title": "Amnaya Master Plan & Inventory",
      "snippet": "Tower A 10th floor offers 180-degree views across Osman Sagar lake."
    }
  ],
  "suggested_actions": [
    {
      "label": "Explore Residence 1804",
      "action_type": "navigate",
      "payload": { "url": "/residences/residence-1804" }
    }
  ],
  "units": [
    {
      "unit_number": "1804",
      "typology": "3 BHK Type B",
      "tower": "Tower A",
      "floor": 10,
      "view": "Lake View",
      "area_sqft": 2100
    }
  ]
}
```

---

## 4. Usage Modes & Entry Points

1. **Global Consultant (`mode="global"`)**: Persistent floating "Ask Amnaya" pill on all marketing pages.
2. **Unit Context (`mode="unit"`)**: Residence page button "Ask AI about this residence" injecting `current_unit_id`.
3. **Floor Plan Context (`mode="floor_plan"`)**: Interactive floor plan experience button "Ask about this floor plan" injecting `floor_plan_metadata`.

---

## 5. Security & Fact Validation Guardrails

- **AIGuardrails**: Intercepts queries and responses to verify that prices, unit numbers, possession dates, RERA statuses, and dimensions match official project guidelines.
- **Prohibited Terms**: Rejects prompts attempting to negotiate unverified discounts, false ROI guarantees, or unauthorized commitments.
- **Session Ownership**: Validates session `user_id` or `guest_id` preventing unauthorized conversation access.
