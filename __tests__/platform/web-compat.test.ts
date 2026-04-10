/**
 * web-compat.test.ts
 *
 * Verifies that auth.store works correctly when expo-secure-store falls back to
 * a localStorage-like in-memory implementation (as Expo SDK does on web).
 *
 * On web, expo-secure-store is backed by AsyncStorage / localStorage rather
 * than the native Keychain / Android Keystore.  The store API is identical,
 * so the Zustand auth.store should work without any changes.
 *
 * This test simulates the web environment by replacing expo-secure-store with
 * a pure-JS Map-backed implementation — no native module calls.
 * Variable is prefixed "mock" so jest.mock() can reference it (Jest hoisting
 * restriction: only `mock`-prefixed names are allowed inside factory functions).
 */

// Must be declared before jest.mock() — Jest hoists mock() but allows
// variables whose names start with "mock".
const mockWebStorage = new Map<string, string>();

jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(async (key: string, value: string) => {
    mockWebStorage.set(key, value);
  }),
  getItemAsync: jest.fn(async (key: string) => mockWebStorage.get(key) ?? null),
  deleteItemAsync: jest.fn(async (key: string) => {
    mockWebStorage.delete(key);
  }),
}));

// Import AFTER mock is set up
import { useAuthStore } from '../../lib/stores/auth.store';

describe('auth.store — web compatibility (localStorage fallback)', () => {
  beforeEach(() => {
    mockWebStorage.clear();
    useAuthStore.setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      countryCode: 'TN',
      isHydrated: false,
    });
  });

  it('setTokens persists tokens to the web storage and updates Zustand state', async () => {
    const { setTokens } = useAuthStore.getState();
    await setTokens('web-access-123', 'web-refresh-456');

    // Zustand state updated
    const state = useAuthStore.getState();
    expect(state.accessToken).toBe('web-access-123');
    expect(state.refreshToken).toBe('web-refresh-456');

    // Web storage holds the values (simulates localStorage on web)
    expect(mockWebStorage.get('auth_access_token')).toBe('web-access-123');
    expect(mockWebStorage.get('auth_refresh_token')).toBe('web-refresh-456');
  });

  it('hydrate reads tokens written to web storage', async () => {
    // Simulate a previous session that wrote to localStorage
    mockWebStorage.set('auth_access_token', 'persisted-access');
    mockWebStorage.set('auth_refresh_token', 'persisted-refresh');
    mockWebStorage.set('auth_country_code', 'FR');

    const { hydrate } = useAuthStore.getState();
    await hydrate();

    const state = useAuthStore.getState();
    expect(state.accessToken).toBe('persisted-access');
    expect(state.refreshToken).toBe('persisted-refresh');
    expect(state.countryCode).toBe('FR');
    expect(state.isHydrated).toBe(true);
  });

  it('hydrate defaults countryCode to TN when storage is empty', async () => {
    const { hydrate } = useAuthStore.getState();
    await hydrate();

    const state = useAuthStore.getState();
    expect(state.countryCode).toBe('TN');
    expect(state.isHydrated).toBe(true);
  });

  it('clearAuth removes tokens from web storage and resets state', async () => {
    // Seed storage
    mockWebStorage.set('auth_access_token', 'old-access');
    mockWebStorage.set('auth_refresh_token', 'old-refresh');
    useAuthStore.setState({ accessToken: 'old-access', refreshToken: 'old-refresh' });

    const { clearAuth } = useAuthStore.getState();
    await clearAuth();

    // Storage cleared
    expect(mockWebStorage.get('auth_access_token')).toBeUndefined();
    expect(mockWebStorage.get('auth_refresh_token')).toBeUndefined();

    // Zustand state reset
    const state = useAuthStore.getState();
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.user).toBeNull();
  });

  it('setCountry writes to web storage and updates Zustand state', async () => {
    const { setCountry } = useAuthStore.getState();
    await setCountry('MA');

    expect(useAuthStore.getState().countryCode).toBe('MA');
    expect(mockWebStorage.get('auth_country_code')).toBe('MA');
  });

  it('setUser stores user in Zustand state without touching storage', () => {
    const mockUser = {
      id: 42,
      email: 'webuser@example.com',
      first_name: 'Web',
      last_name: 'User',
      country_code: 'TN',
      is_active: true,
    };
    useAuthStore.getState().setUser(mockUser);

    expect(useAuthStore.getState().user).toEqual(mockUser);
    // setUser has no storage side-effect — confirm storage stays empty
    expect(mockWebStorage.size).toBe(0);
  });

  it('multiple operations in sequence work correctly on web storage', async () => {
    const store = useAuthStore.getState();

    await store.setTokens('seq-access', 'seq-refresh');
    await store.setCountry('DZ');

    // Hydrate should read everything back
    useAuthStore.setState({ accessToken: null, refreshToken: null, countryCode: 'TN', isHydrated: false });
    await useAuthStore.getState().hydrate();

    const state = useAuthStore.getState();
    expect(state.accessToken).toBe('seq-access');
    expect(state.countryCode).toBe('DZ');
    expect(state.isHydrated).toBe(true);
  });
});
