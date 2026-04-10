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

import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAgencies } from '@/hooks/useAgencies';
import { useSubscription, useSubscribe, useCancelSubscription } from '@/hooks/useSubscription';
import { useSubscriptionPlans } from '@/hooks/useSubscriptionPlans';
import { useCurrentUser } from '@/hooks/useUser';
import { PlanCard } from '@/components/subscription/PlanCard';
import { SubscriptionBadge } from '@/components/subscription/SubscriptionBadge';

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
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!ownedAgency) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 px-6">
        <Text className="text-5xl mb-4">🏢</Text>
        <Text className="text-lg font-bold text-gray-900 mb-2">No Agency</Text>
        <Text className="text-gray-500 text-center mb-6">
          Create an agency first to manage subscriptions.
        </Text>
        <TouchableOpacity
          className="bg-blue-600 rounded-xl px-6 py-3"
          onPress={() => router.push('/agency/create')}
          accessibilityRole="button"
        >
          <Text className="text-white font-semibold">Create Agency</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const hasActiveSubscription = subscription?.status === 'active';

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-4 pt-14 pb-3 bg-white border-b border-gray-100 flex-row items-center">
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          className="mr-3"
        >
          <Text className="text-blue-600 text-base">‹ Back</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900 flex-1">Subscription</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        {/* Current subscription card */}
        {subscription ? (
          <View className="bg-white rounded-2xl border border-gray-100 p-5 mb-6 shadow-sm">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-base font-bold text-gray-900">Current Plan</Text>
              <SubscriptionBadge status={subscription.status} />
            </View>

            {subscription.plan && (
              <>
                <Text className="text-lg font-semibold text-gray-900 mb-1">
                  {subscription.plan.name}
                </Text>
                <Text className="text-sm text-gray-500 mb-2">
                  ${subscription.plan.price}
                  {subscription.plan.billing_cycle === 'annual' ? '/year' : '/month'}
                </Text>
                <Text className="text-sm text-gray-600 mb-1">
                  Listings: {subscription.plan.listing_limit >= 9999 ? 'Unlimited' : subscription.plan.listing_limit}
                </Text>
              </>
            )}

            <Text className="text-xs text-gray-400 mb-1">
              Started: {new Date(subscription.starts_at).toLocaleDateString()}
            </Text>
            <Text className="text-xs text-gray-400 mb-4">
              Expires: {new Date(subscription.expires_at).toLocaleDateString()}
            </Text>

            {/* Benefits callout */}
            <View className="bg-green-50 rounded-xl px-3 py-2 mb-4">
              <Text className="text-xs text-green-700 font-medium">
                Active subscription bypasses per-listing quota limits.
              </Text>
            </View>

            {hasActiveSubscription && (
              <TouchableOpacity
                className={`border border-red-400 rounded-xl py-3 items-center ${
                  cancelSub.isPending ? 'opacity-50' : ''
                }`}
                onPress={handleCancel}
                disabled={cancelSub.isPending}
                accessibilityRole="button"
                accessibilityLabel="Cancel subscription"
              >
                {cancelSub.isPending ? (
                  <ActivityIndicator size="small" color="#ef4444" />
                ) : (
                  <Text className="text-red-600 font-semibold">Cancel Subscription</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 mb-6">
            <Text className="text-sm font-semibold text-yellow-800 mb-1">No Active Subscription</Text>
            <Text className="text-xs text-yellow-700">
              Subscribe to a plan to unlock unlimited listings and remove quota restrictions.
            </Text>
          </View>
        )}

        {/* Available plans */}
        {!hasActiveSubscription && (
          <>
            <Text className="text-base font-bold text-gray-900 mb-3">Available Plans</Text>
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

        <View className="h-8" />
      </ScrollView>
    </View>
  );
}
