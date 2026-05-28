import { useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { AuthGate } from '@/components/auth/AuthGate';
import { MessageThread } from '@/components/messaging/MessageThread';
import { useInbox, useMarkAsRead } from '@/hooks/useMessages';
import { colors, radius, fontWeight, fontSize } from '@/constants/theme';

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
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Message</Text>
        </View>
        <View style={styles.centeredFill}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {message.sender_name ?? message.sender_email ?? 'Message'}
        </Text>
      </View>

      <MessageThread message={message} />

      {/* Reply stub */}
      <View style={styles.replyBar}>
        <TouchableOpacity
          style={styles.replyBtn}
          accessibilityRole="button"
          accessibilityLabel="Reply to message"
          onPress={() => {
            // Stub — full conversation threading is future
          }}
        >
          <Text style={styles.replyBtnText}>Reply</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    marginRight: 12,
  },
  backText: {
    color: colors.primary,
    fontSize: fontSize.base,
  },
  headerTitle: {
    flex: 1,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  centeredFill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  replyBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  replyBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  replyBtnText: {
    color: colors.textOnBrand,
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.base,
  },
});
