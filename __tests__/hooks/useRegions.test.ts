import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useTopLevelRegions, useChildRegions } from '@/hooks/useRegions';
import type { RegionListResponse } from '@/hooks/useRegions';

// Mock the API client
const mockApiGet = jest.fn();
jest.mock('@/lib/api/client', () => ({
  api: {
    get: (...args: unknown[]) => mockApiGet(...args),
  },
}));

function makeRegionList(level: string, count = 3): RegionListResponse {
  return {
    total: count,
    items: Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      name: `${level} ${i + 1}`,
      level,
      country_code: 'TN',
      parent_id: null,
      code: null,
      created_at: new Date().toISOString(),
    })),
  };
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useTopLevelRegions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('constructs params { country_code: "TN", level: "region" } for useTopLevelRegions("TN")', async () => {
    mockApiGet.mockResolvedValueOnce({ data: makeRegionList('region') });

    const { result } = renderHook(() => useTopLevelRegions('TN'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockApiGet).toHaveBeenCalledWith(
      '/admin/regions/',
      expect.objectContaining({
        params: expect.objectContaining({
          country_code: 'TN',
          level: 'region',
        }),
      })
    );
  });

  it('returns region items from the API response', async () => {
    const mockData = makeRegionList('region', 5);
    mockApiGet.mockResolvedValueOnce({ data: mockData });

    const { result } = renderHook(() => useTopLevelRegions('TN'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.items).toHaveLength(5);
    expect(result.current.data?.items[0].level).toBe('region');
  });

  it('is disabled when countryCode is null', () => {
    const { result } = renderHook(() => useTopLevelRegions(null), {
      wrapper: createWrapper(),
    });

    // Query should not fire — status remains 'pending' with fetchStatus 'idle'
    expect(result.current.fetchStatus).toBe('idle');
    expect(mockApiGet).not.toHaveBeenCalled();
  });

  it('is disabled when countryCode is empty string', () => {
    const { result } = renderHook(() => useTopLevelRegions(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockApiGet).not.toHaveBeenCalled();
  });

  it('handles empty items list gracefully', async () => {
    mockApiGet.mockResolvedValueOnce({ data: { total: 0, items: [] } });

    const { result } = renderHook(() => useTopLevelRegions('MA'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.items).toHaveLength(0);
    expect(result.current.data?.total).toBe(0);
  });

  it('uses staleTime: Infinity (data is cached without refetch)', async () => {
    mockApiGet.mockResolvedValue({ data: makeRegionList('region', 2) });

    const { result } = renderHook(() => useTopLevelRegions('TN'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // staleTime: Infinity means isStale should be false
    expect(result.current.isStale).toBe(false);
  });
});

describe('useChildRegions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('constructs params { parent_id: 5 } for useChildRegions(5)', async () => {
    mockApiGet.mockResolvedValueOnce({ data: makeRegionList('department') });

    const { result } = renderHook(() => useChildRegions(5), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockApiGet).toHaveBeenCalledWith(
      '/admin/regions/',
      expect.objectContaining({
        params: expect.objectContaining({ parent_id: 5 }),
      })
    );
  });

  it('is disabled when parentId is null', () => {
    const { result } = renderHook(() => useChildRegions(null), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockApiGet).not.toHaveBeenCalled();
  });

  it('fetches children for region (departments)', async () => {
    const mockData = makeRegionList('department', 3);
    mockApiGet.mockResolvedValueOnce({ data: mockData });

    const { result } = renderHook(() => useChildRegions(1), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.items).toHaveLength(3);
    expect(result.current.data?.items[0].level).toBe('department');
  });

  it('fetches children for department (cities)', async () => {
    const mockData = makeRegionList('city', 4);
    mockApiGet.mockResolvedValueOnce({ data: mockData });

    const { result } = renderHook(() => useChildRegions(10), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.items).toHaveLength(4);
  });

  it('cascading: separate hooks use separate queryKeys', async () => {
    mockApiGet.mockResolvedValue({ data: makeRegionList('department', 2) });

    const wrapper = createWrapper();
    const { result: result1 } = renderHook(() => useChildRegions(1), { wrapper });
    const { result: result2 } = renderHook(() => useChildRegions(2), { wrapper });

    await waitFor(() => expect(result1.current.isSuccess).toBe(true));
    await waitFor(() => expect(result2.current.isSuccess).toBe(true));

    // Both hooks should have fired independently
    expect(mockApiGet.mock.calls.length).toBeGreaterThanOrEqual(2);
    const firstCallParentId = mockApiGet.mock.calls[0][1]?.params?.parent_id;
    const secondCallParentId = mockApiGet.mock.calls[1][1]?.params?.parent_id;
    expect(firstCallParentId).not.toBe(secondCallParentId);
  });

  it('handles empty children gracefully (country may not have seeded regions)', async () => {
    mockApiGet.mockResolvedValueOnce({ data: { total: 0, items: [] } });

    const { result } = renderHook(() => useChildRegions(999), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.items).toHaveLength(0);
  });
});
