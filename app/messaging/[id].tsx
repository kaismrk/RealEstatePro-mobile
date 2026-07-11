import { useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AuthGate } from '@/components/auth/AuthGate';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { MessageThread } from '@/components/messaging/MessageThread';
import { useInbox, useMarkAsRead } from '@/hooks/useMessages';
import { colors, radius, fontWeight, fontSize } from '@/constants/theme';

function MessageDetailContent() {
  const { t } = useTranslation();
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
        <ScreenHeader title={t('messaging.chat.title')} back />
        <View style={styles.centeredFill}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title={message.sender_name ?? message.sender_email ?? t('messaging.chat.title')} back />

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
          <Text style={styles.replyBtnText}>{t('messaging.chat.replyButton')}</Text>
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
