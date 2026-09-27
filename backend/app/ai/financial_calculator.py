"""Pure Decimal Financial Calculator for Amnaya AI Sales Consultant."""

from __future__ import annotations

import math
from decimal import Decimal, ROUND_HALF_UP
from typing import Any

from app.core.exceptions import ValidationException
from app.schemas.financial import (
    FinancialCalculationResult,
    FinancialCalculationType,
    FinancialRequest,
    FinancialScenarioComparison,
)


class FinancialCalculator:
    """Deterministic financial calculator operating exclusively with Decimal precision."""

    @staticmethod
    def parse_amount(val: float | str | Decimal | None) -> Decimal:
        """Parse natural language currency strings (e.g. '3 Cr', '75 Lakh') or numeric inputs into Decimal."""
        if val is None:
            return Decimal("0")
        if isinstance(val, Decimal):
            return val
        if isinstance(val, (int, float)):
            return Decimal(str(val))

        s = str(val).strip().lower().replace(",", "").replace("₹", "").replace("inr", "").strip()
        if not s:
            return Decimal("0")

        # Parse Cr / Crore / Lakh / L
        if "cr" in s or "crore" in s:
            clean = s.replace("crore", "").replace("cr", "").strip()
            return Decimal(clean) * Decimal("10000000")
        if "lakh" in s or "l" in s:
            clean = s.replace("lakh", "").replace("l", "").strip()
            return Decimal(clean) * Decimal("100000")

        return Decimal(s)

    def calculate(self, request: FinancialRequest) -> FinancialCalculationResult:
        """Execute deterministic financial calculation based on request payload."""
        price = self.parse_amount(request.property_price)
        if price <= 0:
            price = Decimal("25000000")  # Default ₹2.5 Cr if unprovided

        down = Decimal("0")
        if request.down_payment is not None:
            down = self.parse_amount(request.down_payment)
        elif request.down_payment_percentage is not None:
            pct = Decimal(str(request.down_payment_percentage))
            down = (price * pct / Decimal("100")).quantize(Decimal("1."), rounding=ROUND_HALF_UP)
        else:
            down = (price * Decimal("0.20")).quantize(Decimal("1."), rounding=ROUND_HALF_UP)  # Default 20% down payment

        # Validation
        if price <= Decimal("0"):
            raise ValidationException("Property price must be greater than zero.", error_code="invalid_price")
        if down < Decimal("0"):
            raise ValidationException("Down payment cannot be negative.", error_code="invalid_down_payment")
        if down > price:
            raise ValidationException("Down payment cannot exceed total property price.", error_code="excessive_down_payment")
        if request.interest_rate < 0:
            raise ValidationException("Interest rate cannot be negative.", error_code="invalid_interest_rate")
        if request.tenure_years <= 0:
            raise ValidationException("Loan tenure must be at least 1 year.", error_code="invalid_tenure")

        loan = price - down
        down_pct = float((down / price * Decimal("100")).quantize(Decimal("0.1"), rounding=ROUND_HALF_UP))
        ltv = float((loan / price * Decimal("100")).quantize(Decimal("0.1"), rounding=ROUND_HALF_UP))

        rate = Decimal(str(request.interest_rate))
        tenure_months = request.tenure_years * 12

        # EMI Calculation
        if rate == Decimal("0"):
            monthly_emi = (loan / Decimal(str(tenure_months))).quantize(Decimal("1."), rounding=ROUND_HALF_UP)
        else:
            # R = annual_rate / 12 / 100
            monthly_r = rate / Decimal("12") / Decimal("100")
            compound = (Decimal("1") + monthly_r) ** tenure_months
            monthly_emi = (loan * monthly_r * compound / (compound - Decimal("1"))).quantize(Decimal("1."), rounding=ROUND_HALF_UP)

        total_repayment = (monthly_emi * Decimal(str(tenure_months))).quantize(Decimal("1."), rounding=ROUND_HALF_UP)
        total_interest = total_repayment - loan

        income_dec = self.parse_amount(request.monthly_income)
        income_float = float(income_dec) if income_dec > 0 else None
        emi_income_ratio: float | None = None
        if income_dec > Decimal("0"):
            emi_income_ratio = float((monthly_emi / income_dec * Decimal("100")).quantize(Decimal("0.1"), rounding=ROUND_HALF_UP))

        assumptions = [
            f"Assumed annual interest rate of {request.interest_rate}%",
            f"Standard reducing-balance tenure of {request.tenure_years} years ({tenure_months} months)",
            f"Down payment of {down_pct}% (₹{float(down):,.0f})",
        ]

        warnings = [
            "Estimates exclude lender processing fees, stamp duty, registration, and bank eligibility policies.",
            "Final loan approval and interest rates depend on individual bank credit underwriting.",
        ]

        return FinancialCalculationResult(
            calculation_type=request.calculation_type,
            property_price=float(price),
            down_payment=float(down),
            down_payment_percentage=down_pct,
            loan_amount=float(loan),
            interest_rate=request.interest_rate,
            tenure_years=request.tenure_years,
            monthly_emi=float(monthly_emi),
            total_interest=float(total_interest),
            total_repayment=float(total_repayment),
            ltv_percentage=ltv,
            monthly_income=income_float,
            emi_to_income_ratio=emi_income_ratio,
            assumptions=assumptions,
            warnings=warnings,
        )

    def compare_scenarios(self, base_request: FinancialRequest) -> FinancialScenarioComparison:
        """Generate scenario comparison matrix for different down payments and tenures."""
        base = self.calculate(base_request)
        scenarios: list[dict[str, Any]] = []

        price_dec = Decimal(str(base.property_price))

        # Scenario 1: 15-year tenure
        req_15 = base_request.model_copy(update={"tenure_years": 15})
        res_15 = self.calculate(req_15)
        scenarios.append({
            "name": "15-Year Tenure",
            "tenure_years": 15,
            "down_payment": res_15.down_payment,
            "monthly_emi": res_15.monthly_emi,
            "total_interest": res_15.total_interest,
            "tradeoff": "Higher monthly payment, but saves total interest.",
        })

        # Scenario 2: 25-year tenure
        req_25 = base_request.model_copy(update={"tenure_years": 25})
        res_25 = self.calculate(req_25)
        scenarios.append({
            "name": "25-Year Tenure",
            "tenure_years": 25,
            "down_payment": res_25.down_payment,
            "monthly_emi": res_25.monthly_emi,
            "total_interest": res_25.total_interest,
            "tradeoff": "Lower monthly EMI, but higher long-term interest cost.",
        })

        # Scenario 3: Higher Down Payment (30%)
        req_30 = base_request.model_copy(update={"down_payment_percentage": 30.0})
        res_30 = self.calculate(req_30)
        scenarios.append({
            "name": "30% Down Payment",
            "tenure_years": base_request.tenure_years,
            "down_payment": res_30.down_payment,
            "monthly_emi": res_30.monthly_emi,
            "total_interest": res_30.total_interest,
            "tradeoff": "Reduces total borrowing & lowers monthly EMI burden.",
        })

        rec = (
            f"Choosing a 20-year tenure at {base_request.interest_rate}% strikes an optimal balance between manageable monthly cash flow "
            f"(₹{base.monthly_emi:,.0f}/mo) and reasonable interest costs."
        )

        return FinancialScenarioComparison(
            base_result=base,
            scenarios=scenarios,
            recommendation=rec,
        )
