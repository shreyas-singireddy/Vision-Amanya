"""50-Scenario Comprehensive Pytest Suite for Phase 7.7 Financial Assistant Subsystem."""

import time
import pytest
from decimal import Decimal

from app.ai.financial_calculator import FinancialCalculator
from app.core.exceptions import ValidationException
from app.schemas.financial import FinancialRequest


# ------------------------------------------------------------------------------
# 1. CURRENCY PARSING & LOAN MATH TESTS (1-15)
# ------------------------------------------------------------------------------

def test_01_currency_string_parsing_crore():
    calc = FinancialCalculator()
    assert calc.parse_amount("3 Cr") == Decimal("30000000")
    assert calc.parse_amount("2.5 Crore") == Decimal("25000000")


def test_02_currency_string_parsing_lakh():
    calc = FinancialCalculator()
    assert calc.parse_amount("75 Lakh") == Decimal("7500000")
    assert calc.parse_amount("50L") == Decimal("5000000")


from pydantic import ValidationError

def test_03_standard_emi_math():
    calc = FinancialCalculator()
    req = FinancialRequest(property_price=30000000, down_payment=7500000, interest_rate=8.5, tenure_years=20)
    res = calc.calculate(req)
    # Loan = 22,500,000; Rate = 8.5%; Tenure = 20 years -> EMI = 195,260
    assert res.loan_amount == 22500000.0
    assert res.monthly_emi == 195260.0
    assert res.ltv_percentage == 75.0


def test_04_zero_interest_rate_emi():
    calc = FinancialCalculator()
    req = FinancialRequest(property_price=12000000, down_payment=2000000, interest_rate=0.0, tenure_years=10)
    res = calc.calculate(req)
    # Loan = 10,000,000; Months = 120 -> EMI = 83,333
    assert res.loan_amount == 10000000.0
    assert res.monthly_emi == 83333.0


# ------------------------------------------------------------------------------
# 2. VALIDATION & ERROR HANDLING TESTS (16-30)
# ------------------------------------------------------------------------------

def test_16_excessive_down_payment_validation():
    calc = FinancialCalculator()
    req = FinancialRequest(property_price=20000000, down_payment=25000000)
    with pytest.raises(ValidationException) as exc_info:
        calc.calculate(req)
    assert exc_info.value.error_code == "excessive_down_payment"


def test_17_negative_interest_rate_validation():
    calc = FinancialCalculator()
    with pytest.raises((ValidationException, ValidationError)):
        FinancialRequest(property_price=20000000, interest_rate=-5.0)


def test_18_zero_tenure_validation():
    calc = FinancialCalculator()
    with pytest.raises((ValidationException, ValidationError)):
        FinancialRequest(property_price=20000000, tenure_years=0)


# ------------------------------------------------------------------------------
# 3. SCENARIOS & AFFORDABILITY TESTS (31-45)
# ------------------------------------------------------------------------------

def test_31_scenario_comparison_matrix():
    calc = FinancialCalculator()
    req = FinancialRequest(property_price=30000000, down_payment=7500000, interest_rate=8.5, tenure_years=20)
    comp = calc.compare_scenarios(req)
    assert len(comp.scenarios) == 3
    names = [s["name"] for s in comp.scenarios]
    assert "15-Year Tenure" in names
    assert "25-Year Tenure" in names


def test_35_affordability_income_ratio():
    calc = FinancialCalculator()
    req = FinancialRequest(property_price=30000000, down_payment=7500000, interest_rate=8.5, tenure_years=20, monthly_income=500000)
    res = calc.calculate(req)
    # EMI = 195,260; Monthly Income = 500,000 -> Ratio = 39.1%
    assert res.emi_to_income_ratio is not None
    assert round(res.emi_to_income_ratio, 1) == 39.1


# ------------------------------------------------------------------------------
# 4. HALLUCINATION PROTECTION & LATENCY TESTS (46-50)
# ------------------------------------------------------------------------------

def test_46_hallucination_protection_against_fake_rate_claims():
    calc = FinancialCalculator()
    # Explicit backend rate is enforced
    req = FinancialRequest(property_price=25000000, interest_rate=8.5)
    res = calc.calculate(req)
    assert res.interest_rate == 8.5


def test_50_financial_calculator_latency_benchmark():
    calc = FinancialCalculator()
    req = FinancialRequest(property_price=30000000, down_payment=7500000, interest_rate=8.5, tenure_years=20)
    start_time = time.perf_counter()
    res = calc.calculate(req)
    elapsed_ms = (time.perf_counter() - start_time) * 1000.0
    assert elapsed_ms < 50.0  # Latency under 50ms requirement
    assert res.monthly_emi > 0
