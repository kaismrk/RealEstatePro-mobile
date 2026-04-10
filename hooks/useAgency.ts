import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

export interface AgencyResponse {
  id: number;
  name: string;
  logo_url: string | null;
  description: string | null;
  social_links: Record<string, string> | null;
  country_code: string;
  owner_id: number;
  created_at: string;
  updated_at: string;
}

export function useAgency(id: number | null | undefined) {
  return useQuery<AgencyResponse>({
    queryKey: ['agency', id],
    queryFn: () =>
      api.get<AgencyResponse>(`/agencies/${id}`).then((r) => r.data),
    enabled: id != null,
    staleTime: 60_000,
  });
}
