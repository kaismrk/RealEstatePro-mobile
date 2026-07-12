/**
 * Tests for useAppleSignIn hook.
 *
 * Mocking strategy:
 *  - expo-apple-authentication → __mocks__/expo-apple-authentication.js (via jest.config moduleNameMapper)
 *  - Platform → inline override via jest.mock or direct property assignment
 *  - @/lib/api/client → inline jest.mock
 *  - @/lib/stores/auth.store → inline jest.mock
 *  - expo-router → inline jest.mock
 */

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

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { api } from '@/lib/api/client';
import { router } from 'expo-router';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useAppleSignIn } from '@/hooks/useAppleSignIn';

const mockApple  = AppleAuthentication as jest.Mocked<typeof AppleAuthentication>;
const mockApi    = api    as jest.Mocked<typeof api>;
const mockRouter = router as jest.Mocked<typeof router>;

const TOKEN_RESPONSE = {
  data: { access_token: 'apple-acc', refresh_token: 'apple-ref', token_type: 'bearer' },
};
const USER_RESPONSE = {
  data: { id: 2, email: 'a@a.com', first_name: 'A', last_name: 'B', country_code: 'TN', is_active: true },
};

describe('useAppleSignIn — iOS', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Simulate running on iOS
    Object.defineProperty(Platform, 'OS', { get: () => 'ios', configurable: true });
    mockSetTokens.mockResolvedValue(undefined);
    // Default: Apple native is available
    mockApple.isAvailableAsync.mockResolvedValue(true);
  });

  it('returns isAvailable=true when isAvailableAsync resolves true on iOS', async () => {
    mockApple.isAvailableAsync.mockResolvedValue(true);

    const { result } = renderHook(() => useAppleSignIn());

    await waitFor(() => expect(result.current.isAvailable).toBe(true));
  });

  it('returns isAvailable=false when isAvailableAsync resolves false (iOS < 13)', async () => {
    mockApple.isAvailableAsync.mockResolvedValue(false);

    const { result } = renderHook(() => useAppleSignIn());

    await waitFor(() => expect(result.current.isAvailable).toBe(false));
  });

  it('calls POST /auth/oauth/apple with correct fields on success', async () => {
    mockApple.isAvailableAsync.mockResolvedValue(true);
    mockApple.signInAsync.mockResolvedValueOnce({
      user:              'apple-uid',
      email:             'apple@example.com',
      identityToken:     'apple-id-token',
      authorizationCode: 'apple-auth-code',
      fullName: {
        givenName:   'Jane',
        familyName:  'Doe',
        namePrefix:  null,
        nameSuffix:  null,
        middleName:  null,
        nickname:    null,
      },
      realUserStatus: 1,
      state:           null,
    } as unknown as AppleAuthentication.AppleAuthenticationCredential);
    mockApi.post.mockResolvedValueOnce(TOKEN_RESPONSE);
    mockApi.get.mockResolvedValueOnce(USER_RESPONSE);

    const { result } = renderHook(() => useAppleSignIn());
    await waitFor(() => expect(result.current.isAvailable).toBe(true));

    await act(async () => {
      await result.current.signIn();
    });

    expect(mockApi.post).toHaveBeenCalledWith('/auth/oauth/apple', {
      identity_token:     'apple-id-token',
      authorization_code: 'apple-auth-code',
      given_name:         'Jane',
      family_name:        'Doe',
    });
    expect(mockSetTokens).toHaveBeenCalledWith('apple-acc', 'apple-ref');
    expect(mockRouter.replace).toHaveBeenCalledWith('/(tabs)/search');
    expect(result.current.error).toBeNull();
  });

  it('sets cancelled error when user taps Cancel on the Apple sheet', async () => {
    mockApple.isAvailableAsync.mockResolvedValue(true);
    const cancelError = Object.assign(new Error('User cancelled'), {
      code: 'ERR_REQUEST_CANCELED',
    });
    mockApple.signInAsync.mockRejectedValueOnce(cancelError);

    const { result } = renderHook(() => useAppleSignIn());
    await waitFor(() => expect(result.current.isAvailable).toBe(true));

    await act(async () => {
      await result.current.signIn();
    });

    expect(result.current.error).toBe('Sign-in cancelled');
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });

  it('sets failed error on non-cancel Apple exception', async () => {
    mockApple.isAvailableAsync.mockResolvedValue(true);
    mockApple.signInAsync.mockRejectedValueOnce(new Error('Something went wrong'));

    const { result } = renderHook(() => useAppleSignIn());
    await waitFor(() => expect(result.current.isAvailable).toBe(true));

    await act(async () => {
      await result.current.signIn();
    });

    expect(result.current.error).toBe('Sign-in failed. Try again.');
  });
});

describe('useAppleSignIn — Android', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Simulate running on Android
    Object.defineProperty(Platform, 'OS', { get: () => 'android', configurable: true });
  });

  it('returns isAvailable=false on Android without calling isAvailableAsync', async () => {
    const { result } = renderHook(() => useAppleSignIn());

    // Give useEffect a tick to run (it shouldn't call isAvailableAsync on Android)
    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });

    expect(result.current.isAvailable).toBe(false);
    expect(mockApple.isAvailableAsync).not.toHaveBeenCalled();
  });
});
