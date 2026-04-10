import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

export interface CountryPublicResponse {
  country_code: string;
  name: string;
  locale: string;
  currency: string;
}

export function useCountries() {
  return useQuery<CountryPublicResponse[]>({
    queryKey: ['countries'],
    queryFn: () => api.get<CountryPublicResponse[]>('/countries/').then((r) => r.data),
    staleTime: Infinity,
  });
}
