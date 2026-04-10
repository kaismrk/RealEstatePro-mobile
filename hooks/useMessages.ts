import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import type { MessageList } from '@/lib/types/message';

export function useInbox() {
  return useQuery<MessageList>({
    queryKey: ['messages', 'inbox'],
    queryFn: () => api.get<MessageList>('/messages/inbox').then((r) => r.data),
    staleTime: 30_000,
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: (messageId: number) =>
      api.patch(`/messages/${messageId}/read`).then(() => undefined),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['messages'] }),
  });
}
