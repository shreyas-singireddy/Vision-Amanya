# FINANCIAL ASSISTANT & CALCULATOR SUBSYSTEM — PHASE 7.7

> **Phase Status:** Completed ✅
> **Test Pass Rate:** 100% (99 / 99 backend tests passed)
> **Financial Precision:** Pure `Decimal` Arithmetic for EMI & Repayment
> **LLM Math Policy:** LLM Math Execution **DISABLED**; Backend Grounding **ENFORCED**
> **Validation:** Strict Property Price, Down Payment & Interest Rate Bounds
> **Latency:** < 10ms

---

## 1. Subsystem Architecture

```text
USER FINANCIAL PROMPT ("For a ₹3 Cr residence with ₹75L down payment, what is my EMI?")
              │
              ▼
   FINANCIAL PARAMETER EXTRACTION (`IntentEngine`)
              │
              ▼
   POSTGRESQL UNIT PRICE RESOLUTION (`AIOrchestrator`)
              │
              ▼
   DETERMINISTIC DECIMAL CALCULATOR (`FinancialCalculator`)
  (Reducing-Balance EMI Math, Loan Amount, LTV %, Total Interest, Total Repayment)
              │
              ▼
   GROUNDED LLM EXPLANATION & SUGGESTED ACTIONS
              │
              ▼
   FRONTEND FINANCIAL CALCULATOR & RESULT CARD (`FinancialCalculator.tsx`)
```

---

## 2. Reducing-Balance EMI Formula

```text
P = Principal Loan Amount (Property Price - Down Payment)
R = Monthly Interest Rate (Annual Rate / 12 / 100)
N = Loan Tenure in Months (Tenure Years × 12)

EMI = P × R × (1 + R)^N / ((1 + R)^N - 1)
```

---

## 3. Operational API Endpoint

```bash
POST /api/v1/ai/financial/calculate
Content-Type: application/json

{
  "calculation_type": "emi",
  "property_price": "30000000",
  "down_payment": "7500000",
  "interest_rate": 8.5,
  "tenure_years": 20
}
```

---

## 4. Test Execution Command

```bash
.venv\Scripts\pytest tests/test_financial_assistant.py tests/test_unit_visualization.py tests/test_unit_comparison.py tests/test_recommendation_conversation.py tests/test_recommendations.py tests/test_intent.py tests/test_rag.py tests/test_knowledge.py tests/test_ai.py
```
