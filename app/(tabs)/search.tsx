import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  type ListRenderItemInfo,
} from 'react-native';
import { router } from 'expo-router';
import { Home } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useProperties } from '@/hooks/useProperties';
import { useSearchStore, type PropertyFilters } from '@/lib/stores/search.store';
import { useAuthStore } from '@/lib/stores/auth.store';
import { PropertyCard } from '@/components/property/PropertyCard';
import { PropertyCardSkeleton } from '@/components/property/PropertyCardSkeleton';
import { SearchBar } from '@/components/search/SearchBar';
import { SortPicker } from '@/components/search/SortPicker';
import { FilterChip } from '@/components/search/FilterChip';
import { SaveSearchSheet } from '@/components/search/SaveSearchSheet';
import { CountrySelector } from '@/components/shared/CountrySelector';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Icon } from '@/components/ui/Icon';
import type { PropertySchema } from '@/lib/types/property';
import { colors, fontWeight, radius } from '@/constants/theme';

const FILTER_LABELS: Partial<Record<keyof PropertyFilters, (v: unknown) => string>> = {
  listing_type: (v) => String(v),
  property_type: (v) => String(v),
  min_price: (v) => `Min $${String(v)}`,
  max_price: (v) => `Max $${String(v)}`,
  min_bedrooms: (v) => `${String(v)}+ beds`,
  max_bedrooms: (v) => `Max ${String(v)} beds`,
  min_area: (v) => `Min ${String(v)}m²`,
  max_area: (v) => `Max ${String(v)}m²`,
  has_pool: () => 'Pool',
  has_garden: () => 'Garden',
  has_balcony: () => 'Balcony',
  has_elevator: () => 'Elevator',
  has_parking: () => 'Parking',
  has_garage: () => 'Garage',
  energy_rating: (v) => `Energy ${String(v)}`,
  q: (v) => `"${String(v)}"`,
};

export default function SearchScreen() {
  const { t } = useTranslation();
  const filters    = useSearchStore((s) => s.filters);
  const setFilters = useSearchStore((s) => s.setFilters);
  const setCountry = useAuthStore((s) => s.setCountry);
  const countryCode = useAuthStore((s) => s.countryCode);
  const [saveSheetVisible, setSaveSheetVisible] = useState(false);

  const { data, isLoading, isFetchingNextPage, isRefetching, fetchNextPage, hasNextPage, refetch } =
    useProperties();

  const properties = data?.pages.flatMap((p) => p.items) ?? [];
  const activeFilters = (Object.entries(filters) as [keyof PropertyFilters, unknown][]).filter(
    ([, v]) => v != null && v !== '' && v !== false
  );

  function handleDismissFilter(key: keyof PropertyFilters) { setFilters({ [key]: undefined }); }
  function handleEndReached() { if (hasNextPage && !isFetchingNextPage) void fetchNextPage(); }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <CountrySelector selectedCode={countryCode} onSelect={(c) => void setCountry(c)} />
        <View style={styles.spacer} />
        <TouchableOpacity
          onPress={() => setSaveSheetVisible(true)}
          style={styles.iconBtn}
          accessibilityLabel={t('search.saveSearchLabel')}
        >
          <Icon name="bell" size={18} color={colors.textPrimary} />
          <Text style={styles.iconBtnLabel}>{t('search.saveButton')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push('/search/map')}
          style={[styles.iconBtn, styles.iconBtnMl]}
          accessibilityLabel={t('search.mapViewLabel')}
        >
          <Icon name="map" size={18} color={colors.textPrimary} />
          <Text style={styles.iconBtnLabel}>{t('search.mapButton')}</Text>
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <View style={styles.searchWrap}>
        <SearchBar activeFilterCount={activeFilters.length} />
      </View>

      {/* Active filter chips */}
      {activeFilters.length > 0 && (
        <View style={styles.chips}>
          {activeFilters.map(([key, value]) => {
            const fn = FILTER_LABELS[key];
            return (
              <FilterChip
                key={key}
                label={fn ? fn(value) : String(key)}
                onDismiss={() => handleDismissFilter(key)}
              />
            );
          })}
        </View>
      )}

      {/* List */}
      {isLoading ? (
        <FlatList
          data={[1, 2, 3, 4]}
          renderItem={() => <PropertyCardSkeleton />}
          keyExtractor={(i) => String(i)}
          contentContainerStyle={{ paddingTop: 8 }}
          scrollEnabled={false}
        />
      ) : (
        <FlatList<PropertySchema>
          data={properties}
          renderItem={({ item }: ListRenderItemInfo<PropertySchema>) => <PropertyCard property={item} />}
          keyExtractor={(item) => String(item.id)}
          onEndReachedThreshold={0.5}
          onEndReached={handleEndReached}
          ListHeaderComponent={<SortPicker />}
          ListFooterComponent={
            isFetchingNextPage ? <View style={styles.footerSpinner}><LoadingSpinner size="small" /></View> : null
          }
          ListEmptyComponent={
            <EmptyState
                title={t('search.empty.title')}
                subtitle={t('search.empty.subtitle')}
                icon={<Home size={48} color={colors.textTertiary} />}
              />
          }
          contentContainerStyle={{ paddingTop: 4, paddingBottom: 24, flexGrow: 1 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching && !isLoading}
              onRefresh={() => void refetch()}
              tintColor={colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      <SaveSearchSheet visible={saveSheetVisible} onClose={() => setSaveSheetVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: colors.background },
  header:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  spacer:    { flex: 1 },
  iconBtn:   { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: colors.neutral100, borderRadius: radius.sm },
  iconBtnLabel: { fontSize: 13, fontWeight: fontWeight.medium, color: colors.textPrimary },
  iconBtnMl: { marginLeft: 8 },
  searchWrap: { backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  chips: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, paddingVertical: 8, backgroundColor: colors.surface },
  footerSpinner: { paddingVertical: 16 },
});
