import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useProperty } from '@/hooks/useProperty';
import type { PropertySchema } from '@/lib/types/property';

const mockApiGet = jest.fn();
jest.mock('@/lib/api/client', () => ({
  api: {
    get: (...args: unknown[]) => mockApiGet(...args),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

const MOCK_PROPERTY: PropertySchema = {
  id: 42,
  owner_id: 1,
  title: 'Beach Villa',
  description: 'Stunning sea view',
  price: 500000,
  listing_type: 'sale',
  property_type: 'villa',
  address: '10 Beach Road',
  city: 'Sousse',
  country_code: 'TN',
  latitude: 35.8,
  longitude: 10.6,
  area_sqm: 300,
  bedrooms: 5,
  bathrooms: 3,
  floor: null,
  image_urls: ['https://example.com/img1.jpg'],
  virtual_tour_url: null,
  publish_status: 'published',
  publishing_date: null,
  valid_until: null,
  exclusive_listing: true,
  availability: null,
  is_active: true,
  is_boosted: false,
  swimming_pool: true,
  garden: true,
  balcony: true,
  lift: null,
  parking_spots: 2,
  garage_spots: null,
  energy_rating: 'A',
  heating_system: 'central',
  air_conditioner: 'split',
  kitchen: 'open',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  view_count: 124,
  rejection_reason: null,
  furnished: true,
  new_development: false,
  region_id: 3,
  agency_id: null,
  year_of_construction: 2020,
  num_floors: 2,
  land_plot_size_sqm: 800,
};

describe('useProperty', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches property by id', async () => {
    mockApiGet.mockResolvedValueOnce({ data: MOCK_PROPERTY });

    const { result } = renderHook(() => useProperty(42), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(MOCK_PROPERTY);
    expect(mockApiGet).toHaveBeenCalledWith('/properties/42');
  });

  it('calls the correct endpoint with string id', async () => {
    mockApiGet.mockResolvedValueOnce({ data: MOCK_PROPERTY });

    const { result } = renderHook(() => useProperty('42'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockApiGet).toHaveBeenCalledWith('/properties/42');
  });

  it('does not fetch when id is undefined', () => {
    renderHook(() => useProperty(undefined), {
      wrapper: createWrapper(),
    });

    expect(mockApiGet).not.toHaveBeenCalled();
  });

  it('returns error state on API failure', async () => {
    mockApiGet.mockRejectedValueOnce(new Error('Not Found'));

    const { result } = renderHook(() => useProperty(99), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeTruthy();
  });

  it('returns isLoading=true while fetching', () => {
    mockApiGet.mockImplementation(() => new Promise(() => {})); // never resolves

    const { result } = renderHook(() => useProperty(42), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });
});
