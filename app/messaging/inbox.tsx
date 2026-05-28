import { View, Text, StyleSheet } from 'react-native';
import { AuthGate } from '@/components/auth/AuthGate';
import { InboxList } from '@/components/messaging/InboxList';
import { useInbox } from '@/hooks/useMessages';
import { colors, fontWeight, fontSize } from '@/constants/theme';

function InboxContent() {
  const { data, isLoading, isRefetching, refetch } = useInbox();

  const messages = data?.items ?? [];
  const unreadCount = messages.filter((m) => !m.is_read).length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </View>

      <InboxList
        messages={messages}
        isLoading={isLoading}
        isRefreshing={isRefetching}
        onRefresh={refetch}
      />
    </View>
  );
}

export default function InboxScreen() {
  return (
    <AuthGate>
      <InboxContent />
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
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    flex: 1,
  },
  badge: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    color: colors.textOnBrand,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
});
