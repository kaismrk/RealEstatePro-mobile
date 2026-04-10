import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { useUIStore, type OnboardingDraft } from '@/lib/stores/ui.store';
import { haptic } from '@/lib/utils/haptics';

type Intent = NonNullable<OnboardingDraft['intent']>;

interface IntentOption {
  id: Intent;
  icon: string;
  label: string;
  description: string;
}

const OPTIONS: IntentOption[] = [
  { id: 'buy', icon: '\uD83C\uDFE0', label: 'Buy', description: 'Find your dream home' },
  { id: 'rent', icon: '\uD83D\uDD11', label: 'Rent', description: 'Find a rental property' },
  { id: 'sell', icon: '\uD83D\uDCB0', label: 'Sell', description: 'List your property' },
  { id: 'browse', icon: '\uD83D\uDC40', label: 'Just browse', description: "I'm exploring options" },
];

export default function OnboardingStep1() {
  const setOnboardingDraft = useUIStore((s) => s.setOnboardingDraft);

  function handleSelect(intent: Intent) {
    void haptic.light();
    setOnboardingDraft({ intent });
    router.push('/onboarding/step-2');
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 pt-8 pb-8">
        <Text className="text-2xl font-bold text-gray-900 mb-2">
          Where would you like to start?
        </Text>
        <Text className="text-base text-gray-500 mb-8">
          Tell us what you are looking for so we can personalise your experience.
        </Text>

        <View className="gap-y-3">
          {OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.id}
              onPress={() => handleSelect(option.id)}
              className="flex-row items-center p-5 bg-gray-50 border border-gray-200 rounded-2xl active:bg-blue-50 active:border-blue-300"
              accessibilityRole="button"
              accessibilityLabel={option.label}
            >
              <Text className="text-3xl mr-4">{option.icon}</Text>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-900">
                  {option.label}
                </Text>
                <Text className="text-sm text-gray-500 mt-0.5">
                  {option.description}
                </Text>
              </View>
              <Text className="text-gray-400 text-lg">{'\u203A'}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}
