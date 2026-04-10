import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { useUIStore } from '@/lib/stores/ui.store';
import { useAuthStore } from '@/lib/stores/auth.store';
import { Button } from '@/components/ui/Button';
import type { ListingType, PropertyType } from '@/lib/types/property';

const LISTING_TYPES: { value: ListingType; label: string }[] = [
  { value: 'sale', label: 'For Sale' },
  { value: 'rent', label: 'For Rent' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'land', label: 'Land' },
];

const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'villa', label: 'Villa' },
  { value: 'house', label: 'House' },
  { value: 'studio', label: 'Studio' },
  { value: 'land', label: 'Land' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'office', label: 'Office' },
  { value: 'shop', label: 'Shop' },
  { value: 'warehouse', label: 'Warehouse' },
  { value: 'farmhouse', label: 'Farmhouse' },
  { value: 'chalet', label: 'Chalet' },
  { value: 'penthouse', label: 'Penthouse' },
  { value: 'duplex', label: 'Duplex' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'building', label: 'Building' },
];

export default function CreateStep1() {
  const draft = useUIStore((s) => s.createListingDraft);
  const setDraft = useUIStore((s) => s.setDraft);
  const countryCode = useAuthStore((s) => s.countryCode);

  const [listingType, setListingType] = useState<ListingType>(
    (draft?.listing_type as ListingType) ?? 'sale'
  );
  const [propertyType, setPropertyType] = useState<PropertyType | null>(
    (draft?.property_type as PropertyType) ?? null
  );
  const [title, setTitle] = useState<string>((draft?.title as string) ?? '');
  const [price, setPrice] = useState<string>(
    draft?.price != null ? String(draft.price) : ''
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!price || isNaN(Number(price)) || Number(price) <= 0)
      newErrors.price = 'A valid price is required';
    if (!propertyType) newErrors.property_type = 'Select a property type';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleNext() {
    if (!validate()) return;
    setDraft({
      listing_type: listingType,
      property_type: propertyType as string,
      title: title.trim(),
      price: Number(price),
      country_code: countryCode,
    });
    router.push('/listings/create/step-2');
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="px-4 pt-14 pb-4 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mb-2">
          <Text className="text-blue-600 text-sm">Cancel</Text>
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-gray-900">Create Listing</Text>
        <Text className="text-sm text-gray-500 mt-1">Step 1 of 5 — Basic Info</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        {/* Listing Type */}
        <Text className="text-base font-semibold text-gray-800 mb-2">
          Listing Type <Text className="text-red-500">*</Text>
        </Text>
        <View className="flex-row gap-2 mb-5 flex-wrap">
          {LISTING_TYPES.map((lt) => (
            <TouchableOpacity
              key={lt.value}
              onPress={() => setListingType(lt.value)}
              className={`px-4 py-2 rounded-full border ${
                listingType === lt.value
                  ? 'bg-blue-600 border-blue-600'
                  : 'bg-white border-gray-300'
              }`}
              accessibilityRole="radio"
              accessibilityState={{ checked: listingType === lt.value }}
            >
              <Text
                className={`text-sm font-medium ${
                  listingType === lt.value ? 'text-white' : 'text-gray-700'
                }`}
              >
                {lt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Property Type */}
        <Text className="text-base font-semibold text-gray-800 mb-2">
          Property Type <Text className="text-red-500">*</Text>
        </Text>
        <View className="flex-row flex-wrap gap-2 mb-1">
          {PROPERTY_TYPES.map((pt) => (
            <TouchableOpacity
              key={pt.value}
              onPress={() => setPropertyType(pt.value)}
              className={`px-3 py-1.5 rounded-full border ${
                propertyType === pt.value
                  ? 'bg-blue-600 border-blue-600'
                  : 'bg-white border-gray-300'
              }`}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: propertyType === pt.value }}
            >
              <Text
                className={`text-sm ${
                  propertyType === pt.value ? 'text-white' : 'text-gray-700'
                }`}
              >
                {pt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.property_type ? (
          <Text className="text-red-500 text-xs mb-3">{errors.property_type}</Text>
        ) : (
          <View className="mb-5" />
        )}

        {/* Title */}
        <Text className="text-base font-semibold text-gray-800 mb-1">
          Title <Text className="text-red-500">*</Text>
        </Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Spacious 3-bedroom apartment in city center"
          placeholderTextColor="#9CA3AF"
          className={`border rounded-xl px-4 py-3 text-base text-gray-900 bg-white mb-1 ${
            errors.title ? 'border-red-500' : 'border-gray-300'
          }`}
          accessibilityLabel="Listing title"
        />
        {errors.title ? (
          <Text className="text-red-500 text-xs mb-4">{errors.title}</Text>
        ) : (
          <View className="mb-4" />
        )}

        {/* Price */}
        <Text className="text-base font-semibold text-gray-800 mb-1">
          Price <Text className="text-red-500">*</Text>
        </Text>
        <TextInput
          value={price}
          onChangeText={setPrice}
          placeholder="0"
          placeholderTextColor="#9CA3AF"
          keyboardType="numeric"
          className={`border rounded-xl px-4 py-3 text-base text-gray-900 bg-white mb-1 ${
            errors.price ? 'border-red-500' : 'border-gray-300'
          }`}
          accessibilityLabel="Price"
        />
        {errors.price ? (
          <Text className="text-red-500 text-xs mb-4">{errors.price}</Text>
        ) : (
          <View className="mb-4" />
        )}

        <View className="h-32" />
      </ScrollView>

      {/* Footer */}
      <View className="px-4 pb-8 pt-3 border-t border-gray-100 bg-white">
        <Button onPress={handleNext} size="lg">
          Next: Location
        </Button>
      </View>
    </View>
  );
}
