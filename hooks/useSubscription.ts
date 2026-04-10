import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

export type SubscriptionStatus = 'active' | 'cancelled' | 'expired';
export type BillingCycle = 'monthly' | 'annual';

export interface SubscriptionPlanResponse {
  id: number;
  name: string;
  price: number;
  listing_limit: number;
  billing_cycle: BillingCycle;
  country_code: string;
  is_active: boolean;
  created_at: string;
}

export interface SubscriptionResponse {
  id: number;
  agency_id: number;
  plan_id: number;
  status: SubscriptionStatus;
  starts_at: string;
  expires_at: string;
  country_code: string;
  created_at: string;
  plan: SubscriptionPlanResponse | null;
}

/** Get the current active subscription for an agency (owner only). Returns null if 404. */
export function useSubscription(agencyId: number | null | undefined) {
  return useQuery<SubscriptionResponse | null>({
    queryKey: ['subscription', agencyId],
    queryFn: async () => {
      try {
        const r = await api.get<SubscriptionResponse>(`/agencies/${agencyId}/subscription`);
        return r.data;
      } catch (err: unknown) {
        const axiosErr = err as { response?: { status?: number } };
        if (axiosErr.response?.status === 404) return null;
        throw err;
      }
    },
    enabled: agencyId != null,
    staleTime: 30_000,
    retry: false,
  });
}

/** Subscribe an agency to a plan. */
export function useSubscribe() {
  const queryClient = useQueryClient();

  return useMutation<
    SubscriptionResponse,
    Error,
    { agencyId: number; planId: number }
  >({
    mutationFn: ({ agencyId, planId }) =>
      api
        .post<SubscriptionResponse>(`/agencies/${agencyId}/subscribe`, { plan_id: planId })
        .then((r) => r.data),
    onSuccess: (data) => {
      queryClient.setQueryData(['subscription', data.agency_id], data);
    },
  });
}

/** Cancel an agency's active subscription. */
export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation<SubscriptionResponse, Error, number>({
    mutationFn: (agencyId) =>
      api
        .post<SubscriptionResponse>(`/agencies/${agencyId}/cancel-subscription`)
        .then((r) => r.data),
    onSuccess: (data) => {
      queryClient.setQueryData(['subscription', data.agency_id], data);
    },
  });
}
