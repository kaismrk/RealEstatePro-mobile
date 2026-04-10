import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { api } from '@/lib/api/client';
import { useAuthStore } from '@/lib/stores/auth.store';

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
}

interface LoginParams {
  email: string;
  password: string;
}

interface RegisterParams {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  country_code: string;
}

async function fetchMe(): Promise<UserResponse> {
  const res = await api.get<UserResponse>('/users/me');
  return res.data;
}

async function performLogin(email: string, password: string): Promise<void> {
  const { setTokens, setUser } = useAuthStore.getState();

  // FastAPI OAuth2 login requires application/x-www-form-urlencoded
  const formData = new URLSearchParams();
  formData.append('username', email);
  formData.append('password', password);

  const tokenRes = await api.post<TokenResponse>(
    '/auth/login/access-token',
    formData.toString(),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );

  await setTokens(tokenRes.data.access_token, tokenRes.data.refresh_token);
  const user = await fetchMe();
  setUser(user);
}

export function useLogin() {
  return useMutation<void, Error, LoginParams>({
    mutationFn: ({ email, password }) => performLogin(email, password),
    onSuccess: () => {
      router.replace('/(tabs)/search');
    },
  });
}

export function useRegister() {
  return useMutation<void, Error, RegisterParams>({
    mutationFn: async ({ email, password, first_name, last_name, country_code }) => {
      // Register the user
      await api.post('/users/', { email, password, first_name, last_name, country_code });
      // Auto-login with the same credentials
      await performLogin(email, password);
    },
    onSuccess: () => {
      router.replace('/(tabs)/search');
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: async () => {
      const { accessToken, clearAuth } = useAuthStore.getState();
      if (accessToken) {
        try {
          await api.post('/auth/logout');
        } catch {
          // Even if blacklist fails, we still clear locally
        }
      }
      await clearAuth();
    },
    onSuccess: () => {
      queryClient.clear();
      router.replace('/(auth)/welcome');
    },
  });
}

export function useGoogleLogin() {
  return useMutation<void, Error, { google_token: string }>({
    mutationFn: async ({ google_token }) => {
      const { setTokens, setUser } = useAuthStore.getState();

      const tokenRes = await api.post<TokenResponse>('/auth/login/google', {
        google_token,
      });

      await setTokens(tokenRes.data.access_token, tokenRes.data.refresh_token);
      const user = await fetchMe();
      setUser(user);
    },
    onSuccess: () => {
      router.replace('/(tabs)/search');
    },
  });
}
