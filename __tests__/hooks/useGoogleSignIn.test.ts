/**
 * Tests for useGoogleSignIn hook.
 *
 * Mocking strategy:
 *  - expo-auth-session/providers/google → jest.mock with controllable promptAsync
 *  - expo-web-browser → jest.mock (side-effect: maybeCompleteAuthSession)
 *  - @/lib/api/client → jest.mock
 *  - @/lib/stores/auth.store → jest.mock
 *  - expo-router → jest.mock
 */

// Must be hoisted before any import that triggers side effects
jest.mock('expo-web-browser', () => ({
  maybeCompleteAuthSession: jest.fn(),
}));

jest.mock('expo-router', () => ({
  router: { replace: jest.fn() },
}));

const mockSetTokens = jest.fn();
const mockSetUser   = jest.fn();
jest.mock('@/lib/stores/auth.store', () => ({
  useAuthStore: {
    getState: jest.fn(() => ({
      setTokens: mockSetTokens,
      setUser:   mockSetUser,
    })),
  },
}));

jest.mock('@/lib/api/client', () => ({
  api: {
    post: jest.fn(),
    get:  jest.fn(),
  },
}));

// Controllable promptAsync — overridden per test with mockResolvedValueOnce
const mockPromptAsync = jest.fn(() =>
  Promise.resolve({ type: 'cancel' as const })
);
jest.mock('expo-auth-session/providers/google', () => ({
  useIdTokenAuthRequest: jest.fn(() => [
    { url: 'https://accounts.google.com/o/oauth2/mock' },
    null,
    mockPromptAsync,
  ]),
}));

import { renderHook, act } from '@testing-library/react-native';
import { api } from '@/lib/api/client';
import { router } from 'expo-router';
import { useGoogleSignIn } from '@/hooks/useGoogleSignIn';

const mockApi    = api    as jest.Mocked<typeof api>;
const mockRouter = router as jest.Mocked<typeof router>;

const TOKEN_RESPONSE = {
  data: { access_token: 'acc-token', refresh_token: 'ref-token', token_type: 'bearer' },
};
const USER_RESPONSE = {
  data: { id: 1, email: 't@t.com', first_name: 'T', last_name: 'T', country_code: 'TN', is_active: true },
};

describe('useGoogleSignIn', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSetTokens.mockResolvedValue(undefined);
    // Default: promptAsync returns cancel (safe fallback)
    mockPromptAsync.mockResolvedValue({ type: 'cancel' as const });
  });

  it('calls POST /auth/oauth/google with id_token on success and navigates', async () => {
    mockPromptAsync.mockResolvedValueOnce({
      type: 'success' as const,
      params: { id_token: 'google-id-token-123' },
      url: 'https://accounts.google.com',
    } as unknown as { type: 'cancel' });
    mockApi.post.mockResolvedValueOnce(TOKEN_RESPONSE);
    mockApi.get.mockResolvedValueOnce(USER_RESPONSE);

    const { result } = renderHook(() => useGoogleSignIn());

    await act(async () => {
      await result.current.signIn();
    });

    expect(mockApi.post).toHaveBeenCalledWith('/auth/oauth/google', {
      id_token: 'google-id-token-123',
    });
    expect(mockSetTokens).toHaveBeenCalledWith('acc-token', 'ref-token');
    expect(mockSetUser).toHaveBeenCalledWith(USER_RESPONSE.data);
    expect(mockRouter.replace).toHaveBeenCalledWith('/(tabs)/search');
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('sets cancelled error when user dismisses the Google picker', async () => {
    mockPromptAsync.mockResolvedValueOnce({ type: 'cancel' });

    const { result } = renderHook(() => useGoogleSignIn());

    await act(async () => {
      await result.current.signIn();
    });

    expect(result.current.error).toBe('Sign-in cancelled');
    expect(mockApi.post).not.toHaveBeenCalled();
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });

  it('sets failed error on OAuth error type', async () => {
    mockPromptAsync.mockResolvedValueOnce({ type: 'error', error: 'access_denied' } as unknown as { type: 'cancel' });

    const { result } = renderHook(() => useGoogleSignIn());

    await act(async () => {
      await result.current.signIn();
    });

    expect(result.current.error).toBe('Sign-in failed. Try again.');
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });

  it('sets failed error when backend exchange throws', async () => {
    mockPromptAsync.mockResolvedValueOnce({
      type: 'success',
      params: { id_token: 'some-token' },
      url: 'https://accounts.google.com',
    } as unknown as { type: 'cancel' });
    mockApi.post.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useGoogleSignIn());

    await act(async () => {
      await result.current.signIn();
    });

    expect(result.current.error).toBe('Sign-in failed. Try again.');
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });

  it('exposes isAvailable as a boolean and signIn as a function', () => {
    const { result } = renderHook(() => useGoogleSignIn());
    expect(typeof result.current.isAvailable).toBe('boolean');
    expect(typeof result.current.signIn).toBe('function');
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });
});
