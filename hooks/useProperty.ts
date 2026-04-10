import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import type { PropertySchema } from '@/lib/types/property';

export function useProperty(id: number | string | undefined) {
  return useQuery<PropertySchema>({
    queryKey: ['property', id],
    queryFn: () =>
      api.get<PropertySchema>(`/properties/${id}`).then((r) => r.data),
    enabled: id != null,
    staleTime: 30_000,
  });
}
