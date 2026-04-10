import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { useAuthStore } from '@/lib/stores/auth.store';
import type { PropertyListResponse } from '@/lib/types/property';

export function useMyListings() {
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery<PropertyListResponse>({
    queryKey: ['my-listings'],
    queryFn: () =>
      api.get<PropertyListResponse>('/properties/my').then((r) => r.data),
    enabled: !!accessToken,
    staleTime: 30_000,
  });
}
