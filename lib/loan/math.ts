// lib/loan/math.ts
// Pure math helpers for the loan simulator.
// All functions are side-effect-free and exported for unit testing.

import type { CostComponent, LoanCostRate, PropertyType } from './config';

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

/** Evaluate a single CostComponent to a currency amount. Not exported — use computeCost. */
function computeComponent(comp: CostComponent, price: number, loanAmount: number): number {
  switch (comp.kind) {
    case 'fixed':
      return comp.amount;
    case 'percentOfPrice':
      return (price * comp.value) / 100;
    case 'percentOfLoan':
      return (loanAmount * comp.value) / 100;
    case 'percentOfPriceAboveThreshold':
      return (Math.max(0, price - comp.threshold) * comp.value) / 100;
  }
}

/**
 * Compute the TND amount for a single LoanCostRate entry.
 *
 * For 'flat' costs: evaluates the single component.
 * For 'tiered' costs:
 *   - Finds the tier matching propertyType.
 *   - Finds the first band where price < band.maxPrice (bands must be sorted ascending,
 *     last band uses Number.POSITIVE_INFINITY).
 *   - Sums all components in that band.
 *
 * Does NOT apply the 'appliesTo' filter — callers must do that before calling.
 * Use calculateTransactionCosts() for the full filtered sum.
 */
export function computeCost(
  cost: LoanCostRate,
  price: number,
  loanAmount: number,
  propertyType: PropertyType,
): number {
  if (cost.kind === 'flat') {
    return computeComponent(cost.component, price, loanAmount);
  }
  // tiered: find tier for this property type
  const tier = cost.tiers.find((t) => t.propertyType === propertyType);
  if (!tier) return 0;
  // find the first band where price < band.maxPrice
  const band = tier.bands.find((b) => price < b.maxPrice);
  if (!band) return 0; // should not happen if last band has Infinity
  return band.components.reduce(
    (sum, comp) => sum + computeComponent(comp, price, loanAmount),
    0,
  );
}

/**
 * Sum all applicable transaction costs for the given price, loan amount and property type.
 *
 * A flat cost is skipped when its appliesTo array is present and does not include
 * the selected propertyType (e.g. agency commission is secondary-only for TN).
 * Tiered costs always apply — tier selection inside computeCost handles the variance.
 */
export function calculateTransactionCosts(
  price: number,
  loanAmount: number,
  costs: LoanCostRate[],
  propertyType: PropertyType,
): number {
  return costs.reduce((sum, cost) => {
    if (
      cost.kind === 'flat' &&
      cost.appliesTo !== undefined &&
      !cost.appliesTo.includes(propertyType)
    ) {
      return sum;
    }
    return sum + computeCost(cost, price, loanAmount, propertyType);
  }, 0);
}

/** Format a number with narrow non-breaking space (U+202F) as thousands separator. */
export function fmt(n: number): string {
  return Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
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
