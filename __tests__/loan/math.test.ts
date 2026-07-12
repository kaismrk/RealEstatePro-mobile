/**
 * Unit tests — lib/loan/math.ts
 *
 * All functions are pure (no React, no mocks required).
 */

import {
  buildAmortTable,
  calculateMonthlyPayment,
  calculateTotalInterest,
  calculateTransactionCosts,
  fmt,
} from '@/lib/loan/math';
import type { LoanCostRate } from '@/lib/loan/config';

// ── calculateMonthlyPayment ────────────────────────────────────────────────────

describe('calculateMonthlyPayment', () => {
  it('returns 0 when loanAmount is 0', () => {
    expect(calculateMonthlyPayment(0, 8.5, 20)).toBe(0);
  });

  it('returns 0 when termYears is 0', () => {
    expect(calculateMonthlyPayment(200_000, 8.5, 0)).toBe(0);
  });

  it('returns simple division when rate is 0', () => {
    // 120 000 / (10 * 12) = 1 000
    expect(calculateMonthlyPayment(120_000, 0, 10)).toBeCloseTo(1000, 2);
  });

  it('computes known TN inputs: 200 000 TND / 8.5% / 20 yrs', () => {
    // Standard annuity formula:
    // r = 0.085 / 12, n = 240
    // Expected ≈ 1736 TND/month
    const result = calculateMonthlyPayment(200_000, 8.5, 20);
    expect(result).toBeCloseTo(1736, 0);
    // Verify it satisfies the formula independently
    const r = 0.085 / 12;
    const n = 240;
    const factor = Math.pow(1 + r, n);
    const expected = (200_000 * r * factor) / (factor - 1);
    expect(result).toBeCloseTo(expected, 2);
  });

  it('produces a higher monthly payment for shorter terms (same loan + rate)', () => {
    const short = calculateMonthlyPayment(200_000, 8.5, 10);
    const long = calculateMonthlyPayment(200_000, 8.5, 25);
    expect(short).toBeGreaterThan(long);
  });

  it('produces a higher monthly payment for higher rates (same loan + term)', () => {
    const high = calculateMonthlyPayment(200_000, 12.0, 20);
    const low = calculateMonthlyPayment(200_000, 5.0, 20);
    expect(high).toBeGreaterThan(low);
  });
});

// ── calculateTotalInterest ─────────────────────────────────────────────────────

describe('calculateTotalInterest', () => {
  it('returns 0 when monthly payment × n equals loan amount (zero-rate edge)', () => {
    const monthly = calculateMonthlyPayment(120_000, 0, 10);
    expect(calculateTotalInterest(120_000, monthly, 10)).toBeCloseTo(0, 1);
  });

  it('is positive for a standard TN loan', () => {
    const monthly = calculateMonthlyPayment(200_000, 8.5, 20);
    const interest = calculateTotalInterest(200_000, monthly, 20);
    expect(interest).toBeGreaterThan(0);
    // Total paid − principal must equal interest
    expect(interest).toBeCloseTo(monthly * 240 - 200_000, 0);
  });
});

// ── calculateTransactionCosts ─────────────────────────────────────────────────

describe('calculateTransactionCosts', () => {
  const PRICE = 250_000;
  const LOAN = 200_000;

  it('handles percentOfPrice correctly', () => {
    const costs: LoanCostRate[] = [
      { key: 'a', labelKey: 'x', type: 'percentOfPrice', value: 5 },
    ];
    expect(calculateTransactionCosts(PRICE, LOAN, costs)).toBeCloseTo(12_500, 2);
  });

  it('handles percentOfLoan correctly', () => {
    const costs: LoanCostRate[] = [
      { key: 'b', labelKey: 'x', type: 'percentOfLoan', value: 2 },
    ];
    expect(calculateTransactionCosts(PRICE, LOAN, costs)).toBeCloseTo(4_000, 2);
  });

  it('handles fixed correctly', () => {
    const costs: LoanCostRate[] = [
      { key: 'c', labelKey: 'x', type: 'fixed', value: 1_500 },
    ];
    expect(calculateTransactionCosts(PRICE, LOAN, costs)).toBe(1_500);
  });

  it('sums all three rate types', () => {
    const costs: LoanCostRate[] = [
      { key: 'notary',       labelKey: 'x', type: 'percentOfPrice', value: 1.0 },  // 2 500
      { key: 'registration', labelKey: 'x', type: 'percentOfPrice', value: 5.0 },  // 12 500
      { key: 'agency',       labelKey: 'x', type: 'percentOfPrice', value: 3.0 },  // 7 500
    ];
    // Total = 9% of 250 000 = 22 500
    expect(calculateTransactionCosts(PRICE, LOAN, costs)).toBeCloseTo(22_500, 2);
  });

  it('returns 0 for an empty cost array', () => {
    expect(calculateTransactionCosts(PRICE, LOAN, [])).toBe(0);
  });
});

// ── buildAmortTable ───────────────────────────────────────────────────────────

describe('buildAmortTable', () => {
  it('returns empty array when loanAmount is 0', () => {
    expect(buildAmortTable(0, 8.5, 20)).toHaveLength(0);
  });

  it('returns a row per year', () => {
    const table = buildAmortTable(200_000, 8.5, 20);
    expect(table).toHaveLength(20);
  });

  it('balance decreases each year', () => {
    const table = buildAmortTable(200_000, 8.5, 20);
    for (let i = 1; i < table.length; i++) {
      expect(table[i].balance).toBeLessThan(table[i - 1].balance);
    }
  });

  it('balance reaches near 0 in the final year', () => {
    const table = buildAmortTable(200_000, 8.5, 20);
    expect(table[table.length - 1].balance).toBeCloseTo(0, 0);
  });
});

// ── fmt ───────────────────────────────────────────────────────────────────────

describe('fmt', () => {
  it('formats 1000 with a thousands separator', () => {
    expect(fmt(1000)).toBe('1 000');
  });

  it('formats large numbers', () => {
    expect(fmt(250_000)).toBe('250 000');
  });

  it('rounds floats', () => {
    expect(fmt(1736.7)).toBe('1 737');
  });
});
