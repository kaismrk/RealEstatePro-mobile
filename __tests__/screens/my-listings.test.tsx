import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const mockRouterPush = jest.fn();
const mockRouterBack = jest.fn();
jest.mock('expo-router', () => ({
  router: {
    push: (...args: unknown[]) => mockRouterPush(...args),
    back: mockRouterBack,
    replace: jest.fn(),
  },
}));

// Auth store mock — authenticated by default
let mockAccessToken: string | null = 'token-abc';
let mockCountryCode = 'TN';
let mockUser = { id: 1, email: 'test@example.com' };
jest.mock('@/lib/stores/auth.store', () => ({
  useAuthStore: (selector: (s: {
    accessToken: string | null;
    countryCode: string;
    user: typeof mockUser | null;
  }) => unknown) =>
    selector({
      accessToken: mockAccessToken,
      countryCode: mockCountryCode,
      user: mockUser,
    }),
}));

// API mock
const mockApiGet = jest.fn();
const mockApiDelete = jest.fn();
jest.mock('@/lib/api/client', () => ({
  api: {
    get: (...args: unknown[]) => mockApiGet(...args),
    delete: (...args: unknown[]) => mockApiDelete(...args),
    post: jest.fn(),
  },
}));

function makeListing(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 1,
    owner_id: 1,
    title: 'My Test Apartment',
    description: null,
    price: 120000,
    listing_type: 'sale',
    property_type: 'apartment',
    address: '5 Rue du Port',
    city: 'Tunis',
    country_code: 'TN',
    latitude: null,
    longitude: null,
    area_sqm: 80,
    bedrooms: 2,
    bathrooms: 1,
    floor: null,
    image_urls: [],
    virtual_tour_url: null,
    publish_status: 'pending',
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
    ...overrides,
  };
}

const MOCK_QUOTA = {
  free_remaining: 2,
  paid_remaining: 0,
  country_code: 'TN',
  updated_at: new Date().toISOString(),
};

function setupApiMock(listings: ReturnType<typeof makeListing>[] = []) {
  mockApiGet.mockImplementation((url: string) => {
    if (url === '/properties/my')
      return Promise.resolve({ data: { total: listings.length, items: listings, page: 1, size: 20 } });
    if (url === '/users/me/quota')
      return Promise.resolve({ data: MOCK_QUOTA });
    return Promise.resolve({ data: {} });
  });
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

import MyListingsScreen from '@/app/listings/my-listings';

function renderMyListings() {
  const Wrapper = createWrapper();
  return render(React.createElement(Wrapper, null, React.createElement(MyListingsScreen)));
}

describe('MyListingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAccessToken = 'token-abc';
    mockCountryCode = 'TN';
  });

  describe('Status badges', () => {
    it('shows "Pending Review" badge for pending listings', async () => {
      setupApiMock([makeListing({ publish_status: 'pending' })]);
      renderMyListings();
      await waitFor(() => expect(screen.getByText('Pending Review')).toBeTruthy());
    });

    it('shows no published badge text for published listings (badge is not shown for published)', async () => {
      setupApiMock([makeListing({ publish_status: 'published' })]);
      renderMyListings();
      await waitFor(() => expect(screen.getByText('My Test Apartment')).toBeTruthy());
      // Published listings don't show a status badge
      expect(screen.queryByText('Published')).toBeNull();
    });

    it('shows "Rejected" badge for rejected listings', async () => {
      setupApiMock([makeListing({ publish_status: 'rejected', rejection_reason: 'Misleading photos.' })]);
      renderMyListings();
      await waitFor(() => expect(screen.getByText('Rejected')).toBeTruthy());
    });
  });

  describe('Rejection reason modal', () => {
    it('shows rejection reason modal when rejected badge is tapped', async () => {
      setupApiMock([
        makeListing({
          publish_status: 'rejected',
          rejection_reason: 'Photos do not match the listing description.',
        }),
      ]);
      renderMyListings();
      await waitFor(() => expect(screen.getByText('Rejected')).toBeTruthy());
      fireEvent.press(screen.getByText('Rejected'));
      await waitFor(() =>
        expect(screen.getByText('Photos do not match the listing description.')).toBeTruthy()
      );
    });
  });

  describe('Quota exhausted modal', () => {
    it('shows quota modal when quota is 0 and user presses "+ New"', async () => {
      mockApiGet.mockImplementation((url: string) => {
        if (url === '/properties/my')
          return Promise.resolve({ data: { total: 0, items: [], page: 1, size: 20 } });
        if (url === '/users/me/quota')
          return Promise.resolve({
            data: { free_remaining: 0, paid_remaining: 0, country_code: 'TN', updated_at: '' },
          });
        return Promise.resolve({ data: {} });
      });

      renderMyListings();
      await waitFor(() => expect(screen.getByText('My Listings')).toBeTruthy());
      fireEvent.press(screen.getByText('+ New'));
      await waitFor(() => expect(screen.getByText('Quota Exhausted')).toBeTruthy());
    });

    it('navigates to create step-1 when quota is available', async () => {
      setupApiMock([]);
      renderMyListings();
      // Wait for quota to load (free_remaining: 2 in MOCK_QUOTA)
      await waitFor(() => expect(screen.getByText('My Listings')).toBeTruthy());
      // Also wait for quota numbers to appear
      await waitFor(() =>
        expect(screen.getByText(/free.+slots? remaining/i)).toBeTruthy()
      );
      fireEvent.press(screen.getByText('+ New'));
      await waitFor(() =>
        expect(mockRouterPush).toHaveBeenCalledWith('/listings/create/step-1')
      );
    });
  });

  describe('Empty state', () => {
    it('shows empty state when no listings exist', async () => {
      setupApiMock([]);
      renderMyListings();
      await waitFor(() => expect(screen.getByText('No listings yet')).toBeTruthy());
    });
  });
});
