import { View, Text, ScrollView } from 'react-native';
import type { MessageResponse } from '@/lib/types/message';

interface MessageThreadProps {
  message: MessageResponse;
}

function getInitials(name?: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return (parts[0]?.[0] ?? '?').toUpperCase();
  return ((parts[0]?.[0] ?? '') + (parts[parts.length - 1]?.[0] ?? '')).toUpperCase();
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function MessageThread({ message }: MessageThreadProps) {
  const initials = getInitials(message.sender_name);

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Sender info */}
      <View className="flex-row items-center px-4 py-4 border-b border-gray-100">
        <View className="w-12 h-12 rounded-full bg-primary-500 items-center justify-center mr-3">
          <Text className="text-white text-base font-semibold">{initials}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900">
            {message.sender_name ?? message.sender_email ?? 'Unknown sender'}
          </Text>
          {message.sender_email && message.sender_name && (
            <Text className="text-sm text-gray-500">{message.sender_email}</Text>
          )}
          <Text className="text-xs text-gray-400 mt-0.5">
            {formatDate(message.created_at)}
          </Text>
        </View>
      </View>

      {/* Property context */}
      {message.property && (
        <View className="mx-4 mt-4 bg-gray-50 rounded-xl p-3">
          <Text className="text-xs text-gray-500 mb-0.5 uppercase tracking-wide">About property</Text>
          <Text className="text-sm font-medium text-gray-900" numberOfLines={2}>
            {message.property.title}
          </Text>
          {message.property.price > 0 && (
            <Text className="text-sm text-primary-500 mt-0.5">
              {message.property.price.toLocaleString()}
            </Text>
          )}
        </View>
      )}

      {/* Message body */}
      <View className="px-4 py-4">
        <Text className="text-base text-gray-800 leading-6">{message.body}</Text>
      </View>

      {/* Read status */}
      {message.read_at && (
        <View className="px-4 pb-4">
          <Text className="text-xs text-gray-400">
            Read {formatDate(message.read_at)}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
