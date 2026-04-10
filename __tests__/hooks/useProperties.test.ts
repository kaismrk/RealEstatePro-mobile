import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useProperties } from '@/hooks/useProperties';
import type { PropertyListResponse } from '@/lib/types/property';

// Mock the API client
const mockApiGet = jest.fn();
jest.mock('@/lib/api/client', () => ({
  api: {
    get: (...args: unknown[]) => mockApiGet(...args),
  },
}));

// Mock search store
let mockFilters = {};
let mockSortBy = 'date_desc';

jest.mock('@/lib/stores/search.store', () => ({
  useSearchStore: (
    selector: (s: { filters: typeof mockFilters; sortBy: string }) => unknown
  ) => selector({ filters: mockFilters, sortBy: mockSortBy }),
}));

function makeProperties(count: number, startId = 1) {
  return Array.from({ length: count }, (_, i) => ({
    id: startId + i,
    owner_id: 1,
    title: `Property ${startId + i}`,
    description: null,
    price: 100000 + i * 1000,
    listing_type: 'sale' as const,
    property_type: 'apartment' as const,
    // Cast at the array level instead of per-field
    address: null,
    city: 'Tunis',
    country_code: 'TN',
    latitude: null,
    longitude: null,
    area_sqm: 80,
    bedrooms: 2,
    bathrooms: 1,
    floor: null,
    image_urls: [],
    virtual_tour_url: null,
    publish_status: 'published',
    publishing_date: null,
    valid_until: null,
    exclusive_listing: null,
    availability: null,
    is_active: true,
    is_boosted: false,
    swimming_pool: null,
    garden: null,
    balcony: null,
    lift: null,
    parking_spots: null,
    garage_spots: null,
    energy_rating: null,
    heating_system: null,
    air_conditioner: null,
    kitchen: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    view_count: 0,
    rejection_reason: null,
    furnished: null,
    new_development: null,
    region_id: null,
    agency_id: null,
    year_of_construction: null,
    num_floors: null,
    land_plot_size_sqm: null,
  }));
}

function makeResponse(count: number, total: number, page = 1): PropertyListResponse {
  return {
    total,
    items: makeProperties(count, (page - 1) * 20 + 1) as unknown as import('@/lib/types/property').PropertySchema[],
    page,
    size: 20,
  };
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useProperties', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFilters = {};
    mockSortBy = 'date_desc';
  });

  it('returns paginated data with hasNextPage=true when page is full', async () => {
    mockApiGet.mockResolvedValueOnce({ data: makeResponse(20, 100, 1) });

    const { result } = renderHook(() => useProperties(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.pages[0].items).toHaveLength(20);
    expect(result.current.hasNextPage).toBe(true);
  });

  it('returns hasNextPage=false when last page has fewer than 20 items', async () => {
    mockApiGet.mockResolvedValueOnce({ data: makeResponse(7, 7, 1) });

    const { result } = renderHook(() => useProperties(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.pages[0].items).toHaveLength(7);
    expect(result.current.hasNextPage).toBe(false);
  });

  it('returns empty items when response has 0 items', async () => {
    mockApiGet.mockResolvedValueOnce({ data: makeResponse(0, 0, 1) });

    const { result } = renderHook(() => useProperties(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.pages[0].items).toHaveLength(0);
    expect(result.current.hasNextPage).toBe(false);
  });

  it('uses different queryKey when filters change', async () => {
    mockApiGet.mockResolvedValue({ data: makeResponse(5, 5, 1) });

    const { result, rerender } = renderHook(() => useProperties(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const firstCallCount = mockApiGet.mock.calls.length;

    // Simulate filter change
    mockFilters = { listing_type: 'rent' };
    rerender({});

    await waitFor(() => expect(mockApiGet.mock.calls.length).toBeGreaterThan(firstCallCount));
    // Second call should include the listing_type filter
    const secondCallArgs = mockApiGet.mock.calls[firstCallCount];
    expect(secondCallArgs[1]?.params?.listing_type).toBe('rent');
  });

  it('sends sort param to the API', async () => {
    mockSortBy = 'price_asc';
    mockApiGet.mockResolvedValueOnce({ data: makeResponse(5, 5, 1) });

    const { result } = renderHook(() => useProperties(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const callArgs = mockApiGet.mock.calls[0];
    expect(callArgs[1]?.params?.sort).toBe('price_asc');
  });

  it('increments page on fetchNextPage', async () => {
    mockApiGet
      .mockResolvedValueOnce({ data: makeResponse(20, 40, 1) })
      .mockResolvedValueOnce({ data: makeResponse(20, 40, 2) });

    const { result } = renderHook(() => useProperties(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    result.current.fetchNextPage();

    await waitFor(() => expect(result.current.data?.pages).toHaveLength(2));
    const secondCallArgs = mockApiGet.mock.calls[1];
    expect(secondCallArgs[1]?.params?.page).toBe(2);
  });
});
