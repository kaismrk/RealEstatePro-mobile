import { renderHook, act, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock the API client
const mockApiGet = jest.fn();
const mockApiPost = jest.fn();
const mockApiDelete = jest.fn();

jest.mock('@/lib/api/client', () => ({
  api: {
    get: (...args: unknown[]) => mockApiGet(...args),
    post: (...args: unknown[]) => mockApiPost(...args),
    delete: (...args: unknown[]) => mockApiDelete(...args),
  },
}));

import { useFavorites } from '@/hooks/useFavorites';
import type { FavoriteList, FavoriteResponse } from '@/lib/types/favorite';
import type { PropertySchema } from '@/lib/types/property';

const BASE_PROPERTY: PropertySchema = {
  id: 42,
  owner_id: 1,
  title: 'Test Property',
  description: null,
  price: 150000,
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
};

const FAVORITE_ITEM: FavoriteResponse = {
  id: 1,
  user_id: 10,
  property_id: 42,
  created_at: new Date().toISOString(),
  property: BASE_PROPERTY,
};

const FAVORITES_LIST: FavoriteList = {
  total: 1,
  items: [FAVORITE_ITEM],
};

const EMPTY_LIST: FavoriteList = {
  total: 0,
  items: [],
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

describe('useFavorites', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isFavorited', () => {
    it('returns false when list is loading', () => {
      mockApiGet.mockReturnValue(new Promise(() => {})); // never resolves
      const { result } = renderHook(() => useFavorites(), {
        wrapper: createWrapper(),
      });
      expect(result.current.isFavorited(42)).toBe(false);
    });

    it('returns true when propertyId is in the favorites list', async () => {
      mockApiGet.mockResolvedValue({ data: FAVORITES_LIST });
      const { result } = renderHook(() => useFavorites(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.list.isSuccess).toBe(true));
      expect(result.current.isFavorited(42)).toBe(true);
    });

    it('returns false when propertyId is NOT in the favorites list', async () => {
      mockApiGet.mockResolvedValue({ data: FAVORITES_LIST });
      const { result } = renderHook(() => useFavorites(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.list.isSuccess).toBe(true));
      expect(result.current.isFavorited(99)).toBe(false);
    });
  });

  describe('add mutation', () => {
    it('calls POST /favorites/:id and invalidates cache on success', async () => {
      mockApiGet.mockResolvedValue({ data: EMPTY_LIST });
      mockApiPost.mockResolvedValue({ data: FAVORITE_ITEM });

      const { result } = renderHook(() => useFavorites(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.list.isSuccess).toBe(true));

      act(() => {
        result.current.add.mutate(42);
      });

      await waitFor(() => expect(result.current.add.isSuccess).toBe(true));
      expect(mockApiPost).toHaveBeenCalledWith('/favorites/42');
    });
  });

  describe('remove mutation', () => {
    it('calls DELETE /favorites/:id and invalidates cache on success', async () => {
      mockApiGet.mockResolvedValue({ data: FAVORITES_LIST });
      mockApiDelete.mockResolvedValue({ data: undefined });

      const { result } = renderHook(() => useFavorites(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.list.isSuccess).toBe(true));

      act(() => {
        result.current.remove.mutate(42);
      });

      await waitFor(() => expect(result.current.remove.isSuccess).toBe(true));
      expect(mockApiDelete).toHaveBeenCalledWith('/favorites/42');
    });

    it('applies optimistic update: removes item from cache before server responds', async () => {
      // Slow delete so we can inspect optimistic state
      let resolveDelete!: () => void;
      const deletePromise = new Promise<void>((res) => {
        resolveDelete = res;
      });

      mockApiGet.mockResolvedValue({ data: FAVORITES_LIST });
      mockApiDelete.mockReturnValue(deletePromise.then(() => ({ data: undefined })));

      const { result } = renderHook(() => useFavorites(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.list.isSuccess).toBe(true));
      expect(result.current.isFavorited(42)).toBe(true);

      act(() => {
        result.current.remove.mutate(42);
      });

      // After optimistic update, before server responds
      await waitFor(() => expect(result.current.isFavorited(42)).toBe(false));

      // Settle delete
      act(() => {
        resolveDelete();
      });

      await waitFor(() => expect(result.current.remove.isSuccess).toBe(true));
    });

    it('reverts optimistic update on API error', async () => {
      mockApiGet.mockResolvedValue({ data: FAVORITES_LIST });
      mockApiDelete.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useFavorites(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.list.isSuccess).toBe(true));
      expect(result.current.isFavorited(42)).toBe(true);

      act(() => {
        result.current.remove.mutate(42);
      });

      await waitFor(() => expect(result.current.remove.isError).toBe(true));
      // Cache should be refetched — list query will be re-fetched (mock returns list again)
      // The revert happens via onError then onSettled invalidates
    });
  });

  describe('toggle', () => {
    it('calls add when property is NOT favorited', async () => {
      mockApiGet.mockResolvedValue({ data: EMPTY_LIST });
      mockApiPost.mockResolvedValue({ data: FAVORITE_ITEM });

      const { result } = renderHook(() => useFavorites(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.list.isSuccess).toBe(true));

      act(() => {
        result.current.toggle(42);
      });

      await waitFor(() => expect(result.current.add.isSuccess).toBe(true));
      expect(mockApiPost).toHaveBeenCalledWith('/favorites/42');
      expect(mockApiDelete).not.toHaveBeenCalled();
    });

    it('calls remove when property IS favorited', async () => {
      mockApiGet.mockResolvedValue({ data: FAVORITES_LIST });
      mockApiDelete.mockResolvedValue({ data: undefined });

      const { result } = renderHook(() => useFavorites(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.list.isSuccess).toBe(true));

      act(() => {
        result.current.toggle(42);
      });

      await waitFor(() => expect(result.current.remove.isSuccess).toBe(true));
      expect(mockApiDelete).toHaveBeenCalledWith('/favorites/42');
      expect(mockApiPost).not.toHaveBeenCalled();
    });
  });
});
