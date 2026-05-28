import { create } from 'zustand';
import { secureStorage } from '@/lib/utils/secureStorage';

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
    await secureStorage.setItem('auth_access_token', access);
    await secureStorage.setItem('auth_refresh_token', refresh);
    set({ accessToken: access, refreshToken: refresh });
  },

  setUser: (user) => set({ user }),

  setCountry: async (code) => {
    await secureStorage.setItem('auth_country_code', code);
    set({ countryCode: code });
  },

  clearAuth: async () => {
    await secureStorage.removeItem('auth_access_token');
    await secureStorage.removeItem('auth_refresh_token');
    set({ user: null, accessToken: null, refreshToken: null });
  },

  hydrate: async () => {
    const accessToken = await secureStorage.getItem('auth_access_token');
    const refreshToken = await secureStorage.getItem('auth_refresh_token');
    const countryCode = await secureStorage.getItem('auth_country_code');
    set({
      accessToken,
      refreshToken,
      countryCode: countryCode ?? 'TN',
      isHydrated: true,
    });
  },
}));
