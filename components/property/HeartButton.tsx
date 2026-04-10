import { TouchableOpacity, Text } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useFavorites } from '@/hooks/useFavorites';

interface HeartButtonProps {
  propertyId: number;
}

export function HeartButton({ propertyId }: HeartButtonProps) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { isFavorited, toggle } = useFavorites();

  const saved = isFavorited(propertyId);

  function handlePress() {
    if (!accessToken) {
      router.push('/(auth)/welcome');
      return;
    }
    toggle(propertyId);
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="w-9 h-9 items-center justify-center rounded-full bg-white/80"
      accessibilityLabel={saved ? 'Remove from saved' : 'Save property'}
      accessibilityRole="button"
    >
      <Text className="text-xl">{saved ? '\u2764\uFE0F' : '\uD83E\uDD0D'}</Text>
    </TouchableOpacity>
  );
}
