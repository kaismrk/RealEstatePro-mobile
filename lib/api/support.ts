import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

// ── Types ──────────────────────────────────────────────────────────────────

export type FeedbackCategory = 'bug' | 'feature' | 'question' | 'other';

export interface FeedbackBody {
  subject: string;
  message: string;
  category: FeedbackCategory;
}

export interface FeedbackResponse {
  ticket_id: number;
  status: 'open';
}

// ── API function ───────────────────────────────────────────────────────────

export async function submitFeedback(body: FeedbackBody): Promise<FeedbackResponse> {
  const res = await api.post<FeedbackResponse>('/support/feedback', body);
  return res.data;
}

// ── Mutation hook ──────────────────────────────────────────────────────────

/**
 * useSubmitFeedback — POST /api/v1/support/feedback
 *
 * Usage:
 *   const mutation = useSubmitFeedback();
 *   mutation.mutate(body, { onSuccess, onError });
 */
export function useSubmitFeedback() {
  return useMutation<FeedbackResponse, Error, FeedbackBody>({
    mutationFn: (body) => submitFeedback(body),
  });
}
