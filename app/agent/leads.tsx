import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  type ListRenderItemInfo,
} from 'react-native';
import { router } from 'expo-router';
import { useAgentLeads } from '@/hooks/useAgentLeads';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { colors, radius, fontWeight } from '@/constants/theme';
import type { MessageResponse } from '@/lib/types/message';

function LeadItem({ item }: { item: MessageResponse }) {
  const date = new Date(item.created_at).toLocaleDateString();

  return (
    <TouchableOpacity
      style={styles.leadItem}
      onPress={() => router.push(`/messaging/${item.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`Lead from ${item.sender_name ?? 'user'}`}
    >
      {/* Property context */}
      {item.property && (
        <View style={styles.propertyContext}>
          <Text style={styles.propertyContextLabel}>Property</Text>
          <Text style={styles.propertyContextTitle} numberOfLines={1}>
            {item.property.title}
          </Text>
        </View>
      )}

      {/* Sender */}
      <View style={styles.senderRow}>
        <View style={styles.senderBody}>
          <Text style={styles.senderName}>
            {item.sender_name ?? item.sender_email ?? `Sender #${item.sender_id}`}
          </Text>
          <Text style={styles.messageBody} numberOfLines={3}>
            {item.body}
          </Text>
        </View>
        <View style={styles.metaColumn}>
          <Text style={styles.dateText}>{date}</Text>
          {!item.is_read && <View style={styles.unreadDot} />}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function AgentLeadsScreen() {
  const { data, isLoading, isError, refetch } = useAgentLeads();

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBack}>
          <Icon name="chevron-left" size={18} color={colors.primary} />
          <Text style={styles.headerBackText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Leads</Text>
        {data && (
          <Text style={styles.headerCount}>({data.total})</Text>
        )}
      </View>

      {isLoading && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      {isError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load leads.</Text>
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
            <View style={styles.emptyState}>
              <Icon name="chat" size={48} color={colors.textTertiary} />
              <Text style={styles.emptyTitle}>No leads yet</Text>
              <Text style={styles.emptyBody}>
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

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBack: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  headerBackText: {
    color: colors.primary,
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  headerCount: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.textSecondary,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    color: colors.textSecondary,
    marginBottom: 16,
    textAlign: 'center',
  },
  leadItem: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 16,
    marginBottom: 8,
  },
  propertyContext: {
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  propertyContextLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  propertyContextTitle: {
    fontSize: 12,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  senderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  senderBody: {
    flex: 1,
  },
  senderName: {
    fontSize: 14,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  messageBody: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  metaColumn: {
    marginLeft: 12,
    alignItems: 'flex-end',
  },
  dateText: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 4,
  },
  emptyBody: {
    color: colors.textSecondary,
    textAlign: 'center',
    fontSize: 14,
  },
});
