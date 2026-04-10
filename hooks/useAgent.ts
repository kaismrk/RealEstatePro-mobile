import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

export interface AgentResponse {
  id: number;
  user_id: number;
  agency_id: number | null;
  bio: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export function useAgent(id: number | null | undefined) {
  return useQuery<AgentResponse>({
    queryKey: ['agent', id],
    queryFn: () => api.get<AgentResponse>(`/agents/${id}`).then((r) => r.data),
    enabled: id != null,
    staleTime: 60_000,
  });
}
