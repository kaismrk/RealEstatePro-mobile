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
import { Heart } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuthStore } from '@/lib/stores/auth.store';
import { PropertyCard } from '@/components/property/PropertyCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { Icon } from '@/components/ui/Icon';
import type { FavoriteResponse } from '@/lib/types/favorite';
import { colors, fontWeight, radius } from '@/constants/theme';

function GuestPrompt() {
  const { t } = useTranslation();
  return (
    <SafeAreaView style={styles.safe}>
      <EmptyState
        title={t('saved.guest.title')}
        subtitle={t('saved.guest.subtitle')}
        icon={<Heart size={48} color={colors.heartRed} />}
        action={{ label: t('common.signIn'), onPress: () => router.push('/(auth)/login') }}
      />
    </SafeAreaView>
  );
}

export default function SavedScreen() {
  const { t } = useTranslation();
  const accessToken = useAuthStore((s) => s.accessToken);
  const { list, remove } = useFavorites();
  const [compareMode, setCompareMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  if (!accessToken) return <GuestPrompt />;

  const favorites = list.data?.items ?? [];

  function toggleSelect(propertyId: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(propertyId)) { next.delete(propertyId); }
      else if (next.size < 5) { next.add(propertyId); }
      return next;
    });
  }

  function handleCompare() {
    if (compareMode && selectedIds.size >= 2) {
      router.push(`/saved/compare?ids=${Array.from(selectedIds).join(',')}`);
      return;
    }
    if (compareMode) setSelectedIds(new Set());
    setCompareMode((p) => !p);
  }

  function renderItem({ item }: ListRenderItemInfo<FavoriteResponse>) {
    const isSelected = selectedIds.has(item.property_id);
    return (
      <View style={styles.itemWrap}>
        {compareMode && (
          <TouchableOpacity
            onPress={() => toggleSelect(item.property_id)}
            style={[styles.checkbox, isSelected && styles.checkboxChecked]}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: isSelected }}
          >
            {isSelected && <Icon name="check" size={12} color="#fff" strokeWidth={3} />}
          </TouchableOpacity>
        )}
        <PropertyCard property={item.property} compact />
        {!compareMode && (
          <TouchableOpacity
            onPress={() => remove.mutate(item.property_id)}
            style={styles.removeBtn}
            accessibilityLabel={t('saved.removeLabel')}
          >
            <Text style={styles.removeBtnText}>{t('saved.removeButton')}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (list.isLoading) {
    return (
      <SafeAreaView style={[styles.safe, styles.center]}>
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('saved.header.title')}</Text>
        {favorites.length > 0 && (
          <TouchableOpacity
            onPress={handleCompare}
            style={[
              styles.compareBtn,
              compareMode && selectedIds.size >= 2 ? styles.compareBtnActive : null,
            ]}
          >
            <Text
              style={[
                styles.compareBtnLabel,
                compareMode && selectedIds.size >= 2 ? styles.compareBtnLabelActive : null,
              ]}
            >
              {compareMode && selectedIds.size >= 2
                ? t('saved.compare.compareCount', { count: selectedIds.size })
                : compareMode
                ? t('common.cancel')
                : t('saved.compare.button')}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {compareMode && (
        <View style={styles.compareHint}>
          <Text style={styles.compareHintText}>
            {t('saved.compare.hint', { count: selectedIds.size })}
          </Text>
        </View>
      )}

      <FlatList<FavoriteResponse>
        data={favorites}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 24, flexGrow: 1 }}
        ListEmptyComponent={
          <EmptyState
            title={t('saved.empty.title')}
            subtitle={t('saved.empty.subtitle')}
            icon={<Heart size={48} color={colors.heartRed} strokeWidth={1.5} />}
            action={{ label: t('saved.empty.action'), onPress: () => router.push('/(tabs)/search') }}
          />
        }
        refreshControl={
          <RefreshControl
            refreshing={list.isRefetching && !list.isLoading}
            onRefresh={() => void list.refetch()}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.background },
  center: { alignItems: 'center', justifyContent: 'center' },
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
  headerTitle: { flex: 1, fontSize: 22, fontWeight: fontWeight.bold, color: colors.textPrimary },
  compareBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.sm,
    backgroundColor: colors.neutral100,
  },
  compareBtnActive: { backgroundColor: colors.primary },
  compareBtnLabel: { fontSize: 13, fontWeight: fontWeight.semibold, color: colors.textPrimary },
  compareBtnLabelActive: { color: colors.textOnBrand },
  compareHint: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.primaryLight,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderBrand,
  },
  compareHintText: { fontSize: 13, color: colors.primaryDark },
  itemWrap: { position: 'relative' },
  checkbox: {
    position: 'absolute',
    top: 12,
    left: 22,
    zIndex: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.neutral400,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  removeBtn: {
    position: 'absolute',
    top: 12,
    right: 22,
    backgroundColor: colors.errorBg,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  removeBtnText: { fontSize: 12, fontWeight: fontWeight.semibold, color: colors.error },
});
