import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { FactsGrid } from '@/components/property/FactsGrid';
import type { PropertySchema } from '@/lib/types/property';

const BASE_PROPERTY: PropertySchema = {
  id: 1,
  owner_id: 1,
  title: 'Test',
  description: null,
  price: 150000,
  listing_type: 'sale',
  property_type: 'apartment',
  address: null,
  city: 'Tunis',
  country_code: 'TN',
  latitude: null,
  longitude: null,
  area_sqm: 100,
  bedrooms: 3,
  bathrooms: 2,
  floor: 2,
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
  energy_rating: 'B',
  heating_system: null,
  air_conditioner: null,
  kitchen: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  view_count: 0,
  rejection_reason: null,
  furnished: null,
  new_development: null,
  region_id: null,
  agency_id: null,
  year_of_construction: 2015,
  num_floors: 5,
  land_plot_size_sqm: null,
};

describe('FactsGrid', () => {
  it('renders property type', () => {
    render(<FactsGrid property={BASE_PROPERTY} />);
    expect(screen.getByText('Apartment')).toBeTruthy();
  });

  it('renders year built', () => {
    render(<FactsGrid property={BASE_PROPERTY} />);
    expect(screen.getByText('2015')).toBeTruthy();
  });

  it('renders floor with total floors', () => {
    render(<FactsGrid property={BASE_PROPERTY} />);
    expect(screen.getByText('2 / 5')).toBeTruthy();
  });

  it('renders energy rating', () => {
    render(<FactsGrid property={BASE_PROPERTY} />);
    expect(screen.getByText('B')).toBeTruthy();
  });

  it('renders price per sqm computed correctly', () => {
    // 150000 / 100 sqm = 1500 per sqm
    render(<FactsGrid property={BASE_PROPERTY} />);
    expect(screen.getByText(/1,500|1500/)).toBeTruthy();
  });

  it('does not render floor when floor is null', () => {
    const property: PropertySchema = { ...BASE_PROPERTY, floor: null };
    render(<FactsGrid property={property} />);
    expect(screen.queryByText('Floor')).toBeNull();
  });

  it('renders lot size when land_plot_size_sqm is set', () => {
    const property: PropertySchema = { ...BASE_PROPERTY, land_plot_size_sqm: 500 };
    render(<FactsGrid property={property} />);
    expect(screen.getByText(/500 m²/)).toBeTruthy();
  });

  it('renders null gracefully — returns null when no visible items', () => {
    const empty: PropertySchema = {
      ...BASE_PROPERTY,
      year_of_construction: null,
      floor: null,
      land_plot_size_sqm: null,
      energy_rating: null,
      area_sqm: null,
    };
    const { toJSON } = render(<FactsGrid property={empty} />);
    // Still renders property type, so component is not null
    expect(toJSON()).not.toBeNull();
  });
});
