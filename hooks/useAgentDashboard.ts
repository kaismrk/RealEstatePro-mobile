import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { useAuthStore } from '@/lib/stores/auth.store';
import type { PropertySchema } from '@/lib/types/property';

export interface PropertyWithStats extends PropertySchema {
  inquiry_count: number;
  favorite_count: number;
}

export interface AgentListingDashboard {
  total: number;
  items: PropertyWithStats[];
}

export function useAgentDashboard() {
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery<AgentListingDashboard>({
    queryKey: ['agent', 'dashboard'],
    queryFn: () =>
      api.get<AgentListingDashboard>('/agents/me/listings').then((r) => r.data),
    enabled: !!accessToken,
    staleTime: 30_000,
  });
}
