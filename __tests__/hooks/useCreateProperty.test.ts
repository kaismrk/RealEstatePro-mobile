import { renderHook, waitFor, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useCreateProperty } from '@/hooks/useCreateProperty';
import type { PropertyCreatePayload } from '@/hooks/useCreateProperty';

// Mock the API client
const mockApiPost = jest.fn();
jest.mock('@/lib/api/client', () => ({
  api: {
    post: (...args: unknown[]) => mockApiPost(...args),
    get: jest.fn(),
    delete: jest.fn(),
  },
}));

const MOCK_PAYLOAD: PropertyCreatePayload = {
  title: 'Test Apartment',
  listing_type: 'sale',
  property_type: 'apartment',
  price: 150000,
  country_code: 'TN',
  city: 'Tunis',
};

const MOCK_PROPERTY = {
  id: 42,
  owner_id: 1,
  title: 'Test Apartment',
  listing_type: 'sale',
  property_type: 'apartment',
  price: 150000,
  country_code: 'TN',
  city: 'Tunis',
  description: null,
  address: null,
  publish_status: 'pending',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: {
        retry: false,
        // Suppress error throwing in tests to avoid unhandled rejection warnings
        onError: () => {},
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useCreateProperty', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls POST /properties/ with the payload and returns the created property', async () => {
    mockApiPost.mockResolvedValueOnce({ data: MOCK_PROPERTY });

    const { result } = renderHook(() => useCreateProperty(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate(MOCK_PAYLOAD);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockApiPost).toHaveBeenCalledWith('/properties/', MOCK_PAYLOAD);
    expect(result.current.data).toEqual(MOCK_PROPERTY);
  });

  it('surfaces QuotaExhaustedError when API returns a 402-like error', async () => {
    // Simulate the api client throwing a QuotaExhaustedError (as configured in client.ts)
    const quotaError = new Error('Listing quota exhausted. Purchase a listing pack to continue.');
    quotaError.name = 'QuotaExhaustedError';
    mockApiPost.mockRejectedValueOnce(quotaError);

    const { result } = renderHook(() => useCreateProperty(), {
      wrapper: createWrapper(),
    });

    const capturedErrors: Error[] = [];
    await act(async () => {
      result.current.mutate(MOCK_PAYLOAD, {
        onError: (err) => {
          capturedErrors.push(err);
        },
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error?.name).toBe('QuotaExhaustedError');
    expect(result.current.error?.message).toContain('quota exhausted');
    expect(capturedErrors).toHaveLength(1);
    expect(capturedErrors[0].name).toBe('QuotaExhaustedError');
  });

  it('surfaces a generic error for non-402 failures', async () => {
    const networkError = new Error('Network Error');
    mockApiPost.mockRejectedValueOnce(networkError);

    const { result } = renderHook(() => useCreateProperty(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate(MOCK_PAYLOAD, { onError: () => {} });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error?.name).not.toBe('QuotaExhaustedError');
    expect(result.current.error?.message).toBe('Network Error');
  });

  it('is in idle state before mutation is called', () => {
    const { result } = renderHook(() => useCreateProperty(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isPending).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(false);
  });
});
