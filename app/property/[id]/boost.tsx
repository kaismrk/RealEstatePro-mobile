import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useProperty } from '@/hooks/useProperty';
import { useBoost, type PlacementType } from '@/hooks/useBoost';
import { useAuthStore } from '@/lib/stores/auth.store';
import { Button } from '@/components/ui/Button';

const PLACEMENT_OPTIONS: { value: PlacementType; label: string; description: string; pricePerDay: number }[] = [
  {
    value: 'top_of_search',
    label: 'Top of Search',
    description: 'Your listing appears at the top of all search results.',
    pricePerDay: 5,
  },
  {
    value: 'homepage_featured',
    label: 'Homepage Featured',
    description: 'Featured prominently on the homepage for all visitors.',
    pricePerDay: 10,
  },
  {
    value: 'category_featured',
    label: 'Category Featured',
    description: 'Featured at the top of your property category.',
    pricePerDay: 7,
  },
];

const DURATION_OPTIONS = [7, 14, 30];

export default function BoostScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const propertyId = Number(id);
  const { data: property } = useProperty(id);
  const currentUser = useAuthStore((s) => s.user);
  const boost = useBoost();

  const [selectedPlacement, setSelectedPlacement] = useState<PlacementType | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number>(7);

  // Only owner can boost
  if (property && currentUser && property.owner_id !== currentUser.id) {
    return (
      <View className="flex-1 bg-white items-center justify-center px-6">
        <Text className="text-lg font-semibold text-gray-900 mb-2">Access denied</Text>
        <Text className="text-gray-500 text-center mb-4">
          Only the property owner can boost this listing.
        </Text>
        <Button onPress={() => router.back()} variant="secondary">
          Go Back
        </Button>
      </View>
    );
  }

  const pricePerDay =
    PLACEMENT_OPTIONS.find((p) => p.value === selectedPlacement)?.pricePerDay ?? 0;
  const totalCost = pricePerDay * selectedDuration;

  function handleBoost() {
    if (!selectedPlacement) {
      Alert.alert('Select placement', 'Please choose a placement type to boost your listing.');
      return;
    }

    boost.mutate(
      {
        propertyId,
        payload: {
          placement_type: selectedPlacement,
          duration_days: selectedDuration,
          amount_paid: totalCost,
        },
      },
      {
        onSuccess: () => {
          Alert.alert('Boost activated!', `Your listing is now boosted for ${selectedDuration} days.`, [
            { text: 'OK', onPress: () => router.back() },
          ]);
        },
        onError: (err) => {
          Alert.alert('Error', err.message ?? 'Failed to create boost. Please try again.');
        },
      }
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="px-4 pt-14 pb-4 border-b border-gray-100 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Text className="text-primary-500 text-base">Back</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Boost Listing</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        {property && (
          <View className="bg-gray-50 rounded-xl p-3 mb-5">
            <Text className="text-sm text-gray-500">Listing</Text>
            <Text className="text-base font-semibold text-gray-900 mt-0.5" numberOfLines={1}>
              {property.title}
            </Text>
          </View>
        )}

        {/* Placement type */}
        <Text className="text-base font-bold text-gray-900 mb-3">
          Placement Type <Text className="text-red-500">*</Text>
        </Text>
        {PLACEMENT_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            onPress={() => setSelectedPlacement(opt.value)}
            className={`flex-row items-start p-4 rounded-xl border mb-3 ${
              selectedPlacement === opt.value
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 bg-white'
            }`}
            accessibilityRole="radio"
            accessibilityState={{ checked: selectedPlacement === opt.value }}
            accessibilityLabel={opt.label}
          >
            <View
              className={`w-5 h-5 rounded-full border-2 mr-3 mt-0.5 items-center justify-center flex-shrink-0 ${
                selectedPlacement === opt.value ? 'border-primary-500' : 'border-gray-400'
              }`}
            >
              {selectedPlacement === opt.value && (
                <View className="w-2.5 h-2.5 rounded-full bg-primary-500" />
              )}
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-gray-900">{opt.label}</Text>
              <Text className="text-xs text-gray-500 mt-0.5">{opt.description}</Text>
              <Text className="text-xs text-primary-500 mt-1">{opt.pricePerDay} TND/day</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Duration */}
        <Text className="text-base font-bold text-gray-900 mb-3 mt-2">Duration</Text>
        <View className="flex-row gap-3 mb-5">
          {DURATION_OPTIONS.map((days) => (
            <TouchableOpacity
              key={days}
              onPress={() => setSelectedDuration(days)}
              className={`flex-1 py-3 rounded-xl border items-center ${
                selectedDuration === days
                  ? 'bg-primary-500 border-primary-500'
                  : 'bg-white border-gray-300'
              }`}
              accessibilityRole="radio"
              accessibilityState={{ checked: selectedDuration === days }}
            >
              <Text
                className={`text-sm font-semibold ${
                  selectedDuration === days ? 'text-white' : 'text-gray-700'
                }`}
              >
                {days} days
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Cost summary */}
        {selectedPlacement && (
          <View className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-5">
            <Text className="text-sm text-gray-500">Estimated Cost</Text>
            <Text className="text-2xl font-bold text-gray-900 mt-1">
              {totalCost.toFixed(2)} TND
            </Text>
            <Text className="text-xs text-gray-500 mt-0.5">
              {pricePerDay} TND/day × {selectedDuration} days
            </Text>
          </View>
        )}

        <View className="h-32" />
      </ScrollView>

      {/* Footer */}
      <View className="px-4 pb-8 pt-3 border-t border-gray-100 bg-white">
        <Button
          onPress={handleBoost}
          loading={boost.isPending}
          size="lg"
        >
          Boost Now
        </Button>
      </View>
    </View>
  );
}
