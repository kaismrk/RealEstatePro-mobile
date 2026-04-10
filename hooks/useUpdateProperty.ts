import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import type { PropertySchema } from '@/lib/types/property';
import type { PropertyCreatePayload } from './useCreateProperty';

interface UpdatePropertyParams {
  id: number;
  data: Partial<PropertyCreatePayload>;
}

export function useUpdateProperty() {
  const queryClient = useQueryClient();

  return useMutation<PropertySchema, Error, UpdatePropertyParams>({
    mutationFn: async ({ id, data }) => {
      const res = await api.put<PropertySchema>(`/properties/${id}`, data);
      return res.data;
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
      queryClient.invalidateQueries({ queryKey: ['property', String(updated.id)] });
    },
  });
}
