import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Icon, type IconName } from '@/components/ui/Icon';
import { colors, fontWeight, radius } from '@/constants/theme';

interface MenuRowProps {
  icon: IconName;
  label: string;
  onPress: () => void;
  badge?: number;
  destructive?: boolean;
  accessibilityLabel?: string;
}

export function MenuRow({ icon, label, onPress, badge, destructive = false, accessibilityLabel }: MenuRowProps) {
  const iconColor = destructive ? colors.error : colors.textSecondary;
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
    >
      <View style={styles.iconWrap}>
        <Icon name={icon} size={20} color={iconColor} />
      </View>
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
    paddingVertical: 14,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconWrap: { width: 28, marginRight: 14, alignItems: 'flex-start' },
  label: { flex: 1, fontSize: 15, color: colors.textPrimary },
  labelDestructive: { color: colors.error, fontWeight: fontWeight.medium },
  right: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 22,
    alignItems: 'center',
  },
  badgeText: { fontSize: 11, color: colors.textOnBrand, fontWeight: fontWeight.semibold },
});
