import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { colors, radius, fontWeight } from '@/constants/theme';
import type { SubscriptionPlanResponse } from '@/hooks/useSubscription';

interface PlanCardProps {
  plan: SubscriptionPlanResponse;
  onSubscribe?: (planId: number) => void;
  isSubscribing?: boolean;
  isCurrentPlan?: boolean;
}

export function PlanCard({
  plan,
  onSubscribe,
  isSubscribing = false,
  isCurrentPlan = false,
}: PlanCardProps) {
  const cycleLabel = plan.billing_cycle === 'annual' ? '/year' : '/month';
  const listingLabel =
    plan.listing_limit >= 9999 ? 'Unlimited listings' : `Up to ${plan.listing_limit} listings`;

  const features = [
    listingLabel,
    'Priority support',
    plan.billing_cycle === 'annual' ? '2 months free (annual billing)' : 'Cancel anytime',
  ];

  return (
    <View style={[styles.card, isCurrentPlan && styles.cardCurrent]}>
      <View style={styles.headerRow}>
        <Text style={styles.name}>{plan.name}</Text>
        {isCurrentPlan && (
          <View style={styles.currentBadge}>
            <Text style={styles.currentBadgeText}>Current</Text>
          </View>
        )}
      </View>

      <View style={styles.priceRow}>
        <Text style={styles.price}>${plan.price}</Text>
        <Text style={styles.cycle}>{cycleLabel}</Text>
      </View>

      <View style={styles.featuresWrap}>
        {features.map((f, i) => (
          <View key={i} style={styles.featureRow}>
            <Icon name="check" size={16} color={colors.success} />
            <Text style={styles.featureText}>{f}</Text>
          </View>
        ))}
      </View>

      {onSubscribe && !isCurrentPlan ? (
        <TouchableOpacity
          style={[styles.subscribeBtn, isSubscribing && styles.subscribeBtnPending]}
          onPress={() => onSubscribe(plan.id)}
          disabled={isSubscribing}
          accessibilityRole="button"
          accessibilityLabel={`Subscribe to ${plan.name}`}
        >
          {isSubscribing ? (
            <ActivityIndicator size="small" color={colors.textOnBrand} />
          ) : (
            <Text style={styles.subscribeBtnText}>Subscribe</Text>
          )}
        </TouchableOpacity>
      ) : isCurrentPlan ? (
        <View style={styles.currentPlanBtn}>
          <Text style={styles.currentPlanBtnText}>Your current plan</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl2,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 20,
    marginBottom: 16,
  },
  cardCurrent: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  name: { fontSize: 18, fontWeight: fontWeight.bold, color: colors.textPrimary },
  currentBadge: { backgroundColor: colors.primary, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 3 },
  currentBadgeText: { color: colors.textOnBrand, fontSize: 11, fontWeight: fontWeight.semibold },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 12 },
  price: { fontSize: 30, fontWeight: fontWeight.bold, color: colors.textPrimary },
  cycle: { fontSize: 14, color: colors.textSecondary, marginLeft: 4 },
  featuresWrap: { marginBottom: 16, gap: 8 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  featureText: { fontSize: 14, color: colors.textPrimary },
  subscribeBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 13,
    alignItems: 'center',
  },
  subscribeBtnPending: { opacity: 0.6 },
  subscribeBtnText: { color: colors.textOnBrand, fontWeight: fontWeight.semibold, fontSize: 15 },
  currentPlanBtn: {
    borderRadius: radius.md,
    paddingVertical: 13,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.borderBrand,
  },
  currentPlanBtnText: { color: colors.primary, fontWeight: fontWeight.semibold, fontSize: 15 },
});
