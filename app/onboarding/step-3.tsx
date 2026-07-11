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
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/ui/Icon';
import { useUIStore } from '@/lib/stores/ui.store';
import { useAuthStore } from '@/lib/stores/auth.store';
import { haptic } from '@/lib/utils/haptics';
import { colors, radius, fontWeight } from '@/constants/theme';

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
  const { t } = useTranslation();
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
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.flex1}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <Text style={styles.title}>{t('onboarding.step3.title')}</Text>
            <Text style={styles.subtitle}>
              {t('onboarding.step3.subtitle')}
            </Text>

            {/* Preset ranges */}
            <View style={styles.presetRow}>
              {PRESET_RANGES.map((preset, index) => (
                <TouchableOpacity
                  key={preset.label}
                  onPress={() => handlePreset(index)}
                  style={[
                    styles.presetButton,
                    activePreset === index ? styles.presetButtonActive : styles.presetButtonInactive,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={preset.label}
                  accessibilityState={{ selected: activePreset === index }}
                >
                  <Text
                    style={[
                      styles.presetLabel,
                      activePreset === index ? styles.presetLabelActive : styles.presetLabelInactive,
                    ]}
                  >
                    {preset.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Min / Max price inputs */}
            <View style={styles.inputsContainer}>
              <View>
                <Text style={styles.inputLabel}>{t('onboarding.step3.minPrice', { currency })}</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. 100,000"
                  placeholderTextColor={colors.textTertiary}
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
                  <Text style={styles.currencyHint}>
                    {formatCurrency(minPrice, currency)}
                  </Text>
                ) : null}
              </View>

              <View>
                <Text style={styles.inputLabel}>{t('onboarding.step3.maxPrice', { currency })}</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. 500,000"
                  placeholderTextColor={colors.textTertiary}
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
                  <Text style={styles.currencyHint}>
                    {formatCurrency(maxPrice, currency)}
                  </Text>
                ) : null}
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Footer: Back / Skip / Next */}
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <Icon name="chevron-left" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSkip}
            style={styles.skipButton}
            accessibilityRole="button"
            accessibilityLabel="Skip this step"
          >
            <Text style={styles.skipButtonText}>{t('common.skip')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleNext}
            style={styles.nextButton}
            accessibilityRole="button"
            accessibilityLabel="Next step"
          >
            <Text style={styles.nextButtonText}>{t('common.next')}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  flex1: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
    flex: 1,
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
    marginBottom: 24,
  },
  presetRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  presetButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  presetButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  presetButtonInactive: {
    backgroundColor: colors.surfaceSunken,
    borderColor: colors.border,
  },
  presetLabel: {
    fontSize: 14,
    fontWeight: fontWeight.semibold,
  },
  presetLabelActive: {
    color: colors.textOnBrand,
  },
  presetLabelInactive: {
    color: colors.textSecondary,
  },
  inputsContainer: {
    gap: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: colors.surfaceSunken,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.textPrimary,
  },
  currencyHint: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 4,
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
    width: 48,
    paddingVertical: 14,
    backgroundColor: colors.surfaceSunken,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButton: {
    flex: 1,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
  },
  nextButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: fontWeight.semibold,
    color: colors.textOnBrand,
  },
});
