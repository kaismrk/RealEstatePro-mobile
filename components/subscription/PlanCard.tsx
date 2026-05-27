import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
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
    <View
      className={`rounded-2xl border p-5 mb-4 ${
        isCurrentPlan
          ? 'border-primary-500 bg-primary-50'
          : 'border-gray-200 bg-white'
      }`}
    >
      {/* Plan name + current indicator */}
      <View className="flex-row items-center justify-between mb-1">
        <Text className="text-lg font-bold text-gray-900">{plan.name}</Text>
        {isCurrentPlan && (
          <View className="bg-primary-500 rounded-full px-2 py-0.5">
            <Text className="text-white text-xs font-semibold">Current</Text>
          </View>
        )}
      </View>

      {/* Price */}
      <View className="flex-row items-baseline mb-3">
        <Text className="text-3xl font-extrabold text-gray-900">${plan.price}</Text>
        <Text className="text-sm text-gray-500 ml-1">{cycleLabel}</Text>
      </View>

      {/* Features */}
      <View className="mb-4">
        {features.map((f, i) => (
          <View key={i} className="flex-row items-center mb-1">
            <Text className="text-green-500 mr-2">✓</Text>
            <Text className="text-sm text-gray-700">{f}</Text>
          </View>
        ))}
      </View>

      {/* Subscribe button */}
      {onSubscribe && !isCurrentPlan ? (
        <TouchableOpacity
          className={`rounded-xl py-3 items-center ${
            isSubscribing ? 'bg-primary-300' : 'bg-primary-500'
          }`}
          onPress={() => onSubscribe(plan.id)}
          disabled={isSubscribing}
          accessibilityRole="button"
          accessibilityLabel={`Subscribe to ${plan.name}`}
        >
          {isSubscribing ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text className="text-white font-semibold">Subscribe</Text>
          )}
        </TouchableOpacity>
      ) : isCurrentPlan ? (
        <View className="rounded-xl py-3 items-center border border-primary-400">
          <Text className="text-primary-500 font-semibold">Your current plan</Text>
        </View>
      ) : null}
    </View>
  );
}
