/**
 * Public agency profile screen.
 *
 * BACKEND GAP: GET /properties/ does not currently support an `agency_id` filter.
 * Agency listings section is omitted until the backend exposes that filter param.
 *
 * BACKEND GAP: No endpoint to list agents of an agency. The AgentProfile model
 * has an `agency_id` field, but there is no GET /agencies/{id}/agents endpoint.
 * Agent roster is shown via the dedicated /agency/roster route (owner only).
 */

import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useAgency } from '@/hooks/useAgencies';
import { AgencyHeader } from '@/components/agency/AgencyHeader';
import { Icon } from '@/components/ui/Icon';
import { colors, radius, fontWeight, shadows } from '@/constants/theme';

export default function AgencyProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const agencyId = id ? parseInt(id, 10) : null;
  const { data: agency, isLoading, isError } = useAgency(agencyId);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isError || !agency) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="home" size={48} color={colors.textTertiary} />
        <Text style={styles.errorTitle}>Agency not found</Text>
        <Text style={styles.errorBody}>
          This agency may no longer be available.
        </Text>
        <TouchableOpacity
          style={styles.errorBtn}
          onPress={() => router.back()}
          accessibilityRole="button"
        >
          <Text style={styles.errorBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* Back button */}
      <View style={styles.backBtnContainer}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Icon name="chevron-left" size={20} color={colors.textOnBrand} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Agency header: logo, name, description, social links */}
        <AgencyHeader agency={agency} />

        {/* Divider */}
        <View style={styles.divider} />

        {/* Info section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>About</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Country</Text>
            <Text style={styles.infoValue}>{agency.country_code}</Text>
          </View>
          {agency.social_links?.website ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Website</Text>
              <Text style={styles.infoLink}>{agency.social_links.website}</Text>
            </View>
          ) : null}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Member since</Text>
            <Text style={styles.infoValue}>
              {new Date(agency.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
              })}
            </Text>
          </View>
        </View>

        <View style={styles.scrollPadBottom} />
      </ScrollView>

      {/* Sticky Contact CTA */}
      <View style={styles.ctaBar}>
        <TouchableOpacity
          style={styles.ctaBtn}
          accessibilityRole="button"
          accessibilityLabel="Contact agency"
          onPress={() => {
            // Navigate to first property contact or show info modal
            // Requires property association — left as placeholder
          }}
        >
          <Text style={styles.ctaBtnText}>Contact Agency</Text>
        </TouchableOpacity>
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
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 24,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  errorBody: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    fontSize: 14,
  },
  errorBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  errorBtnText: {
    color: colors.textOnBrand,
    fontWeight: fontWeight.semibold,
  },
  backBtnContainer: {
    position: 'absolute',
    top: 48,
    left: 16,
    zIndex: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(0,0,0,0.30)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 8,
    backgroundColor: colors.surfaceSunken,
  },
  infoSection: {
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    width: 112,
  },
  infoValue: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: fontWeight.medium,
  },
  infoLink: {
    color: colors.primary,
    fontSize: 14,
  },
  scrollPadBottom: {
    height: 32,
  },
  ctaBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  ctaBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  ctaBtnText: {
    color: colors.textOnBrand,
    fontWeight: fontWeight.semibold,
  },
});
