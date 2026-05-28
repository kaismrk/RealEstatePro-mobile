import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Switch,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { Icon } from '@/components/ui/Icon';
import { useUIStore } from '@/lib/stores/ui.store';
import { useSearchStore } from '@/lib/stores/search.store';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useSavedSearches } from '@/hooks/useSavedSearches';
import { haptic } from '@/lib/utils/haptics';
import { colors, radius, fontWeight } from '@/constants/theme';

const INTENT_LABELS: Record<string, string> = {
  buy: 'Buy',
  rent: 'Rent',
  sell: 'Sell',
  browse: 'Just browse',
};

function SummaryRow({ label, value, iconName }: { label: string; value: string; iconName: React.ComponentProps<typeof Icon>['name'] }) {
  return (
    <View style={styles.summaryRow}>
      <Icon name={iconName} size={20} color={colors.textSecondary} style={styles.summaryIcon} />
      <View style={styles.flex1}>
        <Text style={styles.summaryLabel}>{label}</Text>
        <Text style={styles.summaryValue}>{value}</Text>
      </View>
    </View>
  );
}

export default function OnboardingStep5() {
  const onboardingDraft = useUIStore((s) => s.onboardingDraft);
  const clearOnboardingDraft = useUIStore((s) => s.clearOnboardingDraft);
  const setFilters = useSearchStore((s) => s.setFilters);
  const accessToken = useAuthStore((s) => s.accessToken);
  const countryCode = useAuthStore((s) => s.countryCode);
  const { create } = useSavedSearches();

  const [saveSearch, setSaveSearch] = useState(!!accessToken);
  const [isSaving, setIsSaving] = useState(false);

  const {
    intent,
    region_label,
    min_price,
    max_price,
    min_bedrooms,
    max_bedrooms,
  } = onboardingDraft;

  function buildPriceLabel() {
    if (!min_price && !max_price) return 'Any budget';
    if (!min_price && max_price) return `Up to ${max_price.toLocaleString()}`;
    if (min_price && !max_price) return `From ${min_price.toLocaleString()}`;
    return `${min_price!.toLocaleString()} – ${max_price!.toLocaleString()}`;
  }

  function buildBedroomLabel() {
    if (min_bedrooms == null && max_bedrooms == null) return 'Any';
    if (min_bedrooms === 0 && max_bedrooms == null) return 'Studio or more';
    if (min_bedrooms != null && max_bedrooms == null) {
      return `${min_bedrooms}+ bedrooms`;
    }
    if (min_bedrooms != null && max_bedrooms != null) {
      return `${min_bedrooms} – ${max_bedrooms} bedrooms`;
    }
    return `Up to ${max_bedrooms} bedrooms`;
  }

  async function handleFinish() {
    const filters: Parameters<typeof setFilters>[0] = {};
    if (intent && intent !== 'browse' && intent !== 'sell') {
      filters.listing_type = intent;
    }
    if (onboardingDraft.region_id != null) {
      filters.region_id = onboardingDraft.region_id;
    }
    if (min_price != null) filters.min_price = min_price;
    if (max_price != null) filters.max_price = max_price;
    if (min_bedrooms != null) filters.min_bedrooms = min_bedrooms;
    if (max_bedrooms != null) filters.max_bedrooms = max_bedrooms;

    setFilters(filters);

    if (saveSearch && accessToken) {
      setIsSaving(true);
      try {
        await create.mutateAsync({
          name: region_label
            ? `My search in ${region_label}`
            : `My search (${INTENT_LABELS[intent ?? 'browse'] ?? 'Browse'})`,
          filters: {
            listing_type: intent !== 'browse' && intent !== 'sell' ? intent : undefined,
            region_id: onboardingDraft.region_id,
            min_price,
            max_price,
            min_bedrooms,
            max_bedrooms,
          } as Parameters<typeof create.mutateAsync>[0]['filters'],
          country_code: countryCode,
        });
        void haptic.success();
        Toast.show({ type: 'success', text1: 'Search saved!', text2: 'You will get alerts for new matches.' });
      } catch {
        void haptic.error();
        Toast.show({ type: 'error', text1: 'Could not save search', text2: 'You can save it later from the search screen.' });
      } finally {
        setIsSaving(false);
      }
    }

    clearOnboardingDraft();
    router.replace('/(tabs)/search');
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.flex1}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Your search preferences</Text>
          <Text style={styles.subtitle}>
            Here is a summary of what you are looking for.
          </Text>

          {/* Summary cards */}
          <View style={styles.summaryCard}>
            <SummaryRow
              iconName="home"
              label="Intent"
              value={intent ? INTENT_LABELS[intent] ?? 'Browse' : 'Not set'}
            />
            <SummaryRow
              iconName="map-pin"
              label="Location"
              value={region_label ?? 'Anywhere'}
            />
            <SummaryRow
              iconName="credit-card"
              label="Budget"
              value={buildPriceLabel()}
            />
            <View style={styles.summaryRow}>
              <Icon name="bed" size={20} color={colors.textSecondary} style={styles.summaryIcon} />
              <View style={styles.flex1}>
                <Text style={styles.summaryLabel}>Bedrooms</Text>
                <Text style={styles.summaryValue}>{buildBedroomLabel()}</Text>
              </View>
            </View>
          </View>

          {/* Save search toggle */}
          {accessToken ? (
            <View style={styles.saveToggleCard}>
              <View style={styles.saveToggleText}>
                <Text style={styles.saveToggleTitle}>Save my search</Text>
                <Text style={styles.saveToggleSubtitle}>
                  Get notified when new homes match
                </Text>
              </View>
              <Switch
                value={saveSearch}
                onValueChange={setSaveSearch}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.surface}
                accessibilityLabel="Save search toggle"
              />
            </View>
          ) : null}
        </View>
      </ScrollView>

      {/* Footer: Back / Finish */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Back"
          disabled={isSaving}
        >
          <Icon name="chevron-left" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => void handleFinish()}
          style={[styles.finishButton, isSaving && styles.finishButtonDisabled]}
          disabled={isSaving}
          accessibilityRole="button"
          accessibilityLabel="Finish onboarding"
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={colors.textOnBrand} style={styles.finishSpinner} />
          ) : null}
          <Text style={styles.finishButtonText}>
            {isSaving ? 'Saving…' : 'Find Homes'}
          </Text>
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
  summaryCard: {
    backgroundColor: colors.surfaceSunken,
    borderRadius: radius.xl2,
    paddingHorizontal: 16,
    marginBottom: 24,
    overflow: 'hidden',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  summaryIcon: {
    marginRight: 12,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  saveToggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primaryLight,
    borderRadius: radius.xl2,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 24,
  },
  saveToggleText: {
    flex: 1,
    marginRight: 12,
  },
  saveToggleTitle: {
    fontSize: 16,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  saveToggleSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
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
  finishButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  finishButtonDisabled: {
    opacity: 0.6,
  },
  finishSpinner: {
    marginRight: 4,
  },
  finishButtonText: {
    fontSize: 16,
    fontWeight: fontWeight.semibold,
    color: colors.textOnBrand,
  },
});
