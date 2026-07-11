import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  StyleSheet,
  type ListRenderItemInfo,
} from 'react-native';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/ui/Icon';
import { useTopLevelRegions, type Region } from '@/hooks/useRegions';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useUIStore } from '@/lib/stores/ui.store';
import { haptic } from '@/lib/utils/haptics';
import { colors, radius, fontWeight } from '@/constants/theme';

export default function OnboardingStep2() {
  const { t } = useTranslation();
  const countryCode = useAuthStore((s) => s.countryCode);
  const setOnboardingDraft = useUIStore((s) => s.setOnboardingDraft);

  const [query, setQuery] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const { data: regionsData, isLoading: regionsLoading } = useTopLevelRegions(countryCode);
  const regions = regionsData?.items ?? [];

  const filtered = query.trim()
    ? regions.filter((r) =>
        r.name.toLowerCase().includes(query.trim().toLowerCase())
      )
    : regions;

  function handleSelectRegion(region: Region) {
    void haptic.light();
    setOnboardingDraft({ region_id: region.id, region_label: region.name });
    router.push('/onboarding/step-3');
  }

  function handleSkip() {
    router.push('/onboarding/step-3');
  }

  async function handleUseLocation() {
    setLocationError(null);
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError(t('onboarding.step2.locationDenied'));
        setLocationLoading(false);
        return;
      }
      await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setQuery(countryCode);
    } catch {
      setLocationError(t('onboarding.step2.locationError'));
    } finally {
      setLocationLoading(false);
    }
  }

  function renderItem({ item }: ListRenderItemInfo<Region>) {
    return (
      <TouchableOpacity
        onPress={() => handleSelectRegion(item)}
        style={styles.regionRow}
        accessibilityRole="button"
        accessibilityLabel={item.name}
      >
        <Text style={styles.regionName}>{item.name}</Text>
        <Icon name="chevron-right" size={16} color={colors.textTertiary} />
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.headerSection}>
        <Text style={styles.title}>{t('onboarding.step2.title')}</Text>
        <Text style={styles.subtitle}>{t('onboarding.step2.subtitle')}</Text>

        {/* Search input */}
        <View style={styles.searchBox}>
          <Icon name="search" size={18} color={colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('onboarding.step2.searchPlaceholder')}
            placeholderTextColor={colors.textTertiary}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="words"
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
              <Icon name="x" size={18} color={colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Use my location button */}
        <TouchableOpacity
          onPress={() => void handleUseLocation()}
          style={styles.locationButton}
          accessibilityRole="button"
          accessibilityLabel="Use my current location"
          disabled={locationLoading}
        >
          {locationLoading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Icon name="map-pin" size={16} color={colors.primary} />
          )}
          <Text style={styles.locationButtonText}>
            {locationLoading ? t('onboarding.step2.gettingLocation') : t('onboarding.step2.useLocation')}
          </Text>
        </TouchableOpacity>

        {locationError ? (
          <Text style={styles.locationError}>{locationError}</Text>
        ) : null}
      </View>

      {/* Region list */}
      {regionsLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList<Region>
          data={filtered}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{t('onboarding.step2.noRegions')}</Text>
            </View>
          }
        />
      )}

      {/* Footer: Skip / Back */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Text style={styles.backButtonText}>{t('common.back')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleSkip}
          style={styles.skipButton}
          accessibilityRole="button"
          accessibilityLabel="Skip this step"
        >
          <Text style={styles.skipButtonText}>{t('common.skip')}</Text>
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
  headerSection: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
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
    marginBottom: 20,
  },
  searchBox: {
    backgroundColor: colors.surfaceSunken,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    marginLeft: 8,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  locationButtonText: {
    fontSize: 14,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
    marginLeft: 8,
  },
  locationError: {
    fontSize: 14,
    color: colors.error,
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  regionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  regionName: {
    fontSize: 16,
    color: colors.textPrimary,
    flex: 1,
  },
  emptyContainer: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textTertiary,
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
    flex: 1,
    paddingVertical: 14,
    backgroundColor: colors.surfaceSunken,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
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
});
