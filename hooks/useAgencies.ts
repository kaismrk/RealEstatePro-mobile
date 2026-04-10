import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
}

export interface AgencyList {
  total: number;
  items: AgencyResponse[];
}

export interface AgencyCreatePayload {
  name: string;
  logo_url?: string | null;
  description?: string | null;
  social_links?: Record<string, string> | null;
  country_code: string;
}

export interface AgencyUpdatePayload {
  name?: string | null;
  logo_url?: string | null;
  description?: string | null;
  social_links?: Record<string, string> | null;
}

/** List all agencies, optionally filtered by country code. */
export function useAgencies(countryCode?: string) {
  return useQuery<AgencyList>({
    queryKey: ['agencies', countryCode ?? null],
    queryFn: () => {
      const params = countryCode ? `?country_code=${countryCode}` : '';
      return api.get<AgencyList>(`/agencies/${params}`).then((r) => r.data);
    },
    staleTime: 60_000,
  });
}

/** Get a single agency by ID. */
export function useAgency(id: number | null | undefined) {
  return useQuery<AgencyResponse>({
    queryKey: ['agency', id],
    queryFn: () => api.get<AgencyResponse>(`/agencies/${id}`).then((r) => r.data),
    enabled: id != null,
    staleTime: 60_000,
  });
}

/** Create a new agency — authenticated user becomes owner. */
export function useCreateAgency() {
  const queryClient = useQueryClient();

  return useMutation<AgencyResponse, Error, AgencyCreatePayload>({
    mutationFn: (payload) =>
      api.post<AgencyResponse>('/agencies/', payload).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agencies'] });
    },
  });
}

/** Update an existing agency (owner only). */
export function useUpdateAgency() {
  const queryClient = useQueryClient();

  return useMutation<AgencyResponse, Error, { id: number; data: AgencyUpdatePayload }>({
    mutationFn: ({ id, data }) =>
      api.patch<AgencyResponse>(`/agencies/${id}`, data).then((r) => r.data),
    onSuccess: (updated) => {
      queryClient.setQueryData(['agency', updated.id], updated);
      queryClient.invalidateQueries({ queryKey: ['agencies'] });
    },
  });
}

/** Delete an agency (owner only). */
export function useDeleteAgency() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (id) =>
      api.delete(`/agencies/${id}`).then(() => undefined),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: ['agency', id] });
      queryClient.invalidateQueries({ queryKey: ['agencies'] });
    },
  });
}
