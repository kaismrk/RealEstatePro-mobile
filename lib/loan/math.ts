// lib/loan/math.ts
// Pure math helpers for the loan simulator.
// All functions are side-effect-free and exported for unit testing.

import type { LoanCostRate } from './config';

/**
 * Standard annuity (equal-payment) formula.
 *   M = P · r · (1+r)^n / ((1+r)^n − 1)
 * where r = monthly rate = APR / 12 / 100, n = total months.
 *
 * Returns 0 when loanAmount ≤ 0 or termYears ≤ 0.
 * When rate = 0, returns simple division P/n.
 */
export function calculateMonthlyPayment(
  loanAmount: number,
  annualRatePct: number,
  termYears: number
): number {
  if (loanAmount <= 0 || termYears <= 0) return 0;
  const r = annualRatePct / 100 / 12;
  const n = termYears * 12;
  if (r === 0) return loanAmount / n;
  const factor = Math.pow(1 + r, n);
  return (loanAmount * r * factor) / (factor - 1);
}

/**
 * Total interest paid over the life of the loan.
 *   totalInterest = monthlyPayment × n − loanAmount
 */
export function calculateTotalInterest(
  loanAmount: number,
  monthlyPayment: number,
  termYears: number
): number {
  return Math.max(0, monthlyPayment * termYears * 12 - loanAmount);
}

/**
 * Calculate the combined transaction cost from an array of LoanCostRate entries.
 * Each entry can be a percentage of price, a percentage of loan, or a fixed amount.
 */
export function calculateTransactionCosts(
  price: number,
  loanAmount: number,
  costs: LoanCostRate[]
): number {
  return costs.reduce((sum, c) => {
    if (c.type === 'percentOfPrice') return sum + (price * c.value) / 100;
    if (c.type === 'percentOfLoan') return sum + (loanAmount * c.value) / 100;
    if (c.type === 'fixed') return sum + c.value;
    return sum;
  }, 0);
}

/** Format a number with narrow non-breaking space (U+202F) as thousands separator. */
export function fmt(n: number): string {
  return Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

/** Format to 2 decimal places. */
export function fmt2(n: number): string {
  return n.toFixed(2);
}

/** Year-by-year amortisation row. */
export type AmortRow = {
  year: number;
  principalPaid: number;
  interestPaid: number;
  balance: number;
};

/**
 * Build a year-by-year amortisation table.
 * Returns an empty array if loanAmount or termYears ≤ 0.
 */
export function buildAmortTable(
  loanAmount: number,
  annualRatePct: number,
  termYears: number
): AmortRow[] {
  if (loanAmount <= 0 || termYears <= 0) return [];
  const monthlyPmt = calculateMonthlyPayment(loanAmount, annualRatePct, termYears);
  const monthlyRate = annualRatePct / 100 / 12;
  let balance = loanAmount;
  const rows: AmortRow[] = [];

  for (let year = 1; year <= termYears; year++) {
    let principalPaid = 0;
    let interestPaid = 0;
    for (let m = 0; m < 12; m++) {
      if (balance <= 0) break;
      const interestPayment = balance * monthlyRate;
      const principalPayment = Math.min(balance, monthlyPmt - interestPayment);
      interestPaid += interestPayment;
      principalPaid += principalPayment;
      balance = Math.max(0, balance - principalPayment);
    }
    rows.push({ year, principalPaid, interestPaid, balance });
  }
  return rows;
}
