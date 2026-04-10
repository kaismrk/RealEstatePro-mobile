import { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useFavorites } from '@/hooks/useFavorites';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { PropertySchema } from '@/lib/types/property';

interface CompareField {
  label: string;
  getValue: (p: PropertySchema) => string;
}

const COMPARE_FIELDS: CompareField[] = [
  {
    label: 'Price',
    getValue: (p) =>
      p.price != null ? p.price.toLocaleString() : '—',
  },
  {
    label: 'Type',
    getValue: (p) => p.property_type ?? '—',
  },
  {
    label: 'Listing',
    getValue: (p) => p.listing_type ?? '—',
  },
  {
    label: 'Beds',
    getValue: (p) =>
      p.bedrooms != null ? String(p.bedrooms) : '—',
  },
  {
    label: 'Baths',
    getValue: (p) =>
      p.bathrooms != null ? String(p.bathrooms) : '—',
  },
  {
    label: 'Area (m\u00B2)',
    getValue: (p) =>
      p.area_sqm != null ? String(p.area_sqm) : '—',
  },
  {
    label: 'City',
    getValue: (p) => p.city ?? '—',
  },
  {
    label: 'Floor',
    getValue: (p) =>
      p.floor != null ? String(p.floor) : '—',
  },
  {
    label: 'Pool',
    getValue: (p) =>
      p.swimming_pool != null
        ? p.swimming_pool
          ? 'Yes'
          : 'No'
        : '—',
  },
  {
    label: 'Garden',
    getValue: (p) =>
      p.garden != null ? (p.garden ? 'Yes' : 'No') : '—',
  },
  {
    label: 'Balcony',
    getValue: (p) =>
      p.balcony != null ? (p.balcony ? 'Yes' : 'No') : '—',
  },
  {
    label: 'Parking',
    getValue: (p) =>
      p.parking_spots != null ? String(p.parking_spots) : '—',
  },
  {
    label: 'Energy',
    getValue: (p) => p.energy_rating ?? '—',
  },
];

const COLUMN_WIDTH = 140;
const LABEL_WIDTH = 100;

export default function CompareScreen() {
  const { ids } = useLocalSearchParams<{ ids?: string }>();
  const { list } = useFavorites();

  const selectedProperties = useMemo<PropertySchema[]>(() => {
    if (!ids || !list.data) return [];
    const idSet = new Set(
      ids.split(',').map((s) => parseInt(s, 10)).filter((n) => !isNaN(n))
    );
    return list.data.items
      .filter((f) => idSet.has(f.property_id))
      .map((f) => f.property);
  }, [ids, list.data]);

  if (list.isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  if (selectedProperties.length < 2) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white px-6">
        <Text className="text-xl font-bold text-gray-900 mb-2">
          Select at least 2 homes
        </Text>
        <Text className="text-sm text-gray-500 text-center mb-6">
          Go back and select 2–5 homes to compare them.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-blue-600 px-6 py-3 rounded-xl"
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-4 pt-4 pb-3 border-b border-gray-100">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mr-3 w-9 h-9 items-center justify-center rounded-full bg-gray-100"
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <Text className="text-base">{'\u2715'}</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900">
          Compare {selectedProperties.length} Homes
        </Text>
      </View>

      {/* Comparison table — horizontally scrollable */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator
        className="flex-1"
      >
        <View>
          {/* Property title row */}
          <View className="flex-row border-b border-gray-200 bg-gray-50">
            <View
              style={{ width: LABEL_WIDTH }}
              className="px-3 py-3 justify-center"
            >
              <Text className="text-xs font-semibold text-gray-400 uppercase">
                Property
              </Text>
            </View>
            {selectedProperties.map((p) => (
              <View
                key={p.id}
                style={{ width: COLUMN_WIDTH }}
                className="px-3 py-3 border-l border-gray-100"
              >
                <Text
                  className="text-sm font-semibold text-gray-900"
                  numberOfLines={2}
                >
                  {p.title}
                </Text>
                <Text className="text-xs text-gray-500 mt-0.5" numberOfLines={1}>
                  {p.city}
                </Text>
              </View>
            ))}
          </View>

          {/* Data rows */}
          {COMPARE_FIELDS.map((field, rowIndex) => (
            <View
              key={field.label}
              className={`flex-row border-b border-gray-100 ${
                rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
              }`}
            >
              {/* Row label */}
              <View
                style={{ width: LABEL_WIDTH }}
                className="px-3 py-3 justify-center"
              >
                <Text className="text-xs font-medium text-gray-500">
                  {field.label}
                </Text>
              </View>

              {/* Property values */}
              {selectedProperties.map((p) => (
                <View
                  key={p.id}
                  style={{ width: COLUMN_WIDTH }}
                  className="px-3 py-3 justify-center border-l border-gray-100"
                >
                  <Text className="text-sm text-gray-800">
                    {field.getValue(p)}
                  </Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
