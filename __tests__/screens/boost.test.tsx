import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const mockRouterBack = jest.fn();
jest.mock('expo-router', () => ({
  router: { back: mockRouterBack, push: jest.fn(), replace: jest.fn() },
  useLocalSearchParams: () => ({ id: '42' }),
}));

// Auth store — user owns property id 42
let mockUser: { id: number; email: string } | null = { id: 1, email: 'owner@example.com' };
jest.mock('@/lib/stores/auth.store', () => ({
  useAuthStore: (selector: (s: { user: { id: number; email: string } | null }) => unknown) =>
    selector({ user: mockUser }),
}));

const mockApiGet = jest.fn();
const mockApiPost = jest.fn();
jest.mock('@/lib/api/client', () => ({
  api: {
    get: (...args: unknown[]) => mockApiGet(...args),
    post: (...args: unknown[]) => mockApiPost(...args),
    delete: jest.fn(),
  },
}));

const MOCK_PROPERTY = {
  id: 42,
  owner_id: 1,
  title: 'My Villa',
  price: 350000,
  listing_type: 'sale',
  property_type: 'villa',
  city: 'Tunis',
  country_code: 'TN',
  description: null,
  address: null,
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
  latitude: null,
  longitude: null,
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

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false, onError: () => {} },
    },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

import BoostScreen from '@/app/property/[id]/boost';

function renderBoost() {
  const Wrapper = createWrapper();
  return render(React.createElement(Wrapper, null, React.createElement(BoostScreen)));
}

describe('BoostScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUser = { id: 1, email: 'owner@example.com' };
    mockApiGet.mockImplementation((url: string) => {
      if (url === '/properties/42') return Promise.resolve({ data: MOCK_PROPERTY });
      return Promise.resolve({ data: {} });
    });
  });

  it('renders placement options', async () => {
    renderBoost();
    await waitFor(() => expect(screen.getByText('Boost Listing')).toBeTruthy());
    expect(screen.getByText('Top of Search')).toBeTruthy();
    expect(screen.getByText('Homepage Featured')).toBeTruthy();
    expect(screen.getByText('Category Featured')).toBeTruthy();
  });

  it('requires a placement type before boosting — does not call API', async () => {
    renderBoost();
    await waitFor(() => expect(screen.getByText('Boost Now')).toBeTruthy());
    // Do not select placement, just press boost
    fireEvent.press(screen.getByText('Boost Now'));
    // No API call should happen
    expect(mockApiPost).not.toHaveBeenCalled();
  });

  it('submits with correct placement_type when Top of Search is selected', async () => {
    const MOCK_BOOST_RESPONSE = {
      id: 1,
      property_id: 42,
      owner_id: 1,
      placement_type: 'top_of_search',
      starts_at: new Date().toISOString(),
      ends_at: new Date().toISOString(),
      amount_paid: 35,
      country_code: 'TN',
      created_at: new Date().toISOString(),
    };
    mockApiPost.mockResolvedValueOnce({ data: MOCK_BOOST_RESPONSE });

    renderBoost();
    await waitFor(() => expect(screen.getByText('Top of Search')).toBeTruthy());

    fireEvent.press(screen.getByText('Top of Search'));

    await act(async () => {
      fireEvent.press(screen.getByText('Boost Now'));
    });

    await waitFor(() => expect(mockApiPost).toHaveBeenCalledTimes(1));

    const [url, payload] = mockApiPost.mock.calls[0];
    expect(url).toBe('/properties/42/boost');
    expect(payload.placement_type).toBe('top_of_search');
    expect(typeof payload.duration_days).toBe('number');
    expect(typeof payload.amount_paid).toBe('number');
  });

  it('blocks access for non-owner users', async () => {
    mockUser = { id: 99, email: 'other@example.com' };
    renderBoost();
    await waitFor(() => expect(screen.getByText('Access denied')).toBeTruthy());
    expect(screen.queryByText('Boost Now')).toBeNull();
  });
});
