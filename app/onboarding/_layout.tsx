import { Stack, usePathname, router } from 'expo-router';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useUIStore } from '@/lib/stores/ui.store';

const STEPS = [
  '/onboarding/step-1',
  '/onboarding/step-2',
  '/onboarding/step-3',
  '/onboarding/step-4',
  '/onboarding/step-5',
];

function OnboardingHeader() {
  const pathname = usePathname();
  const clearOnboardingDraft = useUIStore((s) => s.clearOnboardingDraft);

  const currentIndex = STEPS.findIndex((s) => pathname.startsWith(s));
  const stepNumber = currentIndex >= 0 ? currentIndex + 1 : 1;
  const totalSteps = STEPS.length;

  function handleSkipAll() {
    clearOnboardingDraft();
    router.replace('/(tabs)/search');
  }

  return (
    <SafeAreaView className="bg-white border-b border-gray-100">
      <View className="flex-row items-center px-4 pt-2 pb-3">
        {/* Progress bar */}
        <View className="flex-1 mr-4">
          <View className="flex-row items-center mb-1.5">
            <Text className="text-xs text-gray-500 font-medium">
              Step {stepNumber} of {totalSteps}
            </Text>
          </View>
          <View className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <View
              className="h-full bg-primary-500 rounded-full"
              style={{ width: `${(stepNumber / totalSteps) * 100}%` }}
            />
          </View>
        </View>

        {/* Skip All button */}
        <TouchableOpacity
          onPress={handleSkipAll}
          accessibilityRole="button"
          accessibilityLabel="Skip onboarding"
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
        >
          <Text className="text-sm font-semibold text-gray-500">Skip all</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default function OnboardingLayout() {
  return (
    <View className="flex-1 bg-white">
      <OnboardingHeader />
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} />
    </View>
  );
}
