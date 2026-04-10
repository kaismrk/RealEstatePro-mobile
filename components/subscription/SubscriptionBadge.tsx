import { View, Text } from 'react-native';
import type { SubscriptionStatus } from '@/hooks/useSubscription';

interface SubscriptionBadgeProps {
  status: SubscriptionStatus;
}

const STATUS_CONFIG: Record<
  SubscriptionStatus,
  { label: string; bgClass: string; textClass: string }
> = {
  active: {
    label: 'Active',
    bgClass: 'bg-green-100',
    textClass: 'text-green-700',
  },
  cancelled: {
    label: 'Cancelled',
    bgClass: 'bg-red-100',
    textClass: 'text-red-700',
  },
  expired: {
    label: 'Expired',
    bgClass: 'bg-gray-100',
    textClass: 'text-gray-600',
  },
};

export function SubscriptionBadge({ status }: SubscriptionBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.expired;

  return (
    <View className={`rounded-full px-3 py-0.5 self-start ${config.bgClass}`}>
      <Text className={`text-xs font-semibold ${config.textClass}`}>{config.label}</Text>
    </View>
  );
}
