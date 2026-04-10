import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { useUIStore } from '@/lib/stores/ui.store';
import { haptic } from '@/lib/utils/haptics';

interface BedroomOption {
  label: string;
  value: number | null; // null = Studio
}

const BEDROOM_OPTIONS: BedroomOption[] = [
  { label: 'Studio', value: 0 },
  { label: '1', value: 1 },
  { label: '2', value: 2 },
  { label: '3', value: 3 },
  { label: '4', value: 4 },
  { label: '5+', value: 5 },
];

export default function OnboardingStep4() {
  const onboardingDraft = useUIStore((s) => s.onboardingDraft);
  const setOnboardingDraft = useUIStore((s) => s.setOnboardingDraft);

  const [minBeds, setMinBeds] = useState<number | null>(
    onboardingDraft.min_bedrooms != null ? onboardingDraft.min_bedrooms : null
  );
  const [maxBeds, setMaxBeds] = useState<number | null>(
    onboardingDraft.max_bedrooms != null ? onboardingDraft.max_bedrooms : null
  );

  function handleMinSelect(value: number | null) {
    void haptic.light();
    setMinBeds(value);
    // Reset max if less than min
    if (maxBeds != null && value != null && maxBeds < value) {
      setMaxBeds(null);
    }
  }

  function handleMaxSelect(value: number | null) {
    void haptic.light();
    setMaxBeds(value);
  }

  function handleNext() {
    setOnboardingDraft({
      min_bedrooms: minBeds != null ? minBeds : undefined,
      max_bedrooms: maxBeds != null ? maxBeds : undefined,
    });
    router.push('/onboarding/step-5');
  }

  function handleSkip() {
    router.push('/onboarding/step-5');
  }

  function BedroomGrid({
    label,
    selected,
    onSelect,
    minValue,
  }: {
    label: string;
    selected: number | null;
    onSelect: (v: number | null) => void;
    minValue?: number | null;
  }) {
    return (
      <View className="mb-6">
        <Text className="text-sm font-semibold text-gray-700 mb-3">{label}</Text>
        <View className="flex-row flex-wrap gap-2">
          {BEDROOM_OPTIONS.map((opt) => {
            const isDisabled =
              minValue != null && opt.value != null && opt.value < minValue;
            const isSelected = selected === opt.value;
            return (
              <TouchableOpacity
                key={opt.label}
                onPress={() => !isDisabled && onSelect(isSelected ? null : opt.value)}
                className={`px-5 py-3 rounded-xl border ${
                  isSelected
                    ? 'bg-blue-600 border-blue-600'
                    : isDisabled
                    ? 'bg-gray-100 border-gray-100 opacity-40'
                    : 'bg-gray-50 border-gray-200'
                }`}
                disabled={isDisabled}
                accessibilityRole="button"
                accessibilityLabel={`${opt.label} bedroom${opt.value !== 1 ? 's' : ''}`}
                accessibilityState={{ selected: isSelected, disabled: isDisabled }}
              >
                <Text
                  className={`text-base font-semibold ${
                    isSelected ? 'text-white' : 'text-gray-800'
                  }`}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="px-6 pt-6 flex-1">
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            How many bedrooms?
          </Text>
          <Text className="text-base text-gray-500 mb-7">
            Select a minimum and maximum bedroom count.
          </Text>

          <BedroomGrid
            label="Minimum bedrooms"
            selected={minBeds}
            onSelect={handleMinSelect}
          />

          <BedroomGrid
            label="Maximum bedrooms"
            selected={maxBeds}
            onSelect={handleMaxSelect}
            minValue={minBeds}
          />
        </View>
      </ScrollView>

      {/* Footer: Back / Skip / Next */}
      <View className="px-6 py-4 border-t border-gray-100 flex-row gap-x-3">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-12 py-3.5 bg-gray-100 rounded-xl items-center"
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Text className="text-base font-semibold text-gray-700">{'\u2190'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleSkip}
          className="flex-1 py-3.5 border border-gray-300 rounded-xl items-center"
          accessibilityRole="button"
          accessibilityLabel="Skip this step"
        >
          <Text className="text-base font-semibold text-gray-600">Skip</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleNext}
          className="flex-1 py-3.5 bg-blue-600 rounded-xl items-center"
          accessibilityRole="button"
          accessibilityLabel="Next step"
        >
          <Text className="text-base font-semibold text-white">Next</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
