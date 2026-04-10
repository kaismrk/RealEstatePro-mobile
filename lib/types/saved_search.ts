export interface SavedSearchFilters {
  listing_type?: string;
  property_type?: string;
  min_price?: number;
  max_price?: number;
  min_bedrooms?: number;
  max_bedrooms?: number;
  min_area?: number;
  max_area?: number;
  city?: string;
}

export interface SavedSearchCreate {
  name: string;
  filters: SavedSearchFilters;
  country_code: string;
}

export interface SavedSearchResponse {
  id: number;
  user_id: number;
  name: string;
  filters: SavedSearchFilters;
  country_code: string;
  created_at: string;
}

export interface SavedSearchList {
  total: number;
  items: SavedSearchResponse[];
}
