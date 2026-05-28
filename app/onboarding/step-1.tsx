import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import { useUIStore, type OnboardingDraft } from '@/lib/stores/ui.store';
import { haptic } from '@/lib/utils/haptics';
import { colors, radius, fontWeight } from '@/constants/theme';

type Intent = NonNullable<OnboardingDraft['intent']>;

interface IntentOption {
  id: Intent;
  label: string;
  description: string;
}

const OPTIONS: IntentOption[] = [
  { id: 'buy', label: 'Buy', description: 'Find your dream home' },
  { id: 'rent', label: 'Rent', description: 'Find a rental property' },
  { id: 'sell', label: 'Sell', description: 'List your property' },
  { id: 'browse', label: 'Just browse', description: "I'm exploring options" },
];

export default function OnboardingStep1() {
  const setOnboardingDraft = useUIStore((s) => s.setOnboardingDraft);

  function handleSelect(intent: Intent) {
    void haptic.light();
    setOnboardingDraft({ intent });
    router.push('/onboarding/step-2');
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Where would you like to start?</Text>
        <Text style={styles.subtitle}>
          Tell us what you are looking for so we can personalise your experience.
        </Text>

        <View style={styles.optionsList}>
          {OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.id}
              onPress={() => handleSelect(option.id)}
              style={styles.optionRow}
              accessibilityRole="button"
              accessibilityLabel={option.label}
            >
              <View style={styles.optionText}>
                <Text style={styles.optionLabel}>{option.label}</Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </View>
              <Icon name="chevron-right" size={20} color={colors.textTertiary} />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 32,
  },
  optionsList: {
    gap: 12,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.surfaceSunken,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl2,
  },
  optionText: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 18,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  optionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
