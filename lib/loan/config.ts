// lib/loan/config.ts
// Per-country loan configuration types and static defaults.
//
// TODO(backend-loan-config): Replace static configs with GET /api/v1/countries/:cc/loan-config
// Hook indirection is already in place via hooks/useLoanConfig.ts — no UI code needs to change
// when the backend endpoint is implemented.

export type PropertyType = 'new' | 'secondary';

// A single cost component that computes to a currency amount given price + loanAmount
export type CostComponent =
  | { kind: 'fixed'; amount: number }
  | { kind: 'percentOfPrice'; value: number }
  | { kind: 'percentOfLoan'; value: number }
  | { kind: 'percentOfPriceAboveThreshold'; threshold: number; value: number };

// A cost item can be either flat (notary, agency) or tiered-by-price-and-property-type (registration)
export type LoanCostRate =
  | {
      kind: 'flat';
      key: string;
      labelKey: string;
      component: CostComponent;
      /** If omitted the cost applies to all property types. */
      appliesTo?: PropertyType[];
    }
  | {
      kind: 'tiered';
      key: string;
      labelKey: string;
      tiers: {
        propertyType: PropertyType;
        /** Sorted by maxPrice ascending; last entry uses Number.POSITIVE_INFINITY. */
        bands: { maxPrice: number; components: CostComponent[] }[];
      }[];
    };

export type LoanCountryConfig = {
  currency: string;              // e.g. 'TND', 'EUR'
  currencySymbol: string;        // display symbol (same as currency for TND/MAD/DZD)
  // Loan term
  minLoanTermYears: number;
  maxLoanTermYears: number;
  defaultLoanTermYears: number;
  // Interest rate
  minInterestRate: number;
  maxInterestRate: number;
  defaultInterestRate: number;
  /** Reference TMM (BCT) rate for display. Total rate = tmmRate + bankMargin. */
  tmmRate: number;
  /** Default bank margin on top of TMM. defaultInterestRate = tmmRate + defaultBankMargin. */
  defaultBankMargin: number;
  /** Step for the rate stepper (+/- buttons). */
  rateStep: number;
  // Down payment
  minDownPaymentPercent: number;
  maxDownPaymentPercent: number;
  defaultDownPaymentPercent: number;
  /** Transaction cost entries — see computeCost() in math.ts. */
  transactionCosts: LoanCostRate[];
  eligibility: {
    maxDebtToIncomeRatio: number;     // hard limit, e.g. 0.40
    warnDebtToIncomeRatio: number;    // warn threshold (green→amber), e.g. 0.33
    minMonthlyIncome: number;
  };
};

// ── Tunisia ──────────────────────────────────────────────────────────────────
// Sources:
//  - BCT TMM (Taux du Marché Monétaire): 7.5% as of 30 Jun 2026
//  - Default bank margin: 1.0% → total default rate = 8.5%
//  - Max loan term: BCT circular 2021-01 caps residential at 25 years
//  - Max debt-to-income: BCT prudential standard 40%
//  - Registration costs (droits d'enregistrement + taxe complémentaire):
//      Source: bigdatis.com/droits-enregistrement-bien-immobilier-tunisie-2026
//              century21.tn/les-droits-denregistrement-dun-bien-immobilier-en-tunisie-en-2024
//  - Notary / lawyer fee: ~1% (standard professional tariff)
//  - Agency commission: ~2% buyer-side (source: century21.tn)
//  - CPF (Contribution à la Promotion du Foncier): 1% flat

export const TN_CONFIG: LoanCountryConfig = {
  currency: 'TND',
  currencySymbol: 'TND',
  minLoanTermYears: 1,
  maxLoanTermYears: 25,
  defaultLoanTermYears: 20,
  minInterestRate: 5.0,
  maxInterestRate: 12.0,
  defaultInterestRate: 8.5,
  tmmRate: 7.5,
  defaultBankMargin: 1.0,
  rateStep: 0.05,
  minDownPaymentPercent: 10,
  maxDownPaymentPercent: 100,
  defaultDownPaymentPercent: 20,
  transactionCosts: [
    // Notary fees — flat, applies to all property types
    {
      kind: 'flat',
      key: 'notary',
      labelKey: 'loans.costs.notary',
      component: { kind: 'percentOfPrice', value: 1 },
    },
    // Agency commission — 2% for secondary; not applicable for new (buyer buys direct from promoter)
    {
      kind: 'flat',
      key: 'agency',
      labelKey: 'loans.costs.agency',
      component: { kind: 'percentOfPrice', value: 2 },
      appliesTo: ['secondary'],
    },
    // CPF tax — 1% flat, applies to all property types
    {
      kind: 'flat',
      key: 'cpf',
      labelKey: 'loans.costs.cpf',
      component: { kind: 'percentOfPrice', value: 1 },
    },
    // Registration + complementary tax — tiered, differs by property type
    {
      kind: 'tiered',
      key: 'registration',
      labelKey: 'loans.costs.registration',
      tiers: [
        {
          propertyType: 'new',
          bands: [
            // < 500k TND: ~30 TND/page registration fee — negligible; modelled as 0 for simplicity
            { maxPrice: 500_000, components: [{ kind: 'fixed', amount: 0 }] },
            // 500k–999,999: 3% on excess above 500k + 2% complementary tax on total
            {
              maxPrice: 1_000_000,
              components: [
                { kind: 'percentOfPriceAboveThreshold', threshold: 500_000, value: 3 },
                { kind: 'percentOfPrice', value: 2 },
              ],
            },
            // >= 1M: 3% on excess above 500k + 4% complementary tax on total
            {
              maxPrice: Number.POSITIVE_INFINITY,
              components: [
                { kind: 'percentOfPriceAboveThreshold', threshold: 500_000, value: 3 },
                { kind: 'percentOfPrice', value: 4 },
              ],
            },
          ],
        },
        {
          propertyType: 'secondary',
          bands: [
            { maxPrice: 500_000, components: [{ kind: 'percentOfPrice', value: 6 }] },
            { maxPrice: 1_000_000, components: [{ kind: 'percentOfPrice', value: 8 }] },
            { maxPrice: Number.POSITIVE_INFINITY, components: [{ kind: 'percentOfPrice', value: 10 }] },
          ],
        },
      ],
    },
  ],
  eligibility: {
    maxDebtToIncomeRatio: 0.40,
    warnDebtToIncomeRatio: 0.33,
    minMonthlyIncome: 800,
  },
};

// ── France ────────────────────────────────────────────────────────────────────
// TODO: configure for country FR
export const FR_CONFIG: LoanCountryConfig = {
  currency: 'EUR',
  currencySymbol: '€',
  minLoanTermYears: 5,
  maxLoanTermYears: 25,
  defaultLoanTermYears: 20,
  minInterestRate: 1.0,
  maxInterestRate: 8.0,
  defaultInterestRate: 3.5,
  tmmRate: 3.5,
  defaultBankMargin: 0.0,
  rateStep: 0.05,
  minDownPaymentPercent: 10,
  maxDownPaymentPercent: 100,
  defaultDownPaymentPercent: 20,
  transactionCosts: [],
  eligibility: {
    maxDebtToIncomeRatio: 0.35,
    warnDebtToIncomeRatio: 0.30,
    minMonthlyIncome: 1200,
  },
};

// ── Morocco ───────────────────────────────────────────────────────────────────
// TODO: configure for country MA
export const MA_CONFIG: LoanCountryConfig = {
  currency: 'MAD',
  currencySymbol: 'MAD',
  minLoanTermYears: 5,
  maxLoanTermYears: 25,
  defaultLoanTermYears: 20,
  minInterestRate: 3.0,
  maxInterestRate: 10.0,
  defaultInterestRate: 5.5,
  tmmRate: 5.5,
  defaultBankMargin: 0.0,
  rateStep: 0.05,
  minDownPaymentPercent: 10,
  maxDownPaymentPercent: 100,
  defaultDownPaymentPercent: 20,
  transactionCosts: [],
  eligibility: {
    maxDebtToIncomeRatio: 0.40,
    warnDebtToIncomeRatio: 0.33,
    minMonthlyIncome: 3000,
  },
};

// ── Algeria ───────────────────────────────────────────────────────────────────
// TODO: configure for country DZ
export const DZ_CONFIG: LoanCountryConfig = {
  currency: 'DZD',
  currencySymbol: 'DZD',
  minLoanTermYears: 5,
  maxLoanTermYears: 30,
  defaultLoanTermYears: 20,
  minInterestRate: 3.0,
  maxInterestRate: 8.0,
  defaultInterestRate: 5.0,
  tmmRate: 5.0,
  defaultBankMargin: 0.0,
  rateStep: 0.05,
  minDownPaymentPercent: 10,
  maxDownPaymentPercent: 100,
  defaultDownPaymentPercent: 20,
  transactionCosts: [],
  eligibility: {
    maxDebtToIncomeRatio: 0.40,
    warnDebtToIncomeRatio: 0.33,
    minMonthlyIncome: 20000,
  },
};

// ── Registry ──────────────────────────────────────────────────────────────────

const CONFIG_REGISTRY: Record<string, LoanCountryConfig> = {
  TN: TN_CONFIG,
  FR: FR_CONFIG,
  MA: MA_CONFIG,
  DZ: DZ_CONFIG,
};

/**
 * Returns the loan config for the given country code.
 * Falls back to TN if the country is unknown or not configured.
 */
export function getLoanConfig(countryCode: string): LoanCountryConfig {
  return CONFIG_REGISTRY[countryCode.toUpperCase()] ?? TN_CONFIG;
}
