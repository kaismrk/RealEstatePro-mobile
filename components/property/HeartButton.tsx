import { useState } from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/lib/stores/auth.store';

interface HeartButtonProps {
  propertyId: number;
  initialSaved?: boolean;
}

export function HeartButton({ propertyId: _propertyId, initialSaved = false }: HeartButtonProps) {
  const [saved, setSaved] = useState(initialSaved);
  const accessToken = useAuthStore((s) => s.accessToken);

  function handlePress() {
    if (!accessToken) {
      // Not authenticated — redirect to auth flow (full AuthGate modal in F5)
      router.push('/(auth)/welcome');
      return;
    }
    // Toggle local state — full mutation wired in F5
    setSaved((prev) => !prev);
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="w-9 h-9 items-center justify-center rounded-full bg-white/80"
      accessibilityLabel={saved ? 'Remove from saved' : 'Save property'}
      accessibilityRole="button"
    >
      <Text className="text-xl">{saved ? '❤️' : '🤍'}</Text>
    </TouchableOpacity>
  );
}
