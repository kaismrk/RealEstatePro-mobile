// lib/loan/config.ts
// Per-country loan configuration types and static defaults.
//
// TODO(backend-loan-config): Replace static configs with GET /api/v1/countries/:cc/loan-config
// Hook indirection is already in place via hooks/useLoanConfig.ts — no UI code needs to change
// when the backend endpoint is implemented.

export type LoanCostRate = {
  key: string;             // e.g. 'notary', 'registration', 'agency'
  labelKey: string;        // i18n key for display name
  type: 'percentOfPrice' | 'percentOfLoan' | 'fixed';
  value: number;
  minValue?: number;
  maxValue?: number;
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
  /** Static transaction cost rates (notary, agency). Registration handled via registrationTaxMatrix. */
  transactionCosts: LoanCostRate[];
  /** Dynamic registration tax matrix (TN-specific; optional for other countries). */
  registrationTaxMatrix?: {
    newResident: number;    // new from promoter, local resident
    newAbroad: number;      // new from promoter, Tunisian Resident Abroad (TRE) — often exempt
    resaleResident: number; // resale, local resident
    resaleAbroad: number;   // resale, TRE
  };
  eligibility: {
    maxDebtToIncomeRatio: number;     // hard limit, e.g. 0.40
    warnDebtToIncomeRatio: number;    // warn threshold (green→amber), e.g. 0.33
    minMonthlyIncome: number;
    minAge: number;
    maxAge: number;
  };
};

// ── Tunisia ──────────────────────────────────────────────────────────────────
// Sources:
//  - BCT TMM (Taux du Marché Monétaire): 7.5 % as of 30 Jun 2026
//  - Default bank margin: 1.0 % → total default rate = 8.5 %
//  - Max loan term: BCT circular 2021-01 caps residential at 25 years
//  - Max debt-to-income: BCT prudential standard 40 %
//  - Registration tax (Direction Générale des Impôts):
//      · Resale (droits d'enregistrement + timbre): ~5 % of price
//      · New from promoter (resident): 1 % (reduced rate)
//      · New from promoter (TRE): 0 % (exempt under investment code)
//  - Notary / lawyer fee: ~1 % (standard professional tariff)
//  - Agency commission: ~3 % (market convention, buyer-side)

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
    {
      key: 'notary',
      labelKey: 'loans.inputs.notaryFee',
      type: 'percentOfPrice',
      value: 1.0,
      minValue: 0,
      maxValue: 10,
    },
    {
      key: 'agency',
      labelKey: 'loans.inputs.agencyFee',
      type: 'percentOfPrice',
      value: 3.0,
      minValue: 0,
      maxValue: 10,
    },
  ],
  registrationTaxMatrix: {
    newResident: 1.0,
    newAbroad: 0.0,
    resaleResident: 5.0,
    resaleAbroad: 5.0,
  },
  eligibility: {
    maxDebtToIncomeRatio: 0.40,
    warnDebtToIncomeRatio: 0.33,
    minMonthlyIncome: 800,
    minAge: 21,
    maxAge: 65,
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
  transactionCosts: [
    { key: 'notary', labelKey: 'loans.inputs.notaryFee', type: 'percentOfPrice', value: 7.0, minValue: 0, maxValue: 15 },
    { key: 'agency', labelKey: 'loans.inputs.agencyFee', type: 'percentOfPrice', value: 3.0, minValue: 0, maxValue: 10 },
  ],
  eligibility: {
    maxDebtToIncomeRatio: 0.35,
    warnDebtToIncomeRatio: 0.30,
    minMonthlyIncome: 1200,
    minAge: 18,
    maxAge: 75,
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
  transactionCosts: [
    { key: 'notary', labelKey: 'loans.inputs.notaryFee', type: 'percentOfPrice', value: 1.5, minValue: 0, maxValue: 10 },
    { key: 'agency', labelKey: 'loans.inputs.agencyFee', type: 'percentOfPrice', value: 3.0, minValue: 0, maxValue: 10 },
  ],
  eligibility: {
    maxDebtToIncomeRatio: 0.40,
    warnDebtToIncomeRatio: 0.33,
    minMonthlyIncome: 3000,
    minAge: 20,
    maxAge: 65,
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
  transactionCosts: [
    { key: 'notary', labelKey: 'loans.inputs.notaryFee', type: 'percentOfPrice', value: 2.0, minValue: 0, maxValue: 10 },
    { key: 'agency', labelKey: 'loans.inputs.agencyFee', type: 'percentOfPrice', value: 2.0, minValue: 0, maxValue: 10 },
  ],
  eligibility: {
    maxDebtToIncomeRatio: 0.40,
    warnDebtToIncomeRatio: 0.33,
    minMonthlyIncome: 20000,
    minAge: 21,
    maxAge: 65,
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
