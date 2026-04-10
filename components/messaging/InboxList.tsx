import { FlatList, View, Text, RefreshControl, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import type { MessageResponse } from '@/lib/types/message';
import { MessageCard } from './MessageCard';

interface InboxListProps {
  messages: MessageResponse[];
  isRefreshing?: boolean;
  onRefresh?: () => void;
  isLoading?: boolean;
}

function EmptyState() {
  return (
    <View className="flex-1 items-center justify-center py-20">
      <Text className="text-5xl mb-4">💬</Text>
      <Text className="text-lg font-semibold text-gray-800 mb-1">No messages yet</Text>
      <Text className="text-sm text-gray-500 text-center px-8">
        When someone sends you an inquiry, it will appear here.
      </Text>
    </View>
  );
}

export function InboxList({ messages, isRefreshing = false, onRefresh, isLoading = false }: InboxListProps) {
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  const sorted = [...messages].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <FlatList
      data={sorted}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => (
        <MessageCard
          message={item}
          onPress={() => router.push(`/messaging/${item.id}`)}
        />
      )}
      ListEmptyComponent={<EmptyState />}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        ) : undefined
      }
      contentContainerStyle={messages.length === 0 ? { flex: 1 } : undefined}
    />
  );
}
