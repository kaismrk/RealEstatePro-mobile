import { View, Text } from 'react-native';
import { AuthGate } from '@/components/auth/AuthGate';
import { InboxList } from '@/components/messaging/InboxList';
import { useInbox } from '@/hooks/useMessages';

function InboxContent() {
  const { data, isLoading, isRefetching, refetch } = useInbox();

  const messages = data?.items ?? [];
  const unreadCount = messages.filter((m) => !m.is_read).length;

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-4 pt-14 pb-3 border-b border-gray-100">
        <Text className="text-xl font-bold text-gray-900 flex-1">Messages</Text>
        {unreadCount > 0 && (
          <View className="bg-primary-500 rounded-full px-2 py-0.5 min-w-5 items-center">
            <Text className="text-white text-xs font-semibold">{unreadCount}</Text>
          </View>
        )}
      </View>

      <InboxList
        messages={messages}
        isLoading={isLoading}
        isRefreshing={isRefetching}
        onRefresh={refetch}
      />
    </View>
  );
}

export default function InboxScreen() {
  return (
    <AuthGate>
      <InboxContent />
    </AuthGate>
  );
}
