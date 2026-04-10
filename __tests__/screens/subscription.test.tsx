import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Alert } from 'react-native';

// expo-router mock
const mockRouterBack = jest.fn();
const mockRouterPush = jest.fn();
jest.mock('expo-router', () => ({
  router: {
    back: (...args: unknown[]) => mockRouterBack(...args),
    push: (...args: unknown[]) => mockRouterPush(...args),
    replace: jest.fn(),
  },
}));

// Auth store mock
jest.mock('@/lib/stores/auth.store', () => ({
  useAuthStore: (selector: (s: { accessToken: string | null; countryCode: string }) => unknown) =>
    selector({ accessToken: 'token-abc', countryCode: 'TN' }),
}));

// API mock
const mockApiGet = jest.fn();
const mockApiPost = jest.fn();
jest.mock('@/lib/api/client', () => ({
  api: {
    get: (...args: unknown[]) => mockApiGet(...args),
    post: (...args: unknown[]) => mockApiPost(...args),
  },
}));

import SubscriptionScreen from '@/app/agency/subscription';
import type { AgencyResponse, AgencyList } from '@/hooks/useAgencies';
import type { SubscriptionResponse } from '@/hooks/useSubscription';
import type { UserResponse } from '@/lib/types/user';

const MOCK_USER: UserResponse = {
  id: 42,
  email: 'owner@example.com',
  first_name: 'Alice',
  last_name: 'Doe',
  country_code: 'TN',
  is_active: true,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-04-07T00:00:00Z',
  last_login: '2026-04-07T00:00:00Z',
};

const MOCK_AGENCY: AgencyResponse = {
  id: 1,
  name: 'Alpha Realty',
  logo_url: null,
  description: null,
  social_links: null,
  country_code: 'TN',
  owner_id: 42,
  created_at: '2026-01-01T00:00:00Z',
};

const MOCK_AGENCY_LIST: AgencyList = { total: 1, items: [MOCK_AGENCY] };

const MOCK_PLAN = {
  id: 2,
  name: 'Professional',
  price: 79,
  listing_limit: 50,
  billing_cycle: 'monthly' as const,
  country_code: 'TN',
  is_active: true,
  created_at: '2026-01-01T00:00:00Z',
};

const MOCK_SUBSCRIPTION: SubscriptionResponse = {
  id: 10,
  agency_id: 1,
  plan_id: 2,
  status: 'active',
  starts_at: '2026-01-01',
  expires_at: '2026-02-01',
  country_code: 'TN',
  created_at: '2026-01-01T00:00:00Z',
  plan: MOCK_PLAN,
};

function setupMocks({
  subscription,
  plans,
}: {
  subscription?: SubscriptionResponse | null;
  plans?: boolean;
} = {}) {
  mockApiGet.mockImplementation((url: string) => {
    if (url === '/users/me') return Promise.resolve({ data: MOCK_USER });
    if (url.startsWith('/agencies/') && url.endsWith('/subscription')) {
      if (subscription === null || subscription === undefined) {
        return Promise.reject({ response: { status: 404 } });
      }
      return Promise.resolve({ data: subscription });
    }
    if (url === '/agencies/') return Promise.resolve({ data: MOCK_AGENCY_LIST });
    if (url === '/admin/subscription-plans/') {
      if (plans) {
        return Promise.resolve({ data: { total: 1, items: [MOCK_PLAN] } });
      }
      // Simulate 403 for non-admins
      return Promise.reject({ response: { status: 403 } });
    }
    return Promise.resolve({ data: {} });
  });
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

function renderScreen() {
  return render(
    React.createElement(createWrapper(), null, React.createElement(SubscriptionScreen))
  );
}

describe('SubscriptionScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  describe('when there is an active subscription', () => {
    beforeEach(() => {
      setupMocks({ subscription: MOCK_SUBSCRIPTION });
    });

    it('shows the current plan name', async () => {
      const { unmount } = renderScreen();
      await waitFor(() => expect(screen.getByText('Professional')).toBeTruthy());
      unmount();
    });

    it('shows the plan price', async () => {
      const { unmount } = renderScreen();
      await waitFor(() => expect(screen.getByText(/\$79/)).toBeTruthy());
      unmount();
    });

    it('shows the subscription expiry date', async () => {
      const { unmount } = renderScreen();
      await waitFor(() => expect(screen.getByText(/Expires:/)).toBeTruthy());
      unmount();
    });

    it('shows the Cancel Subscription button', async () => {
      const { unmount } = renderScreen();
      await waitFor(() => expect(screen.getByText('Cancel Subscription')).toBeTruthy());
      unmount();
    });

    it('Cancel button triggers confirmation alert', async () => {
      const { unmount } = renderScreen();
      await waitFor(() => expect(screen.getByText('Cancel Subscription')).toBeTruthy());

      fireEvent.press(screen.getByText('Cancel Subscription'));
      expect(Alert.alert).toHaveBeenCalledWith(
        'Cancel Subscription',
        expect.any(String),
        expect.any(Array)
      );
      unmount();
    });

    it('does not show plan list when already subscribed', async () => {
      const { unmount } = renderScreen();
      await waitFor(() => expect(screen.getByText('Professional')).toBeTruthy());
      // Plan list heading should not appear
      expect(screen.queryByText('Available Plans')).toBeNull();
      unmount();
    });
  });

  describe('when there is no active subscription', () => {
    beforeEach(() => {
      setupMocks({ subscription: null });
    });

    it('shows "No Active Subscription" message', async () => {
      const { unmount } = renderScreen();
      await waitFor(() => expect(screen.getByText('No Active Subscription')).toBeTruthy());
      unmount();
    });

    it('Cancel Subscription button is not visible', async () => {
      const { unmount } = renderScreen();
      await waitFor(() => expect(screen.getByText('No Active Subscription')).toBeTruthy());
      expect(screen.queryByText('Cancel Subscription')).toBeNull();
      unmount();
    });

    it('shows the "Available Plans" section', async () => {
      const { unmount } = renderScreen();
      await waitFor(() => expect(screen.getByText('Available Plans')).toBeTruthy());
      unmount();
    });
  });

  describe('on subscribe 409 conflict', () => {
    beforeEach(() => {
      setupMocks({ subscription: null });
    });

    it('shows already-subscribed error when 409 is returned', async () => {
      mockApiPost.mockRejectedValue({
        response: { status: 409, data: { detail: 'Agency already has an active subscription' } },
      });

      const { unmount } = renderScreen();
      await waitFor(() => expect(screen.getByText('Available Plans')).toBeTruthy());

      // Press Subscribe on the fallback plan (Starter — id 1)
      const subscribeButtons = screen.getAllByText('Subscribe');
      fireEvent.press(subscribeButtons[0]);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Already Subscribed',
          'You already have an active subscription.'
        );
      });
      unmount();
    });
  });
});
