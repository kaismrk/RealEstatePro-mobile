import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useMyListings } from '@/hooks/useMyListings';
import type { PropertyListResponse } from '@/lib/types/property';

// Mock API client
const mockApiGet = jest.fn();
jest.mock('@/lib/api/client', () => ({
  api: {
    get: (...args: unknown[]) => mockApiGet(...args),
  },
}));

// Mock auth store — default with a token
let mockAccessToken: string | null = 'valid-token';
jest.mock('@/lib/stores/auth.store', () => ({
  useAuthStore: (selector: (s: { accessToken: string | null }) => unknown) =>
    selector({ accessToken: mockAccessToken }),
}));

const MOCK_RESPONSE: PropertyListResponse = {
  total: 2,
  page: 1,
  size: 20,
  items: [
    {
      id: 1,
      owner_id: 1,
      title: 'My Apartment',
      description: null,
      price: 120000,
      listing_type: 'sale',
      property_type: 'apartment',
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
      publish_status: 'pending',
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
      view_count: 5,
      rejection_reason: null,
      furnished: null,
      new_development: null,
      region_id: null,
      agency_id: null,
      year_of_construction: null,
      num_floors: null,
      land_plot_size_sqm: null,
    },
    {
      id: 2,
      owner_id: 1,
      title: 'My Villa',
      description: 'A nice villa',
      price: 350000,
      listing_type: 'sale',
      property_type: 'villa',
      address: '5 Avenue Habib Bourguiba',
      city: 'Sfax',
      country_code: 'TN',
      latitude: null,
      longitude: null,
      area_sqm: 200,
      bedrooms: 4,
      bathrooms: 3,
      floor: null,
      image_urls: ['https://example.com/photo.jpg'],
      virtual_tour_url: null,
      publish_status: 'published',
      publishing_date: null,
      valid_until: null,
      exclusive_listing: null,
      availability: null,
      is_active: true,
      is_boosted: true,
      swimming_pool: true,
      garden: true,
      balcony: null,
      lift: null,
      parking_spots: 2,
      garage_spots: null,
      energy_rating: null,
      heating_system: null,
      air_conditioner: null,
      kitchen: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      view_count: 100,
      rejection_reason: null,
      furnished: null,
      new_development: null,
      region_id: null,
      agency_id: null,
      year_of_construction: null,
      num_floors: null,
      land_plot_size_sqm: null,
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

describe('useMyListings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAccessToken = 'valid-token';
  });

  it('fetches /properties/my and returns items', async () => {
    mockApiGet.mockResolvedValueOnce({ data: MOCK_RESPONSE });

    const { result } = renderHook(() => useMyListings(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockApiGet).toHaveBeenCalledWith('/properties/my');
    expect(result.current.data?.items).toHaveLength(2);
    expect(result.current.data?.items[0].publish_status).toBe('pending');
    expect(result.current.data?.items[1].publish_status).toBe('published');
  });

  it('is disabled when user is not authenticated', () => {
    mockAccessToken = null;

    const { result } = renderHook(() => useMyListings(), { wrapper: createWrapper() });

    expect(result.current.isFetching).toBe(false);
    expect(mockApiGet).not.toHaveBeenCalled();
  });

  it('returns empty items when API returns empty list', async () => {
    mockApiGet.mockResolvedValueOnce({ data: { total: 0, items: [], page: 1, size: 20 } });

    const { result } = renderHook(() => useMyListings(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.items).toHaveLength(0);
  });

  it('sets isError on API failure', async () => {
    mockApiGet.mockRejectedValueOnce(new Error('Server error'));

    const { result } = renderHook(() => useMyListings(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
