// hooks/useLoanConfig.ts
//
// Returns the loan configuration for the user's current country.
//
// DESIGN INTENT: This hook is the single seam between the UI and the config source.
// When the backend implements GET /api/v1/countries/:cc/loan-config, swap the static
// getLoanConfig() call for a useQuery() and the hook signature stays unchanged —
// no JSX changes required anywhere.
//
// Swap pattern (future):
//   import { useQuery } from '@tanstack/react-query';
//   import { apiClient } from '@/lib/api/client';
//   ...
//   const { data } = useQuery({
//     queryKey: ['loanConfig', countryCode],
//     queryFn: () => apiClient.get<LoanCountryConfig>(`/countries/${countryCode}/loan-config`),
//     staleTime: 1000 * 60 * 60,   // 1 h — config rarely changes
//   });
//   return data ?? getLoanConfig(countryCode);   // static fallback while loading
//
// TODO(backend-loan-config): implement the swap above once the endpoint is live.

import { useAuthStore } from '@/lib/stores/auth.store';
import { getLoanConfig, type LoanCountryConfig } from '@/lib/loan/config';

export function useLoanConfig(): LoanCountryConfig {
  const countryCode = useAuthStore((s) => s.countryCode);
  // TODO(backend-loan-config): replace with backend fetch (see header comment)
  return getLoanConfig(countryCode);
}
