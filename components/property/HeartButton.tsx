import { TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useFavorites } from '@/hooks/useFavorites';
import { haptic } from '@/lib/utils/haptics';
import { Icon } from '@/components/ui/Icon';
import { colors } from '@/constants/theme';

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
    void haptic.light();
    toggle(propertyId);
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={styles.btn}
      activeOpacity={0.85}
      accessibilityLabel={saved ? 'Remove from saved' : 'Save property'}
      accessibilityRole="button"
    >
      <Icon
        name="heart"
        size={18}
        color={saved ? colors.heartRed : colors.neutral400}
        fill={saved ? colors.heartRed : 'transparent'}
        strokeWidth={2}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: colors.heartBg,
  },
});
