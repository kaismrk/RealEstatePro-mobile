import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import { AuthGate } from '@/components/auth/AuthGate';
import { Button } from '@/components/ui/Button';
import { useListingQuota } from '@/hooks/useUser';
import { colors, fontWeight, radius, shadows } from '@/constants/theme';

const FREE_TOTAL = 3;

interface QuotaBarProps {
  used: number;
  total: number;
  fillColor: string;
}

function QuotaBar({ used, total, fillColor }: QuotaBarProps) {
  const safeTotal = total > 0 ? total : 1;
  const filledRatio = Math.min(used / safeTotal, 1);
  return (
    <View style={styles.barTrack}>
      <View
        style={[styles.barFill, { width: `${filledRatio * 100}%` as `${number}%`, backgroundColor: fillColor }]}
      />
    </View>
  );
}

function QuotaContent() {
  const { data: quota, isLoading, isError } = useListingQuota();

  if (isLoading) {
    return (
      <View style={styles.stateContainer}>
        <Text style={styles.loadingText}>Loading quota...</Text>
      </View>
    );
  }

  if (isError || !quota) {
    return (
      <View style={styles.stateContainerPadded}>
        <Text style={styles.errorText}>Failed to load quota. Please try again.</Text>
      </View>
    );
  }

  const freeUsed = Math.max(0, FREE_TOTAL - quota.free_remaining);
  const totalSlots = quota.free_remaining + quota.paid_remaining;

  return (
    <ScrollView style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name="chevron-left" size={20} color={colors.primary} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Listing Quota</Text>
      </View>

      <View style={styles.content}>
        {/* Summary card */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>Total Available Slots</Text>
          <Text style={styles.totalSlotsNumber}>{totalSlots}</Text>
          <Text style={styles.cardSubtext}>listings you can publish right now</Text>
        </View>

        {/* Free slots */}
        <View style={styles.card}>
          <View style={styles.cardRowBetween}>
            <Text style={styles.cardHeading}>Free Slots</Text>
            <Text style={styles.freeRemaining}>
              {quota.free_remaining} / {FREE_TOTAL} remaining
            </Text>
          </View>
          <QuotaBar used={freeUsed} total={FREE_TOTAL} fillColor={colors.success} />
          <Text style={styles.cardNote}>
            {freeUsed} of {FREE_TOTAL} free slots used
          </Text>
        </View>

        {/* Paid slots */}
        <View style={styles.card}>
          <View style={styles.cardRowBetween}>
            <Text style={styles.cardHeading}>Paid Slots</Text>
            <Text style={styles.paidRemaining}>
              {quota.paid_remaining} remaining
            </Text>
          </View>
          {quota.paid_remaining > 0 ? (
            <QuotaBar used={0} total={quota.paid_remaining} fillColor={colors.primary} />
          ) : (
            <View style={styles.emptyBar} />
          )}
          <Text style={styles.cardNote}>Purchased listing packs appear here</Text>
        </View>

        {/* CTA */}
        <Button
          onPress={() => router.push('/listings/packs')}
          variant="secondary"
          size="lg"
        >
          Buy Listing Pack
        </Button>

        <Text style={styles.updatedAt}>
          Last updated: {new Date(quota.updated_at).toLocaleDateString()}
        </Text>

        <View style={styles.bottomSpacer} />
      </View>
    </ScrollView>
  );
}

export default function QuotaScreen() {
  return (
    <AuthGate>
      <QuotaContent />
    </AuthGate>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  stateContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateContainerPadded: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    color: colors.textSecondary,
  },
  errorText: {
    color: colors.error,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  backText: {
    color: colors.primary,
    fontSize: 16,
    marginLeft: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 24,
    gap: 16,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl2,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  cardHeading: {
    fontSize: 16,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  totalSlotsNumber: {
    fontSize: 40,
    fontWeight: fontWeight.bold,
    color: colors.primary,
    marginBottom: 4,
  },
  cardSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  cardRowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  freeRemaining: {
    fontSize: 16,
    fontWeight: fontWeight.bold,
    color: colors.success,
  },
  paidRemaining: {
    fontSize: 16,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  barTrack: {
    height: 12,
    backgroundColor: colors.border,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: radius.pill,
  },
  emptyBar: {
    height: 12,
    backgroundColor: colors.border,
    borderRadius: radius.pill,
  },
  cardNote: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 8,
  },
  updatedAt: {
    fontSize: 12,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  bottomSpacer: {
    height: 16,
  },
});
