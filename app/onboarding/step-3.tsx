import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { useUIStore } from '@/lib/stores/ui.store';
import { useAuthStore } from '@/lib/stores/auth.store';
import { haptic } from '@/lib/utils/haptics';

interface PresetRange {
  label: string;
  min?: number;
  max?: number;
}

const PRESET_RANGES: PresetRange[] = [
  { label: 'Under 500K', min: undefined, max: 500_000 },
  { label: '500K – 1M', min: 500_000, max: 1_000_000 },
  { label: '1M+', min: 1_000_000, max: undefined },
];

function formatCurrency(value: string, currency: string) {
  const num = parseInt(value.replace(/\D/g, ''), 10);
  if (isNaN(num)) return '';
  return `${currency} ${num.toLocaleString()}`;
}

export default function OnboardingStep3() {
  const countryCode = useAuthStore((s) => s.countryCode);
  const onboardingDraft = useUIStore((s) => s.onboardingDraft);
  const setOnboardingDraft = useUIStore((s) => s.setOnboardingDraft);

  const [minPrice, setMinPrice] = useState(
    onboardingDraft.min_price != null ? String(onboardingDraft.min_price) : ''
  );
  const [maxPrice, setMaxPrice] = useState(
    onboardingDraft.max_price != null ? String(onboardingDraft.max_price) : ''
  );
  const [activePreset, setActivePreset] = useState<number | null>(null);

  // Simple country → currency mapping
  const currency = countryCode === 'MA' ? 'MAD' : countryCode === 'FR' ? 'EUR' : 'TND';

  function handlePreset(index: number) {
    void haptic.light();
    const preset = PRESET_RANGES[index]!;
    setActivePreset(index);
    setMinPrice(preset.min != null ? String(preset.min) : '');
    setMaxPrice(preset.max != null ? String(preset.max) : '');
  }

  function handleNext() {
    const min = minPrice ? parseInt(minPrice.replace(/\D/g, ''), 10) : undefined;
    const max = maxPrice ? parseInt(maxPrice.replace(/\D/g, ''), 10) : undefined;
    setOnboardingDraft({ min_price: min, max_price: max });
    router.push('/onboarding/step-4');
  }

  function handleSkip() {
    router.push('/onboarding/step-4');
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="px-6 pt-6 flex-1">
            <Text className="text-2xl font-bold text-gray-900 mb-2">
              What is your budget?
            </Text>
            <Text className="text-base text-gray-500 mb-6">
              Set a price range to find matching properties.
            </Text>

            {/* Preset ranges */}
            <View className="flex-row gap-x-2 mb-6">
              {PRESET_RANGES.map((preset, index) => (
                <TouchableOpacity
                  key={preset.label}
                  onPress={() => handlePreset(index)}
                  className={`flex-1 py-2.5 rounded-xl border items-center ${
                    activePreset === index
                      ? 'bg-blue-600 border-blue-600'
                      : 'bg-gray-100 border-gray-200'
                  }`}
                  accessibilityRole="button"
                  accessibilityLabel={preset.label}
                  accessibilityState={{ selected: activePreset === index }}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      activePreset === index ? 'text-white' : 'text-gray-700'
                    }`}
                  >
                    {preset.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Min / Max price inputs */}
            <View className="gap-y-4">
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-1.5">
                  Minimum price ({currency})
                </Text>
                <TextInput
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-base text-gray-900"
                  placeholder={`e.g. 100,000`}
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  value={minPrice}
                  onChangeText={(t) => {
                    setMinPrice(t.replace(/\D/g, ''));
                    setActivePreset(null);
                  }}
                  returnKeyType="next"
                  accessibilityLabel="Minimum price"
                />
                {minPrice ? (
                  <Text className="text-xs text-gray-400 mt-1">
                    {formatCurrency(minPrice, currency)}
                  </Text>
                ) : null}
              </View>

              <View>
                <Text className="text-sm font-medium text-gray-700 mb-1.5">
                  Maximum price ({currency})
                </Text>
                <TextInput
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-base text-gray-900"
                  placeholder={`e.g. 500,000`}
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  value={maxPrice}
                  onChangeText={(t) => {
                    setMaxPrice(t.replace(/\D/g, ''));
                    setActivePreset(null);
                  }}
                  returnKeyType="done"
                  accessibilityLabel="Maximum price"
                />
                {maxPrice ? (
                  <Text className="text-xs text-gray-400 mt-1">
                    {formatCurrency(maxPrice, currency)}
                  </Text>
                ) : null}
              </View>
            </View>
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
