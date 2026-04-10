import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { AuthGate } from '@/components/auth/AuthGate';
import { Button } from '@/components/ui/Button';
import { useListingQuota } from '@/hooks/useUser';

const FREE_TOTAL = 3;

interface QuotaBarProps {
  used: number;
  total: number;
  color: string;
}

function QuotaBar({ used, total, color }: QuotaBarProps) {
  const safeTotal = total > 0 ? total : 1;
  const filledRatio = Math.min(used / safeTotal, 1);
  return (
    <View className="h-3 bg-gray-200 rounded-full overflow-hidden">
      <View
        className={`h-full rounded-full ${color}`}
        style={{ width: `${filledRatio * 100}%` }}
      />
    </View>
  );
}

function QuotaContent() {
  const { data: quota, isLoading, isError } = useListingQuota();

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <Text className="text-gray-500">Loading quota...</Text>
      </View>
    );
  }

  if (isError || !quota) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center px-6">
        <Text className="text-red-500 text-center">Failed to load quota. Please try again.</Text>
      </View>
    );
  }

  const freeUsed = Math.max(0, FREE_TOTAL - quota.free_remaining);
  const totalSlots = quota.free_remaining + quota.paid_remaining;

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center px-4 pt-14 pb-4 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Text className="text-blue-600 text-base">‹ Back</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900 flex-1">Listing Quota</Text>
      </View>

      <View className="px-4 pt-6 gap-4">
        {/* Summary card */}
        <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <Text className="text-base font-semibold text-gray-900 mb-1">Total Available Slots</Text>
          <Text className="text-4xl font-bold text-blue-600 mb-1">{totalSlots}</Text>
          <Text className="text-sm text-gray-500">listings you can publish right now</Text>
        </View>

        {/* Free slots */}
        <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <View className="flex-row justify-between mb-3">
            <Text className="text-base font-semibold text-gray-900">Free Slots</Text>
            <Text className="text-base font-bold text-green-600">
              {quota.free_remaining} / {FREE_TOTAL} remaining
            </Text>
          </View>
          <QuotaBar used={freeUsed} total={FREE_TOTAL} color="bg-green-500" />
          <Text className="text-xs text-gray-400 mt-2">
            {freeUsed} of {FREE_TOTAL} free slots used
          </Text>
        </View>

        {/* Paid slots */}
        <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <View className="flex-row justify-between mb-3">
            <Text className="text-base font-semibold text-gray-900">Paid Slots</Text>
            <Text className="text-base font-bold text-blue-600">
              {quota.paid_remaining} remaining
            </Text>
          </View>
          {quota.paid_remaining > 0 ? (
            <QuotaBar used={0} total={quota.paid_remaining} color="bg-blue-500" />
          ) : (
            <View className="h-3 bg-gray-200 rounded-full" />
          )}
          <Text className="text-xs text-gray-400 mt-2">
            Purchased listing packs appear here
          </Text>
        </View>

        {/* CTA */}
        <Button
          onPress={() => router.push('/listings/packs')}
          variant="secondary"
          size="lg"
        >
          Buy Listing Pack
        </Button>

        <Text className="text-xs text-gray-400 text-center">
          Last updated: {new Date(quota.updated_at).toLocaleDateString()}
        </Text>

        <View className="h-4" />
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
