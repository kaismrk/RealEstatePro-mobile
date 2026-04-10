import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useProperty } from '@/hooks/useProperty';
import { useUpdateProperty } from '@/hooks/useUpdateProperty';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/lib/stores/auth.store';
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

export default function EditPropertyScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const propertyId = Number(id);
  const { data: property, isLoading } = useProperty(id);
  const updateProperty = useUpdateProperty();
  const currentUser = useAuthStore((s) => s.user);

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [listingType, setListingType] = useState<ListingType>('sale');
  const [propertyType, setPropertyType] = useState<PropertyType>('apartment');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [areaSqm, setAreaSqm] = useState('');

  // Pre-fill from loaded property
  useEffect(() => {
    if (!property) return;
    setTitle(property.title ?? '');
    setPrice(property.price != null ? String(property.price) : '');
    setListingType((property.listing_type as ListingType) ?? 'sale');
    setPropertyType((property.property_type as PropertyType) ?? 'apartment');
    setCity(property.city ?? '');
    setAddress(property.address ?? '');
    setDescription(property.description ?? '');
    setBedrooms(property.bedrooms != null ? String(property.bedrooms) : '');
    setBathrooms(property.bathrooms != null ? String(property.bathrooms) : '');
    setAreaSqm(property.area_sqm != null ? String(property.area_sqm) : '');
  }, [property]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!property) {
    return (
      <View className="flex-1 bg-white items-center justify-center px-6">
        <Text className="text-lg font-semibold text-gray-900 mb-2">Property not found</Text>
        <Button onPress={() => router.back()} variant="secondary">
          Go Back
        </Button>
      </View>
    );
  }

  // Only owner can edit
  if (currentUser && property.owner_id !== currentUser.id) {
    return (
      <View className="flex-1 bg-white items-center justify-center px-6">
        <Text className="text-lg font-semibold text-gray-900 mb-2">Access denied</Text>
        <Button onPress={() => router.back()} variant="secondary">
          Go Back
        </Button>
      </View>
    );
  }

  function numOrNull(v: string): number | null {
    const n = Number(v);
    return v.trim() !== '' && !isNaN(n) ? n : null;
  }

  function handleSave() {
    if (!title.trim()) {
      Alert.alert('Validation', 'Title is required.');
      return;
    }
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      Alert.alert('Validation', 'A valid price is required.');
      return;
    }

    updateProperty.mutate(
      {
        id: propertyId,
        data: {
          title: title.trim(),
          price: Number(price),
          listing_type: listingType,
          property_type: propertyType,
          city: city.trim(),
          address: address.trim() || null,
          description: description.trim() || null,
          bedrooms: numOrNull(bedrooms),
          bathrooms: numOrNull(bathrooms),
          area_sqm: numOrNull(areaSqm),
        },
      },
      {
        onSuccess: () => {
          Alert.alert('Success', 'Your listing has been updated.', [
            { text: 'OK', onPress: () => router.back() },
          ]);
        },
        onError: (err) => {
          Alert.alert('Error', err.message ?? 'Failed to update listing.');
        },
      }
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="px-4 pt-14 pb-4 border-b border-gray-100 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Text className="text-blue-600 text-base">Cancel</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Edit Listing</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        {/* Listing Type */}
        <Text className="text-sm font-medium text-gray-700 mb-2">Listing Type</Text>
        <View className="flex-row gap-2 mb-4 flex-wrap">
          {LISTING_TYPES.map((lt) => (
            <TouchableOpacity
              key={lt.value}
              onPress={() => setListingType(lt.value)}
              className={`px-4 py-2 rounded-full border ${
                listingType === lt.value ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'
              }`}
            >
              <Text className={`text-sm ${listingType === lt.value ? 'text-white' : 'text-gray-700'}`}>
                {lt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Property Type */}
        <Text className="text-sm font-medium text-gray-700 mb-2">Property Type</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          <View className="flex-row gap-2">
            {PROPERTY_TYPES.map((pt) => (
              <TouchableOpacity
                key={pt.value}
                onPress={() => setPropertyType(pt.value)}
                className={`px-3 py-1.5 rounded-full border ${
                  propertyType === pt.value ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'
                }`}
              >
                <Text className={`text-sm ${propertyType === pt.value ? 'text-white' : 'text-gray-700'}`}>
                  {pt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <Input
          label="Title *"
          value={title}
          onChangeText={setTitle}
          placeholder="Listing title"
        />
        <Input
          label="Price *"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
          placeholder="0"
        />
        <Input
          label="City *"
          value={city}
          onChangeText={setCity}
          placeholder="e.g. Tunis"
        />
        <Input
          label="Address"
          value={address}
          onChangeText={setAddress}
          placeholder="Street address"
        />
        <Input
          label="Bedrooms"
          value={bedrooms}
          onChangeText={setBedrooms}
          keyboardType="numeric"
          placeholder="–"
        />
        <Input
          label="Bathrooms"
          value={bathrooms}
          onChangeText={setBathrooms}
          keyboardType="numeric"
          placeholder="–"
        />
        <Input
          label="Area (m²)"
          value={areaSqm}
          onChangeText={setAreaSqm}
          keyboardType="numeric"
          placeholder="–"
        />

        {/* Description */}
        <Text className="text-sm font-medium text-gray-700 mb-1">
          Description ({description.length}/5000)
        </Text>
        <TextInput
          value={description}
          onChangeText={(v) => v.length <= 5000 && setDescription(v)}
          placeholder="Describe the property..."
          placeholderTextColor="#9CA3AF"
          multiline
          numberOfLines={6}
          className="border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900 bg-white mb-4"
          style={{ minHeight: 120, textAlignVertical: 'top' }}
        />

        <View className="h-32" />
      </ScrollView>

      {/* Footer */}
      <View className="px-4 pb-8 pt-3 border-t border-gray-100 bg-white">
        <Button onPress={handleSave} loading={updateProperty.isPending} size="lg">
          Save Changes
        </Button>
      </View>
    </View>
  );
}
