import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { useUIStore } from '@/lib/stores/ui.store';
import { Button } from '@/components/ui/Button';

const DISCLOSURE_LEVELS = [
  { value: 'exact', label: 'Exact address (shown on map)' },
  { value: 'approximate', label: 'Approximate location' },
  { value: 'city_only', label: 'City only' },
];

export default function CreateStep2() {
  const draft = useUIStore((s) => s.createListingDraft);
  const setDraft = useUIStore((s) => s.setDraft);

  const [city, setCity] = useState<string>((draft?.city as string) ?? '');
  const [address, setAddress] = useState<string>((draft?.address as string) ?? '');
  const [zipCode, setZipCode] = useState<string>((draft?.zip_code as string) ?? '');
  const [disclosureLevel, setDisclosureLevel] = useState<string>(
    (draft?.address_disclosure_level as string) ?? 'approximate'
  );
  const [locating, setLocating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!address.trim()) newErrors.address = 'Address is required';
    if (!city.trim()) newErrors.city = 'City is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleUseLocation() {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to use this feature.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const [geocode] = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      if (geocode) {
        if (geocode.city) setCity(geocode.city);
        const parts = [geocode.streetNumber, geocode.street].filter(Boolean);
        if (parts.length > 0) setAddress(parts.join(' '));
        if (geocode.postalCode) setZipCode(geocode.postalCode);
      }
    } catch {
      Alert.alert('Error', 'Could not retrieve location. Please enter manually.');
    } finally {
      setLocating(false);
    }
  }

  function handleNext() {
    if (!validate()) return;
    setDraft({
      city: city.trim(),
      address: address.trim() || null,
      zip_code: zipCode.trim() || null,
      address_disclosure_level: disclosureLevel,
    });
    router.push('/listings/create/step-3');
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="px-4 pt-14 pb-4 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mb-2">
          <Text className="text-blue-600 text-sm">Back</Text>
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-gray-900">Location</Text>
        <Text className="text-sm text-gray-500 mt-1">Step 2 of 5 — Location</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        {/* Use current location */}
        <TouchableOpacity
          onPress={handleUseLocation}
          disabled={locating}
          className="flex-row items-center justify-center border border-blue-600 rounded-xl py-3 mb-5"
          accessibilityRole="button"
        >
          {locating ? (
            <ActivityIndicator size="small" color="#2563eb" />
          ) : (
            <>
              <Text className="text-base mr-2">📍</Text>
              <Text className="text-blue-600 font-medium">Use my current location</Text>
            </>
          )}
        </TouchableOpacity>

        {/* City */}
        <Text className="text-base font-semibold text-gray-800 mb-1">
          City <Text className="text-red-500">*</Text>
        </Text>
        <TextInput
          value={city}
          onChangeText={setCity}
          placeholder="e.g. Tunis"
          placeholderTextColor="#9CA3AF"
          className={`border rounded-xl px-4 py-3 text-base text-gray-900 bg-white mb-1 ${
            errors.city ? 'border-red-500' : 'border-gray-300'
          }`}
          accessibilityLabel="City"
        />
        {errors.city ? (
          <Text className="text-red-500 text-xs mb-4">{errors.city}</Text>
        ) : (
          <View className="mb-4" />
        )}

        {/* Address */}
        <Text className="text-base font-semibold text-gray-800 mb-1">
          Address <Text className="text-red-500">*</Text>
        </Text>
        <TextInput
          value={address}
          onChangeText={setAddress}
          placeholder="e.g. 12 Rue de la Paix"
          placeholderTextColor="#9CA3AF"
          className={`border rounded-xl px-4 py-3 text-base text-gray-900 bg-white mb-1 ${
            errors.address ? 'border-red-500' : 'border-gray-300'
          }`}
          accessibilityLabel="Address"
        />
        {errors.address ? (
          <Text className="text-red-500 text-xs mb-4">{errors.address}</Text>
        ) : (
          <View className="mb-4" />
        )}

        {/* Zip Code */}
        <Text className="text-base font-semibold text-gray-800 mb-1">Zip Code</Text>
        <TextInput
          value={zipCode}
          onChangeText={setZipCode}
          placeholder="e.g. 1000"
          placeholderTextColor="#9CA3AF"
          keyboardType="numeric"
          className="border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900 bg-white mb-5"
          accessibilityLabel="Zip code"
        />

        {/* Address Disclosure Level */}
        <Text className="text-base font-semibold text-gray-800 mb-2">
          Address Visibility
        </Text>
        {DISCLOSURE_LEVELS.map((dl) => (
          <TouchableOpacity
            key={dl.value}
            onPress={() => setDisclosureLevel(dl.value)}
            className={`flex-row items-center px-4 py-3 rounded-xl border mb-2 ${
              disclosureLevel === dl.value
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 bg-white'
            }`}
            accessibilityRole="radio"
            accessibilityState={{ checked: disclosureLevel === dl.value }}
          >
            <View
              className={`w-5 h-5 rounded-full border-2 mr-3 items-center justify-center ${
                disclosureLevel === dl.value ? 'border-blue-600' : 'border-gray-400'
              }`}
            >
              {disclosureLevel === dl.value && (
                <View className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              )}
            </View>
            <Text className="text-sm text-gray-800 flex-1">{dl.label}</Text>
          </TouchableOpacity>
        ))}

        <View className="h-32" />
      </ScrollView>

      {/* Footer */}
      <View className="px-4 pb-8 pt-3 border-t border-gray-100 bg-white">
        <Button onPress={handleNext} size="lg">
          Next: Property Details
        </Button>
      </View>
    </View>
  );
}
