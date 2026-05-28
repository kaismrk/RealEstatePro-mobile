import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useSearchStore } from '@/lib/stores/search.store';
import { colors, radius, fontWeight } from '@/constants/theme';

const SORT_OPTIONS: { label: string; value: string }[] = [
  { label: 'Newest',   value: 'date_desc' },
  { label: 'Oldest',   value: 'date_asc' },
  { label: 'Price ↑',  value: 'price_asc' },
  { label: 'Price ↓',  value: 'price_desc' },
  { label: 'Area ↑',   value: 'area_asc' },
  { label: 'Area ↓',   value: 'area_desc' },
];

export function SortPicker() {
  const sortBy  = useSearchStore((s) => s.sortBy);
  const setSortBy = useSearchStore((s) => s.setSortBy);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {SORT_OPTIONS.map((opt) => {
        const active = sortBy === opt.value;
        return (
          <TouchableOpacity
            key={opt.value}
            onPress={() => setSortBy(opt.value)}
            style={[styles.chip, active ? styles.chipActive : styles.chipIdle]}
            activeOpacity={0.8}
            accessibilityLabel={`Sort by ${opt.label}`}
            accessibilityState={{ selected: active }}
          >
            <Text style={[styles.label, active ? styles.labelActive : styles.labelIdle]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  chip: {
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderWidth: 1.5,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipIdle:   { backgroundColor: colors.surface, borderColor: colors.border },
  label: { fontSize: 13, fontWeight: fontWeight.medium },
  labelActive: { color: colors.textOnBrand },
  labelIdle:   { color: colors.textPrimary },
});
