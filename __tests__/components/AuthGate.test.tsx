import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { AuthGate } from '@/components/auth/AuthGate';

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
  },
}));

// Mock useAuthStore
const mockAccessToken: { value: string | null } = { value: null };
jest.mock('@/lib/stores/auth.store', () => ({
  useAuthStore: (selector: (state: { accessToken: string | null }) => unknown) =>
    selector({ accessToken: mockAccessToken.value }),
}));

import { router } from 'expo-router';

const mockRouter = router as jest.Mocked<typeof router>;

describe('AuthGate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAccessToken.value = null;
  });

  it('renders children when accessToken is present', () => {
    mockAccessToken.value = 'valid-token';
    render(
      <AuthGate>
        <Text>Protected Content</Text>
      </AuthGate>
    );
    expect(screen.getByText('Protected Content')).toBeTruthy();
  });

  it('renders fallback when accessToken is null', () => {
    mockAccessToken.value = null;
    render(
      <AuthGate fallback={<Text>Please log in</Text>}>
        <Text>Protected Content</Text>
      </AuthGate>
    );
    expect(screen.getByText('Please log in')).toBeTruthy();
    expect(screen.queryByText('Protected Content')).toBeNull();
  });

  it('navigates to welcome when no token and no fallback', () => {
    mockAccessToken.value = null;
    render(
      <AuthGate>
        <Text>Protected Content</Text>
      </AuthGate>
    );
    expect(mockRouter.replace).toHaveBeenCalledWith('/(auth)/welcome');
    expect(screen.queryByText('Protected Content')).toBeNull();
  });

  it('does not navigate when token is present', () => {
    mockAccessToken.value = 'valid-token';
    render(
      <AuthGate>
        <Text>Protected Content</Text>
      </AuthGate>
    );
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });
});
