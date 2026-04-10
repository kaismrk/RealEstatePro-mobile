import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Expo-router mock
const mockRouterReplace = jest.fn();
const mockRouterBack = jest.fn();
jest.mock('expo-router', () => ({
  router: {
    replace: (...args: unknown[]) => mockRouterReplace(...args),
    back: (...args: unknown[]) => mockRouterBack(...args),
    push: jest.fn(),
  },
}));

// Toast mock
jest.mock('react-native-toast-message', () => ({
  __esModule: true,
  default: {
    show: jest.fn(),
  },
}));

// Haptics mock
jest.mock('@/lib/utils/haptics', () => ({
  haptic: {
    light: jest.fn(),
    medium: jest.fn(),
    heavy: jest.fn(),
    success: jest.fn(),
    warning: jest.fn(),
    error: jest.fn(),
  },
}));

// API client mock
const mockApiPost = jest.fn();
jest.mock('@/lib/api/client', () => ({
  api: {
    get: jest.fn(),
    post: (...args: unknown[]) => mockApiPost(...args),
    delete: jest.fn(),
  },
}));

// Mutable stores
let mockAccessToken: string | null = null;
let mockCountryCode = 'TN';
jest.mock('@/lib/stores/auth.store', () => ({
  useAuthStore: (selector: (s: { accessToken: string | null; countryCode: string }) => unknown) =>
    selector({ accessToken: mockAccessToken, countryCode: mockCountryCode }),
}));

let mockOnboardingDraft: {
  intent?: string;
  region_id?: number;
  region_label?: string;
  min_price?: number;
  max_price?: number;
  min_bedrooms?: number;
  max_bedrooms?: number;
} = {};
const mockClearOnboardingDraft = jest.fn();
const mockSetFilters = jest.fn();

jest.mock('@/lib/stores/ui.store', () => ({
  useUIStore: (selector: (s: {
    onboardingDraft: typeof mockOnboardingDraft;
    clearOnboardingDraft: typeof mockClearOnboardingDraft;
  }) => unknown) =>
    selector({
      onboardingDraft: mockOnboardingDraft,
      clearOnboardingDraft: mockClearOnboardingDraft,
    }),
}));

jest.mock('@/lib/stores/search.store', () => ({
  useSearchStore: (selector: (s: { setFilters: typeof mockSetFilters }) => unknown) =>
    selector({ setFilters: mockSetFilters }),
}));

import OnboardingStep5 from '@/app/onboarding/step-5';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

function renderStep5() {
  const Wrapper = createWrapper();
  return render(
    React.createElement(Wrapper, null, React.createElement(OnboardingStep5))
  );
}

describe('OnboardingStep5 — Summary & Finish', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAccessToken = null;
    mockCountryCode = 'TN';
    mockOnboardingDraft = {
      intent: 'buy',
      region_label: 'Tunis',
      min_price: 100000,
      max_price: 500000,
      min_bedrooms: 2,
    };
  });

  it('renders the summary with collected preferences', () => {
    renderStep5();
    expect(screen.getByText('Your search preferences')).toBeTruthy();
    expect(screen.getByText('Buy')).toBeTruthy();
    expect(screen.getByText('Tunis')).toBeTruthy();
    expect(screen.getByText('100,000 – 500,000')).toBeTruthy();
    expect(screen.getByText('2+ bedrooms')).toBeTruthy();
  });

  it('does not show save search toggle for guests', () => {
    mockAccessToken = null;
    renderStep5();
    expect(screen.queryByText('Save my search')).toBeNull();
  });

  it('shows save search toggle for authenticated users', () => {
    mockAccessToken = 'valid-token';
    renderStep5();
    expect(screen.getByText('Save my search')).toBeTruthy();
  });

  it('guest: pressing Finish applies filters and navigates to search without API call', async () => {
    mockAccessToken = null;
    renderStep5();
    fireEvent.press(screen.getByText('Find Homes'));

    await waitFor(() => {
      expect(mockSetFilters).toHaveBeenCalledWith(
        expect.objectContaining({
          listing_type: 'buy',
          min_price: 100000,
          max_price: 500000,
          min_bedrooms: 2,
        })
      );
      expect(mockClearOnboardingDraft).toHaveBeenCalled();
      expect(mockRouterReplace).toHaveBeenCalledWith('/(tabs)/search');
    });

    // No API call made
    expect(mockApiPost).not.toHaveBeenCalled();
  });

  it('authenticated: pressing Finish calls POST /saved-searches/ and navigates to search', async () => {
    mockAccessToken = 'valid-token';
    mockApiPost.mockResolvedValueOnce({
      data: {
        id: 1,
        user_id: 5,
        name: 'My search in Tunis',
        filters: {},
        country_code: 'TN',
        created_at: '2026-04-07T00:00:00Z',
      },
    });

    renderStep5();
    fireEvent.press(screen.getByText('Find Homes'));

    await waitFor(() => {
      expect(mockSetFilters).toHaveBeenCalled();
      expect(mockClearOnboardingDraft).toHaveBeenCalled();
      expect(mockRouterReplace).toHaveBeenCalledWith('/(tabs)/search');
    });

    expect(mockApiPost).toHaveBeenCalledWith(
      '/saved-searches/',
      expect.objectContaining({
        name: expect.stringContaining('Tunis'),
        country_code: 'TN',
      })
    );
  });

  it('applies region_id to search filters when region_id is set', async () => {
    mockAccessToken = null;
    mockOnboardingDraft = { ...mockOnboardingDraft, region_id: 42 };
    renderStep5();
    fireEvent.press(screen.getByText('Find Homes'));

    await waitFor(() => {
      expect(mockSetFilters).toHaveBeenCalledWith(
        expect.objectContaining({ region_id: 42 })
      );
    });
  });

  it('shows Anywhere when no region is selected', () => {
    mockOnboardingDraft = { intent: 'rent' };
    renderStep5();
    expect(screen.getByText('Anywhere')).toBeTruthy();
  });

  it('shows Any budget when no prices are set', () => {
    mockOnboardingDraft = { intent: 'browse' };
    renderStep5();
    expect(screen.getByText('Any budget')).toBeTruthy();
  });

  it('shows Not set when no intent is selected', () => {
    mockOnboardingDraft = {};
    renderStep5();
    expect(screen.getByText('Not set')).toBeTruthy();
  });
});
