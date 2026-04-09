import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

interface User {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  country_code: string | null;
  is_active: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  countryCode: string;
  isHydrated: boolean;
  setTokens: (access: string, refresh: string) => Promise<void>;
  setUser: (user: User) => void;
  setCountry: (code: string) => Promise<void>;
  clearAuth: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  countryCode: 'TN',
  isHydrated: false,

  setTokens: async (access, refresh) => {
    await SecureStore.setItemAsync('auth_access_token', access);
    await SecureStore.setItemAsync('auth_refresh_token', refresh);
    set({ accessToken: access, refreshToken: refresh });
  },

  setUser: (user) => set({ user }),

  setCountry: async (code) => {
    await SecureStore.setItemAsync('auth_country_code', code);
    set({ countryCode: code });
  },

  clearAuth: async () => {
    await SecureStore.deleteItemAsync('auth_access_token');
    await SecureStore.deleteItemAsync('auth_refresh_token');
    set({ user: null, accessToken: null, refreshToken: null });
  },

  hydrate: async () => {
    const accessToken = await SecureStore.getItemAsync('auth_access_token');
    const refreshToken = await SecureStore.getItemAsync('auth_refresh_token');
    const countryCode = await SecureStore.getItemAsync('auth_country_code');
    set({
      accessToken,
      refreshToken,
      countryCode: countryCode ?? 'TN',
      isHydrated: true,
    });
  },
}));
