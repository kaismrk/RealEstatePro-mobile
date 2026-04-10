import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import type { PropertySchema } from '@/lib/types/property';

export interface PropertyCreatePayload {
  title: string;
  listing_type: string;
  property_type: string;
  price: number;
  country_code: string;
  city: string;
  description?: string | null;
  address?: string | null;
  address_disclosure_level?: string | null;
  zip_code?: string | null;
  area_sqm?: number | null;
  lot_size?: number | null;
  number_of_rooms?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  floor?: number | null;
  total_floors?: number | null;
  year_built?: number | null;
  furnished?: boolean | null;
  kitchen_type?: string | null;
  heating_system?: string | null;
  air_conditioner?: string | null;
  energy_rating?: string | null;
  exposure?: string | null;
  swimming_pool?: boolean | null;
  garden?: boolean | null;
  balcony?: boolean | null;
  lift?: boolean | null;
  garage_spots?: number | null;
  parking_spots?: number | null;
  image_urls?: string[];
}

export class QuotaExhaustedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QuotaExhaustedError';
  }
}

export function useCreateProperty() {
  const queryClient = useQueryClient();

  return useMutation<PropertySchema, Error, PropertyCreatePayload>({
    mutationFn: async (payload) => {
      const res = await api.post<PropertySchema>('/properties/', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
      queryClient.invalidateQueries({ queryKey: ['quota'] });
    },
    // onError is intentionally absent — callers handle errors in mutate({ onError })
    // The error.name === 'QuotaExhaustedError' check is done at the call site
  });
}
