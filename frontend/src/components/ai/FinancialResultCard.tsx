"use client";

import React from "react";
import { Calculator, Sparkles, Check } from "lucide-react";

export interface FinancialResultCardProps {
  propertyPrice: number;
  downPayment: number;
  loanAmount: number;
  interestRate: number;
  tenureYears: number;
  monthlyEmi: number;
  totalInterest: number;
  totalRepayment: number;
  ltvPercentage: number;
  assumptions?: string[];
  warnings?: string[];
  onAdjust?: () => void;
}

export function FinancialResultCard({
  propertyPrice,
  downPayment,
  loanAmount,
  interestRate,
  tenureYears,
  monthlyEmi,
  totalInterest,
  totalRepayment,
  ltvPercentage,
  assumptions = [],
  warnings = [],
  onAdjust,
}: FinancialResultCardProps) {
  const formatPrice = (p: number) =>
    p >= 10000000 ? `₹${(p / 10000000).toFixed(2)} Cr` : `₹${(p / 100000).toFixed(2)} L`;

  return (
    <div className="my-3 rounded-xl border border-neutral-800 bg-neutral-900/90 p-4 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
        <h4 className="font-serif text-base font-bold text-neutral-100 flex items-center gap-2">
          <Calculator className="h-4 w-4 text-accent-400" />
          Verified Financial Calculation
        </h4>
        <span className="text-xs text-neutral-400 font-mono">{interestRate}% • {tenureYears} Yrs</span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
        <div className="rounded-lg bg-neutral-950 p-3 border border-neutral-800">
          <span className="text-neutral-400 block text-[11px]">Monthly EMI</span>
          <span className="font-serif text-lg font-bold text-accent-300">₹{Math.round(monthlyEmi).toLocaleString()}</span>
        </div>
        <div className="rounded-lg bg-neutral-950 p-3 border border-neutral-800">
          <span className="text-neutral-400 block text-[11px]">Loan Amount</span>
          <span className="font-serif text-base font-semibold text-neutral-200">{formatPrice(loanAmount)} ({ltvPercentage}% LTV)</span>
        </div>
      </div>

      <div className="mt-3 text-xs text-neutral-300 space-y-1 border-t border-neutral-800 pt-2.5">
        <div className="flex justify-between">
          <span className="text-neutral-400">Total Interest Payable:</span>
          <span className="font-medium text-neutral-200">{formatPrice(totalInterest)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-400">Total Repayment Amount:</span>
          <span className="font-medium text-neutral-200">{formatPrice(totalRepayment)}</span>
        </div>
      </div>

      {assumptions.length > 0 && (
        <div className="mt-3 space-y-1 text-[11px] text-neutral-400">
          {assumptions.map((a, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <Check className="h-3 w-3 text-primary-400" />
              <span>{a}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
