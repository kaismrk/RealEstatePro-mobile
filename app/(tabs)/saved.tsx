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
import { useFavorites } from '@/hooks/useFavorites';
import { useAuthStore } from '@/lib/stores/auth.store';
import { PropertyCard } from '@/components/property/PropertyCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import type { FavoriteResponse } from '@/lib/types/favorite';

export default function SavedScreen() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { list, remove } = useFavorites();
  const [compareMode, setCompareMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Auth gate — guests see sign-in prompt
  if (!accessToken) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white px-6">
        <Text className="text-4xl mb-4">{'\u2764\uFE0F'}</Text>
        <Text className="text-xl font-bold text-gray-900 mb-2 text-center">
          Sign in to view saved homes
        </Text>
        <Text className="text-sm text-gray-500 text-center mb-6">
          Save properties you love and access them anytime.
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

  const favorites = list.data?.items ?? [];

  function toggleSelect(propertyId: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(propertyId)) {
        next.delete(propertyId);
      } else {
        if (next.size < 5) {
          next.add(propertyId);
        }
      }
      return next;
    });
  }

  function handleComparePress() {
    if (compareMode && selectedIds.size >= 2) {
      const ids = Array.from(selectedIds).join(',');
      router.push(`/saved/compare?ids=${ids}`);
      return;
    }
    setCompareMode((prev) => !prev);
    if (compareMode) {
      setSelectedIds(new Set());
    }
  }

  function renderItem({ item }: ListRenderItemInfo<FavoriteResponse>) {
    const isSelected = selectedIds.has(item.property_id);

    return (
      <View className="relative">
        {compareMode && (
          <TouchableOpacity
            onPress={() => toggleSelect(item.property_id)}
            className={`absolute top-3 left-5 z-10 w-6 h-6 rounded-full border-2 items-center justify-center ${
              isSelected
                ? 'bg-primary-500 border-primary-500'
                : 'bg-white border-gray-400'
            }`}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: isSelected }}
            accessibilityLabel={`Select ${item.property.title}`}
          >
            {isSelected && (
              <Text className="text-white text-xs font-bold">{'\u2713'}</Text>
            )}
          </TouchableOpacity>
        )}
        <View className={compareMode && isSelected ? 'opacity-90' : ''}>
          <PropertyCard property={item.property} compact />
        </View>
        {!compareMode && (
          <TouchableOpacity
            onPress={() => remove.mutate(item.property_id)}
            className="absolute top-3 right-5 bg-red-100 rounded-full px-3 py-1"
            accessibilityRole="button"
            accessibilityLabel="Remove from saved"
          >
            <Text className="text-red-600 text-xs font-semibold">Remove</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  function keyExtractor(item: FavoriteResponse) {
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
          Saved Homes
        </Text>
        {favorites.length > 0 && (
          <TouchableOpacity
            onPress={handleComparePress}
            className={`px-3 py-2 rounded-lg ${
              compareMode && selectedIds.size >= 2
                ? 'bg-primary-500'
                : compareMode
                ? 'bg-gray-200'
                : 'bg-gray-100'
            }`}
            accessibilityRole="button"
            accessibilityLabel={
              compareMode && selectedIds.size >= 2
                ? `Compare ${selectedIds.size} homes`
                : compareMode
                ? 'Cancel compare'
                : 'Compare homes'
            }
          >
            <Text
              className={`text-sm font-semibold ${
                compareMode && selectedIds.size >= 2
                  ? 'text-white'
                  : 'text-gray-700'
              }`}
            >
              {compareMode && selectedIds.size >= 2
                ? `Compare ${selectedIds.size}`
                : compareMode
                ? 'Cancel'
                : 'Compare'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {compareMode && (
        <View className="px-4 py-2 bg-primary-50 border-b border-primary-100">
          <Text className="text-sm text-primary-700">
            Select 2–5 properties to compare. {selectedIds.size} selected.
          </Text>
        </View>
      )}

      <FlatList<FavoriteResponse>
        data={favorites}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 24, flexGrow: 1 }}
        ListEmptyComponent={
          <EmptyState
            title="No saved homes yet"
            subtitle="Tap the heart on any listing to save it here"
            icon={'\u2764\uFE0F'}
            action={{
              label: 'Start searching',
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
    </SafeAreaView>
  );
}
