import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { WhatsSpecialTags } from '@/components/property/WhatsSpecialTags';
import type { PropertySchema } from '@/lib/types/property';

const BASE_PROPERTY: PropertySchema = {
  id: 1,
  owner_id: 1,
  title: 'Test Property',
  description: null,
  price: 100000,
  listing_type: 'sale',
  property_type: 'apartment',
  address: null,
  city: 'Tunis',
  country_code: 'TN',
  latitude: null,
  longitude: null,
  area_sqm: null,
  bedrooms: null,
  bathrooms: null,
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
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  view_count: 0,
  rejection_reason: null,
  furnished: null,
  new_development: null,
  region_id: null,
  agency_id: null,
  year_of_construction: null,
  num_floors: null,
  land_plot_size_sqm: null,
};

describe('WhatsSpecialTags', () => {
  it('renders nothing when no boolean amenities are true', () => {
    const { toJSON } = render(<WhatsSpecialTags property={BASE_PROPERTY} />);
    expect(toJSON()).toBeNull();
  });

  it('renders Swimming Pool tag when swimming_pool is true', () => {
    const property: PropertySchema = { ...BASE_PROPERTY, swimming_pool: true };
    render(<WhatsSpecialTags property={property} />);
    expect(screen.getByText('Swimming Pool')).toBeTruthy();
  });

  it('renders Private Garden tag when garden is true', () => {
    const property: PropertySchema = { ...BASE_PROPERTY, garden: true };
    render(<WhatsSpecialTags property={property} />);
    expect(screen.getByText('Private Garden')).toBeTruthy();
  });

  it('renders Balcony tag when balcony is true', () => {
    const property: PropertySchema = { ...BASE_PROPERTY, balcony: true };
    render(<WhatsSpecialTags property={property} />);
    expect(screen.getByText('Balcony')).toBeTruthy();
  });

  it('renders Elevator tag when lift is true', () => {
    const property: PropertySchema = { ...BASE_PROPERTY, lift: true };
    render(<WhatsSpecialTags property={property} />);
    expect(screen.getByText('Elevator')).toBeTruthy();
  });

  it('renders Furnished tag when furnished is true', () => {
    const property: PropertySchema = { ...BASE_PROPERTY, furnished: true };
    render(<WhatsSpecialTags property={property} />);
    expect(screen.getByText('Furnished')).toBeTruthy();
  });

  it('renders Parking tag when parking_spots > 0', () => {
    const property: PropertySchema = { ...BASE_PROPERTY, parking_spots: 2 };
    render(<WhatsSpecialTags property={property} />);
    expect(screen.getByText('Parking')).toBeTruthy();
  });

  it('renders Garage tag when garage_spots > 0', () => {
    const property: PropertySchema = { ...BASE_PROPERTY, garage_spots: 1 };
    render(<WhatsSpecialTags property={property} />);
    expect(screen.getByText('Garage')).toBeTruthy();
  });

  it('renders multiple tags when multiple amenities are true', () => {
    const property: PropertySchema = {
      ...BASE_PROPERTY,
      swimming_pool: true,
      balcony: true,
      furnished: true,
    };
    render(<WhatsSpecialTags property={property} />);
    expect(screen.getByText('Swimming Pool')).toBeTruthy();
    expect(screen.getByText('Balcony')).toBeTruthy();
    expect(screen.getByText('Furnished')).toBeTruthy();
  });

  it('does NOT render tag when value is false', () => {
    const property: PropertySchema = { ...BASE_PROPERTY, swimming_pool: false };
    render(<WhatsSpecialTags property={property} />);
    expect(screen.queryByText('Swimming Pool')).toBeNull();
  });

  it('does NOT render Parking when parking_spots is 0', () => {
    const property: PropertySchema = { ...BASE_PROPERTY, parking_spots: 0 };
    render(<WhatsSpecialTags property={property} />);
    expect(screen.queryByText('Parking')).toBeNull();
  });
});
