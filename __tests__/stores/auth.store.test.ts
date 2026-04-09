import { useAuthStore } from '../../lib/stores/auth.store';

// Mock expo-secure-store
jest.mock('expo-secure-store', () => {
  const store: Record<string, string> = {};
  return {
    setItemAsync: jest.fn(async (key: string, value: string) => {
      store[key] = value;
    }),
    getItemAsync: jest.fn(async (key: string) => store[key] ?? null),
    deleteItemAsync: jest.fn(async (key: string) => {
      delete store[key];
    }),
  };
});

describe('useAuthStore', () => {
  beforeEach(() => {
    // Reset store state between tests
    useAuthStore.setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      countryCode: 'TN',
      isHydrated: false,
    });
  });

  it('setTokens updates accessToken and refreshToken in state', async () => {
    const { setTokens } = useAuthStore.getState();
    await setTokens('access-abc', 'refresh-xyz');

    const state = useAuthStore.getState();
    expect(state.accessToken).toBe('access-abc');
    expect(state.refreshToken).toBe('refresh-xyz');
  });

  it('clearAuth resets tokens to null', async () => {
    useAuthStore.setState({ accessToken: 'token', refreshToken: 'refresh' });
    const { clearAuth } = useAuthStore.getState();
    await clearAuth();

    const state = useAuthStore.getState();
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.user).toBeNull();
  });

  it('setCountry updates countryCode', async () => {
    const { setCountry } = useAuthStore.getState();
    await setCountry('FR');

    const state = useAuthStore.getState();
    expect(state.countryCode).toBe('FR');
  });

  it('setUser stores the user in state', () => {
    const { setUser } = useAuthStore.getState();
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User',
      country_code: 'TN',
      is_active: true,
    };
    setUser(mockUser);

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
  });

  it('hydrate sets isHydrated to true', async () => {
    const { hydrate } = useAuthStore.getState();
    await hydrate();

    const state = useAuthStore.getState();
    expect(state.isHydrated).toBe(true);
  });
});
