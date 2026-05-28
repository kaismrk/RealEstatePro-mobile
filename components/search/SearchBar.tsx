import { useState, useEffect, useRef } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSearchStore } from '@/lib/stores/search.store';
import { Icon } from '@/components/ui/Icon';
import { colors, radius, fontWeight } from '@/constants/theme';

interface SearchBarProps {
  activeFilterCount?: number;
}

export function SearchBar({ activeFilterCount = 0 }: SearchBarProps) {
  const filters = useSearchStore((s) => s.filters);
  const setFilters = useSearchStore((s) => s.setFilters);
  const [localValue, setLocalValue] = useState(filters.q ?? '');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setLocalValue(filters.q ?? ''); }, [filters.q]);

  function handleChangeText(text: string) {
    setLocalValue(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setFilters({ q: text || undefined });
    }, 300);
  }

  function handleClear() {
    setLocalValue('');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setFilters({ q: undefined });
  }

  return (
    <View style={styles.row}>
      {/* Search input */}
      <View style={styles.inputWrap}>
        <Icon name="search" size={18} color={colors.textTertiary} />
        <TextInput
          style={styles.input}
          placeholder="Search properties..."
          placeholderTextColor={colors.textTertiary}
          value={localValue}
          onChangeText={handleChangeText}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel="Search properties"
        />
        {localValue.length > 0 && (
          <TouchableOpacity
            onPress={handleClear}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Clear search"
          >
            <Icon name="x" size={16} color={colors.textTertiary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filters button */}
      <TouchableOpacity
        onPress={() => router.push('/search/filters')}
        style={styles.filterBtn}
        accessibilityLabel={`Filters${activeFilterCount > 0 ? `, ${activeFilterCount} active` : ''}`}
      >
        <Icon name="sliders" size={16} color={colors.textPrimary} />
        <Text style={styles.filterLabel}>Filters</Text>
        {activeFilterCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{activeFilterCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
  },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSunken,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    padding: 0,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filterLabel: { fontSize: 14, fontWeight: fontWeight.semibold, color: colors.textPrimary },
  badge: {
    width: 18,
    height: 18,
    backgroundColor: colors.primary,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
  },
  badgeText: { fontSize: 10, color: '#fff', fontWeight: fontWeight.bold },
});
