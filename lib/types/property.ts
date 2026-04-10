// Property schema types matching the FastAPI backend property.py schemas

export type ListingType = 'sale' | 'rent' | 'commercial' | 'land';

export type PropertyType =
  | 'apartment'
  | 'villa'
  | 'house'
  | 'studio'
  | 'land'
  | 'commercial'
  | 'office'
  | 'shop'
  | 'warehouse'
  | 'farmhouse'
  | 'chalet'
  | 'penthouse'
  | 'duplex'
  | 'townhouse'
  | 'building';

export type PublishStatus =
  | 'published'
  | 'pending'
  | 'rejected'
  | 'not_published';

export type EnergyRating = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';

export type HeatingSystem =
  | 'central'
  | 'individual'
  | 'electric'
  | 'gas'
  | 'fuel'
  | 'heat_pump'
  | 'solar'
  | 'wood'
  | 'none';

export type AirConditioner = 'split' | 'central' | 'portable' | 'none';

export type KitchenType = 'open' | 'closed' | 'semi_open' | 'american';

export interface PropertySchema {
  id: number;
  owner_id: number;
  title: string;
  description: string | null;
  price: number;
  listing_type: ListingType;
  property_type: PropertyType;
  // Location
  address: string | null;
  city: string;
  country_code: string;
  latitude: number | null;
  longitude: number | null;
  // Core details
  area_sqm: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  floor: number | null;
  // Media — backend field is image_urls
  image_urls: string[] | null;
  virtual_tour_url: string | null;
  // Publishing
  publish_status: PublishStatus | null;
  publishing_date: string | null;
  valid_until: string | null;
  exclusive_listing: boolean | null;
  availability: string | null;
  // State
  is_active: boolean | null;
  is_boosted: boolean | null;
  // Amenities (mapped from backend field names)
  swimming_pool: boolean | null;
  garden: boolean | null;
  balcony: boolean | null;
  lift: boolean | null;
  parking_spots: number | null;
  garage_spots: number | null;
  energy_rating: EnergyRating | null;
  heating_system: HeatingSystem | null;
  air_conditioner: AirConditioner | null;
  kitchen: KitchenType | null;
  // Timestamps
  created_at: string;
  updated_at: string;
  view_count: number;
  rejection_reason: string | null;
  // Optional extras
  furnished: boolean | null;
  new_development: boolean | null;
  region_id: number | null;
  agency_id: number | null;
  year_of_construction: number | null;
  num_floors: number | null;
  land_plot_size_sqm: number | null;
}

export interface PropertyListResponse {
  total: number;
  items: PropertySchema[];
  page: number;
  size: number;
}
