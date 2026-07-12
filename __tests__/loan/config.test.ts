/**
 * Unit tests — lib/loan/config.ts + hooks/useLoanConfig.ts
 */

import { getLoanConfig, TN_CONFIG } from '@/lib/loan/config';

// ── getLoanConfig ─────────────────────────────────────────────────────────────

describe('getLoanConfig', () => {
  it('returns TN config for countryCode TN', () => {
    const config = getLoanConfig('TN');
    expect(config.currency).toBe('TND');
    expect(config.defaultInterestRate).toBe(8.5);
    expect(config.maxLoanTermYears).toBe(25);
    expect(config.defaultDownPaymentPercent).toBe(20);
  });

  it('returns TN config when countryCode is lowercase "tn"', () => {
    const config = getLoanConfig('tn');
    expect(config.currency).toBe('TND');
  });

  it('falls back to TN config for an unknown country code', () => {
    const config = getLoanConfig('XX');
    expect(config.currency).toBe('TND');
    expect(config).toBe(TN_CONFIG);
  });

  it('falls back to TN config for an empty string', () => {
    const config = getLoanConfig('');
    expect(config.currency).toBe('TND');
  });

  it('returns FR config for countryCode FR', () => {
    const config = getLoanConfig('FR');
    expect(config.currency).toBe('EUR');
  });

  it('returns MA config for countryCode MA', () => {
    const config = getLoanConfig('MA');
    expect(config.currency).toBe('MAD');
  });

  it('returns DZ config for countryCode DZ', () => {
    const config = getLoanConfig('DZ');
    expect(config.currency).toBe('DZD');
  });
});

// ── TN_CONFIG structural assertions ──────────────────────────────────────────

describe('TN_CONFIG', () => {
  it('has minLoanTermYears < maxLoanTermYears', () => {
    expect(TN_CONFIG.minLoanTermYears).toBeLessThan(TN_CONFIG.maxLoanTermYears);
  });

  it('has defaultLoanTermYears within [min, max]', () => {
    expect(TN_CONFIG.defaultLoanTermYears).toBeGreaterThanOrEqual(TN_CONFIG.minLoanTermYears);
    expect(TN_CONFIG.defaultLoanTermYears).toBeLessThanOrEqual(TN_CONFIG.maxLoanTermYears);
  });

  it('has defaultInterestRate = tmmRate + defaultBankMargin', () => {
    expect(TN_CONFIG.defaultInterestRate).toBeCloseTo(
      TN_CONFIG.tmmRate + TN_CONFIG.defaultBankMargin,
      2
    );
  });

  it('has eligibility.maxDebtToIncomeRatio of 0.40', () => {
    expect(TN_CONFIG.eligibility.maxDebtToIncomeRatio).toBe(0.40);
  });

  it('has eligibility.minMonthlyIncome of 800', () => {
    expect(TN_CONFIG.eligibility.minMonthlyIncome).toBe(800);
  });

  it('does not include age eligibility (no minAge / maxAge)', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((TN_CONFIG.eligibility as any).minAge).toBeUndefined();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((TN_CONFIG.eligibility as any).maxAge).toBeUndefined();
  });

  it('has transactionCosts with notary, agency, cpf and registration entries', () => {
    const keys = TN_CONFIG.transactionCosts.map((c) => c.key);
    expect(keys).toContain('notary');
    expect(keys).toContain('agency');
    expect(keys).toContain('cpf');
    expect(keys).toContain('registration');
  });

  it('agency cost applies only to secondary market', () => {
    const agency = TN_CONFIG.transactionCosts.find((c) => c.key === 'agency');
    expect(agency).toBeDefined();
    expect(agency!.kind).toBe('flat');
    if (agency!.kind === 'flat') {
      expect(agency!.appliesTo).toEqual(['secondary']);
    }
  });

  it('registration cost is tiered with two property-type tiers', () => {
    const reg = TN_CONFIG.transactionCosts.find((c) => c.key === 'registration');
    expect(reg).toBeDefined();
    expect(reg!.kind).toBe('tiered');
    if (reg!.kind === 'tiered') {
      const types = reg!.tiers.map((t) => t.propertyType);
      expect(types).toContain('new');
      expect(types).toContain('secondary');
    }
  });

  it('does not have a registrationTaxMatrix (replaced by tiered transactionCosts)', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((TN_CONFIG as any).registrationTaxMatrix).toBeUndefined();
  });
});
