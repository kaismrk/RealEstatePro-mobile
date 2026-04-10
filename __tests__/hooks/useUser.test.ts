import { renderHook, waitFor, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mocks declared before imports that use them
const mockApiGet = jest.fn();
const mockApiPut = jest.fn();

jest.mock('@/lib/api/client', () => ({
  api: {
    get: (...args: unknown[]) => mockApiGet(...args),
    put: (...args: unknown[]) => mockApiPut(...args),
  },
}));

const mockClearAuth = jest.fn();
const mockSetUser = jest.fn();
let mockAccessToken: string | null = 'valid-token';

jest.mock('@/lib/stores/auth.store', () => ({
  useAuthStore: (selector: (s: { accessToken: string | null }) => unknown) =>
    selector({ accessToken: mockAccessToken }),
}));

// We also need getState for useUpdateProfile / useChangePassword
// Patch after the jest.mock call so we can mutate mockAccessToken
const authStoreMod = require('@/lib/stores/auth.store') as {
  useAuthStore: jest.MockedFunction<(s: (state: { accessToken: string | null }) => unknown) => unknown> & {
    getState: () => { clearAuth: jest.Mock; setUser: jest.Mock };
  };
};

authStoreMod.useAuthStore.getState = () => ({
  clearAuth: mockClearAuth,
  setUser: mockSetUser,
});

const mockRouterReplace = jest.fn();
jest.mock('expo-router', () => ({
  router: {
    replace: (...args: unknown[]) => mockRouterReplace(...args),
    push: jest.fn(),
    back: jest.fn(),
  },
}));

import { useCurrentUser, useUpdateProfile, useChangePassword, useListingQuota } from '@/hooks/useUser';
import type { UserResponse, ListingQuotaResponse } from '@/lib/types/user';

const MOCK_USER: UserResponse = {
  id: 1,
  email: 'test@example.com',
  first_name: 'Jane',
  last_name: 'Doe',
  country_code: 'TN',
  is_active: true,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-04-07T00:00:00Z',
  last_login: '2026-04-07T00:00:00Z',
};

const MOCK_QUOTA: ListingQuotaResponse = {
  free_remaining: 2,
  paid_remaining: 5,
  country_code: 'TN',
  updated_at: '2026-04-07T00:00:00Z',
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('useCurrentUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAccessToken = 'valid-token';
  });

  it('fetches /users/me when accessToken is present', async () => {
    mockApiGet.mockResolvedValueOnce({ data: MOCK_USER });

    const { result } = renderHook(() => useCurrentUser(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockApiGet).toHaveBeenCalledWith('/users/me');
    expect(result.current.data?.email).toBe('test@example.com');
    expect(result.current.data?.first_name).toBe('Jane');
  });

  it('is disabled when no accessToken', () => {
    mockAccessToken = null;

    const { result } = renderHook(() => useCurrentUser(), { wrapper: createWrapper() });

    // Query is disabled — should stay pending without fetching
    expect(result.current.fetchStatus).toBe('idle');
    expect(mockApiGet).not.toHaveBeenCalled();

    mockAccessToken = 'valid-token';
  });

  it('exposes error state on API failure', async () => {
    mockApiGet.mockRejectedValueOnce(new Error('Unauthorized'));

    const { result } = renderHook(() => useCurrentUser(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('Unauthorized');
  });
});

describe('useUpdateProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAccessToken = 'valid-token';
  });

  it('calls PUT /users/me/profile with the given payload', async () => {
    mockApiPut.mockResolvedValueOnce({ data: { ...MOCK_USER, first_name: 'Updated' } });

    const { result } = renderHook(() => useUpdateProfile(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate({ first_name: 'Updated' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockApiPut).toHaveBeenCalledWith('/users/me/profile', { first_name: 'Updated' });
  });

  it('calls setUser on the auth store with the updated user', async () => {
    const updatedUser = { ...MOCK_USER, last_name: 'Smith' };
    mockApiPut.mockResolvedValueOnce({ data: updatedUser });

    const { result } = renderHook(() => useUpdateProfile(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate({ last_name: 'Smith' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockSetUser).toHaveBeenCalledWith(
      expect.objectContaining({ last_name: 'Smith' })
    );
  });

  it('exposes error state on API failure', async () => {
    mockApiPut.mockRejectedValueOnce(new Error('Bad Request'));

    const { result } = renderHook(() => useUpdateProfile(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate({ email: 'bad' });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('Bad Request');
  });
});

describe('useChangePassword', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockClearAuth.mockResolvedValue(undefined);
    mockAccessToken = 'valid-token';
  });

  it('calls PUT /users/me with { password }', async () => {
    mockApiPut.mockResolvedValueOnce({ data: MOCK_USER });

    const { result } = renderHook(() => useChangePassword(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate({ password: 'NewPass1' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockApiPut).toHaveBeenCalledWith('/users/me', { password: 'NewPass1' });
  });

  it('calls clearAuth and redirects to welcome on success', async () => {
    mockApiPut.mockResolvedValueOnce({ data: MOCK_USER });

    const { result } = renderHook(() => useChangePassword(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate({ password: 'NewPass1' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockClearAuth).toHaveBeenCalled();
    expect(mockRouterReplace).toHaveBeenCalledWith('/(auth)/welcome');
  });

  it('exposes error state on API failure', async () => {
    mockApiPut.mockRejectedValueOnce(new Error('Forbidden'));

    const { result } = renderHook(() => useChangePassword(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate({ password: 'NewPass1' });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('Forbidden');
  });
});

describe('useListingQuota', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAccessToken = 'valid-token';
  });

  it('fetches /users/me/quota when authenticated', async () => {
    mockApiGet.mockResolvedValueOnce({ data: MOCK_QUOTA });

    const { result } = renderHook(() => useListingQuota(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockApiGet).toHaveBeenCalledWith('/users/me/quota');
    expect(result.current.data?.free_remaining).toBe(2);
    expect(result.current.data?.paid_remaining).toBe(5);
  });

  it('is disabled when no accessToken', () => {
    mockAccessToken = null;

    const { result } = renderHook(() => useListingQuota(), { wrapper: createWrapper() });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockApiGet).not.toHaveBeenCalled();

    mockAccessToken = 'valid-token';
  });

  it('exposes error state on API failure', async () => {
    mockApiGet.mockRejectedValueOnce(new Error('Server error'));

    const { result } = renderHook(() => useListingQuota(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('Server error');
  });
});
