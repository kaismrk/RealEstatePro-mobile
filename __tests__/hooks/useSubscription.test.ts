import { renderHook, act, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

const mockApiGet = jest.fn();
const mockApiPost = jest.fn();

jest.mock('@/lib/api/client', () => ({
  api: {
    get: (...args: unknown[]) => mockApiGet(...args),
    post: (...args: unknown[]) => mockApiPost(...args),
  },
}));

import {
  useSubscription,
  useSubscribe,
  useCancelSubscription,
} from '@/hooks/useSubscription';
import type { SubscriptionResponse } from '@/hooks/useSubscription';

const MOCK_PLAN = {
  id: 2,
  name: 'Professional',
  price: 79,
  listing_limit: 50,
  billing_cycle: 'monthly' as const,
  country_code: 'TN',
  is_active: true,
  created_at: '2026-01-01T00:00:00Z',
};

const MOCK_SUBSCRIPTION: SubscriptionResponse = {
  id: 10,
  agency_id: 1,
  plan_id: 2,
  status: 'active',
  starts_at: '2026-01-01',
  expires_at: '2026-02-01',
  country_code: 'TN',
  created_at: '2026-01-01T00:00:00Z',
  plan: MOCK_PLAN,
};

const CANCELLED_SUBSCRIPTION: SubscriptionResponse = {
  ...MOCK_SUBSCRIPTION,
  status: 'cancelled',
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('useSubscription', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches active subscription for an agency', async () => {
    mockApiGet.mockResolvedValue({ data: MOCK_SUBSCRIPTION });
    const { result } = renderHook(() => useSubscription(1), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.status).toBe('active');
    expect(result.current.data?.plan?.name).toBe('Professional');
    expect(mockApiGet).toHaveBeenCalledWith('/agencies/1/subscription');
  });

  it('returns null gracefully when no subscription exists (404)', async () => {
    mockApiGet.mockRejectedValue({ response: { status: 404 } });
    const { result } = renderHook(() => useSubscription(1), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
  });

  it('does not fetch when agencyId is null', () => {
    const { result } = renderHook(() => useSubscription(null), { wrapper: createWrapper() });
    expect(result.current.fetchStatus).toBe('idle');
    expect(mockApiGet).not.toHaveBeenCalled();
  });
});

describe('useSubscribe', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls POST /agencies/{id}/subscribe with plan_id', async () => {
    mockApiPost.mockResolvedValue({ data: MOCK_SUBSCRIPTION });

    const { result } = renderHook(() => useSubscribe(), { wrapper: createWrapper() });

    act(() => {
      result.current.mutate({ agencyId: 1, planId: 2 });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockApiPost).toHaveBeenCalledWith('/agencies/1/subscribe', { plan_id: 2 });
    expect(result.current.data?.status).toBe('active');
  });

  it('propagates 409 error when agency already has an active subscription', async () => {
    mockApiPost.mockRejectedValue({
      response: { status: 409, data: { detail: 'Agency already has an active subscription' } },
    });

    const { result } = renderHook(() => useSubscribe(), { wrapper: createWrapper() });

    act(() => {
      result.current.mutate({ agencyId: 1, planId: 2 });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('useCancelSubscription', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls POST /agencies/{id}/cancel-subscription', async () => {
    mockApiPost.mockResolvedValue({ data: CANCELLED_SUBSCRIPTION });

    const { result } = renderHook(() => useCancelSubscription(), { wrapper: createWrapper() });

    act(() => {
      result.current.mutate(1);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockApiPost).toHaveBeenCalledWith('/agencies/1/cancel-subscription');
    expect(result.current.data?.status).toBe('cancelled');
  });

  it('returns cancelled status after successful cancellation', async () => {
    mockApiPost.mockResolvedValue({ data: CANCELLED_SUBSCRIPTION });

    const { result } = renderHook(() => useCancelSubscription(), { wrapper: createWrapper() });

    act(() => {
      result.current.mutate(1);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.status).toBe('cancelled');
  });
});
