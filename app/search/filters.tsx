import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSearchStore, type PropertyFilters } from '@/lib/stores/search.store';
import { useAuthStore } from '@/lib/stores/auth.store';
import { haptic } from '@/lib/utils/haptics';
import { colors, radius, fontWeight, fontSize } from '@/constants/theme';
import { RegionPicker } from '@/components/geo/RegionPicker';
import { RegionBreadcrumb } from '@/components/geo/RegionBreadcrumb';
import type { Region } from '@/hooks/useRegions';

const LISTING_TYPE_VALUES = ['sale', 'rent', 'commercial', 'land'] as const;
const PROPERTY_TYPE_VALUES = [
  'apartment', 'villa', 'house', 'studio', 'land', 'commercial',
  'office', 'shop', 'warehouse', 'farmhouse', 'chalet', 'penthouse',
  'duplex', 'townhouse', 'building',
] as const;
const ENERGY_RATINGS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
const AMENITY_KEYS: Array<keyof PropertyFilters> = [
  'has_pool', 'has_garden', 'has_balcony', 'has_elevator', 'has_parking', 'has_garage',
];
const AMENITY_TRANSLATION_KEYS = ['pool', 'garden', 'balcony', 'elevator', 'parking', 'garage'] as const;

function SectionTitle({ children }: { children: string }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

export default function FiltersScreen() {
  const { t } = useTranslation();
  const storeFilters = useSearchStore((s) => s.filters);
  const setStoreFilters = useSearchStore((s) => s.setFilters);
  const resetStoreFilters = useSearchStore((s) => s.resetFilters);
  const countryCode = useAuthStore((s) => s.countryCode);

  const [local, setLocal] = useState<PropertyFilters>({ ...storeFilters });
  const [locationPath, setLocationPath] = useState<Region[]>([]);

  function setField<K extends keyof PropertyFilters>(key: K, value: PropertyFilters[K]) {
    setLocal((prev) => ({ ...prev, [key]: value }));
  }

  function handleApply() {
    void haptic.light();
    setStoreFilters(local);
    router.back();
  }

  function handleReset() {
    resetStoreFilters();
    setLocationPath([]);
    router.back();
  }

  function togglePropertyType(type: string) {
    const current = local.property_type ?? '';
    setField('property_type', current === type ? undefined : type);
  }

  function toggleEnergyRating(rating: string) {
    const current = local.energy_rating ?? '';
    setField('energy_rating', current === rating ? undefined : rating);
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.flex1}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Transaction type */}
        <View style={styles.section}>
          <SectionTitle>{t('filters.transactionType')}</SectionTitle>
          <View style={styles.chipRow}>
            {LISTING_TYPE_VALUES.map((value) => {
              const isSelected = local.listing_type === value;
              return (
                <TouchableOpacity
                  key={value}
                  onPress={() =>
                    setField('listing_type', isSelected ? undefined : value)
                  }
                  style={[styles.chip, isSelected ? styles.chipSelected : styles.chipUnselected]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                >
                  <Text style={[styles.chipText, isSelected ? styles.chipTextSelected : styles.chipTextUnselected]}>
                    {t(`listings.listingTypes.${value}`)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Price range */}
        <View style={styles.section}>
          <SectionTitle>{t('filters.priceRange')}</SectionTitle>
          <View style={styles.row}>
            <View style={styles.flex1}>
              <Text style={styles.inputLabel}>{t('filters.minPrice')}</Text>
              <TextInput
                style={styles.textInput}
                placeholder="0"
                keyboardType="numeric"
                value={local.min_price != null ? String(local.min_price) : ''}
                onChangeText={(v) =>
                  setField('min_price', v ? Number(v) : undefined)
                }
                accessibilityLabel={t('filters.minPrice')}
              />
            </View>
            <View style={styles.rowGap} />
            <View style={styles.flex1}>
              <Text style={styles.inputLabel}>{t('filters.maxPrice')}</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Any"
                keyboardType="numeric"
                value={local.max_price != null ? String(local.max_price) : ''}
                onChangeText={(v) =>
                  setField('max_price', v ? Number(v) : undefined)
                }
                accessibilityLabel={t('filters.maxPrice')}
              />
            </View>
          </View>
        </View>

        {/* Bedrooms */}
        <View style={styles.section}>
          <SectionTitle>{t('filters.bedrooms')}</SectionTitle>
          <View style={styles.row}>
            <View style={styles.flex1}>
              <Text style={styles.inputLabel}>{t('filters.min')}</Text>
              <TextInput
                style={styles.textInput}
                placeholder="0"
                keyboardType="numeric"
                value={local.min_bedrooms != null ? String(local.min_bedrooms) : ''}
                onChangeText={(v) =>
                  setField('min_bedrooms', v ? Number(v) : undefined)
                }
                accessibilityLabel={t('filters.min')}
              />
            </View>
            <View style={styles.rowGap} />
            <View style={styles.flex1}>
              <Text style={styles.inputLabel}>{t('filters.max')}</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Any"
                keyboardType="numeric"
                value={local.max_bedrooms != null ? String(local.max_bedrooms) : ''}
                onChangeText={(v) =>
                  setField('max_bedrooms', v ? Number(v) : undefined)
                }
                accessibilityLabel={t('filters.max')}
              />
            </View>
          </View>
        </View>

        {/* Area */}
        <View style={styles.section}>
          <SectionTitle>{t('filters.area')}</SectionTitle>
          <View style={styles.row}>
            <View style={styles.flex1}>
              <Text style={styles.inputLabel}>{t('filters.minArea')}</Text>
              <TextInput
                style={styles.textInput}
                placeholder="0"
                keyboardType="numeric"
                value={local.min_area != null ? String(local.min_area) : ''}
                onChangeText={(v) =>
                  setField('min_area', v ? Number(v) : undefined)
                }
                accessibilityLabel={t('filters.minArea')}
              />
            </View>
            <View style={styles.rowGap} />
            <View style={styles.flex1}>
              <Text style={styles.inputLabel}>{t('filters.maxArea')}</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Any"
                keyboardType="numeric"
                value={local.max_area != null ? String(local.max_area) : ''}
                onChangeText={(v) =>
                  setField('max_area', v ? Number(v) : undefined)
                }
                accessibilityLabel={t('filters.maxArea')}
              />
            </View>
          </View>
        </View>

        {/* Property type */}
        <View style={styles.section}>
          <SectionTitle>{t('filters.propertyType')}</SectionTitle>
          <View style={styles.chipRow}>
            {PROPERTY_TYPE_VALUES.map((pt) => {
              const isSelected = local.property_type === pt;
              return (
                <TouchableOpacity
                  key={pt}
                  onPress={() => togglePropertyType(pt)}
                  style={[styles.chipSm, isSelected ? styles.chipSelected : styles.chipUnselected]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                >
                  <Text
                    style={[
                      styles.chipTextSm,
                      isSelected ? styles.chipTextSelected : styles.chipTextUnselected,
                    ]}
                  >
                    {t(`listings.propertyTypes.${pt}`)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Amenities */}
        <View style={styles.section}>
          <SectionTitle>{t('filters.amenities')}</SectionTitle>
          {AMENITY_KEYS.map((key, idx) => {
            const translationKey = AMENITY_TRANSLATION_KEYS[idx];
            const label = t(`filters.amenityItems.${translationKey}`);
            return (
              <View key={key} style={styles.amenityRow}>
                <Text style={styles.amenityLabel}>{label}</Text>
                <Switch
                  value={!!local[key]}
                  onValueChange={(v) => setField(key, v || undefined)}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.surface}
                  accessibilityLabel={label}
                />
              </View>
            );
          })}
        </View>

        {/* Energy rating */}
        <View style={styles.section}>
          <SectionTitle>{t('filters.energyRating')}</SectionTitle>
          <View style={styles.chipRow}>
            {ENERGY_RATINGS.map((rating) => {
              const isSelected = local.energy_rating === rating;
              return (
                <TouchableOpacity
                  key={rating}
                  onPress={() => toggleEnergyRating(rating)}
                  style={[styles.energyChip, isSelected ? styles.chipSelected : styles.chipUnselected]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                >
                  <Text
                    style={[
                      styles.energyChipText,
                      isSelected ? styles.chipTextSelected : styles.chipTextUnselected,
                    ]}
                  >
                    {rating}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <RegionPicker
            countryCode={countryCode}
            value={local.region_id ?? null}
            onChange={(regionId, path) => {
              setField('region_id', regionId ?? undefined);
              setLocationPath(path);
            }}
          />
          {locationPath.length > 0 && (
            <RegionBreadcrumb path={locationPath} />
          )}
        </View>
      </ScrollView>

      {/* Footer actions */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={handleReset}
          style={styles.resetBtn}
          accessibilityRole="button"
          accessibilityLabel={t('common.reset')}
        >
          <Text style={styles.resetBtnText}>{t('common.reset')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleApply}
          style={styles.applyBtn}
          accessibilityRole="button"
          accessibilityLabel={t('filters.apply')}
        >
          <Text style={styles.applyBtnText}>{t('filters.apply')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  flex1: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
  },
  chipSm: {
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipUnselected: {
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
  },
  chipText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  chipTextSm: {
    fontSize: fontSize.sm,
  },
  chipTextSelected: {
    color: colors.textOnBrand,
  },
  chipTextUnselected: {
    color: colors.textSecondary,
  },
  row: {
    flexDirection: 'row',
  },
  rowGap: {
    width: 12,
  },
  inputLabel: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
    marginBottom: 4,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: fontSize.base,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
  },
  amenityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  amenityLabel: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
  },
  energyChip: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  energyChipText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },
  breadcrumb: {
    marginTop: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 12,
  },
  resetBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
  },
  resetBtnText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
  },
  applyBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  applyBtnText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textOnBrand,
  },
});
