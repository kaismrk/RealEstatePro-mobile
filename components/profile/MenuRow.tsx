import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { colors, fontWeight, radius } from '@/constants/theme';

interface MenuRowProps {
  icon: string;
  label: string;
  onPress: () => void;
  badge?: number;
  destructive?: boolean;
  accessibilityLabel?: string;
}

export function MenuRow({ icon, label, onPress, badge, destructive = false, accessibilityLabel }: MenuRowProps) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
    >
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.label, destructive && styles.labelDestructive]}>{label}</Text>
      <View style={styles.right}>
        {badge !== undefined && badge > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
        <Icon name="chevron-right" size={16} color={colors.textTertiary} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  icon: { fontSize: 20, marginRight: 14 },
  label: { flex: 1, fontSize: 16, color: colors.textPrimary },
  labelDestructive: { color: colors.error, fontWeight: fontWeight.medium },
  right: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  badge: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: 7,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: { fontSize: 11, color: '#fff', fontWeight: fontWeight.bold },
});
