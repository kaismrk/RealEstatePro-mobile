import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import type { PropertyListResponse } from '@/lib/types/property';

export function useNearby(lat: number | null | undefined, lng: number | null | undefined, radiusKm = 5) {
  return useQuery<PropertyListResponse>({
    queryKey: ['nearby', lat, lng, radiusKm],
    queryFn: () =>
      api
        .get<PropertyListResponse>('/properties/nearby', {
          params: { lat, lng, radius_km: radiusKm },
        })
        .then((r) => r.data),
    enabled: lat != null && lng != null,
    staleTime: 60_000,
  });
}
