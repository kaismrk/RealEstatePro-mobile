import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

export interface ListingPackResponse {
  id: number;
  name: string;
  listing_count: number;
  price: number;
  country_code: string;
  is_active: boolean;
  created_at: string;
}

export interface ListingPackList {
  total: number;
  items: ListingPackResponse[];
}

export function useListingPacks() {
  return useQuery<ListingPackList>({
    queryKey: ['listing-packs'],
    queryFn: () =>
      api.get<ListingPackList>('/listing-packs/').then((r) => r.data),
    staleTime: 60_000,
  });
}
