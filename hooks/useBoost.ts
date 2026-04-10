import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

export type PlacementType =
  | 'top_of_search'
  | 'homepage_featured'
  | 'category_featured';

export interface BoostCreatePayload {
  placement_type: PlacementType;
  duration_days: number;
  amount_paid: number;
}

export interface ListingBoostResponse {
  id: number;
  property_id: number;
  owner_id: number;
  placement_type: PlacementType;
  starts_at: string;
  ends_at: string;
  amount_paid: number;
  country_code: string;
  created_at: string;
}

interface BoostParams {
  propertyId: number;
  payload: BoostCreatePayload;
}

export function useBoost() {
  const queryClient = useQueryClient();

  return useMutation<ListingBoostResponse, Error, BoostParams>({
    mutationFn: async ({ propertyId, payload }) => {
      const res = await api.post<ListingBoostResponse>(
        `/properties/${propertyId}/boost`,
        payload
      );
      return res.data;
    },
    onSuccess: (_data, { propertyId }) => {
      queryClient.invalidateQueries({
        queryKey: ['property', String(propertyId)],
      });
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
    },
  });
}
