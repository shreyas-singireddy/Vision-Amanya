"""Pydantic schemas for the Deterministic Financial Assistant subsystem."""

from __future__ import annotations

import uuid
from enum import Enum
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class FinancialCalculationType(str, Enum):
    """Supported financial calculation types."""

    EMI = "emi"
    LOAN_AMOUNT = "loan_amount"
    DOWN_PAYMENT = "down_payment"
    AFFORDABILITY = "affordability"
    TOTAL_INTEREST = "total_interest"
    TOTAL_REPAYMENT = "total_repayment"
    LTV = "ltv"
    SCENARIO_COMPARISON = "scenario_comparison"


class FinancialRequest(BaseModel):
    """Payload for POST /api/v1/ai/financial/calculate."""

    calculation_type: FinancialCalculationType = FinancialCalculationType.EMI
    property_price: float | str | None = Field(None, description="Property price in INR (e.g. 25000000 or '2.5 Cr')")
    unit_id: str | None = None
    unit_number: str | None = None
    down_payment: float | str | None = None
    down_payment_percentage: float | None = Field(None, ge=0.0, le=100.0)
    loan_amount: float | str | None = None
    interest_rate: float = Field(8.5, ge=0.0, le=30.0, description="Annual interest rate percentage")
    tenure_years: int = Field(20, ge=1, le=40, description="Loan tenure in years")
    monthly_income: float | str | None = None
    existing_monthly_obligations: float | str | None = None
    processing_fee: float | str | None = None


class FinancialCalculationResult(BaseModel):
    """Authoritative result returned by the backend Financial Calculator."""

    model_config = ConfigDict(from_attributes=True)

    calculation_type: FinancialCalculationType
    property_price: float
    down_payment: float
    down_payment_percentage: float
    loan_amount: float
    interest_rate: float
    tenure_years: int
    monthly_emi: float
    total_interest: float
    total_repayment: float
    ltv_percentage: float
    monthly_income: float | None = None
    emi_to_income_ratio: float | None = None
    assumptions: list[str] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)


class FinancialScenarioComparison(BaseModel):
    """Matrix comparison of financial scenarios (e.g., varying down payments or tenures)."""

    base_result: FinancialCalculationResult
    scenarios: list[dict[str, Any]] = Field(default_factory=list)
    recommendation: str | None = None


class FinancialResponse(BaseModel):
    """Response returned by the Financial Assistant."""

    answer: str
    calculation: FinancialCalculationResult
    assumptions: list[str] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)
    suggested_actions: list[dict[str, Any]] = Field(default_factory=list)
