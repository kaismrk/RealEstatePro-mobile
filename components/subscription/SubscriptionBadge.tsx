import { View, Text, StyleSheet, type ViewStyle, type TextStyle } from 'react-native';
import { colors, radius, fontWeight } from '@/constants/theme';
import type { SubscriptionStatus } from '@/hooks/useSubscription';

interface SubscriptionBadgeProps {
  status: SubscriptionStatus;
}

const STATUS_CONFIG: Record<
  SubscriptionStatus,
  { label: string; container: ViewStyle; text: TextStyle }
> = {
  active: {
    label: 'Active',
    container: { backgroundColor: colors.successBg },
    text: { color: colors.success },
  },
  cancelled: {
    label: 'Cancelled',
    container: { backgroundColor: colors.errorBg },
    text: { color: colors.error },
  },
  expired: {
    label: 'Expired',
    container: { backgroundColor: colors.surfaceSunken },
    text: { color: colors.textSecondary },
  },
};

export function SubscriptionBadge({ status }: SubscriptionBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.expired;

  return (
    <View style={[styles.badge, config.container]}>
      <Text style={[styles.label, config.text]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  label: { fontSize: 11, fontWeight: fontWeight.semibold },
});
