import { useState, useEffect, useRef } from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import { router } from 'expo-router';
import { useSearchStore } from '@/lib/stores/search.store';
import { colors } from '@/constants/theme';

interface SearchBarProps {
  activeFilterCount?: number;
}

export function SearchBar({ activeFilterCount = 0 }: SearchBarProps) {
  const filters = useSearchStore((s) => s.filters);
  const setFilters = useSearchStore((s) => s.setFilters);
  const [localValue, setLocalValue] = useState(filters.q ?? '');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync local value when store resets
  useEffect(() => {
    setLocalValue(filters.q ?? '');
  }, [filters.q]);

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

  function handleFiltersPress() {
    router.push('/search/filters');
  }

  return (
    <View className="flex-row items-center px-4 py-2 gap-2">
      {/* Search input */}
      <View className="flex-1 flex-row items-center bg-gray-100 rounded-xl px-3 py-2 gap-2">
        <Text className="text-base">🔍</Text>
        <TextInput
          className="flex-1 text-base text-gray-900"
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
            accessibilityRole="button"
          >
            <Text className="text-base text-gray-400">✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filters button */}
      <TouchableOpacity
        onPress={handleFiltersPress}
        className="relative flex-row items-center bg-white border border-gray-300 rounded-xl px-3 py-2"
        accessibilityLabel={`Filters${activeFilterCount > 0 ? `, ${activeFilterCount} active` : ''}`}
        accessibilityRole="button"
      >
        <Text className="text-sm font-semibold text-gray-700">Filters</Text>
        {activeFilterCount > 0 && (
          <View className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-primary-500 rounded-full items-center justify-center">
            <Text className="text-xs text-white font-bold">{activeFilterCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}
