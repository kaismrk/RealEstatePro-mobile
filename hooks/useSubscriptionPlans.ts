/**
 * useSubscriptionPlans
 *
 * BACKEND GAP: There is no public endpoint to list subscription plans.
 * The only available endpoint is GET /admin/subscription-plans/ which requires
 * the `billing:manage` admin permission (returns 403 for regular users).
 *
 * Current workaround:
 * - Attempt to fetch from /admin/subscription-plans/
 * - On 403 (non-admin) or any error, return FALLBACK_PLANS (hardcoded list)
 *
 * When the backend exposes a public plans endpoint (e.g. GET /subscription-plans/),
 * remove the try/catch fallback and update the queryFn URL.
 */

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import type { SubscriptionPlanResponse } from './useSubscription';

interface SubscriptionPlanList {
  total: number;
  items: SubscriptionPlanResponse[];
}

/** Hardcoded fallback plans — used when the admin endpoint is inaccessible. */
export const FALLBACK_PLANS: SubscriptionPlanResponse[] = [
  {
    id: 1,
    name: 'Starter',
    price: 29,
    listing_limit: 10,
    billing_cycle: 'monthly',
    country_code: 'TN',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'Professional',
    price: 79,
    listing_limit: 50,
    billing_cycle: 'monthly',
    country_code: 'TN',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 3,
    name: 'Enterprise',
    price: 199,
    listing_limit: 9999,
    billing_cycle: 'annual',
    country_code: 'TN',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
];

/** Fetch subscription plans. Falls back to hardcoded list on 403 or API error. */
export function useSubscriptionPlans() {
  return useQuery<SubscriptionPlanResponse[]>({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      try {
        const r = await api.get<SubscriptionPlanList>('/admin/subscription-plans/');
        return r.data.items;
      } catch (err: unknown) {
        const axiosErr = err as { response?: { status?: number } };
        if (axiosErr.response?.status === 403) {
          // Non-admin user — return hardcoded fallback list
          return FALLBACK_PLANS;
        }
        // For other errors (network, 5xx), also fall back gracefully
        return FALLBACK_PLANS;
      }
    },
    staleTime: 5 * 60_000,
    retry: false,
  });
}
