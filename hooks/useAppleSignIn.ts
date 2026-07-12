import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { api } from '@/lib/api/client';
import { useAuthStore } from '@/lib/stores/auth.store';

// Note: Platform.OS is checked inside the hook (not as a module constant) so that
// tests can override Platform.OS via Object.defineProperty before calling the hook.

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

interface UserResponse {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  country_code: string | null;
  is_active: boolean;
  phone_e164?: string | null;
}

export interface AppleSignInResult {
  /** Whether the Apple button should be rendered (false on Android / iOS < 13) */
  isAvailable: boolean;
  /** Call to start the Apple native sign-in sheet */
  signIn: () => Promise<void>;
  /** Non-null when sign-in ended with an error or cancellation */
  error: string | null;
  /** True while the Apple sheet or backend exchange is in flight */
  isLoading: boolean;
}

export function useAppleSignIn(): AppleSignInResult {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  // Runtime availability check — Apple requires iOS 13+ native support
  const [isNativelyAvailable, setIsNativelyAvailable] = useState(false);

  // Evaluated at hook-call time so Platform.OS test mocks apply correctly
  const platformIsIos = Platform.OS === 'ios';

  useEffect(() => {
    if (!platformIsIos) return;
    AppleAuthentication.isAvailableAsync()
      .then(setIsNativelyAvailable)
      .catch(() => setIsNativelyAvailable(false));
  }, [platformIsIos]);

  async function signIn(): Promise<void> {
    if (!platformIsIos || !isNativelyAvailable) return;

    setError(null);
    setIsLoading(true);

    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        setError(t('auth.social.error.failed'));
        return;
      }

      await exchangeAppleCredential(
        credential.identityToken,
        credential.authorizationCode ?? null,
        credential.fullName?.givenName ?? null,
        credential.fullName?.familyName ?? null,
      );
    } catch (err: unknown) {
      const appleErr = err as { code?: string };
      if (appleErr.code === 'ERR_REQUEST_CANCELED') {
        setError(t('auth.social.error.cancelled'));
      } else {
        setError(t('auth.social.error.failed'));
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function exchangeAppleCredential(
    identityToken: string,
    authorizationCode: string | null,
    givenName: string | null,
    familyName: string | null,
  ): Promise<void> {
    const { setTokens, setUser } = useAuthStore.getState();

    const tokenRes = await api.post<TokenResponse>('/auth/oauth/apple', {
      identity_token: identityToken,
      authorization_code: authorizationCode,
      given_name: givenName,
      family_name: familyName,
    });
    await setTokens(tokenRes.data.access_token, tokenRes.data.refresh_token);

    const userRes = await api.get<UserResponse>('/users/me');
    setUser(userRes.data);

    router.replace('/(tabs)/search');
  }

  return {
    isAvailable: platformIsIos && isNativelyAvailable,
    signIn,
    error,
    isLoading,
  };
}
