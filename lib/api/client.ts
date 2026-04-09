import axios from 'axios';

const API_URL = process.env['EXPO_PUBLIC_API_URL'] ?? 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Request interceptor: attach auth token and country code
api.interceptors.request.use((config) => {
  // Lazy require to avoid circular deps — auth store is built in F1
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { useAuthStore } = require('../stores/auth.store') as {
    useAuthStore: { getState: () => { accessToken: string | null; countryCode: string; refreshToken: string | null; setTokens: (a: string, r: string) => void; clearAuth: () => void } };
  };
  const state = useAuthStore.getState();

  if (state.accessToken) {
    config.headers['Authorization'] = `Bearer ${state.accessToken}`;
  }
  if (state.countryCode) {
    config.headers['X-Country-Code'] = state.countryCode;
  }
  return config;
});

// Response interceptor: handle 401 (token refresh) and 402 (quota)
api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    const axiosError = error as {
      response?: { status?: number; data?: { detail?: string } };
      config?: { _retry?: boolean; headers?: Record<string, string> };
    };

    if (axiosError.response?.status === 401 && axiosError.config && !axiosError.config._retry) {
      axiosError.config._retry = true;

      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { useAuthStore } = require('../stores/auth.store') as {
        useAuthStore: { getState: () => { accessToken: string | null; countryCode: string; refreshToken: string | null; setTokens: (a: string, r: string) => void; clearAuth: () => void } };
      };
      const state = useAuthStore.getState();

      if (state.refreshToken) {
        try {
          const res = await axios.post<{ access_token: string; refresh_token: string }>(
            `${API_URL}/auth/refresh-token`,
            { refresh_token: state.refreshToken }
          );
          state.setTokens(res.data.access_token, res.data.refresh_token);
          if (axiosError.config.headers) {
            axiosError.config.headers['Authorization'] = `Bearer ${res.data.access_token}`;
          }
          return api(axiosError.config);
        } catch {
          state.clearAuth();
        }
      }
    }

    if (axiosError.response?.status === 402) {
      const quotaError = new Error(axiosError.response?.data?.detail ?? 'Listing quota exhausted');
      quotaError.name = 'QuotaExhaustedError';
      throw quotaError;
    }

    throw error;
  }
);

export default api;
