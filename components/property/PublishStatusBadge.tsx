import { View, Text } from 'react-native';
import type { PublishStatus } from '@/lib/types/property';

interface PublishStatusBadgeProps {
  status: PublishStatus;
}

function statusLabel(status: PublishStatus): string {
  switch (status) {
    case 'pending':
      return 'Pending Review';
    case 'rejected':
      return 'Rejected';
    case 'not_published':
      return 'Draft';
    default:
      return status;
  }
}

function statusColors(status: PublishStatus): { container: string; text: string } {
  switch (status) {
    case 'pending':
      return { container: 'bg-amber-100', text: 'text-amber-700' };
    case 'rejected':
      return { container: 'bg-red-100', text: 'text-red-700' };
    case 'not_published':
      return { container: 'bg-gray-100', text: 'text-gray-600' };
    default:
      return { container: 'bg-gray-100', text: 'text-gray-600' };
  }
}

export function PublishStatusBadge({ status }: PublishStatusBadgeProps) {
  const colors = statusColors(status);
  return (
    <View className={`rounded-full px-3 py-1 self-start ${colors.container}`}>
      <Text className={`text-xs font-semibold ${colors.text}`}>
        {statusLabel(status)}
      </Text>
    </View>
  );
}
