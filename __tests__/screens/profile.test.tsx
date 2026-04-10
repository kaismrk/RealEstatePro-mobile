import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProfileScreen from '@/app/(tabs)/profile';
import type { UserResponse } from '@/lib/types/user';
import type { MessageList } from '@/lib/types/message';

// expo-router mock
const mockRouterPush = jest.fn();
const mockRouterReplace = jest.fn();
jest.mock('expo-router', () => ({
  router: {
    push: (...args: unknown[]) => mockRouterPush(...args),
    replace: (...args: unknown[]) => mockRouterReplace(...args),
    back: jest.fn(),
  },
}));

// API mock — we need to differentiate /users/me vs /messages/inbox
const mockApiGet = jest.fn();
jest.mock('@/lib/api/client', () => ({
  api: {
    get: (...args: unknown[]) => mockApiGet(...args),
    post: jest.fn(),
  },
}));

// Auth store mock (mutable)
let mockAccessToken: string | null = null;
jest.mock('@/lib/stores/auth.store', () => ({
  useAuthStore: (selector: (s: { accessToken: string | null }) => unknown) =>
    selector({ accessToken: mockAccessToken }),
}));

const MOCK_USER: UserResponse = {
  id: 1,
  email: 'jane@example.com',
  first_name: 'Jane',
  last_name: 'Doe',
  country_code: 'TN',
  is_active: true,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-04-07T00:00:00Z',
  last_login: '2026-04-07T00:00:00Z',
};

const MOCK_INBOX: MessageList = { total: 0, items: [] };

function setupApiGetMock() {
  mockApiGet.mockImplementation((url: string) => {
    if (url === '/users/me') return Promise.resolve({ data: MOCK_USER });
    if (url === '/messages/inbox') return Promise.resolve({ data: MOCK_INBOX });
    if (url === '/agents/me') return Promise.reject(Object.assign(new Error('Not an agent'), { response: { status: 404 } }));
    if (url.startsWith('/agencies/')) return Promise.resolve({ data: { total: 0, items: [] } });
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

function renderProfile() {
  return render(React.createElement(createWrapper(), null, React.createElement(ProfileScreen)));
}

describe('ProfileScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAccessToken = null;
  });

  describe('Guest view', () => {
    it('shows sign-in CTA when not authenticated', () => {
      mockAccessToken = null;
      renderProfile();
      expect(screen.getByText('Sign In')).toBeTruthy();
    });

    it('shows "Your Profile" heading in guest view', () => {
      mockAccessToken = null;
      renderProfile();
      expect(screen.getByText('Your Profile')).toBeTruthy();
    });

    it('navigates to welcome screen when Sign In is pressed', () => {
      mockAccessToken = null;
      renderProfile();
      fireEvent.press(screen.getByText('Sign In'));
      expect(mockRouterPush).toHaveBeenCalledWith('/(auth)/welcome');
    });
  });

  describe('Authenticated view', () => {
    beforeEach(() => {
      mockAccessToken = 'token-abc';
      setupApiGetMock();
    });

    it('renders the Profile heading', async () => {
      const { unmount } = renderProfile();
      await waitFor(() => expect(screen.getByText('Profile')).toBeTruthy());
      unmount();
    });

    it('renders Account section', async () => {
      const { unmount } = renderProfile();
      await waitFor(() => expect(screen.getByText('Edit Profile')).toBeTruthy());
      expect(screen.getByText('Change Password')).toBeTruthy();
      expect(screen.getByText('My Listings')).toBeTruthy();
      expect(screen.getByText('Listing Quota')).toBeTruthy();
      unmount();
    });

    it('renders Activity section', async () => {
      const { unmount } = renderProfile();
      await waitFor(() => expect(screen.getByText('Messages')).toBeTruthy());
      expect(screen.getByText('Saved Homes')).toBeTruthy();
      expect(screen.getByText('Saved Searches')).toBeTruthy();
      unmount();
    });

    it('renders Settings section', async () => {
      const { unmount } = renderProfile();
      await waitFor(() => expect(screen.getByText('Notifications')).toBeTruthy());
      expect(screen.getByText('App Settings')).toBeTruthy();
      unmount();
    });

    it('navigates to edit when Edit Profile is pressed', async () => {
      const { unmount } = renderProfile();
      await waitFor(() => expect(screen.getByText('Edit Profile')).toBeTruthy());
      fireEvent.press(screen.getByText('Edit Profile'));
      expect(mockRouterPush).toHaveBeenCalledWith('/profile/edit');
      unmount();
    });

    it('navigates to change-password when Change Password is pressed', async () => {
      const { unmount } = renderProfile();
      await waitFor(() => expect(screen.getByText('Change Password')).toBeTruthy());
      fireEvent.press(screen.getByText('Change Password'));
      expect(mockRouterPush).toHaveBeenCalledWith('/profile/change-password');
      unmount();
    });

    it('navigates to quota screen', async () => {
      const { unmount } = renderProfile();
      await waitFor(() => expect(screen.getByText('Listing Quota')).toBeTruthy());
      fireEvent.press(screen.getByText('Listing Quota'));
      expect(mockRouterPush).toHaveBeenCalledWith('/profile/quota');
      unmount();
    });
  });
});
