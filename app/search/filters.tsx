import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { useSearchStore, type PropertyFilters } from '@/lib/stores/search.store';
import { colors } from '@/constants/theme';

const LISTING_TYPES = [
  { label: 'For Sale', value: 'sale' },
  { label: 'For Rent', value: 'rent' },
  { label: 'Commercial', value: 'commercial' },
  { label: 'Land', value: 'land' },
];

const PROPERTY_TYPES = [
  'apartment', 'villa', 'house', 'studio', 'land', 'commercial',
  'office', 'shop', 'warehouse', 'farmhouse', 'chalet', 'penthouse',
  'duplex', 'townhouse', 'building',
];

const ENERGY_RATINGS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

const AMENITY_FIELDS: { label: string; key: keyof PropertyFilters }[] = [
  { label: 'Pool', key: 'has_pool' },
  { label: 'Garden', key: 'has_garden' },
  { label: 'Balcony', key: 'has_balcony' },
  { label: 'Elevator', key: 'has_elevator' },
  { label: 'Parking', key: 'has_parking' },
  { label: 'Garage', key: 'has_garage' },
];

function SectionTitle({ children }: { children: string }) {
  return (
    <Text className="text-base font-bold text-gray-800 mb-3">{children}</Text>
  );
}

export default function FiltersScreen() {
  const storeFilters = useSearchStore((s) => s.filters);
  const setStoreFilters = useSearchStore((s) => s.setFilters);
  const resetStoreFilters = useSearchStore((s) => s.resetFilters);

  const [local, setLocal] = useState<PropertyFilters>({ ...storeFilters });

  function setField<K extends keyof PropertyFilters>(key: K, value: PropertyFilters[K]) {
    setLocal((prev) => ({ ...prev, [key]: value }));
  }

  function handleApply() {
    setStoreFilters(local);
    router.back();
  }

  function handleReset() {
    resetStoreFilters();
    router.back();
  }

  function togglePropertyType(type: string) {
    const current = local.property_type ?? '';
    setField('property_type', current === type ? undefined : type);
  }

  function toggleEnergyRating(rating: string) {
    const current = local.energy_rating ?? '';
    setField('energy_rating', current === rating ? undefined : rating);
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Transaction type */}
        <View className="mb-6">
          <SectionTitle>Transaction Type</SectionTitle>
          <View className="flex-row flex-wrap gap-2">
            {LISTING_TYPES.map((lt) => {
              const isSelected = local.listing_type === lt.value;
              return (
                <TouchableOpacity
                  key={lt.value}
                  onPress={() =>
                    setField('listing_type', isSelected ? undefined : lt.value)
                  }
                  className={`rounded-full px-4 py-2 border ${
                    isSelected
                      ? 'bg-blue-600 border-blue-600'
                      : 'bg-white border-gray-300'
                  }`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                >
                  <Text
                    className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-700'}`}
                  >
                    {lt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Price range */}
        <View className="mb-6">
          <SectionTitle>Price Range</SectionTitle>
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text className="text-xs text-gray-500 mb-1">Min price</Text>
              <TextInput
                className="border border-gray-300 rounded-xl px-3 py-2 text-base text-gray-900"
                placeholder="0"
                keyboardType="numeric"
                value={local.min_price != null ? String(local.min_price) : ''}
                onChangeText={(t) =>
                  setField('min_price', t ? Number(t) : undefined)
                }
                accessibilityLabel="Minimum price"
              />
            </View>
            <View className="flex-1">
              <Text className="text-xs text-gray-500 mb-1">Max price</Text>
              <TextInput
                className="border border-gray-300 rounded-xl px-3 py-2 text-base text-gray-900"
                placeholder="Any"
                keyboardType="numeric"
                value={local.max_price != null ? String(local.max_price) : ''}
                onChangeText={(t) =>
                  setField('max_price', t ? Number(t) : undefined)
                }
                accessibilityLabel="Maximum price"
              />
            </View>
          </View>
        </View>

        {/* Bedrooms */}
        <View className="mb-6">
          <SectionTitle>Bedrooms</SectionTitle>
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text className="text-xs text-gray-500 mb-1">Min</Text>
              <TextInput
                className="border border-gray-300 rounded-xl px-3 py-2 text-base text-gray-900"
                placeholder="0"
                keyboardType="numeric"
                value={local.min_bedrooms != null ? String(local.min_bedrooms) : ''}
                onChangeText={(t) =>
                  setField('min_bedrooms', t ? Number(t) : undefined)
                }
                accessibilityLabel="Minimum bedrooms"
              />
            </View>
            <View className="flex-1">
              <Text className="text-xs text-gray-500 mb-1">Max</Text>
              <TextInput
                className="border border-gray-300 rounded-xl px-3 py-2 text-base text-gray-900"
                placeholder="Any"
                keyboardType="numeric"
                value={local.max_bedrooms != null ? String(local.max_bedrooms) : ''}
                onChangeText={(t) =>
                  setField('max_bedrooms', t ? Number(t) : undefined)
                }
                accessibilityLabel="Maximum bedrooms"
              />
            </View>
          </View>
        </View>

        {/* Area */}
        <View className="mb-6">
          <SectionTitle>Area (m²)</SectionTitle>
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text className="text-xs text-gray-500 mb-1">Min area</Text>
              <TextInput
                className="border border-gray-300 rounded-xl px-3 py-2 text-base text-gray-900"
                placeholder="0"
                keyboardType="numeric"
                value={local.min_area != null ? String(local.min_area) : ''}
                onChangeText={(t) =>
                  setField('min_area', t ? Number(t) : undefined)
                }
                accessibilityLabel="Minimum area"
              />
            </View>
            <View className="flex-1">
              <Text className="text-xs text-gray-500 mb-1">Max area</Text>
              <TextInput
                className="border border-gray-300 rounded-xl px-3 py-2 text-base text-gray-900"
                placeholder="Any"
                keyboardType="numeric"
                value={local.max_area != null ? String(local.max_area) : ''}
                onChangeText={(t) =>
                  setField('max_area', t ? Number(t) : undefined)
                }
                accessibilityLabel="Maximum area"
              />
            </View>
          </View>
        </View>

        {/* Property type */}
        <View className="mb-6">
          <SectionTitle>Property Type</SectionTitle>
          <View className="flex-row flex-wrap gap-2">
            {PROPERTY_TYPES.map((pt) => {
              const isSelected = local.property_type === pt;
              return (
                <TouchableOpacity
                  key={pt}
                  onPress={() => togglePropertyType(pt)}
                  className={`rounded-full px-3 py-1.5 border ${
                    isSelected
                      ? 'bg-blue-600 border-blue-600'
                      : 'bg-white border-gray-300'
                  }`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                >
                  <Text
                    className={`text-sm capitalize ${isSelected ? 'text-white font-medium' : 'text-gray-700'}`}
                  >
                    {pt}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Amenities */}
        <View className="mb-6">
          <SectionTitle>Amenities</SectionTitle>
          {AMENITY_FIELDS.map(({ label, key }) => (
            <View
              key={key}
              className="flex-row items-center justify-between py-2 border-b border-gray-100"
            >
              <Text className="text-base text-gray-700">{label}</Text>
              <Switch
                value={!!local[key]}
                onValueChange={(v) => setField(key, v || undefined)}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#ffffff"
                accessibilityLabel={label}
              />
            </View>
          ))}
        </View>

        {/* Energy rating */}
        <View className="mb-6">
          <SectionTitle>Energy Rating</SectionTitle>
          <View className="flex-row flex-wrap gap-2">
            {ENERGY_RATINGS.map((rating) => {
              const isSelected = local.energy_rating === rating;
              return (
                <TouchableOpacity
                  key={rating}
                  onPress={() => toggleEnergyRating(rating)}
                  className={`w-10 h-10 rounded-lg items-center justify-center border ${
                    isSelected
                      ? 'bg-blue-600 border-blue-600'
                      : 'bg-white border-gray-300'
                  }`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                >
                  <Text
                    className={`text-base font-bold ${isSelected ? 'text-white' : 'text-gray-700'}`}
                  >
                    {rating}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Location — placeholder */}
        <View className="mb-6">
          <SectionTitle>Location</SectionTitle>
          <View className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <Text className="text-sm text-gray-500 text-center">
              Region / City filters coming in Phase F10
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer actions */}
      <View className="absolute bottom-0 left-0 right-0 flex-row items-center px-4 py-4 bg-white border-t border-gray-200 gap-3">
        <TouchableOpacity
          onPress={handleReset}
          className="flex-1 py-3 rounded-xl border border-gray-300 items-center"
          accessibilityRole="button"
          accessibilityLabel="Reset all filters"
        >
          <Text className="text-base font-semibold text-gray-600">Reset</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleApply}
          className="flex-2 flex-1 py-3 rounded-xl bg-blue-600 items-center"
          accessibilityRole="button"
          accessibilityLabel="Apply filters"
        >
          <Text className="text-base font-semibold text-white">Apply Filters</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
