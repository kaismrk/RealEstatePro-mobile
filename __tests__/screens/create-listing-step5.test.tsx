import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const mockRouterReplace = jest.fn();
const mockRouterPush = jest.fn();
const mockRouterBack = jest.fn();
jest.mock('expo-router', () => ({
  router: {
    replace: (...args: unknown[]) => mockRouterReplace(...args),
    push: (...args: unknown[]) => mockRouterPush(...args),
    back: mockRouterBack,
  },
}));

// API mock
const mockApiPost = jest.fn();
jest.mock('@/lib/api/client', () => ({
  api: {
    post: (...args: unknown[]) => mockApiPost(...args),
    get: jest.fn(),
    delete: jest.fn(),
  },
}));

// UI store mock — pre-populated draft
const MOCK_DRAFT = {
  title: 'Test Apartment',
  listing_type: 'sale',
  property_type: 'apartment',
  price: 120000,
  country_code: 'TN',
  city: 'Tunis',
  address: '5 Rue de la Paix',
  address_disclosure_level: 'approximate',
  bedrooms: 2,
  bathrooms: 1,
  area_sqm: 80,
  description: 'A nice apartment',
  image_urls: [],
};

const mockClearDraft = jest.fn();
jest.mock('@/lib/stores/ui.store', () => ({
  useUIStore: (selector: (s: {
    createListingDraft: typeof MOCK_DRAFT | null;
    clearDraft: typeof mockClearDraft;
    setDraft: jest.Mock;
  }) => unknown) =>
    selector({
      createListingDraft: MOCK_DRAFT,
      clearDraft: mockClearDraft,
      setDraft: jest.fn(),
    }),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: {
        retry: false,
        // Prevent unhandled rejection warnings in tests
        onError: () => {},
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

import CreateStep5 from '@/app/listings/create/step-5';

function renderStep5() {
  const Wrapper = createWrapper();
  return render(React.createElement(Wrapper, null, React.createElement(CreateStep5)));
}

describe('CreateStep5 — Review & Submit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders review sections with draft data', () => {
    renderStep5();
    expect(screen.getByText('Review')).toBeTruthy();
    expect(screen.getByText('Basic Info')).toBeTruthy();
    expect(screen.getByText('Location')).toBeTruthy();
    expect(screen.getByText('Property Details')).toBeTruthy();
    expect(screen.getByText('Photos')).toBeTruthy();
  });

  it('shows quota modal on 402 QuotaExhaustedError', async () => {
    const quotaError = new Error('Listing quota exhausted.');
    quotaError.name = 'QuotaExhaustedError';
    mockApiPost.mockRejectedValueOnce(quotaError);

    renderStep5();

    await act(async () => {
      fireEvent.press(screen.getByText('Submit Listing'));
    });

    await waitFor(() =>
      expect(screen.getByText('Listing Quota Exhausted')).toBeTruthy()
    );
    expect(screen.getByText('Purchase a Pack')).toBeTruthy();
  });

  it('navigates to packs when "Purchase a Pack" is pressed in quota modal', async () => {
    const quotaError = new Error('Listing quota exhausted.');
    quotaError.name = 'QuotaExhaustedError';
    mockApiPost.mockRejectedValueOnce(quotaError);

    renderStep5();

    await act(async () => {
      fireEvent.press(screen.getByText('Submit Listing'));
    });

    await waitFor(() => expect(screen.getByText('Purchase a Pack')).toBeTruthy());
    fireEvent.press(screen.getByText('Purchase a Pack'));
    expect(mockRouterPush).toHaveBeenCalledWith('/listings/packs');
  });

  it('shows field errors on 422 validation error', async () => {
    const validationError = new Error('Validation failed');
    (validationError as unknown as { response: unknown }).response = {
      data: {
        detail: [
          { loc: ['body', 'price'], msg: 'Price must be positive' },
        ],
      },
    };
    mockApiPost.mockRejectedValueOnce(validationError);

    renderStep5();

    await act(async () => {
      fireEvent.press(screen.getByText('Submit Listing'));
    });

    await waitFor(() =>
      expect(screen.getByText('Please fix these issues:')).toBeTruthy()
    );
    expect(screen.getByText('• body.price — Price must be positive')).toBeTruthy();
  });

  it('clears draft and calls Alert on success', async () => {
    mockApiPost.mockResolvedValueOnce({
      data: { id: 99, title: 'Test Apartment', publish_status: 'pending' },
    });

    renderStep5();

    await act(async () => {
      fireEvent.press(screen.getByText('Submit Listing'));
    });

    await waitFor(() => expect(mockClearDraft).toHaveBeenCalled());
  });
});
