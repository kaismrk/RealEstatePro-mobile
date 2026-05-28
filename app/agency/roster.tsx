/**
 * Agent roster screen — lists agents linked to the owner's agency.
 *
 * BACKEND GAP: There is no GET /agencies/{id}/agents endpoint.
 * The Agent model has an `agency_id` field, but no dedicated roster endpoint exists.
 * This screen currently shows a "Coming Soon" state until the backend exposes
 * GET /agencies/{id}/agents or GET /agents/?agency_id={id}.
 *
 * When available, replace the placeholder content with the fetched roster.
 */

import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAgencies } from '@/hooks/useAgencies';
import { useCurrentUser } from '@/hooks/useUser';
import { Icon } from '@/components/ui/Icon';
import { colors, radius, fontWeight } from '@/constants/theme';

export default function AgentRosterScreen() {
  const { data: user } = useCurrentUser();
  const { data: agencyList, isLoading } = useAgencies();
  const ownedAgency = agencyList?.items.find((a) => user && a.owner_id === user.id) ?? null;

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={styles.headerBack}
        >
          <Icon name="chevron-left" size={18} color={colors.primary} />
          <Text style={styles.headerBackText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {ownedAgency ? `${ownedAgency.name} — Agents` : 'Agent Roster'}
        </Text>
      </View>

      {/* Placeholder — backend endpoint not yet available */}
      <View style={styles.placeholder}>
        <Icon name="user" size={48} color={colors.textTertiary} />
        <Text style={styles.placeholderTitle}>Agent Roster</Text>
        <Text style={styles.placeholderBody}>
          Agent listing for agencies is coming soon. The backend does not yet expose a
          GET /agencies/{'{id}'}/agents endpoint.
        </Text>
        <Text style={styles.placeholderNote}>
          Agents can link themselves to your agency by setting their agency_id in their agent profile.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
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
    flex: 1,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  placeholderBody: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 14,
  },
  placeholderNote: {
    fontSize: 12,
    color: colors.textTertiary,
    textAlign: 'center',
  },
});
