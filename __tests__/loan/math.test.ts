/**
 * Unit tests -- lib/loan/math.ts
 *
 * All functions are pure (no React, no mocks required).
 */

import {
  buildAmortTable,
  calculateMonthlyPayment,
  calculateTotalInterest,
  calculateTransactionCosts,
  computeCost,
  fmt,
} from '@/lib/loan/math';
import { TN_CONFIG } from '@/lib/loan/config';
import type { LoanCostRate } from '@/lib/loan/config';

// -- calculateMonthlyPayment ────────────────────────────────────────────────────

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
    const result = calculateMonthlyPayment(200_000, 8.5, 20);
    expect(result).toBeCloseTo(1736, 0);
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

// -- calculateTotalInterest ─────────────────────────────────────────────────────

describe('calculateTotalInterest', () => {
  it('returns 0 when monthly payment x n equals loan amount (zero-rate edge)', () => {
    const monthly = calculateMonthlyPayment(120_000, 0, 10);
    expect(calculateTotalInterest(120_000, monthly, 10)).toBeCloseTo(0, 1);
  });

  it('is positive for a standard TN loan', () => {
    const monthly = calculateMonthlyPayment(200_000, 8.5, 20);
    const interest = calculateTotalInterest(200_000, monthly, 20);
    expect(interest).toBeGreaterThan(0);
    expect(interest).toBeCloseTo(monthly * 240 - 200_000, 0);
  });
});

// -- computeCost -- flat costs ────────────────────────────────────────────────

describe('computeCost -- flat costs', () => {
  it('evaluates a percentOfPrice component', () => {
    const cost: LoanCostRate = {
      kind: 'flat',
      key: 'notary',
      labelKey: 'x',
      component: { kind: 'percentOfPrice', value: 1 },
    };
    expect(computeCost(cost, 300_000, 0, 'secondary')).toBeCloseTo(3_000, 2);
  });

  it('evaluates a percentOfLoan component', () => {
    const cost: LoanCostRate = {
      kind: 'flat',
      key: 'fee',
      labelKey: 'x',
      component: { kind: 'percentOfLoan', value: 2 },
    };
    expect(computeCost(cost, 0, 200_000, 'secondary')).toBeCloseTo(4_000, 2);
  });

  it('evaluates a fixed component', () => {
    const cost: LoanCostRate = {
      kind: 'flat',
      key: 'fee',
      labelKey: 'x',
      component: { kind: 'fixed', amount: 1_500 },
    };
    expect(computeCost(cost, 0, 0, 'secondary')).toBe(1_500);
  });

  it('evaluates a percentOfPriceAboveThreshold component', () => {
    const cost: LoanCostRate = {
      kind: 'flat',
      key: 'fee',
      labelKey: 'x',
      component: { kind: 'percentOfPriceAboveThreshold', threshold: 500_000, value: 3 },
    };
    expect(computeCost(cost, 600_000, 0, 'secondary')).toBeCloseTo(3_000, 2);
    expect(computeCost(cost, 300_000, 0, 'secondary')).toBeCloseTo(0, 2);
  });
});

describe('computeCost -- tiered costs', () => {
  const reg = TN_CONFIG.transactionCosts.find((c) => c.key === 'registration')!;

  it('new property below 500k uses fixed=0 band', () => {
    expect(computeCost(reg, 300_000, 0, 'new')).toBeCloseTo(0, 2);
  });

  it('new property 500k-1M uses 3% above threshold + 2% of total', () => {
    // 600k: (100k x 3%) + (600k x 2%) = 3k + 12k = 15k
    expect(computeCost(reg, 600_000, 0, 'new')).toBeCloseTo(15_000, 2);
  });

  it('new property >= 1M uses 3% above threshold + 4% of total', () => {
    // 1.5M: (1M x 3%) + (1.5M x 4%) = 30k + 60k = 90k
    expect(computeCost(reg, 1_500_000, 0, 'new')).toBeCloseTo(90_000, 2);
  });

  it('secondary property below 500k: 6% of price', () => {
    // 300k x 6% = 18k
    expect(computeCost(reg, 300_000, 0, 'secondary')).toBeCloseTo(18_000, 2);
  });

  it('secondary property 500k-1M: 8% of price', () => {
    // 700k x 8% = 56k
    expect(computeCost(reg, 700_000, 0, 'secondary')).toBeCloseTo(56_000, 2);
  });

  it('secondary property >= 1M: 10% of price', () => {
    // 1.5M x 10% = 150k
    expect(computeCost(reg, 1_500_000, 0, 'secondary')).toBeCloseTo(150_000, 2);
  });

  it('returns 0 when no tier matches the propertyType', () => {
    const costNoTier: LoanCostRate = {
      kind: 'tiered',
      key: 'test',
      labelKey: 'x',
      tiers: [{ propertyType: 'new', bands: [{ maxPrice: Infinity, components: [{ kind: 'fixed', amount: 100 }] }] }],
    };
    expect(computeCost(costNoTier, 300_000, 0, 'secondary')).toBe(0);
  });
});

// -- calculateTransactionCosts -- TN integration scenarios ─────────────────────
//
// Expected totals (price x propertyType):
//   New  300k  -> notary 3k + cpf 3k + registration 0      = 6k
//   New  600k  -> notary 6k + cpf 6k + registration 15k    = 27k
//   New  1.5M  -> notary 15k + cpf 15k + registration 90k  = 120k
//   Sec  300k  -> notary 3k + agency 6k + cpf 3k + reg 18k = 30k
//   Sec  700k  -> notary 7k + agency 14k + cpf 7k + reg 56k= 84k
//   Sec  1.5M  -> notary 15k + agency 30k + cpf 15k + reg 150k = 210k

describe('calculateTransactionCosts -- TN scenarios', () => {
  const { transactionCosts } = TN_CONFIG;

  it('new 300k -- 6 000 TND', () => {
    expect(calculateTransactionCosts(300_000, 0, transactionCosts, 'new')).toBeCloseTo(6_000, 2);
  });

  it('new 600k -- 27 000 TND', () => {
    expect(calculateTransactionCosts(600_000, 0, transactionCosts, 'new')).toBeCloseTo(27_000, 2);
  });

  it('new 1.5M -- 120 000 TND', () => {
    expect(calculateTransactionCosts(1_500_000, 0, transactionCosts, 'new')).toBeCloseTo(120_000, 2);
  });

  it('secondary 300k -- 30 000 TND', () => {
    expect(calculateTransactionCosts(300_000, 0, transactionCosts, 'secondary')).toBeCloseTo(30_000, 2);
  });

  it('secondary 700k -- 84 000 TND', () => {
    expect(calculateTransactionCosts(700_000, 0, transactionCosts, 'secondary')).toBeCloseTo(84_000, 2);
  });

  it('secondary 1.5M -- 210 000 TND', () => {
    expect(calculateTransactionCosts(1_500_000, 0, transactionCosts, 'secondary')).toBeCloseTo(210_000, 2);
  });
});

// -- calculateTransactionCosts -- generic behaviour ────────────────────────────

describe('calculateTransactionCosts -- generic', () => {
  const PRICE = 250_000;
  const LOAN = 200_000;

  it('handles a flat percentOfPrice cost', () => {
    const costs: LoanCostRate[] = [
      { kind: 'flat', key: 'a', labelKey: 'x', component: { kind: 'percentOfPrice', value: 5 } },
    ];
    expect(calculateTransactionCosts(PRICE, LOAN, costs, 'secondary')).toBeCloseTo(12_500, 2);
  });

  it('handles a flat percentOfLoan cost', () => {
    const costs: LoanCostRate[] = [
      { kind: 'flat', key: 'b', labelKey: 'x', component: { kind: 'percentOfLoan', value: 2 } },
    ];
    expect(calculateTransactionCosts(PRICE, LOAN, costs, 'secondary')).toBeCloseTo(4_000, 2);
  });

  it('handles a flat fixed cost', () => {
    const costs: LoanCostRate[] = [
      { kind: 'flat', key: 'c', labelKey: 'x', component: { kind: 'fixed', amount: 1_500 } },
    ];
    expect(calculateTransactionCosts(PRICE, LOAN, costs, 'secondary')).toBe(1_500);
  });

  it('sums multiple flat costs', () => {
    const costs: LoanCostRate[] = [
      { kind: 'flat', key: 'notary',       labelKey: 'x', component: { kind: 'percentOfPrice', value: 1.0 } },
      { kind: 'flat', key: 'registration', labelKey: 'x', component: { kind: 'percentOfPrice', value: 5.0 } },
      { kind: 'flat', key: 'agency',       labelKey: 'x', component: { kind: 'percentOfPrice', value: 3.0 } },
    ];
    // Total = 9% of 250 000 = 22 500
    expect(calculateTransactionCosts(PRICE, LOAN, costs, 'secondary')).toBeCloseTo(22_500, 2);
  });

  it('skips a flat cost whose appliesTo excludes the propertyType', () => {
    const costs: LoanCostRate[] = [
      { kind: 'flat', key: 'agency', labelKey: 'x', component: { kind: 'percentOfPrice', value: 2 }, appliesTo: ['secondary'] },
    ];
    expect(calculateTransactionCosts(PRICE, LOAN, costs, 'new')).toBe(0);
    expect(calculateTransactionCosts(PRICE, LOAN, costs, 'secondary')).toBeCloseTo(5_000, 2);
  });

  it('returns 0 for an empty cost array', () => {
    expect(calculateTransactionCosts(PRICE, LOAN, [], 'secondary')).toBe(0);
  });
});

// -- buildAmortTable ───────────────────────────────────────────────────────────

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

// -- fmt ───────────────────────────────────────────────────────────────────────

describe('fmt', () => {
  // fmt uses U+202F (narrow non-breaking space) as the thousands separator
  const NNBSP = ' ';

  it('formats 1000 with a thousands separator', () => {
    expect(fmt(1000)).toBe('1' + NNBSP + '000');
  });

  it('formats large numbers', () => {
    expect(fmt(250_000)).toBe('250' + NNBSP + '000');
  });

  it('rounds floats', () => {
    expect(fmt(1736.7)).toBe('1' + NNBSP + '737');
  });
});
