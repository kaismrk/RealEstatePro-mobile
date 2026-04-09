import { create } from 'zustand';

interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface PropertyFilters {
  q?: string;
  listing_type?: string;
  property_type?: string;
  min_price?: number;
  max_price?: number;
  min_bedrooms?: number;
  max_bedrooms?: number;
  min_area?: number;
  max_area?: number;
  has_pool?: boolean;
  has_garden?: boolean;
  has_balcony?: boolean;
  has_elevator?: boolean;
  has_parking?: boolean;
  has_garage?: boolean;
  energy_rating?: string;
  heating_system?: string;
  air_conditioner?: string;
  kitchen_type?: string;
  region_id?: number;
}

interface SearchState {
  filters: PropertyFilters;
  sortBy: string;
  mapRegion: MapRegion | null;
  viewMode: 'list' | 'map';
  setFilters: (partial: Partial<PropertyFilters>) => void;
  resetFilters: () => void;
  setSortBy: (s: string) => void;
  setMapRegion: (r: MapRegion | null) => void;
  setViewMode: (m: 'list' | 'map') => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  filters: {},
  sortBy: 'date_desc',
  mapRegion: null,
  viewMode: 'list',
  setFilters: (partial) => set((s) => ({ filters: { ...s.filters, ...partial } })),
  resetFilters: () => set({ filters: {} }),
  setSortBy: (sortBy) => set({ sortBy }),
  setMapRegion: (mapRegion) => set({ mapRegion }),
  setViewMode: (viewMode) => set({ viewMode }),
}));
