import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import { useUIStore } from '@/lib/stores/ui.store';
import { haptic } from '@/lib/utils/haptics';
import { colors, radius, fontWeight } from '@/constants/theme';

interface BedroomOption {
  label: string;
  value: number | null;
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
      <View style={styles.gridSection}>
        <Text style={styles.gridLabel}>{label}</Text>
        <View style={styles.gridRow}>
          {BEDROOM_OPTIONS.map((opt) => {
            const isDisabled =
              minValue != null && opt.value != null && opt.value < minValue;
            const isSelected = selected === opt.value;
            return (
              <TouchableOpacity
                key={opt.label}
                onPress={() => !isDisabled && onSelect(isSelected ? null : opt.value)}
                style={[
                  styles.chipButton,
                  isSelected && styles.chipButtonSelected,
                  isDisabled && styles.chipButtonDisabled,
                ]}
                disabled={isDisabled}
                accessibilityRole="button"
                accessibilityLabel={`${opt.label} bedroom${opt.value !== 1 ? 's' : ''}`}
                accessibilityState={{ selected: isSelected, disabled: isDisabled }}
              >
                <Text
                  style={[
                    styles.chipLabel,
                    isSelected && styles.chipLabelSelected,
                  ]}
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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.flex1}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <Text style={styles.title}>How many bedrooms?</Text>
          <Text style={styles.subtitle}>
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
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleNext}
          style={styles.nextButton}
          accessibilityRole="button"
          accessibilityLabel="Next step"
        >
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
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
    marginBottom: 28,
  },
  gridSection: {
    marginBottom: 24,
  },
  gridLabel: {
    fontSize: 14,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    backgroundColor: colors.surfaceSunken,
    borderColor: colors.border,
  },
  chipButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipButtonDisabled: {
    opacity: 0.4,
  },
  chipLabel: {
    fontSize: 16,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  chipLabelSelected: {
    color: colors.textOnBrand,
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
