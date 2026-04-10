import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import type { ListingQuotaResponse } from '@/lib/types/user';

export function usePurchasePack() {
  const queryClient = useQueryClient();

  return useMutation<ListingQuotaResponse, Error, number>({
    mutationFn: async (packId) => {
      const res = await api.post<ListingQuotaResponse>(
        `/listing-packs/${packId}/purchase`
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quota'] });
    },
  });
}
