import { View, Text, TouchableOpacity } from 'react-native';
import type { MessageResponse } from '@/lib/types/message';

interface MessageCardProps {
  message: MessageResponse;
  onPress: () => void;
}

function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffMins < 60) return diffMins <= 1 ? 'Just now' : `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 5) return `${diffWeeks}w ago`;
  return `${diffMonths}mo ago`;
}

function getInitials(name?: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return (parts[0]?.[0] ?? '?').toUpperCase();
  return ((parts[0]?.[0] ?? '') + (parts[parts.length - 1]?.[0] ?? '')).toUpperCase();
}

export function MessageCard({ message, onPress }: MessageCardProps) {
  const isUnread = !message.is_read;
  const preview =
    message.body.length > 80 ? message.body.slice(0, 80) + '…' : message.body;
  const initials = getInitials(message.sender_name);

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-row items-center px-4 py-3 border-b border-gray-100 ${isUnread ? 'bg-blue-50' : 'bg-white'}`}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`Message from ${message.sender_name ?? 'Unknown sender'}`}
    >
      {/* Sender avatar */}
      <View className="w-11 h-11 rounded-full bg-blue-600 items-center justify-center mr-3 shrink-0">
        <Text className="text-white text-sm font-semibold">{initials}</Text>
      </View>

      {/* Content */}
      <View className="flex-1 min-w-0">
        <View className="flex-row items-center justify-between mb-0.5">
          <Text
            className={`text-sm mr-2 ${isUnread ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}
            numberOfLines={1}
          >
            {message.sender_name ?? message.sender_email ?? 'Unknown sender'}
          </Text>
          <Text className="text-xs text-gray-400 shrink-0">{timeAgo(message.created_at)}</Text>
        </View>

        {message.property?.title && (
          <Text className="text-xs text-blue-600 mb-0.5" numberOfLines={1}>
            {message.property.title}
          </Text>
        )}

        <Text
          className={`text-sm ${isUnread ? 'text-gray-700' : 'text-gray-500'}`}
          numberOfLines={2}
        >
          {preview}
        </Text>
      </View>

      {/* Unread dot */}
      {isUnread && (
        <View
          className="w-2.5 h-2.5 rounded-full bg-blue-600 ml-3 shrink-0"
          accessibilityLabel="Unread"
        />
      )}
    </TouchableOpacity>
  );
}
