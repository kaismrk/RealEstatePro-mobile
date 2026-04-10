/**
 * Phase F10 — Geo Hierarchy hooks.
 *
 * BACKEND GAP NOTE: /admin/regions/ endpoints currently require REGION_MANAGE
 * permission (SUPER_ADMIN only). Authenticated regular users will receive 403.
 * A public or user-accessible GET endpoint is needed from the backend team.
 * See: app/api/v1/endpoints/admin/regions.py — all routes use
 * require_permission(Permission.REGION_MANAGE).
 *
 * These hooks are implemented as specified and will work once the backend
 * exposes a public/user-accessible regions endpoint.
 *
 * Level hierarchy: country(0) → region(1) → department(2) → city(3)
 */
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

export interface Region {
  id: number;
  name: string;
  level: string;
  country_code: string;
  parent_id: number | null;
  code: string | null;
  created_at: string;
}

export interface RegionListResponse {
  items: Region[];
  total: number;
}

/**
 * Fetch top-level regions (level=region) for a given country.
 * staleTime: Infinity because regions rarely change.
 */
export function useTopLevelRegions(countryCode: string | null) {
  return useQuery<RegionListResponse>({
    queryKey: ['regions', 'top', countryCode],
    queryFn: async () => {
      const { data } = await api.get<RegionListResponse>('/admin/regions/', {
        params: { country_code: countryCode, level: 'region' },
      });
      return data;
    },
    enabled: countryCode != null && countryCode !== '',
    staleTime: Infinity,
  });
}

/**
 * Fetch children of a region node by parent_id.
 * staleTime: Infinity because regions rarely change.
 */
export function useChildRegions(parentId: number | null) {
  return useQuery<RegionListResponse>({
    queryKey: ['regions', 'children', parentId],
    queryFn: async () => {
      const { data } = await api.get<RegionListResponse>('/admin/regions/', {
        params: { parent_id: parentId },
      });
      return data;
    },
    enabled: parentId != null,
    staleTime: Infinity,
  });
}
