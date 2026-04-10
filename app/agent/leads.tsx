import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  type ListRenderItemInfo,
} from 'react-native';
import { router } from 'expo-router';
import { useAgentLeads } from '@/hooks/useAgentLeads';
import { Button } from '@/components/ui/Button';
import type { MessageResponse } from '@/lib/types/message';

function LeadItem({ item }: { item: MessageResponse }) {
  const date = new Date(item.created_at).toLocaleDateString();

  return (
    <TouchableOpacity
      className="bg-white border border-gray-100 rounded-xl p-4 mb-2"
      onPress={() => router.push(`/messaging/${item.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`Lead from ${item.sender_name ?? 'user'}`}
    >
      {/* Property context */}
      {item.property && (
        <View className="bg-gray-50 rounded-lg px-3 py-2 mb-2">
          <Text className="text-xs text-gray-500">Property</Text>
          <Text className="text-xs font-semibold text-gray-800" numberOfLines={1}>
            {item.property.title}
          </Text>
        </View>
      )}

      {/* Sender */}
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <Text className="text-sm font-semibold text-gray-900">
            {item.sender_name ?? item.sender_email ?? `Sender #${item.sender_id}`}
          </Text>
          <Text className="text-sm text-gray-700 mt-1" numberOfLines={3}>
            {item.body}
          </Text>
        </View>
        <View className="ml-3 items-end">
          <Text className="text-xs text-gray-400">{date}</Text>
          {!item.is_read && (
            <View className="w-2.5 h-2.5 rounded-full bg-blue-600 mt-1" />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function AgentLeadsScreen() {
  const { data, isLoading, isError, refetch } = useAgentLeads();

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-4 pt-14 pb-4 bg-white border-b border-gray-100 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Text className="text-blue-600 text-base">Back</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">All Leads</Text>
        {data && (
          <Text className="ml-2 text-sm text-gray-500">({data.total})</Text>
        )}
      </View>

      {isLoading && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      )}

      {isError && (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-gray-500 mb-4 text-center">Failed to load leads.</Text>
          <Button onPress={() => refetch()} variant="secondary">
            Try Again
          </Button>
        </View>
      )}

      {!isLoading && !isError && (
        <FlatList<MessageResponse>
          data={data?.items ?? []}
          renderItem={({ item }: ListRenderItemInfo<MessageResponse>) => (
            <LeadItem item={item} />
          )}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <View className="items-center justify-center pt-16">
              <Text className="text-4xl mb-3">📩</Text>
              <Text className="text-lg font-semibold text-gray-900 mb-1">No leads yet</Text>
              <Text className="text-gray-500 text-center">
                Leads will appear here when potential buyers or renters contact you.
              </Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
