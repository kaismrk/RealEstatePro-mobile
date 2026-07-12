import { useState } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { api } from '@/lib/api/client';
import { useAuthStore } from '@/lib/stores/auth.store';

// Complete the auth session after redirect (required by expo-auth-session)
WebBrowser.maybeCompleteAuthSession();

// Capture env vars at module-load time with try-catch guards.
// Expo's Babel transform creates getters for EXPO_PUBLIC_* variables that can
// throw when the .env.local file is absent (e.g. in CI or fresh clones).
// Capturing at module scope means the error is handled once here rather than
// inside React render cycles where it cannot be caught cleanly.
function readEnv(key: string): string | undefined {
  try {
    return process.env[key as keyof NodeJS.ProcessEnv] as string | undefined;
  } catch {
    return undefined;
  }
}

const GOOGLE_IOS_CLIENT_ID     = readEnv('EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID');
const GOOGLE_ANDROID_CLIENT_ID = readEnv('EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID');
const GOOGLE_WEB_CLIENT_ID     = readEnv('EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID');

// Feature flag — false when env vars are absent (e.g. dev clone without .env.local)
const FEATURE_SOCIAL_AUTH_GOOGLE =
  typeof GOOGLE_IOS_CLIENT_ID === 'string' && GOOGLE_IOS_CLIENT_ID !== '';

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

export interface GoogleSignInResult {
  /** Whether the Google button should be rendered */
  isAvailable: boolean;
  /** Call to open the Google OAuth picker */
  signIn: () => Promise<void>;
  /** Non-null when sign-in ended with an error or cancellation */
  error: string | null;
  /** True while the OAuth flow or the backend exchange is in flight */
  isLoading: boolean;
}

export function useGoogleSignIn(): GoogleSignInResult {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Always call the hook (React rules) — env var constants are safe (captured at module level)
  const [, , promptAsync] = Google.useIdTokenAuthRequest({
    iosClientId:     GOOGLE_IOS_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    webClientId:     GOOGLE_WEB_CLIENT_ID,
  });

  async function signIn(): Promise<void> {
    if (!FEATURE_SOCIAL_AUTH_GOOGLE) return;

    setError(null);
    setIsLoading(true);

    try {
      const result = await promptAsync();

      if (!result) {
        setError(t('auth.social.error.failed'));
        return;
      }

      if (result.type === 'cancel' || result.type === 'dismiss') {
        setError(t('auth.social.error.cancelled'));
        return;
      }

      if (result.type === 'error') {
        setError(t('auth.social.error.failed'));
        return;
      }

      if (result.type === 'success') {
        const idToken = result.params.id_token;
        if (!idToken) {
          setError(t('auth.social.error.failed'));
          return;
        }
        await exchangeGoogleToken(idToken);
      }
    } catch {
      setError(t('auth.social.error.failed'));
    } finally {
      setIsLoading(false);
    }
  }

  async function exchangeGoogleToken(idToken: string): Promise<void> {
    const { setTokens, setUser } = useAuthStore.getState();

    const tokenRes = await api.post<TokenResponse>('/auth/oauth/google', {
      id_token: idToken,
    });
    await setTokens(tokenRes.data.access_token, tokenRes.data.refresh_token);

    const userRes = await api.get<UserResponse>('/users/me');
    setUser(userRes.data);

    router.replace('/(tabs)/search');
  }

  return {
    isAvailable: FEATURE_SOCIAL_AUTH_GOOGLE,
    signIn,
    error,
    isLoading,
  };
}
