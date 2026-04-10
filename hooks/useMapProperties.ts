import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import type { PropertyListResponse } from '@/lib/types/property';

interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

/**
 * Computes radius_km from map region latitudeDelta.
 * 1 degree of latitude ≈ 111 km. We use half the delta as the radius.
 */
export function radiusKmFromRegion(region: MapRegion): number {
  return (region.latitudeDelta * 111) / 2;
}

interface UseMapPropertiesOptions {
  enabled?: boolean;
}

export function useMapProperties(
  region: MapRegion | null,
  options: UseMapPropertiesOptions = {}
) {
  const lat = region?.latitude ?? null;
  const lng = region?.longitude ?? null;
  const radius = region != null ? radiusKmFromRegion(region) : 0;

  return useQuery<PropertyListResponse>({
    queryKey: ['properties-area', lat, lng, radius],
    queryFn: () =>
      api
        .get<PropertyListResponse>('/properties/nearby', {
          params: { lat, lng, radius_km: radius },
        })
        .then((r) => r.data),
    enabled: (options.enabled ?? false) && lat != null && lng != null,
    staleTime: 60_000,
  });
}
