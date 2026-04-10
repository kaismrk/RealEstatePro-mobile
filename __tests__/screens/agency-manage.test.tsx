import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Alert } from 'react-native';

// expo-router mock
const mockRouterBack = jest.fn();
const mockRouterPush = jest.fn();
const mockRouterReplace = jest.fn();
jest.mock('expo-router', () => ({
  router: {
    back: (...args: unknown[]) => mockRouterBack(...args),
    push: (...args: unknown[]) => mockRouterPush(...args),
    replace: (...args: unknown[]) => mockRouterReplace(...args),
  },
}));

// Auth store mock
jest.mock('@/lib/stores/auth.store', () => ({
  useAuthStore: (selector: (s: { accessToken: string | null; countryCode: string }) => unknown) =>
    selector({ accessToken: 'token-abc', countryCode: 'TN' }),
}));

// API mock
const mockApiGet = jest.fn();
const mockApiPatch = jest.fn();
const mockApiDelete = jest.fn();
jest.mock('@/lib/api/client', () => ({
  api: {
    get: (...args: unknown[]) => mockApiGet(...args),
    patch: (...args: unknown[]) => mockApiPatch(...args),
    delete: (...args: unknown[]) => mockApiDelete(...args),
  },
}));

import ManageAgencyScreen from '@/app/agency/manage';
import type { AgencyResponse, AgencyList } from '@/hooks/useAgencies';
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
  description: 'Best agency in town',
  social_links: { website: 'https://alpha.com' },
  country_code: 'TN',
  owner_id: 42,
  created_at: '2026-01-01T00:00:00Z',
};

const MOCK_LIST: AgencyList = { total: 1, items: [MOCK_AGENCY] };

function setupMocks() {
  mockApiGet.mockImplementation((url: string) => {
    if (url === '/users/me') return Promise.resolve({ data: MOCK_USER });
    if (url === '/agencies/') return Promise.resolve({ data: MOCK_LIST });
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
    React.createElement(createWrapper(), null, React.createElement(ManageAgencyScreen))
  );
}

describe('ManageAgencyScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    setupMocks();
  });

  it('renders the manage agency heading', async () => {
    const { unmount } = renderScreen();
    await waitFor(() => expect(screen.getByText('Manage Agency')).toBeTruthy());
    unmount();
  });

  it('pre-fills the agency name field', async () => {
    const { unmount } = renderScreen();
    await waitFor(() => expect(screen.getByDisplayValue('Alpha Realty')).toBeTruthy());
    unmount();
  });

  it('Save Changes button calls PATCH /agencies/{id} with correct body', async () => {
    mockApiPatch.mockResolvedValue({ data: { ...MOCK_AGENCY, name: 'Alpha Realty Updated' } });

    const { unmount } = renderScreen();
    await waitFor(() => expect(screen.getByDisplayValue('Alpha Realty')).toBeTruthy());

    // Update the agency name
    const nameInput = screen.getByDisplayValue('Alpha Realty');
    fireEvent.changeText(nameInput, 'Alpha Realty Updated');

    fireEvent.press(screen.getByText('Save Changes'));

    await waitFor(() => {
      expect(mockApiPatch).toHaveBeenCalledWith(
        '/agencies/1',
        expect.objectContaining({ name: 'Alpha Realty Updated' })
      );
    });
    unmount();
  });

  it('shows validation error when name is cleared', async () => {
    const { unmount } = renderScreen();
    await waitFor(() => expect(screen.getByDisplayValue('Alpha Realty')).toBeTruthy());

    const nameInput = screen.getByDisplayValue('Alpha Realty');
    fireEvent.changeText(nameInput, '');

    fireEvent.press(screen.getByText('Save Changes'));

    expect(Alert.alert).toHaveBeenCalledWith('Validation', 'Agency name is required.');
    expect(mockApiPatch).not.toHaveBeenCalled();
    unmount();
  });

  it('Delete button shows confirmation alert before firing DELETE', async () => {
    const { unmount } = renderScreen();
    await waitFor(() => expect(screen.getByText('Delete Agency')).toBeTruthy());

    fireEvent.press(screen.getByText('Delete Agency'));

    expect(Alert.alert).toHaveBeenCalledWith(
      'Delete Agency',
      expect.stringContaining('Alpha Realty'),
      expect.any(Array)
    );
    // DELETE should NOT have been called yet (pending confirmation)
    expect(mockApiDelete).not.toHaveBeenCalled();
    unmount();
  });

  it('navigates to subscription screen', async () => {
    const { unmount } = renderScreen();
    await waitFor(() => expect(screen.getByText('Manage Subscription')).toBeTruthy());

    fireEvent.press(screen.getByText('Manage Subscription'));
    expect(mockRouterPush).toHaveBeenCalledWith('/agency/subscription');
    unmount();
  });

  it('navigates to roster screen', async () => {
    const { unmount } = renderScreen();
    await waitFor(() => expect(screen.getByText('Agent Roster')).toBeTruthy());

    fireEvent.press(screen.getByText('Agent Roster'));
    expect(mockRouterPush).toHaveBeenCalledWith('/agency/roster');
    unmount();
  });
});
