import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { PropertyCard } from '@/components/property/PropertyCard';
import type { PropertySchema } from '@/lib/types/property';

// Mock expo-router
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn() },
  useRouter: () => ({ push: jest.fn() }),
}));

// Mock auth store
const mockAccessToken: { value: string | null } = { value: null };
jest.mock('@/lib/stores/auth.store', () => ({
  useAuthStore: (selector: (s: { accessToken: string | null; countryCode: string }) => unknown) =>
    selector({ accessToken: mockAccessToken.value, countryCode: 'TN' }),
}));

// Mock useCountries
jest.mock('@/hooks/useCountries', () => ({
  useCountries: () => ({
    data: [{ country_code: 'TN', name: 'Tunisia', locale: 'ar', currency: 'TND' }],
  }),
}));

const BASE_PROPERTY: PropertySchema = {
  id: 1,
  owner_id: 10,
  title: 'Modern Apartment',
  description: null,
  price: 250000,
  listing_type: 'sale',
  property_type: 'apartment',
  address: '12 Rue de la Liberté',
  city: 'Tunis',
  country_code: 'TN',
  latitude: null,
  longitude: null,
  area_sqm: 120,
  bedrooms: 3,
  bathrooms: 2,
  floor: null,
  image_urls: [],
  virtual_tour_url: null,
  publish_status: 'published',
  publishing_date: null,
  valid_until: null,
  exclusive_listing: null,
  availability: null,
  is_active: true,
  is_boosted: false,
  swimming_pool: null,
  garden: null,
  balcony: null,
  lift: null,
  parking_spots: null,
  garage_spots: null,
  energy_rating: null,
  heating_system: null,
  air_conditioner: null,
  kitchen: null,
  created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4h ago
  updated_at: new Date().toISOString(),
  view_count: 5,
  rejection_reason: null,
  furnished: null,
  new_development: null,
  region_id: null,
  agency_id: null,
  year_of_construction: null,
  num_floors: null,
  land_plot_size_sqm: null,
};

describe('PropertyCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAccessToken.value = null;
  });

  it('renders the price', () => {
    render(<PropertyCard property={BASE_PROPERTY} />);
    // CurrencyText formats 250000 TND
    expect(screen.getByText(/250/)).toBeTruthy();
  });

  it('renders beds and city', () => {
    render(<PropertyCard property={BASE_PROPERTY} />);
    expect(screen.getByText(/3 bed/)).toBeTruthy();
    expect(screen.getByText(/Tunis/)).toBeTruthy();
  });

  it('renders address', () => {
    render(<PropertyCard property={BASE_PROPERTY} />);
    expect(screen.getByText(/Rue de la Libert/)).toBeTruthy();
  });

  it('does NOT show BoostBadge when is_boosted is false', () => {
    render(<PropertyCard property={BASE_PROPERTY} />);
    expect(screen.queryByText('Featured')).toBeNull();
  });

  it('shows BoostBadge when is_boosted is true', () => {
    const boosted: PropertySchema = { ...BASE_PROPERTY, is_boosted: true };
    render(<PropertyCard property={boosted} />);
    expect(screen.getByText('Featured')).toBeTruthy();
  });

  it('shows publish status badge when status is pending', () => {
    const pending: PropertySchema = { ...BASE_PROPERTY, publish_status: 'pending' };
    render(<PropertyCard property={pending} />);
    expect(screen.getByText('Pending Review')).toBeTruthy();
  });

  it('shows publish status badge when status is rejected', () => {
    const rejected: PropertySchema = { ...BASE_PROPERTY, publish_status: 'rejected' };
    render(<PropertyCard property={rejected} />);
    expect(screen.getByText('Rejected')).toBeTruthy();
  });

  it('does NOT show status badge for published properties', () => {
    render(<PropertyCard property={BASE_PROPERTY} />);
    expect(screen.queryByText('Pending Review')).toBeNull();
    expect(screen.queryByText('Rejected')).toBeNull();
  });

  it('renders placeholder when image_urls is empty', () => {
    render(<PropertyCard property={BASE_PROPERTY} />);
    // Placeholder renders the house emoji text
    expect(screen.getByText('\uD83C\uDFE0')).toBeTruthy();
  });

  it('renders 2 bathrooms text', () => {
    render(<PropertyCard property={BASE_PROPERTY} />);
    expect(screen.getByText(/2 bath/)).toBeTruthy();
  });

  it('renders area text', () => {
    render(<PropertyCard property={BASE_PROPERTY} />);
    expect(screen.getByText(/120/)).toBeTruthy();
  });
});
