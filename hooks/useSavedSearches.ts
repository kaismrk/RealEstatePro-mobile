import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import type {
  SavedSearchCreate,
  SavedSearchList,
  SavedSearchResponse,
} from '@/lib/types/saved_search';

export function useSavedSearches() {
  const queryClient = useQueryClient();

  const list = useQuery<SavedSearchList>({
    queryKey: ['saved-searches'],
    queryFn: () =>
      api.get<SavedSearchList>('/saved-searches/').then((r) => r.data),
    staleTime: 60_000,
  });

  const create = useMutation<SavedSearchResponse, Error, SavedSearchCreate>({
    mutationFn: (payload: SavedSearchCreate) =>
      api
        .post<SavedSearchResponse>('/saved-searches/', payload)
        .then((r) => r.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['saved-searches'] });
    },
  });

  const remove = useMutation<void, Error, number>({
    mutationFn: (searchId: number) =>
      api.delete(`/saved-searches/${searchId}`).then(() => undefined),
    onMutate: async (searchId: number) => {
      await queryClient.cancelQueries({ queryKey: ['saved-searches'] });
      const previous =
        queryClient.getQueryData<SavedSearchList>(['saved-searches']);

      queryClient.setQueryData<SavedSearchList>(['saved-searches'], (old) => {
        if (!old) return { total: 0, items: [] };
        const filtered = old.items.filter((s) => s.id !== searchId);
        return { total: filtered.length, items: filtered };
      });

      return { previous };
    },
    onError: (_err, _searchId, context) => {
      const ctx = context as { previous?: SavedSearchList } | undefined;
      if (ctx?.previous) {
        queryClient.setQueryData(['saved-searches'], ctx.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['saved-searches'] });
    },
  });

  return { list, create, remove };
}
