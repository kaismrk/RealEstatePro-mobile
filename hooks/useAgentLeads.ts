import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { useAuthStore } from '@/lib/stores/auth.store';
import type { MessageList } from '@/lib/types/message';

export function useAgentLeads() {
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery<MessageList>({
    queryKey: ['agent', 'leads'],
    queryFn: () =>
      api.get<MessageList>('/agents/me/leads').then((r) => r.data),
    enabled: !!accessToken,
    staleTime: 30_000,
  });
}
