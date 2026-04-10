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

  return <Stack screenOptions={{ headerShown: false }} />;
}
