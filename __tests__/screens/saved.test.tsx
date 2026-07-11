import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SavedScreen from '@/app/(tabs)/saved';
import type { FavoriteList } from '@/lib/types/favorite';
import type { PropertySchema } from '@/lib/types/property';

// Mock expo-router
const mockRouterPush = jest.fn();
jest.mock('expo-router', () => ({
  router: {
    push: (...args: unknown[]) => mockRouterPush(...args),
    replace: jest.fn(),
    back: jest.fn(),
  },
  useLocalSearchParams: () => ({}),
}));

// Mock API client (needed for useFavorites internally)
const mockApiGet = jest.fn();
const mockApiDelete = jest.fn();
const mockApiPost = jest.fn();

jest.mock('@/lib/api/client', () => ({
  api: {
    get: (...args: unknown[]) => mockApiGet(...args),
    post: (...args: unknown[]) => mockApiPost(...args),
    delete: (...args: unknown[]) => mockApiDelete(...args),
  },
}));

// Mutable auth state
let mockAccessToken: string | null = null;

jest.mock('@/lib/stores/auth.store', () => ({
  useAuthStore: (
    selector: (s: { accessToken: string | null; countryCode: string }) => unknown
  ) => selector({ accessToken: mockAccessToken, countryCode: 'TN' }),
}));

// Mock useCountries
jest.mock('@/hooks/useCountries', () => ({
  useCountries: () => ({
    data: [{ country_code: 'TN', name: 'Tunisia', locale: 'ar', currency: 'TND' }],
  }),
}));

// Mock useFavorites to control return data
const mockMutate = jest.fn();
let mockFavoritesData: FavoriteList | undefined = undefined;
let mockIsLoading = false;

jest.mock('@/hooks/useFavorites', () => ({
  useFavorites: () => ({
    list: {
      data: mockFavoritesData,
      isLoading: mockIsLoading,
      isRefetching: false,
      refetch: jest.fn(),
      isSuccess: !mockIsLoading && mockFavoritesData !== undefined,
    },
    remove: {
      mutate: mockMutate,
    },
    isFavorited: (id: number) =>
      mockFavoritesData?.items.some((f) => f.property_id === id) ?? false,
    toggle: jest.fn(),
    add: { mutate: jest.fn() },
  }),
}));

const BASE_PROPERTY: PropertySchema = {
  id: 1,
  owner_id: 10,
  title: 'Sunny Apartment',
  description: null,
  price: 200000,
  listing_type: 'sale',
  property_type: 'apartment',
  address: '5 Avenue Habib',
  city: 'Tunis',
  country_code: 'TN',
  latitude: null,
  longitude: null,
  area_sqm: 90,
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
  created_at: new Date().toISOString(),
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

const SECOND_PROPERTY: PropertySchema = {
  ...BASE_PROPERTY,
  id: 2,
  title: 'Garden Villa',
  price: 450000,
};

const FAVORITES_LIST: FavoriteList = {
  total: 2,
  items: [
    {
      id: 1,
      user_id: 10,
      property_id: 1,
      created_at: new Date().toISOString(),
      property: BASE_PROPERTY,
    },
    {
      id: 2,
      user_id: 10,
      property_id: 2,
      created_at: new Date().toISOString(),
      property: SECOND_PROPERTY,
    },
  ],
};

const EMPTY_LIST: FavoriteList = { total: 0, items: [] };

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

function renderSaved() {
  return render(
    React.createElement(
      createWrapper(),
      null,
      React.createElement(SavedScreen)
    )
  );
}

describe('SavedScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAccessToken = null;
    mockFavoritesData = undefined;
    mockIsLoading = false;
  });

  it('shows sign-in prompt for unauthenticated users', () => {
    mockAccessToken = null;
    renderSaved();
    expect(screen.getByText(/Sign in to view saved homes/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeTruthy();
  });

  it('navigates to auth on sign-in button press', () => {
    mockAccessToken = null;
    renderSaved();
    fireEvent.press(screen.getByRole('button', { name: /Sign In/i }));
    expect(mockRouterPush).toHaveBeenCalledWith('/(auth)/login');
  });

  it('renders favorites list for authenticated user', () => {
    mockAccessToken = 'valid-token';
    mockFavoritesData = FAVORITES_LIST;
    renderSaved();
    // PropertyCard doesn't render title as a visible Text node — check accessibility label
    expect(
      screen.getByLabelText('Sunny Apartment, Tunis')
    ).toBeTruthy();
    expect(
      screen.getByLabelText('Garden Villa, Tunis')
    ).toBeTruthy();
  });

  it('shows empty state when no favorites', () => {
    mockAccessToken = 'valid-token';
    mockFavoritesData = EMPTY_LIST;
    renderSaved();
    expect(screen.getByText(/No saved homes yet/i)).toBeTruthy();
  });

  it('entering compare mode enables checkboxes on each card', async () => {
    mockAccessToken = 'valid-token';
    mockFavoritesData = FAVORITES_LIST;
    renderSaved();

    // Press "Compare" button to enter compare mode
    fireEvent.press(screen.getByRole('button', { name: /Compare homes/i }));

    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('shows Compare N button when 2 or more properties selected', async () => {
    mockAccessToken = 'valid-token';
    mockFavoritesData = FAVORITES_LIST;
    renderSaved();

    // Enter compare mode
    fireEvent.press(screen.getByRole('button', { name: /Compare homes/i }));

    await waitFor(() => {
      expect(screen.getAllByRole('checkbox').length).toBeGreaterThanOrEqual(2);
    });

    // Select both checkboxes
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.press(checkboxes[0]!);
    fireEvent.press(checkboxes[1]!);

    await waitFor(() => {
      // Button label should change to "Compare 2"
      expect(screen.getByRole('button', { name: /Compare 2 homes/i })).toBeTruthy();
    });
  });
});
