import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { useSearchStore } from '@/lib/stores/search.store';
import type { PropertyListResponse } from '@/lib/types/property';

const PAGE_SIZE = 20;

export function useProperties() {
  const filters = useSearchStore((s) => s.filters);
  const sortBy = useSearchStore((s) => s.sortBy);

  return useInfiniteQuery({
    queryKey: ['properties', filters, sortBy],
    queryFn: async ({ pageParam }) => {
      const page = (pageParam as number | undefined) ?? 1;
      // Build params — only send non-null/non-empty values
      const params: Record<string, string | number | boolean> = {
        page,
        size: PAGE_SIZE,
        sort: sortBy,
      };
      const filterEntries = Object.entries(filters) as [string, unknown][];
      filterEntries.forEach(([key, value]) => {
        if (value != null && value !== '') {
          params[key] = value as string | number | boolean;
        }
      });
      const { data } = await api.get<PropertyListResponse>('/properties/', { params });
      return data;
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.items.length < PAGE_SIZE) return undefined;
      return allPages.length + 1;
    },
    initialPageParam: 1,
    staleTime: 60_000,
  });
}
