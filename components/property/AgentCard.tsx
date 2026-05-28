import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAgent } from '@/hooks/useAgent';
import { useAgency } from '@/hooks/useAgency';
import { colors, radius, fontWeight, shadows } from '@/constants/theme';

interface AgentCardProps {
  agentId: number;
  agencyId?: number | null;
  propertyId: number | string;
}

export function AgentCard({ agentId, agencyId, propertyId }: AgentCardProps) {
  const { data: agent, isLoading: agentLoading } = useAgent(agentId);
  const { data: agency } = useAgency(agencyId);

  if (agentLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.skeletonLine} />
        <View style={styles.skeletonLineShort} />
      </View>
    );
  }

  if (!agent) return null;

  function handleContact() {
    router.push(`/property/${propertyId}/contact`);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Listed by</Text>

      <View style={styles.agentRow}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>
            {String(agentId).charAt(0)}
          </Text>
        </View>

        <View style={styles.agentInfo}>
          <Text style={styles.agentName}>Agent #{agentId}</Text>
          {agent.phone && (
            <Text style={styles.agentPhone}>{agent.phone}</Text>
          )}
        </View>
      </View>

      {agency && (
        <View style={styles.agencyRow}>
          {agency.logo_url ? (
            <Image
              source={{ uri: agency.logo_url }}
              style={styles.agencyLogo}
              resizeMode="contain"
              accessibilityLabel={`${agency.name} logo`}
            />
          ) : (
            <View style={styles.agencyLogoPlaceholder}>
              <Text style={styles.agencyLogoPlaceholderText}>A</Text>
            </View>
          )}
          <Text style={styles.agencyName}>{agency.name}</Text>
        </View>
      )}

      {agent.bio && (
        <Text style={styles.bio} numberOfLines={3}>
          {agent.bio}
        </Text>
      )}

      <TouchableOpacity
        style={styles.contactButton}
        onPress={handleContact}
        accessibilityRole="button"
        accessibilityLabel="Contact agent"
      >
        <Text style={styles.contactButtonText}>Contact Agent</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    backgroundColor: colors.surfaceSunken,
    borderRadius: radius.xl2,
    padding: 16,
  },
  skeletonLine: {
    height: 16,
    width: 128,
    backgroundColor: colors.border,
    borderRadius: radius.xs,
    marginBottom: 8,
  },
  skeletonLineShort: {
    height: 16,
    width: 96,
    backgroundColor: colors.border,
    borderRadius: radius.xs,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  agentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: colors.primary,
    fontWeight: fontWeight.bold,
    fontSize: 18,
  },
  agentInfo: {
    flex: 1,
  },
  agentName: {
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  agentPhone: {
    fontSize: 14,
    color: colors.textTertiary,
  },
  agencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  agencyLogo: {
    width: 32,
    height: 32,
    borderRadius: radius.xs,
    marginRight: 8,
  },
  agencyLogoPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: radius.xs,
    backgroundColor: colors.border,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  agencyLogoPlaceholderText: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  agencyName: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  bio: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  contactButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  contactButtonText: {
    color: colors.textOnBrand,
    fontWeight: fontWeight.semibold,
  },
});
