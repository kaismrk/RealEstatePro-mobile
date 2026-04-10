import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import EditProfileScreen from '@/app/profile/edit';
import type { UserResponse } from '@/lib/types/user';

// expo-router mock
const mockRouterBack = jest.fn();
const mockRouterReplace = jest.fn();
jest.mock('expo-router', () => ({
  router: {
    back: (...args: unknown[]) => mockRouterBack(...args),
    replace: (...args: unknown[]) => mockRouterReplace(...args),
    push: jest.fn(),
  },
}));

// API mock
const mockApiGet = jest.fn();
const mockApiPut = jest.fn();
jest.mock('@/lib/api/client', () => ({
  api: {
    get: (...args: unknown[]) => mockApiGet(...args),
    put: (...args: unknown[]) => mockApiPut(...args),
  },
}));

// Auth store mock
let mockAccessToken: string | null = 'valid-token';
jest.mock('@/lib/stores/auth.store', () => ({
  useAuthStore: (selector: (s: { accessToken: string | null }) => unknown) =>
    selector({ accessToken: mockAccessToken }),
}));

const authStoreMod = require('@/lib/stores/auth.store') as {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useAuthStore: jest.MockedFunction<(...args: any[]) => any> & {
    getState: () => { setUser: jest.Mock; clearAuth: jest.Mock };
  };
};
authStoreMod.useAuthStore.getState = () => ({
  setUser: jest.fn(),
  clearAuth: jest.fn().mockResolvedValue(undefined),
});

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

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

function renderEdit() {
  return render(React.createElement(createWrapper(), null, React.createElement(EditProfileScreen)));
}

describe('EditProfileScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAccessToken = 'valid-token';
  });

  it('renders the Edit Profile heading', async () => {
    mockApiGet.mockResolvedValueOnce({ data: MOCK_USER });
    renderEdit();
    await waitFor(() => expect(screen.getByText('Edit Profile')).toBeTruthy());
  });

  it('populates form fields from user data', async () => {
    mockApiGet.mockResolvedValueOnce({ data: MOCK_USER });
    renderEdit();
    await waitFor(() => {
      expect(screen.getByDisplayValue('Jane')).toBeTruthy();
      expect(screen.getByDisplayValue('Doe')).toBeTruthy();
      expect(screen.getByDisplayValue('jane@example.com')).toBeTruthy();
    });
  });

  it('shows the country field as read-only (not editable)', async () => {
    mockApiGet.mockResolvedValueOnce({ data: MOCK_USER });
    renderEdit();
    await waitFor(() => {
      expect(screen.getByText('TN')).toBeTruthy();
      expect(screen.getByText('Country can only be changed in App Settings.')).toBeTruthy();
    });
  });

  it('calls PUT /users/me/profile on Save Changes', async () => {
    mockApiGet.mockResolvedValueOnce({ data: MOCK_USER });
    mockApiPut.mockResolvedValueOnce({ data: { ...MOCK_USER, first_name: 'Updated' } });

    renderEdit();

    await waitFor(() => expect(screen.getByDisplayValue('Jane')).toBeTruthy());

    const firstNameInput = screen.getByDisplayValue('Jane');
    fireEvent.changeText(firstNameInput, 'Updated');
    fireEvent.press(screen.getByText('Save Changes'));

    await waitFor(() => {
      expect(mockApiPut).toHaveBeenCalledWith(
        '/users/me/profile',
        expect.objectContaining({ first_name: 'Updated' })
      );
    });
  });

  it('does not submit when email format is invalid', async () => {
    mockApiGet.mockResolvedValueOnce({ data: MOCK_USER });
    renderEdit();

    await waitFor(() => expect(screen.getByDisplayValue('jane@example.com')).toBeTruthy());

    const emailInput = screen.getByDisplayValue('jane@example.com');
    fireEvent.changeText(emailInput, 'not-valid-email');
    fireEvent.press(screen.getByText('Save Changes'));

    await waitFor(() =>
      expect(screen.getByText('Enter a valid email address')).toBeTruthy()
    );
    expect(mockApiPut).not.toHaveBeenCalled();
  });

  it('navigates back after successful save', async () => {
    mockApiGet.mockResolvedValueOnce({ data: MOCK_USER });
    mockApiPut.mockResolvedValueOnce({ data: MOCK_USER });

    renderEdit();

    await waitFor(() => expect(screen.getByDisplayValue('Jane')).toBeTruthy());

    // Change something so payload is non-empty
    const lastNameInput = screen.getByDisplayValue('Doe');
    fireEvent.changeText(lastNameInput, 'Smith');
    fireEvent.press(screen.getByText('Save Changes'));

    await waitFor(() => expect(mockRouterBack).toHaveBeenCalled());
  });

  it('redirects unauthenticated users', () => {
    mockAccessToken = null;
    renderEdit();
    expect(mockRouterReplace).toHaveBeenCalledWith('/(auth)/welcome');
  });
});
