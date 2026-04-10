import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { useAuthStore } from '@/lib/stores/auth.store';

export interface AgentProfileResponse {
  id: number;
  user_id: number;
  agency_id: number | null;
  bio: string | null;
  phone: string | null;
  verified: boolean;
  created_at: string;
  agency: {
    id: number;
    name: string;
  } | null;
}

export interface AgentUpdatePayload {
  bio?: string | null;
  phone?: string | null;
  agency_id?: number | null;
}

export function useAgentProfile() {
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery<AgentProfileResponse>({
    queryKey: ['agent', 'me'],
    queryFn: () =>
      api.get<AgentProfileResponse>('/agents/me').then((r) => r.data),
    enabled: !!accessToken,
    retry: false, // 404 means user is not yet an agent — don't retry
    staleTime: 30_000,
  });
}

export function useRegisterAgent() {
  const queryClient = useQueryClient();

  return useMutation<AgentProfileResponse, Error, AgentUpdatePayload>({
    mutationFn: (payload) =>
      api.post<AgentProfileResponse>('/agents/', payload).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent', 'me'] });
    },
  });
}

export function useUpdateAgentProfile() {
  const queryClient = useQueryClient();

  return useMutation<AgentProfileResponse, Error, AgentUpdatePayload>({
    mutationFn: (payload) =>
      api.patch<AgentProfileResponse>('/agents/me', payload).then((r) => r.data),
    onSuccess: (updated) => {
      queryClient.setQueryData(['agent', 'me'], updated);
    },
  });
}
