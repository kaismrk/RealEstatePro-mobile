/**
 * Subscription management screen.
 *
 * BACKEND GAP: No public endpoint for listing subscription plans.
 * Only /admin/subscription-plans/ exists (requires billing:manage permission).
 * useSubscriptionPlans() falls back to a hardcoded list when the admin endpoint
 * returns 403.
 *
 * BACKEND GAP: GET /agencies/ has no owner_id filter — we fetch all and
 * filter client-side by owner_id matching the current user.
 */

import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAgencies } from '@/hooks/useAgencies';
import { useSubscription, useSubscribe, useCancelSubscription } from '@/hooks/useSubscription';
import { useSubscriptionPlans } from '@/hooks/useSubscriptionPlans';
import { useCurrentUser } from '@/hooks/useUser';
import { PlanCard } from '@/components/subscription/PlanCard';
import { SubscriptionBadge } from '@/components/subscription/SubscriptionBadge';
import { Icon } from '@/components/ui/Icon';
import { colors, radius, fontWeight, shadows } from '@/constants/theme';

export default function SubscriptionScreen() {
  const { data: user } = useCurrentUser();
  const { data: agencyList, isLoading: agencyLoading } = useAgencies();
  const ownedAgency = agencyList?.items.find((a) => user && a.owner_id === user.id) ?? null;

  const { data: subscription, isLoading: subLoading } = useSubscription(ownedAgency?.id);
  const { data: plans = [], isLoading: plansLoading } = useSubscriptionPlans();

  const subscribe = useSubscribe();
  const cancelSub = useCancelSubscription();

  const isLoading = agencyLoading || subLoading || plansLoading;

  function handleSubscribe(planId: number) {
    if (!ownedAgency) return;

    subscribe.mutate(
      { agencyId: ownedAgency.id, planId },
      {
        onSuccess: () => {
          Alert.alert('Subscribed!', 'Your subscription is now active.');
        },
        onError: (err: unknown) => {
          const status = (err as { response?: { status?: number; data?: { detail?: string } } })
            ?.response?.status;
          const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data
            ?.detail;

          if (status === 409) {
            Alert.alert('Already Subscribed', 'You already have an active subscription.');
          } else {
            Alert.alert('Error', detail ?? 'Failed to subscribe. Please try again.');
          }
        },
      }
    );
  }

  function handleCancel() {
    if (!ownedAgency) return;

    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your subscription? You will lose access to premium features.',
      [
        { text: 'Keep Subscription', style: 'cancel' },
        {
          text: 'Cancel Subscription',
          style: 'destructive',
          onPress: () => {
            cancelSub.mutate(ownedAgency.id, {
              onSuccess: () => {
                Alert.alert('Cancelled', 'Your subscription has been cancelled.');
              },
              onError: (err: unknown) => {
                const msg =
                  (err as { response?: { data?: { detail?: string } } })?.response?.data
                    ?.detail ?? 'Failed to cancel subscription.';
                Alert.alert('Error', msg);
              },
            });
          },
        },
      ]
    );
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!ownedAgency) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="home" size={48} color={colors.textTertiary} />
        <Text style={styles.emptyTitle}>No Agency</Text>
        <Text style={styles.emptyBody}>
          Create an agency first to manage subscriptions.
        </Text>
        <TouchableOpacity
          style={styles.emptyBtn}
          onPress={() => router.push('/agency/create')}
          accessibilityRole="button"
        >
          <Text style={styles.emptyBtnText}>Create Agency</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const hasActiveSubscription = subscription?.status === 'active';

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
        <Text style={styles.headerTitle}>Subscription</Text>
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Current subscription card */}
        {subscription ? (
          <View style={styles.currentPlanCard}>
            <View style={styles.currentPlanRow}>
              <Text style={styles.currentPlanHeading}>Current Plan</Text>
              <SubscriptionBadge status={subscription.status} />
            </View>

            {subscription.plan && (
              <>
                <Text style={styles.planName}>{subscription.plan.name}</Text>
                <Text style={styles.planPrice}>
                  ${subscription.plan.price}
                  {subscription.plan.billing_cycle === 'annual' ? '/year' : '/month'}
                </Text>
                <Text style={styles.planLimit}>
                  Listings:{' '}
                  {subscription.plan.listing_limit >= 9999
                    ? 'Unlimited'
                    : subscription.plan.listing_limit}
                </Text>
              </>
            )}

            <Text style={styles.planDate}>
              Started: {new Date(subscription.starts_at).toLocaleDateString()}
            </Text>
            <Text style={[styles.planDate, styles.planDateBottom]}>
              Expires: {new Date(subscription.expires_at).toLocaleDateString()}
            </Text>

            {/* Benefits callout */}
            <View style={styles.benefitsBanner}>
              <Text style={styles.benefitsBannerText}>
                Active subscription bypasses per-listing quota limits.
              </Text>
            </View>

            {hasActiveSubscription && (
              <TouchableOpacity
                style={[styles.cancelBtn, cancelSub.isPending && styles.cancelBtnPending]}
                onPress={handleCancel}
                disabled={cancelSub.isPending}
                accessibilityRole="button"
                accessibilityLabel="Cancel subscription"
              >
                {cancelSub.isPending ? (
                  <ActivityIndicator size="small" color={colors.error} />
                ) : (
                  <Text style={styles.cancelBtnText}>Cancel Subscription</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.noSubBanner}>
            <Text style={styles.noSubTitle}>No Active Subscription</Text>
            <Text style={styles.noSubBody}>
              Subscribe to a plan to unlock unlimited listings and remove quota restrictions.
            </Text>
          </View>
        )}

        {/* Available plans */}
        {!hasActiveSubscription && (
          <>
            <Text style={styles.plansHeading}>Available Plans</Text>
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onSubscribe={handleSubscribe}
                isSubscribing={subscribe.isPending}
                isCurrentPlan={subscription?.plan_id === plan.id}
              />
            ))}
          </>
        )}

        <View style={styles.scrollPadBottom} />
      </ScrollView>
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyBody: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    fontSize: 14,
  },
  emptyBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  emptyBtnText: {
    color: colors.textOnBrand,
    fontWeight: fontWeight.semibold,
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
  scrollContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  currentPlanCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    marginBottom: 24,
    ...shadows.sm,
  },
  currentPlanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  currentPlanHeading: {
    fontSize: 16,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  planName: {
    fontSize: 18,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  planLimit: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  planDate: {
    fontSize: 12,
    color: colors.textTertiary,
    marginBottom: 4,
  },
  planDateBottom: {
    marginBottom: 16,
  },
  benefitsBanner: {
    backgroundColor: colors.successBg,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  benefitsBannerText: {
    fontSize: 12,
    color: colors.success,
    fontWeight: fontWeight.medium,
  },
  cancelBtn: {
    borderWidth: 1,
    borderColor: '#f87171',
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelBtnPending: {
    opacity: 0.5,
  },
  cancelBtnText: {
    color: colors.error,
    fontWeight: fontWeight.semibold,
  },
  noSubBanner: {
    backgroundColor: colors.warningBg,
    borderWidth: 1,
    borderColor: '#fde68a',
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
  },
  noSubTitle: {
    fontSize: 14,
    fontWeight: fontWeight.semibold,
    color: '#92400e',
    marginBottom: 4,
  },
  noSubBody: {
    fontSize: 12,
    color: '#b45309',
  },
  plansHeading: {
    fontSize: 16,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  scrollPadBottom: {
    height: 32,
  },
});
