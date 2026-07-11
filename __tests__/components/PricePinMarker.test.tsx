import React from 'react';
import { render, screen } from '@testing-library/react-native';

// Mock react-native-maps — MapView and Marker don't render in Jest
jest.mock('react-native-maps', () => {
  const React = require('react');
  const { View } = require('react-native');

  const MockMarker = ({
    children,
    testID,
    onPress,
  }: {
    children?: React.ReactNode;
    testID?: string;
    onPress?: () => void;
  }) =>
    React.createElement(View, { testID: testID ?? 'mock-marker', onPress }, children);

  const MockMapView = ({
    children,
    testID,
  }: {
    children?: React.ReactNode;
    testID?: string;
  }) => React.createElement(View, { testID: testID ?? 'mock-map-view' }, children);

  MockMapView.Animated = MockMapView;

  return {
    __esModule: true,
    default: MockMapView,
    Marker: MockMarker,
    PROVIDER_DEFAULT: null,
    PROVIDER_GOOGLE: 'google',
  };
});

// ── Theme mock — tests don't need real SecureStore/Appearance wiring ──────────
jest.mock('@/lib/theme', () => {
  const { lightPalette } = jest.requireActual('@/constants/theme');
  return {
    useTheme: () => ({
      palette: lightPalette,
      mode: 'light',
      setMode: jest.fn(),
      isDark: false,
    }),
    ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
    THEME_STORAGE_KEY: 'hovioo.theme.mode',
  };
});

import { PricePinMarker } from '@/components/map/PricePinMarker';
import { lightPalette } from '@/constants/theme';
import type { PropertySchema } from '@/lib/types/property';

const BASE_PROPERTY: PropertySchema = {
  id: 1,
  owner_id: 10,
  title: 'Test Property',
  description: null,
  price: 250000,
  listing_type: 'sale',
  property_type: 'apartment',
  address: null,
  city: 'Tunis',
  country_code: 'TN',
  latitude: 36.8,
  longitude: 10.18,
  area_sqm: 100,
  bedrooms: 2,
  bathrooms: 1,
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

describe('PricePinMarker', () => {
  it('renders the formatted price', () => {
    render(<PricePinMarker property={BASE_PROPERTY} currency="TND" />);
    // formatPrice uses Intl — expect the price number to be present
    const text = screen.getByTestId('price-pin-text');
    expect(text.props.children).toContain('250');
  });

  it('returns null when latitude is missing', () => {
    const noLatProperty: PropertySchema = { ...BASE_PROPERTY, latitude: null };
    const { toJSON } = render(<PricePinMarker property={noLatProperty} />);
    expect(toJSON()).toBeNull();
  });

  it('returns null when longitude is missing', () => {
    const noLngProperty: PropertySchema = { ...BASE_PROPERTY, longitude: null };
    const { toJSON } = render(<PricePinMarker property={noLngProperty} />);
    expect(toJSON()).toBeNull();
  });

  it('applies info (blue) background color when selected', () => {
    render(<PricePinMarker property={BASE_PROPERTY} selected={true} />);
    const container = screen.getByTestId('price-pin-container');
    expect(container.props.style.backgroundColor).toBe(lightPalette.info);
  });

  it('applies surface background when not selected', () => {
    render(<PricePinMarker property={BASE_PROPERTY} selected={false} />);
    const container = screen.getByTestId('price-pin-container');
    expect(container.props.style.backgroundColor).toBe(lightPalette.surface);
  });

  it('uses textOnBrand color when selected', () => {
    render(<PricePinMarker property={BASE_PROPERTY} selected={true} />);
    const text = screen.getByTestId('price-pin-text');
    expect(text.props.style.color).toBe(lightPalette.textOnBrand);
  });

  it('uses textPrimary color when not selected', () => {
    render(<PricePinMarker property={BASE_PROPERTY} selected={false} />);
    const text = screen.getByTestId('price-pin-text');
    expect(text.props.style.color).toBe(lightPalette.textPrimary);
  });

  it('applies warning border for boosted property', () => {
    const boostedProperty: PropertySchema = { ...BASE_PROPERTY, is_boosted: true };
    render(<PricePinMarker property={boostedProperty} />);
    const container = screen.getByTestId('price-pin-container');
    expect(container.props.style.borderColor).toBe(lightPalette.warning);
  });

  it('does NOT apply warning border for non-boosted property', () => {
    render(<PricePinMarker property={BASE_PROPERTY} />);
    const container = screen.getByTestId('price-pin-container');
    expect(container.props.style.borderColor).not.toBe(lightPalette.warning);
  });

  it('renders larger padding when selected', () => {
    render(<PricePinMarker property={BASE_PROPERTY} selected={true} />);
    const container = screen.getByTestId('price-pin-container');
    expect(container.props.style.paddingHorizontal).toBeGreaterThan(8);
  });
});
