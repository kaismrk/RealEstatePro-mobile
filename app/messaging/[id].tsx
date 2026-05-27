import { useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { AuthGate } from '@/components/auth/AuthGate';
import { MessageThread } from '@/components/messaging/MessageThread';
import { useInbox, useMarkAsRead } from '@/hooks/useMessages';

function MessageDetailContent() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const messageId = Number(id);

  const { data } = useInbox();
  const markAsRead = useMarkAsRead();

  const message = data?.items.find((m) => m.id === messageId);

  // Auto-fire mark as read on mount if not already read
  useEffect(() => {
    if (message && !message.is_read) {
      markAsRead.mutate(messageId);
    }
    // Only run on mount / when message read state changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messageId, message?.is_read]);

  if (!message) {
    return (
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center px-4 pt-14 pb-3 border-b border-gray-100">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-3"
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text className="text-primary-500 text-base">Back</Text>
          </TouchableOpacity>
          <Text className="flex-1 text-base font-semibold text-gray-900">Message</Text>
        </View>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-4 pt-14 pb-3 border-b border-gray-100">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mr-3"
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text className="text-primary-500 text-base">Back</Text>
        </TouchableOpacity>
        <Text className="flex-1 text-base font-semibold text-gray-900" numberOfLines={1}>
          {message.sender_name ?? message.sender_email ?? 'Message'}
        </Text>
      </View>

      <MessageThread message={message} />

      {/* Reply stub */}
      <View className="px-4 py-3 border-t border-gray-100">
        <TouchableOpacity
          className="bg-primary-500 rounded-xl py-3 items-center"
          accessibilityRole="button"
          accessibilityLabel="Reply to message"
          onPress={() => {
            // Stub — full conversation threading is future
          }}
        >
          <Text className="text-white font-semibold text-base">Reply</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function MessageDetailScreen() {
  return (
    <AuthGate>
      <MessageDetailContent />
    </AuthGate>
  );
}
