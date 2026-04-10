import { renderHook, act, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
    push: jest.fn(),
  },
}));

// Mock the api client
jest.mock('@/lib/api/client', () => ({
  api: {
    post: jest.fn(),
    get: jest.fn(),
  },
}));

// Mock the auth store
const mockSetTokens = jest.fn();
const mockSetUser = jest.fn();
const mockClearAuth = jest.fn();

jest.mock('@/lib/stores/auth.store', () => ({
  useAuthStore: {
    getState: jest.fn(() => ({
      accessToken: 'test-access-token',
      refreshToken: 'test-refresh-token',
      countryCode: 'TN',
      setTokens: mockSetTokens,
      setUser: mockSetUser,
      clearAuth: mockClearAuth,
    })),
  },
}));

import { api } from '@/lib/api/client';
import { router } from 'expo-router';
import { useLogin, useRegister, useLogout } from '@/hooks/useAuth';

const mockApi = api as jest.Mocked<typeof api>;
const mockRouter = router as jest.Mocked<typeof router>;

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
      queries: { retry: false },
    },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('useLogin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('stores tokens and navigates on success', async () => {
    const tokenResponse = {
      data: {
        access_token: 'new-access',
        refresh_token: 'new-refresh',
        token_type: 'bearer',
      },
    };
    const userResponse = {
      data: {
        id: 1,
        email: 'test@example.com',
        first_name: 'Jane',
        last_name: 'Smith',
        country_code: 'TN',
        is_active: true,
      },
    };

    mockSetTokens.mockResolvedValue(undefined);
    mockApi.post.mockResolvedValueOnce(tokenResponse);
    mockApi.get.mockResolvedValueOnce(userResponse);

    const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate({ email: 'test@example.com', password: 'Password123' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockApi.post).toHaveBeenCalledWith(
      '/auth/login/access-token',
      expect.stringContaining('username=test%40example.com'),
      expect.objectContaining({ headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
    );
    expect(mockSetTokens).toHaveBeenCalledWith('new-access', 'new-refresh');
    expect(mockSetUser).toHaveBeenCalledWith(userResponse.data);
    expect(mockRouter.replace).toHaveBeenCalledWith('/(tabs)/search');
  });

  it('surfaces error message on 400', async () => {
    const error = Object.assign(new Error('Bad request'), {
      response: { status: 400, data: { detail: 'Incorrect email or password' } },
    });
    mockApi.post.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate({ email: 'test@example.com', password: 'wrongpassword' });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeTruthy();
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });

  it('does not navigate on 429 error', async () => {
    const error = Object.assign(new Error('Too many requests'), {
      response: { status: 429, data: { detail: 'Rate limit exceeded' } },
    });
    mockApi.post.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate({ email: 'test@example.com', password: 'Password123' });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });
});

describe('useRegister', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls POST /users/ then auto-login', async () => {
    const registerResponse = { data: { id: 2, email: 'new@example.com' } };
    const tokenResponse = {
      data: {
        access_token: 'new-access',
        refresh_token: 'new-refresh',
        token_type: 'bearer',
      },
    };
    const userResponse = {
      data: {
        id: 2,
        email: 'new@example.com',
        first_name: 'John',
        last_name: 'Doe',
        country_code: 'TN',
        is_active: true,
      },
    };

    mockSetTokens.mockResolvedValue(undefined);
    mockApi.post
      .mockResolvedValueOnce(registerResponse)  // POST /users/
      .mockResolvedValueOnce(tokenResponse);    // POST /auth/login/access-token
    mockApi.get.mockResolvedValueOnce(userResponse);

    const { result } = renderHook(() => useRegister(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate({
        email: 'new@example.com',
        password: 'Password123',
        first_name: 'John',
        last_name: 'Doe',
        country_code: 'TN',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // First call is registration
    expect(mockApi.post.mock.calls[0][0]).toBe('/users/');
    // Second call is login
    expect(mockApi.post.mock.calls[1][0]).toBe('/auth/login/access-token');
    // After registration, new users are sent to the onboarding wizard
    expect(mockRouter.replace).toHaveBeenCalledWith('/onboarding/step-1');
  });
});

describe('useLogout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls clearAuth and navigates to welcome', async () => {
    mockClearAuth.mockResolvedValue(undefined);
    mockApi.post.mockResolvedValueOnce({ data: {} });

    const { result } = renderHook(() => useLogout(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate();
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockClearAuth).toHaveBeenCalled();
    expect(mockRouter.replace).toHaveBeenCalledWith('/(auth)/welcome');
  });
});
