import type { ReactNode } from 'react';
import { router } from 'expo-router';
import { useAuthStore } from '@/lib/stores/auth.store';

interface AuthGateProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AuthGate({ children, fallback }: AuthGateProps) {
  const accessToken = useAuthStore((state) => state.accessToken);

  if (!accessToken) {
    if (fallback !== undefined) {
      return fallback;
    }
    // Default fallback: redirect to login
    router.replace('/(auth)/welcome');
    return null;
  }

  return children;
}
