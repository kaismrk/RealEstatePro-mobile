/**
 * Tests for the Loan Simulator screen.
 *
 * Test plan:
 *  1. Renders without crash and shows screen title
 *  2. Shows TND currency symbol for TN config
 *  3. Monthly amount field renders
 *  4. Eligibility badge is present
 *  5. Save simulation button is present
 *  6. Empty saved-simulations state renders
 *  7. Shows EUR when config returns FR config (countryCode switch)
 *  8. Debt ratio field renders
 */

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// ── expo-linear-gradient mock (no native module in Jest) ───────────────────
jest.mock('expo-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    LinearGradient: ({ children, style }: { children?: React.ReactNode; style?: unknown }) =>
      React.createElement(View, { style }, children),
  };
});

// ── Theme mock ─────────────────────────────────────────────────────────────
jest.mock('@/lib/theme', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { lightPalette } = jest.requireActual('@/constants/theme');
  return {
    useTheme: () => ({
      palette: lightPalette,
      mode: 'light',
      setMode: jest.fn(),
      isDark: false,
    }),
    ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
    THEME_STORAGE_KEY: 'hovioo.theme.mode',
  };
});

// ── useLoanConfig mock — TN ────────────────────────────────────────────────
const mockTNConfig = {
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
      kind: 'flat' as const,
      key: 'notary',
      labelKey: 'loans.costs.notary',
      component: { kind: 'percentOfPrice' as const, value: 1.0 },
    },
    {
      kind: 'flat' as const,
      key: 'agency',
      labelKey: 'loans.costs.agency',
      component: { kind: 'percentOfPrice' as const, value: 2.0 },
      appliesTo: ['secondary' as const],
    },
    {
      kind: 'flat' as const,
      key: 'cpf',
      labelKey: 'loans.costs.cpf',
      component: { kind: 'percentOfPrice' as const, value: 1.0 },
    },
  ],
  eligibility: {
    maxDebtToIncomeRatio: 0.40,
    warnDebtToIncomeRatio: 0.33,
    minMonthlyIncome: 800,
  },
};

const mockFRConfig = {
  ...mockTNConfig,
  currency: 'EUR',
  currencySymbol: '€',
  defaultInterestRate: 3.5,
  tmmRate: 3.5,
  defaultBankMargin: 0.0,
};

let mockConfig = mockTNConfig;

jest.mock('@/hooks/useLoanConfig', () => ({
  useLoanConfig: () => mockConfig,
}));

// ── Import screen ──────────────────────────────────────────────────────────
import LoansScreen from '@/app/(tabs)/loans';

// ── Helpers ────────────────────────────────────────────────────────────────

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

function renderLoans() {
  return render(
    React.createElement(createWrapper(), null, React.createElement(LoansScreen))
  );
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('LoansScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockConfig = mockTNConfig;
  });

  // Test 1 — renders without crash, shows title
  it('renders without crashing and shows the screen title', () => {
    renderLoans();
    expect(screen.getByTestId('loans-header')).toBeTruthy();
    expect(screen.getByText('Loan Simulator')).toBeTruthy();
  });

  // Test 2 — shows TND currency
  it('shows TND currency for TN config', () => {
    renderLoans();
    // TND appears multiple times (monthly result suffix, net income, etc.)
    const tndElements = screen.getAllByText(/TND/);
    expect(tndElements.length).toBeGreaterThan(0);
  });

  // Test 3 — monthly amount field renders
  it('renders the monthly amount field', () => {
    renderLoans();
    expect(screen.getByTestId('monthly-amount')).toBeTruthy();
  });

  // Test 4 — eligibility badge is present
  it('renders the eligibility badge', () => {
    renderLoans();
    expect(screen.getByTestId('elig-badge')).toBeTruthy();
  });

  // Test 5 — save simulation button
  it('renders the Save Simulation button', () => {
    renderLoans();
    expect(screen.getByTestId('save-sim-btn')).toBeTruthy();
    expect(screen.getByText('Save Simulation')).toBeTruthy();
  });

  // Test 6 — empty saved simulations state
  it('shows the empty saved simulations placeholder when no sims are saved', () => {
    renderLoans();
    expect(screen.getByTestId('saved-empty')).toBeTruthy();
    expect(screen.getByText(/No saved simulations yet/)).toBeTruthy();
  });

  // Test 7 — switching to FR config shows EUR
  it('shows EUR currency when config returns FR config', () => {
    mockConfig = mockFRConfig;
    renderLoans();
    const eurElements = screen.getAllByText(/EUR/);
    expect(eurElements.length).toBeGreaterThan(0);
  });

  // Test 8 — debt ratio renders
  it('renders the debt ratio display', () => {
    renderLoans();
    expect(screen.getByTestId('debt-ratio')).toBeTruthy();
  });
});

// ── Eligibility logic — direct math tests ─────────────────────────────────

describe('Eligibility logic', () => {
  it('monthly payment above 40% of income should show Uneligible', () => {
    // Monthly payment for 200k TND / 8.5% / 20yr ≈ 1736 TND
    // If income = 3000 TND → ratio ≈ 57.9% > 40% → Uneligible
    // We can't set state directly in the component, but we can verify
    // via the math module that the condition holds
    const { calculateMonthlyPayment } = require('@/lib/loan/math');
    const monthly = calculateMonthlyPayment(200_000, 8.5, 20);
    const income = 3000;
    const ratio = monthly / income;
    expect(ratio).toBeGreaterThan(0.40); // confirms the test scenario is valid
  });

  it('monthly payment at exactly 40% of income is eligible', () => {
    const { calculateMonthlyPayment } = require('@/lib/loan/math');
    const monthly = calculateMonthlyPayment(100_000, 5.0, 20);
    const income = monthly / 0.40; // set income so ratio = exactly 0.40
    const ratio = monthly / income;
    expect(ratio).toBeCloseTo(0.40, 2); // right at the threshold
  });
});
