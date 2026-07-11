import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
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

export default function OnboardingStep1() {
  const { t } = useTranslation();
  const setOnboardingDraft = useUIStore((s) => s.setOnboardingDraft);

  const OPTIONS: IntentOption[] = [
    { id: 'buy', label: t('onboarding.step1.options.buy.label'), description: t('onboarding.step1.options.buy.description') },
    { id: 'rent', label: t('onboarding.step1.options.rent.label'), description: t('onboarding.step1.options.rent.description') },
    { id: 'sell', label: t('onboarding.step1.options.sell.label'), description: t('onboarding.step1.options.sell.description') },
    { id: 'browse', label: t('onboarding.step1.options.browse.label'), description: t('onboarding.step1.options.browse.description') },
  ];

  function handleSelect(intent: Intent) {
    void haptic.light();
    setOnboardingDraft({ intent });
    router.push('/onboarding/step-2');
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>{t('onboarding.step1.title')}</Text>
        <Text style={styles.subtitle}>
          {t('onboarding.step1.subtitle')}
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
