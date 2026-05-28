import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, fontWeight } from '@/constants/theme';

interface BoostBadgeProps {
  label?: string;
}

export function BoostBadge({ label = 'Featured' }: BoostBadgeProps) {
  return (
    <View style={styles.badge}>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  label: { fontSize: 11, fontWeight: fontWeight.bold, color: '#fff' },
});
