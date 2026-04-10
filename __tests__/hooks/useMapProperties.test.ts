import { renderHook, waitFor, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useMapProperties, radiusKmFromRegion } from '@/hooks/useMapProperties';

// Mock API client
const mockApiGet = jest.fn();
jest.mock('@/lib/api/client', () => ({
  api: {
    get: (...args: unknown[]) => mockApiGet(...args),
  },
}));

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

const TUNIS_REGION = {
  latitude: 36.8,
  longitude: 10.18,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

describe('radiusKmFromRegion', () => {
  it('computes radius as half of latitudeDelta * 111', () => {
    const radius = radiusKmFromRegion(TUNIS_REGION);
    // 0.1 * 111 / 2 = 5.55
    expect(radius).toBeCloseTo(5.55, 2);
  });

  it('returns larger radius for bigger latitudeDelta', () => {
    const smallRegion = { ...TUNIS_REGION, latitudeDelta: 0.1 };
    const bigRegion = { ...TUNIS_REGION, latitudeDelta: 2.0 };
    expect(radiusKmFromRegion(bigRegion)).toBeGreaterThan(radiusKmFromRegion(smallRegion));
  });

  it('returns 0 for latitudeDelta of 0', () => {
    const zeroRegion = { ...TUNIS_REGION, latitudeDelta: 0 };
    expect(radiusKmFromRegion(zeroRegion)).toBe(0);
  });
});

describe('useMapProperties', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does NOT fetch when enabled is false (initial state)', () => {
    renderHook(() => useMapProperties(TUNIS_REGION, { enabled: false }), {
      wrapper: makeWrapper(),
    });

    expect(mockApiGet).not.toHaveBeenCalled();
  });

  it('does NOT fetch when region is null', () => {
    renderHook(() => useMapProperties(null, { enabled: true }), {
      wrapper: makeWrapper(),
    });

    expect(mockApiGet).not.toHaveBeenCalled();
  });

  it('fetches with correct params when enabled and region is set', async () => {
    mockApiGet.mockResolvedValueOnce({
      data: { total: 3, items: [], page: 1, size: 20 },
    });

    const { result } = renderHook(
      () => useMapProperties(TUNIS_REGION, { enabled: true }),
      { wrapper: makeWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockApiGet).toHaveBeenCalledWith(
      '/properties/nearby',
      expect.objectContaining({
        params: expect.objectContaining({
          lat: TUNIS_REGION.latitude,
          lng: TUNIS_REGION.longitude,
          radius_km: expect.any(Number),
        }),
      })
    );
  });

  it('sends correct radius_km computed from latitudeDelta', async () => {
    mockApiGet.mockResolvedValueOnce({
      data: { total: 0, items: [], page: 1, size: 20 },
    });

    const region = { latitude: 33.0, longitude: 9.0, latitudeDelta: 2.0, longitudeDelta: 2.0 };
    // radius_km = 2.0 * 111 / 2 = 111

    const { result } = renderHook(
      () => useMapProperties(region, { enabled: true }),
      { wrapper: makeWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const callArgs = mockApiGet.mock.calls[0] as [string, { params: { radius_km: number } }];
    expect(callArgs[1].params.radius_km).toBeCloseTo(111, 0);
  });

  it('returns data from the API response', async () => {
    const mockItems = [{ id: 1, city: 'Tunis' }];
    mockApiGet.mockResolvedValueOnce({
      data: { total: 1, items: mockItems, page: 1, size: 20 },
    });

    const { result } = renderHook(
      () => useMapProperties(TUNIS_REGION, { enabled: true }),
      { wrapper: makeWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.total).toBe(1);
    expect(result.current.data?.items).toHaveLength(1);
  });

  it('returns error state on API failure', async () => {
    mockApiGet.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(
      () => useMapProperties(TUNIS_REGION, { enabled: true }),
      { wrapper: makeWrapper() }
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
