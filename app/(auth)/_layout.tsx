import { Stack, router } from 'expo-router';
import { useEffect } from 'react';
import { useAuthStore } from '@/lib/stores/auth.store';

export default function AuthLayout() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  useEffect(() => {
    if (isHydrated && accessToken) {
      router.replace('/(tabs)/search');
    }
  }, [accessToken, isHydrated]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* login is the default entry for unauthenticated users.
          welcome is the sign-up entry point (reachable via the "Create an account" link). */}
      <Stack.Screen name="login" />
      <Stack.Screen name="welcome" />
    </Stack>
  );
}
