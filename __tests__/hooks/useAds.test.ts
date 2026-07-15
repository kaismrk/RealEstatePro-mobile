/**
 * Tests for hooks/useAds.ts — the /ads/serve query.
 *
 * Key guarantees:
 *  - passes the current search filters as targeting params
 *  - NEVER errors: any failure resolves to { settings: defaults, ads: [] }
 *    so the property feed is never blocked.
 */

import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useAds } from '@/hooks/useAds';
import type { AdServeResponse } from '@/lib/types/ad';

// Mock the API client
const mockApiGet = jest.fn();
jest.mock('@/lib/api/client', () => ({
  api: {
    get: (...args: unknown[]) => mockApiGet(...args),
  },
}));

// Mock search store
let mockFilters: { property_type?: string; listing_type?: string } = {};
jest.mock('@/lib/stores/search.store', () => ({
  useSearchStore: (selector: (s: { filters: typeof mockFilters }) => unknown) =>
    selector({ filters: mockFilters }),
}));

const serveResponse: AdServeResponse = {
  settings: { first_position: 2, interval: 5 },
  ads: [
    {
      id: 12,
      media_type: 'image',
      media_url: '/uploads/ads/12/creative.jpg',
      thumbnail_url: null,
      title: '0% intro rate',
      body: 'Limited time offer',
      cta_label: 'Learn more',
      cta_action: 'web',
      cta_value: 'https://bank.tn',
      advertiser_name: 'Best Bank',
    },
  ],
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useAds', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFilters = {};
  });

  it('returns server settings and ads on success', async () => {
    mockApiGet.mockResolvedValueOnce({ data: serveResponse });

    const { result } = renderHook(() => useAds(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.settings).toEqual({ first_position: 2, interval: 5 });
    expect(result.current.data?.ads).toHaveLength(1);
    expect(result.current.data?.ads[0].advertiser_name).toBe('Best Bank');

    const [url, config] = mockApiGet.mock.calls[0];
    expect(url).toBe('/ads/serve');
    expect(config?.params?.placement).toBe('search_results');
    expect(config?.params?.limit).toBe(5);
    // no filters set → no targeting params sent
    expect(config?.params?.property_type).toBeUndefined();
    expect(config?.params?.transaction_type).toBeUndefined();
  });

  it('maps search filters to targeting params (listing_type → transaction_type)', async () => {
    mockFilters = { property_type: 'apartment', listing_type: 'rent' };
    mockApiGet.mockResolvedValueOnce({ data: serveResponse });

    const { result } = renderHook(() => useAds(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const [, config] = mockApiGet.mock.calls[0];
    expect(config?.params?.property_type).toBe('apartment');
    expect(config?.params?.transaction_type).toBe('rent');
  });

  it('falls back to empty ads + default settings on error (never blocks the feed)', async () => {
    mockApiGet.mockRejectedValueOnce(new Error('500 server exploded'));

    const { result } = renderHook(() => useAds(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.isError).toBe(false);
    expect(result.current.data).toEqual({
      settings: { first_position: 3, interval: 7 },
      ads: [],
    });
  });

  it('tolerates a malformed response body', async () => {
    mockApiGet.mockResolvedValueOnce({ data: {} });

    const { result } = renderHook(() => useAds(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({
      settings: { first_position: 3, interval: 7 },
      ads: [],
    });
  });
});
