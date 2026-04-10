import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useInbox } from '@/hooks/useMessages';
import { useAuthStore } from '@/lib/stores/auth.store';

function MessagesMenuItem() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { data } = useInbox();
  const unreadCount = accessToken ? (data?.items.filter((m) => !m.is_read).length ?? 0) : 0;

  return (
    <TouchableOpacity
      className="flex-row items-center justify-between px-4 py-4 border-b border-gray-100"
      onPress={() => router.push('/messaging/inbox')}
      accessibilityRole="button"
      accessibilityLabel="Messages"
    >
      <View className="flex-row items-center">
        <Text className="text-2xl mr-3">💬</Text>
        <Text className="text-base text-gray-800">Messages</Text>
      </View>
      <View className="flex-row items-center">
        {unreadCount > 0 && (
          <View className="bg-blue-600 rounded-full px-2 py-0.5 min-w-5 items-center mr-2">
            <Text className="text-white text-xs font-semibold">{unreadCount}</Text>
          </View>
        )}
        <Text className="text-gray-400 text-base">›</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  return (
    <View className="flex-1 bg-white pt-14">
      {/* Header */}
      <View className="px-4 pb-4 border-b border-gray-100">
        <Text className="text-xl font-bold text-gray-900">Profile</Text>
      </View>

      {/* Menu items */}
      <MessagesMenuItem />
    </View>
  );
}
