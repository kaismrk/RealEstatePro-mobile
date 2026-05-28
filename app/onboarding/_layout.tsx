import { Stack, usePathname, router } from 'expo-router';
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet } from 'react-native';
import { useUIStore } from '@/lib/stores/ui.store';
import { colors, fontWeight, radius } from '@/constants/theme';

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
    <SafeAreaView style={styles.headerSafeArea}>
      <View style={styles.headerRow}>
        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.stepLabelRow}>
            <Text style={styles.stepLabel}>
              Step {stepNumber} of {totalSteps}
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[styles.progressFill, { width: `${(stepNumber / totalSteps) * 100}%` }]}
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
          <Text style={styles.skipText}>Skip all</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default function OnboardingLayout() {
  return (
    <View style={styles.root}>
      <OnboardingHeader />
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  headerSafeArea: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  progressContainer: {
    flex: 1,
    marginRight: 16,
  },
  stepLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  stepLabel: {
    fontSize: 12,
    color: colors.textTertiary,
    fontWeight: fontWeight.medium,
  },
  progressTrack: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
  },
  skipText: {
    fontSize: 14,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
  },
});
