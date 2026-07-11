import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  type ListRenderItemInfo,
} from 'react-native';
import { router } from 'expo-router';
import { Bell } from 'lucide-react-native';
import { useSavedSearches } from '@/hooks/useSavedSearches';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useSearchStore } from '@/lib/stores/search.store';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { SaveSearchSheet } from '@/components/search/SaveSearchSheet';
import { Icon } from '@/components/ui/Icon';
import { colors, radius, fontWeight, shadows } from '@/constants/theme';
import type { SavedSearchResponse } from '@/lib/types/saved_search';

function buildFilterSummary(filters: Record<string, unknown>): string {
  const parts: string[] = [];
  if (filters.city) parts.push(String(filters.city));
  if (filters.listing_type) parts.push(String(filters.listing_type));
  if (filters.property_type) parts.push(String(filters.property_type));
  if (filters.min_price != null || filters.max_price != null) {
    const min = filters.min_price != null ? String(filters.min_price) : '0';
    const max = filters.max_price != null ? String(filters.max_price) : '∞';
    parts.push(`${min}–${max}`);
  }
  if (filters.min_bedrooms != null) {
    parts.push(`${String(filters.min_bedrooms)}+ beds`);
  }
  return parts.length > 0 ? parts.join(' · ') : 'All properties';
}

export default function UpdatesScreen() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const setFilters = useSearchStore((s) => s.setFilters);
  const { list, remove } = useSavedSearches();
  const [sheetVisible, setSheetVisible] = useState(false);

  // Auth gate
  if (!accessToken) {
    return (
      <SafeAreaView style={styles.authGate}>
        <Icon name="bell" size={40} color={colors.textTertiary} />
        <Text style={styles.authTitle}>Sign in to view saved searches</Text>
        <Text style={styles.authSubtitle}>
          Save your searches and get notified when new homes match.
        </Text>
        <TouchableOpacity
          style={styles.authButton}
          onPress={() => router.push('/(auth)/welcome')}
          accessibilityRole="button"
          accessibilityLabel="Sign in"
        >
          <Text style={styles.authButtonText}>Sign In</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const searches = list.data?.items ?? [];

  function handleSearchTap(item: SavedSearchResponse) {
    setFilters(item.filters as Parameters<typeof setFilters>[0]);
    router.push('/(tabs)/search');
  }

  function renderItem({ item }: ListRenderItemInfo<SavedSearchResponse>) {
    const filters = item.filters as Record<string, unknown>;
    const summary = buildFilterSummary(filters);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleSearchTap(item)}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={`Saved search: ${item.name}`}
      >
        <View style={styles.cardRow}>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardSummary} numberOfLines={2}>
              {summary}
            </Text>
            <Text style={styles.cardCountry}>{item.country_code}</Text>
          </View>
          <TouchableOpacity
            onPress={() => remove.mutate(item.id)}
            style={styles.deleteButton}
            accessibilityRole="button"
            accessibilityLabel={`Delete ${item.name}`}
            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          >
            <Icon name="x" size={16} color={colors.error} />
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
      <SafeAreaView style={styles.loadingContainer}>
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Saved Searches</Text>
        <TouchableOpacity
          onPress={() => setSheetVisible(true)}
          style={styles.newButton}
          accessibilityRole="button"
          accessibilityLabel="Save new search"
        >
          <Icon name="plus" size={16} color={colors.textOnBrand} />
          <Text style={styles.newButtonText}>New</Text>
        </TouchableOpacity>
      </View>

      <FlatList<SavedSearchResponse>
        data={searches}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            title="No saved searches yet"
            subtitle="Save your current search to get notified when new homes match."
            icon={<Bell size={48} color={colors.textTertiary} />}
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

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  authGate: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 24,
  },
  authTitle: {
    fontSize: 20,
    fontWeight: fontWeight.bold,
    color: '#111827',
    marginBottom: 8,
    marginTop: 16,
    textAlign: 'center',
  },
  authSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  authButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: radius.md,
  },
  authButtonText: {
    color: colors.textOnBrand,
    fontWeight: fontWeight.semibold,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: fontWeight.bold,
    color: '#111827',
    flex: 1,
  },
  newButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  newButtonText: {
    color: colors.textOnBrand,
    fontSize: 14,
    fontWeight: fontWeight.semibold,
  },
  listContent: {
    paddingTop: 12,
    paddingBottom: 24,
    flexGrow: 1,
  },
  card: {
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: radius.xl2,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  cardContent: {
    flex: 1,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: fontWeight.semibold,
    color: '#111827',
    marginBottom: 4,
  },
  cardSummary: {
    fontSize: 14,
    color: '#6b7280',
  },
  cardCountry: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  deleteButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.errorBg,
  },
});
