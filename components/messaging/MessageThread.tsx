import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { colors, radius, fontWeight } from '@/constants/theme';
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
    <ScrollView style={styles.scroll}>
      <View style={styles.senderRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.senderInfo}>
          <Text style={styles.senderName}>
            {message.sender_name ?? message.sender_email ?? 'Unknown sender'}
          </Text>
          {message.sender_email && message.sender_name && (
            <Text style={styles.senderEmail}>{message.sender_email}</Text>
          )}
          <Text style={styles.timestamp}>{formatDate(message.created_at)}</Text>
        </View>
      </View>

      {message.property && (
        <View style={styles.propertyCard}>
          <Text style={styles.propertyLabel}>About property</Text>
          <Text style={styles.propertyTitle} numberOfLines={2}>
            {message.property.title}
          </Text>
          {message.property.price > 0 && (
            <Text style={styles.propertyPrice}>
              {message.property.price.toLocaleString()}
            </Text>
          )}
        </View>
      )}

      <View style={styles.bodyWrap}>
        <Text style={styles.body}>{message.body}</Text>
      </View>

      {message.read_at && (
        <View style={styles.readWrap}>
          <Text style={styles.readText}>Read {formatDate(message.read_at)}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.surface },
  senderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: { color: colors.textOnBrand, fontSize: 16, fontWeight: fontWeight.semibold },
  senderInfo: { flex: 1 },
  senderName: { fontSize: 16, fontWeight: fontWeight.semibold, color: colors.textPrimary },
  senderEmail: { fontSize: 14, color: colors.textSecondary },
  timestamp: { fontSize: 12, color: colors.textTertiary, marginTop: 2 },
  propertyCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: colors.surfaceSunken,
    borderRadius: radius.lg,
    padding: 12,
  },
  propertyLabel: {
    fontSize: 11,
    color: colors.textTertiary,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  propertyTitle: { fontSize: 14, fontWeight: fontWeight.medium, color: colors.textPrimary },
  propertyPrice: { fontSize: 14, color: colors.primary, marginTop: 2 },
  bodyWrap: { paddingHorizontal: 16, paddingVertical: 16 },
  body: { fontSize: 16, color: colors.textPrimary, lineHeight: 24 },
  readWrap: { paddingHorizontal: 16, paddingBottom: 16 },
  readText: { fontSize: 12, color: colors.textTertiary },
});
