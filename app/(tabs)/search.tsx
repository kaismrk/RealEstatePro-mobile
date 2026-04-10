import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  SafeAreaView,
  type ListRenderItemInfo,
} from 'react-native';
import { router } from 'expo-router';
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
import type { PropertySchema } from '@/lib/types/property';

const FILTER_LABELS: Partial<Record<keyof PropertyFilters, (v: unknown) => string>> = {
  listing_type: (v) => String(v),
  property_type: (v) => String(v),
  min_price: (v) => `Min $${String(v)}`,
  max_price: (v) => `Max $${String(v)}`,
  min_bedrooms: (v) => `${String(v)}+ beds`,
  max_bedrooms: (v) => `Max ${String(v)} beds`,
  min_area: (v) => `Min ${String(v)}m\u00B2`,
  max_area: (v) => `Max ${String(v)}m\u00B2`,
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
  const filters = useSearchStore((s) => s.filters);
  const setFilters = useSearchStore((s) => s.setFilters);
  const setCountry = useAuthStore((s) => s.setCountry);
  const countryCode = useAuthStore((s) => s.countryCode);
  const [saveSheetVisible, setSaveSheetVisible] = useState(false);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = useProperties();

  const properties = data?.pages.flatMap((page) => page.items) ?? [];

  // Compute active filter chips (exclude empty/undefined/false values)
  const activeFilters = (
    Object.entries(filters) as [keyof PropertyFilters, unknown][]
  ).filter(([, value]) => value != null && value !== '' && value !== false);

  const activeFilterCount = activeFilters.length;

  function handleDismissFilter(key: keyof PropertyFilters) {
    setFilters({ [key]: undefined });
  }

  function handleEndReached() {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }

  function handleCountrySelect(code: string) {
    void setCountry(code);
  }

  function renderItem({ item }: ListRenderItemInfo<PropertySchema>) {
    return <PropertyCard property={item} />;
  }

  function keyExtractor(item: PropertySchema) {
    return String(item.id);
  }

  function renderListHeader() {
    return (
      <>
        <SortPicker />
        {activeFilters.length > 0 && (
          <View className="flex-row flex-wrap px-4 pb-2 gap-y-2">
            {activeFilters.map(([key, value]) => {
              const labelFn = FILTER_LABELS[key];
              const label = labelFn ? labelFn(value) : String(key);
              return (
                <FilterChip
                  key={key}
                  label={label}
                  onDismiss={() => handleDismissFilter(key)}
                />
              );
            })}
          </View>
        )}
      </>
    );
  }

  function renderListFooter() {
    if (isFetchingNextPage) {
      return (
        <View className="py-4">
          <LoadingSpinner size="small" />
        </View>
      );
    }
    return null;
  }

  function renderEmpty() {
    if (isLoading) return null;
    return (
      <EmptyState
        title="No properties found"
        subtitle="Try adjusting your filters"
        icon="\uD83C\uDFE0"
      />
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Top header row */}
      <View className="flex-row items-center px-4 pt-2 pb-1 bg-white">
        <CountrySelector
          selectedCode={countryCode}
          onSelect={handleCountrySelect}
        />
        <View className="flex-1" />
        <TouchableOpacity
          onPress={() => setSaveSheetVisible(true)}
          className="flex-row items-center gap-1 px-3 py-2 bg-gray-100 rounded-lg mr-2"
          accessibilityLabel="Save search"
          accessibilityRole="button"
        >
          <Text className="text-base">{'\uD83D\uDD14'}</Text>
          <Text className="text-sm font-medium text-gray-700">Save</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push('/search/map')}
          className="flex-row items-center gap-1 px-3 py-2 bg-gray-100 rounded-lg"
          accessibilityLabel="Map view"
          accessibilityRole="button"
        >
          <Text className="text-base">{'\uD83D\uDDFA\uFE0F'}</Text>
          <Text className="text-sm font-medium text-gray-700">Map</Text>
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <View className="bg-white pb-1">
        <SearchBar activeFilterCount={activeFilterCount} />
      </View>

      {/* Loading skeletons on initial load */}
      {isLoading ? (
        <FlatList
          data={[1, 2, 3, 4, 5]}
          renderItem={() => <PropertyCardSkeleton />}
          keyExtractor={(i) => String(i)}
          contentContainerStyle={{ paddingTop: 8 }}
          scrollEnabled={false}
        />
      ) : (
        <FlatList<PropertySchema>
          data={properties}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          onEndReachedThreshold={0.5}
          onEndReached={handleEndReached}
          ListHeaderComponent={renderListHeader}
          ListFooterComponent={renderListFooter}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 24, flexGrow: 1 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching && !isLoading}
              onRefresh={() => void refetch()}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      <SaveSearchSheet
        visible={saveSheetVisible}
        onClose={() => setSaveSheetVisible(false)}
      />
    </SafeAreaView>
  );
}
