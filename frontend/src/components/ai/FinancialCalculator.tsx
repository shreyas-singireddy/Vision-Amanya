"use client";

import React, { useState } from "react";
import { Calculator, DollarSign, Percent, Clock, AlertCircle } from "lucide-react";

export interface FinancialCalculatorProps {
  initialPrice?: number;
  initialDownPayment?: number;
  initialRate?: number;
  initialTenure?: number;
  onCalculate?: (result: any) => void;
}

export function FinancialCalculator({
  initialPrice = 25000000,
  initialDownPayment = 5000000,
  initialRate = 8.5,
  initialTenure = 20,
  onCalculate,
}: FinancialCalculatorProps) {
  const [price, setPrice] = useState<number>(initialPrice);
  const [downPayment, setDownPayment] = useState<number>(initialDownPayment);
  const [rate, setRate] = useState<number>(initialRate);
  const [tenure, setTenure] = useState<number>(initialTenure);

  // Deterministic client-side EMI calculation matching backend formula
  const loanAmount = Math.max(0, price - downPayment);
  const monthlyRate = rate / 12 / 100;
  const tenureMonths = tenure * 12;

  const emi =
    rate === 0
      ? loanAmount / tenureMonths
      : (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
        (Math.pow(1 + monthlyRate, tenureMonths) - 1);

  const totalRepayment = emi * tenureMonths;
  const totalInterest = Math.max(0, totalRepayment - loanAmount);
  const ltv = price > 0 ? (loanAmount / price) * 100 : 0;

  const formatPrice = (p: number) =>
    p >= 10000000 ? `₹${(p / 10000000).toFixed(2)} Cr` : `₹${(p / 100000).toFixed(2)} L`;

  return (
    <div className="my-4 rounded-xl border border-neutral-800 bg-neutral-900/95 p-5 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
        <h3 className="font-serif text-lg font-semibold text-neutral-100 flex items-center gap-2">
          <Calculator className="h-4 w-4 text-accent-400" />
          Amnaya Residence Home Loan Calculator
        </h3>
        <span className="text-xs text-neutral-400">Indicative Estimate</span>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Controls */}
        <div className="space-y-3 text-xs text-neutral-300">
          <div>
            <label className="block mb-1 font-medium text-neutral-300">Residence Price ({formatPrice(price)})</label>
            <input
              type="range"
              min={15000000}
              max={50000000}
              step={500000}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full accent-accent-500"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-neutral-300">Down Payment ({formatPrice(downPayment)})</label>
            <input
              type="range"
              min={1000000}
              max={price * 0.5}
              step={500000}
              value={downPayment}
              onChange={(e) => setDownPayment(Number(e.target.value))}
              className="w-full accent-accent-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block mb-1 font-medium text-neutral-300">Interest Rate (%)</label>
              <input
                type="number"
                step="0.1"
                min="5"
                max="15"
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                className="w-full rounded-md border border-neutral-800 bg-neutral-950 px-2.5 py-1.5 text-neutral-200"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-neutral-300">Tenure (Years)</label>
              <input
                type="number"
                min="5"
                max="30"
                value={tenure}
                onChange={(e) => setTenure(Number(e.target.value))}
                className="w-full rounded-md border border-neutral-800 bg-neutral-950 px-2.5 py-1.5 text-neutral-200"
              />
            </div>
          </div>
        </div>

        {/* Breakdown Card */}
        <div className="flex flex-col justify-between rounded-lg border border-neutral-800 bg-neutral-950 p-4">
          <div>
            <span className="text-xs text-neutral-400 block">Estimated Monthly EMI</span>
            <div className="font-serif text-2xl font-bold text-accent-300 mt-1">
              ₹{Math.round(emi).toLocaleString()}<span className="text-xs text-neutral-400 font-sans font-normal"> / month</span>
            </div>
          </div>

          <div className="mt-3 space-y-1.5 text-xs text-neutral-300 border-t border-neutral-800/80 pt-3">
            <div className="flex justify-between">
              <span className="text-neutral-400">Loan Amount:</span>
              <span className="font-medium text-neutral-200">{formatPrice(loanAmount)} ({ltv.toFixed(1)}% LTV)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Total Interest:</span>
              <span className="font-medium text-neutral-200">{formatPrice(totalInterest)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Total Repayment:</span>
              <span className="font-medium text-neutral-200">{formatPrice(totalRepayment)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-[11px] text-neutral-400">
        <AlertCircle className="h-3.5 w-3.5 text-neutral-500 flex-shrink-0" />
        <span>Estimates exclude processing fees & stamp duty. Final loan approval depends on bank credit policies.</span>
      </div>
    </div>
  );
}
