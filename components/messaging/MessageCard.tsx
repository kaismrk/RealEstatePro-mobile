import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { MessageResponse } from '@/lib/types/message';
import { colors, radius, fontWeight, fontSize } from '@/constants/theme';

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
      style={[styles.row, isUnread ? styles.rowUnread : styles.rowRead]}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`Message from ${message.sender_name ?? 'Unknown sender'}`}
    >
      {/* Sender avatar */}
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text
            style={[styles.senderName, isUnread ? styles.senderNameUnread : styles.senderNameRead]}
            numberOfLines={1}
          >
            {message.sender_name ?? message.sender_email ?? 'Unknown sender'}
          </Text>
          <Text style={styles.time}>{timeAgo(message.created_at)}</Text>
        </View>

        {message.property?.title && (
          <Text style={styles.propertyTitle} numberOfLines={1}>
            {message.property.title}
          </Text>
        )}

        <Text
          style={[styles.preview, isUnread ? styles.previewUnread : styles.previewRead]}
          numberOfLines={2}
        >
          {preview}
        </Text>
      </View>

      {/* Unread dot */}
      {isUnread && (
        <View style={styles.unreadDot} accessibilityLabel="Unread" />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowUnread: {
    backgroundColor: colors.primaryLight,
  },
  rowRead: {
    backgroundColor: colors.surface,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  avatarText: {
    color: colors.textOnBrand,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  senderName: {
    fontSize: fontSize.sm,
    marginRight: 8,
  },
  senderNameUnread: {
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  senderNameRead: {
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
  },
  time: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
    flexShrink: 0,
  },
  propertyTitle: {
    fontSize: fontSize.xs,
    color: colors.primary,
    marginBottom: 2,
  },
  preview: {
    fontSize: fontSize.sm,
  },
  previewUnread: {
    color: colors.textSecondary,
  },
  previewRead: {
    color: colors.textTertiary,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    marginLeft: 12,
    flexShrink: 0,
  },
});
