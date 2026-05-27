import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  type ListRenderItemInfo,
} from 'react-native';
import { router } from 'expo-router';
import { useSavedSearches } from '@/hooks/useSavedSearches';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useSearchStore } from '@/lib/stores/search.store';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { SaveSearchSheet } from '@/components/search/SaveSearchSheet';
import type { SavedSearchResponse } from '@/lib/types/saved_search';

function buildFilterSummary(filters: Record<string, unknown>): string {
  const parts: string[] = [];
  if (filters.city) parts.push(String(filters.city));
  if (filters.listing_type) parts.push(String(filters.listing_type));
  if (filters.property_type) parts.push(String(filters.property_type));
  if (filters.min_price != null || filters.max_price != null) {
    const min = filters.min_price != null ? String(filters.min_price) : '0';
    const max = filters.max_price != null ? String(filters.max_price) : '\u221E';
    parts.push(`${min}–${max}`);
  }
  if (filters.min_bedrooms != null) {
    parts.push(`${String(filters.min_bedrooms)}+ beds`);
  }
  return parts.length > 0 ? parts.join(' \u00B7 ') : 'All properties';
}

export default function UpdatesScreen() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const setFilters = useSearchStore((s) => s.setFilters);
  const { list, remove } = useSavedSearches();
  const [sheetVisible, setSheetVisible] = useState(false);

  // Auth gate
  if (!accessToken) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white px-6">
        <Text className="text-4xl mb-4">{'\uD83D\uDD14'}</Text>
        <Text className="text-xl font-bold text-gray-900 mb-2 text-center">
          Sign in to view saved searches
        </Text>
        <Text className="text-sm text-gray-500 text-center mb-6">
          Save your searches and get notified when new homes match.
        </Text>
        <TouchableOpacity
          className="bg-primary-500 px-6 py-3 rounded-xl"
          onPress={() => router.push('/(auth)/welcome')}
          accessibilityRole="button"
          accessibilityLabel="Sign in"
        >
          <Text className="text-white font-semibold text-base">Sign In</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const searches = list.data?.items ?? [];

  function handleSearchTap(item: SavedSearchResponse) {
    // Apply saved filters then navigate to search tab
    setFilters(item.filters as Parameters<typeof setFilters>[0]);
    router.push('/(tabs)/search');
  }

  function renderItem({ item }: ListRenderItemInfo<SavedSearchResponse>) {
    const filters = item.filters as Record<string, unknown>;
    const summary = buildFilterSummary(filters);

    return (
      <TouchableOpacity
        className="bg-white mx-4 mb-3 p-4 rounded-2xl shadow-sm border border-gray-100"
        onPress={() => handleSearchTap(item)}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={`Saved search: ${item.name}`}
      >
        <View className="flex-row items-start justify-between">
          <View className="flex-1 mr-3">
            <Text className="text-base font-semibold text-gray-900 mb-1">
              {item.name}
            </Text>
            <Text className="text-sm text-gray-500" numberOfLines={2}>
              {summary}
            </Text>
            <Text className="text-xs text-gray-400 mt-1">
              {item.country_code}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => remove.mutate(item.id)}
            className="w-8 h-8 items-center justify-center rounded-full bg-red-50"
            accessibilityRole="button"
            accessibilityLabel={`Delete ${item.name}`}
            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          >
            <Text className="text-red-500 text-base">{'\uD83D\uDDD1\uFE0F'}</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }

  function keyExtractor(item: SavedSearchResponse) {
    return String(item.id);
  }

  if (list.isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center px-4 pt-4 pb-3 bg-white border-b border-gray-100">
        <Text className="text-2xl font-bold text-gray-900 flex-1">
          Saved Searches
        </Text>
        <TouchableOpacity
          onPress={() => setSheetVisible(true)}
          className="bg-primary-500 px-3 py-2 rounded-lg flex-row items-center gap-1"
          accessibilityRole="button"
          accessibilityLabel="Save new search"
        >
          <Text className="text-white text-lg">+</Text>
          <Text className="text-white text-sm font-semibold">New</Text>
        </TouchableOpacity>
      </View>

      <FlatList<SavedSearchResponse>
        data={searches}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={{ paddingTop: 12, paddingBottom: 24, flexGrow: 1 }}
        ListEmptyComponent={
          <EmptyState
            title="No saved searches yet"
            subtitle="Save your current search to get notified when new homes match."
            icon={'\uD83D\uDD14'}
            action={{
              label: 'Go to Search',
              onPress: () => router.push('/(tabs)/search'),
            }}
          />
        }
        refreshControl={
          <RefreshControl
            refreshing={list.isRefetching && !list.isLoading}
            onRefresh={() => void list.refetch()}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      <SaveSearchSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
      />
    </SafeAreaView>
  );
}
