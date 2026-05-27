import { ScrollView, TouchableOpacity, Text } from 'react-native';
import { useSearchStore } from '@/lib/stores/search.store';

const SORT_OPTIONS: { label: string; value: string }[] = [
  { label: 'Newest', value: 'date_desc' },
  { label: 'Oldest', value: 'date_asc' },
  { label: 'Price \u2191', value: 'price_asc' },
  { label: 'Price \u2193', value: 'price_desc' },
  { label: 'Area \u2191', value: 'area_asc' },
  { label: 'Area \u2193', value: 'area_desc' },
];

export function SortPicker() {
  const sortBy = useSearchStore((s) => s.sortBy);
  const setSortBy = useSearchStore((s) => s.setSortBy);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8, gap: 8 }}
    >
      {SORT_OPTIONS.map((option) => {
        const isSelected = sortBy === option.value;
        return (
          <TouchableOpacity
            key={option.value}
            onPress={() => setSortBy(option.value)}
            className={`rounded-full px-4 py-2 border ${
              isSelected
                ? 'bg-primary-500 border-primary-500'
                : 'bg-white border-gray-300'
            }`}
            accessibilityLabel={`Sort by ${option.label}`}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
          >
            <Text
              className={`text-sm font-medium ${
                isSelected ? 'text-white' : 'text-gray-700'
              }`}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
