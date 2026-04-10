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

import { useSavedSearches } from '@/hooks/useSavedSearches';
import type { SavedSearchList, SavedSearchResponse, SavedSearchCreate } from '@/lib/types/saved_search';

const SAVED_SEARCH: SavedSearchResponse = {
  id: 1,
  user_id: 10,
  name: 'Search in Tunis',
  filters: {
    listing_type: 'sale',
    city: 'Tunis',
    min_bedrooms: 2,
  },
  country_code: 'TN',
  created_at: new Date().toISOString(),
};

const SEARCHES_LIST: SavedSearchList = {
  total: 1,
  items: [SAVED_SEARCH],
};

const EMPTY_LIST: SavedSearchList = {
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

describe('useSavedSearches', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('list query', () => {
    it('fetches saved searches from GET /saved-searches/', async () => {
      mockApiGet.mockResolvedValue({ data: SEARCHES_LIST });
      const { result } = renderHook(() => useSavedSearches(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.list.isSuccess).toBe(true));
      expect(result.current.list.data?.items).toHaveLength(1);
      expect(result.current.list.data?.items[0]?.name).toBe('Search in Tunis');
      expect(mockApiGet).toHaveBeenCalledWith('/saved-searches/');
    });
  });

  describe('create mutation', () => {
    it('calls POST /saved-searches/ with correct body', async () => {
      mockApiGet.mockResolvedValue({ data: EMPTY_LIST });
      mockApiPost.mockResolvedValue({ data: SAVED_SEARCH });

      const { result } = renderHook(() => useSavedSearches(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.list.isSuccess).toBe(true));

      const payload: SavedSearchCreate = {
        name: 'Search in Tunis',
        filters: {
          listing_type: 'sale',
          city: 'Tunis',
          min_bedrooms: 2,
        },
        country_code: 'TN',
      };

      act(() => {
        result.current.create.mutate(payload);
      });

      await waitFor(() => expect(result.current.create.isSuccess).toBe(true));
      expect(mockApiPost).toHaveBeenCalledWith('/saved-searches/', payload);
    });

    it('invalidates the saved-searches list query on success', async () => {
      mockApiGet.mockResolvedValue({ data: EMPTY_LIST });
      mockApiPost.mockResolvedValue({ data: SAVED_SEARCH });

      const { result } = renderHook(() => useSavedSearches(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.list.isSuccess).toBe(true));
      const callsBefore = mockApiGet.mock.calls.length;

      act(() => {
        result.current.create.mutate({
          name: 'Test',
          filters: {},
          country_code: 'TN',
        });
      });

      await waitFor(() => expect(result.current.create.isSuccess).toBe(true));
      // After invalidation, the list should refetch
      expect(mockApiGet.mock.calls.length).toBeGreaterThan(callsBefore);
    });
  });

  describe('remove mutation', () => {
    it('calls DELETE /saved-searches/:id', async () => {
      mockApiGet.mockResolvedValue({ data: SEARCHES_LIST });
      mockApiDelete.mockResolvedValue({ data: undefined });

      const { result } = renderHook(() => useSavedSearches(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.list.isSuccess).toBe(true));

      act(() => {
        result.current.remove.mutate(1);
      });

      await waitFor(() => expect(result.current.remove.isSuccess).toBe(true));
      expect(mockApiDelete).toHaveBeenCalledWith('/saved-searches/1');
    });

    it('applies optimistic update: removes item from cache immediately', async () => {
      let resolveDelete!: () => void;
      const deletePromise = new Promise<void>((res) => {
        resolveDelete = res;
      });

      mockApiGet.mockResolvedValue({ data: SEARCHES_LIST });
      mockApiDelete.mockReturnValue(
        deletePromise.then(() => ({ data: undefined }))
      );

      const { result } = renderHook(() => useSavedSearches(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.list.isSuccess).toBe(true));
      expect(result.current.list.data?.items).toHaveLength(1);

      act(() => {
        result.current.remove.mutate(1);
      });

      // Optimistic — item removed before server responds
      await waitFor(() =>
        expect(result.current.list.data?.items).toHaveLength(0)
      );

      act(() => {
        resolveDelete();
      });

      await waitFor(() => expect(result.current.remove.isSuccess).toBe(true));
    });

    it('invalidates the list query after delete settles', async () => {
      mockApiGet.mockResolvedValue({ data: SEARCHES_LIST });
      mockApiDelete.mockResolvedValue({ data: undefined });

      const { result } = renderHook(() => useSavedSearches(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.list.isSuccess).toBe(true));
      const callsBefore = mockApiGet.mock.calls.length;

      act(() => {
        result.current.remove.mutate(1);
      });

      await waitFor(() => expect(result.current.remove.isSuccess).toBe(true));
      expect(mockApiGet.mock.calls.length).toBeGreaterThan(callsBefore);
    });
  });
});
