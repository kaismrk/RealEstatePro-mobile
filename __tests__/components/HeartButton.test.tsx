import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HeartButton } from '@/components/property/HeartButton';
import type { FavoriteList } from '@/lib/types/favorite';

// Mock expo-router
const mockRouterPush = jest.fn();
jest.mock('expo-router', () => ({
  router: {
    push: (...args: unknown[]) => mockRouterPush(...args),
    replace: jest.fn(),
  },
}));

// Mock haptics
jest.mock('@/lib/utils/haptics', () => ({
  haptic: {
    light: jest.fn(),
    medium: jest.fn(),
    heavy: jest.fn(),
    success: jest.fn(),
    warning: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock API client
const mockApiGet = jest.fn();
const mockApiPost = jest.fn();
const mockApiDelete = jest.fn();

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

const PROPERTY_ID = 42;

const EMPTY_LIST: FavoriteList = { total: 0, items: [] };
const WITH_FAVORITE: FavoriteList = {
  total: 1,
  items: [
    {
      id: 1,
      user_id: 10,
      property_id: PROPERTY_ID,
      created_at: new Date().toISOString(),
      property: {
        id: PROPERTY_ID,
        owner_id: 1,
        title: 'Test',
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
      },
    },
  ],
};

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

describe('HeartButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAccessToken = null;
  });

  it('renders with outline heart (not favorited) when list is empty', async () => {
    mockApiGet.mockResolvedValue({ data: EMPTY_LIST });

    render(
      React.createElement(
        createWrapper(),
        null,
        React.createElement(HeartButton, { propertyId: PROPERTY_ID })
      )
    );

    await waitFor(() => {
      const btn = screen.getByRole('button');
      expect(btn.props.accessibilityLabel).toBe('Save property');
    });
  });

  it('renders with filled heart when property is favorited', async () => {
    mockAccessToken = 'valid-token';
    mockApiGet.mockResolvedValue({ data: WITH_FAVORITE });

    render(
      React.createElement(
        createWrapper(),
        null,
        React.createElement(HeartButton, { propertyId: PROPERTY_ID })
      )
    );

    await waitFor(() => {
      const btn = screen.getByRole('button');
      expect(btn.props.accessibilityLabel).toBe('Remove from saved');
    });
  });

  it('redirects to auth when unauthenticated user presses heart', async () => {
    mockAccessToken = null;
    mockApiGet.mockResolvedValue({ data: EMPTY_LIST });

    render(
      React.createElement(
        createWrapper(),
        null,
        React.createElement(HeartButton, { propertyId: PROPERTY_ID })
      )
    );

    await waitFor(() => expect(screen.getByRole('button')).toBeTruthy());

    fireEvent.press(screen.getByRole('button'));

    expect(mockRouterPush).toHaveBeenCalledWith('/(auth)/welcome');
    expect(mockApiPost).not.toHaveBeenCalled();
  });

  it('calls toggle (add) when authenticated user presses unfavorited heart', async () => {
    mockAccessToken = 'valid-token';
    mockApiGet.mockResolvedValue({ data: EMPTY_LIST });
    mockApiPost.mockResolvedValue({ data: WITH_FAVORITE.items[0] });

    render(
      React.createElement(
        createWrapper(),
        null,
        React.createElement(HeartButton, { propertyId: PROPERTY_ID })
      )
    );

    await waitFor(() => {
      const btn = screen.getByRole('button');
      expect(btn.props.accessibilityLabel).toBe('Save property');
    });

    fireEvent.press(screen.getByRole('button'));

    await waitFor(() =>
      expect(mockApiPost).toHaveBeenCalledWith(`/favorites/${PROPERTY_ID}`)
    );
    expect(mockRouterPush).not.toHaveBeenCalled();
  });

  it('calls toggle (remove) when authenticated user presses favorited heart', async () => {
    mockAccessToken = 'valid-token';
    mockApiGet.mockResolvedValue({ data: WITH_FAVORITE });
    mockApiDelete.mockResolvedValue({ data: undefined });

    render(
      React.createElement(
        createWrapper(),
        null,
        React.createElement(HeartButton, { propertyId: PROPERTY_ID })
      )
    );

    await waitFor(() => {
      const btn = screen.getByRole('button');
      expect(btn.props.accessibilityLabel).toBe('Remove from saved');
    });

    fireEvent.press(screen.getByRole('button'));

    await waitFor(() =>
      expect(mockApiDelete).toHaveBeenCalledWith(`/favorites/${PROPERTY_ID}`)
    );
    expect(mockRouterPush).not.toHaveBeenCalled();
  });
});
