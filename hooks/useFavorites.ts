import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import type { FavoriteList, FavoriteResponse } from '@/lib/types/favorite';

export function useFavorites() {
  const queryClient = useQueryClient();

  const list = useQuery<FavoriteList>({
    queryKey: ['favorites'],
    queryFn: () => api.get<FavoriteList>('/favorites/').then((r) => r.data),
    staleTime: 60_000,
  });

  const add = useMutation<FavoriteResponse, Error, number>({
    mutationFn: (propertyId: number) =>
      api.post<FavoriteResponse>(`/favorites/${propertyId}`).then((r) => r.data),
    onMutate: async (propertyId: number) => {
      // Optimistic update: cancel in-flight queries then add optimistic item
      await queryClient.cancelQueries({ queryKey: ['favorites'] });
      const previous = queryClient.getQueryData<FavoriteList>(['favorites']);

      queryClient.setQueryData<FavoriteList>(['favorites'], (old) => {
        if (!old) return { total: 1, items: [] };
        // Avoid duplicates
        const alreadyIn = old.items.some((f) => f.property_id === propertyId);
        if (alreadyIn) return old;
        return { ...old, total: old.total + 1 };
      });

      return { previous };
    },
    onError: (_err, _propertyId, context) => {
      const ctx = context as { previous?: FavoriteList } | undefined;
      if (ctx?.previous) {
        queryClient.setQueryData(['favorites'], ctx.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  const remove = useMutation<void, Error, number>({
    mutationFn: (propertyId: number) =>
      api.delete(`/favorites/${propertyId}`).then(() => undefined),
    onMutate: async (propertyId: number) => {
      await queryClient.cancelQueries({ queryKey: ['favorites'] });
      const previous = queryClient.getQueryData<FavoriteList>(['favorites']);

      queryClient.setQueryData<FavoriteList>(['favorites'], (old) => {
        if (!old) return { total: 0, items: [] };
        const filtered = old.items.filter((f) => f.property_id !== propertyId);
        return { total: filtered.length, items: filtered };
      });

      return { previous };
    },
    onError: (_err, _propertyId, context) => {
      const ctx = context as { previous?: FavoriteList } | undefined;
      if (ctx?.previous) {
        queryClient.setQueryData(['favorites'], ctx.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  function isFavorited(propertyId: number): boolean {
    return list.data?.items.some((f) => f.property_id === propertyId) ?? false;
  }

  function toggle(propertyId: number): void {
    if (isFavorited(propertyId)) {
      remove.mutate(propertyId);
    } else {
      add.mutate(propertyId);
    }
  }

  return { list, add, remove, toggle, isFavorited };
}
